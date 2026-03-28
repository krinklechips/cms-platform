import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { PageHeader } from '@/app/components/shared/PageHeader'
import { Plus, Trash2, Pencil, Briefcase, X, Save, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Badge } from '@/app/components/ui/badge'
import { Textarea } from '@/app/components/ui/textarea'
import { Checkbox } from '@/app/components/ui/checkbox'
import { Separator } from '@/app/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog'
import { ServiceContentEditor, type ServiceSection } from './ServiceContentEditor'

interface Service {
  id: string
  name: string
  slug: string
  eyebrow?: string | null
  description?: string | null
  heroDescription?: string | null
  features: string[]
  category?: string | null
  isFeatured: boolean
  content: { sections: ServiceSection[] }
  sortOrder: number
  status: string
  createdAt?: string
  updatedAt?: string
}

interface ServiceFormData {
  name: string
  eyebrow: string
  description: string
  heroDescription: string
  featuresInput: string
  category: string
  isFeatured: boolean
  sortOrder: string
  status: string
}

const emptyForm: ServiceFormData = {
  name: '',
  eyebrow: '',
  description: '',
  heroDescription: '',
  featuresInput: '',
  category: '',
  isFeatured: false,
  sortOrder: '0',
  status: 'published',
}

function serviceToForm(s: Service): ServiceFormData {
  return {
    name: s.name ?? '',
    eyebrow: s.eyebrow ?? '',
    description: s.description ?? '',
    heroDescription: s.heroDescription ?? '',
    featuresInput: Array.isArray(s.features) ? s.features.join(', ') : '',
    category: s.category ?? '',
    isFeatured: Boolean(s.isFeatured),
    sortOrder: String(s.sortOrder ?? 0),
    status: s.status ?? 'published',
  }
}

function parseFeatures(input: string): string[] {
  return input.split(',').map((f) => f.trim()).filter(Boolean)
}

// ─── Full-page Service Editor ────────────────────────────────────────────────

