import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'
import { Checkbox } from '@/app/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import { ChevronUp, ChevronDown, Trash2, Plus, X } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type CalloutSection = {
  type: 'callout'
  icon?: string
  title: string
  body: string
  stats?: { value: string; label: string }[]
}
type TextSection = { type: 'text'; heading: string; body: string; card?: boolean }
type ListSection = { type: 'list'; heading?: string; items: string[] }
type CardsItem = { title: string; body: string; tag?: string; icon?: string; badge?: string; spec?: string }
type CardsSection = {
  type: 'cards'
  heading: string
  subheading?: string
  numbered?: boolean
  columns?: number
  items: CardsItem[]
}
type StepsSection = {
  type: 'steps'
  heading: string
  subheading?: string
  items: { step: string; detail: string }[]
}
type PricingSection = {
  type: 'pricing'
  heading?: string
  subheading?: string
  rows: { treatment: string; price: string }[]
}
type TwoColSection = { type: 'twocol'; left: LeafSection; right: LeafSection }
type LeafSection = CalloutSection | TextSection | ListSection | CardsSection | StepsSection | PricingSection
export type ServiceSection = LeafSection | TwoColSection

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
    case 'callout': return s.title || '—'
    case 'text': return s.heading || '—'
    case 'list': return s.heading ?? `${s.items.length} items`
    case 'cards': return s.heading || '—'
    case 'steps': return s.heading || '—'
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

// ─── Section Editors ──────────────────────────────────────────────────────────

