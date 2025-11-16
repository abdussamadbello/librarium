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
import { Plus, Search, Edit, Trash2, UserPlus, BookOpen } from 'lucide-react'

interface Author {
  id: number
  name: string
  bio: string | null
  imageUrl: string | null
  createdAt: Date
  bookCount?: number
}

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    imageUrl: '',
  })

  useEffect(() => {
    fetchAuthors()
  }, [])

  const fetchAuthors = async () => {
    try {
      const res = await fetch(`/api/admin/authors?search=${search}`)
      const data = await res.json()
      setAuthors(data || [])
    } catch (error) {
      console.error('Failed to fetch authors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    fetchAuthors()
  }

  const handleOpenDialog = (author?: Author) => {
    if (author) {
      setEditingAuthor(author)
      setFormData({
        name: author.name,
        bio: author.bio || '',
        imageUrl: author.imageUrl || '',
      })
    } else {
      setEditingAuthor(null)
      setFormData({ name: '', bio: '', imageUrl: '' })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingAuthor(null)
    setFormData({ name: '', bio: '', imageUrl: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingAuthor
        ? `/api/admin/authors/${editingAuthor.id}`
        : '/api/admin/authors'
      const method = editingAuthor ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        alert(`Author ${editingAuthor ? 'updated' : 'created'} successfully`)
        handleCloseDialog()
        fetchAuthors()
      } else {
        const data = await res.json()
        alert(data.error || `Failed to ${editingAuthor ? 'update' : 'create'} author`)
      }
    } catch (error) {
      alert(`Failed to ${editingAuthor ? 'update' : 'create'} author`)
    }
  }

  const handleDelete = async (id: number, name: string, bookCount?: number) => {
    if (bookCount && bookCount > 0) {
      alert(`Cannot delete author "${name}" because they have ${bookCount} associated books.`)
      return
    }

    if (!confirm(`Are you sure you want to delete "${name}"?`)) return

    try {
      const res = await fetch(`/api/admin/authors/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        alert('Author deleted successfully')
        fetchAuthors()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete author')
      }
    } catch (error) {
      alert('Failed to delete author')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Authors Management</h1>
          <p className="text-slate-600 mt-1">Manage your library&apos;s author database</p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Author
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Author Directory</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search authors by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" variant="outline">
                Search
              </Button>
            </div>
          </form>

          {/* Table */}
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading authors...</div>
          ) : authors.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <UserPlus className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>No authors found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Bio</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead className="text-center">Books</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {authors.map((author) => (
                  <TableRow key={author.id}>
                    <TableCell className="font-medium">{author.name}</TableCell>
                    <TableCell className="max-w-md">
                      {author.bio ? (
                        <span className="text-sm text-slate-600 line-clamp-2">
                          {author.bio}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm italic">No bio</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {author.imageUrl ? (
                        <img
                          src={author.imageUrl}
                          alt={author.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                          <UserPlus className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {author.bookCount !== undefined ? (
                        <Badge variant="secondary">
                          <BookOpen className="w-3 h-3 mr-1" />
                          {author.bookCount}
                        </Badge>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => handleOpenDialog(author)}
                          size="sm"
                          variant="outline"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(author.id, author.name, author.bookCount)}
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
              {editingAuthor ? 'Edit Author' : 'Add New Author'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Author name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Biography</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Author biography..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/author.jpg"
                />
                {formData.imageUrl && (
                  <div className="mt-2">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                {editingAuthor ? 'Update' : 'Create'} Author
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
