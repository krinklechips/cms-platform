import { useRef, useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Upload, Trash2, FileIcon, ImageIcon } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
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

function isImage(mimeType: string) {
  return mimeType.startsWith('image/')
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function MediaLibrary() {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null)
  const [dragging, setDragging] = useState(false)

  const { data: media = [], isLoading } = useQuery<MediaItem[]>({
    queryKey: ['tenant', 'media'],
    queryFn: () => api('/api/tenant/media'),
  })

  const uploadMutation = useMutation({
    mutationFn: (files: FileList) => {
      const formData = new FormData()
      Array.from(files).forEach((file) => formData.append('files', file))
      return api('/api/tenant/media/upload', {
        method: 'POST',
        body: formData,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'media'] })
      toast.success('Files uploaded')
    },
    onError: () => {
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

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Media Library</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload and manage images and documents.
        </p>
      </div>

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
          <p className="text-xs text-gray-500">Uploading...</p>
        )}
      </div>

      {/* Media grid */}
      {isLoading ? (
        <div className="py-12 text-center text-sm text-gray-500">Loading...</div>
      ) : media.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-500">
          No media files yet. Upload your first file above.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {media.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white"
            >
              {/* Thumbnail / icon */}
              <div className="flex h-40 items-center justify-center bg-gray-50">
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

              {/* Delete overlay */}
              <button
                onClick={() => setDeleteTarget(item)}
                className="absolute right-2 top-2 rounded-md bg-white/80 p-1.5 text-gray-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete file</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.filename}&rdquo;?
              This action cannot be undone.
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
