'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Download, RefreshCw, FileText, TrendingUp } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'

interface TransactionItem {
  transaction: {
    id: number
    userId: string
    checkoutDate: Date
    dueDate: Date
    returnDate: Date | null
    type: string
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
  returnedToUser: {
    id: string
    name: string
  } | null
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    type: 'all',
    search: '',
    startDate: '',
    endDate: '',
  })
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    returned: 0,
    onTime: 0,
    late: 0,
  })

  useEffect(() => {
    fetchTransactions()
  }, [])

  useEffect(() => {
    calculateStats()
  }, [transactions])

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.type !== 'all') params.append('type', filters.type)
      if (filters.search) params.append('search', filters.search)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)

      const res = await fetch(`/api/admin/transactions?${params}`)
      const data = await res.json()
      setTransactions(data || [])
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = () => {
    const total = transactions.length
    const active = transactions.filter((t) => !t.transaction.returnDate).length
    const returned = transactions.filter((t) => t.transaction.returnDate).length

    const returnedTransactions = transactions.filter((t) => t.transaction.returnDate)
    const onTime = returnedTransactions.filter(
      (t) => new Date(t.transaction.returnDate!) <= new Date(t.transaction.dueDate)
    ).length
    const late = returnedTransactions.filter(
      (t) => new Date(t.transaction.returnDate!) > new Date(t.transaction.dueDate)
    ).length

    setStats({ total, active, returned, onTime, late })
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value })
  }

  const handleApplyFilters = () => {
    setLoading(true)
    fetchTransactions()
  }

  const handleClearFilters = () => {
    setFilters({
      type: 'all',
      search: '',
      startDate: '',
      endDate: '',
    })
    setLoading(true)
    setTimeout(() => {
      fetchTransactions()
    }, 100)
  }

  const handleExportCSV = () => {
    const csvContent = [
      ['ID', 'Member', 'Book', 'Author', 'Checkout Date', 'Due Date', 'Return Date', 'Status', 'Issued By', 'Returned To'],
      ...transactions.map((t) => [
        t.transaction.id,
        t.user?.name || 'N/A',
        t.book?.title || 'N/A',
        t.author?.name || 'N/A',
        format(new Date(t.transaction.checkoutDate), 'yyyy-MM-dd'),
        format(new Date(t.transaction.dueDate), 'yyyy-MM-dd'),
        t.transaction.returnDate ? format(new Date(t.transaction.returnDate), 'yyyy-MM-dd') : 'Active',
        t.transaction.returnDate ? 'Returned' : 'Active',
        t.issuedByUser?.name || 'System',
        t.returnedToUser?.name || 'N/A',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
  }

  const getStatusBadge = (transaction: TransactionItem['transaction']) => {
    if (!transaction.returnDate) {
      const daysUntilDue = differenceInDays(new Date(transaction.dueDate), new Date())
      if (daysUntilDue < 0) {
        return <Badge variant="destructive">Overdue</Badge>
      } else if (daysUntilDue <= 3) {
        return <Badge className="bg-yellow-600">Due Soon</Badge>
      }
      return <Badge variant="secondary">Active</Badge>
    } else {
      const wasLate = new Date(transaction.returnDate) > new Date(transaction.dueDate)
      return wasLate ? (
        <Badge variant="destructive">Returned Late</Badge>
      ) : (
        <Badge className="bg-green-600">Returned On Time</Badge>
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Transaction History</h1>
          <p className="text-slate-600 mt-1">Complete transaction records and analytics</p>
        </div>
        <Button onClick={handleExportCSV} className="bg-teal-600 hover:bg-teal-700">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-slate-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active</p>
                <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Returned</p>
                <p className="text-2xl font-bold text-green-600">{stats.returned}</p>
              </div>
              <RefreshCw className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">On Time</p>
                <p className="text-2xl font-bold text-green-600">{stats.onTime}</p>
              </div>
              <RefreshCw className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Late Returns</p>
                <p className="text-2xl font-bold text-red-600">{stats.late}</p>
              </div>
              <RefreshCw className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Status</Label>
              <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All transactions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="returned">Returned Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Member or book name..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleApplyFilters} className="bg-teal-600 hover:bg-teal-700">
              <Search className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
            <Button onClick={handleClearFilters} variant="outline">
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Records</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Book</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Checkout</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Return Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Staff</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((item) => (
                    <TableRow key={item.transaction.id}>
                      <TableCell className="font-mono text-sm">#{item.transaction.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{item.user?.name}</p>
                          <p className="text-xs text-slate-500">{item.user?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{item.book?.title}</p>
                          <p className="text-xs text-slate-500">Copy #{item.bookCopy?.copyNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{item.author?.name || 'Unknown'}</TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(item.transaction.checkoutDate), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(item.transaction.dueDate), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.transaction.returnDate
                          ? format(new Date(item.transaction.returnDate), 'MMM dd, yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(item.transaction)}</TableCell>
                      <TableCell className="text-xs text-slate-600">
                        <div>
                          <p>Issued: {item.issuedByUser?.name || 'System'}</p>
                          {item.returnedToUser && <p>Returned: {item.returnedToUser.name}</p>}
                        </div>
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
