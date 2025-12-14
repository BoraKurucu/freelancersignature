# Gumroad Premium Membership Setup Guide

## Step 1: Product Type Selection

**Select: "Membership"**

This is the correct choice because:
- You're selling a recurring subscription (monthly premium access)
- Gumroad will handle automatic renewals
- You can set up recurring billing

## Step 2: Product Configuration

### Name
```
freelancersignature premium subscription
```

### Description
```
Unlock the full power of FreelancerSignature with Premium:

✨ Remove "Created with FreelancerSignature" watermark from all signatures
📋 Copy HTML code directly from saved signatures
📥 Download PNG signatures without watermarks
🎨 Access to all premium templates
📊 Advanced signature analytics
🔒 Priority support

Perfect for freelancers who want professional, unbranded email signatures that help win more clients.

Your subscription renews monthly and can be cancelled anytime.
```

### Cover Image
- Upload a horizontal image (1280x720px minimum)
- Should showcase your premium features
- Professional and eye-catching

### Thumbnail
- Square image (600x600px minimum)
- JPG, PNG, or GIF format
- Appears in Gumroad Library and Discover

### Product Info

**Call to action:** "I want this!"

**Summary - You'll get:**
- ✅ No watermarks on signatures
- ✅ HTML copy functionality
- ✅ Premium templates
- ✅ Priority support
- ✅ Monthly subscription (cancel anytime)

**Additional details:**
- Add detail: "Remove all watermarks"
- Add detail: "Unlimited signature downloads"
- Add detail: "Copy HTML code feature"
- Add detail: "Premium templates access"

### Pricing

**Amount:** $4.99

**Settings:**
- ✅ Allow customers to pay what they want (optional - you can disable this)
- ✅ Allow customers to pay in installments (optional)
- ❌ Limit product sales (leave unchecked)
- ❌ Allow customers to choose a quantity (leave unchecked)
- ✅ Publicly show the number of sales (recommended for social proof)
- ❌ Mark product as e-publication for VAT purposes
- ✅ Specify a refund policy (recommended: "7-day money-back guarantee")
- ❌ Require shipping information (not needed for digital membership)

### Integrations

You can optionally:
- Invite customers to a Gumroad community chat
- Invite customers to a Circle community
- Invite customers to a Discord server

## Step 3: After Product Creation

1. **Get your Product URL**
   - Your product URL is: `https://streamerservices.gumroad.com/l/pddxf`
   - This is already configured in your code

2. **Set up Webhooks** (Important!)
   - Go to Settings → Integrations → Webhooks
   - Add webhook URL: `https://your-domain.com/api/gumroad-webhook`
   - Select events: `sale`, `subscription_activated`, `subscription_cancelled`, `subscription_ended`

3. **Get your Gumroad Access Token**
   - Go to Settings → Advanced → API
   - Generate an access token
   - Keep this secret! You'll need it for webhook verification

## Step 4: Integration with Your Website

The integration code has been created in:
- `src/services/gumroadService.js` - Gumroad API integration
- `src/components/PremiumUpgrade.js` - Premium upgrade page
- `src/components/PremiumUpgrade.css` - Styling

You'll also need to set up a webhook endpoint (see `WEBHOOK_SETUP.md` for details).

## Step 5: Testing

1. Create a test purchase with Gumroad's test mode
2. Verify webhook receives the purchase event
3. Check that user's subscription status updates in Firestore
4. Test that premium features are unlocked

## Important Notes

- Gumroad takes a 2.9% + $0.30 fee per transaction
- Subscriptions renew automatically
- Users can cancel anytime from their Gumroad account
- You'll receive email notifications for new sales


