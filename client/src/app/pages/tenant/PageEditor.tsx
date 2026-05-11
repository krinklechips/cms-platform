import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
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
  GripVertical,
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
  Upload,
  X,
  Settings,
  Eye,
  Copy,
  ExternalLink,
  Columns2,
  HelpCircle,
  BarChart2,
  Video,
  Users,
  Stethoscope,
  Search,
  Check,
} from 'lucide-react'

// ---------- Types ----------

type BlockType = 'text' | 'image' | 'hero' | 'hero_slideshow' | 'cta' | 'html' | 'carousel' | 'testimonials_block' | 'pricing_block' | 'two_column' | 'faq' | 'stats' | 'video' | 'team_grid' | 'services_grid'

interface BlockData {
  // text
  content?: string
  // image
  url?: string
  alt?: string
  // hero
  heroTitle?: string
  heroSubtitle?: string
  heroImage?: string
  heroImageAlt?: string
  heroImagePosition?: string
  heroImageSize?: string
  heroPreserveFullImage?: boolean
  heroEyebrow?: string
  ctaText?: string
  ctaUrl?: string
  // cta
  buttonText?: string
  buttonUrl?: string
  // html
  html?: string
  // carousel
  slides?: { image: string; title: string; subtitle: string; ctaText: string; ctaUrl: string }[]
  // testimonials_block
  testimonialsTitle?: string
  testimonialsLimit?: number
  // pricing_block
  pricingTitle?: string
  pricingCategory?: string
  // two_column
  leftContent?: string
  rightContent?: string
  leftImage?: string
  rightImage?: string
  columnLayout?: '50-50' | '60-40' | '40-60'
  // faq
  faqTitle?: string
  faqItems?: { question: string; answer: string }[]
  // stats
  statsTitle?: string
  statsItems?: { value: string; label: string; description?: string }[]
  // video
  videoUrl?: string
  videoTitle?: string
  videoCaption?: string
  videoThumbnail?: string
  // team_grid
  teamTitle?: string
  teamLimit?: number
  teamFilter?: string
  // services_grid
  servicesTitle?: string
  servicesLimit?: number
  servicesFilter?: string
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
  parent_id: number | null
  template: string
  show_in_nav: boolean
  nav_label: string
  nav_parent_id: number | null
  sort_order: number
  seo_title: string
  seo_description: string
  seo_image_url: string
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
  updatedAt: string
}

interface PageListItem {
  id: number
  title: string
  slug: string
  parentId: number | null
}

// ---------- Helpers ----------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10)
}

const BLOCK_TYPE_META: Record<BlockType, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  text: { label: 'Text Block', icon: Type },
  image: { label: 'Image', icon: ImageIcon },
  hero: { label: 'Hero Section', icon: Sparkles },
  hero_slideshow: { label: 'Hero Slideshow', icon: GalleryHorizontal },
  cta: { label: 'Call to Action', icon: MousePointerClick },
  html: { label: 'HTML', icon: Code },
  carousel: { label: 'Carousel', icon: GalleryHorizontal },
  testimonials_block: { label: 'Testimonials', icon: Quote },
  pricing_block: { label: 'Pricing / Services', icon: DollarSign },
  two_column: { label: 'Two Columns', icon: Columns2 },
  faq: { label: 'FAQ', icon: HelpCircle },
  stats: { label: 'Stats / Numbers', icon: BarChart2 },
  video: { label: 'Video', icon: Video },
  team_grid: { label: 'Team Grid', icon: Users },
  services_grid: { label: 'Services Grid', icon: Stethoscope },
}

// ---------- Block Renderers ----------

function TextBlockEditor({ data, onChange }: { data: BlockData; onChange: (d: BlockData) => void }) {
  return (
    <div className="space-y-2">
      <Label>Content</Label>
      <RichTextEditor
        value={data.content || ''}
        onChange={(html) => onChange({ ...data, content: html })}
        placeholder="Write your content here..."
      />
    </div>
  )
}

function ImageBlockEditor({ data, onChange }: { data: BlockData; onChange: (d: BlockData) => void }) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>Image</Label>
        <ImageUrlInput value={data.url || ''} onChange={(v) => onChange({ ...data, url: v })} placeholder="https://..." />
      </div>
      <div className="space-y-2">
        <Label>Alt Text</Label>
        <Input
          value={data.alt || ''}
          onChange={(e) => onChange({ ...data, alt: e.target.value })}
          placeholder="Describe the image..."
        />
      </div>
      {data.url && (
        <img
          src={data.url}
          alt={data.alt || 'Preview'}
          className="h-40 w-full rounded-lg border border-gray-200 object-cover"
          onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
        />
      )}
    </div>
  )
}

