'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react'
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
}

interface Author {
  id: number
  name: string
}

export default function AdvancedSearchPage() {
  const [results, setResults] = useState<Book[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(true)
  const [total, setTotal] = useState(0)

  // Search filters
  const [filters, setFilters] = useState({
    q: '',
    category: '',
    author: '',
    yearFrom: '',
    yearTo: '',
    availability: 'all',
    sortBy: 'title',
    sortOrder: 'asc',
  })

  useEffect(() => {
    fetchCategories()
    fetchAuthors()
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

  const fetchAuthors = async () => {
    try {
      const res = await fetch('/api/admin/authors')
      const data = await res.json()
      setAuthors(data.authors || [])
    } catch (error) {
      console.error('Failed to fetch authors:', error)
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString())
      })

      const res = await fetch(`/api/search?${params}`)
      const data = await res.json()
      setResults(data.results || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Failed to search:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetFilters = () => {
    setFilters({
      q: '',
      category: '',
      author: '',
      yearFrom: '',
      yearTo: '',
      availability: 'all',
      sortBy: 'title',
      sortOrder: 'asc',
    })
    setResults([])
    setTotal(0)
  }

  const activeFiltersCount = Object.values(filters).filter(
    (v) => v && v !== 'all' && v !== 'title' && v !== 'asc'
  ).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Advanced Search</h1>
        <p className="text-slate-600 mt-1">Search books with advanced filters</p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by title, ISBN, or description..."
                className="pl-10"
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 bg-teal-600">{activeFiltersCount}</Badge>
              )}
            </Button>
            <Button onClick={handleSearch} className="bg-teal-600 hover:bg-teal-700">
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <X className="w-4 h-4 mr-1" />
                Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Category
                </label>
                <select
                  className="w-full border border-slate-300 rounded-md p-2 text-sm"
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Author */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Author
                </label>
                <select
                  className="w-full border border-slate-300 rounded-md p-2 text-sm"
                  value={filters.author}
                  onChange={(e) => setFilters({ ...filters, author: e.target.value })}
                >
                  <option value="">All Authors</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Availability
                </label>
                <select
                  className="w-full border border-slate-300 rounded-md p-2 text-sm"
                  value={filters.availability}
                  onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                >
                  <option value="all">All Books</option>
                  <option value="available">Available Only</option>
                </select>
              </div>

              {/* Year From */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Year From
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 2000"
                  value={filters.yearFrom}
                  onChange={(e) => setFilters({ ...filters, yearFrom: e.target.value })}
                />
              </div>

              {/* Year To */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Year To
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 2024"
                  value={filters.yearTo}
                  onChange={(e) => setFilters({ ...filters, yearTo: e.target.value })}
                />
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Sort By
                </label>
                <select
                  className="w-full border border-slate-300 rounded-md p-2 text-sm"
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                >
                  <option value="title">Title</option>
                  <option value="year">Publication Year</option>
                  <option value="author">Author</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Order
                </label>
                <select
                  className="w-full border border-slate-300 rounded-md p-2 text-sm"
                  value={filters.sortOrder}
                  onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value })}
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>
            Search Results {total > 0 && `(${total} found)`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-slate-500">Searching...</div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              {filters.q || activeFiltersCount > 0
                ? 'No books found matching your criteria'
                : 'Enter search terms or apply filters to search'}
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((item) => (
                <Link
                  key={item.book.id}
                  href={`/member/books/${item.book.id}`}
                  className="block"
                >
                  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-slate-900">
                          {item.book.title}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                          by {item.author?.name || 'Unknown'}
                        </p>
                        {item.book.description && (
                          <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                            {item.book.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-3">
                          {item.category && (
                            <Badge variant="outline">{item.category.name}</Badge>
                          )}
                          {item.book.publicationYear && (
                            <span className="text-xs text-slate-500">
                              {item.book.publicationYear}
                            </span>
                          )}
                          <span className="text-xs text-slate-500">
                            {item.book.availableCopies}/{item.book.totalCopies} available
                          </span>
                        </div>
                      </div>
                      <div>
                        {item.book.availableCopies > 0 ? (
                          <Badge className="bg-green-600">Available</Badge>
                        ) : (
                          <Badge variant="destructive">Out</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
