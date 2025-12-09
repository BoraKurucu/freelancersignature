# Quick Fix: Grant Service Account Access

## The Problem
Your webhook is working correctly but can't access freelancersignature Firestore due to permissions.

## The Fix (2 minutes)

### Step 1: Grant Access via Firebase Console

1. **Open Firebase Console**: https://console.firebase.google.com/project/freelancersignature/settings/iam

2. **Click "Add member"**

3. **Add this email**:
   ```
   506055949269-compute@developer.gserviceaccount.com
   ```

4. **Select Role**: 
   - **Firebase Admin SDK Administrator Service Agent** (recommended)
   - OR **Cloud Datastore User**

5. **Click "Add"**

### Step 2: Test Again

1. Make another test purchase (or wait for the next webhook)
2. Check logs: `firebase functions:log --project gamerlinks-844c5`
3. Verify user subscription updates in Firestore

## Alternative: Via Google Cloud Console

1. Go to: https://console.cloud.google.com/iam-admin/iam?project=freelancersignature
2. Click "Grant Access" (or "Add Principal")
3. Add: `506055949269-compute@developer.gserviceaccount.com`
4. Role: **Cloud Datastore User** or **Firestore Service Agent**
5. Save

## What This Does

This grants the gamerlinks Cloud Function's service account permission to read/write to the freelancersignature Firestore database.

After granting access, the webhook will work immediately! 🚀

