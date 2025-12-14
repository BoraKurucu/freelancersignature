const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

// Simple rate limiting (in-memory, for production use Redis or similar)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute

/**
 * Get client IP address from request
 */
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
         req.headers['x-real-ip'] || 
         req.connection?.remoteAddress || 
         'unknown';
}

/**
 * Check rate limit
 */
function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  record.count++;
  return true;
}

/**
 * Clean up old rate limit entries
 */
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes

/**
 * Validate email format
 */
function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Sanitize string input
 */
function sanitizeString(input) {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, 500);
}

/**
 * Update subscription manually via HTTP call
 * Usage: POST to /updateSubscription with { email, subscriptionId, saleId }
 */
exports.updateSubscription = functions.https.onRequest(async (req, res) => {
  // Enable CORS (restrict to your domain in production)
  const allowedOrigins = [
    'https://freelancersignature.com',
    'https://www.freelancersignature.com',
    'http://localhost:3000' // For development
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
  }
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Access-Control-Max-Age', '3600');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // Rate limiting
  const clientIP = getClientIP(req);
  if (!checkRateLimit(clientIP)) {
    return res.status(429).json({ 
      success: false, 
      error: 'Too many requests. Please try again later.' 
    });
  }

  try {
    const { email, subscriptionId, saleId, status = 'premium' } = req.body;

    // Validate input
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email address' });
    }

    // Sanitize inputs
    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedStatus = ['premium', 'free'].includes(status) ? status : 'premium';
    const sanitizedSubscriptionId = subscriptionId ? sanitizeString(subscriptionId) : null;
    const sanitizedSaleId = saleId ? sanitizeString(saleId) : null;

    console.log('Updating subscription for:', sanitizedEmail);

    // Find user by email
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', sanitizedEmail).get();

    if (snapshot.empty) {
      console.log('User not found:', sanitizedEmail);
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Calculate expiry date (1 month from now for monthly subscriptions)
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);

    const updates = {
      subscriptionStatus: sanitizedStatus,
      planType: sanitizedStatus === 'premium' ? 'premium' : null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      gumroadProductId: 'pddxf',
      subscriptionExpiry: expiryDate,
    };

    if (sanitizedSubscriptionId) {
      updates.gumroadSubscriptionId = sanitizedSubscriptionId;
    }
    if (sanitizedSaleId) {
      updates.gumroadPurchaseId = sanitizedSaleId;
    }
    if (sanitizedStatus === 'premium') {
      updates.subscriptionStartedAt = admin.firestore.FieldValue.serverTimestamp();
    }

    // Update all matching users (should only be one)
    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.update(doc.ref, updates);
    });
    await batch.commit();

    console.log('Subscription updated successfully:', sanitizedEmail, sanitizedStatus);
    return res.status(200).json({ 
      success: true, 
      message: 'Subscription updated',
      email: sanitizedEmail,
      status: sanitizedStatus,
      expiryDate: expiryDate.toISOString()
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Webhook endpoint that receives Gumroad webhooks
 * This runs in freelancersignature project, so it has permissions
 */
exports.gumroadWebhook = functions.https.onRequest(async (req, res) => {
  // Webhook should only accept POST from Gumroad
  // Note: In production, verify Gumroad webhook signature
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // Rate limiting for webhooks (more lenient)
  const clientIP = getClientIP(req);
  if (!checkRateLimit(clientIP + '_webhook')) {
    console.warn('Rate limit exceeded for webhook from:', clientIP);
    return res.status(429).send('Too many requests');
  }

  try {
    const webhookData = req.body;
    
    // Basic validation
    if (!webhookData || typeof webhookData !== 'object') {
      console.error('Invalid webhook payload');
      return res.status(400).send('Invalid payload');
    }

    console.log('Received Gumroad webhook:', JSON.stringify(webhookData, null, 2));

    const email = webhookData.email || webhookData.sale?.email;
    if (!email || !isValidEmail(email)) {
      console.error('Invalid or missing email in webhook payload');
      return res.status(400).send('Invalid or missing email');
    }
    
    const sanitizedEmail = email.toLowerCase().trim();

    // Extract and validate product ID
    const productId = webhookData.short_product_id || webhookData.permalink;
    console.log('Product ID:', productId);

    // Only process freelancersignature product
    if (productId !== 'pddxf') {
      console.log('Ignoring webhook for product:', productId);
      return res.status(200).send('OK - Product not handled');
    }

    // Sanitize webhook data
    const subscriptionId = webhookData.subscription_id ? sanitizeString(webhookData.subscription_id) : null;
    const saleId = webhookData.sale_id ? sanitizeString(webhookData.sale_id) : null;
    const refunded = webhookData.refunded === 'true' || webhookData.refunded === true;
    const eventType = sanitizeString(webhookData.event_type || 'sale');
    
    // Validate event type
    const validEventTypes = ['sale', 'subscription_activated', 'subscription_cancelled', 'subscription_ended'];
    if (!validEventTypes.includes(eventType)) {
      console.warn('Invalid event type:', eventType);
      return res.status(400).send('Invalid event type');
    }

    // Find user by email
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', sanitizedEmail).get();

    if (snapshot.empty) {
      console.warn('User not found:', sanitizedEmail);
      return res.status(200).send('OK - User not found (will be created on next login)');
    }

    const updates = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      gumroadProductId: 'pddxf',
    };

    // Handle different event types
    if (refunded || eventType === 'subscription_ended') {
      updates.subscriptionStatus = 'free';
      updates.planType = null;
      updates.subscriptionExpiry = null;
      if (refunded) {
        updates.subscriptionEndedAt = admin.firestore.FieldValue.serverTimestamp();
      }
    } else if (eventType === 'sale' || eventType === 'subscription_activated') {
      updates.subscriptionStatus = 'premium';
      updates.planType = 'premium';
      if (subscriptionId) {
        updates.gumroadSubscriptionId = subscriptionId;
      }
      if (saleId) {
        updates.gumroadPurchaseId = saleId;
      }
      updates.subscriptionStartedAt = admin.firestore.FieldValue.serverTimestamp();
      
      // Calculate expiry date (monthly subscription)
      if (subscriptionId) {
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        updates.subscriptionExpiry = expiryDate;
      }
    } else if (eventType === 'subscription_cancelled') {
      updates.subscriptionStatus = 'premium';
      updates.gumroadSubscriptionCancelled = true;
      updates.subscriptionCancelledAt = admin.firestore.FieldValue.serverTimestamp();
    }

    // Update all matching users
    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.update(doc.ref, updates);
    });
    await batch.commit();

    console.log('Subscription updated via webhook:', sanitizedEmail, updates.subscriptionStatus);
    return res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).send('Internal Server Error');
  }
});


