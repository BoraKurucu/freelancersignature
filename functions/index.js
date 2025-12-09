const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

/**
 * Update subscription manually via HTTP call
 * Usage: POST to /updateSubscription with { email, subscriptionId, saleId }
 */
exports.updateSubscription = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { email, subscriptionId, saleId, status = 'premium' } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Missing email' });
    }

    console.log('Updating subscription for:', email);

    // Find user by email
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();

    if (snapshot.empty) {
      console.log('User not found:', email);
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Calculate expiry date (1 month from now for monthly subscriptions)
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);

    const updates = {
      subscriptionStatus: status,
      planType: status === 'premium' ? 'premium' : null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      gumroadProductId: 'pddxf',
      subscriptionExpiry: expiryDate,
    };

    if (subscriptionId) {
      updates.gumroadSubscriptionId = subscriptionId;
    }
    if (saleId) {
      updates.gumroadPurchaseId = saleId;
    }
    if (status === 'premium') {
      updates.subscriptionStartedAt = admin.firestore.FieldValue.serverTimestamp();
    }

    // Update all matching users (should only be one)
    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.update(doc.ref, updates);
    });
    await batch.commit();

    console.log('Subscription updated successfully:', email, status);
    return res.status(200).json({ 
      success: true, 
      message: 'Subscription updated',
      email,
      status,
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
  // Enable CORS
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
    const webhookData = req.body;
    console.log('Received Gumroad webhook:', JSON.stringify(webhookData, null, 2));

    const email = webhookData.email || webhookData.sale?.email;
    if (!email) {
      console.error('No email in webhook payload');
      return res.status(400).send('Missing email');
    }

    // Extract product ID
    const productId = webhookData.short_product_id || webhookData.permalink;
    console.log('Product ID:', productId);

    // Only process freelancersignature product
    if (productId !== 'pddxf') {
      console.log('Ignoring webhook for product:', productId);
      return res.status(200).send('OK - Product not handled');
    }

    const subscriptionId = webhookData.subscription_id;
    const saleId = webhookData.sale_id;
    const refunded = webhookData.refunded === 'true' || webhookData.refunded === true;
    const eventType = webhookData.event_type || 'sale';

    // Find user by email
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();

    if (snapshot.empty) {
      console.warn('User not found:', email);
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

    console.log('Subscription updated via webhook:', email, updates.subscriptionStatus);
    return res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).send('Internal Server Error');
  }
});

