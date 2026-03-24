import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api, tenantApi } from '@/lib/api'
import { toast } from 'sonner'
import { PageHeader } from '@/app/components/shared/PageHeader'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import { ArrowLeft, Loader2 } from 'lucide-react'

interface Tenant {
  id: number
  name: string
  slug: string
}

interface Article {
  id: number
  title: string
  slug: string
  summary?: string | null
  body?: string | null
  status: string
  category: string
}

interface ArticleFormData {
  title: string
  slug: string
  summary: string
  body: string
  status: string
  category: string
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}

export function TenantArticleEditor() {
  const { tenantId, articleId } = useParams<{ tenantId: string; articleId: string }>()
  const navigate = useNavigate()
  const isNew = articleId === 'new' || !articleId

  const [form, setForm] = useState<ArticleFormData>({
    title: '',
    slug: '',
    summary: '',
    body: '',
    status: 'draft',
    category: 'newsroom',
  })
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  const { data: tenant } = useQuery<Tenant>({
    queryKey: ['platform', 'tenant', tenantId],
    queryFn: () => api(`/api/platform/tenants/${tenantId}`),
    enabled: !!tenantId,
  })

  const { data: article, isLoading: articleLoading } = useQuery<Article>({
    queryKey: ['platform', 'tenant-article', tenantId, articleId],
    queryFn: () => tenantApi(tenantId!, `/api/tenant/articles/${articleId}`),
    enabled: !!tenantId && !isNew,
  })

  useEffect(() => {
    if (article) {
      setForm({
        title: article.title ?? '',
        slug: article.slug ?? '',
        summary: article.summary ?? '',
        body: article.body ?? '',
        status: article.status ?? 'draft',
        category: article.category ?? 'newsroom',
      })
      setSlugManuallyEdited(true)
    }
  }, [article])

  const createMutation = useMutation({
    mutationFn: (data: ArticleFormData) =>
      tenantApi(tenantId!, '/api/tenant/articles', { method: 'POST', body: data }),
    onSuccess: (created: Article) => {
      toast.success('Article created')
      navigate(`/tenants/${tenantId}/content/articles/${created.id}`)
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message || 'Failed to create article')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: ArticleFormData) =>
      tenantApi(tenantId!, `/api/tenant/articles/${articleId}`, { method: 'PUT', body: data }),
    onSuccess: () => {
      toast.success('Article saved')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message || 'Failed to save article')
    },
  })

  function handleTitleChange(value: string) {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: slugManuallyEdited ? prev.slug : slugify(value),
    }))
  }

  function handleSave() {
    if (!form.title.trim()) {
      toast.error('Title is required')
      return
    }
    if (isNew) {
      createMutation.mutate(form)
    } else {
      updateMutation.mutate(form)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending
  const tenantName = tenant?.name ?? `Tenant ${tenantId}`

  if (!isNew && articleLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-3xl">
      <PageHeader
        title={isNew ? 'New Article' : 'Edit Article'}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Tenants', href: '/tenants' },
          { label: tenantName, href: `/tenants/${tenantId}` },
          { label: 'Articles', href: `/tenants/${tenantId}/content/articles` },
          { label: isNew ? 'New' : 'Edit' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/tenants/${tenantId}/content/articles`}>
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isPending}>
              {isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              {isNew ? 'Create Article' : 'Save Changes'}
            </Button>
          </div>
        }
      />

      <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-6">
        <div className="space-y-1.5">
          <Label htmlFor="art-title">Title <span className="text-red-500">*</span></Label>
          <Input
            id="art-title"
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Article title"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="art-slug">Slug</Label>
          <Input
            id="art-slug"
            value={form.slug}
            onChange={(e) => { setSlugManuallyEdited(true); setForm({ ...form, slug: e.target.value }) }}
            placeholder="article-slug"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="art-status">Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger id="art-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="art-category">Category</Label>
            <Input
              id="art-category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="newsroom"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="art-summary">Summary</Label>
          <Textarea
            id="art-summary"
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            placeholder="Brief summary of the article..."
            rows={2}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="art-body">Body</Label>
          <Textarea
            id="art-body"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="Article content..."
            rows={12}
            className="font-mono text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" asChild>
          <Link to={`/tenants/${tenantId}/content/articles`}>Cancel</Link>
        </Button>
        <Button onClick={handleSave} disabled={isPending}>
          {isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
          {isNew ? 'Create Article' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}
