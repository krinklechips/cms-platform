import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { PageHeader } from '@/app/components/shared/PageHeader'
import { Star, Pencil } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Badge } from '@/app/components/ui/badge'
import { Switch } from '@/app/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog'

interface ProductLine {
  id: number
  label: string
  slug: string
  summary?: string | null
  groupLabel?: string | null
  groupKey: string
  itemType: string
  status: string
  featured: boolean
  sortOrder: number
}

interface EditModal {
  open: boolean
  product: ProductLine | null
  sortOrder: string
}

export function FeaturedProducts() {
  const queryClient = useQueryClient()
  const [editModal, setEditModal] = useState<EditModal>({ open: false, product: null, sortOrder: '' })

  const { data: products = [], isLoading } = useQuery<ProductLine[]>({
    queryKey: ['tenant', 'product-lines'],
    queryFn: () => api('/api/tenant/product-lines'),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, featured }: { id: number; featured: boolean }) =>
      api(`/api/tenant/product-lines/${id}`, {
        method: 'PUT',
        body: { featured },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'product-lines'] })
    },
    onError: () => toast.error('Failed to update featured status'),
  })

  const updateSortMutation = useMutation({
    mutationFn: ({ id, sortOrder }: { id: number; sortOrder: number }) =>
      api(`/api/tenant/product-lines/${id}`, {
        method: 'PUT',
        body: { sortOrder },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'product-lines'] })
      toast.success('Sort order updated')
      setEditModal({ open: false, product: null, sortOrder: '' })
    },
    onError: () => toast.error('Failed to update sort order'),
  })

  function handleToggle(product: ProductLine) {
    toggleMutation.mutate({ id: product.id, featured: !product.featured })
  }

  function openEditModal(product: ProductLine) {
    setEditModal({ open: true, product, sortOrder: String(product.sortOrder) })
  }

  function handleSaveSortOrder() {
    if (!editModal.product) return
    updateSortMutation.mutate({
      id: editModal.product.id,
      sortOrder: Number(editModal.sortOrder) || 0,
    })
  }

  const featuredProducts = products.filter((p) => p.featured).sort((a, b) => a.sortOrder - b.sortOrder)
  const allProducts = products

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="py-12 text-center text-sm text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Featured Products"
        subtitle="Toggle which products are featured on your site"
        breadcrumbs={[{ label: 'Overview', href: '/' }, { label: 'Featured Products' }]}
      />

      {/* Featured section */}
      {featuredProducts.length > 0 && (
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            Featured ({featuredProducts.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onToggle={() => handleToggle(product)}
                onEdit={() => openEditModal(product)}
                isToggling={toggleMutation.isPending}
              />
            ))}
          </div>
        </div>
      )}

      {/* All products section */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-900">
          All Products ({allProducts.length})
        </h2>
        {allProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
            <Star className="mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm font-medium text-gray-600">No products found</p>
            <p className="mt-1 text-xs text-gray-400">Add products in the Product Lines section first</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onToggle={() => handleToggle(product)}
                onEdit={() => openEditModal(product)}
                isToggling={toggleMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit sort order modal */}
      <Dialog
        open={editModal.open}
        onOpenChange={(open) => {
          if (!open) setEditModal({ open: false, product: null, sortOrder: '' })
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Sort Order</DialogTitle>
            <DialogDescription>
              Set the display order for &ldquo;{editModal.product?.label}&rdquo;. Lower numbers appear first.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5 py-2">
            <Label htmlFor="fp-sort-order">Sort Order</Label>
            <Input
              id="fp-sort-order"
              type="number"
              min="0"
              value={editModal.sortOrder}
              onChange={(e) => setEditModal({ ...editModal, sortOrder: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditModal({ open: false, product: null, sortOrder: '' })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSortOrder}
              disabled={updateSortMutation.isPending}
            >
              {updateSortMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ProductCard({
  product,
  onToggle,
  onEdit,
  isToggling,
}: {
  product: ProductLine
  onToggle: () => void
  onEdit: () => void
  isToggling: boolean
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-gray-900 truncate">{product.label}</p>
          {product.groupLabel && (
            <p className="text-xs text-gray-500 truncate">{product.groupLabel}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onEdit}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            title="Edit sort order"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {product.summary && (
        <p className="text-sm text-gray-500 line-clamp-2">{product.summary}</p>
      )}

      <div className="flex items-center justify-between">
        <Badge variant={product.status === 'published' ? 'default' : 'secondary'} className="text-xs">
          {product.status}
        </Badge>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Featured</span>
          <Switch
            checked={product.featured}
            onCheckedChange={onToggle}
            disabled={isToggling}
          />
        </div>
      </div>
    </div>
  )
}
