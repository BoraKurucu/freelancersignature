# Webhook Setup Options

Since you're using the same Gumroad account for multiple products, here are your options:

## Option 1: Upgrade Firebase to Blaze Plan (Recommended)

**Cost**: Free tier available (2 million function invocations/month free)

**Steps**:
1. Go to: https://console.firebase.google.com/project/freelancersignature/usage/details
2. Click "Upgrade to Blaze plan"
3. Add a payment method (won't be charged unless you exceed free tier)
4. Run: `firebase deploy --only functions`
5. Get your new webhook URL from the deployment output
6. Update Gumroad ping endpoint with the new URL

**New webhook URL will be**:
```
https://us-central1-freelancersignature.cloudfunctions.net/gumroadWebhook
```

## Option 2: Modify Existing Gamerlinks Webhook

If you want to use the existing webhook endpoint (`https://us-central1-gamerlinks-844c5.cloudfunctions.net/gumroadWebhook`), you can modify it to handle both products:

1. Go to your gamerlinks Firebase project
2. Update the webhook function to check product ID
3. Route to the correct Firestore database based on product ID

**Pros**: No upgrade needed
**Cons**: Both projects depend on one webhook

## Option 3: Use External Service (Railway/Render/Heroku)

Deploy a simple Express server that handles webhooks for both projects.

**Pros**: No Firebase upgrade needed
**Cons**: Additional service to maintain

## Recommendation

**Use Option 1** - Upgrade to Blaze plan. The free tier is very generous and you likely won't exceed it. Cloud Functions are the most reliable and integrated solution.

## After Deployment

Once your webhook is deployed:

1. **Get the webhook URL** from Firebase Console → Functions
2. **Update Gumroad**: Go to Gumroad → Settings → Ping endpoint
3. **Set the URL**: `https://us-central1-freelancersignature.cloudfunctions.net/gumroadWebhook`
4. **Test**: Click "Send test ping to URL"
5. **Check logs**: `firebase functions:log`

## Testing

After setting up:

1. Make a test purchase on Gumroad
2. Check Firebase Functions logs: `firebase functions:log`
3. Verify user subscription status in Firestore
4. Test that premium features unlock
