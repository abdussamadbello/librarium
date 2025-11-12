'use client'

import { useState, useEffect } from 'react'
import { Search, ChevronDown, ChevronRight, BookOpen } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

interface Book {
  book: {
    id: number
    title: string
    isbn: string | null
    publisher: string
    publicationYear: number | null
    description: string | null
    totalCopies: number
    availableCopies: number
  }
  author: {
    id: number
    name: string
  } | null
  category: {
    id: number
    name: string
  } | null
}

interface Category {
  id: number
  name: string
  description: string | null
}

function BookCard({ book }: { book: Book }) {
  const isAvailable = book.book.availableCopies > 0

  return (
    <Link href={`/member/books/${book.book.id}`}>
      <div className="flex-shrink-0 w-48 group cursor-pointer">
        <div className="relative rounded-lg overflow-hidden shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
          <div className="w-full h-64 bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center p-4">
            <div className="text-center">
              <BookOpen className="w-12 h-12 text-teal-600 mx-auto mb-2" />
              <p className="text-xs text-teal-700 font-medium line-clamp-3">{book.book.title}</p>
            </div>
          </div>
          <div className="absolute top-2 right-2">
            {isAvailable ? (
              <Badge className="bg-green-600">Available</Badge>
            ) : (
              <Badge variant="destructive">Out</Badge>
            )}
          </div>
        </div>
        <div className="mt-3">
          <h3 className="font-semibold text-sm text-zinc-900 truncate">{book.book.title}</h3>
          <p className="text-xs text-neutral-500">{book.author?.name || 'Unknown'}</p>
          <div className="mt-1.5">
            {book.category && (
              <Badge variant="outline" className="text-xs">
                {book.category.name}
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-600 mt-1">
            {book.book.availableCopies}/{book.book.totalCopies} copies
          </p>
        </div>
      </div>
    </Link>
  )
}

export default function DiscoverPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

  useEffect(() => {
    fetchCategories()
    fetchBooks()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchBooks = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (selectedCategory) params.append('category', selectedCategory.toString())
      params.append('limit', '50')

      const res = await fetch(`/api/books?${params}`)
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
    fetchBooks()
  }

  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId)
  }

  useEffect(() => {
    fetchBooks()
  }, [selectedCategory])

  const recentBooks = books.slice(0, 6)
  const availableBooks = books.filter((b) => b.book.availableCopies > 0).slice(0, 6)

  return (
    <>
      {/* Hero Search Section */}
      <section className="mb-8 p-8 bg-gradient-to-r from-primary-teal to-teal-700 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-2">
          Discover your next great read
        </h1>
        <p className="text-teal-100 mb-6">Find your next favorite book, right here.</p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Search by title, ISBN, or author..."
              className="w-full bg-white rounded-lg p-4 pl-12 text-base"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          </div>
          <button
            type="submit"
            className="flex-shrink-0 w-full md:w-auto flex items-center justify-center bg-primary-gold text-white rounded-lg px-6 py-4 text-sm font-medium shadow-sm hover:bg-amber-600 transition-colors"
          >
            Search Books
          </button>
        </form>

        {/* Category Filter */}
        {selectedCategory && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-white text-sm">Filtered by:</span>
            <Badge
              className="bg-white text-teal-700 cursor-pointer"
              onClick={() => setSelectedCategory(null)}
            >
              {categories.find((c) => c.id === selectedCategory)?.name} ✕
            </Badge>
          </div>
        )}
      </section>

      {/* Main Content Sections */}
      <div className="space-y-8">
        {/* Available Now */}
        {!selectedCategory && availableBooks.length > 0 && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-zinc-900">Available Now</h2>
              <Link
                href="/member/books"
                className="flex items-center text-sm font-medium text-primary-teal hover:text-teal-800"
              >
                View all <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="flex space-x-6 overflow-x-auto pb-4 -mb-4">
              {availableBooks.map((book) => (
                <BookCard key={book.book.id} book={book} />
              ))}
            </div>
          </Card>
        )}

        {/* All Books / Search Results */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-zinc-900">
              {search ? 'Search Results' : selectedCategory ? 'Filtered Books' : 'All Books'}
            </h2>
            <span className="text-sm text-slate-600">{books.length} books</span>
          </div>
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading...</div>
          ) : books.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No books found{search ? ` for "${search}"` : ''}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {books.map((book) => (
                <BookCard key={book.book.id} book={book} />
              ))}
            </div>
          )}
        </Card>

        {/* Book Categories */}
        {!selectedCategory && categories.length > 0 && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-zinc-900">Browse by Category</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category, i) => {
                const colors = [
                  'bg-purple-100 text-purple-600',
                  'bg-blue-100 text-blue-600',
                  'bg-pink-100 text-pink-600',
                  'bg-green-100 text-green-600',
                  'bg-orange-100 text-orange-600',
                  'bg-indigo-100 text-indigo-600',
                ]
                const color = colors[i % colors.length]
                return (
                  <div
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`p-5 rounded-lg flex items-center space-x-4 border border-neutral-200 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer ${color}`}
                  >
                    <div className={`p-2 rounded-full ring-4 ring-white ${color}`}>
                      <ChevronRight className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900">{category.name}</h3>
                      <span className="text-sm text-neutral-600">Browse</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}
      </div>
    </>
  )
}
