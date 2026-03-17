# Lemon Squeezy Setup Guide

This project uses **Lemon Squeezy** for payment processing instead of Stripe. This guide will help you set up Lemon Squeezy for your Accessibility Audit Generator.

## Why Lemon Squeezy?

- **Merchant of Record**: Lemon Squeezy handles all tax compliance, VAT, and sales tax
- **Global payments**: Accepts payments from 135+ countries
- **Simple pricing**: 5% + 50¢ per transaction (no monthly fees)
- **Built-in features**: Automatic receipts, customer portal, analytics
- **Developer-friendly**: Easy API, webhooks, and test mode

## Step 1: Create Your Lemon Squeezy Account

1. Go to https://lemonsqueezy.com
2. Click **"Get started"**
3. Sign up with email or Google
4. Complete your store setup:
   - Store name
   - Store URL
   - Business details

## Step 2: Create Your Products

You need to create 3 products for the different pricing tiers:

### Product 1: Basic Plan

1. Go to **Products** in sidebar
2. Click **"Create Product"**
3. Fill in:
   - **Name**: Basic Plan
   - **Description**: 1 accessibility audit credit
   - **Price**: $149 USD
4. Click **"Create Product"**
5. In the product page, go to **Variants** tab
6. Copy the **Variant ID** (you'll need this for `.env`)

### Product 2: Pro Plan

1. Click **"Create Product"** again
2. Fill in:
   - **Name**: Pro Plan
   - **Description**: 5 accessibility audit credits
   - **Price**: $299 USD
3. Click **"Create Product"**
4. Copy the **Variant ID**

### Product 3: Enterprise Plan

1. Click **"Create Product"** again
2. Fill in:
   - **Name**: Enterprise Plan
   - **Description**: 15 accessibility audit credits
   - **Price**: $499 USD
3. Click **"Create Product"**
4. Copy the **Variant ID**

## Step 3: Get Your API Key

1. Go to **Settings** > **API** in sidebar
2. Click **"Create API Key"**
3. Name it: "Accessibility Audit Generator"
4. Copy the API key (starts with `eyJ0...`)
5. Save it securely - you won't see it again!

## Step 4: Get Your Store ID

1. Go to **Settings** > **Stores**
2. Find your store in the list
3. Copy the **Store ID** (numeric ID like `12345`)

## Step 5: Configure Environment Variables

Add these to your `backend/.env` file:

```env
# Lemon Squeezy Configuration
LEMONSQUEEZY_API_KEY=eyJ0eXAiOiJKV1QiLCJhbGc...  # Your API key
LEMONSQUEEZY_STORE_ID=12345                        # Your store ID
LEMONSQUEEZY_VARIANT_ID_BASIC=56789               # Basic variant ID
LEMONSQUEEZY_VARIANT_ID_PRO=56790                 # Pro variant ID
LEMONSQUEEZY_VARIANT_ID_ENTERPRISE=56791          # Enterprise variant ID
LEMONSQUEEZY_WEBHOOK_SECRET=                       # Leave blank for now
```

## Step 6: Test Mode (Development)

Good news! Lemon Squeezy automatically uses **test mode** when:
- Your environment variable `NODE_ENV=development`
- No real payments are processed
- Test orders appear in your dashboard marked as "test"

To test:
1. Start your backend: `cd backend && npm run dev`
2. Start your frontend: `npm run dev`
3. Sign up for an account
4. Click "Buy Credits"
5. Select a plan
6. Complete the test checkout (no real payment needed!)
7. You'll be redirected back and credits will be added

## Step 7: Set Up Webhooks (Production Only)

For production deployment, set up webhooks to handle payment confirmations:

1. Go to **Settings** > **Webhooks** in Lemon Squeezy
2. Click **"Add endpoint"**
3. Fill in:
   - **URL**: `https://your-backend-url.com/api/payments/webhook`
   - **Events to send**: Select `order_created`
   - **Signing secret**: Click "Generate" and copy it
4. Add to your `backend/.env`:
   ```env
   LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret_here
   ```

## API Integration Overview

### Checkout Flow

1. User clicks "Buy Credits" on frontend
2. Frontend calls `POST /api/payments/checkout` with plan name
3. Backend creates Lemon Squeezy checkout session
4. User is redirected to Lemon Squeezy checkout page
5. User completes payment
6. Lemon Squeezy redirects back to `/dashboard?payment=success`
7. Frontend calls `GET /api/payments/success/:order_id`
8. Backend verifies payment and adds credits

### Webhook Flow (Production)

1. Customer completes payment on Lemon Squeezy
2. Lemon Squeezy sends `order_created` webhook to your backend
3. Backend verifies webhook signature
4. Backend updates payment status to "completed"
5. Backend adds credits to user account

## Testing Checklist

- [ ] API key is valid and has correct permissions
- [ ] Store ID is correct
- [ ] All 3 variant IDs match your products
- [ ] Backend starts without errors
- [ ] Can create checkout session
- [ ] Checkout page loads correctly
- [ ] Test payment completes successfully
- [ ] Credits are added to user account
- [ ] User can use credits to run scans

## Common Issues

### "Invalid API key"
- Check that your API key is correctly copied (starts with `eyJ0...`)
- Ensure no extra spaces or line breaks
- Verify the key hasn't been revoked in Lemon Squeezy dashboard

### "Product variant not found"
- Double-check variant IDs match exactly
- Make sure products are published (not draft)
- Verify you're using the variant ID, not the product ID

### "Webhook signature verification failed"
- For local dev, webhooks won't work (that's OK!)
- For production, ensure webhook secret is correctly set
- Check that webhook URL is publicly accessible

### "Test mode not working"
- Ensure `NODE_ENV=development` in backend/.env
- Restart your backend server after changing .env
- Check Lemon Squeezy dashboard shows test orders

## Production Deployment

When deploying to production:

1. **Update environment variables** on your hosting platform (Render, Railway, etc.)
2. **Set up webhooks** as described in Step 7
3. **Test with real payment** (use a small amount first)
4. **Monitor Lemon Squeezy dashboard** for orders and payments
5. **Check your bank account** for payouts (weekly or monthly)

## Support & Resources

- **Lemon Squeezy Docs**: https://docs.lemonsqueezy.com
- **API Reference**: https://docs.lemonsqueezy.com/api
- **Webhooks Guide**: https://docs.lemonsqueezy.com/guides/developer/webhooks
- **Support**: help@lemonsqueezy.com

## Pricing Comparison

**Lemon Squeezy vs Stripe:**

| Feature | Lemon Squeezy | Stripe |
|---------|---------------|--------|
| Transaction Fee | 5% + 50¢ | 2.9% + 30¢ |
| Monthly Fee | $0 | $0 |
| Tax Compliance | Included (Merchant of Record) | You handle it |
| Global Payments | 135+ countries | 195+ countries |
| Setup Complexity | Very Simple | Moderate |
| Best For | SaaS, Digital Products | All types |

---

**You're ready to accept payments with Lemon Squeezy!** 🍋
