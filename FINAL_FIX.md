# Final Fix: Add Cloud Datastore User Role

## The Issue
The service account has `Firebase Admin SDK Administrator Service Agent` but might need explicit Firestore permissions.

## Solution

1. **On the IAM page**, find: `506055949269-compute@developer.gserviceaccount.com`

2. **Click the pencil/edit icon** next to it

3. **Click "Add Another Role"**

4. **Add this role**: `Cloud Datastore User`
   - Type "Cloud Datastore" in the search box
   - Select "Cloud Datastore User"

5. **Click "Save"**

## After Adding

Wait 30 seconds, then run:
```bash
cd /Users/mehmetborakurucu/Desktop/gamerlinks/functions
node update-freelancer-subscription.js
```

## Alternative: Use Firebase Console

If the script still doesn't work, manually update in Firestore Console:

1. Go to: https://console.firebase.google.com/project/freelancersignature/firestore
2. Open `users` collection
3. Find your user document (email: borakurucu11@gmail.com)
4. Edit and set:
   - `subscriptionStatus`: `"premium"`
   - `planType`: `"premium"`
   - `gumroadProductId`: `"pddxf"`
5. Save

This will work immediately!

