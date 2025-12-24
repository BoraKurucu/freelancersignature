# Gumroad Webhook Setup Guide

This guide explains how to set up Gumroad webhooks to automatically update user subscription status in your Firebase database.

## Overview

When a user purchases or cancels a premium subscription on Gumroad, Gumroad will send a webhook to your server. Your server then updates the user's subscription status in Firestore.

## Webhook Events

Gumroad will send webhooks for these events:
- `sale` - When a new purchase is made
- `subscription_activated` - When a subscription becomes active
- `subscription_cancelled` - When a user cancels their subscription
- `subscription_ended` - When a subscription expires

## Option 1: Firebase Cloud Functions (Recommended)

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### Step 2: Initialize Cloud Functions

```bash
cd /Users/mehmetborakurucu/Desktop/freelancersignature
firebase init functions
```

Select:
- JavaScript
- Install dependencies with npm

### Step 3: Create Webhook Function

Create `functions/index.js`:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');

admin.initializeApp();

// Your Gumroad webhook secret (get from Gumroad Settings → Advanced → API)
const GUMROAD_WEBHOOK_SECRET = functions.config().gumroad.webhook_secret;

// Verify Gumroad webhook signature
function verifyGumroadWebhook(body, signature) {
  if (!GUMROAD_WEBHOOK_SECRET) {
    console.warn('Gumroad webhook secret not configured');
    return true; // Allow in development
  }
  
  const hmac = crypto.createHmac('sha256', GUMROAD_WEBHOOK_SECRET);
  hmac.update(JSON.stringify(body));
  const calculatedSignature = hmac.digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(calculatedSignature)
  );
}

// Update user subscription status in Firestore
async function updateUserSubscription(email, status, subscriptionData = {}) {
  try {
    // Find user by email
    const usersRef = admin.firestore().collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();
    
    if (snapshot.empty) {
      console.log(`User not found for email: ${email}`);
      return { success: false, error: 'User not found' };
    }
    
    const updates = {
      subscriptionStatus: status,
      planType: 'premium',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      ...subscriptionData
    };
    
    // Update all matching users (should only be one)
    const batch = admin.firestore().batch();
    snapshot.forEach(doc => {
      batch.update(doc.ref, updates);
    });
    await batch.commit();
    
    console.log(`Updated subscription for ${email}: ${status}`);
    return { success: true };
  } catch (error) {
    console.error('Error updating subscription:', error);
    return { success: false, error: error.message };
  }
}

