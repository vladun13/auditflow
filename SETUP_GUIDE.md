# Complete Setup Guide

This guide walks you through setting up the Accessibility Audit Generator from scratch.

## Prerequisites Checklist

Before you begin, make sure you have:

- [ ] Node.js 20.19+ installed
- [ ] Git installed
- [ ] A Supabase account (free tier works)
- [ ] An Anthropic API key (get from https://console.anthropic.com)
- [ ] A Lemon Squeezy account (get from https://lemonsqueezy.com)
- [ ] A code editor (VS Code recommended)

## Step 1: Database Setup (Supabase)

### Create Supabase Project

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign in with GitHub or email
4. Click "New project"
5. Fill in:
   - **Name**: accessibility-audit-db
   - **Database Password**: (generate a strong password, save it)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free

6. Wait 2-3 minutes for project to be created

### Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **New query**
3. Open the file `supabase-schema.sql` from this project
4. Copy **all** the SQL code
5. Paste it into the Supabase SQL Editor
6. Click **Run** (bottom right)
7. You should see "Success. No rows returned"

### Get API Keys

1. Go to **Settings** > **API** (left sidebar)
2. Copy these values (you'll need them later):
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")
   - **service_role** key (click "Reveal" first)

⚠️ **Important**: Keep the `service_role` key secret! Never commit it to Git.

## Step 2: Get API Keys

### Anthropic Claude API

1. Go to https://console.anthropic.com
2. Sign up or log in
3. Go to **API Keys** section
4. Click **Create Key**
5. Name it "Accessibility Audit Dev"
6. Copy the key (starts with `sk-ant-...`)

### Lemon Squeezy API

1. Go to https://app.lemonsqueezy.com
2. Sign up or log in
3. Go to **Settings** > **API**
4. Click **Create API Key**
5. Name it "Accessibility Audit Dev"
6. Copy the API key (starts with `eyJ0...`)

7. Create your products:
   - Go to **Products** > **Create Product**
   - Create 3 products: Basic ($149), Pro ($299), Enterprise ($499)
   - For each product, create a variant
   - Copy each **Variant ID** (you'll need these)

8. Get your Store ID:
   - Go to **Settings** > **Stores**
   - Copy your **Store ID**

9. Set up webhook (optional for local dev):
   - Go to **Settings** > **Webhooks**
   - Click **Add endpoint**
   - URL: `https://your-backend-url.com/api/payments/webhook`
   - Select event: `order_created`
   - Copy the **Signing secret**

## Step 3: Install Dependencies

### Frontend

```bash
# In project root
npm install
```

If you get peer dependency warnings, that's okay. The app will still work.

### Backend

```bash
cd backend
npm install
cd ..
```

## Step 4: Configure Environment Variables

### Frontend Configuration

1. Copy the example file:
```bash
cp .env.example .env
```

2. Edit `.env` and fill in:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_API_URL=http://localhost:3001
```

### Backend Configuration

1. Copy the example file:
```bash
cd backend
cp .env.example .env
cd ..
```

2. Edit `backend/.env` and fill in:

```env
PORT=3001
NODE_ENV=development

# From Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# From Anthropic
ANTHROPIC_API_KEY=sk-ant-xxxxx

# From Lemon Squeezy
LEMONSQUEEZY_API_KEY=eyJ0xxxxx
LEMONSQUEEZY_STORE_ID=your_store_id
LEMONSQUEEZY_VARIANT_ID_BASIC=your_basic_variant_id
LEMONSQUEEZY_VARIANT_ID_PRO=your_pro_variant_id
LEMONSQUEEZY_VARIANT_ID_ENTERPRISE=your_enterprise_variant_id
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret (optional for local dev)

# Email (optional - leave blank for now)
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

## Step 5: Start the Application

### Terminal 1 - Start Frontend

```bash
npm run dev
```

You should see:
```
VITE v7.2.4  ready in 156 ms
➜  Local:   http://localhost:5173/
```

### Terminal 2 - Start Backend

```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on port 3001
📝 Environment: development
```

## Step 6: Test the Application

### Test 1: Landing Page

1. Open http://localhost:5173
2. You should see the landing page with "Get Started" button

### Test 2: Sign Up

1. Click "Get Started"
2. Enter your email and a password (min 8 chars, 1 uppercase, 1 number)
3. Click "Sign Up"
4. You should be redirected to the dashboard

### Test 3: Check Database

1. Go back to Supabase dashboard
2. Go to **Table Editor** > **users**
3. You should see your user account with 1 credit

### Test 4: Create First Audit

1. In the app dashboard, click "New Scan"
2. Enter a URL: `https://example.com`
3. Select pages to scan: 1
4. Click "Start Scan"
5. Wait 2-3 minutes
6. You should see the audit results with violations

### Test 5: Check Backend Logs

In your backend terminal, you should see:
```
Crawling website...
Scanning page...
Generating AI recommendations...
```

## Common Issues & Solutions

### Issue: "Cannot connect to Supabase"

**Solution:**
- Check that SUPABASE_URL and keys are correct
- Make sure you ran the SQL schema
- Check that RLS policies were created

### Issue: "Puppeteer fails to launch"

**Solution (macOS/Linux):**
```bash
# Install Chromium dependencies
cd backend
npx puppeteer browsers install chrome
```

**Solution (Windows):**
```bash
npm install puppeteer --save
```

### Issue: "CORS error when calling API"

**Solution:**
- Check that FRONTEND_URL in backend/.env matches http://localhost:5173
- Restart the backend server

### Issue: "Claude API error"

**Solution:**
- Verify ANTHROPIC_API_KEY is correct
- Check you have API credits at https://console.anthropic.com
- Check for rate limits (free tier: 50 requests/day)

### Issue: "Lemon Squeezy checkout doesn't work"

**Solution:**
- Verify LEMONSQUEEZY_API_KEY is correct
- Check that variant IDs match your products in Lemon Squeezy
- When `NODE_ENV=development`, Lemon Squeezy uses test mode automatically
- Check your Lemon Squeezy dashboard for any errors

## Next Steps

### 1. Test Payment Flow

1. Go to dashboard
2. Click "Buy Credits"
3. Select a plan
4. Lemon Squeezy will open checkout in test mode
5. Complete the test purchase (no real payment needed in dev mode)
6. You'll be redirected back to dashboard
7. Check credits were added

### 2. Test Full Audit Flow

1. Run a scan on a real website
2. Wait for completion
3. Review violations
4. Check AI recommendations
5. Try filtering by impact level

### 3. Customize the App

- Update landing page copy in `src/pages/Landing.tsx`
- Change branding in `src/components/Navbar.tsx`
- Modify pricing plans in `backend/src/routes/payments.ts`

## Production Deployment

See README.md for deployment instructions to:
- **Frontend**: Vercel
- **Backend**: Render.com or Railway
- **Database**: Already on Supabase (production-ready)

## Getting Help

If you're stuck:

1. Check the troubleshooting section in README.md
2. Review error messages in browser console (F12)
3. Check backend terminal for error logs
4. Review the PRD document for feature specifications

## Development Tips

### Viewing Database

- Go to Supabase > **Table Editor**
- View users, audits, violations, payments
- Use **SQL Editor** for custom queries

### Testing Auth

- Supabase > **Authentication** > **Users**
- See all registered users
- Manually verify emails or reset passwords

### Debugging Scans

- Add `console.log` statements in `backend/src/services/scanService.ts`
- Check audit status in database
- View violation details in violations table

### Monitoring Costs

- **Anthropic**: ~$0.01-0.05 per audit (Claude API)
- **Lemon Squeezy**: 5% + 50¢ per transaction (test mode free)
- **Supabase**: Free tier: 500MB database, 2GB bandwidth
- **Vercel**: Free tier: 100GB bandwidth

---

**You're all set! 🎉**

Your Accessibility Audit Generator is now running locally and ready for development.
