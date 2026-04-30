import { Link } from 'react-router'
import {
  FileText,
  Users,
  Search,
  Inbox,
  BarChart2,
  Globe,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Feature data                                                        */
/* ------------------------------------------------------------------ */

const FEATURES = [
  {
    icon: FileText,
    title: 'Every page, under your control',
    body: 'Edit hero images, services, about pages, and clinical content without touching code or emailing a developer.',
  },
  {
    icon: Users,
    title: 'Team & doctor profiles',
    body: "Your doctors' credentials, photos, and specialties — managed from a clean list. New hire? Live in two minutes.",
  },
  {
    icon: Search,
    title: 'SEO that actually ships',
    body: 'Per-page meta, Open Graph, canonical URLs, 301 redirects, keyword tracking, and a Lighthouse audit in one tab.',
  },
  {
    icon: Inbox,
    title: 'Enquiry inbox',
    body: 'Contact form submissions land here — with the patient name, treatment interest, branch, and preferred date already parsed out.',
  },
  {
    icon: BarChart2,
    title: 'Clinical cases & before/after',
    body: 'Publish case studies with before/after images, procedures, and results. Patients do their homework — give them something worth reading.',
  },
  {
    icon: Globe,
    title: 'International patient module',
    body: 'Cost comparisons, travel FAQ, and dedicated international enquiry flows built in. No custom development required.',
  },
]

const CHECKLIST = [
  'No hosting contracts to sign',
  'Your domain, your brand',
  'Set up in an afternoon',
  'We handle deployments',
]

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */

export function Home() {
  return (
    <div>
      {/* ---- Hero ---- */}
      <section className="relative bg-[#0d0920] min-h-[92vh] flex items-center overflow-hidden">
        {/* Background grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(#a78bfa 1px, transparent 1px), linear-gradient(90deg, #a78bfa 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Glow */}
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-violet-700 opacity-20 blur-[120px]" />

        <div className="relative mx-auto max-w-6xl px-6 py-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-300 mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            Purpose-built for clinics and dental groups
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight max-w-3xl mx-auto">
            Your clinic website,{' '}
            <span className="text-violet-400">finally manageable</span>
          </h1>

          <p className="mt-6 text-lg text-white/60 max-w-xl mx-auto leading-relaxed">
            Serviette Labs gives clinic groups a proper CMS — one that understands doctors,
            treatments, branches, and patients. Not a generic blog tool.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/pricing"
              className="w-full sm:w-auto rounded-xl bg-violet-600 px-7 py-3.5 text-sm font-semibold text-white hover:bg-violet-500 transition-colors"
            >
              View pricing
            </Link>
            <a
              href="mailto:hello@serviettelabs.com"
              className="w-full sm:w-auto rounded-xl border border-white/20 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              Talk to us <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* Mini checklist */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {CHECKLIST.map((item) => (
              <span key={item} className="flex items-center gap-1.5 text-xs text-white/50">
                <CheckCircle2 className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Features ---- */}
      <section id="features" className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold tracking-widest text-violet-600 uppercase mb-3">
              What's included
            </p>
            <h2 className="text-3xl font-bold text-gray-900">
              Every feature you'll actually use
            </h2>
            <p className="mt-3 text-gray-500 max-w-md mx-auto text-sm leading-relaxed">
              We built this for the exact pain points clinic marketing teams run into — not for
              a generic content creator in San Francisco.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-gray-100 bg-gray-50 p-6 hover:border-violet-200 hover:bg-violet-50/30 transition-colors"
              >
                <div className="h-9 w-9 rounded-xl bg-violet-100 flex items-center justify-center mb-4">
                  <Icon className="h-4.5 w-4.5 text-violet-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1.5">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Why not WordPress ---- */}
      <section className="bg-gray-50 py-24 border-y border-gray-100">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-semibold tracking-widest text-violet-600 uppercase mb-3">
                The honest pitch
              </p>
              <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                Generic CMS tools make your team do workarounds
              </h2>
              <p className="mt-4 text-gray-500 text-sm leading-relaxed">
                WordPress plugins don't know what a "clinical case" is. Webflow doesn't have an
                enquiry inbox. Squarespace won't run a Lighthouse audit. You end up stitching
                together five tools and still can't update the doctor list without calling someone.
              </p>
              <p className="mt-3 text-gray-500 text-sm leading-relaxed">
                Serviette Labs is a single dashboard for your entire clinic web presence — pages,
                team, services, SEO, patient enquiries, and more.
              </p>
              <div className="mt-8">
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
                >
                  See pricing <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Comparison table */}
            <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
              <div className="grid grid-cols-3 text-xs font-semibold text-gray-500 px-5 py-3 border-b border-gray-100 bg-gray-50">
                <span>Feature</span>
                <span className="text-center">Generic CMS</span>
                <span className="text-center text-violet-600">Serviette</span>
              </div>
              {[
                ['Doctor profiles', false, true],
                ['Clinical case gallery', false, true],
                ['Patient enquiry inbox', false, true],
                ['International patient module', false, true],
                ['SEO + keyword tracking', 'plugin', true],
                ['Lighthouse audits', false, true],
                ['Branch management', false, true],
                ['Pricing manager', false, true],
              ].map(([label, generic, serviette]) => (
                <div
                  key={String(label)}
                  className="grid grid-cols-3 px-5 py-3 border-b border-gray-50 text-sm items-center"
                >
                  <span className="text-gray-700">{String(label)}</span>
                  <span className="text-center">
                    {generic === false ? (
                      <span className="text-red-400">✗</span>
                    ) : (
                      <span className="text-amber-500 text-xs">{String(generic)}</span>
                    )}
                  </span>
                  <span className="text-center text-violet-600 font-medium">
                    {serviette ? '✓' : '✗'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Ready to get started?</h2>
          <p className="mt-3 text-gray-500 text-sm max-w-sm mx-auto">
            Pick a plan and your dashboard is ready within 24 hours.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/pricing"
              className="rounded-xl bg-violet-600 px-8 py-3.5 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
            >
              See pricing
            </Link>
            <a
              href="mailto:hello@serviettelabs.com"
              className="rounded-xl border border-gray-200 px-8 py-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Contact us first
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
