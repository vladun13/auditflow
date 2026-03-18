import { Link } from 'react-router-dom'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

const LAST_UPDATED = 'March 18, 2026'

const sections = [
  {
    title: '1. Information We Collect',
    content: [
      {
        subtitle: 'Account Information',
        text: 'When you create an account, we collect your email address and optionally your name and company name. If you sign in with Google, we receive your name and email from Google.',
      },
      {
        subtitle: 'Usage Data',
        text: 'We collect information about how you use AuditFlow, including the URLs you submit for scanning, scan configurations (crawl depth, accessibility standards), audit results, and feature interactions.',
      },
      {
        subtitle: 'Payment Information',
        text: 'Payment processing is handled by LemonSqueezy. We do not store your credit card details. We receive confirmation of payment, the plan purchased, and the amount charged.',
      },
      {
        subtitle: 'Technical Data',
        text: 'We automatically collect IP address, browser type, operating system, referring URLs, and pages visited to maintain security and improve performance.',
      },
    ],
  },
  {
    title: '2. How We Use Your Information',
    content: [
      {
        subtitle: 'Providing the Service',
        text: 'We use your data to run accessibility audits, generate reports, display results in your dashboard, and process payments and credit balances.',
      },
      {
        subtitle: 'Communication',
        text: 'We may send transactional emails (audit completion, payment receipts) and, with your consent, product updates or tips. You can unsubscribe from marketing emails at any time.',
      },
      {
        subtitle: 'Security & Fraud Prevention',
        text: 'We analyse usage patterns to detect abuse, protect against SSRF and other security threats, and enforce our rate limits and acceptable use policy.',
      },
      {
        subtitle: 'Product Improvement',
        text: 'Aggregated, anonymised usage data helps us understand which features are valuable and guide our product roadmap.',
      },
    ],
  },
  {
    title: '3. Data Sharing',
    content: [
      {
        subtitle: 'We Do Not Sell Your Data',
        text: 'We never sell, rent, or trade your personal information or audit data to third parties for their marketing purposes.',
      },
      {
        subtitle: 'Service Providers',
        text: 'We share data with trusted vendors who help us operate the service: Supabase (database & auth), Anthropic (AI processing of violation descriptions), LemonSqueezy (payments), and Vercel (hosting). Each is contractually bound to protect your data.',
      },
      {
        subtitle: 'Legal Requirements',
        text: 'We may disclose information if required by law, court order, or government authority, or when necessary to protect the rights and safety of AuditFlow or its users.',
      },
    ],
  },
  {
    title: '4. Data Retention',
    content: [
      {
        subtitle: 'Audit Data',
        text: 'Your audits and violation reports are retained as long as your account is active. You can delete individual audits at any time from the dashboard, which permanently removes them from our systems.',
      },
      {
        subtitle: 'Account Data',
        text: 'If you delete your account, we remove your personal information within 30 days, except where we are required to retain it for legal or financial compliance purposes (e.g., payment records for up to 7 years).',
      },
    ],
  },
  {
    title: '5. Cookies & Tracking',
    content: [
      {
        subtitle: 'Essential Cookies',
        text: 'We use cookies strictly necessary for authentication (Supabase session tokens) and security (CSRF protection). These cannot be disabled without breaking the service.',
      },
      {
        subtitle: 'No Third-Party Trackers',
        text: 'We do not use advertising trackers, third-party analytics cookies, or social media pixels. We may use self-hosted, privacy-friendly analytics to measure page views.',
      },
    ],
  },
  {
    title: '6. Security',
    content: [
      {
        subtitle: 'Technical Safeguards',
        text: 'All data is transmitted over HTTPS/TLS. Our backend enforces JWT authentication, rate limiting, and SSRF protection. Supabase Row Level Security ensures users can only access their own data.',
      },
      {
        subtitle: 'Responsible Disclosure',
        text: 'If you discover a security vulnerability, please report it to security@auditflow.io. We ask that you give us reasonable time to address issues before public disclosure.',
      },
    ],
  },
  {
    title: '7. Your Rights',
    content: [
      {
        subtitle: 'Access & Portability',
        text: 'You can view and download all your audit data directly from the dashboard. You may also request a full export of your account data by contacting us.',
      },
      {
        subtitle: 'Correction & Deletion',
        text: 'You can update your profile and email in Settings → Account. You can delete your account and all associated data from the Danger Zone section of Account settings.',
      },
      {
        subtitle: 'GDPR & CCPA',
        text: 'If you are located in the EU, UK, or California, you have additional rights including the right to object to processing, restrict processing, and lodge a complaint with a supervisory authority. Contact us at privacy@auditflow.io to exercise these rights.',
      },
    ],
  },
  {
    title: '8. Children\'s Privacy',
    content: [
      {
        subtitle: '',
        text: 'AuditFlow is intended for businesses and professional users. We do not knowingly collect personal information from anyone under the age of 16. If you believe a minor has provided us with personal data, please contact us and we will promptly delete it.',
      },
    ],
  },
  {
    title: '9. Changes to This Policy',
    content: [
      {
        subtitle: '',
        text: 'We may update this Privacy Policy from time to time. We will notify you of material changes via email or an in-app notice at least 14 days before they take effect. The "Last updated" date at the top of this page reflects the most recent revision. Continued use of AuditFlow after changes take effect constitutes acceptance of the updated policy.',
      },
    ],
  },
  {
    title: '10. Contact Us',
    content: [
      {
        subtitle: '',
        text: 'If you have questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us at privacy@auditflow.io. We aim to respond within 5 business days.',
      },
    ],
  },
]

export function Privacy() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <Navbar />

      {/* Hero */}
      <div className="border-b border-gray-100 bg-gray-50/60 pt-24 pb-12">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
            Legal
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-400">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 py-14">
        {/* Intro */}
        <p className="text-base text-gray-600 leading-relaxed mb-12">
          AuditFlow ("we", "our", or "us") is committed to protecting your privacy. This Privacy
          Policy explains what information we collect when you use AuditFlow, how we use it, and
          the choices you have. By using our service you agree to the practices described here.
        </p>

        {/* Sections */}
        <div className="space-y-12">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-xl font-bold text-gray-900 mb-5">{section.title}</h2>
              <div className="space-y-5">
                {section.content.map((item, i) => (
                  <div key={i}>
                    {item.subtitle && (
                      <h3 className="text-sm font-semibold text-gray-800 mb-1">{item.subtitle}</h3>
                    )}
                    <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-14 rounded-2xl border border-indigo-100 bg-indigo-50/60 px-6 py-5">
          <p className="text-sm text-indigo-700">
            Questions about this policy?{' '}
            <a href="mailto:privacy@auditflow.io" className="font-semibold underline underline-offset-2 hover:text-indigo-900 transition-colors">
              privacy@auditflow.io
            </a>
            {' '}— we're happy to help.
          </p>
        </div>

        {/* Nav links */}
        <div className="mt-8 flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-[#4F46E5] hover:text-[#4338CA] transition-colors">
            ← Back to Home
          </Link>
          <Link to="/terms" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Terms of Service →
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
