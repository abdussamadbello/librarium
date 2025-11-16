'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Search, CheckCircle } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'

interface ReturnedItem {
  transaction: {
    id: number
    userId: string
    checkoutDate: Date
    dueDate: Date
    returnDate: Date
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
  returnedToUser: {
    id: string
    name: string
  } | null
}

export default function ReturnedBooksPage() {
  const [returnedItems, setReturnedItems] = useState<ReturnedItem[]>([])
  const [filteredItems, setFilteredItems] = useState<ReturnedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchReturnedBooks()
  }, [])

  useEffect(() => {
    if (search) {
      const filtered = returnedItems.filter(
        (item) =>
          item.user?.name.toLowerCase().includes(search.toLowerCase()) ||
          item.book?.title.toLowerCase().includes(search.toLowerCase()) ||
          item.author?.name.toLowerCase().includes(search.toLowerCase())
      )
      setFilteredItems(filtered)
    } else {
      setFilteredItems(returnedItems)
    }
  }, [search, returnedItems])

  const fetchReturnedBooks = async () => {
    try {
      const res = await fetch('/api/admin/returned')
      const data = await res.json()
      setReturnedItems(data || [])
      setFilteredItems(data || [])
    } catch (error) {
      console.error('Failed to fetch returned books:', error)
    } finally {
      setLoading(false)
    }
  }

  const wasReturnedLate = (dueDate: Date, returnDate: Date) => {
    return new Date(returnDate) > new Date(dueDate)
  }

  const getDaysLate = (dueDate: Date, returnDate: Date) => {
    return differenceInDays(new Date(returnDate), new Date(dueDate))
  }

  const lateReturns = returnedItems.filter((item) =>
    wasReturnedLate(item.transaction.dueDate, item.transaction.returnDate)
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Returned Books</h1>
        <p className="text-slate-600 mt-1">View book return history</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Returns</p>
                <p className="text-2xl font-bold text-slate-900">{returnedItems.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">On Time Returns</p>
                <p className="text-2xl font-bold text-green-600">
                  {returnedItems.length - lateReturns.length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Late Returns</p>
                <p className="text-2xl font-bold text-red-600">{lateReturns.length}</p>
              </div>
              <ArrowLeft className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Returned Books Table */}
      <Card>
        <CardHeader>
          <CardTitle>Return History</CardTitle>
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
            <div className="text-center py-8 text-slate-500">Loading returned books...</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <ArrowLeft className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>No returned books found</p>
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
                    <TableHead>Return Date</TableHead>
                    <TableHead>Returned To</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => {
                    const isLate = wasReturnedLate(
                      item.transaction.dueDate,
                      item.transaction.returnDate
                    )
                    const daysLate = isLate
                      ? getDaysLate(item.transaction.dueDate, item.transaction.returnDate)
                      : 0

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
                        <TableCell className="text-sm">
                          {format(new Date(item.transaction.returnDate), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {item.returnedToUser?.name || 'System'}
                        </TableCell>
                        <TableCell>
                          {isLate ? (
                            <Badge variant="destructive">
                              Late ({daysLate} {daysLate === 1 ? 'day' : 'days'})
                            </Badge>
                          ) : (
                            <Badge className="bg-green-600">On Time</Badge>
                          )}
                        </TableCell>
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
