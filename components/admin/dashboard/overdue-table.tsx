'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface OverdueTransaction {
  transaction: {
    id: number
    userId: string
    dueDate: Date
    issuedAt: Date
  }
  user: {
    id: string
    name: string | null
    email: string
  } | null
  book: {
    id: number
    title: string
  } | null
}

export function OverdueTable() {
  const [overdueBooks, setOverdueBooks] = useState<OverdueTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/overdue')
      .then((res) => res.json())
      .then((data) => {
        setOverdueBooks(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to fetch overdue books:', err)
        setLoading(false)
      })
  }, [])

  const getDaysOverdue = (dueDate: Date) => {
    const now = new Date()
    const due = new Date(dueDate)
    const diffTime = now.getTime() - due.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Overdue Books</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overdue Books ({overdueBooks.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {overdueBooks.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No overdue books</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Days Overdue</TableHead>
                  <TableHead className="text-right">Fine</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdueBooks.map((item) => {
                  const daysOverdue = getDaysOverdue(item.transaction.dueDate)
                  const fine = (daysOverdue * 0.5).toFixed(2)

                  return (
                    <TableRow key={item.transaction.id}>
                      <TableCell className="font-medium">
                        {item.book?.title || 'Unknown Book'}
                      </TableCell>
                      <TableCell>{item.user?.name || item.user?.email || 'Unknown'}</TableCell>
                      <TableCell>
                        {new Date(item.transaction.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">{daysOverdue} days</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-red-600">
                        ${fine}
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
  )
}
