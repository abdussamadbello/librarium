'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'

interface HistoryItem {
  transaction: {
    id: number
    checkoutDate: Date
    dueDate: Date
    returnDate: Date
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
  wasLate: boolean
  daysLate: number
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/member/history')
      const data = await res.json()
      setHistory(data.history || [])
    } catch (error) {
      console.error('Failed to fetch history:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Borrowing History</h1>
        <p className="text-slate-600 mt-1">Your complete borrowing history</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Past Transactions ({history.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No borrowing history found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Borrowed</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Returned</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item) => (
                    <TableRow key={item.transaction.id}>
                      <TableCell className="font-medium">{item.book.title}</TableCell>
                      <TableCell className="text-slate-600">
                        {item.author?.name || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {format(new Date(item.transaction.checkoutDate), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {format(new Date(item.transaction.dueDate), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {format(new Date(item.transaction.returnDate), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        {item.wasLate ? (
                          <Badge variant="destructive">
                            Late by {item.daysLate} day{item.daysLate > 1 ? 's' : ''}
                          </Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-600">
                            On Time
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
