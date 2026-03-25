import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { queryClient } from '@/lib/query-client'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Textarea } from '@/app/components/ui/textarea'
import {
  CheckCircle2,
  Circle,
  Loader2,
  RefreshCw,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Wifi,
} from 'lucide-react'
import { toast } from 'sonner'

interface Step {
  key: string
  label: string
  description: string
  status: 'complete' | 'pending'
  notes: string | null
  completedAt: string | null
  auto: boolean
}

interface OnboardingData {
  steps: Step[]
  progress: { completed: number; total: number }
}

interface Props {
  tenantId: number
  cmsDomain?: string | null
}

function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text).then(() => toast.success(`${label} copied`))
}

export function TenantOnboarding({ tenantId, cmsDomain }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})

  const { data, isLoading } = useQuery<OnboardingData>({
    queryKey: ['platform', 'onboarding', tenantId],
    queryFn: () => api(`/api/platform/tenants/${tenantId}/onboarding`).then((r: any) => r),
    refetchInterval: 30_000,
  })

  const completeMutation = useMutation({
    mutationFn: ({ step, note }: { step: string; note: string }) =>
      api(`/api/platform/tenants/${tenantId}/onboarding/${step}/complete`, {
        method: 'POST',
        body: JSON.stringify({ notes: note }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform', 'onboarding', tenantId] })
      toast.success('Step marked complete')
    },
  })

  const resetMutation = useMutation({
    mutationFn: (step: string) =>
      api(`/api/platform/tenants/${tenantId}/onboarding/${step}/reset`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform', 'onboarding', tenantId] })
      toast.success('Step reset')
    },
  })

  const dnsMutation = useMutation({
    mutationFn: () =>
      api(`/api/platform/tenants/${tenantId}/onboarding/check-dns`, { method: 'POST' }),
    onSuccess: (r: any) => {
      queryClient.invalidateQueries({ queryKey: ['platform', 'onboarding', tenantId] })
      if (r.resolved) toast.success(`DNS resolved ✓ ${r.addresses?.[0] || ''}`)
      else toast.error('DNS not resolving yet — check CNAME record')
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  const steps = data?.steps || []
  const { completed = 0, total = 0 } = data?.progress || {}
  const pct = total ? Math.round((completed / total) * 100) : 0

  // Derive hostname for DNS instructions
  let hostname = cmsDomain || ''
  try { if (hostname.startsWith('http')) hostname = new URL(hostname).hostname } catch {}

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Onboarding Progress</h3>
            <p className="text-sm text-gray-500">{completed} of {total} steps complete</p>
          </div>
          <span className={`text-2xl font-bold ${pct === 100 ? 'text-green-600' : 'text-blue-600'}`}>
            {pct}%
          </span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-gray-100">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${pct === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {pct === 100 && (
          <p className="mt-3 text-sm font-medium text-green-600">
            🎉 Onboarding complete — client is live!
          </p>
        )}
      </div>

      {/* DNS quick reference */}
      {hostname && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
          <h4 className="mb-3 text-sm font-semibold text-blue-900">CNAME Record to Send Client</h4>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Type', value: 'CNAME' },
              { label: 'Name', value: hostname.split('.')[0] },
              { label: 'Value', value: 'your-cms-platform.onrender.com' },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg border border-blue-200 bg-white p-3">
                <p className="mb-1 text-xs font-medium text-blue-600">{label}</p>
                <div className="flex items-center justify-between gap-2">
                  <code className="truncate text-sm text-gray-800">{value}</code>
                  <button
                    onClick={() => copyToClipboard(value, label)}
                    className="shrink-0 text-gray-400 hover:text-blue-600"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step, i) => {
          const isOpen = expanded === step.key
          const isDone = step.status === 'complete'

          return (
            <div
              key={step.key}
              className={`rounded-xl border transition-all ${
                isDone ? 'border-green-200 bg-green-50/50' : 'border-gray-200 bg-white'
              }`}
            >
              <button
                className="flex w-full items-center gap-4 px-5 py-4 text-left"
                onClick={() => setExpanded(isOpen ? null : step.key)}
              >
                {/* Step number / check */}
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  isDone ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {isDone ? <CheckCircle2 className="h-4 w-4" /> : <span>{i + 1}</span>}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${isDone ? 'text-green-800' : 'text-gray-900'}`}>
                      {step.label}
                    </span>
                    {step.auto && isDone && (
                      <Badge variant="outline" className="border-green-300 text-xs text-green-700">
                        Auto-detected
                      </Badge>
                    )}
                    {!step.auto && isDone && (
                      <Badge variant="outline" className="border-blue-300 text-xs text-blue-700">
                        Manual
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>

                <div className="flex items-center gap-3">
                  {isDone && step.completedAt && (
                    <span className="hidden text-xs text-gray-400 sm:block">
                      {new Date(step.completedAt).toLocaleDateString()}
                    </span>
                  )}
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Expanded content */}
              {isOpen && (
                <div className="border-t border-gray-100 px-5 py-4">
                  {/* DNS check step */}
                  {step.key === 'dns_verified' && (
                    <div className="mb-4 flex items-center gap-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => dnsMutation.mutate()}
                        disabled={dnsMutation.isPending}
                      >
                        {dnsMutation.isPending ? (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Wifi className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        Check DNS Now
                      </Button>
                      {!hostname && (
                        <p className="text-xs text-amber-600">Set the CMS domain first in the Branding tab</p>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  {step.notes && (
                    <div className="mb-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
                      {step.notes}
                    </div>
                  )}

                  {/* Manual complete for non-auto steps */}
                  {!step.auto && !isDone && (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Add a note (optional)..."
                        className="h-16 text-sm"
                        value={notes[step.key] || ''}
                        onChange={(e) => setNotes((n) => ({ ...n, [step.key]: e.target.value }))}
                      />
                      <Button
                        size="sm"
                        onClick={() => completeMutation.mutate({ step: step.key, note: notes[step.key] || '' })}
                        disabled={completeMutation.isPending}
                      >
                        {completeMutation.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                        Mark as Complete
                      </Button>
                    </div>
                  )}

                  {/* Reset option for completed manual steps */}
                  {!step.auto && isDone && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-500 hover:text-red-600"
                      onClick={() => resetMutation.mutate(step.key)}
                      disabled={resetMutation.isPending}
                    >
                      <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                      Reset Step
                    </Button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
