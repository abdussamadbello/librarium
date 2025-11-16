'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Clock, AlertTriangle, DollarSign, Info } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

// Borrowing limits by membership type
const BORROWING_LIMITS = {
  standard: 5,
  premium: 15,
  student: 10,
}

interface BorrowedBook {
  transaction: {
    id: number
    checkoutDate: Date
    dueDate: Date
    notes: string | null
  }
  book: {
    id: number
    title: string
    isbn: string | null
    publicationYear: number | null
  }
  author: {
    id: number
    name: string
  } | null
  copy: {
    id: number
    copyNumber: number | null
  }
  isOverdue: boolean
  daysOverdue: number
}

interface FinesSummary {
  totalPending: number
  totalPaid: number
  pendingCount: number
  paidCount: number
  waivedCount: number
}

export default function MemberDashboard() {
  const { data: session } = useSession()
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([])
  const [finesSummary, setFinesSummary] = useState<FinesSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [renewingId, setRenewingId] = useState<number | null>(null)

  const membershipType = (session?.user?.membershipType || 'standard') as keyof typeof BORROWING_LIMITS
  const borrowingLimit = BORROWING_LIMITS[membershipType]
  const currentBorrowed = borrowedBooks.length
  const remainingSlots = borrowingLimit - currentBorrowed
  const utilizationPercent = (currentBorrowed / borrowingLimit) * 100

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [borrowedRes, finesRes] = await Promise.all([
        fetch('/api/member/borrowed'),
        fetch('/api/member/fines'),
      ])

      const borrowedData = await borrowedRes.json()
      const finesData = await finesRes.json()

      setBorrowedBooks(borrowedData.borrowedBooks || [])
      setFinesSummary(finesData.summary || null)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRenew = async (transactionId: number) => {
    try {
      setRenewingId(transactionId)
      const res = await fetch('/api/member/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Failed to renew book')
        return
      }

      alert(data.message)
      // Refresh the data
      await fetchData()
    } catch (error) {
      console.error('Renew failed:', error)
      alert('Failed to renew book. Please try again.')
    } finally {
      setRenewingId(null)
    }
  }

  const overdueBooks = borrowedBooks.filter((b) => b.isOverdue)

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="ornamental-border pb-6">
          <h1 className="text-display-sm font-display text-balance gradient-text fade-in-up">
            My Library
          </h1>
          <p className="text-lg text-muted-foreground mt-2 font-serif italic fade-in-up stagger-1">
            Welcome back to your personal reading sanctuary
          </p>
        </div>
      </div>

      {/* Borrowing Limit Warning Banners */}
      {utilizationPercent >= 80 && (
        <Card className={`shadow-soft border-0 overflow-hidden fade-in-up ${
          utilizationPercent >= 100 
            ? 'bg-destructive/5 border-l-4 border-l-destructive' 
            : 'bg-accent/5 border-l-4 border-l-accent'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${
                utilizationPercent >= 100 ? 'bg-destructive/10' : 'bg-accent/20'
              }`}>
                {utilizationPercent >= 100 ? (
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                ) : (
                  <Info className="w-6 h-6 text-accent" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-serif font-semibold text-lg text-foreground mb-1">
                  {utilizationPercent >= 100 
                    ? 'Borrowing Limit Reached' 
                    : 'Approaching Borrowing Limit'}
                </h3>
                <p className="text-sm text-muted-foreground font-sans mb-3">
                  {utilizationPercent >= 100 ? (
                    <>You've borrowed <strong className="text-foreground">{currentBorrowed} out of {borrowingLimit} books</strong>. Return a book to borrow more.</>
                  ) : (
                    <>You've used <strong className="text-foreground">{currentBorrowed} out of {borrowingLimit} slots</strong> ({Math.round(utilizationPercent)}%). You have <strong className="text-foreground">{remainingSlots} {remainingSlots === 1 ? 'slot' : 'slots'}</strong> remaining.</>
                  )}
                </p>
                <div className="w-full bg-muted/50 rounded-full h-2 mb-3">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      utilizationPercent >= 100 
                        ? 'bg-destructive' 
                        : utilizationPercent >= 80 
                        ? 'bg-accent' 
                        : 'bg-chart-5'
                    }`}
                    style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                  />
                </div>
                {membershipType !== 'premium' && (
                  <Link href="/member/membership">
                    <Button variant="outline" size="sm" className="font-sans">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Upgrade to Premium ({BORROWING_LIMITS.premium} books)
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards - Elevated Design */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-soft hover:shadow-lift transition-all duration-500 border-0 bg-gradient-to-br from-card to-muted/20 fade-in-up stagger-2 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide uppercase font-sans">
              Borrowed Books
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-serif editorial-number font-bold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">
              {borrowedBooks.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono">Active checkouts</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft hover:shadow-lift transition-all duration-500 border-0 bg-gradient-to-br from-card to-muted/20 fade-in-up stagger-3 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide uppercase font-sans">
              Overdue
            </CardTitle>
            <div className="p-2 rounded-lg bg-destructive/10">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-serif editorial-number font-bold text-destructive">
              {overdueBooks.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono">Needs attention</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft hover:shadow-lift transition-all duration-500 border-0 bg-gradient-to-br from-card to-muted/20 fade-in-up stagger-4 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide uppercase font-sans">
              Pending Fines
            </CardTitle>
            <div className="p-2 rounded-lg bg-accent/10">
              <DollarSign className="w-5 h-5 text-accent" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-serif editorial-number font-bold gradient-warm-text">
              ${finesSummary?.totalPending.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono">Outstanding balance</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft hover:shadow-lift transition-all duration-500 border-0 bg-gradient-to-br from-card to-muted/20 fade-in-up stagger-5 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-chart-4/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide uppercase font-sans">
              Reading Time
            </CardTitle>
            <div className="p-2 rounded-lg bg-chart-4/10">
              <Clock className="w-5 h-5 text-chart-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-serif editorial-number">
              {borrowedBooks.length > 0 ? '📚' : '—'}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono">Active sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Borrowed Books */}
      <Card className="shadow-lift border-0 fade-in-up stagger-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
        <CardHeader className="relative z-10 border-b border-border/50 bg-gradient-to-r from-transparent to-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-serif">Currently Borrowed</CardTitle>
              <p className="text-sm text-muted-foreground mt-1 font-mono">
                {borrowedBooks.length} {borrowedBooks.length === 1 ? 'book' : 'books'} in your collection
              </p>
            </div>
            <Link href="/member/discover">
              <Button variant="outline" size="sm" className="shadow-sm hover:shadow-md transition-shadow">
                Browse Books
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-6 relative z-10">
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
              <p className="text-muted-foreground mt-4 font-mono text-sm">Loading your library...</p>
            </div>
          ) : borrowedBooks.length === 0 ? (
            <div className="text-center py-16 relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary))_1px,transparent_1px)] bg-[length:24px_24px] opacity-5"></div>
              <BookOpen className="w-16 h-16 text-muted-foreground/40 mx-auto mb-6 animate-float" />
              <h3 className="text-xl font-serif font-semibold mb-2">Your Library Awaits</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Begin your literary journey by discovering books that inspire and captivate
              </p>
              <Link href="/member/discover">
                <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all">
                  Discover Books
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {borrowedBooks.map((item, index) => (
                <div
                  key={item.transaction.id}
                  className={`border rounded-xl p-5 transition-all duration-300 hover:shadow-md group relative overflow-hidden
                    ${item.isOverdue 
                      ? 'border-destructive/30 bg-gradient-to-r from-destructive/5 to-destructive/10' 
                      : 'border-border/50 bg-gradient-to-r from-card to-muted/10 hover:border-primary/30'
                    }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="flex items-start justify-between gap-4 pl-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-serif font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {item.book.title}
                      </h3>
                      <p className="text-sm text-muted-foreground font-sans">
                        by <span className="font-medium">{item.author?.name || 'Unknown'}</span>
                      </p>
                      <div className="flex items-center gap-6 mt-3 text-xs text-muted-foreground font-mono">
                        <span className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                          Borrowed: {format(new Date(item.transaction.checkoutDate), 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${item.isOverdue ? 'bg-destructive' : 'bg-accent'}`}></div>
                          Due: {format(new Date(item.transaction.dueDate), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {item.isOverdue ? (
                        <Badge variant="destructive" className="shadow-sm font-mono">
                          Overdue {item.daysOverdue}d
                        </Badge>
                      ) : (
                        <>
                          <Badge variant="outline" className="shadow-sm border-accent/30 text-accent font-mono">
                            Due {formatDistanceToNow(new Date(item.transaction.dueDate), { addSuffix: true })}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRenew(item.transaction.id)}
                            disabled={renewingId === item.transaction.id}
                            className="font-sans text-xs"
                          >
                            {renewingId === item.transaction.id ? 'Renewing...' : 'Renew Book'}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/member/history" className="group">
          <Card className="shadow-soft hover:shadow-lift transition-all duration-500 border-0 bg-gradient-to-br from-card via-muted/10 to-primary/5 overflow-hidden relative cursor-pointer h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500" />
            <CardContent className="pt-8 pb-8 relative z-10">
              <div className="text-center">
                <div className="inline-flex p-4 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-500 mb-4">
                  <Clock className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-500" />
                </div>
                <h3 className="font-serif text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  Borrowing History
                </h3>
                <p className="text-sm text-muted-foreground font-mono">
                  View past transactions
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/member/fines" className="group">
          <Card className="shadow-soft hover:shadow-lift transition-all duration-500 border-0 bg-gradient-to-br from-card via-muted/10 to-accent/5 overflow-hidden relative cursor-pointer h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/0 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-colors duration-500" />
            <CardContent className="pt-8 pb-8 relative z-10">
              <div className="text-center">
                <div className="inline-flex p-4 rounded-2xl bg-accent/10 group-hover:bg-accent/20 transition-colors duration-500 mb-4">
                  <DollarSign className="w-8 h-8 text-accent group-hover:scale-110 transition-transform duration-500" />
                </div>
                <h3 className="font-serif text-lg font-semibold mb-2 group-hover:text-accent transition-colors">
                  My Fines
                </h3>
                <p className="text-sm text-muted-foreground font-mono">
                  {finesSummary?.pendingCount || 0} pending
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/member/profile" className="group">
          <Card className="shadow-soft hover:shadow-lift transition-all duration-500 border-0 bg-gradient-to-br from-card via-muted/10 to-chart-4/5 overflow-hidden relative cursor-pointer h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-chart-4/0 to-chart-4/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 right-0 w-24 h-24 bg-chart-4/5 rounded-full blur-2xl group-hover:bg-chart-4/10 transition-colors duration-500" />
            <CardContent className="pt-8 pb-8 relative z-10">
              <div className="text-center">
                <div className="inline-flex p-4 rounded-2xl bg-chart-4/10 group-hover:bg-chart-4/20 transition-colors duration-500 mb-4">
                  <BookOpen className="w-8 h-8 text-chart-4 group-hover:scale-110 transition-transform duration-500" />
                </div>
                <h3 className="font-serif text-lg font-semibold mb-2 group-hover:text-chart-4 transition-colors">
                  My Profile
                </h3>
                <p className="text-sm text-muted-foreground font-mono">
                  Manage account settings
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
