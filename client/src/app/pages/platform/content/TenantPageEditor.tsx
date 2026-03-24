import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, tenantApi } from '@/lib/api'
import { toast } from 'sonner'
import { PageHeader } from '@/app/components/shared/PageHeader'
import { GooglePreview } from '@/app/components/shared/seo/GooglePreview'
import { CharBadge } from '@/app/components/shared/seo/CharBadge'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'
import { RichTextEditor } from '@/app/components/shared/RichTextEditor'
import { Switch } from '@/app/components/ui/switch'
import { Separator } from '@/app/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Type,
  ImageIcon,
  Sparkles,
  MousePointerClick,
  Code,
  Save,
  GalleryHorizontal,
  Quote,
  DollarSign,
  GripVertical,
} from 'lucide-react'

type BlockType = 'text' | 'image' | 'hero' | 'cta' | 'html' | 'carousel' | 'testimonials_block' | 'pricing_block'

interface BlockData {
  content?: string
  url?: string
  alt?: string
  heroTitle?: string
  heroSubtitle?: string
  heroImage?: string
  ctaText?: string
  ctaUrl?: string
  buttonText?: string
  buttonUrl?: string
  html?: string
  slides?: { image: string; title: string; subtitle: string; ctaText: string; ctaUrl: string }[]
  testimonialsTitle?: string
  testimonialsLimit?: number
  pricingTitle?: string
  pricingCategory?: string
}

interface Block {
  id: string
  type: BlockType
  data: BlockData
}

interface PageFormData {
  title: string
  slug: string
  status: string
  parentId: number | null
  template: string
  showInNav: boolean
  navLabel: string
  navParentId: number | null
  sortOrder: number
  seoTitle: string
  seoDescription: string
  seoImage: string
  blocks: Block[]
}

interface PageRecord {
  id: number
  title: string
  slug: string
  status: string
  parentId: number | null
  template: string
  showInNav: boolean
  navLabel: string
  navParentId: number | null
  sortOrder: number
  seoTitle: string
  seoDescription: string
  seoImage: string
  blocks: Array<{ id: number; blockType: string; blockData: BlockData; sortOrder: number }>
}

interface PageListItem { id: number; title: string }
interface Tenant { id: number; name: string; slug: string }

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10)
}

const BLOCK_TYPE_META: Record<BlockType, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  text: { label: 'Text Block', icon: Type },
  image: { label: 'Image', icon: ImageIcon },
  hero: { label: 'Hero Section', icon: Sparkles },
  cta: { label: 'Call to Action', icon: MousePointerClick },
  html: { label: 'HTML', icon: Code },
  carousel: { label: 'Carousel', icon: GalleryHorizontal },
  testimonials_block: { label: 'Testimonials', icon: Quote },
  pricing_block: { label: 'Pricing / Services', icon: DollarSign },
}

function TextBlockEditor({ data, onChange }: { data: BlockData; onChange: (d: BlockData) => void }) {
  return (
    <div className="space-y-2">
      <Label>Content</Label>
      <RichTextEditor
        value={data.content || ''}
        onChange={(html) => onChange({ ...data, content: html })}
        placeholder="Write content here..."
      />
    </div>
  )
}

function ImageBlockEditor({ data, onChange }: { data: BlockData; onChange: (d: BlockData) => void }) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>Image URL</Label>
        <Input value={data.url || ''} onChange={(e) => onChange({ ...data, url: e.target.value })} placeholder="https://..." />
      </div>
      <div className="space-y-2">
        <Label>Alt Text</Label>
        <Input value={data.alt || ''} onChange={(e) => onChange({ ...data, alt: e.target.value })} placeholder="Describe the image..." />
      </div>
      {data.url && (
        <img src={data.url} alt={data.alt || ''} className="h-40 w-full rounded-lg border border-gray-200 object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
      )}
    </div>
  )
}