// Gumroad webhook handler
exports.gumroadWebhook = functions.https.onRequest(async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }
  
  try {
    const event = req.body;
    const signature = req.headers['x-gumroad-signature'] || '';
    
    // Verify webhook signature (optional but recommended)
    // if (!verifyGumroadWebhook(req.body, signature)) {
    //   return res.status(401).send('Invalid signature');
    // }
    
    console.log('Received Gumroad webhook:', event.event_type);
    
    const email = event.email || event.sale?.email;
    if (!email) {
      console.error('No email in webhook payload');
      return res.status(400).send('Missing email');
    }
    
    // Handle different event types
    switch (event.event_type) {
      case 'sale':
      case 'subscription_activated':
        // User purchased or subscription activated
        const expiryDate = event.subscription_ended_at 
          ? new Date(event.subscription_ended_at * 1000)
          : null;
        
        await updateUserSubscription(email, 'premium', {
          subscriptionExpiry: expiryDate,
          gumroadPurchaseId: event.sale_id || event.sale?.id,
          gumroadSubscriptionId: event.subscription_id,
          subscriptionStartedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        break;
        
      case 'subscription_cancelled':
        // User cancelled but still has access until expiry
        // Don't change status yet - wait for subscription_ended
        await updateUserSubscription(email, 'premium', {
          subscriptionCancelledAt: admin.firestore.FieldValue.serverTimestamp(),
          gumroadSubscriptionCancelled: true
        });
        break;
        
      case 'subscription_ended':
        // Subscription expired - downgrade to free
        await updateUserSubscription(email, 'free', {
          planType: null,
          subscriptionExpiry: null,
          subscriptionEndedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        break;
        
      default:
        console.log(`Unhandled event type: ${event.event_type}`);
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Internal Server Error');
  }
});
```

### Step 4: Install Dependencies

```bash
cd functions
npm install firebase-functions firebase-admin
```

### Step 5: Set Webhook Secret (Optional)

```bash
firebase functions:config:set gumroad.webhook_secret="your-webhook-secret-from-gumroad"
```

### Step 6: Deploy Function

```bash
firebase deploy --only functions
```

After deployment, you'll get a URL like:
```
https://us-central1-your-project.cloudfunctions.net/gumroadWebhook
```

### Step 7: Configure Gumroad Webhook

1. Go to Gumroad → Settings → Integrations → Webhooks
2. Add webhook URL: `https://us-central1-your-project.cloudfunctions.net/gumroadWebhook`
3. Select events: `sale`, `subscription_activated`, `subscription_cancelled`, `subscription_ended`
4. Save

## Option 2: Simple Express Server (Alternative)

If you prefer not to use Firebase Cloud Functions, you can set up a simple Express server:

### Create `webhook-server.js`:

```javascript
const express = require('express');
const admin = require('firebase-admin');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// Initialize Firebase Admin
const serviceAccount = require('./path-to-service-account-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const GUMROAD_WEBHOOK_SECRET = process.env.GUMROAD_WEBHOOK_SECRET;

async function updateUserSubscription(email, status, subscriptionData = {}) {
  try {
    const usersRef = admin.firestore().collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();
    
    if (snapshot.empty) {
      return { success: false, error: 'User not found' };
    }
    
    const updates = {
      subscriptionStatus: status,
      planType: status === 'premium' ? 'premium' : null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      ...subscriptionData
    };
    
    const batch = admin.firestore().batch();
    snapshot.forEach(doc => {
      batch.update(doc.ref, updates);
    });
    await batch.commit();
    
    return { success: true };
  } catch (error) {
    console.error('Error updating subscription:', error);
    return { success: false, error: error.message };
  }
}

app.post('/gumroad-webhook', async (req, res) => {
  try {
    const event = req.body;
    const email = event.email || event.sale?.email;
    
    if (!email) {
      return res.status(400).send('Missing email');
    }
    
    switch (event.event_type) {
      case 'sale':
      case 'subscription_activated':
        await updateUserSubscription(email, 'premium', {
          subscriptionExpiry: event.subscription_ended_at 
            ? new Date(event.subscription_ended_at * 1000)
            : null,
          gumroadPurchaseId: event.sale_id || event.sale?.id
        });
        break;
        
      case 'subscription_ended':
        await updateUserSubscription(email, 'free', {
          subscriptionExpiry: null
        });
        break;
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Error');
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Webhook server running on port ${PORT}`);
});
```

Deploy this to a service like:
- Heroku
- Railway
- Render
- DigitalOcean App Platform

## Testing Webhooks

### Using Gumroad Test Mode

1. Enable test mode in Gumroad
2. Make a test purchase
3. Check your webhook logs to see if it received the event
4. Verify the user's subscription status in Firestore

### Manual Testing with curl

```bash
curl -X POST https://your-webhook-url.com/gumroad-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "sale",
    "email": "test@example.com",
    "sale_id": "test123",
    "subscription_id": "sub_test123"
  }'
```

## Security Considerations

1. **Verify Webhook Signatures**: Always verify Gumroad webhook signatures to prevent fake requests
2. **HTTPS Only**: Only accept webhooks over HTTPS
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **Logging**: Log all webhook events for debugging

## Troubleshooting

- **Webhook not received**: Check Gumroad webhook settings, verify URL is accessible
- **User not found**: Ensure user has signed up with the same email used in Gumroad purchase
- **Status not updating**: Check Firestore security rules allow updates
- **Function timeout**: Increase timeout in Cloud Functions if processing takes time

## Next Steps

After setting up webhooks:
1. Test with a real purchase
2. Monitor webhook logs
3. Set up alerts for failed webhooks
4. Consider adding retry logic for failed updates





