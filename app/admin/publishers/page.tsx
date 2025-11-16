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
import { Plus, Search, Edit, Trash2, Building2, BookOpen, Globe, Mail } from 'lucide-react'

interface Publisher {
  id: number
  name: string
  description: string | null
  website: string | null
  contactEmail: string | null
  createdAt: Date
  bookCount?: number
}

export default function PublishersPage() {
  const [publishers, setPublishers] = useState<Publisher[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPublisher, setEditingPublisher] = useState<Publisher | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    contactEmail: '',
  })

  useEffect(() => {
    fetchPublishers()
  }, [])

  const fetchPublishers = async () => {
    try {
      const res = await fetch(`/api/admin/publishers?search=${search}`)
      const data = await res.json()
      setPublishers(data || [])
    } catch (error) {
      console.error('Failed to fetch publishers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    fetchPublishers()
  }

  const handleOpenDialog = (publisher?: Publisher) => {
    if (publisher) {
      setEditingPublisher(publisher)
      setFormData({
        name: publisher.name,
        description: publisher.description || '',
        website: publisher.website || '',
        contactEmail: publisher.contactEmail || '',
      })
    } else {
      setEditingPublisher(null)
      setFormData({ name: '', description: '', website: '', contactEmail: '' })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingPublisher(null)
    setFormData({ name: '', description: '', website: '', contactEmail: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingPublisher
        ? `/api/admin/publishers/${editingPublisher.id}`
        : '/api/admin/publishers'
      const method = editingPublisher ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        alert(`Publisher ${editingPublisher ? 'updated' : 'created'} successfully`)
        handleCloseDialog()
        fetchPublishers()
      } else {
        const data = await res.json()
        alert(data.error || `Failed to ${editingPublisher ? 'update' : 'create'} publisher`)
      }
    } catch (error) {
      alert(`Failed to ${editingPublisher ? 'update' : 'create'} publisher`)
    }
  }

  const handleDelete = async (id: number, name: string, bookCount?: number) => {
    if (bookCount && bookCount > 0) {
      alert(`Cannot delete publisher "${name}" because they have ${bookCount} associated books.`)
      return
    }

    if (!confirm(`Are you sure you want to delete "${name}"?`)) return

    try {
      const res = await fetch(`/api/admin/publishers/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        alert('Publisher deleted successfully')
        fetchPublishers()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete publisher')
      }
    } catch (error) {
      alert('Failed to delete publisher')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Publisher Management</h1>
          <p className="text-slate-600 mt-1">Manage your library&apos;s publisher database</p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Publisher
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Publishers</p>
                <p className="text-2xl font-bold text-slate-900">{publishers.length}</p>
              </div>
              <Building2 className="w-8 h-8 text-teal-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">With Contact Info</p>
                <p className="text-2xl font-bold text-teal-600">
                  {publishers.filter((p) => p.contactEmail || p.website).length}
                </p>
              </div>
              <Mail className="w-8 h-8 text-teal-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Books</p>
                <p className="text-2xl font-bold text-slate-900">
                  {publishers.reduce((sum, p) => sum + (p.bookCount || 0), 0)}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-teal-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Publisher Directory</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search publishers by name..."
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
            <div className="text-center py-8 text-slate-500">Loading publishers...</div>
          ) : publishers.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Building2 className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>No publishers found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-center">Books</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {publishers.map((publisher) => (
                  <TableRow key={publisher.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 mr-2 text-teal-600" />
                        {publisher.name}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md">
                      {publisher.description ? (
                        <span className="text-sm text-slate-600 line-clamp-2">
                          {publisher.description}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm italic">No description</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {publisher.website && (
                          <div className="flex items-center text-sm text-blue-600">
                            <Globe className="w-3 h-3 mr-1" />
                            <a
                              href={publisher.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline truncate max-w-[150px]"
                            >
                              {publisher.website.replace(/^https?:\/\//, '')}
                            </a>
                          </div>
                        )}
                        {publisher.contactEmail && (
                          <div className="flex items-center text-sm text-slate-600">
                            <Mail className="w-3 h-3 mr-1" />
                            <a href={`mailto:${publisher.contactEmail}`} className="hover:underline">
                              {publisher.contactEmail}
                            </a>
                          </div>
                        )}
                        {!publisher.website && !publisher.contactEmail && (
                          <span className="text-slate-400 text-sm italic">No contact info</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {publisher.bookCount !== undefined ? (
                        <Badge variant="secondary">
                          <BookOpen className="w-3 h-3 mr-1" />
                          {publisher.bookCount}
                        </Badge>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => handleOpenDialog(publisher)}
                          size="sm"
                          variant="outline"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() =>
                            handleDelete(publisher.id, publisher.name, publisher.bookCount)
                          }
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
              {editingPublisher ? 'Edit Publisher' : 'Add New Publisher'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Publisher Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Penguin Random House"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the publisher..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://www.publisher.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="contact@publisher.com"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                {editingPublisher ? 'Update' : 'Create'} Publisher
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
