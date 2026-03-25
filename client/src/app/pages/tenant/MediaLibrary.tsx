import { useRef, useState, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { PageHeader } from '@/app/components/shared/PageHeader'
import {
  Upload,
  Trash2,
  FileIcon,
  ImageIcon,
  Grid3X3,
  List,
  Copy,
  Search,
  Eye,
} from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Progress } from '@/app/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog'

interface MediaItem {
  id: number
  filename: string
  url: string
  mime_type: string
  size: number
  created_at: string
}

type ViewMode = 'grid' | 'list'
type TypeFilter = 'all' | 'images' | 'documents'

function isImage(mimeType: string) {
  return mimeType.startsWith('image/')
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function copyToClipboard(url: string) {
  navigator.clipboard.writeText(url).then(
    () => toast.success('URL copied to clipboard'),
    () => toast.error('Failed to copy URL'),
  )
}

export function MediaLibrary() {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null)
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null)
  const [dragging, setDragging] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)

  const { data: media = [], isLoading } = useQuery<MediaItem[]>({
    queryKey: ['tenant', 'media'],
    queryFn: () => api('/api/tenant/media'),
  })

  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      setUploadProgress(0)
      const fileArray = Array.from(files)
      for (let i = 0; i < fileArray.length; i++) {
        const formData = new FormData()
        formData.append('file', fileArray[i])
        await api('/api/tenant/media/upload', { method: 'POST', body: formData })
        setUploadProgress(Math.round(((i + 1) / fileArray.length) * 100))
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'media'] })
      toast.success('Upload complete')
      setTimeout(() => setUploadProgress(null), 600)
    },
    onError: () => {
      setUploadProgress(null)
      toast.error('Upload failed')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      api(`/api/tenant/media/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'media'] })
      toast.success('File deleted')
      setDeleteTarget(null)
    },
    onError: () => {
      toast.error('Failed to delete file')
    },
  })

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      if (e.dataTransfer.files.length) {
        uploadMutation.mutate(e.dataTransfer.files)
      }
    },
    [uploadMutation],
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      uploadMutation.mutate(e.target.files)
      e.target.value = ''
    }
  }

  // Filtered media based on search and type filter
  const filteredMedia = useMemo(() => {
    return media.filter((item) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!item.filename.toLowerCase().includes(query)) {
          return false
        }
      }
      // Type filter
      if (typeFilter === 'images' && !isImage(item.mime_type)) return false
      if (typeFilter === 'documents' && isImage(item.mime_type)) return false
      return true
    })
  }, [media, searchQuery, typeFilter])

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Media Library"
        subtitle="Upload and manage images and documents"
        breadcrumbs={[{ label: 'Overview', href: '/' }, { label: 'Media' }]}
      />

      {/* Upload zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 transition-colors ${
          dragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
      >
        <Upload className="h-8 w-8 text-gray-400" />
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Drag and drop files here, or{' '}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              browse
            </button>
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Images, PDFs, and documents up to 10 MB
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        {uploadMutation.isPending && (
          <div className="w-full max-w-xs space-y-1.5">
            <Progress value={uploadProgress ?? 0} className="h-2" />
            <p className="text-xs text-gray-500 text-center">
              Uploading{uploadProgress !== null ? `... ${uploadProgress}%` : '...'}
            </p>
          </div>
        )}
      </div>

      {/* Toolbar: Search, Type Filter, View Toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={typeFilter}
            onValueChange={(v) => setTypeFilter(v as TypeFilter)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="images">Images</SelectItem>
              <SelectItem value="documents">Documents</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1 rounded-md border border-gray-200 p-0.5">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="h-7 w-7 p-0"
            title="Grid view"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="h-7 w-7 p-0"
            title="List view"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Media content */}
      {isLoading ? (
        <div className="py-12 text-center text-sm text-gray-500">Loading...</div>
      ) : filteredMedia.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-500">
          {media.length === 0
            ? 'No media files yet. Upload your first file above.'
            : 'No files match your filters.'}
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white"
            >
              {/* Thumbnail / icon */}
              <div
                className="flex h-40 items-center justify-center bg-gray-50 cursor-pointer"
                onClick={() => isImage(item.mime_type) && setPreviewItem(item)}
              >
                {isImage(item.mime_type) ? (
                  <img
                    src={item.url}
                    alt={item.filename}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FileIcon className="h-10 w-10 text-gray-300" />
                )}
              </div>

              {/* Info */}
              <div className="px-3 py-2.5">
                <p className="truncate text-sm font-medium text-gray-900">
                  {item.filename}
                </p>
                <p className="text-xs text-gray-400">
                  {formatBytes(item.size)} &middot;{' '}
                  {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Overlay actions */}
              <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => copyToClipboard(item.url)}
                  className="rounded-md bg-white/80 p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  title="Copy URL"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                {isImage(item.mime_type) && (
                  <button
                    onClick={() => setPreviewItem(item)}
                    className="rounded-md bg-white/80 p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    title="Preview"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setDeleteTarget(item)}
                  className="rounded-md bg-white/80 p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="rounded-lg border border-gray-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Preview</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-[120px]">Type</TableHead>
                <TableHead className="w-[100px]">Size</TableHead>
                <TableHead className="w-[140px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMedia.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div
                      className="flex h-10 w-10 items-center justify-center overflow-hidden rounded bg-gray-50 cursor-pointer"
                      onClick={() =>
                        isImage(item.mime_type) && setPreviewItem(item)
                      }
                    >
                      {isImage(item.mime_type) ? (
                        <img
                          src={item.url}
                          alt={item.filename}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <FileIcon className="h-5 w-5 text-gray-300" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium text-gray-900">
                      {item.filename}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-500">
                      {item.mime_type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-500">
                      {formatBytes(item.size)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => copyToClipboard(item.url)}
                        title="Copy URL"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      {isImage(item.mime_type) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setPreviewItem(item)}
                          title="Preview"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                        onClick={() => setDeleteTarget(item)}
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Image Preview Dialog */}
      <Dialog
        open={!!previewItem}
        onOpenChange={() => setPreviewItem(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="truncate">
              {previewItem?.filename}
            </DialogTitle>
          </DialogHeader>
          {previewItem && (
            <div className="space-y-4">
              <div className="flex items-center justify-center overflow-hidden rounded-lg bg-gray-50">
                <img
                  src={previewItem.url}
                  alt={previewItem.filename}
                  className="max-h-[60vh] object-contain"
                />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Filename</span>
                  <span className="font-medium text-gray-900">
                    {previewItem.filename}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="font-medium text-gray-900">
                    {previewItem.mime_type}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Size</span>
                  <span className="font-medium text-gray-900">
                    {formatBytes(previewItem.size)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-500 shrink-0">URL</span>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate font-mono text-xs text-gray-600">
                      {previewItem.url}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 shrink-0"
                      onClick={() => copyToClipboard(previewItem.url)}
                    >
                      <Copy className="mr-1.5 h-3 w-3" />
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete file</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.filename}
              &rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget.id)
              }
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
