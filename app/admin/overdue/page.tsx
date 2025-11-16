'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Mail, DollarSign } from 'lucide-react'
import { format, formatDistance } from 'date-fns'

interface OverdueItem {
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
  fine: {
    id: number
    amount: string
    status: string
    daysOverdue: number | null
  } | null
  daysOverdue: number
}

export default function OverdueBooksPage() {
  const [overdueItems, setOverdueItems] = useState<OverdueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalOverdue: 0,
    totalFines: 0,
    criticalOverdue: 0, // > 30 days
  })

  useEffect(() => {
    fetchOverdueBooks()
  }, [])

  const fetchOverdueBooks = async () => {
    try {
      const res = await fetch('/api/admin/overdue')
      const data = await res.json()
      setOverdueItems(data || [])

      // Calculate stats
      const totalOverdue = data.length
      const totalFines = data.reduce((sum: number, item: OverdueItem) => {
        return sum + (item.fine ? parseFloat(item.fine.amount) : 0)
      }, 0)
      const criticalOverdue = data.filter((item: OverdueItem) => item.daysOverdue > 30).length

      setStats({ totalOverdue, totalFines, criticalOverdue })
    } catch (error) {
      console.error('Failed to fetch overdue books:', error)
    } finally {
      setLoading(false)
    }
  }

  const getOverdueSeverity = (days: number) => {
    if (days > 30) return { color: 'bg-red-600', label: 'Critical' }
    if (days > 14) return { color: 'bg-orange-600', label: 'High' }
    if (days > 7) return { color: 'bg-yellow-600', label: 'Medium' }
    return { color: 'bg-blue-600', label: 'Low' }
  }

  const sendReminder = async (userId: string, bookTitle: string) => {
    // Placeholder for sending email reminder
    alert(`Send reminder to user about "${bookTitle}"`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Overdue Books</h1>
        <p className="text-slate-600 mt-1">Manage overdue book returns and send reminders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Overdue</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalOverdue}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Fines</p>
                <p className="text-2xl font-bold text-slate-900">
                  ${stats.totalFines.toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Critical (30+ days)</p>
                <p className="text-2xl font-bold text-red-600">{stats.criticalOverdue}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Table */}
      <Card>
        <CardHeader>
          <CardTitle>Overdue Books List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading overdue books...</div>
          ) : overdueItems.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>No overdue books!</p>
              <p className="text-sm mt-1">All books are returned on time</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Book</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Checkout Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Days Overdue</TableHead>
                    <TableHead>Fine</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overdueItems.map((item) => {
                    const severity = getOverdueSeverity(item.daysOverdue)
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
                        <TableCell className="text-sm">
                          {format(new Date(item.transaction.checkoutDate), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(item.transaction.dueDate), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${severity.color} text-white`}>
                            {item.daysOverdue} {item.daysOverdue === 1 ? 'day' : 'days'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.fine ? (
                            <div>
                              <p className="font-semibold text-red-600">
                                ${parseFloat(item.fine.amount).toFixed(2)}
                              </p>
                              <Badge
                                variant={
                                  item.fine.status === 'paid'
                                    ? 'default'
                                    : item.fine.status === 'waived'
                                    ? 'secondary'
                                    : 'destructive'
                                }
                                className="text-xs"
                              >
                                {item.fine.status}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-slate-400">No fine</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              sendReminder(item.user?.id || '', item.book?.title || '')
                            }
                          >
                            <Mail className="w-4 h-4 mr-1" />
                            Remind
                          </Button>
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
