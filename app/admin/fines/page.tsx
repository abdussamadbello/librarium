'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DollarSign, FileText, CheckCircle, XCircle } from 'lucide-react'
import { format } from 'date-fns'

interface FineItem {
  fine: {
    id: number
    userId: string
    amount: string
    reason: string | null
    daysOverdue: number | null
    status: string
    createdAt: Date
  }
  user: {
    id: string
    name: string
    email: string
  } | null
  transaction: {
    id: number
    checkoutDate: Date
    dueDate: Date
    returnDate: Date | null
  } | null
  payments: any[]
}

interface FineStats {
  pending: { count: number; amount: number }
  paid: { count: number; amount: number }
  waived: { count: number; amount: number }
}

export default function FinesPage() {
  const [fines, setFines] = useState<FineItem[]>([])
  const [filteredFines, setFilteredFines] = useState<FineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [stats, setStats] = useState<FineStats>({
    pending: { count: 0, amount: 0 },
    paid: { count: 0, amount: 0 },
    waived: { count: 0, amount: 0 },
  })

  useEffect(() => {
    fetchFines()
    fetchStats()
  }, [])

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredFines(fines)
    } else {
      setFilteredFines(fines.filter((f) => f.fine.status === statusFilter))
    }
  }, [statusFilter, fines])

  const fetchFines = async () => {
    try {
      const res = await fetch('/api/admin/fines')
      const data = await res.json()
      setFines(data || [])
      setFilteredFines(data || [])
    } catch (error) {
      console.error('Failed to fetch fines:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/fines/stats')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch fine stats:', error)
    }
  }

  const handleWaiveFine = async (fineId: number, userName: string) => {
    if (!confirm(`Are you sure you want to waive the fine for ${userName}?`)) return

    try {
      const res = await fetch(`/api/admin/fines/${fineId}/waive`, {
        method: 'PUT',
      })

      if (res.ok) {
        alert('Fine waived successfully')
        fetchFines()
        fetchStats()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to waive fine')
      }
    } catch (error) {
      alert('Failed to waive fine')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-600">Paid</Badge>
      case 'waived':
        return <Badge variant="secondary">Waived</Badge>
      case 'pending':
        return <Badge variant="destructive">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getReasonBadge = (reason: string | null) => {
    switch (reason) {
      case 'overdue':
        return <Badge variant="outline">Overdue</Badge>
      case 'damage':
        return <Badge className="bg-orange-600">Damage</Badge>
      case 'loss':
        return <Badge className="bg-red-600">Loss</Badge>
      default:
        return <Badge variant="outline">{reason || 'Other'}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Fines & Payments</h1>
        <p className="text-slate-600 mt-1">Manage library fines and track payments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending Fines</p>
                <p className="text-2xl font-bold text-red-600">
                  ${stats.pending.amount.toFixed(2)}
                </p>
                <p className="text-xs text-slate-500">{stats.pending.count} fines</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Paid Fines</p>
                <p className="text-2xl font-bold text-green-600">
                  ${stats.paid.amount.toFixed(2)}
                </p>
                <p className="text-xs text-slate-500">{stats.paid.count} fines</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Waived Fines</p>
                <p className="text-2xl font-bold text-slate-600">
                  ${stats.waived.amount.toFixed(2)}
                </p>
                <p className="text-xs text-slate-500">{stats.waived.count} fines</p>
              </div>
              <FileText className="w-8 h-8 text-slate-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                <p className="text-2xl font-bold text-teal-600">
                  ${(stats.paid.amount + stats.pending.amount).toFixed(2)}
                </p>
                <p className="text-xs text-slate-500">
                  {stats.paid.count + stats.pending.count} total
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-teal-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fines Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Fines</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fines</SelectItem>
                <SelectItem value="pending">Pending Only</SelectItem>
                <SelectItem value="paid">Paid Only</SelectItem>
                <SelectItem value="waived">Waived Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading fines...</div>
          ) : filteredFines.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>No fines found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Days Overdue</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFines.map((item) => (
                    <TableRow key={item.fine.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.user?.name}</p>
                          <p className="text-sm text-slate-500">{item.user?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-red-600">
                          ${parseFloat(item.fine.amount).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>{getReasonBadge(item.fine.reason)}</TableCell>
                      <TableCell>
                        {item.fine.daysOverdue ? (
                          <span className="font-medium">{item.fine.daysOverdue} days</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(item.fine.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>{getStatusBadge(item.fine.status)}</TableCell>
                      <TableCell className="text-right">
                        {item.fine.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleWaiveFine(item.fine.id, item.user?.name || 'User')
                            }
                          >
                            Waive Fine
                          </Button>
                        )}
                        {item.fine.status === 'paid' && (
                          <Badge variant="secondary">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                        {item.fine.status === 'waived' && (
                          <Badge variant="secondary">Waived</Badge>
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
