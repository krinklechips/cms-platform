import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { PageHeader } from '@/app/components/shared/PageHeader'
import { Plus, Trash2, Pencil, DollarSign, Save } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/app/components/ui/tabs'

// ─── Types ───────────────────────────────────────────────────────────────────

interface PricingCategory {
  id: string
  title: string
  icon: string | null
  sortOrder: number
}

interface PricingItem {
  id: string
  name: string
  price: string
  ada: string | null
  aus: string | null
  categoryId: string
  sortOrder: number
}

interface ComparisonRow {
  id: string
  setId: string | null
  ada: string
  treatment: string
  roomchangPrice: string
  australiaPrice: string
  sortOrder: number
}

// ─── Category Dialog ──────────────────────────────────────────────────────────

interface CategoryFormData {
  title: string
  icon: string
  sortOrder: string
}

const emptyCategoryForm: CategoryFormData = { title: '', icon: '', sortOrder: '0' }

function categoryToForm(cat: PricingCategory): CategoryFormData {
  return { title: cat.title, icon: cat.icon ?? '', sortOrder: String(cat.sortOrder) }
}

function CategoryDialog({
  category,
  onClose,
  onSaved,
}: {
  category: PricingCategory | null
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<CategoryFormData>(
    category ? categoryToForm(category) : emptyCategoryForm,
  )
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    if (!form.title.trim()) { toast.error('Title is required'); return }
    setIsSaving(true)
    try {
      const body = { title: form.title, icon: form.icon || null, sortOrder: Number(form.sortOrder) || 0 }
      if (category) {
        await api(`/api/tenant/pricing/categories/${category.id}`, { method: 'PUT', body })
      } else {
        await api('/api/tenant/pricing/categories', { method: 'POST', body })
      }
      toast.success(category ? 'Category updated' : 'Category created')
      onSaved()
    } catch {
      toast.error('Failed to save category')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? 'Edit Category' : 'New Category'}</DialogTitle>
          <DialogDescription>
            Pricing categories group related treatments together on the website.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="cat-title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cat-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Dental Implants"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cat-icon">
                Icon key <span className="text-gray-400 text-xs">(optional)</span>
              </Label>
              <Input
                id="cat-icon"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                placeholder="implant"
              />
              <p className="text-xs text-gray-400">e.g. implant, cleaning, crown</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-order">Sort order</Label>
              <Input
                id="cat-order"
                type="number"
                min="0"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={isSaving} onClick={handleSave}>
            <Save className="mr-1.5 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Item Dialog ──────────────────────────────────────────────────────────────

interface ItemFormData {
  name: string
  price: string
  ada: string
  aus: string
  sortOrder: string
}

const emptyItemForm: ItemFormData = { name: '', price: '', ada: '', aus: '', sortOrder: '0' }

function itemToForm(item: PricingItem): ItemFormData {
  return {
    name: item.name,
    price: item.price,
    ada: item.ada ?? '',
    aus: item.aus ?? '',
    sortOrder: String(item.sortOrder),
  }
}

function ItemDialog({
  item,
  categoryId,
  onClose,
  onSaved,
}: {
  item: PricingItem | null
  categoryId: string
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<ItemFormData>(
    item ? itemToForm(item) : emptyItemForm,
  )
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    if (!form.name.trim()) { toast.error('Name is required'); return }
    setIsSaving(true)
    try {
      const body = {
        name: form.name,
        price: form.price,
        ada: form.ada || null,
        aus: form.aus || null,
        categoryId,
        sortOrder: Number(form.sortOrder) || 0,
      }
      if (item) {
        await api(`/api/tenant/pricing/items/${item.id}`, { method: 'PUT', body })
      } else {
        await api('/api/tenant/pricing/items', { method: 'POST', body })
      }
      toast.success(item ? 'Treatment updated' : 'Treatment added')
      onSaved()
    } catch {
      toast.error('Failed to save treatment')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Treatment' : 'Add Treatment'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>
              Treatment name <span className="text-red-500">*</span>
            </Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Single Tooth Implant"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Price (USD)</Label>
              <Input
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="1,200"
              />
              <p className="text-xs text-gray-400">Number only, or &ldquo;free&rdquo;</p>
            </div>
            <div className="space-y-1.5">
              <Label>Australia avg (AUD)</Label>
              <Input
                value={form.aus}
                onChange={(e) => setForm({ ...form, aus: e.target.value })}
                placeholder="4,500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>
                ADA code <span className="text-gray-400 text-xs">(optional)</span>
              </Label>
              <Input
                value={form.ada}
                onChange={(e) => setForm({ ...form, ada: e.target.value })}
                placeholder="011"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Sort order</Label>
              <Input
                type="number"
                min="0"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={isSaving} onClick={handleSave}>
            <Save className="mr-1.5 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Comparison Row Dialog ────────────────────────────────────────────────────

interface CompRowFormData {
  ada: string
  treatment: string
  roomchangPrice: string
  australiaPrice: string
  sortOrder: string
}

const emptyCompRowForm: CompRowFormData = {
  ada: '',
  treatment: '',
  roomchangPrice: '',
  australiaPrice: '',
  sortOrder: '0',
}

function compRowToForm(row: ComparisonRow): CompRowFormData {
  return {
    ada: row.ada ?? '',
    treatment: row.treatment,
    roomchangPrice: row.roomchangPrice ?? '',
    australiaPrice: row.australiaPrice ?? '',
    sortOrder: String(row.sortOrder),
  }
}

function CompRowDialog({
  row,
  onClose,
  onSaved,
}: {
  row: ComparisonRow | null
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<CompRowFormData>(
    row ? compRowToForm(row) : emptyCompRowForm,
  )
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    if (!form.treatment.trim()) { toast.error('Treatment is required'); return }
    setIsSaving(true)
    try {
      const body = {
        ada: form.ada || null,
        treatment: form.treatment,
        roomchangPrice: form.roomchangPrice || null,
        australiaPrice: form.australiaPrice || null,
        sortOrder: Number(form.sortOrder) || 0,
      }
      if (row) {
        await api(`/api/tenant/pricing/comparison-rows/${row.id}`, { method: 'PUT', body })
      } else {
        await api('/api/tenant/pricing/comparison-rows', { method: 'POST', body })
      }
      toast.success(row ? 'Row updated' : 'Row added')
      onSaved()
    } catch {
      toast.error('Failed to save row')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{row ? 'Edit Comparison Row' : 'Add Comparison Row'}</DialogTitle>
          <DialogDescription>
            Comparison of Roomchang prices vs. Australia shown on the international patients page.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>
              Treatment <span className="text-red-500">*</span>
            </Label>
            <Input
              value={form.treatment}
              onChange={(e) => setForm({ ...form, treatment: e.target.value })}
              placeholder="Single Tooth Implant"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>ADA code</Label>
              <Input
                value={form.ada}
                onChange={(e) => setForm({ ...form, ada: e.target.value })}
                placeholder="661"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Roomchang (USD)</Label>
              <Input
                value={form.roomchangPrice}
                onChange={(e) => setForm({ ...form, roomchangPrice: e.target.value })}
                placeholder="$1,200"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Australia (AUD)</Label>
              <Input
                value={form.australiaPrice}
                onChange={(e) => setForm({ ...form, australiaPrice: e.target.value })}
                placeholder="$4,500"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Sort order</Label>
            <Input
              type="number"
              min="0"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
              className="w-28"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={isSaving} onClick={handleSave}>
            <Save className="mr-1.5 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Treatment Prices Tab ─────────────────────────────────────────────────────

function TreatmentPricesTab() {
  const queryClient = useQueryClient()
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null)
  const [catDialog, setCatDialog] = useState<PricingCategory | null | 'new'>(null)
  const [itemDialog, setItemDialog] = useState<PricingItem | null | 'new'>(null)
  const [deleteCat, setDeleteCat] = useState<PricingCategory | null>(null)
  const [deleteItem, setDeleteItem] = useState<PricingItem | null>(null)

  const { data: categories = [], isLoading: catsLoading } = useQuery<PricingCategory[]>({
    queryKey: ['tenant', 'pricing-categories'],
    queryFn: () => api('/api/tenant/pricing/categories'),
  })

  const { data: allItems = [], isLoading: itemsLoading } = useQuery<PricingItem[]>({
    queryKey: ['tenant', 'pricing-items'],
    queryFn: () => api('/api/tenant/pricing/items'),
  })

  const selectedCat = categories.find((c) => c.id === selectedCatId) ?? null
  const selectedItems = allItems.filter((i) => i.categoryId === selectedCatId)

  const deleteCatMutation = useMutation({
    mutationFn: (id: string) =>
      api(`/api/tenant/pricing/categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'pricing-categories'] })
      queryClient.invalidateQueries({ queryKey: ['tenant', 'pricing-items'] })
      toast.success('Category deleted')
      setDeleteCat(null)
      setSelectedCatId(null)
    },
    onError: () => toast.error('Failed to delete category'),
  })

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) =>
      api(`/api/tenant/pricing/items/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'pricing-items'] })
      toast.success('Treatment deleted')
      setDeleteItem(null)
    },
    onError: () => toast.error('Failed to delete treatment'),
  })

  function handleCatSaved() {
    queryClient.invalidateQueries({ queryKey: ['tenant', 'pricing-categories'] })
    setCatDialog(null)
  }

  function handleItemSaved() {
    queryClient.invalidateQueries({ queryKey: ['tenant', 'pricing-items'] })
    setItemDialog(null)
  }

  return (
    <div className="flex gap-6" style={{ minHeight: 520 }}>
      {/* Left: Category list */}
      <div className="w-72 shrink-0 rounded-lg border border-gray-200 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Categories
          </span>
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs"
            onClick={() => setCatDialog('new')}
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {catsLoading ? (
            <div className="py-10 text-center text-xs text-gray-400">Loading…</div>
          ) : categories.length === 0 ? (
            <div className="py-10 text-center text-xs text-gray-400">
              No categories yet.<br />Click Add to start.
            </div>
          ) : (
            categories.map((cat) => {
              const count = allItems.filter((i) => i.categoryId === cat.id).length
              const isSelected = selectedCatId === cat.id
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCatId(isSelected ? null : cat.id)}
                  className={`group flex items-center justify-between px-4 py-3 cursor-pointer transition-colors hover:bg-blue-50 ${
                    isSelected ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{cat.title}</p>
                    <p className="text-xs text-gray-400">
                      {count} treatment{count !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 shrink-0 ml-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setCatDialog(cat) }}
                      className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-100"
                      title="Edit category"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteCat(cat) }}
                      className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-100"
                      title="Delete category"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Right: Items for selected category */}
      <div className="flex-1 rounded-lg border border-gray-200 flex flex-col overflow-hidden">
        {!selectedCat ? (
          <div className="flex h-full items-center justify-center text-center text-sm text-gray-400">
            <div>
              <DollarSign className="mx-auto h-10 w-10 text-gray-200 mb-3" />
              <p>Select a category to manage its treatments</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50 shrink-0">
              <div>
                <p className="text-sm font-semibold text-gray-900">{selectedCat.title}</p>
                <p className="text-xs text-gray-400">
                  {selectedItems.length} treatment{selectedItems.length !== 1 ? 's' : ''}
                </p>
              </div>
              <Button size="sm" onClick={() => setItemDialog('new')}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Treatment
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {itemsLoading ? (
                <div className="py-10 text-center text-xs text-gray-400">Loading…</div>
              ) : selectedItems.length === 0 ? (
                <div className="py-16 text-center text-sm text-gray-400">
                  No treatments yet — click &ldquo;Add Treatment&rdquo; to start.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Treatment</TableHead>
                      <TableHead className="w-28">Price (USD)</TableHead>
                      <TableHead className="w-28">AUS avg</TableHead>
                      <TableHead className="w-24">ADA code</TableHead>
                      <TableHead className="w-20 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedItems.map((item) => (
                      <TableRow
                        key={item.id}
                        className="cursor-pointer"
                        onClick={() => setItemDialog(item)}
                      >
                        <TableCell className="font-medium text-gray-900">{item.name}</TableCell>
                        <TableCell className="font-semibold text-gray-700">
                          {item.price
                            ? item.price.toLowerCase() === 'free'
                              ? 'Free'
                              : `$${item.price}`
                            : '--'}
                        </TableCell>
                        <TableCell className="text-xs text-gray-400">
                          {item.aus ? `$${item.aus}` : '--'}
                        </TableCell>
                        <TableCell className="text-xs text-gray-400 font-mono">
                          {item.ada || '--'}
                        </TableCell>
                        <TableCell className="text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteItem(item) }}
                            className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </>
        )}
      </div>

      {/* Category dialog */}
      {catDialog !== null && (
        <CategoryDialog
          category={catDialog === 'new' ? null : catDialog}
          onClose={() => setCatDialog(null)}
          onSaved={handleCatSaved}
        />
      )}

      {/* Item dialog — only mountable when a category is selected */}
      {itemDialog !== null && selectedCat && (
        <ItemDialog
          item={itemDialog === 'new' ? null : itemDialog}
          categoryId={selectedCat.id}
          onClose={() => setItemDialog(null)}
          onSaved={handleItemSaved}
        />
      )}

      {/* Delete category confirmation */}
      <Dialog open={!!deleteCat} onOpenChange={() => setDeleteCat(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete category</DialogTitle>
            <DialogDescription>
              Delete &ldquo;{deleteCat?.title}&rdquo;? All treatments inside will also be removed
              from the website. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCat(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={deleteCatMutation.isPending}
              onClick={() => deleteCat && deleteCatMutation.mutate(deleteCat.id)}
            >
              {deleteCatMutation.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete item confirmation */}
      <Dialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete treatment</DialogTitle>
            <DialogDescription>
              Delete &ldquo;{deleteItem?.name}&rdquo;? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteItem(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={deleteItemMutation.isPending}
              onClick={() => deleteItem && deleteItemMutation.mutate(deleteItem.id)}
            >
              {deleteItemMutation.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── International Comparison Tab ─────────────────────────────────────────────

function ComparisonTab() {
  const queryClient = useQueryClient()
  const [rowDialog, setRowDialog] = useState<ComparisonRow | null | 'new'>(null)
  const [deleteRow, setDeleteRow] = useState<ComparisonRow | null>(null)

  const { data: rows = [], isLoading } = useQuery<ComparisonRow[]>({
    queryKey: ['tenant', 'pricing-comparison-rows'],
    queryFn: () => api('/api/tenant/pricing/comparison-rows'),
  })

  const deleteRowMutation = useMutation({
    mutationFn: (id: string) =>
      api(`/api/tenant/pricing/comparison-rows/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'pricing-comparison-rows'] })
      toast.success('Row deleted')
      setDeleteRow(null)
    },
    onError: () => toast.error('Failed to delete row'),
  })

  function handleRowSaved() {
    queryClient.invalidateQueries({ queryKey: ['tenant', 'pricing-comparison-rows'] })
    setRowDialog(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Price comparisons shown on the international patients page. All prices are display strings
          — format them exactly as you want them to appear (e.g. &ldquo;$1,200&rdquo;).
        </p>
        <Button size="sm" onClick={() => setRowDialog('new')}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Row
        </Button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-gray-500">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
          <p className="text-sm font-medium text-gray-600">No comparison rows yet</p>
          <p className="mt-1 text-xs text-gray-400">
            Click &ldquo;Add Row&rdquo; to add a treatment comparison.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Treatment</TableHead>
                <TableHead className="w-24">ADA code</TableHead>
                <TableHead className="w-36">Roomchang (USD)</TableHead>
                <TableHead className="w-36">Australia (AUD)</TableHead>
                <TableHead className="w-20 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => setRowDialog(row)}
                >
                  <TableCell className="font-medium text-gray-900">{row.treatment}</TableCell>
                  <TableCell className="text-xs text-gray-400 font-mono">{row.ada || '--'}</TableCell>
                  <TableCell className="font-semibold text-gray-700">{row.roomchangPrice || '--'}</TableCell>
                  <TableCell className="text-gray-500">{row.australiaPrice || '--'}</TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteRow(row) }}
                      className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {rowDialog !== null && (
        <CompRowDialog
          row={rowDialog === 'new' ? null : rowDialog}
          onClose={() => setRowDialog(null)}
          onSaved={handleRowSaved}
        />
      )}

      <Dialog open={!!deleteRow} onOpenChange={() => setDeleteRow(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete comparison row</DialogTitle>
            <DialogDescription>
              Delete &ldquo;{deleteRow?.treatment}&rdquo;? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteRow(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={deleteRowMutation.isPending}
              onClick={() => deleteRow && deleteRowMutation.mutate(deleteRow.id)}
            >
              {deleteRowMutation.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function Pricing() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Pricing Manager"
        subtitle="Manage treatment prices and international cost comparisons"
        breadcrumbs={[{ label: 'Overview', href: '/' }, { label: 'Pricing Manager' }]}
      />

      <Tabs defaultValue="treatments">
        <TabsList>
          <TabsTrigger value="treatments">Treatment Prices</TabsTrigger>
          <TabsTrigger value="comparison">International Comparison</TabsTrigger>
        </TabsList>
        <TabsContent value="treatments" className="mt-6">
          <TreatmentPricesTab />
        </TabsContent>
        <TabsContent value="comparison" className="mt-6">
          <ComparisonTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
