import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { cn } from '@/app/components/ui/utils'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { PageHeader } from '@/app/components/shared/PageHeader'
import {
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  Globe,
  Search,
  FileText,
  X,
  CheckCircle2,
  XCircle,
  Sparkles,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'
import { Badge } from '@/app/components/ui/badge'
import { Switch } from '@/app/components/ui/switch'
import { Separator } from '@/app/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
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

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SeoPageMeta {
  id: number
  tenant_id: number
  page_path: string
  title: string | null
  description: string | null
  og_title: string | null
  og_description: string | null
  og_image: string | null
  twitter_card: string
  twitter_title: string | null
  twitter_description: string | null
  twitter_image: string | null
  canonical_url: string | null
  noindex: number
  nofollow: number
  json_ld_type: string | null
  json_ld_json: string | null
  keywords: string | null
  seo_score: number | null
  last_audited_at: string | null
}

interface PageForm {
  page_path: string
  title: string
  description: string
  og_title: string
  og_description: string
  og_image: string
  twitter_card: string
  twitter_title: string
  twitter_description: string
  twitter_image: string
  canonical_url: string
  noindex: boolean
  nofollow: boolean
  json_ld_type: string
  json_ld_json: string
  keywords: string
}

const emptyForm: PageForm = {
  page_path: '',
  title: '',
  description: '',
  og_title: '',
  og_description: '',
  og_image: '',
  twitter_card: 'summary_large_image',
  twitter_title: '',
  twitter_description: '',
  twitter_image: '',
  canonical_url: '',
  noindex: false,
  nofollow: false,
  json_ld_type: 'WebPage',
  json_ld_json: '',
  keywords: '',
}

function pageMetaToForm(p: SeoPageMeta): PageForm {
  return {
    page_path: p.page_path,
    title: p.title ?? '',
    description: p.description ?? '',
    og_title: p.og_title ?? '',
    og_description: p.og_description ?? '',
    og_image: p.og_image ?? '',
    twitter_card: p.twitter_card || 'summary_large_image',
    twitter_title: p.twitter_title ?? '',
    twitter_description: p.twitter_description ?? '',
    twitter_image: p.twitter_image ?? '',
    canonical_url: p.canonical_url ?? '',
    noindex: !!p.noindex,
    nofollow: !!p.nofollow,
    json_ld_type: p.json_ld_type ?? 'WebPage',
    json_ld_json: p.json_ld_json ?? '',
    keywords: p.keywords ?? '',
  }
}

/* ------------------------------------------------------------------ */
/*  Char-count badge                                                   */
/* ------------------------------------------------------------------ */

function CharBadge({ count, green, yellow }: { count: number; green: number; yellow: number }) {
  const variant =
    count === 0
      ? 'secondary'
      : count <= yellow
        ? count <= green
          ? 'default'
          : 'secondary'
        : 'destructive'
  const color =
    count === 0
      ? 'bg-gray-100 text-gray-500'
      : count <= green
        ? 'bg-green-100 text-green-700'
        : count <= yellow
          ? 'bg-yellow-100 text-yellow-700'
          : 'bg-red-100 text-red-700'
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      {count}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Score badge                                                        */
/* ------------------------------------------------------------------ */

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <Badge variant="secondary">--</Badge>
  const color =
    score > 80
      ? 'bg-green-100 text-green-700'
      : score >= 50
        ? 'bg-yellow-100 text-yellow-700'
        : 'bg-red-100 text-red-700'
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>{score}</span>
}

/* ------------------------------------------------------------------ */
/*  Google SERP Preview                                                */
/* ------------------------------------------------------------------ */

function GooglePreview({ title, url, description }: { title: string; url: string; description: string }) {
  const displayTitle = title || 'Page Title'
  const displayDesc = description || 'Add a meta description to see a preview here.'
  const displayUrl = url || 'example.com/page'
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
          <Search className="h-3.5 w-3.5" />
          Google Search Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-1">
          <div className="text-sm text-green-700 truncate">{displayUrl}</div>
          <div
            className="text-lg text-blue-700 hover:underline cursor-pointer leading-snug"
            style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          >
            {displayTitle.slice(0, 60)}{displayTitle.length > 60 ? '...' : ''}
          </div>
          <div
            className="text-sm text-gray-600 leading-relaxed"
            style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          >
            {displayDesc.slice(0, 155)}{displayDesc.length > 155 ? '...' : ''}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Facebook / Open Graph Preview                                      */
/* ------------------------------------------------------------------ */

function FacebookPreview({
  title,
  description,
  image,
  domain,
}: {
  title: string
  description: string
  image: string
  domain: string
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
          <Globe className="h-3.5 w-3.5" />
          Facebook / Open Graph Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          {image ? (
            <div className="aspect-[1.91/1] bg-gray-100 flex items-center justify-center overflow-hidden">
              <img
                src={image}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
          ) : (
            <div className="aspect-[1.91/1] bg-gray-100 flex items-center justify-center">
              <FileText className="h-10 w-10 text-gray-300" />
            </div>
          )}
          <div className="p-3 bg-gray-50 space-y-1">
            <div className="text-xs text-gray-500 uppercase tracking-wide">{domain || 'example.com'}</div>
            <div className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
              {title || 'Page Title'}
            </div>
            <div className="text-xs text-gray-500 line-clamp-2">{description || 'Page description'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Twitter Card Preview                                               */
/* ------------------------------------------------------------------ */

function TwitterPreview({
  title,
  description,
  image,
  domain,
  cardType,
}: {
  title: string
  description: string
  image: string
  domain: string
  cardType: string
}) {
  const isLarge = cardType === 'summary_large_image'
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Twitter / X Card Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          {isLarge && (
            <>
              {image ? (
                <div className="aspect-[2/1] bg-gray-100 overflow-hidden">
                  <img
                    src={image}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              ) : (
                <div className="aspect-[2/1] bg-gray-100 flex items-center justify-center">
                  <FileText className="h-10 w-10 text-gray-300" />
                </div>
              )}
              <div className="p-3 space-y-0.5">
                <div className="text-sm font-semibold text-gray-900 line-clamp-1">{title || 'Page Title'}</div>
                <div className="text-xs text-gray-500 line-clamp-2">{description || 'Page description'}</div>
                <div className="text-xs text-gray-400">{domain || 'example.com'}</div>
              </div>
            </>
          )}
          {!isLarge && (
            <div className="flex">
              {image ? (
                <div className="w-32 h-32 flex-shrink-0 bg-gray-100 overflow-hidden">
                  <img
                    src={image}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              ) : (
                <div className="w-32 h-32 flex-shrink-0 bg-gray-100 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-gray-300" />
                </div>
              )}
              <div className="p-3 flex flex-col justify-center space-y-0.5 min-w-0">
                <div className="text-sm font-semibold text-gray-900 line-clamp-1">{title || 'Page Title'}</div>
                <div className="text-xs text-gray-500 line-clamp-2">{description || 'Page description'}</div>
                <div className="text-xs text-gray-400">{domain || 'example.com'}</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Keyword tags                                                       */
/* ------------------------------------------------------------------ */

function KeywordTags({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const tags = value
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  function removeTag(tag: string) {
    const updated = tags.filter((t) => t !== tag).join(', ')
    onChange(updated)
  }

  return (
    <div className="space-y-2">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="seo, marketing, web design"
      />
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-0.5 rounded-full hover:bg-gray-300 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  JSON-LD Templates                                                   */
/* ------------------------------------------------------------------ */

const JSON_LD_TEMPLATES: Record<string, object> = {
  Article: {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "",
    "description": "",
    "author": { "@type": "Person", "name": "" },
    "datePublished": "",
    "image": "",
  },
  Organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "",
    "url": "",
    "logo": "",
    "contactPoint": { "@type": "ContactPoint", "telephone": "", "contactType": "customer service" },
  },
  FAQ: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Question 1?", "acceptedAnswer": { "@type": "Answer", "text": "Answer 1" } },
    ],
  },
  Product: {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "",
    "description": "",
    "brand": { "@type": "Brand", "name": "" },
    "offers": { "@type": "Offer", "price": "", "priceCurrency": "USD" },
  },
  LocalBusiness: {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "",
    "address": { "@type": "PostalAddress", "streetAddress": "", "addressLocality": "", "addressCountry": "" },
    "telephone": "",
    "openingHours": "",
  },
}

/* ------------------------------------------------------------------ */
/*  SEO Checklist                                                       */
/* ------------------------------------------------------------------ */

function SeoChecklist({ form }: { form: PageForm }) {
  const checks = [
    { label: 'Title present', pass: form.title.length > 0 },
    { label: 'Title under 60 chars', pass: form.title.length > 0 && form.title.length <= 60 },
    { label: 'Description present', pass: form.description.length > 0 },
    { label: 'Description 50-160 chars', pass: form.description.length >= 50 && form.description.length <= 160 },
    { label: 'OG image set', pass: form.og_image.length > 0 },
    { label: 'Canonical URL set', pass: form.canonical_url.length > 0 },
  ]

  const passed = checks.filter((c) => c.pass).length

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            SEO Checklist
          </span>
          <span className={`text-xs font-semibold ${passed === checks.length ? 'text-green-600' : 'text-gray-500'}`}>
            {passed}/{checks.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {checks.map((item) => (
            <li key={item.label} className="flex items-center gap-2 text-sm">
              {item.pass ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
              )}
              <span className={item.pass ? 'text-gray-700' : 'text-gray-500'}>{item.label}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */

export function SeoEditor() {
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const [editingPath, setEditingPath] = useState<string | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [form, setForm] = useState<PageForm>(emptyForm)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newPath, setNewPath] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<SeoPageMeta | null>(null)
  const [autoOpenPath, setAutoOpenPath] = useState<string | null>(searchParams.get('path'))

  /* ---- Queries --------------------------------------------------- */

  const { data: pagesData, isLoading: pagesLoading } = useQuery({
    queryKey: ['seo-pages'],
    queryFn: () => api<{ pages: SeoPageMeta[] }>('/api/tenant/seo/pages'),
  })

  const pages = pagesData?.pages ?? []

  /* Auto-open editor when arriving from Pages list (?path=/slug) */
  useEffect(() => {
    if (!autoOpenPath || pagesLoading) return
    const existing = pages.find((p) => p.page_path === autoOpenPath)
    if (existing) {
      openEditor(existing)
    } else {
      openNew(autoOpenPath)
    }
    setAutoOpenPath(null)
  }, [autoOpenPath, pagesLoading, pages])

  /* ---- Mutations ------------------------------------------------- */

  const saveMutation = useMutation({
    mutationFn: (data: PageForm) =>
      api(`/api/tenant/seo/pages/${encodeURIComponent(data.page_path)}`, {
        method: 'PUT',
        body: {
          title: data.title || null,
          description: data.description || null,
          og_title: data.og_title || null,
          og_description: data.og_description || null,
          og_image: data.og_image || null,
          twitter_card: data.twitter_card,
          twitter_title: data.twitter_title || null,
          twitter_description: data.twitter_description || null,
          twitter_image: data.twitter_image || null,
          canonical_url: data.canonical_url || null,
          noindex: data.noindex ? 1 : 0,
          nofollow: data.nofollow ? 1 : 0,
          json_ld_type: data.json_ld_type || null,
          json_ld_json: data.json_ld_json || null,
          keywords: data.keywords || null,
        },
      }),
    onSuccess: () => {
      toast.success('Page SEO saved')
      queryClient.invalidateQueries({ queryKey: ['seo-pages'] })
      setEditingPath(null)
      setIsNew(false)
    },
    onError: () => toast.error('Failed to save page SEO'),
  })

  const deleteMutation = useMutation({
    mutationFn: (path: string) =>
      api(`/api/tenant/seo/pages/${encodeURIComponent(path)}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Page deleted')
      queryClient.invalidateQueries({ queryKey: ['seo-pages'] })
      setDeleteTarget(null)
    },
    onError: () => toast.error('Failed to delete page'),
  })

  /* ---- Helpers --------------------------------------------------- */

  function openEditor(page: SeoPageMeta) {
    setForm(pageMetaToForm(page))
    setEditingPath(page.page_path)
    setIsNew(false)
  }

  function openNew(path: string) {
    setForm({ ...emptyForm, page_path: path })
    setEditingPath(path)
    setIsNew(true)
    setAddDialogOpen(false)
    setNewPath('')
  }

  function updateField<K extends keyof PageForm>(key: K, value: PageForm[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function extractDomain(path: string): string {
    try {
      if (path.startsWith('http')) return new URL(path).hostname
    } catch {}
    return 'example.com'
  }

  /* ---- Accordion section state ----------------------------------- */
  const [ogOpen, setOgOpen] = useState(false)
  const [twitterOpen, setTwitterOpen] = useState(false)
  const [indexingOpen, setIndexingOpen] = useState(false)
  const [jsonLdOpen, setJsonLdOpen] = useState(false)

  /* ---- Edit View ------------------------------------------------- */

  if (editingPath !== null) {
    const ogTitle = form.og_title || form.title
    const ogDesc = form.og_description || form.description
    const ogImage = form.og_image
    const twTitle = form.twitter_title || ogTitle
    const twDesc = form.twitter_description || ogDesc
    const twImage = form.twitter_image || ogImage
    const domain = form.canonical_url ? extractDomain(form.canonical_url) : 'example.com'

    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { setEditingPath(null); setIsNew(false) }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {isNew ? 'New Page' : 'Edit Page SEO'}
            </h1>
            <p className="text-sm text-gray-500">{form.page_path}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left column — Form */}
          <div className="space-y-4">

            {/* ── Core fields ───────────────────────────────────────── */}
            <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
              <div className="px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Page</p>
              </div>
              <div className="px-4 py-4 space-y-4">
                {/* Page Path */}
                <div className="space-y-1.5">
                  <Label>Page Path</Label>
                  {isNew ? (
                    <Input value={form.page_path} onChange={(e) => updateField('page_path', e.target.value)} placeholder="/about" />
                  ) : (
                    <Input value={form.page_path} disabled className="bg-gray-50 text-gray-500" />
                  )}
                </div>
                {/* Title */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label>Title</Label>
                    <CharBadge count={form.title.length} green={60} yellow={60} />
                  </div>
                  <Input value={form.title} onChange={(e) => updateField('title', e.target.value)} placeholder="Page Title" />
                </div>
                {/* Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label>Meta Description</Label>
                    <CharBadge count={form.description.length} green={155} yellow={155} />
                  </div>
                  <Textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} placeholder="A concise summary of the page content..." rows={3} />
                </div>
                {/* Keywords */}
                <div className="space-y-1.5">
                  <Label>Keywords</Label>
                  <KeywordTags value={form.keywords} onChange={(v) => updateField('keywords', v)} />
                </div>
              </div>
            </div>

            {/* ── Open Graph ────────────────────────────────────────── */}
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <button
                type="button"
                onClick={() => setOgOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Open Graph</span>
                  <span className="text-xs text-gray-400">(Facebook, LinkedIn)</span>
                </div>
                <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform', ogOpen && 'rotate-180')} />
              </button>
              {ogOpen && (
                <div className="px-4 pb-4 pt-1 space-y-4 border-t border-gray-100">
                  <div className="space-y-1.5">
                    <Label>OG Title</Label>
                    <Input value={form.og_title} onChange={(e) => updateField('og_title', e.target.value)} placeholder="Defaults to page title" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>OG Description</Label>
                    <Textarea value={form.og_description} onChange={(e) => updateField('og_description', e.target.value)} placeholder="Defaults to meta description" rows={2} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>OG Image URL</Label>
                    <Input value={form.og_image} onChange={(e) => updateField('og_image', e.target.value)} placeholder="https://example.com/image.jpg" />
                  </div>
                </div>
              )}
            </div>

            {/* ── Twitter / X ───────────────────────────────────────── */}
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <button
                type="button"
                onClick={() => setTwitterOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Twitter / X Card</span>
                </div>
                <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform', twitterOpen && 'rotate-180')} />
              </button>
              {twitterOpen && (
                <div className="px-4 pb-4 pt-1 space-y-4 border-t border-gray-100">
                  <div className="space-y-1.5">
                    <Label>Card Type</Label>
                    <Select value={form.twitter_card} onValueChange={(v) => updateField('twitter_card', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="summary">Summary</SelectItem>
                        <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Twitter Title</Label>
                    <Input value={form.twitter_title} onChange={(e) => updateField('twitter_title', e.target.value)} placeholder="Defaults to OG title" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Twitter Description</Label>
                    <Textarea value={form.twitter_description} onChange={(e) => updateField('twitter_description', e.target.value)} placeholder="Defaults to OG description" rows={2} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Twitter Image URL</Label>
                    <Input value={form.twitter_image} onChange={(e) => updateField('twitter_image', e.target.value)} placeholder="Defaults to OG image" />
                  </div>
                </div>
              )}
            </div>

            {/* ── Indexing ──────────────────────────────────────────── */}
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <button
                type="button"
                onClick={() => setIndexingOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Indexing &amp; Canonical</span>
                </div>
                <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform', indexingOpen && 'rotate-180')} />
              </button>
              {indexingOpen && (
                <div className="px-4 pb-4 pt-1 space-y-4 border-t border-gray-100">
                  <div className="space-y-1.5">
                    <Label>Canonical URL</Label>
                    <Input value={form.canonical_url} onChange={(e) => updateField('canonical_url', e.target.value)} placeholder="https://example.com/page" />
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Switch checked={form.noindex} onCheckedChange={(v) => updateField('noindex', v)} />
                      <Label className="text-sm">Noindex</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={form.nofollow} onCheckedChange={(v) => updateField('nofollow', v)} />
                      <Label className="text-sm">Nofollow</Label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Structured Data ───────────────────────────────────── */}
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <button
                type="button"
                onClick={() => setJsonLdOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Structured Data (JSON-LD)</span>
                </div>
                <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform', jsonLdOpen && 'rotate-180')} />
              </button>
              {jsonLdOpen && (
                <div className="px-4 pb-4 pt-1 space-y-4 border-t border-gray-100">
                  <div className="space-y-1.5">
                    <Label>Type</Label>
                    <div className="flex gap-2">
                      <Select value={form.json_ld_type} onValueChange={(v) => updateField('json_ld_type', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WebPage">WebPage</SelectItem>
                          <SelectItem value="Article">Article</SelectItem>
                          <SelectItem value="Organization">Organization</SelectItem>
                          <SelectItem value="FAQ">FAQ</SelectItem>
                          <SelectItem value="Product">Product</SelectItem>
                          <SelectItem value="LocalBusiness">LocalBusiness</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        disabled={!JSON_LD_TEMPLATES[form.json_ld_type]}
                        onClick={() => {
                          const tpl = JSON_LD_TEMPLATES[form.json_ld_type]
                          if (tpl) updateField('json_ld_json', JSON.stringify(tpl, null, 2))
                        }}
                      >
                        <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                        Load Template
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>JSON-LD</Label>
                    <Textarea
                      value={form.json_ld_json}
                      onChange={(e) => updateField('json_ld_json', e.target.value)}
                      placeholder='{"@context":"https://schema.org", ...}'
                      rows={8}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Save */}
            <div className="pt-1">
              <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>

          {/* Right column — Previews & Checklist */}
          <div className="space-y-4">
            <SeoChecklist form={form} />
            <GooglePreview title={form.title} url={form.canonical_url || form.page_path} description={form.description} />
            {ogOpen && <FacebookPreview title={ogTitle} description={ogDesc} image={ogImage} domain={domain} />}
            {twitterOpen && <TwitterPreview title={twTitle} description={twDesc} image={twImage} domain={domain} cardType={form.twitter_card} />}
          </div>
        </div>
      </div>
    )
  }

  /* ---- List View ------------------------------------------------- */

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Page SEO Editor"
        subtitle="Manage meta tags, Open Graph, and structured data"
        breadcrumbs={[{label:'Overview', href:'/'}, {label:'SEO', href:'/seo'}, {label:'Pages'}]}
        actions={
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Page
          </Button>
        }
      />

      {pagesLoading ? (
        <div className="text-sm text-gray-500">Loading pages...</div>
      ) : pages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-900">No pages configured</p>
            <p className="text-sm text-gray-500 mt-1">
              Add a page to start managing its SEO meta tags and social previews.
            </p>
            <Button className="mt-4" variant="outline" onClick={() => setAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add your first page
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page Path</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="w-[80px]">Score</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-mono text-sm">{page.page_path}</TableCell>
                  <TableCell className="max-w-[240px] truncate text-sm text-gray-600">
                    {page.title || <span className="text-gray-400 italic">No title</span>}
                  </TableCell>
                  <TableCell>
                    <ScoreBadge score={page.seo_score} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditor(page)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(page)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Page Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Page</DialogTitle>
            <DialogDescription>Enter the page path to configure its SEO settings.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5 py-2">
            <Label>Page Path</Label>
            <Input
              value={newPath}
              onChange={(e) => setNewPath(e.target.value)}
              placeholder="/about"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newPath.trim()) openNew(newPath.trim())
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => openNew(newPath.trim())} disabled={!newPath.trim()}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Page SEO</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete SEO settings for{' '}
              <span className="font-mono font-medium">{deleteTarget?.page_path}</span>? This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.page_path)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
