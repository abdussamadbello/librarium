'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Search, BookOpen } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'

interface IssuedItem {
  transaction: {
    id: number
    userId: string
    checkoutDate: Date
    dueDate: Date
  }
  user: {
    id: string
    name: string
    email: string
  } | null
  book: {
    id: number
    title: string
    isbn: string | null
  } | null
  author: {
    name: string
  } | null
  bookCopy: {
    id: number
    copyNumber: number
  } | null
  issuedByUser: {
    id: string
    name: string
  } | null
}

export default function IssuedBooksPage() {
  const [issuedItems, setIssuedItems] = useState<IssuedItem[]>([])
  const [filteredItems, setFilteredItems] = useState<IssuedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchIssuedBooks()
  }, [])

  useEffect(() => {
    if (search) {
      const filtered = issuedItems.filter(
        (item) =>
          item.user?.name.toLowerCase().includes(search.toLowerCase()) ||
          item.book?.title.toLowerCase().includes(search.toLowerCase()) ||
          item.author?.name.toLowerCase().includes(search.toLowerCase())
      )
      setFilteredItems(filtered)
    } else {
      setFilteredItems(issuedItems)
    }
  }, [search, issuedItems])

  const fetchIssuedBooks = async () => {
    try {
      const res = await fetch('/api/admin/issued')
      const data = await res.json()
      setIssuedItems(data || [])
      setFilteredItems(data || [])
    } catch (error) {
      console.error('Failed to fetch issued books:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysUntilDue = (dueDate: Date) => {
    return differenceInDays(new Date(dueDate), new Date())
  }

  const getDueBadge = (daysUntilDue: number) => {
    if (daysUntilDue < 0) {
      return <Badge variant="destructive">Overdue</Badge>
    } else if (daysUntilDue <= 3) {
      return <Badge className="bg-yellow-600">Due Soon</Badge>
    } else {
      return <Badge variant="secondary">Active</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Issued Books</h1>
        <p className="text-slate-600 mt-1">View all currently issued books</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Issued</p>
                <p className="text-2xl font-bold text-slate-900">{issuedItems.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-teal-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Due Soon (3 days)</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {
                    issuedItems.filter(
                      (item) =>
                        getDaysUntilDue(item.transaction.dueDate) <= 3 &&
                        getDaysUntilDue(item.transaction.dueDate) >= 0
                    ).length
                  }
                </p>
              </div>
              <ArrowRight className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">
                  {
                    issuedItems.filter((item) => getDaysUntilDue(item.transaction.dueDate) < 0)
                      .length
                  }
                </p>
              </div>
              <ArrowRight className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Issued Books Table */}
      <Card>
        <CardHeader>
          <CardTitle>Currently Issued Books</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by member, book, or author..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading issued books...</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <BookOpen className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>No issued books found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Book</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Copy #</TableHead>
                    <TableHead>Checkout Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Days Until Due</TableHead>
                    <TableHead>Issued By</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => {
                    const daysUntilDue = getDaysUntilDue(item.transaction.dueDate)
                    return (
                      <TableRow key={item.transaction.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.user?.name}</p>
                            <p className="text-sm text-slate-500">{item.user?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.book?.title}</p>
                            {item.book?.isbn && (
                              <p className="text-sm text-slate-500">ISBN: {item.book.isbn}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{item.author?.name || 'Unknown'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">#{item.bookCopy?.copyNumber}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(item.transaction.checkoutDate), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(item.transaction.dueDate), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              daysUntilDue < 0
                                ? 'text-red-600 font-semibold'
                                : daysUntilDue <= 3
                                ? 'text-yellow-600 font-semibold'
                                : 'text-slate-600'
                            }
                          >
                            {daysUntilDue < 0
                              ? `${Math.abs(daysUntilDue)} days overdue`
                              : `${daysUntilDue} days`}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {item.issuedByUser?.name || 'System'}
                        </TableCell>
                        <TableCell>{getDueBadge(daysUntilDue)}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