function ServiceEditor({
  service,
  onClose,
  onSaved,
}: {
  service: Service | null // null = new service
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<ServiceFormData>(
    service ? serviceToForm(service) : emptyForm,
  )
  const [sections, setSections] = useState<ServiceSection[]>(
    service?.content?.sections ?? [],
  )
  const [activeTab, setActiveTab] = useState<'details' | 'content'>('details')
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }
    setIsSaving(true)
    try {
      const body = {
        name: form.name,
        eyebrow: form.eyebrow || null,
        description: form.description || null,
        heroDescription: form.heroDescription || null,
        features: parseFeatures(form.featuresInput),
        category: form.category || null,
        isFeatured: form.isFeatured,
        sortOrder: Number(form.sortOrder) || 0,
        status: form.status,
        content: { sections },
      }
      if (service) {
        await api(`/api/tenant/services/${service.id}`, { method: 'PUT', body })
      } else {
        await api('/api/tenant/services', { method: 'POST', body })
      }
      toast.success(service ? 'Service updated' : 'Service added')
      onSaved()
    } catch {
      toast.error('Failed to save service')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              {service ? 'Edit Service' : 'New Service'}
            </p>
            <p className="text-sm font-semibold text-gray-900">
              {form.name || 'Untitled Service'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={isSaving} onClick={handleSave}>
            <Save className="mr-1.5 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 px-6 shrink-0">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'content'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Page Content
            {sections.length > 0 && (
              <span className="ml-1.5 rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                {sections.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'details' ? (
          <div className="mx-auto max-w-2xl px-6 py-8 space-y-6">
            {/* Name & Status row */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="svc-name">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="svc-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Dental Implants"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="svc-status">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger id="svc-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Eyebrow & Category */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="svc-eyebrow">
                  Eyebrow Label
                  <span className="text-gray-400 text-xs ml-1">(small text above title)</span>
                </Label>
                <Input
                  id="svc-eyebrow"
                  value={form.eyebrow}
                  onChange={(e) => setForm({ ...form, eyebrow: e.target.value })}
                  placeholder="IMPLANTOLOGY"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="svc-category">Category</Label>
                <Input
                  id="svc-category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Implants & Reconstruction"
                />
              </div>
            </div>

            {/* Short Description */}
            <div className="space-y-1.5">
              <Label htmlFor="svc-description">
                Short Description
                <span className="text-gray-400 text-xs ml-1">(used in service cards)</span>
              </Label>
              <Textarea
                id="svc-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of this service..."
                rows={2}
              />
            </div>

            {/* Hero Description */}
            <div className="space-y-1.5">
              <Label htmlFor="svc-hero-desc">
                Hero Description
                <span className="text-gray-400 text-xs ml-1">(longer intro at top of service page)</span>
              </Label>
              <Textarea
                id="svc-hero-desc"
                value={form.heroDescription}
                onChange={(e) => setForm({ ...form, heroDescription: e.target.value })}
                placeholder="Dental implants are currently the best treatment option..."
                rows={4}
              />
            </div>

            {/* Key Features */}
            <div className="space-y-1.5">
              <Label htmlFor="svc-features">Key Features</Label>
              <Input
                id="svc-features"
                value={form.featuresInput}
                onChange={(e) => setForm({ ...form, featuresInput: e.target.value })}
                placeholder="Single Implant, Implant Bridge, All-on-4"
              />
              <p className="text-xs text-gray-400">Separate features with commas</p>
            </div>

            <Separator />

            {/* Featured, Sort Order */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 items-end">
              <div className="flex items-center gap-2 sm:col-span-1">
                <Checkbox
                  id="svc-featured"
                  checked={form.isFeatured}
                  onCheckedChange={(checked) => setForm({ ...form, isFeatured: Boolean(checked) })}
                />
                <Label htmlFor="svc-featured" className="cursor-pointer">Featured service</Label>
              </div>
              <div className="space-y-1.5 sm:col-span-1">
                <Label htmlFor="svc-sort-order">Sort Order</Label>
                <Input
                  id="svc-sort-order"
                  type="number"
                  min="0"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                />
              </div>
            </div>
          </div>
        ) : (
          <ServiceContentEditorInline
            sections={sections}
            onChange={setSections}
          />
        )}
      </div>
    </div>
  )
}

// ─── Inline Content Editor (embedded, no overlay) ────────────────────────────

function ServiceContentEditorInline({
  sections,
  onChange,
}: {
  sections: ServiceSection[]
  onChange: (sections: ServiceSection[]) => void
}) {
  const [selectedIdx, setSelectedIdx] = useState<number>(0)
  const [addOpen, setAddOpen] = useState(false)

  const SECTION_TYPES: ServiceSection['type'][] = [
    'callout', 'text', 'list', 'cards', 'steps', 'pricing', 'twocol',
  ]
  const TYPE_LABELS: Record<string, string> = {
    callout: 'Callout',
    text: 'Text Block',
    list: 'Bullet List',
    cards: 'Cards',
    steps: 'Steps',
    pricing: 'Pricing Table',
    twocol: 'Two Columns',
  }
  const TYPE_COLORS: Record<string, string> = {
    callout: 'bg-amber-100 text-amber-800',
    text: 'bg-blue-100 text-blue-800',
    list: 'bg-green-100 text-green-800',
    cards: 'bg-purple-100 text-purple-800',
    steps: 'bg-indigo-100 text-indigo-800',
    pricing: 'bg-emerald-100 text-emerald-800',
    twocol: 'bg-gray-100 text-gray-700',
  }

  function getSectionPreview(s: ServiceSection): string {
    switch (s.type) {
      case 'callout': return s.title || '--'
      case 'text': return s.heading || '--'
      case 'list': return s.heading ?? `${s.items.length} items`
      case 'cards': return s.heading || '--'
      case 'steps': return s.heading || '--'
      case 'pricing': return s.heading ?? 'Pricing'
      case 'twocol': return 'Two Columns'
    }
  }

  function makeDefault(type: ServiceSection['type']): ServiceSection {
    switch (type) {
      case 'callout': return { type: 'callout', title: '', body: '' }
      case 'text': return { type: 'text', heading: '', body: '' }
      case 'list': return { type: 'list', items: [] }
      case 'cards': return { type: 'cards', heading: '', items: [] }
      case 'steps': return { type: 'steps', heading: '', items: [] }
      case 'pricing': return { type: 'pricing', rows: [] }
      case 'twocol': return {
        type: 'twocol',
        left: { type: 'text', heading: 'Left Column', body: '' },
        right: { type: 'text', heading: 'Right Column', body: '' },
      }
    }
  }

  function updateSection(i: number, v: ServiceSection) {
    const n = [...sections]; n[i] = v; onChange(n)
  }
  function deleteSection(i: number) {
    const n = sections.filter((_, j) => j !== i)
    if (selectedIdx >= n.length) setSelectedIdx(Math.max(0, n.length - 1))
    onChange(n)
  }
  function moveSection(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= sections.length) return
    const n = [...sections]; [n[i], n[j]] = [n[j], n[i]]
    onChange(n)
    setSelectedIdx(j)
  }
  function addSection(type: ServiceSection['type']) {
    const s = makeDefault(type)
    onChange([...sections, s])
    setSelectedIdx(sections.length)
    setAddOpen(false)
  }

  const selected = sections[selectedIdx]

  // Import the section editors from ServiceContentEditor
  // We render the same structure but embedded in the tab
  return (
    <div className="flex flex-1 min-h-[500px]">
      {/* Left panel — section list */}
      <div className="w-64 shrink-0 border-r border-gray-200 flex flex-col bg-gray-50">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Sections</span>
          <button
            className="rounded-md bg-white border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 flex items-center gap-1"
            onClick={() => setAddOpen(v => !v)}
          >
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>

        {addOpen && (
          <div className="border-b border-gray-200 bg-white px-3 py-2 space-y-1">
            {SECTION_TYPES.map(t => (
              <button
                key={t}
                className="w-full text-left px-2 py-1.5 rounded text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => addSection(t)}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-2">
          {sections.length === 0 && (
            <p className="px-4 py-6 text-center text-xs text-gray-400">
              No sections yet.<br />Click Add to start.
            </p>
          )}
          {sections.map((s, i) => (
            <div
              key={i}
              onClick={() => { setSelectedIdx(i); setAddOpen(false) }}
              className={`group mx-2 mb-1 rounded-lg px-3 py-2.5 cursor-pointer flex items-start gap-2 ${
                selectedIdx === i
                  ? 'bg-white border border-gray-200 shadow-sm'
                  : 'hover:bg-white hover:border hover:border-gray-100'
              }`}
            >
              <div className="flex-1 min-w-0">
                <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold mb-1 ${TYPE_COLORS[s.type]}`}>
                  {TYPE_LABELS[s.type]}
                </span>
                <p className="text-xs text-gray-600 truncate">{getSectionPreview(s)}</p>
              </div>
              <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 shrink-0">
                <button className="text-gray-400 hover:text-gray-700" onClick={e => { e.stopPropagation(); moveSection(i, -1) }}>
                  <ChevronUp className="h-3 w-3" />
                </button>
                <button className="text-gray-400 hover:text-gray-700" onClick={e => { e.stopPropagation(); moveSection(i, 1) }}>
                  <ChevronDown className="h-3 w-3" />
                </button>
                <button className="text-gray-400 hover:text-red-500" onClick={e => { e.stopPropagation(); deleteSection(i) }}>
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — selected section editor */}
      <div className="flex-1 overflow-y-auto">
        {!selected ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            Select a section to edit, or add a new one.
          </div>
        ) : (
          <div className="max-w-2xl mx-auto px-8 py-8">
            <div className="flex items-center gap-3 mb-6">
              <span className={`rounded px-2 py-1 text-xs font-semibold ${TYPE_COLORS[selected.type]}`}>
                {TYPE_LABELS[selected.type]}
              </span>
              <h2 className="text-base font-semibold text-gray-800">{getSectionPreview(selected)}</h2>
            </div>
            <InlineSectionEditor
              s={selected}
              onChange={v => updateSection(selectedIdx, v)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Inline Section Editors (copied from ServiceContentEditor for self-containment) ──

/* eslint-disable @typescript-eslint/no-explicit-any */
function InlineSectionEditor({ s, onChange }: { s: ServiceSection; onChange: (v: ServiceSection) => void }) {
  if (s.type === 'twocol') {
    const LEAF_TYPES = ['callout', 'text', 'list', 'cards', 'steps', 'pricing'] as const
    const TYPE_LABELS: Record<string, string> = {
      callout: 'Callout', text: 'Text Block', list: 'Bullet List',
      cards: 'Cards', steps: 'Steps', pricing: 'Pricing Table',
    }
    return (
      <div className="space-y-6">
        <p className="text-sm text-gray-500">Each column can be any section type except Two Columns.</p>
        {(['left', 'right'] as const).map(side => (
          <div key={side} className="rounded-lg border border-gray-200 p-4 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {side === 'left' ? 'Left Column' : 'Right Column'}
              </span>
              <Select value={(s as any)[side].type} onValueChange={v => onChange({ ...s, [side]: makeLeafDefault(v) })}>
                <SelectTrigger className="w-40 h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{LEAF_TYPES.map(t => <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <InlineSectionEditor s={(s as any)[side]} onChange={v => onChange({ ...s, [side]: v })} />
          </div>
        ))}
      </div>
    )
  }

  switch (s.type) {
    case 'callout': return <CalloutFields s={s} onChange={onChange as any} />
    case 'text': return <TextFields s={s} onChange={onChange as any} />
    case 'list': return <ListFields s={s} onChange={onChange as any} />
    case 'cards': return <CardsFields s={s} onChange={onChange as any} />
    case 'steps': return <StepsFields s={s} onChange={onChange as any} />
    case 'pricing': return <PricingFields s={s} onChange={onChange as any} />
    default: return null
  }
}

function makeLeafDefault(type: string): ServiceSection {
  switch (type) {
    case 'callout': return { type: 'callout', title: '', body: '' }
    case 'text': return { type: 'text', heading: '', body: '' }
    case 'list': return { type: 'list', items: [] }
    case 'cards': return { type: 'cards', heading: '', items: [] }
    case 'steps': return { type: 'steps', heading: '', items: [] }
    case 'pricing': return { type: 'pricing', rows: [] }
    default: return { type: 'text', heading: '', body: '' }
  }
}

function CalloutFields({ s, onChange }: { s: any; onChange: (v: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Icon (emoji)</Label>
          <Input value={s.icon ?? ''} onChange={e => onChange({ ...s, icon: e.target.value })} placeholder="e.g. tooth emoji" />
        </div>
        <div className="space-y-1.5">
          <Label>Title</Label>
          <Input value={s.title} onChange={e => onChange({ ...s, title: e.target.value })} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Body</Label>
        <Textarea rows={3} value={s.body} onChange={e => onChange({ ...s, body: e.target.value })} />
      </div>
    </div>
  )
}

function TextFields({ s, onChange }: { s: any; onChange: (v: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Heading</Label>
        <Input value={s.heading} onChange={e => onChange({ ...s, heading: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label>Body <span className="text-gray-400 text-xs">(blank line = new paragraph)</span></Label>
        <Textarea rows={6} value={s.body} onChange={e => onChange({ ...s, body: e.target.value })} />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="text-card" checked={Boolean(s.card)} onCheckedChange={v => onChange({ ...s, card: Boolean(v) })} />
        <Label htmlFor="text-card" className="cursor-pointer">Show as card (bordered box)</Label>
      </div>
    </div>
  )
}

function ListFields({ s, onChange }: { s: any; onChange: (v: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Heading (optional)</Label>
        <Input value={s.heading ?? ''} onChange={e => onChange({ ...s, heading: e.target.value || undefined })} />
      </div>
      <div className="space-y-1.5">
        <Label>Items <span className="text-gray-400 text-xs">(one per line)</span></Label>
        <Textarea rows={8} value={s.items.join('\n')} onChange={e => onChange({ ...s, items: e.target.value.split('\n').filter((l: string) => l.trim()) })} />
      </div>
    </div>
  )
}

function CardsFields({ s, onChange }: { s: any; onChange: (v: any) => void }) {
  const items = s.items
  function updateItem(i: number, patch: any) {
    const ni = [...items]; ni[i] = { ...ni[i], ...patch }; onChange({ ...s, items: ni })
  }
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Heading</Label>
          <Input value={s.heading} onChange={e => onChange({ ...s, heading: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Columns</Label>
          <Select value={String(s.columns ?? 3)} onValueChange={v => onChange({ ...s, columns: Number(v) })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 columns</SelectItem>
              <SelectItem value="3">3 columns</SelectItem>
              <SelectItem value="4">4 columns</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Cards</Label>
          <Button size="sm" variant="outline" onClick={() => onChange({ ...s, items: [...items, { title: '', body: '' }] })}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Card
          </Button>
        </div>
        {items.map((item: any, i: number) => (
          <div key={i} className="rounded-lg border border-gray-200 p-4 space-y-3 bg-gray-50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-gray-500">Card {i + 1}</span>
              <button className="text-gray-400 hover:text-red-500" onClick={() => onChange({ ...s, items: items.filter((_: any, j: number) => j !== i) })}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Title</Label>
                <Input value={item.title} onChange={e => updateItem(i, { title: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Icon (emoji)</Label>
                <Input value={item.icon ?? ''} onChange={e => updateItem(i, { icon: e.target.value || undefined })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Body</Label>
              <Textarea rows={3} value={item.body} onChange={e => updateItem(i, { body: e.target.value })} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StepsFields({ s, onChange }: { s: any; onChange: (v: any) => void }) {
  const items = s.items
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Heading</Label>
        <Input value={s.heading} onChange={e => onChange({ ...s, heading: e.target.value })} />
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Steps</Label>
          <Button size="sm" variant="outline" onClick={() => onChange({ ...s, items: [...items, { step: '', detail: '' }] })}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Step
          </Button>
        </div>
        {items.map((item: any, i: number) => (
          <div key={i} className="rounded-lg border border-gray-200 p-4 bg-gray-50 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-gray-500">Step {i + 1}</span>
              <button className="text-gray-400 hover:text-red-500" onClick={() => onChange({ ...s, items: items.filter((_: any, j: number) => j !== i) })}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Step Label</Label>
              <Input value={item.step} onChange={e => { const ni = [...items]; ni[i] = { ...ni[i], step: e.target.value }; onChange({ ...s, items: ni }) }} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Detail</Label>
              <Textarea rows={2} value={item.detail} onChange={e => { const ni = [...items]; ni[i] = { ...ni[i], detail: e.target.value }; onChange({ ...s, items: ni }) }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PricingFields({ s, onChange }: { s: any; onChange: (v: any) => void }) {
  const rows = s.rows
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Heading (optional)</Label>
          <Input value={s.heading ?? ''} onChange={e => onChange({ ...s, heading: e.target.value || undefined })} />
        </div>
        <div className="space-y-1.5">
          <Label>Subheading (optional)</Label>
          <Input value={s.subheading ?? ''} onChange={e => onChange({ ...s, subheading: e.target.value || undefined })} />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Rows</Label>
          <Button size="sm" variant="outline" onClick={() => onChange({ ...s, rows: [...rows, { treatment: '', price: '' }] })}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Row
          </Button>
        </div>
        {rows.map((row: any, i: number) => (
          <div key={i} className="flex gap-2 items-center">
            <Input className="flex-1" placeholder="Treatment name" value={row.treatment} onChange={e => { const nr = [...rows]; nr[i] = { ...nr[i], treatment: e.target.value }; onChange({ ...s, rows: nr }) }} />
            <Input className="w-28" placeholder="$1,200" value={row.price} onChange={e => { const nr = [...rows]; nr[i] = { ...nr[i], price: e.target.value }; onChange({ ...s, rows: nr }) }} />
            <button className="text-gray-400 hover:text-red-500 shrink-0" onClick={() => onChange({ ...s, rows: rows.filter((_: any, j: number) => j !== i) })}>
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ─── Main Services List ──────────────────────────────────────────────────────

export function Services() {
  const queryClient = useQueryClient()

  const [editorTarget, setEditorTarget] = useState<Service | null | 'new'>(null)
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null)

  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ['tenant', 'services'],
    queryFn: () => api('/api/tenant/services'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      api(`/api/tenant/services/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'services'] })
      toast.success('Service deleted')
      setDeleteTarget(null)
    },
    onError: () => toast.error('Failed to delete service'),
  })

  // Full-page editor is open
  if (editorTarget !== null) {
    return (
      <ServiceEditor
        service={editorTarget === 'new' ? null : editorTarget}
        onClose={() => setEditorTarget(null)}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ['tenant', 'services'] })
          setEditorTarget(null)
        }}
      />
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Services & Pricing"
        subtitle="Manage the services listed on the website"
        breadcrumbs={[{ label: 'Overview', href: '/' }, { label: 'Services & Pricing' }]}
        actions={
          <Button onClick={() => setEditorTarget('new')} size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Add Service
          </Button>
        }
      />

      {isLoading ? (
        <div className="py-12 text-center text-sm text-gray-500">Loading...</div>
      ) : services.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
          <Briefcase className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-600">No services yet</p>
          <p className="mt-1 text-xs text-gray-400">Use the button above to add your first service.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Name</TableHead>
                <TableHead className="min-w-[140px]">Category</TableHead>
                <TableHead className="w-24">Featured</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-20 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((s) => (
                <TableRow
                  key={s.id}
                  className="cursor-pointer"
                  onClick={() => setEditorTarget(s)}
                >
                  <TableCell>
                    <div className="font-medium text-gray-900">{s.name}</div>
                    {s.description && (
                      <div className="mt-0.5 max-w-xs text-xs text-gray-400 line-clamp-1">{s.description}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-500 whitespace-nowrap">{s.category || '--'}</TableCell>
                  <TableCell>
                    {s.isFeatured ? (
                      <Badge variant="secondary" className="text-xs">Featured</Badge>
                    ) : (
                      <span className="text-gray-400 text-xs">--</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.status === 'published' ? 'default' : 'secondary'}>
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(s) }}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.name}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
