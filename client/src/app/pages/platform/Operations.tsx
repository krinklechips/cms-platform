import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { queryClient } from '@/lib/query-client'
import { PlatformHeader } from '@/app/components/platform/PlatformHeader'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Database, HardDrive, Archive, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

interface BackupInfo {
  dbPath?: string
  walMode?: boolean
  lastBackup?: string
  backupDir?: string
}

export function Operations() {
  const { data: diagnostics, isLoading } = useQuery({
    queryKey: ['platform', 'backups'],
    queryFn: () => api<BackupInfo>('/api/platform/backups/db'),
  })

  const backupMutation = useMutation({
    mutationFn: () =>
      api('/api/platform/backups/db', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform', 'backups'] })
      toast.success('Backup created successfully')
    },
    onError: () => toast.error('Backup failed'),
  })

  return (
    <div className="flex h-full flex-col">
      <PlatformHeader
        title="Operations"
        subtitle="Storage diagnostics and backups"
      />

      <div className="flex-1 overflow-auto bg-gray-50 p-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Database */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Database</h3>
                <Badge className="mt-1 bg-green-100 text-green-700 hover:bg-green-100">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Healthy
                </Badge>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Path</span>
                <span className="max-w-[160px] truncate font-mono text-xs text-gray-700">
                  {isLoading ? '...' : diagnostics?.dbPath ?? 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">WAL Mode</span>
                <span className="text-gray-700">
                  {isLoading
                    ? '...'
                    : diagnostics?.walMode
                      ? 'Enabled'
                      : 'Disabled'}
                </span>
              </div>
            </div>
          </div>

          {/* Backup */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Archive className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Backups</h3>
                <p className="text-sm text-gray-500">
                  Last:{' '}
                  {isLoading
                    ? '...'
                    : diagnostics?.lastBackup
                      ? new Date(diagnostics.lastBackup).toLocaleString()
                      : 'Never'}
                </p>
              </div>
            </div>

            <p className="mb-4 text-sm text-gray-600">
              Create a snapshot of the current database state
            </p>

            <Button
              size="sm"
              onClick={() => backupMutation.mutate()}
              disabled={backupMutation.isPending}
              className="w-full bg-[#7c3aed] hover:bg-[#6d28d9]"
            >
              {backupMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Backup
            </Button>
          </div>

          {/* Storage */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <HardDrive className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Storage</h3>
                <p className="text-sm text-gray-500">Upload directory</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Backup dir</span>
                <span className="max-w-[160px] truncate font-mono text-xs text-gray-700">
                  {isLoading ? '...' : diagnostics?.backupDir ?? 'N/A'}
                </span>
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-600">
              View storage usage and manage uploaded files
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
