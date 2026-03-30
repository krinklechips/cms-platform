import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  X,
  Upload,
  ImageIcon,
  Check,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HeroSlide {
  id: string
  eyebrow: string | null
  title: string | null
  description: string | null
  imageSrc: string
  imageAlt: string | null
  imagePosition: string | null
  imageSize: string | null
  preserveFullImage: boolean
  order: number
  published: boolean
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isFullUrl(src: string) {
  return src.startsWith('http://') || src.startsWith('https://')
}

function thumbnailStyle(src: string, preserve?: boolean, pos?: string): React.CSSProperties {
  return {
    backgroundImage: `url(${src})`,
    backgroundSize: preserve ? 'contain' : 'cover',
    backgroundPosition: pos || 'center',
    backgroundRepeat: 'no-repeat',
    backgroundColor: preserve ? 'white' : undefined,
  }
}

// ---------------------------------------------------------------------------
// Edit / Create Modal
// ---------------------------------------------------------------------------

function SlideModal({
  slide,
  onClose,
  onSave,
}: {
  slide: Partial<HeroSlide> | null
  onClose: () => void
  onSave: (values: Partial<HeroSlide>) => Promise<void>
}) {
  const isNew = !slide?.id
  const [imageSrc, setImageSrc] = useState(slide?.imageSrc ?? '')
  const [eyebrow, setEyebrow] = useState(slide?.eyebrow ?? '')
  const [title, setTitle] = useState(slide?.title ?? '')
  const [description, setDescription] = useState(slide?.description ?? '')
  const [imageAlt, setImageAlt] = useState(slide?.imageAlt ?? '')
  const [imagePosition, setImagePosition] = useState(slide?.imagePosition ?? 'center center')
  const [imageSize, setImageSize] = useState(slide?.imageSize ?? 'cover')
  const [preserveFullImage, setPreserveFullImage] = useState(slide?.preserveFullImage ?? false)
  const [published, setPublished] = useState(slide?.published !== false)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('folder', 'hero')
      const res = await fetch('/api/tenant/media/upload', {
        method: 'POST',
        body: form,
        credentials: 'include',
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setImageSrc(data.media?.url ?? data.fileUrl ?? data.url ?? '')
      if (!imageAlt) setImageAlt(file.name.replace(/\.[^.]+$/, ''))
      toast.success('Image uploaded')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    if (!imageSrc.trim()) {
      toast.error('Image URL is required')
      return
    }
    setSaving(true)
    try {
      await onSave({ imageSrc, eyebrow, title, description, imageAlt, imagePosition, imageSize: preserveFullImage ? '100% auto' : imageSize, preserveFullImage, published })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            {isNew ? 'Add Hero Slide' : 'Edit Slide'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 py-5">
          {/* Image preview + URL */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Slide Image
            </label>
            {imageSrc && (
              <div
                className="mb-3 h-36 w-full rounded-xl border border-gray-200 bg-gray-100"
                style={thumbnailStyle(imageSrc, preserveFullImage, imagePosition)}
              />
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={imageSrc}
                onChange={(e) => setImageSrc(e.target.value)}
                placeholder="https://... or /hero/image.jpg"
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border border-gray-300 border-t-gray-600" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                Upload
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>

          {/* Eyebrow + Title */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Eyebrow Label
              </label>
              <input
                type="text"
                value={eyebrow}
                onChange={(e) => setEyebrow(e.target.value)}
                placeholder="e.g. Roomchang team"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Heading
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Slide heading"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Short caption or description"
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          {/* Alt text + image position */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Alt Text
              </label>
              <input
                type="text"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Describe the image"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Image Position
              </label>
              <select
                value={imagePosition}
                onChange={(e) => setImagePosition(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              >
                <option value="center center">Center</option>
                <option value="top center">Top</option>
                <option value="bottom center">Bottom</option>
                <option value="center left">Left</option>
                <option value="center right">Right</option>
              </select>
            </div>
          </div>

          {/* Image Size (only when not preserve full image) */}
          {!preserveFullImage && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Image Size
              </label>
              <select
                value={imageSize}
                onChange={(e) => setImageSize(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              >
                <option value="cover">Cover (fill &amp; crop)</option>
                <option value="contain">Contain (fit entire image)</option>
                <option value="100% auto">Full width</option>
              </select>
            </div>
          )}

          {/* Preserve full image toggle */}
          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-700">Preserve Full Image</p>
              <p className="text-xs text-gray-500">Show the entire image without cropping (white background). Best for group/team photos.</p>
            </div>
            <button
              type="button"
              onClick={() => setPreserveFullImage(!preserveFullImage)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer ${
                preserveFullImage ? 'bg-violet-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  preserveFullImage ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Published toggle */}
          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-700">Published</p>
              <p className="text-xs text-gray-500">Show this slide on the live website</p>
            </div>
            <button
              type="button"
              onClick={() => setPublished(!published)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer ${
                published ? 'bg-violet-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  published ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition-colors disabled:opacity-60"
          >
            {saving ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border border-violet-300 border-t-white" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            {isNew ? 'Add Slide' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export function HeroImages() {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [editingSlide, setEditingSlide] = useState<Partial<HeroSlide> | null | undefined>(
    undefined,
  ) // undefined = modal closed, null = new slide, object = editing
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function fetchSlides() {
    try {
      const res = await fetch('/api/tenant/hero/slides')
      const data = await res.json()
      setSlides(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Failed to load slides')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSlides()
  }, [])

  async function handleSave(values: Partial<HeroSlide>) {
    const isNew = !editingSlide?.id
    const url = isNew
      ? '/api/tenant/hero/slides'
      : `/api/tenant/hero/slides/${editingSlide!.id}`
    const method = isNew ? 'POST' : 'PUT'

    const payload = isNew
      ? { ...values, order: slides.length + 1 }
      : values

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? 'Save failed')
      throw new Error(err.error ?? 'Save failed')
    }

    toast.success(isNew ? 'Slide added' : 'Slide updated')
    setEditingSlide(undefined)
    fetchSlides()
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/tenant/hero/slides/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      toast.success('Slide removed')
      setSlides((prev) => prev.filter((s) => s.id !== id))
    } catch {
      toast.error('Failed to delete slide')
    } finally {
      setDeletingId(null)
    }
  }

  async function handleTogglePublish(slide: HeroSlide) {
    try {
      const res = await fetch(`/api/tenant/hero/slides/${slide.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !slide.published }),
      })
      if (!res.ok) throw new Error()
      setSlides((prev) =>
        prev.map((s) => (s.id === slide.id ? { ...s, published: !s.published } : s)),
      )
      toast.success(slide.published ? 'Slide hidden' : 'Slide published')
    } catch {
      toast.error('Failed to update slide')
    }
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hero Images</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage the homepage hero slideshow. Changes go live after saving.
          </p>
        </div>
        <button
          onClick={() => setEditingSlide(null)}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Slide
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-violet-600" />
        </div>
      )}

      {/* Empty state */}
      {!loading && slides.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
          <ImageIcon className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm font-semibold text-gray-500">No hero slides yet</p>
          <p className="mt-1 text-xs text-gray-400">Add your first slide to appear on the homepage</p>
          <button
            onClick={() => setEditingSlide(null)}
            className="mt-4 flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add First Slide
          </button>
        </div>
      )}

      {/* Slide cards */}
      {!loading && slides.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              className={`group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md ${
                slide.published ? 'border-gray-200' : 'border-gray-200 opacity-60'
              }`}
            >
              {/* Thumbnail */}
              <div
                className="relative h-44 bg-gray-100"
                style={thumbnailStyle(slide.imageSrc, slide.preserveFullImage, slide.imagePosition ?? undefined)}
              >
                {/* Order badge */}
                <span className="absolute left-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-xs font-bold text-white backdrop-blur-sm">
                  {i + 1}
                </span>

                {/* Published indicator */}
                <span
                  className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    slide.published
                      ? 'bg-green-500/90 text-white'
                      : 'bg-gray-500/80 text-white'
                  }`}
                >
                  {slide.published ? 'Live' : 'Hidden'}
                </span>

                {/* No image fallback */}
                {!isFullUrl(slide.imageSrc) && !slide.imageSrc.startsWith('/') && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <ImageIcon className="h-10 w-10 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="px-4 py-3">
                {slide.eyebrow && (
                  <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-violet-500">
                    {slide.eyebrow}
                  </p>
                )}
                <p className="truncate text-sm font-semibold text-gray-900">
                  {slide.title || <span className="text-gray-400 italic">No title</span>}
                </p>
                {slide.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-gray-500">{slide.description}</p>
                )}
                <p className="mt-2 truncate text-[10px] text-gray-400 font-mono">
                  {slide.imageSrc}
                </p>
              </div>

              {/* Action bar */}
              <div className="flex items-center gap-1 border-t border-gray-100 px-3 py-2">
                <button
                  onClick={() => setEditingSlide(slide)}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => handleTogglePublish(slide)}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  {slide.published ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5" />
                      Publish
                    </>
                  )}
                </button>
                <div className="flex-1" />
                <button
                  onClick={() => handleDelete(slide.id)}
                  disabled={deletingId === slide.id}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-40"
                >
                  {deletingId === slide.id ? (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border border-gray-300 border-t-gray-600" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}

          {/* Add card */}
          <button
            onClick={() => setEditingSlide(null)}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 py-14 text-gray-400 hover:border-violet-300 hover:text-violet-500 transition-colors"
          >
            <Plus className="h-6 w-6" />
            <span className="text-sm font-semibold">Add Slide</span>
          </button>
        </div>
      )}

      {/* Tip */}
      {!loading && slides.length > 0 && (
        <p className="mt-6 text-xs text-gray-400">
          Slides appear in order on the homepage. Upload images to Media first, then paste the URL, or upload directly here.
        </p>
      )}

      {/* Modal */}
      {editingSlide !== undefined && (
        <SlideModal
          slide={editingSlide}
          onClose={() => setEditingSlide(undefined)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
