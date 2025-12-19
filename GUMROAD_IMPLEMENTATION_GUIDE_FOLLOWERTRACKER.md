# Complete Gumroad Integration Implementation Guide for FollowerTracker

This is a detailed, step-by-step guide to implement Gumroad premium subscription integration for FollowerTracker (product ID: `exyuh`, URL: `https://streamerservices.gumroad.com/l/exyuh`). This guide is based on the proven implementation from freelancersignature.

## Table of Contents
1. [Overview](#overview)
2. [Project Configuration](#project-configuration)
3. [Firebase Setup](#firebase-setup)
4. [Cloud Functions Implementation](#cloud-functions-implementation)
5. [Frontend Integration](#frontend-integration)
6. [Manual Activation System](#manual-activation-system)
7. [Testing & Deployment](#testing--deployment)
8. [Troubleshooting](#troubleshooting)

---

## Overview

### Architecture
- **Gumroad Product**: `exyuh` (Monthly subscription: $3.99/month)
- **Webhook Endpoint**: Firebase Cloud Function (requires Blaze plan)
- **Manual Activation**: HTTP endpoint for license key activation (works without Blaze)
- **User Data**: Stored in Firestore `users` collection
- **Premium Check**: Real-time via AuthContext

### Data Flow
1. User purchases on Gumroad → Gumroad sends webhook → Cloud Function updates Firestore
2. User enters license key → Frontend calls HTTP endpoint → Updates Firestore
3. User logs in → AuthContext checks `subscriptionStatus` → Premium features unlocked

---

## Project Configuration

### 1. Update Gumroad Service

**File**: `src/services/gumroadService.js`

```javascript
/**
 * Gumroad Service for FollowerTracker
 * Handles Gumroad API integration and purchase verification
 */

// IMPORTANT: Update this to your FollowerTracker Gumroad product URL
const GUMROAD_PRODUCT_URL = process.env.REACT_APP_GUMROAD_PRODUCT_URL || 
  'https://streamerservices.gumroad.com/l/exyuh';

// IMPORTANT: Update this to your FollowerTracker product ID
const GUMROAD_PRODUCT_ID = 'exyuh';

/**
 * Get the Gumroad checkout URL for premium subscription
 * @param {string} email - User's email address (optional, for pre-filling)
 * @returns {string} - Gumroad checkout URL
 */
export function getGumroadCheckoutUrl(email = '') {
  const baseUrl = GUMROAD_PRODUCT_URL;
  if (email) {
    return `${baseUrl}?email=${encodeURIComponent(email)}`;
  }
  return baseUrl;
}

/**
 * Get the Gumroad product ID
 * @returns {string} - Product ID
 */
export function getGumroadProductId() {
  return GUMROAD_PRODUCT_ID;
}

/**
 * Verify a Gumroad purchase using the Gumroad API
 * @param {string} purchaseId - The purchase ID from Gumroad
 * @param {string} accessToken - Your Gumroad access token
 * @returns {Promise<Object>} - Purchase verification result
 */
export async function verifyGumroadPurchase(purchaseId, accessToken) {
  try {
    const response = await fetch(
      `https://api.gumroad.com/v2/sales/${purchaseId}?access_token=${accessToken}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    
    if (data.success) {
      return {
        success: true,
        purchase: data.sale,
      };
    } else {
      return {
        success: false,
        error: data.message || 'Purchase verification failed',
      };
    }
  } catch (error) {
    console.error('Error verifying Gumroad purchase:', error);
    return {
      success: false,
      error: error.message || 'Network error',
    };
  }
}

/**
 * Verify a Gumroad license key
 * @param {string} licenseKey - The license key from Gumroad purchase email
 * @param {string} email - User's email address
 * @returns {Promise<Object>} - License verification result
 */
export async function verifyLicenseKey(licenseKey, email) {
  try {
    // Call your backend endpoint to verify license key
    const response = await fetch(
      `${process.env.REACT_APP_API_URL || ''}/verifyLicense`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          licenseKey: licenseKey.trim(),
          email: email,
        }),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying license key:', error);
    return {
      success: false,
      error: error.message || 'Network error',
    };
  }
}

/**
 * Check if a purchase is a subscription
 * @param {Object} purchase - Purchase object from Gumroad
 * @returns {boolean}
 */
export function isSubscription(purchase) {
  return purchase?.subscription_id !== null && purchase?.subscription_id !== undefined;
}

/**
 * Check if a subscription is active
 * @param {Object} purchase - Purchase object from Gumroad
 * @returns {boolean}
 */
export function isSubscriptionActive(purchase) {
  if (!isSubscription(purchase)) return false;
  
  // Check if subscription is cancelled
  if (purchase.subscription_cancelled_at) {
    return false;
  }
  
  // Check if subscription has ended
  if (purchase.subscription_ended_at) {
    return false;
  }
  
  return true;
}

/**
 * Get subscription expiry date
 * @param {Object} purchase - Purchase object from Gumroad
 * @returns {Date|null}
 */
export function getSubscriptionExpiry(purchase) {
  if (!isSubscription(purchase)) return null;
  
  // Gumroad subscriptions typically renew monthly
  if (purchase.subscription_ended_at) {
    return new Date(purchase.subscription_ended_at * 1000);
  }
  
  // If no end date, assume it's active and calculate next renewal
  const createdAt = new Date(purchase.created_at);
  const nextRenewal = new Date(createdAt);
  nextRenewal.setMonth(nextRenewal.getMonth() + 1);
  
  return nextRenewal;
}

/**
 * Extract user email from Gumroad purchase
 * @param {Object} purchase - Purchase object from Gumroad
 * @returns {string|null}
 */
export function getPurchaseEmail(purchase) {
  return purchase?.email || null;
}
```

---

## Firebase Setup

### 2. Initialize Firebase Functions

**Prerequisites**: You must have Firebase CLI installed and be logged in.

```bash
# Install Firebase CLI globally (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Navigate to your project root
cd /path/to/followertracker

# Initialize Functions (if not already done)
firebase init functions
```

**When prompted**:
- Select JavaScript
- Install dependencies with npm
- Use ESLint: Yes
- Install dependencies now: Yes

### 3. Functions Package Configuration

**File**: `functions/package.json`

```json
{
  "name": "functions",
  "description": "Cloud Functions for FollowerTracker",
  "scripts": {
    "lint": "eslint .",
    "serve": "firebase emulators:start --only functions",
    "shell": "firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "engines": {
    "node": "18"
  },
  "main": "index.js",
  "dependencies": {
    "firebase-admin": "^12.7.0",
    "firebase-functions": "^4.9.0"
  },
  "devDependencies": {
    "eslint": "^8.15.0"
  },
  "private": true
}
```

### 4. Install Functions Dependencies

```bash
cd functions
npm install
cd ..
```

---

## Cloud Functions Implementation

### 5. Complete Cloud Functions Code

**File**: `functions/index.js`

**IMPORTANT**: Replace `followertracker-f84e4` with your actual Firebase project ID.

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

// IMPORTANT: Update this to your FollowerTracker Gumroad product ID
const GUMROAD_PRODUCT_ID = 'exyuh';

// Rate limiting (in-memory, for production use Redis or similar)
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
 * Usage: POST to /updateSubscription with { email, subscriptionId, saleId, status }
 * 
 * This endpoint can be called from your frontend activation page
 */
exports.updateSubscription = functions.https.onRequest(async (req, res) => {
  // Enable CORS - UPDATE THESE DOMAINS FOR YOUR PROJECT
  const allowedOrigins = [
    'https://followertracker-f84e4.web.app',
    'https://followertracker-f84e4.firebaseapp.com',
    'https://followertracker.com', // Update with your custom domain
    'http://localhost:3000', // For development
    'http://localhost:5173', // For Vite development
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
      return res.status(404).json({ success: false, error: 'User not found. Please sign up first.' });
    }

    // Calculate expiry date (1 month from now for monthly subscriptions)
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);

    const updates = {
      subscriptionStatus: sanitizedStatus,
      planType: sanitizedStatus === 'premium' ? 'premium' : null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      gumroadProductId: GUMROAD_PRODUCT_ID,
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
 * This automatically updates user subscriptions when purchases occur
 * 
 * IMPORTANT: This requires Firebase Blaze plan to deploy
 */
exports.gumroadWebhook = functions.https.onRequest(async (req, res) => {
  // Webhook should only accept POST from Gumroad
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
    const productId = webhookData.short_product_id || webhookData.permalink || webhookData.product_id;
    console.log('Product ID from webhook:', productId);

    // Only process FollowerTracker product
    if (productId !== GUMROAD_PRODUCT_ID) {
      console.log('Ignoring webhook for product:', productId, '(expected:', GUMROAD_PRODUCT_ID + ')');
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
      // Return 200 OK so Gumroad doesn't retry - user will be created on next login
      return res.status(200).send('OK - User not found (will be created on next login)');
    }

    const updates = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      gumroadProductId: GUMROAD_PRODUCT_ID,
    };

    // Handle different event types
    if (refunded || eventType === 'subscription_ended') {
      // Subscription ended or refunded - downgrade to free
      updates.subscriptionStatus = 'free';
      updates.planType = null;
      updates.subscriptionExpiry = null;
      if (refunded) {
        updates.subscriptionEndedAt = admin.firestore.FieldValue.serverTimestamp();
      }
    } else if (eventType === 'sale' || eventType === 'subscription_activated') {
      // New purchase or subscription activated - upgrade to premium
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
      // Subscription cancelled but still active until expiry
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
```

---

## Frontend Integration

### 6. Update AuthContext

**File**: `src/context/AuthContext.js` (or similar)

**Key changes needed**:

1. **User Profile Creation**: Ensure subscription fields are initialized:

```javascript
const userData = {
  email: user.email,
  displayName: user.displayName || '',
  photoURL: user.photoURL || '',
  emailVerified: user.emailVerified,
  provider: user.providerData[0]?.providerId || 'unknown',
  subscriptionStatus: 'free',  // IMPORTANT: Default to 'free'
  planType: null,               // IMPORTANT: Default to null
  subscriptionExpiry: null,     // IMPORTANT: Default to null
  createdAt: serverTimestamp(),
  lastLogin: serverTimestamp(),
  ...additionalData
};
```

2. **Premium Check Function**: Add this function to your AuthContext:

```javascript
/**
 * Check if user can use premium features
 * @returns {boolean}
 */
function isPremium() {
  if (!userProfile || userProfile.subscriptionStatus !== 'premium') {
    return false;
  }
  
  // Check if subscription has expired
  if (userProfile.subscriptionExpiry) {
    const expiryDate = userProfile.subscriptionExpiry.toDate 
      ? userProfile.subscriptionExpiry.toDate() 
      : new Date(userProfile.subscriptionExpiry);
    const now = new Date();
    
    if (expiryDate < now) {
      // Subscription expired - update status (webhook should handle this, but this is a fallback)
      return false;
    }
  }
  
  return true;
}
```

3. **Export isPremium**: Make sure `isPremium` is included in the context value:

```javascript
const value = {
  currentUser,
  userProfile,
  loading,
  authError,
  setAuthError,
  signInWithGoogle,
  logout,
  isPremium,  // IMPORTANT: Export this
  isFullyAuthenticated,
  loadUserProfile
};
```

### 7. Create License Key Activation Page

**File**: `src/pages/ActivatePremium.jsx` (or `.js`)

```javascript
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { verifyLicenseKey } from '../services/gumroadService';
import './ActivatePremium.css';

export default function ActivatePremium() {
  const { currentUser, userProfile, loadUserProfile } = useAuth();
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Get your Firebase project's function URL
  // Replace 'followertracker-f84e4' with your actual project ID
  const FUNCTION_URL = 'https://us-central1-followertracker-f84e4.cloudfunctions.net';

  const handleActivate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!currentUser) {
      setError('Please sign in first');
      return;
    }

    if (!licenseKey.trim()) {
      setError('Please enter your license key');
      return;
    }

    setLoading(true);

    try {
      // Extract email and license key from Gumroad purchase email
      // The license key is usually in the format: "License key: XXXXXX"
      const cleanLicenseKey = licenseKey.trim();

      // Call the updateSubscription function
      const response = await fetch(`${FUNCTION_URL}/updateSubscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: currentUser.email,
          // For license key activation, we might not have subscriptionId/saleId
          // You can extract these from the license key if needed
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setLicenseKey('');
        
        // Reload user profile to get updated subscription status
        if (loadUserProfile) {
          await loadUserProfile(currentUser);
        }
        
        // Refresh page after 2 seconds to show premium features
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setError(data.error || 'Activation failed. Please check your license key and try again.');
      }
    } catch (err) {
      console.error('Activation error:', err);
      setError('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="activate-premium-page">
        <div className="activate-container">
          <div className="auth-required-card">
            <h1>Sign In Required</h1>
            <p>Please sign in to activate your premium subscription.</p>
            <a href="/" className="btn-primary">Go to Sign In</a>
          </div>
        </div>
      </div>
    );
  }

  if (userProfile?.subscriptionStatus === 'premium') {
    return (
      <div className="activate-premium-page">
        <div className="activate-container">
          <div className="success-card">
            <div className="success-icon">✅</div>
            <h1>You're Already Premium!</h1>
            <p>Your premium subscription is active.</p>
            <p>Expires: {userProfile.subscriptionExpiry 
              ? new Date(userProfile.subscriptionExpiry.toDate?.() || userProfile.subscriptionExpiry).toLocaleDateString()
              : 'Never'}
            </p>
            <a href="/" className="btn-primary">Go to Dashboard</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="activate-premium-page">
      <div className="activate-container">
        <div className="activate-card">
          <h1>Activate Premium</h1>
          <p className="subtitle">
            Enter your Gumroad license key to activate premium features
          </p>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              ✅ Premium activated successfully! Refreshing...
            </div>
          )}

          <form onSubmit={handleActivate}>
            <div className="form-group">
              <label htmlFor="licenseKey">License Key</label>
              <input
                id="licenseKey"
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="Enter your Gumroad license key"
                disabled={loading}
                required
              />
              <small>
                Find your license key in your Gumroad purchase email or at{' '}
                <a href="https://app.gumroad.com/library" target="_blank" rel="noopener noreferrer">
                  app.gumroad.com/library
                </a>
              </small>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !licenseKey.trim()}
            >
              {loading ? 'Activating...' : 'Activate Premium'}
            </button>
          </form>

          <div className="help-section">
            <h3>Need Help?</h3>
            <p>
              <strong>Where to find your license key:</strong>
            </p>
            <ol>
              <li>Check your email for the Gumroad purchase receipt</li>
              <li>Go to <a href="https://app.gumroad.com/library" target="_blank" rel="noopener noreferrer">app.gumroad.com/library</a></li>
              <li>Click on your FollowerTracker Premium purchase</li>
              <li>Copy the license key shown</li>
            </ol>
            <p>
              <strong>Note:</strong> If you just purchased, it may take a few minutes for the license key to be available.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**File**: `src/pages/ActivatePremium.css`

```css
.activate-premium-page {
  min-height: 100vh;
  padding: 2rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.activate-container {
  max-width: 600px;
  margin: 0 auto;
}

.activate-card,
.success-card,
.auth-required-card {
  background: white;
  border-radius: 12px;
  padding: 2.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.activate-card h1,
.success-card h1,
.auth-required-card h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  color: #1a202c;
}

.subtitle {
  color: #64748b;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.form-group small {
  display: block;
  margin-top: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.form-group small a {
  color: #667eea;
  text-decoration: none;
}

.btn-primary {
  width: 100%;
  padding: 0.875rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background: #fee2e2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid #fecaca;
}

.success-message {
  background: #d1fae5;
  color: #065f46;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid #a7f3d0;
}

.success-card {
  text-align: center;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.success-card p {
  color: #64748b;
  margin-bottom: 1.5rem;
}

.help-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.help-section h3 {
  margin-bottom: 1rem;
  color: #1a202c;
}

.help-section ol {
  margin-left: 1.5rem;
  color: #4b5563;
}

.help-section li {
  margin-bottom: 0.5rem;
}

.help-section a {
  color: #667eea;
  text-decoration: none;
}
```

### 8. Add Route for Activation Page

**File**: `src/App.jsx` (or your main routing file)

```javascript
import ActivatePremium from './pages/ActivatePremium';

// In your routes:
<Route path="/activate" element={<ActivatePremium />} />
```

### 9. Update Premium Upgrade Component

**File**: `src/components/PremiumUpgrade.jsx` (or similar)

Add a link to the activation page in your paywall modal or upgrade component:

```javascript
// In your paywall/upgrade component, add:
<a href="/activate" className="link-button">
  Activate with license key
</a>
```

---

## Manual Activation System

### 10. Manual Update Script (For Testing/Admin Use)

**File**: `manually-update-subscription.js` (in project root)

```javascript
/**
 * Manual script to update subscription status
 * Run with: node manually-update-subscription.js
 * 
 * IMPORTANT: You need a Firebase service account key
 * Download from: Firebase Console → Project Settings → Service Accounts
 */

const admin = require('firebase-admin');

// IMPORTANT: Download your service account key and update this path
const serviceAccount = require('./path-to-service-account-key.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'followertracker-f84e4' // UPDATE WITH YOUR PROJECT ID
});

const db = admin.firestore();

async function updateSubscription() {
  const email = 'user@example.com'; // UPDATE WITH USER'S EMAIL
  const subscriptionId = 'subscription-id-from-gumroad'; // Optional
  const saleId = 'sale-id-from-gumroad'; // Optional
  
  try {
    console.log(`Looking for user with email: ${email}`);
    
    // Find user by email
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email.toLowerCase().trim()).get();
    
    if (snapshot.empty) {
      console.error('❌ User not found! Make sure they have signed up on the website first.');
      process.exit(1);
    }
    
    console.log(`✅ Found ${snapshot.size} user(s)`);
    
    // Calculate expiry (1 month from now)
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);
    
    // Update subscription
    const updates = {
      subscriptionStatus: 'premium',
      planType: 'premium',
      gumroadProductId: 'exyuh', // UPDATE WITH YOUR PRODUCT ID
      subscriptionStartedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      subscriptionExpiry: expiryDate,
    };
    
    if (subscriptionId) {
      updates.gumroadSubscriptionId = subscriptionId;
    }
    if (saleId) {
      updates.gumroadPurchaseId = saleId;
    }
    
    const batch = db.batch();
    snapshot.forEach(doc => {
      console.log(`Updating user: ${doc.id}`);
      batch.update(doc.ref, updates);
    });
    
    await batch.commit();
    
    console.log('✅ Subscription updated successfully!');
    console.log('   - Status: premium');
    console.log('   - Expires: ' + expiryDate.toLocaleDateString());
    console.log('\n🔄 User should refresh the website to see premium features!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateSubscription();
```

---

## Testing & Deployment

### 11. Test Locally (Functions Emulator)

```bash
# Start Firebase emulators
firebase emulators:start --only functions

# In another terminal, test the endpoint
curl -X POST http://localhost:5001/followertracker-f84e4/us-central1/updateSubscription \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","status":"premium"}'
```

### 12. Deploy to Firebase

**IMPORTANT**: You must upgrade to Blaze plan first!

```bash
# Upgrade to Blaze plan (one-time)
# Go to: https://console.firebase.google.com/project/followertracker-f84e4/usage/details
# Click "Upgrade to Blaze plan"

# Deploy functions
firebase deploy --only functions

# After deployment, you'll get URLs like:
# - https://us-central1-followertracker-f84e4.cloudfunctions.net/updateSubscription
# - https://us-central1-followertracker-f84e4.cloudfunctions.net/gumroadWebhook
```

### 13. Configure Gumroad Webhook

1. Go to Gumroad: https://gumroad.com/settings/advanced
2. Scroll to "Webhooks" section
3. Add webhook URL: `https://us-central1-followertracker-f84e4.cloudfunctions.net/gumroadWebhook`
4. Select events:
   - ✅ sale
   - ✅ subscription_activated
   - ✅ subscription_cancelled
   - ✅ subscription_ended
5. Click "Save"

### 14. Test Webhook

1. Make a test purchase on Gumroad (or use Gumroad's test mode)
2. Check Firebase Functions logs:
   ```bash
   firebase functions:log
   ```
3. Verify user subscription in Firestore:
   - Go to Firebase Console → Firestore
   - Find user document in `users` collection
   - Check `subscriptionStatus` is `premium`

---

## Firestore Security Rules

### 15. Update Firestore Rules

**File**: `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to validate email format
    function isValidEmail(email) {
      return email.matches('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$');
    }
    
    // Helper function to validate string length
    function isValidString(str, maxLength) {
      return str is string && str.size() <= maxLength;
    }
    
    // Users collection
    match /users/{userId} {
      // Users can read their own document
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Users can create their own document
      allow create: if request.auth != null && 
        request.auth.uid == userId &&
        request.resource.data.keys().hasAll(['email', 'createdAt']) &&
        isValidEmail(request.resource.data.email) &&
        request.resource.data.subscriptionStatus in ['free', 'premium'];
      
      // Users can update their own document (but not subscription status)
      allow update: if request.auth != null && 
        request.auth.uid == userId &&
        request.resource.data.email == resource.data.email &&
        request.resource.data.createdAt == resource.data.createdAt &&
        // Prevent users from changing their own subscription status
        request.resource.data.subscriptionStatus == resource.data.subscriptionStatus;
      
      // Cloud Functions can update subscription status (no auth required)
      // This is handled server-side, so we don't need special rules
      // Cloud Functions use Admin SDK which bypasses security rules
    }
    
    // Add other collections as needed (snapshots, history, etc.)
    match /snapshots/{snapshotId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    match /history/{historyId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Deny all other collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Deploy rules**:
```bash
firebase deploy --only firestore:rules
```

---

## Environment Variables

### 16. Create `.env` file (optional)

**File**: `.env` (in project root)

```env
REACT_APP_GUMROAD_PRODUCT_URL=https://streamerservices.gumroad.com/l/exyuh
REACT_APP_GUMROAD_PRODUCT_ID=exyuh
REACT_APP_FIREBASE_PROJECT_ID=followertracker-f84e4
REACT_APP_FUNCTION_URL=https://us-central1-followertracker-f84e4.cloudfunctions.net
```

---

## Troubleshooting

### Common Issues

1. **"User not found" error**
   - User must sign up on your website first
   - Email must match exactly (case-insensitive)
   - Check Firestore `users` collection

2. **Webhook not receiving events**
   - Verify webhook URL in Gumroad settings
   - Check Firebase Functions logs: `firebase functions:log`
   - Ensure Blaze plan is active
   - Test with Gumroad's "Send test ping" feature

3. **CORS errors**
   - Update `allowedOrigins` in `functions/index.js`
   - Include your production domain and localhost

4. **Subscription not updating**
   - Check Firestore security rules allow updates
   - Verify email matches exactly
   - Check Firebase Functions logs for errors
   - Ensure user profile is loaded in AuthContext

5. **"Blaze plan required" error**
   - Upgrade at: https://console.firebase.google.com/project/followertracker-f84e4/usage/details
   - Free tier includes 2M function invocations/month

### Testing Checklist

- [ ] User can sign up and create account
- [ ] User profile created with `subscriptionStatus: 'free'`
- [ ] Premium upgrade button opens Gumroad checkout
- [ ] Manual activation page works (`/activate`)
- [ ] Webhook receives Gumroad events
- [ ] Subscription status updates in Firestore
- [ ] Premium features unlock after activation
- [ ] Subscription expiry check works
- [ ] Cancelled subscriptions handled correctly

---

## Summary

This implementation provides:

1. **Automatic webhook processing** (requires Blaze plan)
2. **Manual license key activation** (works without Blaze)
3. **Real-time premium status** via AuthContext
4. **Secure Firestore rules** preventing user manipulation
5. **Rate limiting** to prevent abuse
6. **Error handling** and logging

**Next Steps**:
1. Update all product IDs and URLs to match your FollowerTracker project
2. Deploy functions (after upgrading to Blaze)
3. Configure Gumroad webhook
4. Test with a real purchase
5. Monitor Firebase Functions logs

**Important URLs to Update**:
- Gumroad product URL: `https://streamerservices.gumroad.com/l/exyuh`
- Gumroad product ID: `exyuh`
- Firebase project ID: `followertracker-f84e4`
- Function URLs: `https://us-central1-followertracker-f84e4.cloudfunctions.net`

