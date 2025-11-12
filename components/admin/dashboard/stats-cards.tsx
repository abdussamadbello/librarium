'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Book, ArrowRight, AlertTriangle, Users, DollarSign } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Stats {
  totalBooks: number
  borrowedBooks: number
  overdueBooks: number
  totalMembers: number
  pendingFines: number
}

export function StatsCards() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to fetch stats:', err)
        setLoading(false)
      })
  }, [])

  const statCards = [
    {
      title: 'Total Books',
      value: stats?.totalBooks?.toLocaleString() || '0',
      icon: Book,
      color: 'blue',
    },
    {
      title: 'Borrowed Books',
      value: stats?.borrowedBooks?.toLocaleString() || '0',
      icon: ArrowRight,
      color: 'purple',
    },
    {
      title: 'Overdue Books',
      value: stats?.overdueBooks?.toLocaleString() || '0',
      icon: AlertTriangle,
      color: 'red',
    },
    {
      title: 'Total Members',
      value: stats?.totalMembers?.toLocaleString() || '0',
      icon: Users,
      color: 'green',
    },
    {
      title: 'Pending Fines',
      value: stats ? `$${stats.pendingFines.toFixed(2)}` : '$0.00',
      icon: DollarSign,
      color: 'amber',
    },
  ]

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
    green: 'bg-green-100 text-green-600',
    amber: 'bg-amber-100 text-amber-600',
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-12 w-12 bg-slate-200 rounded-full mb-3"></div>
                <div className="h-4 bg-slate-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-slate-200 rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div
                  className={`p-3 rounded-full ${colorClasses[stat.color as keyof typeof colorClasses]}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
