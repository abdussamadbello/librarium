'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Book, UserPlus, Edit, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Activity {
  activity: {
    id: number
    action: string
    entityType: string
    metadata: any
    createdAt: Date
  }
  user: {
    name: string | null
    email: string
  } | null
}

const actionIcons = {
  issue_book: { icon: ArrowRight, color: 'bg-blue-100 text-blue-600' },
  return_book: { icon: Book, color: 'bg-green-100 text-green-600' },
  create_member: { icon: UserPlus, color: 'bg-purple-100 text-purple-600' },
  create_book: { icon: Book, color: 'bg-teal-100 text-teal-600' },
  update_book: { icon: Edit, color: 'bg-amber-100 text-amber-600' },
  delete_book: { icon: Trash2, color: 'bg-red-100 text-red-600' },
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/activity?limit=10')
      .then((res) => res.json())
      .then((data) => {
        setActivities(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to fetch activity:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex items-start space-x-3">
                <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                </div>
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
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No recent activity</p>
        ) : (
          <div className="space-y-4">
            {activities.map((item) => {
              const actionConfig =
                actionIcons[item.activity.action as keyof typeof actionIcons] ||
                actionIcons.issue_book
              const Icon = actionConfig.icon

              return (
                <div
                  key={item.activity.id}
                  className="flex items-start space-x-3 p-3 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <div className={`p-1.5 rounded-full ${actionConfig.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700">
                      <span className="font-medium">
                        {item.user?.name || item.user?.email || 'Unknown'}
                      </span>{' '}
                      {item.activity.action.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatDistanceToNow(new Date(item.activity.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
