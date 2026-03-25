import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { PageHeader } from '@/app/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Badge } from '@/app/components/ui/badge'
import { Separator } from '@/app/components/ui/separator'
import { CheckCircle2, XCircle, ExternalLink, BarChart2, Gauge } from 'lucide-react'

interface IntegrationsData {
  serpbear: { url: string; apiKey: string; configured: boolean }
  pagespeed: { apiKey: string; configured: boolean }
}

export function IntegrationSettings() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<{ ok: boolean; integrations: IntegrationsData }>({
    queryKey: ['tenant', 'integrations'],
    queryFn: () => api('/api/tenant/integrations'),
  })

  const integrations = data?.integrations

  const [serpbearUrl, setSerpbearUrl] = useState('')
  const [serpbearKey, setSerpbearKey] = useState('')
  const [pagespeedKey, setPagespeedKey] = useState('')

  // Populate inputs from loaded data (only when not yet touched)
  const [loaded, setLoaded] = useState(false)
  if (integrations && !loaded) {
    setSerpbearUrl(integrations.serpbear.url || '')
    setSerpbearKey(integrations.serpbear.configured ? '••••••••' : '')
    setPagespeedKey(integrations.pagespeed.configured ? '••••••••' : '')
    setLoaded(true)
  }

  const saveMutation = useMutation({
    mutationFn: (body: object) => api('/api/tenant/integrations', { method: 'PUT', body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'integrations'] })
      toast.success('Integration settings saved')
    },
    onError: () => toast.error('Failed to save settings'),
  })

  const disconnectMutation = useMutation({
    mutationFn: (service: string) =>
      api(`/api/tenant/integrations/${service}`, { method: 'DELETE' }),
    onSuccess: (_, service) => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'integrations'] })
      setLoaded(false)
      toast.success(`${service} disconnected`)
    },
    onError: () => toast.error('Failed to disconnect'),
  })

  function saveSerpbear() {
    if (!serpbearUrl.trim()) {
      toast.error('Serpbear URL is required')
      return
    }
    saveMutation.mutate({
      serpbear: {
        url: serpbearUrl.trim(),
        apiKey: serpbearKey,
      },
    })
  }

  function savePagespeed() {
    saveMutation.mutate({ pagespeed: { apiKey: pagespeedKey } })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Integrations"
        subtitle="Connect external SEO tools to power your dashboard."
        breadcrumbs={[
          { label: 'Overview', href: '/' },
          { label: 'SEO', href: '/seo' },
          { label: 'Integrations' },
        ]}
      />

      {/* Serpbear */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50">
                <BarChart2 className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <CardTitle className="text-base">Serpbear</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Open-source keyword rank tracker — self-hosted
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {integrations?.serpbear.configured ? (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <XCircle className="mr-1 h-3 w-3" />
                  Not configured
                </Badge>
              )}
              <a
                href="https://github.com/towfiqi/serpbear"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-0.5"
              >
                GitHub
                <ExternalLink className="h-3 w-3 ml-0.5" />
              </a>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-5 space-y-4">
          <p className="text-xs text-gray-500">
            Run Serpbear with Docker and enter its URL + API key below. Your keywords and SERP
            rankings will appear in the Rankings dashboard.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="sb-url">Serpbear URL</Label>
              <Input
                id="sb-url"
                value={serpbearUrl}
                onChange={(e) => setSerpbearUrl(e.target.value)}
                placeholder="http://localhost:3000"
              />
              <p className="text-xs text-gray-400">e.g. https://serpbear.yourdomain.com</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sb-key">API Key</Label>
              <Input
                id="sb-key"
                type="password"
                value={serpbearKey}
                onChange={(e) => setSerpbearKey(e.target.value)}
                placeholder="Your Serpbear APIKEY env value"
              />
              <p className="text-xs text-gray-400">Set as APIKEY in your Serpbear .env</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={saveSerpbear} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Save Serpbear Config'}
            </Button>
            {integrations?.serpbear.configured && (
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={() => disconnectMutation.mutate('serpbear')}
                disabled={disconnectMutation.isPending}
              >
                Disconnect
              </Button>
            )}
          </div>

          <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 space-y-2">
            <p className="text-xs font-medium text-gray-700">Quick start with Docker</p>
            <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap">
{`docker run -d \\
  -p 3000:3000 \\
  -e APIKEY=your-secret-key \\
  -e NEXTAUTH_SECRET=random-secret \\
  -e NEXTAUTH_URL=http://localhost:3000 \\
  --name serpbear \\
  towfiqi/serpbear`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* PageSpeed Insights */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <Gauge className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base">Google PageSpeed Insights</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Lighthouse-powered performance &amp; SEO auditing via Google's API
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {integrations?.pagespeed.configured ? (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  API key set
                </Badge>
              ) : (
                <Badge variant="secondary">No API key (free tier)</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-5 space-y-4">
          <p className="text-xs text-gray-500">
            The PageSpeed Insights API is free without a key, but rate-limited to ~400 requests/day.
            Adding a Google API key removes this limit.
          </p>

          <div className="max-w-sm space-y-1.5">
            <Label htmlFor="psi-key">Google API Key (optional)</Label>
            <Input
              id="psi-key"
              type="password"
              value={pagespeedKey}
              onChange={(e) => setPagespeedKey(e.target.value)}
              placeholder="AIza..."
            />
            <p className="text-xs text-gray-400">
              Enable the PageSpeed Insights API in Google Cloud Console
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={savePagespeed} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Save API Key'}
            </Button>
            {integrations?.pagespeed.configured && (
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={() => disconnectMutation.mutate('pagespeed')}
                disabled={disconnectMutation.isPending}
              >
                Remove key
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
