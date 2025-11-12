'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DollarSign, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'

interface Fine {
  fine: {
    id: number
    amount: string
    reason: string | null
    status: string
    daysOverdue: number | null
    createdAt: Date
  }
  transaction: {
    id: number
    checkoutDate: Date
    returnDate: Date | null
  } | null
  book: {
    id: number
    title: string
  } | null
}

interface FinesSummary {
  totalPending: number
  totalPaid: number
  pendingCount: number
  paidCount: number
  waivedCount: number
}

export default function FinesPage() {
  const [fines, setFines] = useState<Fine[]>([])
  const [summary, setSummary] = useState<FinesSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFines()
  }, [])

  const fetchFines = async () => {
    try {
      const res = await fetch('/api/member/fines')
      const data = await res.json()
      setFines(data.fines || [])
      setSummary(data.summary || null)
    } catch (error) {
      console.error('Failed to fetch fines:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="destructive">Pending</Badge>
      case 'paid':
        return <Badge variant="default" className="bg-green-600">Paid</Badge>
      case 'waived':
        return <Badge variant="secondary">Waived</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Fines</h1>
        <p className="text-slate-600 mt-1">View and manage your library fines</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Pending Fines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-orange-600" />
                <span className="text-2xl font-bold text-orange-600">
                  ${summary.totalPending.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{summary.pendingCount} pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Paid Fines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold text-green-600">
                  ${summary.totalPaid.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{summary.paidCount} paid</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Waived</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-slate-400" />
                <span className="text-2xl font-bold text-slate-600">
                  {summary.waivedCount}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">fines waived</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pending Fines Alert */}
      {summary && summary.totalPending > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
          <div>
            <p className="text-sm text-orange-800">
              You have <span className="font-semibold">${summary.totalPending.toFixed(2)}</span> in pending fines.
              Please contact the library to arrange payment.
            </p>
          </div>
        </div>
      )}

      {/* Fines Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Fines ({fines.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading...</div>
          ) : fines.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No fines found. Great job!</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Days Overdue</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fines.map((item) => (
                    <TableRow key={item.fine.id}>
                      <TableCell className="font-medium">
                        {item.book?.title || 'N/A'}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {item.fine.reason || 'N/A'}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {item.fine.daysOverdue || 0}
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${parseFloat(item.fine.amount).toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(item.fine.status)}</TableCell>
                      <TableCell className="text-slate-500">
                        {format(new Date(item.fine.createdAt), 'MMM d, yyyy')}
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
