'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { BookQRDisplay } from '@/components/qr/book-qr-display'
import { Search, BookOpen, QrCode } from 'lucide-react'

interface BookCopy {
  id: number
  copyNumber: string
  status: string
  bookId: number
}

interface Book {
  id: number
  title: string
  isbn: string | null
  author: { name: string } | null
  copies: BookCopy[]
}

export default function BookQRCodesPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const searchBooks = async () => {
    if (!search.trim()) {
      alert('Please enter a search term')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/books?search=${search}&limit=10`)
      const data = await res.json()
      setBooks(data.books || [])
    } catch (error) {
      console.error('Failed to search books:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBookCopies = async (bookId: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/books/${bookId}`)
      const data = await res.json()
      setSelectedBook(data)
    } catch (error) {
      console.error('Failed to fetch book copies:', error)
      alert('Failed to load book copies')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchBooks()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Book QR Codes</h1>
        <p className="text-slate-600 mt-1">Generate and print QR codes for book copies</p>
      </div>

      {/* Search Books */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search for a Book
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Search by title, ISBN, or author..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </form>

          {/* Search Results */}
          {books.length > 0 && (
            <div className="mt-6 space-y-2">
              <h3 className="text-sm font-semibold text-slate-700">Search Results:</h3>
              {books.map((book) => (
                <div
                  key={book.id}
                  className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                  onClick={() => fetchBookCopies(book.id)}
                >
                  <div>
                    <p className="font-medium">{book.title}</p>
                    <p className="text-sm text-slate-500">
                      {book.author?.name || 'Unknown Author'}
                      {book.isbn && ` • ISBN: ${book.isbn}`}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => fetchBookCopies(book.id)}>
                    View Copies
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Book Copies */}
      {selectedBook && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-6 h-6 text-teal-600" />
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{selectedBook.title}</h2>
              <p className="text-slate-600">
                {selectedBook.author?.name || 'Unknown Author'}
                {selectedBook.copies && ` • ${selectedBook.copies.length} copies`}
              </p>
            </div>
          </div>

          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-slate-600">Loading book copies...</p>
              </CardContent>
            </Card>
          ) : selectedBook.copies && selectedBook.copies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedBook.copies.map((copy) => (
                <BookQRDisplay
                  key={copy.id}
                  copyId={copy.id}
                  bookTitle={selectedBook.title}
                  copyNumber={copy.copyNumber}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-slate-600">No copies found for this book</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Search for a book, view its copies, and generate QR codes for each copy.
          You can download or print the QR codes to attach to physical books.
        </p>
      </div>
    </div>
  )
}
