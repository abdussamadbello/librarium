'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Users, BookOpen, DollarSign, Clock } from 'lucide-react'

interface AnalyticsData {
  circulationStats: Array<{ date: string; count: number }>
  popularBooks: Array<{ id: number; title: string; author: string; borrow_count: number }>
  categoryStats: Array<{ category: string; book_count: number; borrow_count: number }>
  memberActivity: Array<{ id: string; name: string; email: string; total_borrows: number; pending_fines: number }>
  overdueAnalysis: Array<{ overdue_range: string; count: number }>
  revenueStats: Array<{ month: string; total: number; fine_count: number }>
  returnStats: { on_time: number; late: number }
  period: number
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/analytics?period=${period}`)
      const analyticsData = await res.json()
      setData(analyticsData)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-600">Loading analytics...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-600">Failed to load analytics</p>
      </div>
    )
  }

  const totalCirculation = data.circulationStats.reduce((sum, stat) => sum + stat.count, 0)
  const totalRevenue = data.revenueStats.reduce((sum, stat) => sum + stat.total, 0)
  const totalReturns = data.returnStats.on_time + data.returnStats.late
  const onTimeRate = totalReturns > 0
    ? ((data.returnStats.on_time / totalReturns) * 100).toFixed(1)
    : '0'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-600 mt-1">Library statistics and insights</p>
        </div>
        <select
          className="border border-slate-300 rounded-md p-2 text-sm"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Circulation</CardTitle>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCirculation}</div>
            <p className="text-xs text-slate-500">transactions in {period} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Members</CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.memberActivity.length}</div>
            <p className="text-xs text-slate-500">with activity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Fine Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-slate-500">from {data.revenueStats.reduce((sum, s) => sum + s.fine_count, 0)} fines</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">On-Time Rate</CardTitle>
            <Clock className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onTimeRate}%</div>
            <p className="text-xs text-slate-500">{data.returnStats.on_time}/{totalReturns} on time</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Books */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Books</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.popularBooks.slice(0, 5).map((book, index) => (
                <div key={book.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{book.title}</p>
                      <p className="text-xs text-slate-500">{book.author}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{book.borrow_count} borrows</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.categoryStats.slice(0, 5).map((cat) => {
                const percentage = cat.book_count > 0
                  ? (cat.borrow_count / cat.book_count) * 20 // Scale for visual
                  : 0
                return (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium">{cat.category}</span>
                      <span className="text-slate-500">{cat.borrow_count} borrows</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-600"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Members */}
        <Card>
          <CardHeader>
            <CardTitle>Most Active Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.memberActivity.slice(0, 5).map((member) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{member.name}</p>
                    <p className="text-xs text-slate-500">{member.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{member.total_borrows} books</p>
                    {member.pending_fines > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {member.pending_fines} fines
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Overdue Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Overdue Books Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.overdueAnalysis.map((range) => (
                <div key={range.overdue_range} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{range.overdue_range}</span>
                  <Badge variant="outline">{range.count} books</Badge>
                </div>
              ))}
              {data.overdueAnalysis.length === 0 && (
                <p className="text-center text-slate-500 py-4">No overdue books!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Circulation Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Circulation Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-1">
            {data.circulationStats.map((stat) => {
              const maxCount = Math.max(...data.circulationStats.map((s) => s.count))
              const height = maxCount > 0 ? (stat.count / maxCount) * 100 : 0
              return (
                <div key={stat.date} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col-reverse h-full">
                    <div
                      className="bg-teal-600 rounded-t hover:bg-teal-700 transition-colors"
                      style={{ height: `${height}%` }}
                      title={`${stat.count} transactions`}
                    />
                  </div>
                  <span className="text-xs text-slate-500 mt-2 rotate-45 origin-left whitespace-nowrap">
                    {new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
