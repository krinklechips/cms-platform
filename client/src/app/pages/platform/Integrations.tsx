import { PlatformHeader } from '@/app/components/platform/PlatformHeader'
import { Badge } from '@/app/components/ui/badge'
import { Globe, HardDrive, Shield, CheckCircle2, AlertCircle } from 'lucide-react'

interface IntegrationCardProps {
  icon: React.ReactNode
  title: string
  description: string
  status: 'connected' | 'disconnected' | 'partial'
  details: string
}

function IntegrationCard({
  icon,
  title,
  description,
  status,
  details,
}: IntegrationCardProps) {
  const statusConfig = {
    connected: {
      badge: 'bg-green-100 text-green-700 hover:bg-green-100',
      icon: <CheckCircle2 className="mr-1 h-3 w-3" />,
      label: 'Connected',
    },
    disconnected: {
      badge: 'bg-red-100 text-red-700 hover:bg-red-100',
      icon: <AlertCircle className="mr-1 h-3 w-3" />,
      label: 'Disconnected',
    },
    partial: {
      badge: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
      icon: <AlertCircle className="mr-1 h-3 w-3" />,
      label: 'Partial',
    },
  }

  const cfg = statusConfig[status]

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <Badge className={`mt-1 ${cfg.badge}`}>
              {cfg.icon}
              {cfg.label}
            </Badge>
          </div>
        </div>
      </div>
      <p className="mb-3 text-sm text-gray-600">{description}</p>
      <p className="text-xs text-gray-500">{details}</p>
    </div>
  )
}

export function Integrations() {
  return (
    <div className="flex h-full flex-col">
      <PlatformHeader
        title="Integrations"
        subtitle="External service connections"
      />

      <div className="flex-1 overflow-auto bg-gray-50 p-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <IntegrationCard
            icon={
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
            }
            title="Render"
            description="Domain provisioning and SSL certificate management for tenant custom domains."
            status="connected"
            details="Provisions CNAME records and manages TLS certificates via Render API."
          />

          <IntegrationCard
            icon={
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
                <HardDrive className="h-6 w-6 text-amber-600" />
              </div>
            }
            title="Cloudflare R2"
            description="Object storage for tenant uploads, media files, and static assets."
            status="connected"
            details="S3-compatible storage with per-tenant bucket isolation."
          />

          <IntegrationCard
            icon={
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
            }
            title="CORS Configuration"
            description="Cross-origin request security for tenant domains and API access."
            status="partial"
            details="Configure allowed origins per tenant for API and asset access."
          />
        </div>
      </div>
    </div>
  )
}