function HeroBlockEditor({ data, onChange }: { data: BlockData; onChange: (d: BlockData) => void }) {
  const preserveFullImage = data.heroPreserveFullImage ?? false

  return (
    <div className="space-y-4">
      {/* Image preview + upload */}
      <div className="space-y-2">
        <Label>Hero Image</Label>
        {data.heroImage && (
          <div
            className="h-40 w-full rounded-xl border border-gray-200 bg-gray-100 bg-no-repeat"
            style={{
              backgroundImage: `url(${data.heroImage})`,
              backgroundSize: preserveFullImage ? 'contain' : (data.heroImageSize || 'cover'),
              backgroundPosition: data.heroImagePosition || 'center center',
              backgroundRepeat: 'no-repeat',
              backgroundColor: preserveFullImage ? 'white' : undefined,
            }}
          />
        )}
        <ImageUrlInput
          value={data.heroImage || ''}
          onChange={(v) => onChange({ ...data, heroImage: v })}
          placeholder="https://... or /hero/image.jpg"
          folder="hero"
        />
      </div>

      {/* Eyebrow + Title */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Eyebrow Label</Label>
          <Input
            value={data.heroEyebrow || ''}
            onChange={(e) => onChange({ ...data, heroEyebrow: e.target.value })}
            placeholder="e.g. Roomchang team"
          />
        </div>
        <div className="space-y-2">
          <Label>Hero Title</Label>
          <Input
            value={data.heroTitle || ''}
            onChange={(e) => onChange({ ...data, heroTitle: e.target.value })}
            placeholder="Main heading"
          />
        </div>
      </div>

      {/* Subtitle */}
      <div className="space-y-2">
        <Label>Subtitle</Label>
        <Textarea
          value={data.heroSubtitle || ''}
          onChange={(e) => onChange({ ...data, heroSubtitle: e.target.value })}
          placeholder="Supporting text"
          rows={2}
        />
      </div>

      {/* Alt text + Image Position */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Alt Text</Label>
          <Input
            value={data.heroImageAlt || ''}
            onChange={(e) => onChange({ ...data, heroImageAlt: e.target.value })}
            placeholder="Describe the image"
          />
        </div>
        <div className="space-y-2">
          <Label>Image Position</Label>
          <Select
            value={data.heroImagePosition || 'center center'}
            onValueChange={(v) => onChange({ ...data, heroImagePosition: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="center center">Center</SelectItem>
              <SelectItem value="top center">Top</SelectItem>
              <SelectItem value="bottom center">Bottom</SelectItem>
              <SelectItem value="center left">Left</SelectItem>
              <SelectItem value="center right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Image Size (when not preserve) */}
      {!preserveFullImage && (
        <div className="space-y-2">
          <Label>Image Size</Label>
          <Select
            value={data.heroImageSize || 'cover'}
            onValueChange={(v) => onChange({ ...data, heroImageSize: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cover">Cover (fill &amp; crop)</SelectItem>
              <SelectItem value="contain">Contain (fit entire image)</SelectItem>
              <SelectItem value="100% auto">Full width</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Preserve full image */}
      <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-gray-700">Preserve Full Image</p>
          <p className="text-xs text-gray-500">Show entire image without cropping (white bg). Best for group photos.</p>
        </div>
        <Switch
          checked={preserveFullImage}
          onCheckedChange={(v) => onChange({ ...data, heroPreserveFullImage: v, heroImageSize: v ? '100% auto' : 'cover' })}
        />
      </div>

      {/* CTA */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>CTA Button Text</Label>
          <Input
            value={data.ctaText || ''}
            onChange={(e) => onChange({ ...data, ctaText: e.target.value })}
            placeholder="Request An Appointment"
          />
        </div>
        <div className="space-y-2">
          <Label>CTA Button URL</Label>
          <Input
            value={data.ctaUrl || ''}
            onChange={(e) => onChange({ ...data, ctaUrl: e.target.value })}
            placeholder="/contact"
          />
        </div>
      </div>
    </div>
  )
}

interface HeroSlideData {
  id: string
  imageSrc: string
  title: string | null
  eyebrow: string | null
  description: string | null
  imagePosition: string | null
  preserveFullImage: boolean
  published: boolean
}

function HeroSlideshowBlockEditor({ data: _data, onChange: _onChange }: { data: BlockData; onChange: (d: BlockData) => void }) {
  const [slides, setSlides] = useState<HeroSlideData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/tenant/hero/slides', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => { setSlides(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-gray-600" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {slides.length} slide{slides.length !== 1 ? 's' : ''} in the homepage slideshow
        </p>
        <Link
          to="/hero-images"
          className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-100 transition-colors"
        >
          <Sparkles className="h-3 w-3" />
          Manage Slides
        </Link>
      </div>

      {slides.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 px-4 py-8 text-center">
          <GalleryHorizontal className="mx-auto mb-2 h-8 w-8 text-gray-300" />
          <p className="text-sm text-gray-500">No slides yet</p>
          <Link
            to="/hero-images"
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700"
          >
            <Plus className="h-3 w-3" /> Add slides in Hero Images
          </Link>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-3">
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              className={`relative overflow-hidden rounded-xl border bg-white ${
                slide.published ? 'border-gray-200' : 'border-gray-200 opacity-50'
              }`}
            >
              <div
                className="h-24 bg-gray-100 bg-no-repeat"
                style={{
                  backgroundImage: `url(${slide.imageSrc})`,
                  backgroundSize: slide.preserveFullImage ? 'contain' : 'cover',
                  backgroundPosition: slide.imagePosition || 'center',
                  backgroundColor: slide.preserveFullImage ? 'white' : undefined,
                }}
              />
              <div className="px-2.5 py-2">
                {slide.eyebrow && (
                  <p className="text-[9px] font-bold uppercase tracking-wider text-violet-500">{slide.eyebrow}</p>
                )}
                <p className="truncate text-xs font-semibold text-gray-800">{slide.title || 'Untitled'}</p>
              </div>
              <span className="absolute right-1.5 top-1.5 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase text-white bg-black/40 backdrop-blur-sm">
                {i + 1}
              </span>
              {!slide.published && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-gray-500/80 px-1.5 py-0.5 text-[8px] font-bold uppercase text-white">
                  Hidden
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-[11px] text-gray-400">
        Slides are managed in the <Link to="/hero-images" className="text-violet-600 hover:underline">Hero Images</Link> section. Changes there update the live website.
      </p>
    </div>
  )
}

function CtaBlockEditor({ data, onChange }: { data: BlockData; onChange: (d: BlockData) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-2">
        <Label>Button Text</Label>
        <Input
          value={data.buttonText || ''}
          onChange={(e) => onChange({ ...data, buttonText: e.target.value })}
          placeholder="Learn More"
        />
      </div>
      <div className="space-y-2">
        <Label>Button URL</Label>
        <Input
          value={data.buttonUrl || ''}
          onChange={(e) => onChange({ ...data, buttonUrl: e.target.value })}
          placeholder="https://..."
        />
      </div>
    </div>
  )
}

function HtmlBlockEditor({ data, onChange }: { data: BlockData; onChange: (d: BlockData) => void }) {
  return (
    <div className="space-y-2">
      <Label>Raw HTML</Label>
      <Textarea
        value={data.html || ''}
        onChange={(e) => onChange({ ...data, html: e.target.value })}
        placeholder="<div>...</div>"
        rows={8}
        className="font-mono text-sm"
      />
    </div>
  )
}

function CarouselBlockEditor({ data, onChange }: { data: BlockData; onChange: (d: BlockData) => void }) {
  const slides = data.slides || []

  function updateSlide(index: number, field: string, value: string) {
    const updated = slides.map((s, i) =>
      i === index ? { ...s, [field]: value } : s,
    )
    onChange({ ...data, slides: updated })
  }

  function addSlide() {
    onChange({
      ...data,
      slides: [...slides, { image: '', title: '', subtitle: '', ctaText: '', ctaUrl: '' }],
    })
  }

  function removeSlide(index: number) {
    onChange({ ...data, slides: slides.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-4">
      {slides.map((slide, index) => (
        <div key={index} className="rounded-lg border border-gray-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Slide {index + 1}</span>
            <button
              type="button"
              onClick={() => removeSlide(index)}
              className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
              title="Delete slide"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2">
            <Label>Image URL</Label>
            <Input
              value={slide.image}
              onChange={(e) => updateSlide(index, 'image', e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={slide.title}
              onChange={(e) => updateSlide(index, 'title', e.target.value)}
              placeholder="Slide heading"
            />
          </div>
          <div className="space-y-2">
            <Label>Subtitle</Label>
            <Input
              value={slide.subtitle}
              onChange={(e) => updateSlide(index, 'subtitle', e.target.value)}
              placeholder="Supporting text"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>CTA Text</Label>
              <Input
                value={slide.ctaText}
                onChange={(e) => updateSlide(index, 'ctaText', e.target.value)}
                placeholder="Learn More"
              />
            </div>
            <div className="space-y-2">
              <Label>CTA URL</Label>
              <Input
                value={slide.ctaUrl}
                onChange={(e) => updateSlide(index, 'ctaUrl', e.target.value)}
                placeholder="/contact"
              />
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addSlide}
        className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 py-3 text-sm text-gray-500 hover:border-gray-300 hover:text-gray-700"
      >
        <Plus className="h-4 w-4" />
        Add Slide
      </button>
    </div>
  )
}

function TestimonialsBlockEditor({ data, onChange }: { data: BlockData; onChange: (d: BlockData) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Section Title</Label>
        <Input
          value={data.testimonialsTitle ?? 'What Our Clients Say'}
          onChange={(e) => onChange({ ...data, testimonialsTitle: e.target.value })}
          placeholder="What Our Clients Say"
        />
      </div>
      <div className="space-y-2">
        <Label>Number of testimonials to show</Label>
        <Select
          value={String(data.testimonialsLimit ?? 3)}
          onValueChange={(v) => onChange({ ...data, testimonialsLimit: Number(v) })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3</SelectItem>
            <SelectItem value="6">6</SelectItem>
            <SelectItem value="9">9</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <p className="text-xs text-gray-400">Displays featured testimonials from your Testimonials content.</p>
    </div>
  )
}

function PricingBlockEditor({ data, onChange }: { data: BlockData; onChange: (d: BlockData) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Section Title</Label>
        <Input
          value={data.pricingTitle ?? 'Our Services'}
          onChange={(e) => onChange({ ...data, pricingTitle: e.target.value })}
          placeholder="Our Services"
        />
      </div>
      <div className="space-y-2">
        <Label>Category Filter</Label>
        <Input
          value={data.pricingCategory || ''}
          onChange={(e) => onChange({ ...data, pricingCategory: e.target.value })}
          placeholder="Filter by category (leave blank for all)"
        />
      </div>
      <p className="text-xs text-gray-400">Displays published services from your Services &amp; Pricing content.</p>
    </div>
  )
}

/* ================================================================== */
/*  Media Picker Modal                                                  */
/* ================================================================== */

interface MediaItem {
  id: number
  filename: string
  url: string
  mime_type: string
  size: number
}

interface MediaPickerProps {
  open: boolean
  onClose: () => void
  onSelect: (url: string) => void
}

function MediaPickerModal({ open, onClose, onSelect }: MediaPickerProps) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  const { data, isLoading } = useQuery<{ items: MediaItem[]; folders: string[] }>({
    queryKey: ['media-picker'],
    queryFn: () => api('/api/tenant/media'),
    enabled: open,
    staleTime: 30_000,
  })

  const images = (data?.items ?? []).filter((m) => m.mime_type.startsWith('image/'))
  const filtered = search.trim()
    ? images.filter((m) => m.filename.toLowerCase().includes(search.toLowerCase()))
    : images

  function confirm() {
    if (selected) { onSelect(selected); setSelected(null); onClose() }
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex h-[70vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-gray-800">Media Library</h2>
          <button type="button" onClick={onClose} className="rounded p-1 text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="shrink-0 border-b border-gray-100 px-5 py-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-300" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search images…"
              className="h-8 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-violet-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <ImageIcon className="mb-2 h-8 w-8 text-gray-200" />
              <p className="text-sm">{search ? 'No images match your search' : 'No images uploaded yet'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6">
              {filtered.map((item) => {
                const isSel = selected === item.url
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelected(isSel ? null : item.url)}
                    className={`group relative overflow-hidden rounded-lg border-2 transition-all ${isSel ? 'border-violet-500 ring-2 ring-violet-200' : 'border-gray-100 hover:border-gray-300'}`}
                  >
                    <img
                      src={item.url}
                      alt={item.filename}
                      className="h-20 w-full object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                    />
                    {isSel && (
                      <div className="absolute inset-0 flex items-center justify-center bg-violet-600/40">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <p className="truncate px-1 py-1 text-[9px] text-gray-500">{item.filename}</p>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-gray-200 px-5 py-3">
          <p className="text-xs text-gray-400">{filtered.length} image{filtered.length !== 1 ? 's' : ''}</p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="button" size="sm" disabled={!selected} onClick={confirm}>
              Insert Image
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Helper: image-url input with media picker button ── */
function ImageUrlInput({
  value,
  onChange,
  placeholder = 'https://… or /path/to/image.jpg',
  folder = 'pages',
}: {
  value: string
  onChange: (url: string) => void
  placeholder?: string
  folder?: string
}) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('folder', folder)
      const result = await api<{ media: { url: string } }>('/api/tenant/media/upload', { method: 'POST', body: form })
      onChange(result.media?.url ?? '')
      toast.success('Uploaded')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)} title="Browse media library">
          <ImageIcon className="h-3.5 w-3.5" />
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading} title="Upload new file">
          {uploading ? <div className="h-3.5 w-3.5 animate-spin rounded-full border border-gray-300 border-t-gray-600" /> : <Upload className="h-3.5 w-3.5" />}
        </Button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>
      <MediaPickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={onChange} />
    </>
  )
}

/* ================================================================== */
/*  New Block Editors                                                   */
/* ================================================================== */

function TwoColumnBlockEditor({ data, onChange }: { data: BlockData; onChange: (d: BlockData) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Layout</Label>
        <Select
          value={data.columnLayout || '50-50'}
          onValueChange={(v) => onChange({ ...data, columnLayout: v as BlockData['columnLayout'] })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="50-50">50 / 50 (equal)</SelectItem>
            <SelectItem value="60-40">60 / 40 (text heavy left)</SelectItem>
            <SelectItem value="40-60">40 / 60 (text heavy right)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-gray-200 p-3 space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Left Column</p>
        <div className="space-y-2">
          <Label>Image (optional)</Label>
          <ImageUrlInput value={data.leftImage || ''} onChange={(v) => onChange({ ...data, leftImage: v })} />
          {data.leftImage && <img src={data.leftImage} alt="" className="h-28 w-full rounded-lg border object-cover" />}
        </div>
        <div className="space-y-2">
          <Label>Text Content</Label>
          <RichTextEditor value={data.leftContent || ''} onChange={(v) => onChange({ ...data, leftContent: v })} placeholder="Left column content…" />
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 p-3 space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Right Column</p>
        <div className="space-y-2">
          <Label>Image (optional)</Label>
          <ImageUrlInput value={data.rightImage || ''} onChange={(v) => onChange({ ...data, rightImage: v })} />
          {data.rightImage && <img src={data.rightImage} alt="" className="h-28 w-full rounded-lg border object-cover" />}
        </div>
        <div className="space-y-2">
          <Label>Text Content</Label>
          <RichTextEditor value={data.rightContent || ''} onChange={(v) => onChange({ ...data, rightContent: v })} placeholder="Right column content…" />
        </div>
      </div>
    </div>
  )
}

function FaqBlockEditor({ data, onChange }: { data: BlockData; onChange: (d: BlockData) => void }) {
  const items = data.faqItems || []

  function updateItem(index: number, field: 'question' | 'answer', value: string) {
    onChange({ ...data, faqItems: items.map((it, i) => i === index ? { ...it, [field]: value } : it) })
  }

  function addItem() {
    onChange({ ...data, faqItems: [...items, { question: '', answer: '' }] })
  }

  function removeItem(index: number) {
    onChange({ ...data, faqItems: items.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Section Title</Label>
        <Input
          value={data.faqTitle || ''}
          onChange={(e) => onChange({ ...data, faqTitle: e.target.value })}
          placeholder="Frequently Asked Questions"
        />
      </div>
      {items.map((item, index) => (
        <div key={index} className="rounded-lg border border-gray-200 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">Q{index + 1}</span>
            <button type="button" onClick={() => removeItem(index)} className="rounded p-0.5 text-gray-300 hover:text-red-500">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <Input
            value={item.question}
            onChange={(e) => updateItem(index, 'question', e.target.value)}
            placeholder="Question"
          />
          <Textarea
            value={item.answer}
            onChange={(e) => updateItem(index, 'answer', e.target.value)}
            placeholder="Answer"
            rows={2}
          />
        </div>
      ))}
      <button type="button" onClick={addItem} className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 py-3 text-sm text-gray-500 hover:border-gray-300">
        <Plus className="h-4 w-4" /> Add Question
      </button>
    </div>
  )
}

function StatsBlockEditor({ data, onChange }: { data: BlockData; onChange: (d: BlockData) => void }) {
  const items = data.statsItems || []

  function updateItem(index: number, field: keyof (typeof items)[0], value: string) {
    onChange({ ...data, statsItems: items.map((it, i) => i === index ? { ...it, [field]: value } : it) })
  }

  function addItem() {
    onChange({ ...data, statsItems: [...items, { value: '', label: '', description: '' }] })
  }

  function removeItem(index: number) {
    onChange({ ...data, statsItems: items.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Section Title (optional)</Label>
        <Input value={data.statsTitle || ''} onChange={(e) => onChange({ ...data, statsTitle: e.target.value })} placeholder="By the Numbers" />
      </div>
      {items.map((item, index) => (
        <div key={index} className="rounded-lg border border-gray-200 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">Stat {index + 1}</span>
            <button type="button" onClick={() => removeItem(index)} className="rounded p-0.5 text-gray-300 hover:text-red-500">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Value</Label>
              <Input value={item.value} onChange={(e) => updateItem(index, 'value', e.target.value)} placeholder="37+" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Label</Label>
              <Input value={item.label} onChange={(e) => updateItem(index, 'label', e.target.value)} placeholder="Specialist Dentists" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Description (optional)</Label>
            <Input value={item.description || ''} onChange={(e) => updateItem(index, 'description', e.target.value)} placeholder="Short supporting text" />
          </div>
        </div>
      ))}
      <button type="button" onClick={addItem} className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 py-3 text-sm text-gray-500 hover:border-gray-300">
        <Plus className="h-4 w-4" /> Add Stat
      </button>
    </div>
  )
}

function VideoBlockEditor({ data, onChange }: { data: BlockData; onChange: (d: BlockData) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Video URL</Label>
        <Input
          value={data.videoUrl || ''}
          onChange={(e) => onChange({ ...data, videoUrl: e.target.value })}
          placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
        />
        <p className="text-[10px] text-gray-400">Supports YouTube, Vimeo, and direct mp4 URLs</p>
      </div>
      <div className="space-y-2">
        <Label>Thumbnail Image (optional)</Label>
        <ImageUrlInput value={data.videoThumbnail || ''} onChange={(v) => onChange({ ...data, videoThumbnail: v })} placeholder="Poster image before video plays" />
        {data.videoThumbnail && <img src={data.videoThumbnail} alt="" className="h-28 w-full rounded-lg border object-cover" />}
      </div>
      <div className="space-y-2">
        <Label>Title (optional)</Label>
        <Input value={data.videoTitle || ''} onChange={(e) => onChange({ ...data, videoTitle: e.target.value })} placeholder="Video heading" />
      </div>
      <div className="space-y-2">
        <Label>Caption (optional)</Label>
        <Textarea value={data.videoCaption || ''} onChange={(e) => onChange({ ...data, videoCaption: e.target.value })} placeholder="Short description below the video" rows={2} />
      </div>
    </div>
  )
}

function TeamGridBlockEditor({ data, onChange }: { data: BlockData; onChange: (d: BlockData) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Section Title</Label>
        <Input value={data.teamTitle || ''} onChange={(e) => onChange({ ...data, teamTitle: e.target.value })} placeholder="Meet Our Specialists" />
      </div>
      <div className="space-y-2">
        <Label>Specialty Filter (optional)</Label>
        <Input value={data.teamFilter || ''} onChange={(e) => onChange({ ...data, teamFilter: e.target.value })} placeholder="e.g. Implantologist (leave blank for all)" />
      </div>
      <div className="space-y-2">
        <Label>Max team members to show</Label>
        <Select value={String(data.teamLimit ?? 8)} onValueChange={(v) => onChange({ ...data, teamLimit: Number(v) })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {[4, 6, 8, 12, 999].map((n) => <SelectItem key={n} value={String(n)}>{n === 999 ? 'All' : n}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <p className="text-xs text-gray-400">Displays published team members from your Team Members content.</p>
    </div>
  )
}

function ServicesGridBlockEditor({ data, onChange }: { data: BlockData; onChange: (d: BlockData) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Section Title</Label>
        <Input value={data.servicesTitle || ''} onChange={(e) => onChange({ ...data, servicesTitle: e.target.value })} placeholder="Our Services" />
      </div>
      <div className="space-y-2">
        <Label>Category Filter (optional)</Label>
        <Input value={data.servicesFilter || ''} onChange={(e) => onChange({ ...data, servicesFilter: e.target.value })} placeholder="e.g. Cosmetic (leave blank for all)" />
      </div>
      <div className="space-y-2">
        <Label>Max services to show</Label>
        <Select value={String(data.servicesLimit ?? 6)} onValueChange={(v) => onChange({ ...data, servicesLimit: Number(v) })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {[3, 6, 9, 12, 999].map((n) => <SelectItem key={n} value={String(n)}>{n === 999 ? 'All' : n}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <p className="text-xs text-gray-400">Displays published services from your Services &amp; Pricing content.</p>
    </div>
  )
}

const BLOCK_EDITORS: Record<BlockType, React.ComponentType<{ data: BlockData; onChange: (d: BlockData) => void }>> = {
  text: TextBlockEditor,
  image: ImageBlockEditor,
  hero: HeroBlockEditor,
  hero_slideshow: HeroSlideshowBlockEditor,
  cta: CtaBlockEditor,
  html: HtmlBlockEditor,
  carousel: CarouselBlockEditor,
  testimonials_block: TestimonialsBlockEditor,
  pricing_block: PricingBlockEditor,
  two_column: TwoColumnBlockEditor,
  faq: FaqBlockEditor,
  stats: StatsBlockEditor,
  video: VideoBlockEditor,
  team_grid: TeamGridBlockEditor,
  services_grid: ServicesGridBlockEditor,
}

// ---------- Visual Page Preview ----------

const RC: React.CSSProperties = {
  '--brand': '#cc3771',
  '--brand-deep': '#7e2f66',
  '--brand-soft': '#f7d6e2',
  '--text-main': '#2c1a28',
  '--text-soft': '#705569',
  '--border-strong': '#e8d5e0',
  '--surface': '#fdf8fa',
} as React.CSSProperties

function HeroPreview({ data }: { data: BlockData }) {
  const hasBg = !!data.heroImage
  const bgStyle: React.CSSProperties = hasBg
    ? { backgroundImage: `url(${data.heroImage})`, backgroundSize: data.heroImageSize === 'contain' ? 'contain' : 'cover', backgroundPosition: data.heroImagePosition || 'center', backgroundRepeat: 'no-repeat' }
    : {}
  return (
    <div style={{ position: 'relative', overflow: 'hidden', backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border-strong)', ...bgStyle }}>
      {hasBg && <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(44,26,40,0.35)' }} />}
      <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto', padding: '60px 32px' }}>
        {data.heroEyebrow && (
          <p style={{ color: hasBg ? 'rgba(255,255,255,0.8)' : 'var(--brand)', fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', margin: 0 }}>
            {data.heroEyebrow}
          </p>
        )}
        <h1 style={{ color: hasBg ? 'white' : 'var(--text-main)', fontSize: '2.4rem', fontFamily: '"Cormorant Garamond", Georgia, serif', lineHeight: 1.1, marginTop: 10, marginBottom: 0 }}>
          {data.heroTitle || <span style={{ opacity: 0.3 }}>Page Title</span>}
        </h1>
        {data.heroSubtitle && (
          <p style={{ color: hasBg ? 'rgba(255,255,255,0.85)' : 'var(--text-soft)', fontSize: 13, lineHeight: 1.7, marginTop: 14, maxWidth: 560, marginBottom: 0 }}>
            {data.heroSubtitle}
          </p>
        )}
        {data.ctaText && (
          <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
            <span style={{ backgroundColor: 'var(--brand)', color: 'white', padding: '9px 20px', borderRadius: 9999, fontSize: 12, fontWeight: 600, display: 'inline-block' }}>
              {data.ctaText}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function TextPreview({ data }: { data: BlockData }) {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px' }}>
      {data.content ? (
        <div style={{ color: 'var(--text-soft)', fontSize: 13, lineHeight: 1.75 }} dangerouslySetInnerHTML={{ __html: data.content }} />
      ) : (
        <p style={{ color: 'var(--text-soft)', opacity: 0.4, fontSize: 13, fontStyle: 'italic' }}>Text content will appear here…</p>
      )}
    </div>
  )
}

function ImagePreview({ data }: { data: BlockData }) {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 32px' }}>
      {data.url ? (
        <img src={data.url} alt={data.alt || ''} style={{ width: '100%', borderRadius: 12, maxHeight: 360, objectFit: 'cover', display: 'block' }} />
      ) : (
        <div style={{ height: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', borderRadius: 12, gap: 8 }}>
          <ImageIcon style={{ width: 36, height: 36, color: '#d1d5db' }} />
          <span style={{ fontSize: 12, color: '#9ca3af' }}>No image set</span>
        </div>
      )}
    </div>
  )
}

function CtaPreview({ data }: { data: BlockData }) {
  return (
    <div style={{ backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border-strong)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <p style={{ color: 'var(--text-main)', fontSize: '1.4rem', fontFamily: '"Cormorant Garamond", Georgia, serif', margin: 0 }}>
          {data.buttonText || <span style={{ opacity: 0.3 }}>Call to action text</span>}
        </p>
        <span style={{ backgroundColor: 'var(--brand)', color: 'white', padding: '10px 22px', borderRadius: 9999, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
          {data.buttonText || 'Learn More'}
        </span>
      </div>
    </div>
  )
}

function HtmlPreview({ data }: { data: BlockData }) {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 32px' }}>
      {data.html ? (
        <div dangerouslySetInnerHTML={{ __html: data.html }} />
      ) : (
        <div style={{ border: '2px dashed #e5e7eb', borderRadius: 8, padding: 24, textAlign: 'center' }}>
          <Code style={{ width: 28, height: 28, color: '#d1d5db', margin: '0 auto 8px' }} />
          <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>HTML block — content will appear here</p>
        </div>
      )}
    </div>
  )
}

function CarouselPreview({ data }: { data: BlockData }) {
  const slides = data.slides || []
  const first = slides[0]
  if (!first) return <PlaceholderSectionPreview label="Carousel" note="No slides added yet" />
  return (
    <div style={{ position: 'relative', minHeight: 280, overflow: 'hidden', backgroundColor: '#1a1a2e', backgroundImage: first.image ? `url(${first.image})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      {first.image && <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} />}
      <div style={{ position: 'relative', textAlign: 'center', padding: '60px 32px' }}>
        <h2 style={{ color: 'white', fontSize: '2rem', fontFamily: '"Cormorant Garamond", Georgia, serif', margin: 0 }}>{first.title || 'Slide Title'}</h2>
        {first.subtitle && <p style={{ color: 'rgba(255,255,255,0.85)', marginTop: 8, fontSize: 13 }}>{first.subtitle}</p>}
        {first.ctaText && (
          <span style={{ display: 'inline-block', marginTop: 20, backgroundColor: 'var(--brand)', color: 'white', padding: '9px 20px', borderRadius: 9999, fontSize: 12, fontWeight: 600 }}>
            {first.ctaText}
          </span>
        )}
      </div>
      {slides.length > 1 && (
        <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6 }}>
          {slides.map((_, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: i === 0 ? 'white' : 'rgba(255,255,255,0.35)' }} />
          ))}
        </div>
      )}
    </div>
  )
}

function PlaceholderSectionPreview({ label, note }: { label: string; note?: string }) {
  return (
    <div style={{ backgroundColor: 'var(--brand-soft)', padding: '40px 32px', textAlign: 'center' }}>
      <p style={{ color: 'var(--brand-deep)', fontSize: 13, fontWeight: 600, margin: 0 }}>{label}</p>
      {note && <p style={{ color: 'var(--text-soft)', fontSize: 11, marginTop: 4, margin: '4px 0 0' }}>{note}</p>}
    </div>
  )
}

function TwoColumnPreview({ data }: { data: BlockData }) {
  const layout = data.columnLayout || '50-50'
  const [leftW, rightW] = layout === '60-40' ? ['60%', '40%'] : layout === '40-60' ? ['40%', '60%'] : ['50%', '50%']
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px', display: 'flex', gap: 32 }}>
      <div style={{ width: leftW }}>
        {data.leftImage && <img src={data.leftImage} alt="" style={{ width: '100%', borderRadius: 10, marginBottom: 16, maxHeight: 200, objectFit: 'cover' }} />}
        {data.leftContent ? (
          <div style={{ color: 'var(--text-soft)', fontSize: 13, lineHeight: 1.75 }} dangerouslySetInnerHTML={{ __html: data.leftContent }} />
        ) : (
          <p style={{ color: 'var(--text-soft)', opacity: 0.3, fontSize: 13, fontStyle: 'italic' }}>Left column content…</p>
        )}
      </div>
      <div style={{ width: rightW }}>
        {data.rightImage && <img src={data.rightImage} alt="" style={{ width: '100%', borderRadius: 10, marginBottom: 16, maxHeight: 200, objectFit: 'cover' }} />}
        {data.rightContent ? (
          <div style={{ color: 'var(--text-soft)', fontSize: 13, lineHeight: 1.75 }} dangerouslySetInnerHTML={{ __html: data.rightContent }} />
        ) : (
          <p style={{ color: 'var(--text-soft)', opacity: 0.3, fontSize: 13, fontStyle: 'italic' }}>Right column content…</p>
        )}
      </div>
    </div>
  )
}

function FaqPreview({ data }: { data: BlockData }) {
  const items = data.faqItems || []
  if (items.length === 0) return <PlaceholderSectionPreview label="FAQ" note="No questions added yet" />
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px' }}>
      {data.faqTitle && <h2 style={{ color: 'var(--text-main)', fontSize: '1.8rem', fontFamily: '"Cormorant Garamond", Georgia, serif', margin: '0 0 24px' }}>{data.faqTitle}</h2>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((item, i) => (
          <div key={i} style={{ borderBottom: '1px solid var(--border-strong)', paddingBottom: 12 }}>
            <p style={{ color: 'var(--text-main)', fontSize: 14, fontWeight: 600, margin: '0 0 6px' }}>{item.question || <span style={{ opacity: 0.3 }}>Question…</span>}</p>
            {item.answer && <p style={{ color: 'var(--text-soft)', fontSize: 12, lineHeight: 1.6, margin: 0 }}>{item.answer}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

function StatsPreview({ data }: { data: BlockData }) {
  const items = data.statsItems || []
  if (items.length === 0) return <PlaceholderSectionPreview label="Stats / Numbers" note="No stats added yet" />
  return (
    <div style={{ backgroundColor: 'var(--brand-soft)', padding: '48px 32px' }}>
      {data.statsTitle && <h2 style={{ textAlign: 'center', color: 'var(--text-main)', fontSize: '1.6rem', fontFamily: '"Cormorant Garamond", Georgia, serif', margin: '0 0 28px' }}>{data.statsTitle}</h2>}
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
        {items.map((item, i) => (
          <div key={i} style={{ textAlign: 'center', minWidth: 120 }}>
            <p style={{ color: 'var(--brand)', fontSize: '2.2rem', fontFamily: '"Cormorant Garamond", Georgia, serif', fontWeight: 700, margin: 0 }}>{item.value}</p>
            <p style={{ color: 'var(--text-main)', fontSize: 12, fontWeight: 600, margin: '4px 0 2px' }}>{item.label}</p>
            {item.description && <p style={{ color: 'var(--text-soft)', fontSize: 11, margin: 0 }}>{item.description}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

function VideoPreview({ data }: { data: BlockData }) {
  if (!data.videoUrl && !data.videoThumbnail) return <PlaceholderSectionPreview label="Video" note="No video URL set" />
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px' }}>
      {data.videoTitle && <h2 style={{ color: 'var(--text-main)', fontSize: '1.6rem', fontFamily: '"Cormorant Garamond", Georgia, serif', margin: '0 0 16px' }}>{data.videoTitle}</h2>}
      <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: 12, overflow: 'hidden', backgroundColor: '#111', backgroundImage: data.videoThumbnail ? `url(${data.videoThumbnail})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 0, height: 0, borderTop: '10px solid transparent', borderBottom: '10px solid transparent', borderLeft: '18px solid var(--brand)', marginLeft: 4 }} />
          </div>
        </div>
        {data.videoUrl && (
          <p style={{ position: 'absolute', bottom: 10, left: 12, color: 'rgba(255,255,255,0.7)', fontSize: 10, margin: 0, fontFamily: 'monospace', maxWidth: '80%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.videoUrl}</p>
        )}
      </div>
      {data.videoCaption && <p style={{ color: 'var(--text-soft)', fontSize: 12, marginTop: 10 }}>{data.videoCaption}</p>}
    </div>
  )
}

function BlockPreview({ block }: { block: Block }) {
  switch (block.type) {
    case 'hero': return <HeroPreview data={block.data} />
    case 'text': return <TextPreview data={block.data} />
    case 'image': return <ImagePreview data={block.data} />
    case 'cta': return <CtaPreview data={block.data} />
    case 'html': return <HtmlPreview data={block.data} />
    case 'carousel': return <CarouselPreview data={block.data} />
    case 'two_column': return <TwoColumnPreview data={block.data} />
    case 'faq': return <FaqPreview data={block.data} />
    case 'stats': return <StatsPreview data={block.data} />
    case 'video': return <VideoPreview data={block.data} />
    case 'hero_slideshow': return <PlaceholderSectionPreview label="Hero Slideshow" note="Live slides from Hero Images manager" />
    case 'testimonials_block': return <PlaceholderSectionPreview label="Testimonials" note="Pulls featured testimonials dynamically" />
    case 'pricing_block': return <PlaceholderSectionPreview label="Pricing / Services" note="Pulls published services dynamically" />
    case 'team_grid': return <PlaceholderSectionPreview label="Team Grid" note={`Shows ${block.data.teamFilter ? block.data.teamFilter + ' · ' : ''}up to ${block.data.teamLimit ?? 8} team members`} />
    case 'services_grid': return <PlaceholderSectionPreview label="Services Grid" note={`Shows ${block.data.servicesFilter ? block.data.servicesFilter + ' · ' : ''}up to ${block.data.servicesLimit ?? 6} services`} />
    default: return null
  }
}

// ---------- Main Component ----------

export function PageEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEdit = !!id

  const [seoOpen, setSeoOpen] = useState(false)
  const [addBlockOpen, setAddBlockOpen] = useState(false)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [rightPanel, setRightPanel] = useState<'settings' | 'block'>('settings')
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const lastSavedForm = useRef<PageFormData | null>(null)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Form state
  const [form, setForm] = useState<PageFormData>({
    title: '',
    slug: '',
    status: 'draft',
    parent_id: null,
    template: 'default',
    show_in_nav: false,
    nav_label: '',
    nav_parent_id: null,
    sort_order: 0,
    seo_title: '',
    seo_description: '',
    seo_image_url: '',
    blocks: [],
  })

  const setField = useCallback(<K extends keyof PageFormData>(key: K, value: PageFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  // Auto-generate slug from title (only when creating)
  useEffect(() => {
    if (!isEdit) {
      setField('slug', slugify(form.title))
    }
  }, [form.title, isEdit, setField])

  // Fetch existing page
  const { data: page, isLoading } = useQuery<PageRecord>({
    queryKey: ['tenant', 'page', id],
    queryFn: () => api(`/api/tenant/pages/${id}`),
    enabled: isEdit,
  })

  // Fetch all pages for parent selectors
  const { data: allPages = [] } = useQuery<PageListItem[]>({
    queryKey: ['tenant', 'pages'],
    queryFn: () => api('/api/tenant/pages'),
  })

  // Populate form when page loads
  useEffect(() => {
    if (page) {
      const loaded: PageFormData = {
        title: page.title || '',
        slug: page.slug || '',
        status: page.status || 'draft',
        parent_id: page.parentId ?? null,
        template: page.template || 'default',
        show_in_nav: Boolean(page.showInNav),
        nav_label: page.navLabel || '',
        nav_parent_id: page.navParentId ?? null,
        sort_order: page.sortOrder || 0,
        seo_title: page.seoTitle || '',
        seo_description: page.seoDescription || '',
        seo_image_url: page.seoImage || '',
        blocks: Array.isArray(page.blocks)
          ? page.blocks.map((b) => ({
              id: String(b.id),
              type: (b.blockType as BlockType) || 'text',
              data: b.blockData || {},
            }))
          : [],
      }
      setForm(loaded)
      lastSavedForm.current = loaded
      setAutoSaveStatus('idle')
    }
  }, [page])

  // Autosave (debounced 4 s, edit mode only)
  useEffect(() => {
    if (!isEdit || !lastSavedForm.current) return
    if (JSON.stringify(form) === JSON.stringify(lastSavedForm.current)) return
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    setAutoSaveStatus('idle')
    autoSaveTimer.current = setTimeout(async () => {
      setAutoSaveStatus('saving')
      try {
        const payload = {
          title: form.title,
          slug: form.slug,
          status: form.status,
          parentId: form.parent_id,
          template: form.template,
          showInNav: form.show_in_nav,
          navLabel: form.nav_label,
          navParentId: form.nav_parent_id,
          sortOrder: form.sort_order,
          seoTitle: form.seo_title,
          seoDescription: form.seo_description,
          seoImage: form.seo_image_url,
          blocks: form.blocks.map((b) => ({ blockType: b.type, blockData: b.data })),
        }
        await api(`/api/tenant/pages/${id}`, { method: 'PUT', body: payload })
        lastSavedForm.current = form
        setAutoSaveStatus('saved')
        queryClient.invalidateQueries({ queryKey: ['tenant', 'pages'] })
      } catch {
        setAutoSaveStatus('idle')
      }
    }, 4000)
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, isEdit, id])

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (data: PageFormData) => {
      const payload = {
        title: data.title,
        slug: data.slug,
        status: data.status,
        parentId: data.parent_id,
        template: data.template,
        showInNav: data.show_in_nav,
        navLabel: data.nav_label,
        navParentId: data.nav_parent_id,
        sortOrder: data.sort_order,
        seoTitle: data.seo_title,
        seoDescription: data.seo_description,
        seoImage: data.seo_image_url,
        blocks: data.blocks.map((b) => ({ blockType: b.type, blockData: b.data })),
      }
      if (isEdit) {
        return api(`/api/tenant/pages/${id}`, { method: 'PUT', body: payload })
      }
      return api('/api/tenant/pages', { method: 'POST', body: payload })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'pages'] })
      queryClient.invalidateQueries({ queryKey: ['tenant', 'page', id] })
      toast.success(isEdit ? 'Page updated' : 'Page created')
      navigate('/pages')
    },
    onError: () => {
      toast.error('Failed to save page')
    },
  })

  // Block operations
  function addBlock(type: BlockType) {
    setField('blocks', [
      ...form.blocks,
      { id: generateId(), type, data: {} },
    ])
    setAddBlockOpen(false)
  }

  function updateBlock(blockId: string, data: BlockData) {
    setField(
      'blocks',
      form.blocks.map((b) => (b.id === blockId ? { ...b, data } : b)),
    )
  }

  function removeBlock(blockId: string) {
    setField(
      'blocks',
      form.blocks.filter((b) => b.id !== blockId),
    )
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

  function duplicateBlock(blockId: string) {
    const index = form.blocks.findIndex((b) => b.id === blockId)
    if (index === -1) return
    const original = form.blocks[index]
    const copy: Block = { ...original, id: generateId(), data: { ...original.data } }
    const newBlocks = [...form.blocks]
    newBlocks.splice(index + 1, 0, copy)
    setField('blocks', newBlocks)
    setSelectedBlockId(copy.id)
    setRightPanel('block')
  }

  function reorderBlock(fromId: string, toId: string) {
    if (fromId === toId) return
    const fromIndex = form.blocks.findIndex((b) => b.id === fromId)
    const toIndex = form.blocks.findIndex((b) => b.id === toId)
    if (fromIndex === -1 || toIndex === -1) return
    const newBlocks = [...form.blocks]
    const [moved] = newBlocks.splice(fromIndex, 1)
    newBlocks.splice(toIndex, 0, moved)
    setField('blocks', newBlocks)
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Page title is required')
      return
    }
    saveMutation.mutate(form)
  }

  // Filter pages for parent selectors (exclude self)
  const parentOptions = allPages.filter((p) => !id || p.id !== Number(id))

  // SEO display values
  const seoTitleDisplay = form.seo_title || form.title
  const seoDescDisplay = form.seo_description || ''

  // Build breadcrumb ancestry from parent chain
  const parentBreadcrumbs = (() => {
    const crumbs: { label: string; href?: string }[] = []
    const pageMap = new Map(allPages.map((p) => [p.id, p]))
    let currentParentId = form.parent_id
    const visited = new Set<number>()
    while (currentParentId && !visited.has(currentParentId)) {
      visited.add(currentParentId)
      const parent = pageMap.get(currentParentId)
      if (!parent) break
      crumbs.unshift({ label: parent.title, href: `/pages/${parent.id}/edit` })
      currentParentId = parent.parentId ?? null
    }
    return crumbs
  })()

  // Compute full URL path (e.g. /services/crowns-bridges) from the parent chain + own slug
  const fullUrlPath = (() => {
    const pageMap = new Map(allPages.map((p) => [p.id, p]))
    const parts: string[] = []
    let currentParentId = form.parent_id
    const visited = new Set<number>()
    while (currentParentId && !visited.has(currentParentId)) {
      visited.add(currentParentId)
      const parent = pageMap.get(currentParentId)
      if (!parent) break
      parts.unshift(parent.slug)
      currentParentId = parent.parentId ?? null
    }
    if (form.slug) parts.push(form.slug)
    return parts.length > 0 ? '/' + parts.join('/') : '/'
  })()

  if (isEdit && isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    )
  }

  // When a block is clicked in the preview, select it and switch panel
  function selectBlock(blockId: string) {
    setSelectedBlockId(blockId)
    setRightPanel('block')
    setAddBlockOpen(false)
  }

  const selectedBlock = form.blocks.find((b) => b.id === selectedBlockId) ?? null
  const selectedBlockIndex = selectedBlock ? form.blocks.indexOf(selectedBlock) : -1

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      {/* ── Top bar ── */}
      <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-5 py-3">
        <div className="flex min-w-0 flex-col">
          <nav className="flex items-center gap-1 text-xs text-gray-400">
            {[{ label: 'Overview', href: '/' }, { label: 'Pages', href: '/pages' }, ...parentBreadcrumbs].map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span>›</span>}
                {crumb.href ? (
                  <Link to={crumb.href} className="hover:text-gray-600">{crumb.label}</Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </span>
            ))}
            <span>›</span>
            <span className="text-gray-600 font-medium">{form.title || 'New Page'}</span>
          </nav>
          <div className="mt-1 flex items-center gap-2">
            <Input
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="Page title"
              className="h-7 border-0 bg-transparent p-0 text-base font-bold text-gray-900 placeholder:text-gray-300 focus-visible:ring-0 focus-visible:ring-offset-0 w-64"
            />
            <span className="text-xs text-gray-300">/</span>
            <Input
              value={form.slug}
              onChange={(e) => setField('slug', e.target.value)}
              placeholder="page-slug"
              className="h-7 w-48 font-mono text-xs text-gray-500"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Autosave indicator */}
          {isEdit && autoSaveStatus !== 'idle' && (
            <span className={`text-[11px] ${autoSaveStatus === 'saving' ? 'text-gray-400' : 'text-green-600'}`}>
              {autoSaveStatus === 'saving' ? 'Saving…' : '✓ Autosaved'}
            </span>
          )}
          {/* Preview — wired for future CMS integration */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled
            title="Preview will be available once the CMS is connected to the live site"
          >
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
            Preview
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => navigate('/pages')}>
            Cancel
          </Button>
          <Button size="sm" onClick={onSubmit} disabled={saveMutation.isPending}>
            <Save className="mr-1.5 h-3.5 w-3.5" />
            {saveMutation.isPending ? 'Saving…' : isEdit ? 'Publish' : 'Create Page'}
          </Button>
        </div>
      </div>

      {/* ── 3-column body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: Block list ── */}
        <div className="flex w-52 shrink-0 flex-col border-r border-gray-200 bg-white">
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {form.blocks.length === 0 && (
              <p className="py-6 text-center text-xs text-gray-400">No blocks yet</p>
            )}
            {form.blocks.map((block, index) => {
              const meta = BLOCK_TYPE_META[block.type as BlockType] ?? { label: block.type, icon: Code }
              const MetaIcon = meta.icon
              const isSelected = selectedBlockId === block.id
              const isDragging = draggedId === block.id
              const isDragOver = dragOverId === block.id && draggedId !== block.id
              return (
                <div
                  key={block.id}
                  draggable
                  onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; setDraggedId(block.id) }}
                  onDragEnd={() => { setDraggedId(null); setDragOverId(null) }}
                  onDragOver={(e) => { e.preventDefault(); setDragOverId(block.id) }}
                  onDrop={(e) => { e.preventDefault(); if (draggedId) reorderBlock(draggedId, block.id); setDraggedId(null); setDragOverId(null) }}
                  className={`group relative rounded-md transition-all ${isDragging ? 'opacity-40' : ''} ${isDragOver ? 'ring-2 ring-violet-400 ring-offset-1' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => selectBlock(block.id)}
                    className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs transition-colors ${
                      isSelected ? 'bg-violet-50 text-violet-700 ring-1 ring-violet-200' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <GripVertical className="h-3 w-3 shrink-0 cursor-grab text-gray-300 group-hover:text-gray-400" />
                    <MetaIcon className="h-3.5 w-3.5 shrink-0" />
                    <span className="flex-1 truncate">{meta.label}</span>
                    <div className="flex shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                      <button type="button" onClick={() => moveBlock(block.id, 'up')} disabled={index === 0} className="rounded p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20">
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button type="button" onClick={() => moveBlock(block.id, 'down')} disabled={index === form.blocks.length - 1} className="rounded p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20">
                        <ArrowDown className="h-3 w-3" />
                      </button>
                      <button type="button" onClick={() => duplicateBlock(block.id)} className="rounded p-0.5 text-gray-300 hover:text-gray-600">
                        <Copy className="h-3 w-3" />
                      </button>
                      <button type="button" onClick={() => { removeBlock(block.id); if (selectedBlockId === block.id) setSelectedBlockId(null) }} className="rounded p-0.5 text-gray-300 hover:text-red-500">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </button>
                </div>
              )
            })}
          </div>
          {/* Add block */}
          <div className="shrink-0 border-t border-gray-100 p-3">
            <div className="relative">
              <Button type="button" variant="outline" size="sm" onClick={() => setAddBlockOpen(!addBlockOpen)} className="w-full border-dashed text-xs">
                <Plus className="mr-1 h-3 w-3" /> Add Block
              </Button>
              {addBlockOpen && (
                <div className="absolute bottom-full left-0 right-0 z-20 mb-1 rounded-lg border border-gray-200 bg-white p-1.5 shadow-lg">
                  {(Object.entries(BLOCK_TYPE_META) as [BlockType, typeof BLOCK_TYPE_META[BlockType]][]).map(([type, meta]) => {
                    const Icon = meta.icon
                    return (
                      <button key={type} type="button" onClick={() => addBlock(type)} className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50">
                        <Icon className="h-3.5 w-3.5 text-gray-400" />
                        {meta.label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Center: Visual page preview ── */}
        <div className="flex-1 overflow-y-auto p-6" onClick={() => { setSelectedBlockId(null); setRightPanel('settings') }}>
          <div
            className="mx-auto overflow-hidden rounded-xl shadow-xl"
            style={{ maxWidth: 900, ...RC }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Browser chrome */}
            <div className="flex items-center gap-1.5 bg-gray-200 px-4 py-2.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
              <div className="ml-3 flex-1 rounded bg-white px-3 py-1 text-xs text-gray-400 font-mono">
                roomchang.com{fullUrlPath || '/page-slug'}
              </div>
            </div>

            {/* Page sections */}
            <div style={{ backgroundColor: 'white', fontFamily: 'system-ui, sans-serif' }}>
              {form.blocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-300">
                  <Eye className="mb-3 h-10 w-10" />
                  <p className="text-sm">Add blocks from the left panel</p>
                  <p className="text-xs mt-1">Your page will render here</p>
                </div>
              ) : (
                form.blocks.map((block) => {
                  const isSelected = selectedBlockId === block.id
                  return (
                    <div
                      key={block.id}
                      onClick={() => selectBlock(block.id)}
                      style={{
                        position: 'relative',
                        cursor: 'pointer',
                        outline: isSelected ? '2px solid #7c3aed' : '2px solid transparent',
                        outlineOffset: -2,
                        transition: 'outline-color 0.15s',
                      }}
                      onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.outlineColor = '#c4b5fd' }}
                      onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.outlineColor = 'transparent' }}
                    >
                      {isSelected && (
                        <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 10, backgroundColor: '#7c3aed', color: 'white', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 9999 }}>
                          Editing
                        </div>
                      )}
                      <BlockPreview block={block} />
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* ── Right: Context panel ── */}
        <div className="flex w-80 shrink-0 flex-col border-l border-gray-200 bg-white">
          {/* Panel tabs */}
          <div className="flex shrink-0 border-b border-gray-200">
            <button
              type="button"
              onClick={() => { setRightPanel('settings'); setSelectedBlockId(null) }}
              className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                rightPanel === 'settings' ? 'border-b-2 border-violet-600 text-violet-700' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Settings className="h-3.5 w-3.5" /> Page Settings
            </button>
            <button
              type="button"
              onClick={() => setRightPanel('block')}
              className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                rightPanel === 'block' ? 'border-b-2 border-violet-600 text-violet-700' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Type className="h-3.5 w-3.5" />
              {selectedBlock ? BLOCK_TYPE_META[selectedBlock.type]?.label : 'Block Editor'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* ── Block editor panel ── */}
            {rightPanel === 'block' && (
              selectedBlock ? (
                <div>
                  <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
                    <span className="text-xs font-semibold text-gray-700">
                      {BLOCK_TYPE_META[selectedBlock.type]?.label}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <button type="button" onClick={() => moveBlock(selectedBlock.id, 'up')} disabled={selectedBlockIndex === 0} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30">
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => moveBlock(selectedBlock.id, 'down')} disabled={selectedBlockIndex === form.blocks.length - 1} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30">
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" title="Duplicate block" onClick={() => duplicateBlock(selectedBlock.id)} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => { removeBlock(selectedBlock.id); setSelectedBlockId(null); setRightPanel('settings') }} className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => { setSelectedBlockId(null); setRightPanel('settings') }} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    {(() => {
                      const BlockEditor = BLOCK_EDITORS[selectedBlock.type as BlockType]
                      return <BlockEditor data={selectedBlock.data} onChange={(data) => updateBlock(selectedBlock.id, data)} />
                    })()}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                  <Type className="mb-3 h-8 w-8" />
                  <p className="text-sm text-gray-400">Click a section in the preview to edit it</p>
                </div>
              )
            )}

            {/* ── Page settings panel ── */}
            {rightPanel === 'settings' && (
              <div className="space-y-4 p-4">
                {/* Publish */}
                <Card className="border-gray-200">
                  <CardHeader className="pb-3 pt-4">
                    <CardTitle className="text-xs">Publish</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pb-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Status</Label>
                      <Select value={form.status} onValueChange={(v) => setField('status', v)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Parent Page</Label>
                      <Select value={form.parent_id ? String(form.parent_id) : 'none'} onValueChange={(v) => setField('parent_id', v === 'none' ? null : Number(v))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="None (top-level)" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None (top-level)</SelectItem>
                          {parentOptions.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.title}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Template</Label>
                      <Select value={form.template} onValueChange={(v) => setField('template', v)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="full-width">Full Width</SelectItem>
                          <SelectItem value="sidebar">Sidebar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Navigation */}
                <Card className="border-gray-200">
                  <CardHeader className="pb-3 pt-4">
                    <CardTitle className="text-xs">Navigation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pb-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-in-nav" className="text-xs">Show in navigation</Label>
                      <Switch id="show-in-nav" checked={form.show_in_nav} onCheckedChange={(checked) => setField('show_in_nav', checked)} />
                    </div>
                    {form.show_in_nav && (
                      <>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Nav Label</Label>
                          <Input value={form.nav_label} onChange={(e) => setField('nav_label', e.target.value)} placeholder={form.title || 'Page title'} className="h-8 text-xs" />
                          <p className="text-[10px] text-gray-400">Overrides the page title in the navigation menu.</p>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Nav Parent</Label>
                          <Select value={form.nav_parent_id ? String(form.nav_parent_id) : 'none'} onValueChange={(v) => setField('nav_parent_id', v === 'none' ? null : Number(v))}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Top level" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Top level</SelectItem>
                              {parentOptions.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.title}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Sort Order</Label>
                          <Input type="number" value={form.sort_order} onChange={(e) => setField('sort_order', Number(e.target.value))} min={0} className="h-8 text-xs" />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* SEO */}
                <Card className="border-gray-200">
                  <button type="button" onClick={() => setSeoOpen(!seoOpen)} className="flex w-full items-center justify-between px-4 py-3 text-xs font-semibold text-gray-900">
                    SEO Settings
                    {seoOpen ? <ChevronUp className="h-3.5 w-3.5 text-gray-400" /> : <ChevronDown className="h-3.5 w-3.5 text-gray-400" />}
                  </button>
                  {seoOpen && (
                    <CardContent className="border-t border-gray-100 pt-3 space-y-3 pb-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">SEO Title</Label>
                          <CharBadge count={seoTitleDisplay.length} max={60} label="Title" />
                        </div>
                        <Input value={form.seo_title} onChange={(e) => setField('seo_title', e.target.value)} placeholder={form.title || 'Page title'} className="h-8 text-xs" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">SEO Description</Label>
                          <CharBadge count={seoDescDisplay.length} max={155} label="Desc" />
                        </div>
                        <Textarea value={form.seo_description} onChange={(e) => setField('seo_description', e.target.value)} placeholder="Meta description…" rows={3} className="text-xs" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">SEO Image URL</Label>
                        <Input value={form.seo_image_url} onChange={(e) => setField('seo_image_url', e.target.value)} placeholder="https://…" className="h-8 text-xs" />
                      </div>
                      <Separator />
                      <GooglePreview title={seoTitleDisplay} url={`example.com/${form.slug || 'page-slug'}`} description={seoDescDisplay || 'No description set.'} />
                    </CardContent>
                  )}
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
