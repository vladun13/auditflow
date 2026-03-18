import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function CtaBanner() {
  return (
    <section className="bg-[#4F46E5] py-20">
      <div className="container mx-auto px-6 text-center">
        <h2 className="mb-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Ready to audit your site?
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-base text-indigo-200">
          Scan your first website in under 60 seconds. No credit card required to start.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/signup">
            <Button className="rounded-full bg-white px-6 text-sm font-semibold text-[#4F46E5] hover:bg-indigo-50 transition-colors">
              Start Free Trial
            </Button>
          </Link>
          <Link to="/pricing">
            <Button
              variant="outline"
              className="rounded-full border-indigo-400 bg-transparent px-6 text-sm font-semibold text-white hover:bg-indigo-600 hover:border-indigo-600 transition-colors"
            >
              View Pricing
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
