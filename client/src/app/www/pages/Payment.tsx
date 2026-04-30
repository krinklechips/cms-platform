/**
 * Payment page — MPGS Hosted Session integration
 *
 * DEVELOPER INTEGRATION NOTES:
 * ─────────────────────────────────────────────────────────────────────
 * This page uses Mastercard Payment Gateway Services (MPGS) Hosted Session.
 *
 * Flow:
 *   1. On mount → POST /api/payment/create-session  (your server calls MPGS
 *      to create a session and returns { sessionId, merchantId, apiVersion })
 *   2. Load the MPGS JS SDK from their CDN with the merchantId in the URL
 *   3. Call PaymentSession.configure({ fields: { card: { ... } } }) to attach
 *      hosted card input fields to the placeholder <div>s below
 *   4. On form submit → call PaymentSession.updateSessionFromForm('card')
 *      then POST the captured sessionId to /api/payment/charge
 *   5. Handle success / failure and redirect accordingly
 *
 * Card field placeholders: #mpgs-number, #mpgs-expiry, #mpgs-cvv
 * ─────────────────────────────────────────────────────────────────────
 */

import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router'
import { ShieldCheck, Lock, ChevronLeft, CheckCircle2 } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Plan lookup                                                         */
/* ------------------------------------------------------------------ */

interface PlanInfo {
  name: string
  description: string
  amount: number // USD cents
  billingLabel: string
}

const PLAN_MAP: Record<string, Record<string, PlanInfo>> = {
  starter: {
    monthly: { name: 'Starter', description: '1 location · 1 user', amount: 5900, billingLabel: '/month' },
    annual:  { name: 'Starter', description: '1 location · 1 user', amount: 58800, billingLabel: '/year' },
  },
  clinic: {
    monthly: { name: 'Clinic', description: 'Up to 3 branches · 5 users', amount: 12900, billingLabel: '/month' },
    annual:  { name: 'Clinic', description: 'Up to 3 branches · 5 users', amount: 130800, billingLabel: '/year' },
  },
}

function resolvePlan(plan: string, billing: string): PlanInfo {
  const b = billing === 'annual' ? 'annual' : 'monthly'
  return (
    PLAN_MAP[plan]?.[b] ?? {
      name: 'Serviette Labs',
      description: 'Subscription',
      amount: 0,
      billingLabel: '',
    }
  )
}

