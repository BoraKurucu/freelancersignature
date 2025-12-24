# Fix Webhook Permissions

## Problem
The webhook can't access freelancersignature Firestore because the gamerlinks service account doesn't have permission.

## Solution: Grant Service Account Access

### Option 1: Via Firebase Console (Easiest)

1. Go to: https://console.firebase.google.com/project/freelancersignature/settings/iam
2. Click "Add member"
3. Add this email: `506055949269-compute@developer.gserviceaccount.com`
4. Role: **Firebase Admin SDK Administrator Service Agent** or **Cloud Datastore User**
5. Click "Add"

### Option 2: Via Google Cloud Console

1. Go to: https://console.cloud.google.com/iam-admin/iam?project=freelancersignature
2. Click "Grant Access"
3. Add: `506055949269-compute@developer.gserviceaccount.com`
4. Role: **Cloud Datastore User** or **Firestore Service Agent**
5. Save

### Option 3: Use Service Account Key (Alternative)

If the above doesn't work, we can use a service account key file:

1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts?project=freelancersignature
2. Create or select a service account
3. Create a key (JSON)
4. Download the key file
5. Update the webhook code to use this key

## After Fixing Permissions

1. Test the webhook again
2. Check logs: `firebase functions:log --project gamerlinks-844c5`
3. Verify user subscription updates in Firestore





