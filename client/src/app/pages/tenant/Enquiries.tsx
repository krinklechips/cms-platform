import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { PageHeader } from '@/app/components/shared/PageHeader'
import {
  Inbox,
  Mail,
  MailOpen,
  Trash2,
  Phone,
  Globe,
  Stethoscope,
  MapPin,
  Calendar,
  UserCircle,
  Tag,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { cn } from '@/app/components/ui/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Enquiry {
  id: string
  name: string
  email: string
  phone: string | null
  country: string | null
  treatment: string | null
  branch: string | null
  date: string | null
  message: string | null
  read: boolean
  agentCode: string | null
  doctor: string | null
  createdAt: string
}

type ReadFilter = 'all' | 'unread' | 'read'

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function formatRelative(iso: string) {
  try {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    if (days < 7) return `${days}d ago`
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(iso))
  } catch {
    return ''
  }
}

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */

export function Enquiries() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<ReadFilter>('all')
  const [selected, setSelected] = useState<Enquiry | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Enquiry | null>(null)

  /* ---- Query ----------------------------------------------------- */

  const queryParam = filter === 'all' ? '' : `?read=${filter === 'read'}`
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['enquiries', filter],
    queryFn: () => api<Enquiry[]>(`/api/tenant/enquiries${queryParam}`),
  })

  const enquiries = data ?? []
  const unreadCount = enquiries.filter((e) => !e.read).length

  /* ---- Mutations ------------------------------------------------- */

  const markReadMutation = useMutation({
    mutationFn: ({ id, read }: { id: string; read: boolean }) =>
      api(`/api/tenant/enquiries/${id}/read`, { method: 'PATCH', body: { read } }),
    onSuccess: (updated: Enquiry) => {
      queryClient.invalidateQueries({ queryKey: ['enquiries'] })
      // Keep selected in sync
      setSelected((prev) => (prev?.id === updated.id ? { ...prev, read: updated.read } : prev))
    },
    onError: () => toast.error('Failed to update enquiry'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/tenant/enquiries/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Enquiry deleted')
      queryClient.invalidateQueries({ queryKey: ['enquiries'] })
      setDeleteTarget(null)
      setSelected((prev) => (prev?.id === deleteTarget?.id ? null : prev))
    },
    onError: () => toast.error('Failed to delete enquiry'),
  })

  /* ---- Handlers -------------------------------------------------- */

  function openEnquiry(e: Enquiry) {
    setSelected(e)
    // Auto-mark as read when opened
    if (!e.read) {
      markReadMutation.mutate({ id: e.id, read: true })
    }
  }

  /* ---- Empty state ----------------------------------------------- */

  if (!isLoading && enquiries.length === 0 && !selected) {
    return (
      <div className="p-6 space-y-6">
        <Header
          filter={filter}
          setFilter={setFilter}
          unreadCount={0}
          onRefresh={() => refetch()}
        />
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Inbox className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-sm font-medium text-gray-900">No enquiries yet</p>
          <p className="text-sm text-gray-500 mt-1 max-w-sm">
            When visitors submit contact forms, they'll appear here.
          </p>
        </div>
      </div>
    )
  }

  /* ---- Main layout ----------------------------------------------- */

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Page header */}
      <div className="px-6 pt-6 pb-4 shrink-0">
        <Header
          filter={filter}
          setFilter={setFilter}
          unreadCount={unreadCount}
          onRefresh={() => refetch()}
        />
      </div>

      {/* Split pane */}
      <div className="flex flex-1 overflow-hidden border-t border-gray-200 mx-6 mb-6 rounded-lg border">
        {/* Left: list */}
        <div className="w-80 shrink-0 overflow-y-auto border-r border-gray-200 bg-white">
          {isLoading ? (
            <div className="p-4 text-sm text-gray-500">Loading enquiries…</div>
          ) : enquiries.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">No enquiries match this filter.</div>
          ) : (
            <ul>
              {enquiries.map((e) => (
                <li key={e.id}>
                  <button
                    onClick={() => openEnquiry(e)}
                    className={cn(
                      'w-full text-left px-4 py-3 border-b border-gray-100 transition-colors',
                      'hover:bg-gray-50',
                      selected?.id === e.id && 'bg-blue-50 border-l-2 border-l-blue-500',
                      !e.read && 'bg-white',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {!e.read && (
                          <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-0.5" />
                        )}
                        <span
                          className={cn(
                            'text-sm truncate',
                            e.read ? 'text-gray-700' : 'font-semibold text-gray-900',
                          )}
                        >
                          {e.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400 shrink-0 mt-0.5">
                        {formatRelative(e.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate ml-4">
                      {e.treatment || e.email}
                    </p>
                    {e.message && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 ml-4">
                        {e.message}
                      </p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right: detail */}
        <div className="flex-1 overflow-y-auto bg-white">
          {selected ? (
            <EnquiryDetail
              enquiry={selected}
              onMarkUnread={() => markReadMutation.mutate({ id: selected.id, read: false })}
              onDelete={() => setDeleteTarget(selected)}
              isPending={markReadMutation.isPending}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
              <MailOpen className="h-10 w-10 mb-3" />
              <p className="text-sm">Select an enquiry to read it</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      {deleteTarget !== null && (
        <Dialog open onOpenChange={() => setDeleteTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Enquiry</DialogTitle>
              <DialogDescription>
                Permanently delete the enquiry from{' '}
                <span className="font-medium">{deleteTarget.name}</span>? This cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Header sub-component                                               */
/* ------------------------------------------------------------------ */

function Header({
  filter,
  setFilter,
  unreadCount,
  onRefresh,
}: {
  filter: ReadFilter
  setFilter: (v: ReadFilter) => void
  unreadCount: number
  onRefresh: () => void
}) {
  return (
    <PageHeader
      title="Enquiries"
      subtitle="Contact form submissions from visitors"
      breadcrumbs={[{ label: 'Overview', href: '/' }, { label: 'Enquiries' }]}
      actions={
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Badge className="bg-blue-500 hover:bg-blue-500 text-white">
              {unreadCount} unread
            </Badge>
          )}
          <Select value={filter} onValueChange={(v) => setFilter(v as ReadFilter)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={onRefresh} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      }
    />
  )
}

/* ------------------------------------------------------------------ */
/*  Detail panel                                                       */
/* ------------------------------------------------------------------ */

function EnquiryDetail({
  enquiry: e,
  onMarkUnread,
  onDelete,
  isPending,
}: {
  enquiry: Enquiry
  onMarkUnread: () => void
  onDelete: () => void
  isPending: boolean
}) {
  return (
    <div className="p-6 max-w-2xl">
      {/* Top bar */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{e.name}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{formatDate(e.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onMarkUnread}
            disabled={isPending || !e.read}
            title="Mark as unread"
          >
            <Mail className="h-3.5 w-3.5 mr-1.5" />
            Mark unread
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} title="Delete">
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <MetaField icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={e.email} />
        {e.phone && (
          <MetaField icon={<Phone className="h-3.5 w-3.5" />} label="Phone" value={e.phone} />
        )}
        {e.country && (
          <MetaField icon={<Globe className="h-3.5 w-3.5" />} label="Country" value={e.country} />
        )}
        {e.treatment && (
          <MetaField
            icon={<Stethoscope className="h-3.5 w-3.5" />}
            label="Treatment"
            value={e.treatment}
          />
        )}
        {e.branch && (
          <MetaField
            icon={<MapPin className="h-3.5 w-3.5" />}
            label="Branch"
            value={e.branch}
          />
        )}
        {e.date && (
          <MetaField
            icon={<Calendar className="h-3.5 w-3.5" />}
            label="Preferred date"
            value={e.date}
          />
        )}
        {e.doctor && (
          <MetaField
            icon={<UserCircle className="h-3.5 w-3.5" />}
            label="Doctor"
            value={e.doctor}
          />
        )}
        {e.agentCode && (
          <MetaField
            icon={<Tag className="h-3.5 w-3.5" />}
            label="Agent code"
            value={e.agentCode}
          />
        )}
      </div>

      {/* Message */}
      {e.message && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Message
          </p>
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {e.message}
          </div>
        </div>
      )}

      {/* Quick reply link */}
      <div className="mt-6">
        <a
          href={`mailto:${e.email}?subject=Re: Your enquiry at Roomchang Dental`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <Mail className="h-4 w-4" />
          Reply via email
        </a>
      </div>
    </div>
  )
}

function MetaField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
      <span className="mt-0.5 text-gray-400">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm text-gray-800 truncate">{value}</p>
      </div>
    </div>
  )
}