function formatUsd(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

/* ------------------------------------------------------------------ */
/*  State types                                                         */
/* ------------------------------------------------------------------ */

type Status = 'idle' | 'loading-session' | 'ready' | 'processing' | 'success' | 'error'

interface BillingForm {
  name: string
  email: string
  company: string
}

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */

export function Payment() {
  const [params] = useSearchParams()
  const plan = params.get('plan') ?? 'clinic'
  const billing = params.get('billing') ?? 'annual'
  const planInfo = resolvePlan(plan, billing)

  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<BillingForm>({ name: '', email: '', company: '' })

  /* ---- MPGS session init ----------------------------------------- */
  useEffect(() => {
    // TODO (developer): uncomment and wire up MPGS session creation
    //
    // async function initSession() {
    //   setStatus('loading-session')
    //   try {
    //     const res = await fetch('/api/payment/create-session', {
    //       method: 'POST',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify({ plan, billing, amountCents: planInfo.amount }),
    //     })
    //     const { sessionId, merchantId, apiVersion } = await res.json()
    //
    //     // Load the MPGS Hosted Session JS SDK dynamically
    //     const script = document.createElement('script')
    //     script.src = `https://ap-gateway.mastercard.com/form/version/${apiVersion}/merchant/${merchantId}/session.js`
    //     script.onload = () => {
    //       window.PaymentSession.configure({
    //         session: sessionId,
    //         fields: {
    //           card: {
    //             number: '#mpgs-number',
    //             securityCode: '#mpgs-cvv',
    //             expiryMonth: '#mpgs-expiry-month',
    //             expiryYear: '#mpgs-expiry-year',
    //           },
    //         },
    //         frameEmbeddingMitigation: ['javascript'],
    //         callbacks: {
    //           initialized: () => setStatus('ready'),
    //           formSessionUpdate: handleFormSessionUpdate,
    //         },
    //         interaction: {
    //           displayControl: { formatCard: 'EMBOSSED', invalidFieldCharacters: 'REJECT' },
    //         },
    //       })
    //     }
    //     document.head.appendChild(script)
    //   } catch (err) {
    //     setError('Could not initialise payment session. Please try again.')
    //     setStatus('error')
    //   }
    // }
    // initSession()

    // PLACEHOLDER: remove when MPGS is integrated
    setStatus('ready')
  }, [])

  /* ---- MPGS session update callback ------------------------------ */
  // TODO (developer): implement this callback
  // function handleFormSessionUpdate(response: any) {
  //   if (response.status === 'ok') {
  //     chargeSession(response.session.id)
  //   } else {
  //     setError('Card details could not be verified. Please check and try again.')
  //     setStatus('ready')
  //   }
  // }

  /* ---- Charge the session ---------------------------------------- */
  // TODO (developer): implement server-side charge
  // async function chargeSession(sessionId: string) {
  //   setStatus('processing')
  //   try {
  //     const res = await fetch('/api/payment/charge', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ sessionId, plan, billing, ...form }),
  //     })
  //     if (!res.ok) throw new Error(await res.text())
  //     setStatus('success')
  //   } catch (err: any) {
  //     setError(err.message ?? 'Payment failed. Please try again.')
  //     setStatus('ready')
  //   }
  // }

  /* ---- Submit ---------------------------------------------------- */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) return

    // TODO (developer): replace with:
    // window.PaymentSession.updateSessionFromForm('card')
    // (which triggers handleFormSessionUpdate above)

    // PLACEHOLDER simulation
    setStatus('processing')
    setTimeout(() => setStatus('success'), 1800)
  }

  /* ---- Success screen -------------------------------------------- */
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment received</h1>
          <p className="text-sm text-gray-500 mb-6">
            Thanks, {form.name.split(' ')[0]}. We'll have your dashboard ready within 24 hours.
            Check your inbox at <span className="font-medium">{form.email}</span> for next steps.
          </p>
          <a
            href="mailto:hello@serviettelabs.com"
            className="text-sm text-violet-600 hover:text-violet-700 font-medium"
          >
            Questions? Email us →
          </a>
        </div>
      </div>
    )
  }

  /* ---- Main layout ----------------------------------------------- */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal nav */}
      <div className="bg-white border-b border-gray-100 h-16 flex items-center px-6">
        <Link
          to="/pricing"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to pricing
        </Link>
        <div className="flex items-center gap-2 mx-auto">
          <div className="h-6 w-6 rounded-md bg-violet-600 flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">SL</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">Serviette Labs</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Lock className="h-3.5 w-3.5" />
          Secure checkout
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Billing details */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">Billing details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Full name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Dr. Sarah Chen"
                      className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Email address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="sarah@example.com"
                      className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Clinic / company name
                    </label>
                    <input
                      type="text"
                      value={form.company}
                      onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                      placeholder="Smile Clinic Group"
                      className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Card details — MPGS hosted fields */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-gray-900">Card details</h2>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                    Encrypted
                  </div>
                </div>

                {status === 'loading-session' && (
                  <div className="h-32 flex items-center justify-center">
                    <div className="h-4 w-4 rounded-full border-2 border-violet-300 border-t-violet-600 animate-spin" />
                  </div>
                )}

                {(status === 'ready' || status === 'processing') && (
                  <div className="space-y-4">
                    {/*
                      MPGS will inject the hosted card number field here.
                      When integrated, PaymentSession.configure() targets #mpgs-number.
                      Until then, this renders a native input for UI testing.
                    */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        Card number
                      </label>
                      {/* TODO (developer): remove native input; MPGS injects here */}
                      <div
                        id="mpgs-number"
                        className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-400 bg-gray-50 h-10 flex items-center"
                      >
                        <input
                          type="text"
                          placeholder="4111 1111 1111 1111"
                          maxLength={19}
                          className="w-full bg-transparent focus:outline-none text-sm placeholder:text-gray-300"
                          readOnly={status === 'processing'}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                          Expiry
                        </label>
                        {/* TODO (developer): MPGS targets #mpgs-expiry-month and #mpgs-expiry-year separately */}
                        <div
                          id="mpgs-expiry"
                          className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 h-10 flex items-center"
                        >
                          <input
                            type="text"
                            placeholder="MM / YY"
                            maxLength={7}
                            className="w-full bg-transparent focus:outline-none text-sm placeholder:text-gray-300"
                            readOnly={status === 'processing'}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                          CVV
                        </label>
                        {/* TODO (developer): MPGS targets #mpgs-cvv */}
                        <div
                          id="mpgs-cvv"
                          className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 h-10 flex items-center"
                        >
                          <input
                            type="password"
                            placeholder="•••"
                            maxLength={4}
                            className="w-full bg-transparent focus:outline-none text-sm placeholder:text-gray-300"
                            readOnly={status === 'processing'}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mt-4 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={status === 'processing' || status === 'loading-session'}
                className="w-full rounded-xl bg-violet-600 py-4 text-sm font-semibold text-white hover:bg-violet-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status === 'processing' ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Pay {formatUsd(planInfo.amount)} {planInfo.billingLabel}
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-400">
                By completing payment you agree to our{' '}
                <a href="#" className="underline hover:text-gray-600">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="underline hover:text-gray-600">Privacy Policy</a>.
              </p>
            </form>
          </div>

          {/* Right: order summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Order summary</h2>

              <div className="rounded-xl bg-violet-50 border border-violet-100 p-4 mb-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{planInfo.name} plan</p>
                    <p className="text-xs text-gray-500 mt-0.5">{planInfo.description}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900 shrink-0">
                    {formatUsd(planInfo.amount)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>{formatUsd(planInfo.amount)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Tax</span>
                  <span className="text-gray-400">Calculated at invoice</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-100">
                  <span>Total due today</span>
                  <span>{formatUsd(planInfo.amount)}</span>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-gray-100 space-y-2">
                {[
                  'Dashboard ready within 24 hours',
                  'Cancel anytime',
                  'SSL included',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>

              {/* Powered by MPGS badge */}
              <div className="mt-5 pt-5 border-t border-gray-100 flex items-center gap-1.5 text-xs text-gray-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                {/* TODO (developer): replace with MPGS logo asset once integrated */}
                Secured by Mastercard Payment Gateway
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
