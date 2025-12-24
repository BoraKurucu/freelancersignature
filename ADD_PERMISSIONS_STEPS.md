# Add Gamerlinks Service Account Permissions

## Steps to Add

1. **On the IAM page you're viewing**, click the **"Grant Access"** button (top of the page)

2. **In the "New principals" field**, paste:
   ```
   506055949269-compute@developer.gserviceaccount.com
   ```

3. **Select Role**: 
   - Type: `Firebase Admin SDK Administrator Service Agent`
   - OR search for: `Firebase Admin SDK`
   - Select: **Firebase Admin SDK Administrator Service Agent**

4. **Click "Save"**

## After Adding

Once you add it, you should see it in the list like:
```
506055949269-compute@developer.gserviceaccount.com
Compute Engine default service account
Firebase Admin SDK Administrator Service Agent
```

## Then Test

After adding, run:
```bash
cd /Users/mehmetborakurucu/Desktop/gamerlinks/functions
node update-freelancer-subscription.js
```

This will update your subscription to premium! 🚀




