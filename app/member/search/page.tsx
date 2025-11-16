'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, X, Star, TrendingUp, Calendar, BookOpen, Filter } from 'lucide-react'
import Link from 'next/link'
import { StarRating } from '@/components/ui/star-rating'
import { cn } from '@/lib/utils'

interface Book {
  book: {
    id: number
    title: string
    isbn: string | null
    publisher: string
    publicationYear: number | null
    language: string | null
    description: string | null
    coverImageUrl: string | null
    totalCopies: number
    availableCopies: number
    tags: string[] | null
    createdAt: Date | string
  }
  author: {
    id: number
    name: string
  } | null
  category: {
    id: number
    name: string
  } | null
  avgRating: number
  reviewCount: number
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
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(true)
  const [total, setTotal] = useState(0)

  // Search filters
  const [filters, setFilters] = useState({
    q: '',
    category: '',
    author: '',
    language: 'all',
    tags: '',
    minRating: '',
    yearFrom: '',
    yearTo: '',
    availability: 'all',
    sortBy: 'relevance',
    sortOrder: 'desc',
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
        if (value && value !== 'all') params.append(key, value.toString())
      })

      const res = await fetch(`/api/search?${params}`)
      const data = await res.json()
      setResults(data.results || [])
      setTotal(data.total || 0)

