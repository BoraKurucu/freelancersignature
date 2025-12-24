# Update Gamerlinks Webhook to Add Followertracker

## Current Situation

Your **gamerlinks webhook** already handles:
- ✅ `pddxf` → freelancersignature project
- ✅ `bawwj` → gamerlinks-844c5 project

**We just need to add:**
- ➕ `exyuh` → followertracker-f84e4 project

## What to Change

In your **gamerlinks Firebase project** webhook code, you need to:

1. **Add followertracker Firebase Admin initialization**
2. **Add `exyuh` to the product mapping**
3. **That's it!** No other changes needed

## Updated Code

Find your gamerlinks webhook file (likely at `/Users/mehmetborakurucu/Desktop/gamerlinks/functions/src/gumroadWebhook.ts` or similar).

### Step 1: Add Followertracker Firebase Admin

At the top of your webhook file, add followertracker initialization:

```typescript
// If using TypeScript (gumroadWebhook.ts)
import * as admin from 'firebase-admin';

// Initialize default (gamerlinks)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Initialize freelancersignature (if not already done)
let freelancersignatureApp;
try {
  freelancersignatureApp = admin.app('freelancersignature');
} catch (e) {
  freelancersignatureApp = admin.initializeApp(
    {
      credential: admin.credential.cert(require('../path-to-freelancersignature-service-account.json')),
      projectId: 'freelancersignature'
    },
    'freelancersignature'
  );
}

// Initialize followertracker (NEW)
let followertrackerApp;
try {
  followertrackerApp = admin.app('followertracker');
} catch (e) {
  // Use the service account key you provided
  followertrackerApp = admin.initializeApp(
    {
      credential: admin.credential.cert({
        type: "service_account",
        project_id: "followertracker-f84e4",
        private_key_id: "f519ecfeb9f6201cc15b667304666913213b5565",
        private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCuzhlSh0bWiVPl\nL96SW0SA94V0QqsilmKxZ2giJCc3AxghZSVKkZZ5Tug5Q3FoTW7W5wBudC1DMDjK\nzgRyDgPUFT5HCxFSHrIZEKmNb2tMLYjzUqt4r/Q3QoxIhkThxXnTtjrISXskCuh4\nVSLxIpGLKxw8vny2BDBP7idqKKNbMuHv93eOtJEHVUwn57pgGq43Erl+i8mRxu4z\nOnZsulIopwCglDOiGUr1Twea/kXbGmMgNYjtpUbpJVkSnQJyjSXKMa7kAJHWB0au\nH4I8/JMzqJ4rporXElx11z1dND6NjH/RI9uhs9+r0oGeYZO+Mjy6HQiEwthFGsRW\ncKGMhKjjAgMBAAECggEACEXFqgOv5QhDuaVtzZRXJhlQrgNXsP/X9NhVc8QtPOu/\nERmFzcUdD2meENOxwsNjWvU8rn1+BN972JEuYa1rHfbRZzBNZgsA17HTrFdZBxZi\nlE1VwxTkpFbYZ7g++0ZKsSu/FWpw0vBXNxakXDAMHj9wiyliooSJOsclA1+f93lZ\nb6lnT1a0HO0oxB2R05Jr2voPOIS1fFUBtYnsU0Ly8R/0F7kshPm8XRvoSndu2qZX\nB/10kJklQRwgT40eh77m1a2GdrqPguJiHQZwPugWpPk2zGdrC0xBS/OOpAddphzJ\ny8qWrTa9ETDnyINeAtssxmWvG8O3YEwJm9m/qPHmLQKBgQDdk+Uhcw0QhIbzyl83\nyL0cJGGADeUkd2VQ7nR0auaXBA4w1a1zC0Qa1lRFtGG15F7b1B6BrsH0c0N/26qf\nXnidF+WBJQXRYe7VpGXXCWIF0BWwwya5kgZK/n0+iT+OzBHr44bQHGUYZ5QzwOqe\nbHIdfzEXUzfmblpgXmDEN5yGfQKBgQDJ9hCF1nvsq3nj4LQ4YCAVcej23VJUStVV\nP4VuU5ou8QSCZWVEZPUFS5IFgxcb3Qvd8A7kvT2NIDb+68yeMFCTYQGsjID8Atu7\nqY+iF/ddeA5DE2HG5J1qI6BFbzbemXOm5+17ytrzWWBFk5QNR2rjTLZp/wBDwmmQ\nwa3t3Xcq3wKBgAuuY1L7HMI1KmQp1BE9zPJx3I4CrYTZooa8u3jztcpaVWEvsqAx\nBNshV3oBQ3FyY6nVKfKOQv1fIjzYWMtkEJm/i8LeL8tVDWFH9HJ8tSU3Th1ufFkm\nIJzNg87LL4WYro0wBohsJsw9kauUzQmjD/UMIotnQLguMyeHcjSF9gOFAoGBAJxV\noMapmDZFKs6OQ5OcPVm8WpS2ECP15Zve1v/nMWQC5/W0XaaK6+xUak1gA4RrIOOF\nD1JbdwkGlevRRgxx4/2hyvTxsmriH4vuHqRgHvi4lXmwyDB5Ca1+tHLrOzMm4BKk\nV/5KsiBL4C0bpzB8Ry56VH5Kib7qAGOwuV124OdLAoGABnQPVt6cyZ8gHiIvX+jW\n1iK/QxSIsyoCS7ps9Gc5T719u8EEE8+JEFmzI2H1i28KamlZFxIusJgIWDh3BT4Z\nL2yhWvMJF8URfvi4OkdQyX2lOWtXDIyrGrF5HJBSckxJvT7e+Ra/R6ZD3Hue4JhK\nXa2rdeBlEbqXGDjbsfMD33k=\n-----END PRIVATE KEY-----\n",
        client_email: "firebase-adminsdk-fbsvc@followertracker-f84e4.iam.gserviceaccount.com",
        client_id: "107579354950619310485",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40followertracker-f84e4.iam.gserviceaccount.com",
        universe_domain: "googleapis.com"
      }),
      projectId: 'followertracker-f84e4'
    },
    'followertracker'
  );
}
```

