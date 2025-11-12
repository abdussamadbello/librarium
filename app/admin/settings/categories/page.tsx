'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Trash2 } from 'lucide-react'

interface Category {
  id: number
  name: string
  description: string | null
}

interface Author {
  id: number
  name: string
  biography: string | null
}

export default function CategoriesAuthorsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'categories' | 'authors'>('categories')
  const [newCategory, setNewCategory] = useState({ name: '', description: '' })
  const [newAuthor, setNewAuthor] = useState({ name: '', biography: '' })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [categoriesRes, authorsRes] = await Promise.all([
        fetch('/api/admin/categories'),
        fetch('/api/admin/authors'),
      ])

      const categoriesData = await categoriesRes.json()
      const authorsData = await authorsRes.json()

      setCategories(categoriesData.categories || [])
      setAuthors(authorsData.authors || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newCategory.name.trim()) {
      alert('Category name is required')
      return
    }

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory),
      })

      if (res.ok) {
        alert('Category added successfully')
        setNewCategory({ name: '', description: '' })
        fetchData()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to add category')
      }
    } catch (error) {
      alert('Failed to add category')
    }
  }

  const handleAddAuthor = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newAuthor.name.trim()) {
      alert('Author name is required')
      return
    }

    try {
      const res = await fetch('/api/admin/authors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAuthor),
      })

      if (res.ok) {
        alert('Author added successfully')
        setNewAuthor({ name: '', biography: '' })
        fetchData()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to add author')
      }
    } catch (error) {
      alert('Failed to add author')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Categories & Authors</h1>
        <p className="text-slate-600 mt-1">Manage book categories and authors</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'categories'
              ? 'border-b-2 border-teal-600 text-teal-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'authors'
              ? 'border-b-2 border-teal-600 text-teal-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          onClick={() => setActiveTab('authors')}
        >
          Authors
        </button>
      </div>

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          {/* Add New Category Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Category</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category-name" className="block text-sm font-medium text-slate-700 mb-1">
                      Name *
                    </label>
                    <Input
                      id="category-name"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      placeholder="e.g., Science Fiction"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="category-description" className="block text-sm font-medium text-slate-700 mb-1">
                      Description
                    </label>
                    <Input
                      id="category-description"
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                      placeholder="Brief description"
                    />
                  </div>
                </div>
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Categories List */}
          <Card>
            <CardHeader>
              <CardTitle>All Categories ({categories.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12 text-slate-500">Loading...</div>
              ) : categories.length === 0 ? (
                <div className="text-center py-12 text-slate-500">No categories found</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell className="text-slate-500">
                          {category.description || 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" disabled>
                            <Trash2 className="w-4 h-4 text-slate-400" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Authors Tab */}
      {activeTab === 'authors' && (
        <div className="space-y-6">
          {/* Add New Author Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Author</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddAuthor} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="author-name" className="block text-sm font-medium text-slate-700 mb-1">
                      Name *
                    </label>
                    <Input
                      id="author-name"
                      value={newAuthor.name}
                      onChange={(e) => setNewAuthor({ ...newAuthor, name: e.target.value })}
                      placeholder="e.g., Isaac Asimov"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="author-biography" className="block text-sm font-medium text-slate-700 mb-1">
                      Biography
                    </label>
                    <Input
                      id="author-biography"
                      value={newAuthor.biography}
                      onChange={(e) => setNewAuthor({ ...newAuthor, biography: e.target.value })}
                      placeholder="Brief biography"
                    />
                  </div>
                </div>
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Author
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Authors List */}
          <Card>
            <CardHeader>
              <CardTitle>All Authors ({authors.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12 text-slate-500">Loading...</div>
              ) : authors.length === 0 ? (
                <div className="text-center py-12 text-slate-500">No authors found</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Biography</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {authors.map((author) => (
                      <TableRow key={author.id}>
                        <TableCell className="font-medium">{author.name}</TableCell>
                        <TableCell className="text-slate-500">
                          {author.biography || 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" disabled>
                            <Trash2 className="w-4 h-4 text-slate-400" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
