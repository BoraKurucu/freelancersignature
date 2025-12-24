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
 * DISABLED - This endpoint was a security vulnerability
 * Subscription updates should ONLY happen via Gumroad webhook
 * 
 * If you need to manually update a subscription, use Firebase Admin SDK directly
 * or the Firebase Console, not an unauthenticated HTTP endpoint.
 */
// exports.updateSubscription - REMOVED FOR SECURITY

/**
 * Validate signature creation - enforces limits server-side
 * This is triggered when a new signature is created
 */
exports.validateSignatureCreate = functions.firestore
  .document('signatures/{signatureId}')
  .onCreate(async (snap, context) => {
    const signatureData = snap.data();
    const userId = signatureData.userId;
    
    if (!userId) {
      console.error('Signature created without userId - deleting');
      await snap.ref.delete();
      return;
    }
    
    try {
      // Get user's subscription status
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        console.error('User not found for signature - deleting signature');
        await snap.ref.delete();
        return;
      }
      
      const userData = userDoc.data();
      const isPremium = userData.subscriptionStatus === 'premium' && userData.planType === 'premium';
      const maxSignatures = isPremium ? 10 : 2;
      
      // Count existing signatures for this user
      const signaturesSnapshot = await db.collection('signatures')
        .where('userId', '==', userId)
        .get();
      
      const signatureCount = signaturesSnapshot.size;
      
      // If over limit, delete the newly created signature
      if (signatureCount > maxSignatures) {
        console.warn(`User ${userId} exceeded signature limit (${signatureCount}/${maxSignatures}) - deleting excess signature`);
        await snap.ref.delete();
        return;
      }
      
      console.log(`Signature created for user ${userId} (${signatureCount}/${maxSignatures})`);
    } catch (error) {
      console.error('Error validating signature creation:', error);
      // Don't delete on error - let the signature exist but log the issue
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