### Step 2: Update Product Mapping

Find where you have the product mapping (probably something like):

```typescript
// OLD - Only 2 products
const PRODUCT_CONFIG = {
  'pddxf': {
    db: admin.firestore(freelancersignatureApp),
    name: 'freelancersignature'
  },
  'bawwj': {
    db: admin.firestore(),
    name: 'gamerlinks'
  }
};
```

**Update it to:**

```typescript
// NEW - Add followertracker
const PRODUCT_CONFIG = {
  'pddxf': {
    db: admin.firestore(freelancersignatureApp),
    name: 'freelancersignature'
  },
  'bawwj': {
    db: admin.firestore(),
    name: 'gamerlinks'
  },
  'exyuh': {  // NEW - Followertracker
    db: admin.firestore(followertrackerApp),
    name: 'followertracker'
  }
};
```

### Step 3: That's It!

The existing webhook routing logic will automatically handle `exyuh` because it:
1. Extracts product ID from webhook
2. Looks it up in `PRODUCT_CONFIG`
3. Routes to the correct Firestore database

**No other code changes needed!**

## Alternative: If Using JavaScript (not TypeScript)

If your webhook is in JavaScript (`index.js`), use this:

```javascript
const admin = require('firebase-admin');

// Initialize default (gamerlinks)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Initialize freelancersignature
let freelancersignatureApp;
try {
  freelancersignatureApp = admin.app('freelancersignature');
} catch (e) {
  // Load from service account file or use existing method
  freelancersignatureApp = admin.initializeApp(
    {
      credential: admin.credential.cert(require('./path-to-freelancersignature-key.json')),
      projectId: 'freelancersignature'
    },
    'freelancersignature'
  );
}

// Initialize followertracker (NEW)
let followertrackerApp;
try {
  followertrackerApp = admin.app('followertracker');
} catch (e) {
  followertrackerApp = admin.initializeApp(
    {
      credential: admin.credential.cert({
        type: "service_account",
        project_id: "followertracker-f84e4",
        private_key_id: "f519ecfeb9f6201cc15b667304666913213b5565",
        private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCuzhlSh0bWiVPl\nL96SW0SA94V0QqsilmKxZ2giJCc3AxghZSVKkZZ5Tug5Q3FoTW7W5wBudC1DMDjK\nzgRyDgPUFT5HCxFSHrIZEKmNb2tMLYjzUqt4r/Q3QoxIhkThxXnTtjrISXskCuh4\nVSLxIpGLKxw8vny2BDBP7idqKKNbMuHv93eOtJEHVUwn57pgGq43Erl+i8mRxu4z\nOnZsulIopwCglDOiGUr1Twea/kXbGmMgNYjtpUbpJVkSnQJyjSXKMa7kAJHWB0au\nH4I8/JMzqJ4rporXElx11z1dND6NjH/RI9uhs9+r0oGeYZO+Mjy6HQiEwthFGsRW\ncKGMhKjjAgMBAAECggEACEXFqgOv5QhDuaVtzZRXJhlQrgNXsP/X9NhVc8QtPOu/\nERmFzcUdD2meENOxwsNjWvU8rn1+BN972JEuYa1rHfbRZzBNZgsA17HTrFdZBxZi\nlE1VwxTkpFbYZ7g++0ZKsSu/FWpw0vBXNxakXDAMHj9wiyliooSJOsclA1+f93lZ\nb6lnT1a0HO0oxB2R05Jr2voPOIS1fFUBtYnsU0Ly8R/0F7kshPm8XRvoSndu2qZX\nB/10kJklQRwgT40eh77m1a2GdrqPguJiHQZwPugWpPk2zGdrC0xBS/OOpAddphzJ\ny8qWrTa9ETDnyINeAtssxmWvG8O3YEwJm9m/qPHmLQKBgQDdk+Uhcw0QhIbzyl83\nyL0cJGGADeUkd2VQ7nR0auaXBA4w1a1zC0Qa1lRFtGG15F7b1B6BrsH0c0N/26qf\nXnidF+WBJQXRYe7VpGXXCWIF0BWwwya5kgZK/n0+iT+OzBHr44bQHGUYZ5QzwOqe\nbHIdfzEXUzfmblpgXmDEN5yGfQKBgQDJ9hCF1nvsq3nj4LQ4YCAVcej23VJUStVV\nP4VuU5ou8QSCZWVEZPUFS5IFgxcb3Qvd8A7kvT2NIDb+68yeMFCTYQGsjID8Atu7\nqY+iF/ddeA5DE2HG5J1qI6BFbzbemXOm5+17ytrzWWBFk5QNR2rjTLZp/wBDwmmQ\nwa3t3Xcq3wKBgAuuY1L7HMI1KmQp1BE9zPJx3I4CrYTZooa8u3jztcpaVWEvsqAx\nBNshV3oBQ3FyY6nVKfKOQv1fIjzYWMtkEJm/i8LeL8tVDWFH9HJ8tSU3Th1ufFkm\nIJzNg87LL4WYro0wBohsJsw9kauUzQmjD/UMIotnQLguMyeHcjSF9gOFAoGBAJxV\noMapmDZFKs6OQ5OcPVm8WpS2ECP15Zve1v/nMWQC5/W0XaaK6+xUak1gA4RrIOOF\nD1JbdwkGlevRRgxx4/2hyvTxsmriH4vuHqRgHvi4lXmwyDB5Ca1+tHLrOzMm4BKk\nV/5KsiBL4C0bpzB8Ry56VH5Kib7qAGOwuV124OdLAoGABnQPVt6cyZ8gHiIvX+jW\n1iK/QxSIsyoCS7ps9Gc5T719u8EEE8+JEFmzI2H1i28KamlZFxIusJgIWDh3BT4Z\nL2yhWvMJF8URfvi4OkdQyX2lOWtXDIyrGrF5HJBSckxJvT7e+Ra/R6ZD3Hue4JhK\nXa2rdeBlEbqXGDjbsfMD33k=\n-----END PRIVATE KEY-----\n",
        client_email: "firebase-adminsdk-fbsvc@followertracker-f84e4.iam.gserviceaccount.com",
        client_id: "107579354950619310485",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40followertracker-f84e4.iam.gserviceaccount.com",
        universe_domain: "googleapis.com"
      }),
      projectId: 'followertracker-f84e4'
    },
    'followertracker'
  );
}

// Product mapping
const PRODUCT_CONFIG = {
  'pddxf': {
    db: admin.firestore(freelancersignatureApp),
    name: 'freelancersignature'
  },
  'bawwj': {
    db: admin.firestore(),
    name: 'gamerlinks'
  },
  'exyuh': {  // NEW
    db: admin.firestore(followertrackerApp),
    name: 'followertracker'
  }
};
```

## Deployment

After making these changes:

```bash
cd /Users/mehmetborakurucu/Desktop/gamerlinks
firebase deploy --only functions --project gamerlinks-844c5
```

## Testing

1. Make a test purchase for followertracker (`exyuh`)
2. Check logs: `firebase functions:log --project gamerlinks-844c5`
3. Verify user's `subscriptionStatus` is `'premium'` in followertracker Firestore

## Summary

**What changed:**
- ✅ Added followertracker Firebase Admin initialization
- ✅ Added `exyuh` to product mapping

**What didn't change:**
- ✅ Existing gamerlinks logic (unchanged)
- ✅ Existing freelancersignature logic (unchanged)
- ✅ Webhook URL (same as before)
- ✅ Gumroad configuration (no changes needed)

**Result:**
- ✅ All 3 products work automatically with one webhook URL!

