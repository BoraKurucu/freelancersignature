# Add Additional Firestore Permission

The service account is added, but it might need **Cloud Datastore User** role for Firestore access.

## Steps

1. **On the IAM page**, find: `506055949269-compute@developer.gserviceaccount.com`

2. **Click the pencil icon** (edit) next to it

3. **Click "Add Another Role"**

4. **Select**: `Cloud Datastore User`

5. **Click "Save"**

## Alternative: Wait a Few Minutes

Sometimes permissions take 2-5 minutes to propagate. You can:
1. Wait 2-3 minutes
2. Try running the script again

## Or Try This Role Instead

If `Cloud Datastore User` doesn't work, try:
- `Firestore Service Agent`
- `Cloud Datastore Admin` (more permissive)



