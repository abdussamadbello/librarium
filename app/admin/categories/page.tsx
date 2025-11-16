'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2, FolderOpen, BookOpen } from 'lucide-react'

interface Category {
  id: number
  name: string
  description: string | null
  parentId: number | null
  createdAt: Date
  bookCount?: number
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: null as number | null,
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      setCategories(data || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const getParentName = (parentId: number | null) => {
    if (!parentId) return null
    const parent = categories.find((c) => c.id === parentId)
    return parent?.name
  }

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        description: category.description || '',
        parentId: category.parentId,
      })
    } else {
      setEditingCategory(null)
      setFormData({ name: '', description: '', parentId: null })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingCategory(null)
    setFormData({ name: '', description: '', parentId: null })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories'
      const method = editingCategory ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        alert(`Category ${editingCategory ? 'updated' : 'created'} successfully`)
        handleCloseDialog()
        fetchCategories()
      } else {
        const data = await res.json()
        alert(data.error || `Failed to ${editingCategory ? 'update' : 'create'} category`)
      }
    } catch (error) {
      alert(`Failed to ${editingCategory ? 'update' : 'create'} category`)
    }
  }

  const handleDelete = async (id: number, name: string, bookCount?: number) => {
    if (bookCount && bookCount > 0) {
      alert(`Cannot delete category "${name}" because it has ${bookCount} associated books.`)
      return
    }

    if (!confirm(`Are you sure you want to delete "${name}"?`)) return

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        alert('Category deleted successfully')
        fetchCategories()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete category')
      }
    } catch (error) {
      alert('Failed to delete category')
    }
  }

  // Group categories by parent
  const rootCategories = categories.filter((c) => !c.parentId)
  const childCategories = categories.filter((c) => c.parentId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Category Management</h1>
          <p className="text-slate-600 mt-1">Organize your library&apos;s book categories</p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Hierarchy</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <FolderOpen className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>No categories found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Parent Category</TableHead>
                  <TableHead className="text-center">Books</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rootCategories.map((category) => (
                  <>
                    <TableRow key={category.id} className="bg-slate-50">
                      <TableCell className="font-semibold">
                        <div className="flex items-center">
                          <FolderOpen className="w-4 h-4 mr-2 text-teal-600" />
                          {category.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {category.description || (
                          <span className="italic text-slate-400">No description</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Root</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {category.bookCount !== undefined ? (
                          <Badge variant="secondary">
                            <BookOpen className="w-3 h-3 mr-1" />
                            {category.bookCount}
                          </Badge>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={() => handleOpenDialog(category)}
                            size="sm"
                            variant="outline"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(category.id, category.name, category.bookCount)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {/* Child categories */}
                    {childCategories
                      .filter((c) => c.parentId === category.id)
                      .map((child) => (
                        <TableRow key={child.id}>
                          <TableCell className="pl-12">
                            <div className="flex items-center">
                              <span className="text-slate-400 mr-2">└─</span>
                              {child.name}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {child.description || (
                              <span className="italic text-slate-400">No description</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{category.name}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {child.bookCount !== undefined ? (
                              <Badge variant="secondary">
                                <BookOpen className="w-3 h-3 mr-1" />
                                {child.bookCount}
                              </Badge>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                onClick={() => handleOpenDialog(child)}
                                size="sm"
                                variant="outline"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleDelete(child.id, child.name, child.bookCount)}
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Fiction, Science, History"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Category description..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentId">Parent Category (Optional)</Label>
                <Select
                  value={formData.parentId?.toString() || 'none'}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      parentId: value === 'none' ? null : parseInt(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Root Category)</SelectItem>
                    {rootCategories
                      .filter((c) => c.id !== editingCategory?.id)
                      .map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                {editingCategory ? 'Update' : 'Create'} Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
