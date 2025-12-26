const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const { generateHTMLSignature } = require('./signatureGenerator');

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
 * Check if user is premium (server-side validation)
 */
async function isUserPremium(userId) {
  if (!userId) return false;
  
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) return false;
    
    const userData = userDoc.data();
    
    // Check if subscription has not expired
    if (userData.subscriptionExpiry) {
      const expiryDate = userData.subscriptionExpiry.toDate 
        ? userData.subscriptionExpiry.toDate() 
        : new Date(userData.subscriptionExpiry);
      const now = new Date();
      if (expiryDate > now) {
        return true;
      }
    }
    
    // Legacy fallback
    const isPremium = userData.subscriptionStatus === 'premium' && 
                      userData.planType === 'premium';
    
    return isPremium;
  } catch (error) {
    console.error('Error checking premium status:', error);
    return false;
  }
}

/**
 * Verify Firebase ID token
 */
async function verifyAuth(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
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
exports.validateSignatureCreate = functions.firestore.document('signatures/{signatureId}')
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
 * Handle referral records when a new user is created
 * Reward logic moved to client-side for immediate feedback and local testing
 */
exports.onUserCreate = functions.firestore.document('users/{userId}')
  .onCreate(async (snap, context) => {
    const userData = snap.data();
    const referredBy = userData.referredBy;
    const userId = context.params.userId;

    if (!referredBy || referredBy === userId) {
      return null;
    }

    console.log(`👤 New user ${userId} referred by ${referredBy} record created.`);
    return null;
  });

/**
 * Server-side endpoint to get signature HTML code
 * SECURITY: Validates premium status server-side before returning HTML
 */
exports.getSignatureHTML = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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
    return res.status(429).json({ error: 'Too many requests' });
  }

  try {
    // Verify authentication
    const decodedToken = await verifyAuth(req);
    if (!decodedToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { signatureId } = req.body;
    if (!signatureId || typeof signatureId !== 'string') {
      return res.status(400).json({ error: 'Invalid signatureId' });
    }

    // Get signature from Firestore
    const signatureDoc = await db.collection('signatures').doc(signatureId).get();
    if (!signatureDoc.exists) {
      return res.status(404).json({ error: 'Signature not found' });
    }

    const signatureData = signatureDoc.data();
    
    // Verify signature belongs to user
    if (signatureData.userId !== decodedToken.uid) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Check premium status server-side
    const isPremium = await isUserPremium(decodedToken.uid);
    const showWatermark = !isPremium;

    // Generate HTML server-side with watermark control
    const htmlContent = generateHTMLSignature(signatureData, { showWatermark });

    return res.status(200).json({
      success: true,
      html: htmlContent,
      showWatermark: showWatermark,
      isPremium: isPremium
    });

  } catch (error) {
    console.error('Error getting signature HTML:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Server-side endpoint to get signature HTML from data (for unsaved signatures)
 * SECURITY: Validates premium status server-side
 */
exports.getSignatureHTMLFromData = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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
    return res.status(429).json({ error: 'Too many requests' });
  }

  try {
    // Verify authentication
    const decodedToken = await verifyAuth(req);
    if (!decodedToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { signatureData } = req.body;
    if (!signatureData || typeof signatureData !== 'object') {
      return res.status(400).json({ error: 'Invalid signatureData' });
    }

    // Check premium status server-side
    const isPremium = await isUserPremium(decodedToken.uid);
    const showWatermark = !isPremium;

    // Generate HTML server-side with watermark control
    const htmlContent = generateHTMLSignature(signatureData, { showWatermark });

    return res.status(200).json({
      success: true,
      html: htmlContent,
      showWatermark: showWatermark,
      isPremium: isPremium
    });

  } catch (error) {
    console.error('Error getting signature HTML from data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Server-side endpoint to get signature HTML for download
 * SECURITY: Validates premium status server-side, always includes watermark for free users
 */
exports.getSignatureHTMLForDownload = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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
    return res.status(429).json({ error: 'Too many requests' });
  }

  try {
    // Verify authentication
    const decodedToken = await verifyAuth(req);
    if (!decodedToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { signatureId } = req.body;
    if (!signatureId || typeof signatureId !== 'string') {
      return res.status(400).json({ error: 'Invalid signatureId' });
    }

    // Get signature from Firestore
    const signatureDoc = await db.collection('signatures').doc(signatureId).get();
    if (!signatureDoc.exists) {
      return res.status(404).json({ error: 'Signature not found' });
    }

    const signatureData = signatureDoc.data();
    
    // Verify signature belongs to user
    if (signatureData.userId !== decodedToken.uid) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Check premium status server-side
    const isPremium = await isUserPremium(decodedToken.uid);
    const showWatermark = !isPremium; // Server-side enforces watermark for free users

    // Generate HTML server-side with watermark control
    const htmlContent = generateHTMLSignature(signatureData, { showWatermark });

    return res.status(200).json({
      success: true,
      html: htmlContent,
      showWatermark: showWatermark,
      isPremium: isPremium
    });

  } catch (error) {
    console.error('Error getting signature HTML for download:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * NOTE: This webhook is NOT USED anymore.
 * All Gumroad webhooks are handled by the gamerlinks project webhook:
 * https://us-central1-gamerlinks-844c5.cloudfunctions.net/gumroadWebhook
 * 
 * This function is kept for backward compatibility but will not be called.
 * If you want to remove it, uncomment the code below and deploy.
 */
// exports.gumroadWebhook = functions.https.onRequest(async (req, res) => {
//   res.status(200).json({ 
//     message: 'This webhook is deprecated. Use gamerlinks webhook instead.',
//     redirect: 'https://us-central1-gamerlinks-844c5.cloudfunctions.net/gumroadWebhook'
//   });
// });

/**
 * Manual premium update endpoint (for testing/fixing)
 * Usage: POST to /updatePremium with { userId: "documentId" } or { email: "email@example.com" }
 */
exports.updatePremium = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { userId, email } = req.body;
    
    if (!userId && !email) {
      return res.status(400).send('Missing userId or email');
    }

    let userRef;
    let userData;
    if (userId) {
      userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        return res.status(404).send('User not found');
      }
      userData = userDoc.data();
    } else {
      const sanitizedEmail = email.toLowerCase().trim();
      const snapshot = await db.collection('users').where('email', '==', sanitizedEmail).get();
      if (snapshot.empty) {
        return res.status(404).send('User not found');
      }
      userRef = snapshot.docs[0].ref;
      userData = snapshot.docs[0].data();
    }

    let currentExpiry = userData.subscriptionExpiry 
      ? (userData.subscriptionExpiry.toDate ? userData.subscriptionExpiry.toDate() : new Date(userData.subscriptionExpiry))
      : new Date();
      
    const now = new Date();
    // If current premium is expired, start from now
    const baseDate = (currentExpiry && currentExpiry > now) ? currentExpiry : now;
    
    const expiryDate = new Date(baseDate);
    expiryDate.setDate(expiryDate.getDate() + 30);

    const updates = {
      subscriptionStatus: 'premium',
      planType: 'premium',
      gumroadProductId: 'pddxf',
      subscriptionStartedAt: admin.firestore.FieldValue.serverTimestamp(),
      subscriptionExpiry: expiryDate,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await userRef.update(updates);

    console.log('✅ Premium updated manually:', userId || email);
    return res.status(200).json({ success: true, message: 'Premium status updated' });
  } catch (error) {
    console.error('Update premium error:', error);
    return res.status(500).send('Internal Server Error');
  }
});
