'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'

interface Book {
  book: {
    id: number
    title: string
    isbn: string | null
    publicationYear: number | null
    totalCopies: number
    availableCopies: number
  }
  author: {
    name: string
  } | null
  category: {
    name: string
  } | null
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      const res = await fetch(`/api/admin/books?search=${search}&limit=50`)
      const data = await res.json()
      setBooks(data.books || [])
    } catch (error) {
      console.error('Failed to fetch books:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    fetchBooks()
  }

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return

    try {
      const res = await fetch(`/api/admin/books/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        alert('Book deleted successfully')
        fetchBooks()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete book')
      }
    } catch (error) {
      alert('Failed to delete book')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Books Management</h1>
          <p className="text-slate-600 mt-1">Manage your library&apos;s book collection</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700">
          <Plus className="w-4 h-4 mr-2" />
          Add New Book
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Book Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search by title, ISBN, or author..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button type="submit">Search</Button>
            </div>
          </form>

          {/* Table */}
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading...</div>
          ) : books.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No books found{search ? ` for "${search}"` : ''}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>ISBN</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Copies</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {books.map((item) => (
                    <TableRow key={item.book.id}>
                      <TableCell className="font-medium">{item.book.title}</TableCell>
                      <TableCell>{item.author?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.category?.name || 'Uncategorized'}</Badge>
                      </TableCell>
                      <TableCell className="text-slate-500">{item.book.isbn || 'N/A'}</TableCell>
                      <TableCell className="text-slate-500">{item.book.publicationYear || 'N/A'}</TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {item.book.availableCopies}/{item.book.totalCopies}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.book.id, item.book.title)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
