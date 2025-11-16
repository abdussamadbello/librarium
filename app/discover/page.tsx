'use client'

import { useState, useEffect } from 'react'
import { Search, ChevronRight, BookOpen } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/shared/theme-toggle'
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
    <Link href={`/books/${book.book.id}`}>
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

export default function Home() {
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

  const availableBooks = books.filter((b) => b.book.availableCopies > 0).slice(0, 6)

  return (
    <div className="min-h-screen bg-background">
      {/* Guest Header */}
      <header className="bg-card/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-serif font-bold text-foreground">Librarium</span>
                <Badge variant="outline" className="text-xs border-primary/20 text-primary font-mono hidden sm:inline-flex">
                  Public Collection
                </Badge>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-sm font-sans font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105"
              >
                Join Library
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Search Section - Immersive Editorial Design */}
        <section className="mb-12 p-12 bg-gradient-to-br from-[hsl(185,100%,20%)] via-[hsl(185,100%,24%)] to-[hsl(185,90%,28%)] rounded-2xl shadow-dramatic relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[hsl(35,60%,60%)]/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.15)_0%,transparent_50%)]"></div>
          
          <div className="relative z-10">
            <h1 className="text-display-md font-display text-white mb-3 text-balance">
              Discover your next <span className="italic font-serif">great read</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 font-serif">
              Explore our curated collection of timeless literature and contemporary masterpieces
            </p>

            {/* Search Bar - Elevated Design */}
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
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
            </form>

            {/* Category Filter */}
            {selectedCategory && (
              <div className="mt-6 flex items-center gap-3 animate-fade-in-up">
                <span className="text-white/90 text-sm font-mono">Filtered by:</span>
                <Badge
                  className="bg-white/20 backdrop-blur-sm text-white border-white/30 cursor-pointer hover:bg-white/30 transition-colors px-4 py-1.5 font-sans"
                  onClick={() => setSelectedCategory(null)}
                >
                  {categories.find((c) => c.id === selectedCategory)?.name} ✕
                </Badge>
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const container = document.getElementById('available-books-scroll')
                        if (container) container.scrollBy({ left: -300, behavior: 'smooth' })
                      }}
                      className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                      aria-label="Scroll left"
                    >
                      <ChevronRight className="w-5 h-5 text-primary rotate-180" />
                    </button>
                    <button
                      onClick={() => {
                        const container = document.getElementById('available-books-scroll')
                        if (container) container.scrollBy({ left: 300, behavior: 'smooth' })
                      }}
                      className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                      aria-label="Scroll right"
                    >
                      <ChevronRight className="w-5 h-5 text-primary" />
                    </button>
                  </div>
                </div>
                <div id="available-books-scroll" className="flex gap-6 overflow-x-auto pb-6 -mx-8 px-8 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {availableBooks.map((book, index) => (
                    <div key={book.book.id} className="fade-in-up flex-shrink-0" style={{ animationDelay: `${index * 0.1}s` }}>
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
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-accent/5 to-transparent pointer-events-none" />
              <div className="p-8 relative z-10">
                <div className="flex justify-between items-center mb-6 ornamental-border pb-4">
                  <div>
                    <h2 className="text-3xl font-serif font-bold text-foreground">Explore by Genre</h2>
                    <p className="text-muted-foreground mt-1 font-mono text-sm">
                      Navigate our curated collections
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((category, i) => (
                    <div
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className="group p-6 rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/50 cursor-pointer transition-all duration-500 hover:shadow-lift hover:-translate-y-1 fade-in-up"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1 duration-300" />
                      </div>
                      <h3 className="font-serif text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground font-sans line-clamp-2">
                        {category.description || 'Discover titles in this collection'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Call to Action */}
          <Card className="shadow-soft border-0 overflow-hidden relative fade-in-up stagger-4">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/10 to-primary/5" />
            <div className="relative z-10 p-12 text-center">
              <div className="max-w-2xl mx-auto">
                <div className="inline-flex p-4 rounded-full bg-primary/10 mb-6">
                  <BookOpen className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-4xl font-serif font-bold text-foreground mb-4">
                  Begin Your Literary Journey
                </h2>
                <p className="text-lg text-muted-foreground mb-8 font-sans max-w-xl mx-auto">
                  Join our community of readers. Borrow books, track your reading journey, and discover your next favorite story.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link
                    href="/register"
                    className="px-8 py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 font-sans"
                  >
                    Create Account
                  </Link>
                  <Link
                    href="/login"
                    className="px-8 py-4 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary/5 transition-all font-sans"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card/50 backdrop-blur-sm border-t border-border/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground font-mono">
                &copy; 2025 Librarium. Curated with care.
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors font-sans">
                Home
              </Link>
              <Link href="/discover" className="text-sm text-muted-foreground hover:text-primary transition-colors font-sans">
                Discover
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
