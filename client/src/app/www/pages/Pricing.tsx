import { Link, useNavigate } from 'react-router'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { useState } from 'react'

/* ------------------------------------------------------------------ */
/*  Plan data                                                           */
/* ------------------------------------------------------------------ */

interface Plan {
  id: string
  name: string
  tagline: string
  monthlyUsd: number | null
  annualUsd: number | null
  highlight: boolean
  badge?: string
  features: string[]
  cta: string
}

const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'For a single clinic getting its digital footing.',
    monthlyUsd: 59,
    annualUsd: 49,
    highlight: false,
    features: [
      'Core CMS — pages, hero, services',
      'Team & doctor profiles',
      'Enquiry inbox',
      'Hero image manager',
      'Basic SEO (per-page meta, Open Graph)',
      '1 admin user',
      '1 clinic location',
      'Email support',
    ],
    cta: 'Start with Starter',
  },
  {
    id: 'clinic',
    name: 'Clinic',
    tagline: 'The full platform for established clinic teams.',
    monthlyUsd: 129,
    annualUsd: 109,
    highlight: true,
    badge: 'Most popular',
    features: [
      'Everything in Starter',
      'Clinical cases & before/after gallery',
      'Pricing manager',
      'International patient module',
      'Testimonials manager',
      'Full SEO suite — keywords, redirects, Lighthouse',
      'SEO page rankings (SERPbear)',
      'Up to 3 clinic branches',
      '5 admin users',
      'Priority support',
    ],
    cta: 'Get Clinic',
  },
  {
    id: 'network',
    name: 'Network',
    tagline: 'For regional groups managing multiple brands.',
    monthlyUsd: null,
    annualUsd: null,
    highlight: false,
    features: [
      'Everything in Clinic',
      'Unlimited branches',
      'Unlimited admin users',
      'Multi-language content',
      'White-label dashboard',
      'Custom domain setup',
      'Onboarding & migration support',
      'Dedicated account contact',
    ],
    cta: 'Talk to us',
  },
]

const FAQ = [
  {
    q: 'How quickly is the dashboard ready?',
    a: "Within 24 hours of subscribing. We configure your workspace, connect your domain, and hand you the keys. You'll have a working dashboard the next morning.",
  },
  {
    q: 'Does it work with my existing website?',
    a: "Yes — if your site is hosted on a supported stack (Next.js, Vercel). If you need a new site built, we can quote that separately. The CMS is designed to connect to your frontend.",
  },
  {
    q: 'What happens if I need to cancel?',
    a: 'Month-to-month plans can be cancelled at any time. Annual plans are refunded on a pro-rated basis in the first 30 days.',
  },
  {
    q: 'Can I change plans later?',
    a: "Absolutely. Upgrades take effect immediately. Downgrades take effect at the next billing cycle. No awkward conversations required.",
  },
  {
    q: 'Is training included?',
    a: 'Starter and Clinic come with written documentation and video walkthroughs. Network clients get a live onboarding session with a member of our team.',
  },
]

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */

export function Pricing() {
  const [annual, setAnnual] = useState(true)
  const navigate = useNavigate()

  function handleSelect(plan: Plan) {
    if (plan.monthlyUsd === null) {
      window.location.href = 'mailto:hello@serviettelabs.com?subject=Network plan enquiry'
      return
    }
    navigate(`/pay?plan=${plan.id}&billing=${annual ? 'annual' : 'monthly'}`)
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="pt-28 pb-16 text-center px-6">
        <p className="text-xs font-semibold tracking-widest text-violet-600 uppercase mb-3">
          Pricing
        </p>
        <h1 className="text-4xl font-bold text-gray-900 max-w-lg mx-auto leading-tight">
          Straightforward pricing, nothing buried
        </h1>
        <p className="mt-4 text-gray-500 text-sm max-w-sm mx-auto">
          Pick the plan that fits your clinic size. Switch anytime.
        </p>

        {/* Billing toggle */}
        <div className="mt-8 inline-flex items-center gap-3 rounded-xl bg-gray-100 p-1">
          <button
            onClick={() => setAnnual(false)}
            className={`rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
              !annual ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`rounded-lg px-5 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 ${
              annual ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Annual
            <span className="rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold px-1.5 py-0.5">
              −15%
            </span>
          </button>
        </div>
      </div>

      {/* Plans */}
      <div className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl border p-8 relative ${
                plan.highlight
                  ? 'border-violet-500 bg-violet-600 text-white shadow-xl shadow-violet-200'
                  : 'border-gray-200 bg-white text-gray-900'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-violet-500 border-2 border-white text-white text-[11px] font-bold px-3 py-0.5">
                    {plan.badge}
                  </span>
                </div>
              )}

              <h2
                className={`text-lg font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}
              >
                {plan.name}
              </h2>
              <p
                className={`text-sm mb-6 ${plan.highlight ? 'text-white/70' : 'text-gray-500'}`}
              >
                {plan.tagline}
              </p>

              {/* Price */}
              <div className="mb-8">
                {plan.monthlyUsd !== null ? (
                  <div className="flex items-end gap-1">
                    <span
                      className={`text-4xl font-extrabold tracking-tight ${plan.highlight ? 'text-white' : 'text-gray-900'}`}
                    >
                      ${annual ? plan.annualUsd : plan.monthlyUsd}
                    </span>
                    <span
                      className={`text-sm mb-1.5 ${plan.highlight ? 'text-white/60' : 'text-gray-400'}`}
                    >
                      /mo{annual && ', billed annually'}
                    </span>
                  </div>
                ) : (
                  <div className="text-4xl font-extrabold tracking-tight text-gray-900">
                    Custom
                  </div>
                )}
              </div>

              {/* CTA */}
              <button
                onClick={() => handleSelect(plan)}
                className={`w-full rounded-xl py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 mb-8 ${
                  plan.highlight
                    ? 'bg-white text-violet-700 hover:bg-violet-50'
                    : 'bg-violet-600 text-white hover:bg-violet-700'
                }`}
              >
                {plan.cta}
                <ArrowRight className="h-4 w-4" />
              </button>

              {/* Features */}
              <ul className="space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2
                      className={`h-4 w-4 shrink-0 mt-0.5 ${plan.highlight ? 'text-violet-200' : 'text-violet-500'}`}
                    />
                    <span className={plan.highlight ? 'text-white/80' : 'text-gray-600'}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust line */}
        <p className="text-center text-sm text-gray-400 mt-10">
          All plans include SSL, uptime monitoring, and regular platform updates.
          No setup fees.
        </p>
      </div>

      {/* FAQ */}
      <div className="bg-gray-50 border-t border-gray-100 py-24">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            Common questions
          </h2>
          <div className="space-y-8">
            {FAQ.map(({ q, a }) => (
              <div key={q}>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{q}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              Still have questions?{' '}
              <a
                href="mailto:hello@serviettelabs.com"
                className="text-violet-600 font-medium hover:text-violet-700"
              >
                Email us directly
              </a>{' '}
              — we usually respond same day.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