function HeroBlockEditor({ data, onChange }: { data: BlockData; onChange: (d: BlockData) => void }) {
  return (
    <div className="space-y-3">
      <div className="space-y-2"><Label>Hero Title</Label><Input value={data.heroTitle || ''} onChange={(e) => onChange({ ...data, heroTitle: e.target.value })} placeholder="Main heading" /></div>
      <div className="space-y-2"><Label>Subtitle</Label><Input value={data.heroSubtitle || ''} onChange={(e) => onChange({ ...data, heroSubtitle: e.target.value })} placeholder="Supporting text" /></div>
      <div className="space-y-2"><Label>Background Image URL</Label><Input value={data.heroImage || ''} onChange={(e) => onChange({ ...data, heroImage: e.target.value })} placeholder="https://..." /></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2"><Label>CTA Text</Label><Input value={data.ctaText || ''} onChange={(e) => onChange({ ...data, ctaText: e.target.value })} placeholder="Get Started" /></div>
        <div className="space-y-2"><Label>CTA URL</Label><Input value={data.ctaUrl || ''} onChange={(e) => onChange({ ...data, ctaUrl: e.target.value })} placeholder="/contact" /></div>
      </div>
    </div>
  )
}

function CtaBlockEditor({ data, onChange }: { data: BlockData; onChange: (d: BlockData) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-2"><Label>Button Text</Label><Input value={data.buttonText || ''} onChange={(e) => onChange({ ...data, buttonText: e.target.value })} placeholder="Learn More" /></div>
      <div className="space-y-2"><Label>Button URL</Label><Input value={data.buttonUrl || ''} onChange={(e) => onChange({ ...data, buttonUrl: e.target.value })} placeholder="https://..." /></div>
    </div>
  )
}

function HtmlBlockEditor({ data, onChange }: { data: BlockData; onChange: (d: BlockData) => void }) {
  return (
    <div className="space-y-2">
      <Label>Raw HTML</Label>
      <Textarea value={data.html || ''} onChange={(e) => onChange({ ...data, html: e.target.value })} placeholder="<div>...</div>" rows={8} className="font-mono text-sm" />
    </div>
  )
}

function CarouselBlockEditor({ data, onChange }: { data: BlockData; onChange: (d: BlockData) => void }) {
  const slides = data.slides || []
  const updateSlide = (i: number, field: string, value: string) =>
    onChange({ ...data, slides: slides.map((s, idx) => idx === i ? { ...s, [field]: value } : s) })
  const addSlide = () => onChange({ ...data, slides: [...slides, { image: '', title: '', subtitle: '', ctaText: '', ctaUrl: '' }] })
  const removeSlide = (i: number) => onChange({ ...data, slides: slides.filter((_, idx) => idx !== i) })
  return (
    <div className="space-y-4">
      {slides.map((slide, i) => (
        <div key={i} className="rounded-lg border border-gray-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Slide {i + 1}</span>
            <button type="button" onClick={() => removeSlide(i)} className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
          </div>
          <div className="space-y-2"><Label>Image URL</Label><Input value={slide.image} onChange={(e) => updateSlide(i, 'image', e.target.value)} placeholder="https://..." /></div>
          <div className="space-y-2"><Label>Title</Label><Input value={slide.title} onChange={(e) => updateSlide(i, 'title', e.target.value)} /></div>
          <div className="space-y-2"><Label>Subtitle</Label><Input value={slide.subtitle} onChange={(e) => updateSlide(i, 'subtitle', e.target.value)} /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2"><Label>CTA Text</Label><Input value={slide.ctaText} onChange={(e) => updateSlide(i, 'ctaText', e.target.value)} /></div>
            <div className="space-y-2"><Label>CTA URL</Label><Input value={slide.ctaUrl} onChange={(e) => updateSlide(i, 'ctaUrl', e.target.value)} /></div>
          </div>
        </div>
      ))}
      <button type="button" onClick={addSlide} className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 py-3 text-sm text-gray-500 hover:border-gray-300">
        <Plus className="h-4 w-4" /> Add Slide
      </button>
    </div>
  )
}

