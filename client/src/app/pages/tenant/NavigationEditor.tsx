import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { PageHeader } from '@/app/components/shared/PageHeader'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Separator } from '@/app/components/ui/separator'
import { Checkbox } from '@/app/components/ui/checkbox'
import {
  GripVertical,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Save,
  Plus,
  Menu,
  FileText,
  Pencil,
  Check,
  X,
} from 'lucide-react'

// ---------- Types ----------

interface PageItem {
  id: number
  title: string
  slug: string
  status: string
  show_in_nav: number
  nav_label: string
  nav_parent_id: number | null
  sort_order: number
}

interface NavItem {
  pageId: number
  label: string
  slug: string
  indent: number
  sortOrder: number
}

// ---------- Component ----------

export function NavigationEditor() {
  const queryClient = useQueryClient()

  // Fetch all pages
  const { data: allPages = [], isLoading } = useQuery<PageItem[]>({
    queryKey: ['tenant', 'pages'],
    queryFn: () => api('/api/tenant/pages'),
  })

  // Local state for the menu items being edited
  const [menuItems, setMenuItems] = useState<NavItem[]>([])
  const [selectedPageIds, setSelectedPageIds] = useState<Set<number>>(new Set())
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  // Initialize menu items from pages that are in nav
  useEffect(() => {
    if (allPages.length > 0) {
      const navPages = allPages
        .filter((p) => p.show_in_nav)
        .sort((a, b) => a.sort_order - b.sort_order)

      // Build indent levels from nav_parent_id
      const items: NavItem[] = []
      const parentMap = new Map<number | null, PageItem[]>()

      for (const page of navPages) {
        const parentId = page.nav_parent_id ?? null
        if (!parentMap.has(parentId)) parentMap.set(parentId, [])
        parentMap.get(parentId)!.push(page)
      }

      function addItems(parentId: number | null, indent: number) {
        const children = parentMap.get(parentId) || []
        children.sort((a, b) => a.sort_order - b.sort_order)
        for (const child of children) {
          items.push({
            pageId: child.id,
            label: child.nav_label || child.title,
            slug: child.slug,
            indent,
            sortOrder: child.sort_order,
          })
          addItems(child.id, indent + 1)
        }
      }

      addItems(null, 0)
      setMenuItems(items)
      setHasChanges(false)
    }
  }, [allPages])

  // Pages not currently in the menu
  const availablePages = allPages.filter(
    (p) => !menuItems.some((m) => m.pageId === p.id),
  )

  // Toggle page selection for adding
  function togglePageSelection(pageId: number) {
    setSelectedPageIds((prev) => {
      const next = new Set(prev)
      if (next.has(pageId)) next.delete(pageId)
      else next.add(pageId)
      return next
    })
  }

  // Add selected pages to menu
  function addToMenu() {
    const newItems: NavItem[] = []
    for (const pageId of selectedPageIds) {
      const page = allPages.find((p) => p.id === pageId)
      if (page) {
        newItems.push({
          pageId: page.id,
          label: page.title,
          slug: page.slug,
          indent: 0,
          sortOrder: menuItems.length + newItems.length,
        })
      }
    }
    setMenuItems((prev) => [...prev, ...newItems])
    setSelectedPageIds(new Set())
    setHasChanges(true)
  }

  // Remove item from menu
  function removeItem(pageId: number) {
    setMenuItems((prev) => prev.filter((m) => m.pageId !== pageId))
    setHasChanges(true)
  }

  // Move item up/down
  function moveItem(pageId: number, direction: 'up' | 'down') {
    const index = menuItems.findIndex((m) => m.pageId === pageId)
    if (index === -1) return
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= menuItems.length) return
    const newItems = [...menuItems]
    ;[newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]]
    setMenuItems(newItems)
    setHasChanges(true)
  }

  // Indent/outdent
  function indent(pageId: number) {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.pageId === pageId && item.indent < 2
          ? { ...item, indent: item.indent + 1 }
          : item,
      ),
    )
    setHasChanges(true)
  }

  function outdent(pageId: number) {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.pageId === pageId && item.indent > 0
          ? { ...item, indent: item.indent - 1 }
          : item,
      ),
    )
    setHasChanges(true)
  }

  // Start inline editing
  function startEditing(pageId: number, currentLabel: string) {
    setEditingId(pageId)
    setEditLabel(currentLabel)
  }

  function saveEditing() {
    if (editingId !== null) {
      setMenuItems((prev) =>
        prev.map((item) =>
          item.pageId === editingId ? { ...item, label: editLabel } : item,
        ),
      )
      setEditingId(null)
      setEditLabel('')
      setHasChanges(true)
    }
  }

  function cancelEditing() {
    setEditingId(null)
    setEditLabel('')
  }

  // Derive parent IDs from indent structure for saving
  function deriveParentIds(items: NavItem[]): Map<number, number | null> {
    const parentMap = new Map<number, number | null>()
    const indentStack: number[] = [] // pageId at each indent level

    for (const item of items) {
      // Find parent: the last item at indent-1
      if (item.indent === 0) {
        parentMap.set(item.pageId, null)
      } else {
        const parentId = indentStack[item.indent - 1] ?? null
        parentMap.set(item.pageId, parentId)
      }
      indentStack[item.indent] = item.pageId
    }

    return parentMap
  }

  // Save mutation: updates each page's nav settings
  const saveMutation = useMutation({
    mutationFn: async () => {
      const parentIds = deriveParentIds(menuItems)

      // Pages currently in menu: update nav settings
      const inMenuUpdates = menuItems.map((item, index) =>
        api(`/api/tenant/pages/${item.pageId}`, {
          method: 'PUT',
          body: {
            show_in_nav: 1,
            nav_label: item.label,
            nav_parent_id: parentIds.get(item.pageId) ?? null,
            sort_order: index,
          },
        }),
      )

      // Pages removed from menu: clear nav settings
      const removedPages = allPages.filter(
        (p) => p.show_in_nav && !menuItems.some((m) => m.pageId === p.id),
      )
      const removeUpdates = removedPages.map((p) =>
        api(`/api/tenant/pages/${p.id}`, {
          method: 'PUT',
          body: {
            show_in_nav: 0,
            nav_label: '',
            nav_parent_id: null,
            sort_order: 0,
          },
        }),
      )

      await Promise.all([...inMenuUpdates, ...removeUpdates])
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'pages'] })
      toast.success('Navigation saved')
      setHasChanges(false)
    },
    onError: () => {
      toast.error('Failed to save navigation')
    },
  })

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Navigation"
        subtitle="Organize your site menu structure"
        breadcrumbs={[{ label: 'Overview', href: '/' }, { label: 'Navigation' }]}
        actions={
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !hasChanges}
            size="sm"
          >
            <Save className="mr-1.5 h-4 w-4" />
            {saveMutation.isPending ? 'Saving...' : 'Save Menu'}
          </Button>
        }
      />

      {isLoading ? (
        <div className="py-12 text-center text-sm text-gray-500">
          <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
          Loading...
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left: Available Pages */}
          <div className="lg:col-span-2">
            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-gray-400" />
                  Available Pages
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {availablePages.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-400">
                    All pages are in the menu.
                  </p>
                ) : (
                  <>
                    <div className="max-h-80 space-y-1 overflow-y-auto">
                      {availablePages.map((page) => (
                        <label
                          key={page.id}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
                        >
                          <Checkbox
                            checked={selectedPageIds.has(page.id)}
                            onCheckedChange={() => togglePageSelection(page.id)}
                          />
                          <span className="flex-1 truncate text-gray-700">
                            {page.title || 'Untitled'}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">
                            /{page.slug}
                          </span>
                        </label>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={selectedPageIds.size === 0}
                      onClick={addToMenu}
                      className="w-full"
                    >
                      <Plus className="mr-1.5 h-4 w-4" />
                      Add to Menu ({selectedPageIds.size})
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Menu Structure */}
          <div className="lg:col-span-3">
            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Menu className="h-4 w-4 text-gray-400" />
                  Menu Structure
                </CardTitle>
              </CardHeader>
              <CardContent>
                {menuItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Menu className="mb-3 h-8 w-8 text-gray-300" />
                    <p className="text-sm text-gray-500">No menu items yet.</p>
                    <p className="text-xs text-gray-400">
                      Select pages from the left panel and add them to your menu.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {menuItems.map((item, index) => (
                      <div
                        key={item.pageId}
                        className="flex items-center gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2 transition-colors hover:border-gray-200"
                        style={{ marginLeft: `${item.indent * 24}px` }}
                      >
                        <GripVertical className="h-4 w-4 shrink-0 text-gray-300 cursor-grab" />

                        {/* Label (inline editable) */}
                        <div className="flex-1 min-w-0">
                          {editingId === item.pageId ? (
                            <div className="flex items-center gap-1">
                              <Input
                                value={editLabel}
                                onChange={(e) => setEditLabel(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveEditing()
                                  if (e.key === 'Escape') cancelEditing()
                                }}
                                className="h-7 text-sm"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={saveEditing}
                                className="rounded p-1 text-emerald-600 hover:bg-emerald-50"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditing}
                                className="rounded p-1 text-gray-400 hover:bg-gray-100"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="truncate text-sm font-medium text-gray-700">
                                {item.label}
                              </span>
                              <span className="text-xs text-gray-400 font-mono">
                                /{item.slug}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        {editingId !== item.pageId && (
                          <div className="flex items-center gap-0.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => startEditing(item.pageId, item.label)}
                              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                              title="Edit label"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => outdent(item.pageId)}
                              disabled={item.indent === 0}
                              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Outdent"
                            >
                              <ChevronLeft className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => indent(item.pageId)}
                              disabled={item.indent >= 2}
                              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Indent"
                            >
                              <ChevronRight className="h-3 w-3" />
                            </button>
                            <Separator orientation="vertical" className="h-4 mx-0.5" />
                            <button
                              type="button"
                              onClick={() => moveItem(item.pageId, 'up')}
                              disabled={index === 0}
                              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move up"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveItem(item.pageId, 'down')}
                              disabled={index === menuItems.length - 1}
                              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move down"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>
                            <Separator orientation="vertical" className="h-4 mx-0.5" />
                            <button
                              type="button"
                              onClick={() => removeItem(item.pageId)}
                              className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                              title="Remove from menu"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {hasChanges && (
                  <p className="mt-4 text-xs text-amber-600">
                    You have unsaved changes. Click "Save Menu" to apply.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