      // Update available filter options
      if (data.filters) {
        setAvailableLanguages(data.filters.languages || [])
        setAvailableTags(data.filters.tags || [])
      }
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
      language: 'all',
      tags: '',
      minRating: '',
      yearFrom: '',
      yearTo: '',
      availability: 'all',
      sortBy: 'relevance',
      sortOrder: 'desc',
    })
    setResults([])
    setTotal(0)
  }

  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) => value && value !== 'all' && value !== 'relevance' && value !== 'desc' && value !== ''
  ).length

  const getActiveFilters = () => {
    const active: Array<{ key: string; label: string; value: string }> = []

    if (filters.q) active.push({ key: 'q', label: 'Search', value: filters.q })
    if (filters.category) {
      const cat = categories.find(c => c.id.toString() === filters.category)
      if (cat) active.push({ key: 'category', label: 'Category', value: cat.name })
    }
    if (filters.author) {
      const auth = authors.find(a => a.id.toString() === filters.author)
      if (auth) active.push({ key: 'author', label: 'Author', value: auth.name })
    }
    if (filters.language && filters.language !== 'all') {
      active.push({ key: 'language', label: 'Language', value: filters.language })
    }
    if (filters.tags) {
      active.push({ key: 'tags', label: 'Tags', value: filters.tags })
    }
    if (filters.minRating) {
      active.push({ key: 'minRating', label: 'Min Rating', value: `${filters.minRating}+ stars` })
    }
    if (filters.yearFrom) {
      active.push({ key: 'yearFrom', label: 'From', value: filters.yearFrom })
    }
    if (filters.yearTo) {
      active.push({ key: 'yearTo', label: 'To', value: filters.yearTo })
    }
    if (filters.availability === 'available') {
      active.push({ key: 'availability', label: 'Availability', value: 'Available Only' })
    }

    return active
  }

  const removeFilter = (key: string) => {
    setFilters({ ...filters, [key]: key === 'language' || key === 'availability' ? 'all' : '' })
  }

  const highlightText = (text: string | null, query: string) => {
    if (!text || !query) return text || ''

    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-amber-200 text-slate-900 font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  const activeFilters = getActiveFilters()

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-4xl font-bold text-slate-900 mb-2">
          Advanced Search
        </h1>
        <p className="text-slate-600">
          Search our entire collection with powerful filters and sorting options
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-soft p-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by title, author, ISBN, or description..."
              className="pl-12 h-12 text-base font-serif border-slate-300 focus:border-primary focus:ring-primary"
              value={filters.q}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="h-12 px-4 border-slate-300"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge className="ml-2 bg-primary">{activeFiltersCount}</Badge>
            )}
          </Button>
          <Button
            onClick={handleSearch}
            className="h-12 px-6 bg-gradient-to-r from-primary to-primary/80 hover:shadow-lift transition-all"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-slate-600">Active filters:</span>
          {activeFilters.map((filter) => (
            <Badge
              key={filter.key}
              variant="secondary"
              className="bg-primary/10 text-primary border border-primary/20 pl-3 pr-1 py-1.5 gap-2"
            >
              <span className="text-xs">
                <strong>{filter.label}:</strong> {filter.value}
              </span>
              <button
                onClick={() => removeFilter(filter.key)}
                className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-soft p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-xl font-semibold text-slate-900">Filters & Sorting</h3>
            <Button variant="ghost" size="sm" onClick={resetFilters} className="text-slate-600">
              <X className="w-4 h-4 mr-1" />
              Reset All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Category
              </label>
              <select
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
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
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Author
              </label>
              <select
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
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

            {/* Language */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Language
              </label>
              <select
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={filters.language}
                onChange={(e) => setFilters({ ...filters, language: e.target.value })}
              >
                <option value="all">All Languages</option>
                {availableLanguages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Availability
              </label>
              <select
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={filters.availability}
                onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
              >
                <option value="all">All Books</option>
                <option value="available">Available Only</option>
              </select>
            </div>

            {/* Min Rating */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Minimum Rating
              </label>
              <select
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={filters.minRating}
                onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
                <option value="1">1+ Stars</option>
              </select>
            </div>

            {/* Year From */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Publication Year From
              </label>
              <Input
                type="number"
                placeholder="e.g., 2000"
                className="border-slate-300"
                value={filters.yearFrom}
                onChange={(e) => setFilters({ ...filters, yearFrom: e.target.value })}
              />
            </div>

            {/* Year To */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Publication Year To
              </label>
              <Input
                type="number"
                placeholder="e.g., 2024"
                className="border-slate-300"
                value={filters.yearTo}
                onChange={(e) => setFilters({ ...filters, yearTo: e.target.value })}
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Sort By
              </label>
              <select
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              >
                <option value="relevance">Relevance</option>
                <option value="title">Title</option>
                <option value="author">Author</option>
                <option value="rating">Rating</option>
                <option value="year">Publication Year</option>
                <option value="newest">Newest Additions</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-soft">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-semibold text-slate-900">
              Search Results
            </h2>
            {total > 0 && (
              <p className="text-slate-600">
                <span className="font-semibold text-primary">{total}</span> {total === 1 ? 'book' : 'books'} found
              </p>
            )}
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-slate-600 font-serif">Searching our collection...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="font-serif text-xl font-semibold text-slate-900 mb-2">
                {filters.q || activeFiltersCount > 0
                  ? 'No books found'
                  : 'Start your search'}
              </h3>
              <p className="text-slate-600">
                {filters.q || activeFiltersCount > 0
                  ? 'Try adjusting your filters or search terms'
                  : 'Enter search terms or apply filters to discover books'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((item) => (
                <Link
                  key={item.book.id}
                  href={`/member/books/${item.book.id}`}
                  className="block"
                >
                  <div className="border border-slate-200 rounded-lg p-5 hover:shadow-lift hover:border-primary/30 transition-all">
                    <div className="flex gap-5">
                      {/* Book Cover */}
                      {item.book.coverImageUrl && (
                        <div className="flex-shrink-0">
                          <img
                            src={item.book.coverImageUrl}
                            alt={item.book.title}
                            className="w-24 h-32 object-cover rounded-md shadow-soft"
                          />
                        </div>
                      )}

                      {/* Book Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-xl font-semibold text-slate-900 mb-1">
                          {highlightText(item.book.title, filters.q)}
                        </h3>

                        <p className="text-sm text-slate-600 mb-2">
                          by{' '}
                          <span className="font-medium">
                            {highlightText(item.author?.name || 'Unknown', filters.q)}
                          </span>
                        </p>

                        {/* Rating */}
                        {item.avgRating > 0 && (
                          <div className="flex items-center gap-2 mb-2">
                            <StarRating rating={item.avgRating} size="sm" />
                            <span className="text-xs text-slate-600">
                              ({item.reviewCount} {item.reviewCount === 1 ? 'review' : 'reviews'})
                            </span>
                          </div>
                        )}

                        {/* Description */}
                        {item.book.description && (
                          <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                            {highlightText(item.book.description, filters.q)}
                          </p>
                        )}

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-2">
                          {item.category && (
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                              {item.category.name}
                            </Badge>
                          )}
                          {item.book.language && (
                            <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                              {item.book.language}
                            </Badge>
                          )}
                          {item.book.publicationYear && (
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {item.book.publicationYear}
                            </span>
                          )}
                          <span className="text-xs text-slate-500">
                            {item.book.availableCopies}/{item.book.totalCopies} available
                          </span>
                          {item.book.tags && item.book.tags.length > 0 && (
                            <>
                              {item.book.tags.slice(0, 3).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="bg-amber-50 text-amber-700 border-amber-200 text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Availability Badge */}
                      <div className="flex-shrink-0">
                        {item.book.availableCopies > 0 ? (
                          <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-soft">
                            Available
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="bg-gradient-to-r from-red-500 to-red-600">
                            Out
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
