import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

const FAQS = [
  {
    q: 'What counts as one scan?',
    a: 'One scan audits one starting URL and crawls up to your plan\'s page limit. Every linked page within that limit gets checked for WCAG issues. When the scan finishes, that\'s one credit used — regardless of how many issues we found.',
  },
  {
    q: 'What happens when I run out of scans?',
    a: 'Your account stays active but you can\'t run new scans until you upgrade or your plan renews. We don\'t do automatic top-ups or overage charges.',
  },
  {
    q: 'Can I change tiers?',
    a: 'Yes — upgrade or downgrade anytime. If you upgrade, new scans are available immediately. We don\'t prorate downgrades; your current tier stays active until the end of your billing period.',
  },
  {
    q: 'Is there a free trial?',
    a: 'The Free tier is your trial. 3 full scans, no time limit, no credit card. If you need more to evaluate, email us.',
  },
  {
    q: 'What does "pages per scan" mean?',
    a: 'It\'s the crawl depth limit. Starter scans up to 10 pages from your starting URL. Pro scans up to 30. Enterprise has no limit. This keeps costs predictable — you know exactly what you\'re paying for.',
  },
  {
    q: 'Do scans expire?',
    a: 'No. Monthly plans refill on your billing date. If you have unused scans, they don\'t roll over.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We process payments through LemonSqueezy. All major cards accepted. No invoicing or custom contracts on lower tiers — Enterprise teams can email us if they need something different.',
  },
  {
    q: 'Can I use this for client work?',
    a: 'Absolutely. Consultants and agencies are our main users. Run scans for as many clients as you want. Just note that scans are tied to your account, not per-client.',
  },
  {
    q: 'What accessibility standards do you check against?',
    a: 'WCAG 2.1 AA by default. We flag issues with clear severity ratings and remediation guidance — not just pass/fail dumps.',
  },
  {
    q: 'I have a question not covered here.',
    a: 'Email support@auditflow.me. I read every message and usually respond within a day.',
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (i: number) => setOpenIndex(prev => (prev === i ? null : i))

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-20">
        {/* Hero */}
        <div className="mx-auto max-w-[700px] px-6 pt-20 pb-16 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">FAQ</h1>
          <p className="text-base text-gray-500 leading-relaxed">
            Answers to the questions we get most. If yours isn't here, email{' '}
            <a href="mailto:support@auditflow.me" className="text-[#4F46E5] hover:underline">
              support@auditflow.me
            </a>
            .
          </p>
        </div>

        {/* Accordion */}
        <div className="mx-auto max-w-[700px] px-6 pb-24">
          <div className="divide-y divide-gray-100 border-t border-gray-100">
            {FAQS.map((faq, i) => (
              <div key={i}>
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  className="flex w-full items-center justify-between gap-6 py-5 text-left cursor-pointer group"
                >
                  <span className={`text-base font-medium transition-colors ${openIndex === i ? 'text-[#4F46E5]' : 'text-gray-900 group-hover:text-gray-700'}`}>
                    {faq.q}
                  </span>
                  {openIndex === i
                    ? <ChevronUp className="h-4 w-4 text-[#4F46E5] shrink-0" />
                    : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0 group-hover:text-gray-600" />
                  }
                </button>
                {openIndex === i && (
                  <p className="pb-5 text-sm text-gray-600 leading-relaxed">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="border-t border-gray-100 py-16 text-center">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 text-base font-medium text-[#4F46E5] hover:text-[#4338CA] transition-colors"
          >
            Start with 3 free scans →
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
