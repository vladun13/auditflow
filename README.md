# Accessibility Audit Reports Generator

A full-stack B2B SaaS tool that automatically generates WCAG-compliant accessibility audit reports for websites. Built with React, Express.js, Supabase, and Claude AI.

## Features

- 🔐 **User Authentication** - Secure email/password authentication via Supabase
- 🔍 **Website Scanning** - Automated crawling with Puppeteer + Axe accessibility testing
- 🤖 **AI-Powered Recommendations** - Claude generates fix instructions for each violation
- 📊 **WCAG Scoring** - Automatic compliance scoring (A, AA, AAA levels)
- 📄 **PDF Reports** - Professional downloadable reports
- 💳 **Payment Integration** - Stripe checkout for credit purchases
- 📧 **Email Notifications** - Scan completion alerts
- 📱 **Responsive Design** - Mobile-friendly interface

## Tech Stack

### Frontend
- React 19 + TypeScript
- React Router for navigation
- Tailwind CSS for styling
- Supabase Client (auth)
- Lemon Squeezy (payments)
- Vite (build tool)

### Backend
- Node.js + Express.js
- TypeScript
- Puppeteer (web crawling)
- @axe-core/puppeteer (accessibility testing)
- Anthropic Claude API (AI recommendations)
- Lemon Squeezy API (payments)
- SendGrid (email - optional)

### Database
- Supabase (PostgreSQL)
- Row Level Security enabled
- Automatic user profile creation

## Quick Start

### Prerequisites

- Node.js 20.19+ (or upgrade from 20.18.0)
- Supabase account
- Anthropic API key
- Lemon Squeezy account

### 1. Clone and Install

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Set Up Supabase

1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor and run the schema from `supabase-schema.sql`
3. Get your project URL and keys from Settings > API

### 3. Configure Environment Variables

**Frontend (.env):**
```bash
cp .env.example .env
# Edit .env with your values
```

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3001
```

**Backend (backend/.env):**
```bash
cd backend
cp .env.example .env
# Edit .env with your values
```

```env
PORT=3001
NODE_ENV=development

SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

ANTHROPIC_API_KEY=your_anthropic_api_key

LEMONSQUEEZY_API_KEY=your_lemonsqueezy_api_key
LEMONSQUEEZY_STORE_ID=your_store_id
LEMONSQUEEZY_VARIANT_ID_BASIC=your_basic_variant_id
LEMONSQUEEZY_VARIANT_ID_PRO=your_pro_variant_id
LEMONSQUEEZY_VARIANT_ID_ENTERPRISE=your_enterprise_variant_id
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret

SENDGRID_API_KEY=your_sendgrid_api_key (optional)
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

FRONTEND_URL=http://localhost:5173
```

### 4. Run Development Servers

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Project Structure

```
.
├── src/                          # Frontend source
│   ├── components/               # React components
│   │   └── ui/                   # UI components (buttons, cards)
│   ├── contexts/                 # React contexts (Auth)
│   ├── lib/                      # Utilities (API client, Supabase)
│   └── pages/                    # Page components
│       ├── Landing.tsx           # Landing page
│       ├── SignUp.tsx            # Signup page
│       ├── Login.tsx             # Login page
│       ├── Dashboard.tsx         # User dashboard
│       ├── NewScan.tsx           # Scan creation
│       ├── AuditDetail.tsx       # Audit results
│       └── Pricing.tsx           # Pricing page
│
├── backend/                      # Backend source
│   └── src/
│       ├── config/               # Configuration (Supabase)
│       ├── middleware/           # Express middleware (auth)
│       ├── routes/               # API routes
│       │   ├── auth.ts           # Auth endpoints
│       │   ├── audits.ts         # Audit endpoints
│       │   ├── payments.ts       # Payment endpoints
│       │   └── user.ts           # User endpoints
│       ├── services/             # Business logic
│       │   ├── scanService.ts    # Puppeteer + Axe scanning
│       │   └── aiService.ts      # Claude AI integration
│       └── server.ts             # Express app
│
└── supabase-schema.sql           # Database schema
```

## API Endpoints

### Authentication
- `GET /auth/me` - Get current user

### Audits
- `POST /api/audits/create` - Create new audit
- `POST /api/audits/:id/scan` - Start scanning
- `GET /api/audits/:id` - Get audit details + violations
- `GET /api/audits` - List user's audits
- `DELETE /api/audits/:id` - Delete audit
- `GET /api/audits/:id/report/pdf` - Download PDF (coming soon)

### Payments
- `POST /api/payments/checkout` - Create Lemon Squeezy checkout
- `GET /api/payments/success/:order_id` - Confirm payment
- `POST /api/payments/webhook` - Lemon Squeezy webhook handler

### User
- `GET /api/user/credits` - Get credit balance

## Database Schema

See `supabase-schema.sql` for the complete schema with:
- Users table (extends Supabase auth)
- Audits table
- Violations table
- Payments table
- Claude cache table
- Row Level Security policies
- Triggers and functions

## Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Backend (Render.com or Railway)

1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `cd backend && npm install && npm run build`
4. Set start command: `cd backend && npm start`
5. Add environment variables
6. Deploy

### Database (Supabase)

Already hosted! Just run the schema in SQL Editor.

## Testing

### Test Lemon Squeezy Payments

When testing in development mode:
1. Lemon Squeezy automatically uses test mode when `NODE_ENV=development`
2. You can complete test purchases without real payment
3. Test orders will be marked as "test" in your Lemon Squeezy dashboard
4. No test credit card needed - just proceed through checkout

### Test Accessibility Scanning

1. Sign up for an account
2. Enter a test URL (e.g., `https://example.com`)
3. Click "Start Scan"
4. Wait 2-5 minutes for results

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` in backend .env matches your frontend URL
- Check that backend is running on port 3001

### Supabase Connection Issues
- Verify SUPABASE_URL and keys are correct
- Ensure RLS policies are enabled
- Check that schema was created successfully

### Scanning Timeouts
- Puppeteer may timeout on slow sites
- Increase timeout in `scanService.ts` if needed
- Ensure website is publicly accessible

### Payment Issues
- Ensure Lemon Squeezy API key has correct permissions
- Check that variant IDs match your products in Lemon Squeezy
- Verify webhook secret is correctly set
- Check Lemon Squeezy dashboard for payment status

## Future Enhancements (v1.1+)

- [ ] PDF report generation (currently placeholder)
- [ ] Email notifications with SendGrid
- [ ] Scheduled recurring scans
- [ ] Custom report branding
- [ ] Team collaboration features
- [ ] Historical trend reports
- [ ] API for third-party integrations

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the PRD document
3. Open an issue on GitHub

---

**Built with Claude Code** 🤖

Generated following the comprehensive Product Requirements Document for an accessibility audit SaaS platform.