function TestimonialsBlockEditor({ data, onChange }: { data: BlockData; onChange: (d: BlockData) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2"><Label>Section Title</Label><Input value={data.testimonialsTitle ?? 'What Our Clients Say'} onChange={(e) => onChange({ ...data, testimonialsTitle: e.target.value })} /></div>
      <div className="space-y-2">
        <Label>Show how many</Label>
        <Select value={String(data.testimonialsLimit ?? 3)} onValueChange={(v) => onChange({ ...data, testimonialsLimit: Number(v) })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3</SelectItem>
            <SelectItem value="6">6</SelectItem>
            <SelectItem value="9">9</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

function PricingBlockEditor({ data, onChange }: { data: BlockData; onChange: (d: BlockData) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2"><Label>Section Title</Label><Input value={data.pricingTitle ?? 'Our Services'} onChange={(e) => onChange({ ...data, pricingTitle: e.target.value })} /></div>
      <div className="space-y-2"><Label>Category Filter</Label><Input value={data.pricingCategory || ''} onChange={(e) => onChange({ ...data, pricingCategory: e.target.value })} placeholder="Leave blank for all" /></div>
    </div>
  )
}

const BLOCK_EDITORS: Record<BlockType, React.ComponentType<{ data: BlockData; onChange: (d: BlockData) => void }>> = {
  text: TextBlockEditor, image: ImageBlockEditor, hero: HeroBlockEditor, cta: CtaBlockEditor,
  html: HtmlBlockEditor, carousel: CarouselBlockEditor, testimonials_block: TestimonialsBlockEditor, pricing_block: PricingBlockEditor,
}

export function TenantPageEditor() {
  const { tenantId, pageId } = useParams<{ tenantId: string; pageId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEdit = !!pageId && pageId !== 'new'

  const [seoOpen, setSeoOpen] = useState(false)
  const [addBlockOpen, setAddBlockOpen] = useState(false)
  const [form, setForm] = useState<PageFormData>({
    title: '', slug: '', status: 'draft', parentId: null, template: 'default',
    showInNav: true, navLabel: '', navParentId: null, sortOrder: 0,
    seoTitle: '', seoDescription: '', seoImage: '', blocks: [],
  })

  const setField = useCallback(<K extends keyof PageFormData>(key: K, value: PageFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  useEffect(() => {
    if (!isEdit) setField('slug', slugify(form.title))
  }, [form.title, isEdit, setField])

  const { data: tenant } = useQuery<Tenant>({
    queryKey: ['platform', 'tenant', tenantId],
    queryFn: () => api(`/api/platform/tenants/${tenantId}`),
    enabled: !!tenantId,
  })

  const { data: page, isLoading } = useQuery<PageRecord>({
    queryKey: ['platform', 'tenant-page', tenantId, pageId],
    queryFn: () => tenantApi(tenantId!, `/api/tenant/pages/${pageId}`),
    enabled: isEdit && !!tenantId,
  })

  const { data: allPages = [] } = useQuery<PageListItem[]>({
    queryKey: ['platform', 'tenant-pages', tenantId],
    queryFn: () => tenantApi<PageListItem[]>(tenantId!, '/api/tenant/pages'),
    enabled: !!tenantId,
  })

  useEffect(() => {
    if (page) {
      setForm({
        title: page.title || '',
        slug: page.slug || '',
        status: page.status || 'draft',
        parentId: page.parentId ?? null,
        template: page.template || 'default',
        showInNav: Boolean(page.showInNav),
        navLabel: page.navLabel || '',
        navParentId: page.navParentId ?? null,
        sortOrder: page.sortOrder || 0,
        seoTitle: page.seoTitle || '',
        seoDescription: page.seoDescription || '',
        seoImage: page.seoImage || '',
        blocks: Array.isArray(page.blocks)
          ? page.blocks.map((b) => ({ id: String(b.id), type: (b.blockType as BlockType) || 'text', data: b.blockData || {} }))
          : [],
      })
    }
  }, [page])

  const saveMutation = useMutation({
    mutationFn: (data: PageFormData) => {
      const payload = {
        title: data.title, slug: data.slug, status: data.status, parentId: data.parentId,
        template: data.template, showInNav: data.showInNav, navLabel: data.navLabel,
        navParentId: data.navParentId, sortOrder: data.sortOrder, seoTitle: data.seoTitle,
        seoDescription: data.seoDescription, seoImage: data.seoImage,
        blocks: data.blocks.map((b) => ({ blockType: b.type, blockData: b.data })),
      }
      if (isEdit) return tenantApi(tenantId!, `/api/tenant/pages/${pageId}`, { method: 'PUT', body: payload })
      return tenantApi(tenantId!, '/api/tenant/pages', { method: 'POST', body: payload })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform', 'tenant-pages', tenantId] })
      toast.success(isEdit ? 'Page updated' : 'Page created')
      navigate(`/tenants/${tenantId}/content/pages`)
    },
    onError: () => toast.error('Failed to save page'),
  })

  function addBlock(type: BlockType) {
    setField('blocks', [...form.blocks, { id: generateId(), type, data: {} }])
    setAddBlockOpen(false)
  }
  function updateBlock(blockId: string, data: BlockData) {
    setField('blocks', form.blocks.map((b) => (b.id === blockId ? { ...b, data } : b)))
  }
  function removeBlock(blockId: string) {
    setField('blocks', form.blocks.filter((b) => b.id !== blockId))
  }
  function moveBlock(blockId: string, direction: 'up' | 'down') {
    const index = form.blocks.findIndex((b) => b.id === blockId)
    if (index === -1) return
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= form.blocks.length) return
    const newBlocks = [...form.blocks]
    ;[newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]]
    setField('blocks', newBlocks)
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { toast.error('Page title is required'); return }
    saveMutation.mutate(form)
  }

  const tenantName = tenant?.name ?? `Tenant ${tenantId}`
  const parentOptions = allPages.filter((p) => !pageId || p.id !== Number(pageId))
  const seoTitleDisplay = form.seoTitle || form.title
  const seoDescDisplay = form.seoDescription || ''

  if (isEdit && isLoading) {
    return <div className="flex items-center justify-center p-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" /></div>
  }

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title={isEdit ? (form.title || 'Edit Page') : 'New Page'}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Tenants', href: '/tenants' },
          { label: tenantName, href: `/tenants/${tenantId}` },
          { label: 'Pages', href: `/tenants/${tenantId}/content/pages` },
          { label: isEdit ? (form.title || 'Edit Page') : 'New Page' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => navigate(`/tenants/${tenantId}/content/pages`)}>
              Cancel
            </Button>
            <Button onClick={onSubmit} disabled={saveMutation.isPending}>
              <Save className="mr-1.5 h-4 w-4" />
              {saveMutation.isPending ? 'Saving...' : isEdit ? 'Update Page' : 'Create Page'}
            </Button>
          </div>
        }
      />

      <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-10">
        {/* Left — Content */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <Input
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="Page title"
              className="border-0 bg-transparent px-0 text-2xl font-bold text-gray-900 placeholder:text-gray-300 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-400">/</span>
              <Input id="slug" value={form.slug} onChange={(e) => setField('slug', e.target.value)} placeholder="page-slug" className="font-mono text-sm" />
            </div>
          </div>

          <Separator />

          {/* Blocks */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Content Blocks</h2>
              <span className="text-xs text-gray-400">{form.blocks.length} block{form.blocks.length !== 1 ? 's' : ''}</span>
            </div>

            {form.blocks.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-12 text-center">
                <Type className="mb-3 h-8 w-8 text-gray-300" />
                <p className="text-sm text-gray-500">No content blocks yet.</p>
                <p className="mb-4 text-xs text-gray-400">Add blocks to build the page.</p>
              </div>
            )}

            {form.blocks.map((block, index) => {
              const meta = BLOCK_TYPE_META[block.type]
              const BlockEditor = BLOCK_EDITORS[block.type]
              return (
                <Card key={block.id} className="border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-3 px-4">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-gray-300" />
                      <meta.icon className="h-4 w-4 text-gray-400" />
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{meta.label}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <button type="button" onClick={() => moveBlock(block.id, 'up')} disabled={index === 0} className="rounded-md p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30">
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => moveBlock(block.id, 'down')} disabled={index === form.blocks.length - 1} className="rounded-md p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30">
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => removeBlock(block.id)} className="rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <BlockEditor data={block.data} onChange={(data) => updateBlock(block.id, data)} />
                  </CardContent>
                </Card>
              )
            })}

            <div className="relative">
              <Button type="button" variant="outline" onClick={() => setAddBlockOpen(!addBlockOpen)} className="w-full border-dashed">
                <Plus className="mr-1.5 h-4 w-4" /> Add Block
              </Button>
              {addBlockOpen && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                  {(Object.entries(BLOCK_TYPE_META) as [BlockType, typeof BLOCK_TYPE_META[BlockType]][]).map(([type, meta]) => (
                    <button key={type} type="button" onClick={() => addBlock(type)} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <meta.icon className="h-4 w-4 text-gray-400" />
                      {meta.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right — Sidebar */}
        <div className="lg:col-span-3 space-y-5">
          <Card className="border-gray-200">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Publish</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setField('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Parent Page</Label>
                <Select value={form.parentId ? String(form.parentId) : 'none'} onValueChange={(v) => setField('parentId', v === 'none' ? null : Number(v))}>
                  <SelectTrigger><SelectValue placeholder="None (top-level)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (top-level)</SelectItem>
                    {parentOptions.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Template</Label>
                <Select value={form.template} onValueChange={(v) => setField('template', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="full-width">Full Width</SelectItem>
                    <SelectItem value="sidebar">Sidebar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Navigation</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-in-nav" className="text-sm">Show in navigation</Label>
                <Switch id="show-in-nav" checked={form.showInNav} onCheckedChange={(v) => setField('showInNav', v)} />
              </div>
              {form.showInNav && (
                <>
                  <div className="space-y-2">
                    <Label>Nav Label</Label>
                    <Input value={form.navLabel} onChange={(e) => setField('navLabel', e.target.value)} placeholder={form.title || 'Page title'} />
                  </div>
                  <div className="space-y-2">
                    <Label>Nav Parent</Label>
                    <Select value={form.navParentId ? String(form.navParentId) : 'none'} onValueChange={(v) => setField('navParentId', v === 'none' ? null : Number(v))}>
                      <SelectTrigger><SelectValue placeholder="Top level" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Top level</SelectItem>
                        {parentOptions.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.title}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Sort Order</Label>
                    <Input type="number" value={form.sortOrder} onChange={(e) => setField('sortOrder', Number(e.target.value))} min={0} />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <button type="button" onClick={() => setSeoOpen(!seoOpen)} className="flex w-full items-center justify-between px-6 py-4 text-sm font-semibold text-gray-900">
              SEO Settings
              {seoOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
            </button>
            {seoOpen && (
              <CardContent className="border-t border-gray-200 pt-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>SEO Title</Label>
                    <CharBadge count={seoTitleDisplay.length} max={60} label="Title" />
                  </div>
                  <Input value={form.seoTitle} onChange={(e) => setField('seoTitle', e.target.value)} placeholder={form.title} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>SEO Description</Label>
                    <CharBadge count={seoDescDisplay.length} max={155} label="Desc" />
                  </div>
                  <Textarea value={form.seoDescription} onChange={(e) => setField('seoDescription', e.target.value)} placeholder="Meta description..." rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>OG Image URL</Label>
                  <Input value={form.seoImage} onChange={(e) => setField('seoImage', e.target.value)} placeholder="https://..." />
                </div>
                <Separator />
                <GooglePreview title={seoTitleDisplay} url={`example.com/${form.slug || 'page-slug'}`} description={seoDescDisplay || 'No description set.'} />
              </CardContent>
            )}
          </Card>
        </div>
      </form>
    </div>
  )
}