function CalloutEditor({ s, onChange }: { s: CalloutSection; onChange: (v: CalloutSection) => void }) {
  const stats = s.stats ?? []
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Icon (emoji)</Label>
          <Input value={s.icon ?? ''} onChange={e => onChange({ ...s, icon: e.target.value })} placeholder="🦷" />
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
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Stats (optional)</Label>
          <Button size="sm" variant="outline" onClick={() => onChange({ ...s, stats: [...stats, { value: '', label: '' }] })}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Stat
          </Button>
        </div>
        {stats.map((st, i) => (
          <div key={i} className="flex gap-2 items-center">
            <Input className="w-24" placeholder="Value" value={st.value} onChange={e => { const ns = [...stats]; ns[i] = { ...st, value: e.target.value }; onChange({ ...s, stats: ns }) }} />
            <Input placeholder="Label" value={st.label} onChange={e => { const ns = [...stats]; ns[i] = { ...st, label: e.target.value }; onChange({ ...s, stats: ns }) }} />
            <button className="text-gray-400 hover:text-red-500" onClick={() => onChange({ ...s, stats: stats.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </div>
  )
}

function TextEditor({ s, onChange }: { s: TextSection; onChange: (v: TextSection) => void }) {
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

function ListEditor({ s, onChange }: { s: ListSection; onChange: (v: ListSection) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Heading (optional)</Label>
        <Input value={s.heading ?? ''} onChange={e => onChange({ ...s, heading: e.target.value || undefined })} />
      </div>
      <div className="space-y-1.5">
        <Label>Items <span className="text-gray-400 text-xs">(one per line)</span></Label>
        <Textarea rows={8} value={s.items.join('\n')} onChange={e => onChange({ ...s, items: e.target.value.split('\n').filter(l => l.trim()) })} />
      </div>
    </div>
  )
}

function CardsEditor({ s, onChange }: { s: CardsSection; onChange: (v: CardsSection) => void }) {
  const items = s.items
  function updateItem(i: number, patch: Partial<CardsItem>) {
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
      <div className="space-y-1.5">
        <Label>Subheading (optional)</Label>
        <Input value={s.subheading ?? ''} onChange={e => onChange({ ...s, subheading: e.target.value || undefined })} />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="cards-numbered" checked={Boolean(s.numbered)} onCheckedChange={v => onChange({ ...s, numbered: Boolean(v) })} />
        <Label htmlFor="cards-numbered" className="cursor-pointer">Numbered cards (show 1, 2, 3… instead of icons)</Label>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Cards</Label>
          <Button size="sm" variant="outline" onClick={() => onChange({ ...s, items: [...items, { title: '', body: '' }] })}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Card
          </Button>
        </div>
        {items.map((item, i) => (
          <div key={i} className="rounded-lg border border-gray-200 p-4 space-y-3 bg-gray-50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-gray-500">Card {i + 1}</span>
              <button className="text-gray-400 hover:text-red-500" onClick={() => onChange({ ...s, items: items.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Title</Label>
                <Input value={item.title} onChange={e => updateItem(i, { title: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Icon (emoji) or Badge</Label>
                <Input value={item.icon ?? item.badge ?? ''} onChange={e => updateItem(i, { icon: e.target.value || undefined, badge: undefined })} placeholder="🦷 or leave blank" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Tag (pill label)</Label>
                <Input value={item.tag ?? ''} onChange={e => updateItem(i, { tag: e.target.value || undefined })} placeholder="Optional" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Spec (bold sub-label)</Label>
                <Input value={item.spec ?? ''} onChange={e => updateItem(i, { spec: e.target.value || undefined })} placeholder="Optional" />
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

function StepsEditor({ s, onChange }: { s: StepsSection; onChange: (v: StepsSection) => void }) {
  const items = s.items
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Heading</Label>
        <Input value={s.heading} onChange={e => onChange({ ...s, heading: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label>Subheading (optional)</Label>
        <Input value={s.subheading ?? ''} onChange={e => onChange({ ...s, subheading: e.target.value || undefined })} />
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Steps</Label>
          <Button size="sm" variant="outline" onClick={() => onChange({ ...s, items: [...items, { step: '', detail: '' }] })}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Step
          </Button>
        </div>
        {items.map((item, i) => (
          <div key={i} className="rounded-lg border border-gray-200 p-4 bg-gray-50 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-gray-500">Step {i + 1}</span>
              <button className="text-gray-400 hover:text-red-500" onClick={() => onChange({ ...s, items: items.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4" /></button>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Step Label <span className="text-gray-400">(e.g. "1ST VISIT")</span></Label>
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

function PricingEditor({ s, onChange }: { s: PricingSection; onChange: (v: PricingSection) => void }) {
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
        {rows.map((row, i) => (
          <div key={i} className="flex gap-2 items-center">
            <Input className="flex-1" placeholder="Treatment name" value={row.treatment} onChange={e => { const nr = [...rows]; nr[i] = { ...nr[i], treatment: e.target.value }; onChange({ ...s, rows: nr }) }} />
            <Input className="w-28" placeholder="$1,200" value={row.price} onChange={e => { const nr = [...rows]; nr[i] = { ...nr[i], price: e.target.value }; onChange({ ...s, rows: nr }) }} />
            <button className="text-gray-400 hover:text-red-500 shrink-0" onClick={() => onChange({ ...s, rows: rows.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </div>
  )
}

function LeafEditor({ s, onChange }: { s: LeafSection; onChange: (v: LeafSection) => void }) {
  if (s.type === 'callout') return <CalloutEditor s={s} onChange={onChange as (v: CalloutSection) => void} />
  if (s.type === 'text') return <TextEditor s={s} onChange={onChange as (v: TextSection) => void} />
  if (s.type === 'list') return <ListEditor s={s} onChange={onChange as (v: ListSection) => void} />
  if (s.type === 'cards') return <CardsEditor s={s} onChange={onChange as (v: CardsSection) => void} />
  if (s.type === 'steps') return <StepsEditor s={s} onChange={onChange as (v: StepsSection) => void} />
  if (s.type === 'pricing') return <PricingEditor s={s} onChange={onChange as (v: PricingSection) => void} />
  return null
}

function TwoColEditor({ s, onChange }: { s: TwoColSection; onChange: (v: TwoColSection) => void }) {
  const LEAF_TYPES = SECTION_TYPES.filter(t => t !== 'twocol') as LeafSection['type'][]
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">Each column can be any section type except Two Columns.</p>
      {(['left', 'right'] as const).map(side => (
        <div key={side} className="rounded-lg border border-gray-200 p-4 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{side === 'left' ? 'Left Column' : 'Right Column'}</span>
            <Select value={s[side].type} onValueChange={v => onChange({ ...s, [side]: makeDefault(v as LeafSection['type']) as LeafSection })}>
              <SelectTrigger className="w-40 h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{LEAF_TYPES.map(t => <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <LeafEditor s={s[side]} onChange={v => onChange({ ...s, [side]: v })} />
        </div>
      ))}
    </div>
  )
}

function SectionEditor({ s, onChange }: { s: ServiceSection; onChange: (v: ServiceSection) => void }) {
  if (s.type === 'twocol') return <TwoColEditor s={s} onChange={onChange as (v: TwoColSection) => void} />
  return <LeafEditor s={s as LeafSection} onChange={onChange as (v: LeafSection) => void} />
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  serviceName: string
  initialContent: { sections: ServiceSection[] }
  isSaving: boolean
  onSave: (content: { sections: ServiceSection[] }) => void
  onClose: () => void
}

export function ServiceContentEditor({ serviceName, initialContent, isSaving, onSave, onClose }: Props) {
  const [sections, setSections] = useState<ServiceSection[]>(initialContent.sections ?? [])
  const [selectedIdx, setSelectedIdx] = useState<number>(0)
  const [addOpen, setAddOpen] = useState(false)

  function updateSection(i: number, v: ServiceSection) {
    setSections(prev => { const n = [...prev]; n[i] = v; return n })
  }
  function deleteSection(i: number) {
    setSections(prev => {
      const n = prev.filter((_, j) => j !== i)
      if (selectedIdx >= n.length) setSelectedIdx(Math.max(0, n.length - 1))
      return n
    })
  }
  function moveSection(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= sections.length) return
    setSections(prev => { const n = [...prev]; [n[i], n[j]] = [n[j], n[i]]; return n })
    setSelectedIdx(j)
  }
  function addSection(type: ServiceSection['type']) {
    const s = makeDefault(type)
    setSections(prev => [...prev, s])
    setSelectedIdx(sections.length)
    setAddOpen(false)
  }

  const selected = sections[selectedIdx]

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Page Content Editor</p>
            <p className="text-sm font-semibold text-gray-900">{serviceName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={isSaving} onClick={() => onSave({ sections })}>
            {isSaving ? 'Saving…' : 'Save Content'}
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
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

          {/* Add section menu */}
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
              <p className="px-4 py-6 text-center text-xs text-gray-400">No sections yet.<br />Click Add to start.</p>
            )}
            {sections.map((s, i) => (
              <div
                key={i}
                onClick={() => { setSelectedIdx(i); setAddOpen(false) }}
                className={`group mx-2 mb-1 rounded-lg px-3 py-2.5 cursor-pointer flex items-start gap-2 ${selectedIdx === i ? 'bg-white border border-gray-200 shadow-sm' : 'hover:bg-white hover:border hover:border-gray-100'}`}
              >
                <div className="flex-1 min-w-0">
                  <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold mb-1 ${TYPE_COLORS[s.type]}`}>
                    {TYPE_LABELS[s.type]}
                  </span>
                  <p className="text-xs text-gray-600 truncate">{getSectionPreview(s)}</p>
                </div>
                <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 shrink-0">
                  <button className="text-gray-400 hover:text-gray-700" onClick={e => { e.stopPropagation(); moveSection(i, -1) }}><ChevronUp className="h-3 w-3" /></button>
                  <button className="text-gray-400 hover:text-gray-700" onClick={e => { e.stopPropagation(); moveSection(i, 1) }}><ChevronDown className="h-3 w-3" /></button>
                  <button className="text-gray-400 hover:text-red-500" onClick={e => { e.stopPropagation(); deleteSection(i) }}><Trash2 className="h-3 w-3" /></button>
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
              <SectionEditor
                s={selected}
                onChange={v => updateSection(selectedIdx, v)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
