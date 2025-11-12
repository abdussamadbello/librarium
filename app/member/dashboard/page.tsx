'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Clock, AlertTriangle, DollarSign } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

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
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([])
  const [finesSummary, setFinesSummary] = useState<FinesSummary | null>(null)
  const [loading, setLoading] = useState(true)

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

  const overdueBooks = borrowedBooks.filter((b) => b.isOverdue)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Dashboard</h1>
        <p className="text-slate-600 mt-1">Welcome back! Here&apos;s your library overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Borrowed Books</CardTitle>
            <BookOpen className="w-4 h-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{borrowedBooks.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Overdue</CardTitle>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueBooks.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pending Fines</CardTitle>
            <DollarSign className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ${finesSummary?.totalPending.toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Reading Time</CardTitle>
            <Clock className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{borrowedBooks.length > 0 ? '📚' : '—'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Borrowed Books */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Currently Borrowed</CardTitle>
            <Link href="/member/discover">
              <Button variant="outline" size="sm">Browse Books</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading...</div>
          ) : borrowedBooks.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">You haven&apos;t borrowed any books yet</p>
              <Link href="/member/discover">
                <Button className="bg-teal-600 hover:bg-teal-700">Discover Books</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {borrowedBooks.map((item) => (
                <div
                  key={item.transaction.id}
                  className={`border rounded-lg p-4 ${
                    item.isOverdue ? 'border-red-200 bg-red-50' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{item.book.title}</h3>
                      <p className="text-sm text-slate-600">by {item.author?.name || 'Unknown'}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                        <span>Borrowed: {format(new Date(item.transaction.checkoutDate), 'MMM d, yyyy')}</span>
                        <span>Due: {format(new Date(item.transaction.dueDate), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    <div>
                      {item.isOverdue ? (
                        <Badge variant="destructive">
                          Overdue by {item.daysOverdue} day{item.daysOverdue > 1 ? 's' : ''}
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          Due {formatDistanceToNow(new Date(item.transaction.dueDate), { addSuffix: true })}
                        </Badge>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/member/history">
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                <h3 className="font-semibold">Borrowing History</h3>
                <p className="text-sm text-slate-600 mt-1">View past transactions</p>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/member/fines">
            <CardContent className="pt-6">
              <div className="text-center">
                <DollarSign className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <h3 className="font-semibold">My Fines</h3>
                <p className="text-sm text-slate-600 mt-1">
                  {finesSummary?.pendingCount || 0} pending
                </p>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/member/profile">
            <CardContent className="pt-6">
              <div className="text-center">
                <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold">My Profile</h3>
                <p className="text-sm text-slate-600 mt-1">Manage account settings</p>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  )
}
