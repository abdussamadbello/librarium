'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollText, Activity, Clock, User } from 'lucide-react'
import { format } from 'date-fns'

interface AuditLogItem {
  log: {
    id: number
    userId: string
    action: string
    entityType: string | null
    entityId: number | null
    metadata: any
    createdAt: Date
  }
  user: {
    id: string
    name: string
    email: string
    role: string
  } | null
}

interface AuditStats {
  total: number
  today: number
  thisWeek: number
  byAction: { action: string; count: number }[]
  byEntity: { entityType: string; count: number }[]
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([])
  const [stats, setStats] = useState<AuditStats>({
    total: 0,
    today: 0,
    thisWeek: 0,
    byAction: [],
    byEntity: [],
  })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    fetchLogs()
    fetchStats()
  }, [])

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.action) params.append('action', filters.action)
      if (filters.entityType) params.append('entityType', filters.entityType)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)

      const res = await fetch(`/api/admin/audit-logs?${params}`)
      const data = await res.json()
      setLogs(data || [])
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/audit-logs/stats')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch audit log stats:', error)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value })
  }

  const handleApplyFilters = () => {
    setLoading(true)
    fetchLogs()
  }

  const handleClearFilters = () => {
    setFilters({
      action: '',
      entityType: '',
      startDate: '',
      endDate: '',
    })
    setLoading(true)
    setTimeout(() => {
      fetchLogs()
    }, 100)
  }

  const getActionBadge = (action: string) => {
    if (action.includes('create')) return <Badge className="bg-green-600">Create</Badge>
    if (action.includes('update')) return <Badge className="bg-blue-600">Update</Badge>
    if (action.includes('delete')) return <Badge variant="destructive">Delete</Badge>
    if (action.includes('login')) return <Badge variant="outline">Login</Badge>
    return <Badge variant="secondary">{action}</Badge>
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'director':
        return <Badge className="bg-purple-600 text-xs">Director</Badge>
      case 'admin':
        return <Badge className="bg-blue-600 text-xs">Admin</Badge>
      case 'staff':
        return <Badge className="bg-teal-600 text-xs">Staff</Badge>
      case 'member':
        return <Badge variant="outline" className="text-xs">Member</Badge>
      default:
        return <Badge variant="outline" className="text-xs">{role}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Audit Logs</h1>
        <p className="text-slate-600 mt-1">System activity log and user action tracking</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Logs</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <ScrollText className="w-8 h-8 text-slate-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Today</p>
                <p className="text-2xl font-bold text-teal-600">{stats.today}</p>
              </div>
              <Activity className="w-8 h-8 text-teal-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">This Week</p>
                <p className="text-2xl font-bold text-blue-600">{stats.thisWeek}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Top Action</p>
                <p className="text-sm font-bold text-slate-900 truncate">
                  {stats.byAction[0]?.action || 'N/A'}
                </p>
                <p className="text-xs text-slate-500">
                  {stats.byAction[0]?.count || 0} times
                </p>
              </div>
              <User className="w-8 h-8 text-slate-500" />
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
              <Label htmlFor="action">Action</Label>
              <Input
                id="action"
                placeholder="e.g., create_book"
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entityType">Entity Type</Label>
              <Select value={filters.entityType} onValueChange={(value) => handleFilterChange('entityType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="book">Book</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="transaction">Transaction</SelectItem>
                  <SelectItem value="fine">Fine</SelectItem>
                  <SelectItem value="reservation">Reservation</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="author">Author</SelectItem>
                  <SelectItem value="publisher">Publisher</SelectItem>
                </SelectContent>
              </Select>
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
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
            >
              Apply Filters
            </button>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50"
            >
              Clear Filters
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading audit logs...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <ScrollText className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>No audit logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((item) => (
                    <TableRow key={item.log.id}>
                      <TableCell className="text-sm">
                        {format(new Date(item.log.createdAt), 'MMM dd, yyyy HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        {item.user ? (
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{item.user.name}</p>
                              {getRoleBadge(item.user.role)}
                            </div>
                            <p className="text-xs text-slate-500">{item.user.email}</p>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-sm">System</span>
                        )}
                      </TableCell>
                      <TableCell>{getActionBadge(item.log.action)}</TableCell>
                      <TableCell>
                        {item.log.entityType ? (
                          <div className="text-sm">
                            <p className="font-medium capitalize">{item.log.entityType}</p>
                            {item.log.entityId && (
                              <p className="text-xs text-slate-500">ID: {item.log.entityId}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.log.metadata ? (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-blue-600 hover:underline">
                              View metadata
                            </summary>
                            <pre className="mt-2 p-2 bg-slate-50 rounded text-xs overflow-x-auto">
                              {JSON.stringify(item.log.metadata, null, 2)}
                            </pre>
                          </details>
                        ) : (
                          <span className="text-slate-400 text-sm">-</span>
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
