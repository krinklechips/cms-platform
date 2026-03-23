import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { ArrowLeft, ChevronDown, ChevronUp, Globe, Facebook } from 'lucide-react'
import { GooglePreview } from '@/app/components/shared/seo/GooglePreview'
import { CharBadge } from '@/app/components/shared/seo/CharBadge'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'
import { Switch } from '@/app/components/ui/switch'
import { Separator } from '@/app/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'

interface ArticleForm {
  title: string
  slug: string
  category: string
  summary: string
  body: string
  status: string
  cover_image_url: string
  seo_title: string
  seo_description: string
  seo_image_url: string
  canonical_url: string
  noindex: boolean
}

interface Article extends ArticleForm {
  id: number
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function ArticleEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEdit = !!id

  const [seoOpen, setSeoOpen] = useState(false)

  const { register, handleSubmit, setValue, watch, reset } = useForm<ArticleForm>({
    defaultValues: {
      title: '',
      slug: '',
      category: '',
      summary: '',
      body: '',
      status: 'draft',
      cover_image_url: '',
      seo_title: '',
      seo_description: '',
      seo_image_url: '',
      canonical_url: '',
      noindex: false,
    },
  })

  const title = watch('title')
  const slug = watch('slug')
  const status = watch('status')
  const coverImage = watch('cover_image_url')
  const summary = watch('summary')
  const seoTitle = watch('seo_title')
  const seoDescription = watch('seo_description')
  const seoImage = watch('seo_image_url')
  const noindex = watch('noindex')

  // Auto-generate slug from title (only when creating)
  useEffect(() => {
    if (!isEdit) {
      setValue('slug', slugify(title))
    }
  }, [title, isEdit, setValue])

  // Fetch existing article
  const { isLoading } = useQuery<Article>({
    queryKey: ['tenant', 'article', id],
    queryFn: () => api(`/api/tenant/articles/${id}`),
    enabled: isEdit,
  })

  // Populate form when article loads
  const { data: article } = useQuery<Article>({
    queryKey: ['tenant', 'article', id],
    queryFn: () => api(`/api/tenant/articles/${id}`),
    enabled: isEdit,
  })

  useEffect(() => {
    if (article) {
      reset({
        title: article.title || '',
        slug: article.slug || '',
        category: article.category || '',
        summary: article.summary || '',
        body: article.body || '',
        status: article.status || 'draft',
        cover_image_url: article.cover_image_url || '',
        seo_title: article.seo_title || '',
        seo_description: article.seo_description || '',
        seo_image_url: article.seo_image_url || '',
        canonical_url: article.canonical_url || '',
        noindex: article.noindex || false,
      })
    }
  }, [article, reset])

  const saveMutation = useMutation({
    mutationFn: (data: ArticleForm) => {
      if (isEdit) {
        return api(`/api/tenant/articles/${id}`, { method: 'PUT', body: data })
      }
      return api('/api/tenant/articles', { method: 'POST', body: data })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'articles'] })
      toast.success(isEdit ? 'Article updated' : 'Article created')
      navigate('/articles')
    },
    onError: () => {
      toast.error('Failed to save article')
    },
  })

  const onSubmit = (data: ArticleForm) => saveMutation.mutate(data)

  // SEO character counts
  const seoTitleDisplay = seoTitle || title
  const seoDescDisplay = seoDescription || ''

  if (isEdit && isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate('/articles')}
          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">
          {isEdit ? 'Edit Article' : 'New Article'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Main fields */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register('title', { required: true })} placeholder="Article title" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" {...register('slug')} placeholder="article-slug" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" {...register('category')} placeholder="e.g. News" />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setValue('status', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Summary</Label>
              <Textarea
                id="summary"
                {...register('summary')}
                placeholder="Brief summary of the article"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Body</Label>
              <Textarea
                id="body"
                {...register('body')}
                placeholder="Article content..."
                rows={16}
                className="font-mono text-sm"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="cover_image_url">Cover Image URL</Label>
              <Input
                id="cover_image_url"
                {...register('cover_image_url')}
                placeholder="https://..."
              />
              {coverImage && (
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="mt-2 h-40 w-full rounded-lg border border-gray-200 object-cover"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              )}
            </div>

            <Separator />

            {/* SEO panel */}
            <div className="rounded-lg border border-gray-200">
              <button
                type="button"
                onClick={() => setSeoOpen(!seoOpen)}
                className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-gray-900"
              >
                SEO Settings
                {seoOpen ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </button>

              {seoOpen && (
                <div className="border-t border-gray-200 px-4 py-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="seo_title">SEO Title</Label>
                      <CharBadge count={seoTitleDisplay.length} max={60} label="Title" />
                    </div>
                    <Input
                      id="seo_title"
                      {...register('seo_title')}
                      placeholder={title || 'Page title'}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="seo_description">SEO Description</Label>
                      <CharBadge count={seoDescDisplay.length} max={155} label="Desc" />
                    </div>
                    <Textarea
                      id="seo_description"
                      {...register('seo_description')}
                      placeholder="Meta description..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seo_image_url">SEO Image URL</Label>
                    <Input
                      id="seo_image_url"
                      {...register('seo_image_url')}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="canonical_url">Canonical URL</Label>
                    <Input
                      id="canonical_url"
                      {...register('canonical_url')}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="noindex" className="text-sm">
                      Noindex
                    </Label>
                    <Switch
                      id="noindex"
                      checked={noindex}
                      onCheckedChange={(checked) => setValue('noindex', checked)}
                    />
                  </div>

                  <Separator />

                  {/* Google SERP preview */}
                  <GooglePreview
                    title={seoTitleDisplay}
                    url={`example.com/${slug || 'page-slug'}`}
                    description={seoDescDisplay || summary || ''}
                  />

                  {/* Facebook OG preview */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                      <Facebook className="h-3.5 w-3.5" />
                      Facebook Preview
                    </div>
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                      {(seoImage || coverImage) && (
                        <img
                          src={seoImage || coverImage}
                          alt="OG preview"
                          className="h-32 w-full object-cover"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                      )}
                      <div className="p-3 space-y-0.5">
                        <p className="text-xs uppercase text-gray-400">
                          example.com
                        </p>
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {seoTitleDisplay || 'Page Title'}
                        </p>
                        <p className="line-clamp-2 text-xs text-gray-500">
                          {seoDescDisplay || 'No description set.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 border-t border-gray-200 pt-6">
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending
              ? 'Saving...'
              : isEdit
                ? 'Update Article'
                : 'Create Article'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/articles')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
