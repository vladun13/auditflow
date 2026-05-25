import { Link } from 'react-router-dom'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

const LAST_UPDATED = 'March 18, 2026'

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: [
      {
        subtitle: '',
        text: 'By accessing or using AuditFlow ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service. These Terms apply to all visitors, users, and others who access or use the Service.',
      },
    ],
  },
  {
    title: '2. Description of Service',
    content: [
      {
        subtitle: '',
        text: 'AuditFlow is a web-based accessibility auditing platform that crawls websites, analyses them against WCAG 2.1/2.2 guidelines, and generates reports with AI-powered fix recommendations. The Service is provided on a credit-based, pay-as-you-go basis.',
      },
    ],
  },
  {
    title: '3. Accounts',
    content: [
      {
        subtitle: 'Registration',
        text: 'You must create an account to use the Service. You agree to provide accurate, current, and complete information and to keep it up to date. You are responsible for maintaining the confidentiality of your account credentials.',
      },
      {
        subtitle: 'Account Security',
        text: 'You are responsible for all activity that occurs under your account. Notify us immediately at security@auditflow.me if you suspect any unauthorised use of your account. We are not liable for any loss resulting from unauthorised account access.',
      },
      {
        subtitle: 'Eligibility',
        text: 'You must be at least 16 years old to use the Service. By creating an account you represent that you meet this requirement and have the legal capacity to enter into these Terms.',
      },
    ],
  },
  {
    title: '4. Credits & Payments',
    content: [
      {
        subtitle: 'Credit Packs',
        text: 'The Service operates on a credit system. Each website scan consumes one credit. Credits are sold in packs (Basic, Pro, Enterprise) as described on the Pricing page. Credits do not expire and are non-transferable.',
      },
      {
        subtitle: 'Payment Processing',
        text: 'All payments are processed by LemonSqueezy. By making a purchase you agree to LemonSqueezy\'s terms and privacy policy. Prices are listed in USD and are exclusive of applicable taxes.',
      },
      {
        subtitle: 'Refunds',
        text: 'Credits that have not been used may be refunded within 14 days of purchase by contacting support@auditflow.me. Credits partially consumed are non-refundable. We reserve the right to decline refund requests in cases of suspected abuse.',
      },
      {
        subtitle: 'Free Credit',
        text: 'New accounts receive one free credit upon registration. This credit may not be converted to cash and is forfeited upon account deletion.',
      },
    ],
  },
  {
    title: '5. Acceptable Use',
    content: [
      {
        subtitle: 'Permitted Use',
        text: 'You may use the Service only for lawful purposes and in accordance with these Terms. The Service is intended to help you identify and fix accessibility issues on websites you own or are authorised to test.',
      },
      {
        subtitle: 'Prohibited Activities',
        text: 'You must not: (a) scan websites you do not own or lack authorisation to test; (b) use the Service to attack, scrape, or disrupt third-party systems; (c) attempt to reverse-engineer, decompile, or extract our source code; (d) resell or sublicense access to the Service without our written consent; (e) use automated means to create accounts or circumvent rate limits.',
      },
      {
        subtitle: 'Enforcement',
        text: 'Violation of this section may result in immediate suspension or termination of your account without refund. We cooperate with law enforcement when required.',
      },
    ],
  },
  {
    title: '6. Intellectual Property',
    content: [
      {
        subtitle: 'Our IP',
        text: 'AuditFlow and its original content, features, and functionality are owned by us and protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute our software or brand assets without express written permission.',
      },
      {
        subtitle: 'Your Content',
        text: 'You retain ownership of any data you submit to the Service (URLs, scan configurations). By using the Service you grant us a limited, non-exclusive licence to process this data solely to provide the Service to you.',
      },
      {
        subtitle: 'Audit Reports',
        text: 'Audit reports generated for your websites are yours. You may share, publish, or use them freely. We may use aggregated, anonymised statistics derived from audits (e.g., "average WCAG score across all scans") to improve the Service.',
      },
    ],
  },
  {
    title: '7. Privacy',
    content: [
      {
        subtitle: '',
        text: 'Your use of the Service is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand our practices.',
      },
    ],
  },
  {
    title: '8. Disclaimers',
    content: [
      {
        subtitle: 'No Legal Guarantee',
        text: 'AuditFlow identifies technical accessibility issues based on automated analysis. Audit results do not constitute legal advice and do not guarantee compliance with any specific law or regulation (including the ADA, EAA, or Section 508). You are responsible for ensuring your website meets applicable legal requirements.',
      },
      {
        subtitle: '"As Is" Service',
        text: 'THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY ACCURATE.',
      },
    ],
  },
  {
    title: '9. Limitation of Liability',
    content: [
      {
        subtitle: '',
        text: 'TO THE MAXIMUM EXTENT PERMITTED BY LAW, AUDITFLOW AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF THE SERVICE. OUR TOTAL CUMULATIVE LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM.',
      },
    ],
  },
  {
    title: '10. Indemnification',
    content: [
      {
        subtitle: '',
        text: 'You agree to defend, indemnify, and hold harmless AuditFlow and its affiliates from any claims, damages, liabilities, costs, and expenses (including reasonable legal fees) arising out of your use of the Service, your violation of these Terms, or your infringement of any third-party rights.',
      },
    ],
  },
  {
    title: '11. Termination',
    content: [
      {
        subtitle: 'By You',
        text: 'You may delete your account at any time from Settings → Account → Danger Zone. Unused credits are non-refundable upon voluntary termination unless within the 14-day refund window.',
      },
      {
        subtitle: 'By Us',
        text: 'We may suspend or terminate your account at any time if you violate these Terms, engage in fraudulent activity, or if we discontinue the Service. We will provide reasonable notice where possible.',
      },
      {
        subtitle: 'Effect of Termination',
        text: 'Upon termination, your right to use the Service ceases immediately. Sections 6, 8, 9, 10, and 13 survive termination.',
      },
    ],
  },
  {
    title: '12. Changes to Terms',
    content: [
      {
        subtitle: '',
        text: 'We may modify these Terms at any time. We will notify you of material changes via email or an in-app notice at least 14 days before they take effect. Continued use of the Service after changes take effect constitutes acceptance of the revised Terms.',
      },
    ],
  },
  {
    title: '13. Governing Law',
    content: [
      {
        subtitle: '',
        text: 'These Terms are governed by and construed in accordance with applicable law. Any disputes arising from these Terms or your use of the Service shall be resolved through binding arbitration or, where arbitration is not permitted, in the courts of competent jurisdiction. You waive any right to participate in a class-action lawsuit.',
      },
    ],
  },
  {
    title: '14. Contact',
    content: [
      {
        subtitle: '',
        text: 'For questions about these Terms, please contact us at legal@auditflow.me. We aim to respond within 5 business days.',
      },
    ],
  },
]

export function Terms() {
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
            Terms of Service
          </h1>
          <p className="text-sm text-gray-400">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 py-14">
        {/* Intro */}
        <p className="text-base text-gray-600 leading-relaxed mb-12">
          Please read these Terms of Service carefully before using AuditFlow. They govern your
          access to and use of our accessibility auditing platform and constitute a legally binding
          agreement between you and AuditFlow.
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
            Questions about these Terms?{' '}
            <a href="mailto:legal@auditflow.me" className="font-semibold underline underline-offset-2 hover:text-indigo-900 transition-colors">
              legal@auditflow.me
            </a>
            {' '}— we're happy to help.
          </p>
        </div>

        {/* Nav links */}
        <div className="mt-8 flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-[#4F46E5] hover:text-[#4338CA] transition-colors">
            ← Back to Home
          </Link>
          <Link to="/privacy" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Privacy Policy →
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
