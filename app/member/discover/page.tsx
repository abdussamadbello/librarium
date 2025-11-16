'use client'

import { useState, useEffect } from 'react'
import { Search, ChevronDown, ChevronRight, BookOpen } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
      <div className="flex-shrink-0 w-56 group cursor-pointer">
        {/* Book Cover with Enhanced Depth */}
        <div className="relative rounded-xl overflow-hidden shadow-soft book-card-lift">
          {/* Gradient Background */}
          <div className="w-full h-80 bg-gradient-to-br from-primary/10 via-accent/20 to-primary/5 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Decorative Pattern */}
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary))_1px,transparent_1px)] bg-[length:20px_20px]"></div>
            
            {/* Content */}
            <div className="text-center relative z-10">
              <div className="p-4 rounded-2xl bg-primary/10 backdrop-blur-sm inline-block mb-3 group-hover:scale-110 transition-transform duration-500">
                <BookOpen className="w-14 h-14 text-primary" />
              </div>
              <p className="text-sm text-foreground/80 font-serif font-medium line-clamp-4 px-2">
                {book.book.title}
              </p>
            </div>

            {/* Shimmer Effect on Hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shimmer pointer-events-none"></div>
          </div>

          {/* Availability Badge */}
          <div className="absolute top-3 right-3 z-20">
            {isAvailable ? (
              <Badge className="bg-chart-5/90 backdrop-blur-sm shadow-lg border-0 font-mono text-xs">
                Available
              </Badge>
            ) : (
              <Badge variant="destructive" className="backdrop-blur-sm shadow-lg font-mono text-xs">
                Out
              </Badge>
            )}
          </div>

          {/* Bottom Gradient Overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
        </div>

        {/* Book Info */}
        <div className="mt-4 px-1">
          <h3 className="font-serif text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
            {book.book.title}
          </h3>
          <p className="text-sm text-muted-foreground font-sans mb-2">
            {book.author?.name || 'Unknown Author'}
          </p>
          
          <div className="flex items-center gap-2 flex-wrap">
            {book.category && (
              <Badge variant="outline" className="text-xs border-primary/20 text-primary font-mono">
                {book.category.name}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground font-mono">
              {book.book.availableCopies}/{book.book.totalCopies} copies
            </span>
          </div>
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
  const [yearFrom, setYearFrom] = useState('')
  const [yearTo, setYearTo] = useState('')
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'unavailable'>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Computed value to check if any filters are active
  const hasActiveFilters = selectedCategory !== null || yearFrom !== '' || yearTo !== '' || availabilityFilter !== 'all'

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
      if (yearFrom) params.append('yearFrom', yearFrom)
      if (yearTo) params.append('yearTo', yearTo)
      if (availabilityFilter === 'available') params.append('availableOnly', 'true')
      if (availabilityFilter === 'unavailable') params.append('unavailableOnly', 'true')
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
  }, [selectedCategory, availabilityFilter])

  const clearFilters = () => {
    setSelectedCategory(null)
    setYearFrom('')
    setYearTo('')
    setAvailabilityFilter('all')
  }

  const recentBooks = books.slice(0, 6)
  const availableBooks = books.filter((b) => b.book.availableCopies > 0).slice(0, 6)

  return (
    <>
      {/* Hero Search Section - Immersive Editorial Design */}
      <section className="mb-12 p-12 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl shadow-dramatic relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]"></div>
        
        <div className="relative z-10">
          <h1 className="text-display-md font-display text-white mb-3 text-balance">
            Discover your next <span className="italic font-serif">great read</span>
          </h1>
          <p className="text-xl text-white/90 mb-8 font-serif">
            Explore our curated collection of timeless literature and contemporary masterpieces
          </p>

          {/* Search Bar - Elevated Design */}
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-primary/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Input
                  type="text"
                  placeholder="Search by title, ISBN, or author..."
                  className="w-full bg-white/95 backdrop-blur-sm rounded-xl p-6 pl-14 text-base border-0 shadow-lg hover:shadow-xl transition-all duration-300 font-sans relative z-10 focus:bg-white"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary z-20" />
              </div>
              <Button 
                type="submit" 
                className="bg-accent hover:bg-accent/90 text-foreground px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border-0 font-sans"
              >
                Search Library
              </Button>
              <Button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="bg-white/95 hover:bg-white px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border-0 font-sans"
              >
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg animate-fade-in-up">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block font-sans">
                      Publication Year (From)
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g. 1990"
                      value={yearFrom}
                      onChange={(e) => setYearFrom(e.target.value)}
                      className="font-sans"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block font-sans">
                      Publication Year (To)
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g. 2024"
                      value={yearTo}
                      onChange={(e) => setYearTo(e.target.value)}
                      className="font-sans"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block font-sans">
                      Availability
                    </label>
                    <select
                      value={availabilityFilter}
                      onChange={(e) => setAvailabilityFilter(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background font-sans"
                    >
                      <option value="all">All Books</option>
                      <option value="available">Available Only</option>
                      <option value="unavailable">Checked Out</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-6 flex items-center gap-3 flex-wrap animate-fade-in-up">
              <span className="text-white/90 text-sm font-mono">Active filters:</span>
              {selectedCategory && (
                <Badge
                  className="bg-white/20 backdrop-blur-sm text-white border-white/30 cursor-pointer hover:bg-white/30 transition-colors px-4 py-1.5 font-sans"
                  onClick={() => setSelectedCategory(null)}
                >
                  {categories.find((c) => c.id === selectedCategory)?.name} ✕
                </Badge>
              )}
              {yearFrom && (
                <Badge
                  className="bg-white/20 backdrop-blur-sm text-white border-white/30 cursor-pointer hover:bg-white/30 transition-colors px-4 py-1.5 font-sans"
                  onClick={() => setYearFrom('')}
                >
                  From {yearFrom} ✕
                </Badge>
              )}
              {yearTo && (
                <Badge
                  className="bg-white/20 backdrop-blur-sm text-white border-white/30 cursor-pointer hover:bg-white/30 transition-colors px-4 py-1.5 font-sans"
                  onClick={() => setYearTo('')}
                >
                  To {yearTo} ✕
                </Badge>
              )}
              {availabilityFilter !== 'all' && (
                <Badge
                  className="bg-white/20 backdrop-blur-sm text-white border-white/30 cursor-pointer hover:bg-white/30 transition-colors px-4 py-1.5 font-sans"
                  onClick={() => setAvailabilityFilter('all')}
                >
                  {availabilityFilter === 'available' ? 'Available Only' : 'Checked Out'} ✕
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-white/90 hover:text-white hover:bg-white/10 font-sans"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Main Content Sections */}
      <div className="space-y-12">
        {/* Available Now */}
        {!selectedCategory && availableBooks.length > 0 && (
          <Card className="shadow-soft border-0 overflow-hidden relative fade-in-up">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-chart-5/5 to-transparent pointer-events-none" />
            <div className="p-8 relative z-10">
              <div className="flex justify-between items-center mb-6 ornamental-border pb-4">
                <div>
                  <h2 className="text-3xl font-serif font-bold text-foreground">Available Now</h2>
                  <p className="text-muted-foreground mt-1 font-mono text-sm">
                    Ready for immediate checkout
                  </p>
                </div>
                <ChevronRight className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex space-x-6 overflow-x-auto pb-6 scrollbar-hide">
                {availableBooks.map((book, index) => (
                  <div key={book.book.id} className="fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <BookCard book={book} />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* All Books / Search Results */}
        <Card className="shadow-soft border-0 overflow-hidden relative fade-in-up stagger-2">
          <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
          <div className="p-8 relative z-10">
            <div className="flex justify-between items-center mb-6 ornamental-border pb-4">
              <div>
                <h2 className="text-3xl font-serif font-bold text-foreground">
                  {search ? 'Search Results' : selectedCategory ? 'Filtered Books' : 'Complete Collection'}
                </h2>
                <p className="text-muted-foreground mt-1 font-mono text-sm">
                  {books.length} {books.length === 1 ? 'title' : 'titles'} found
                </p>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mb-4"></div>
                <p className="text-muted-foreground font-mono text-sm">Curating your selection...</p>
              </div>
            ) : books.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-flex p-6 rounded-full bg-muted/50 mb-4">
                  <BookOpen className="w-16 h-16 text-muted-foreground/40" />
                </div>
                <h3 className="text-xl font-serif font-semibold mb-2">No Books Found</h3>
                <p className="text-muted-foreground">
                  {search ? `No results for "${search}"` : 'Try adjusting your filters'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
                {books.map((book, index) => (
                  <div key={book.book.id} className="fade-in-up" style={{ animationDelay: `${(index % 10) * 0.05}s` }}>
                    <BookCard book={book} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Book Categories */}
        {!selectedCategory && categories.length > 0 && (
          <Card className="shadow-soft border-0 overflow-hidden relative fade-in-up stagger-3">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--accent))_0%,transparent_50%)] opacity-5 pointer-events-none" />
            <div className="p-8 relative z-10">
              <div className="flex justify-between items-center mb-6 ornamental-border pb-4">
                <div>
                  <h2 className="text-3xl font-serif font-bold text-foreground">Browse by Category</h2>
                  <p className="text-muted-foreground mt-1 font-mono text-sm">
                    Explore our curated collections
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {categories.map((category, i) => {
                  const gradients = [
                    'from-purple-500/10 to-purple-600/5 hover:from-purple-500/20 hover:to-purple-600/10 border-purple-200/50',
                    'from-blue-500/10 to-blue-600/5 hover:from-blue-500/20 hover:to-blue-600/10 border-blue-200/50',
                    'from-pink-500/10 to-pink-600/5 hover:from-pink-500/20 hover:to-pink-600/10 border-pink-200/50',
                    'from-green-500/10 to-green-600/5 hover:from-green-500/20 hover:to-green-600/10 border-green-200/50',
                    'from-amber-500/10 to-amber-600/5 hover:from-amber-500/20 hover:to-amber-600/10 border-amber-200/50',
                    'from-indigo-500/10 to-indigo-600/5 hover:from-indigo-500/20 hover:to-indigo-600/10 border-indigo-200/50',
                  ]
                  const iconColors = [
                    'text-purple-600',
                    'text-blue-600',
                    'text-pink-600',
                    'text-green-600',
                    'text-amber-600',
                    'text-indigo-600',
                  ]
                  const gradient = gradients[i % gradients.length]
                  const iconColor = iconColors[i % iconColors.length]
                  
                  return (
                    <div
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className={`group p-6 rounded-xl bg-gradient-to-br ${gradient} border transition-all duration-500 hover:shadow-md hover:-translate-y-1 cursor-pointer relative overflow-hidden`}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="flex items-center space-x-4 relative z-10">
                        <div className={`p-3 rounded-xl bg-white shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                          <ChevronRight className={`w-6 h-6 ${iconColor}`} />
                        </div>
                        <div>
                          <h3 className="font-serif text-lg font-semibold text-foreground mb-0.5">
                            {category.name}
                          </h3>
                          <span className="text-xs text-muted-foreground font-mono uppercase tracking-wide">
                            Browse Collection →
                          </span>
                          <span className="text-xs text-muted-foreground font-mono uppercase tracking-wide">
                            Browse Collection →
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>
        )}
      </div>
    </>
  )
}
