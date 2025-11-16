'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Bell, BookOpen, Clock, AlertCircle, DollarSign, Check, Trash2, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Notification {
  id: number
  type: string
  title: string
  message: string
  link?: string | null
  isRead: boolean
  createdAt: Date | string
  metadata?: any
}

const notificationTypeIcons = {
  reservation_ready: BookOpen,
  overdue: AlertCircle,
  due_soon: Clock,
  fine_added: DollarSign,
  general: Bell,
}

const notificationTypeColors = {
  reservation_ready: 'from-primary to-primary/80',
  overdue: 'from-red-500 to-red-600',
  due_soon: 'from-amber-500 to-amber-600',
  fine_added: 'from-orange-500 to-orange-600',
  general: 'from-slate-500 to-slate-600',
}

type FilterType = 'all' | 'unread' | 'reservation_ready' | 'overdue' | 'due_soon' | 'fine_added'

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/notifications?limit=50')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: number) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      })

      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
        )
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const deleteNotification = async (notificationId: number) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      })

      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true
    if (filter === 'unread') return !n.isRead
    return n.type === filter
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  const filterOptions = [
    { value: 'all' as FilterType, label: 'All', count: notifications.length },
    { value: 'unread' as FilterType, label: 'Unread', count: unreadCount },
    { value: 'reservation_ready' as FilterType, label: 'Reservations', icon: BookOpen },
    { value: 'overdue' as FilterType, label: 'Overdue', icon: AlertCircle },
    { value: 'due_soon' as FilterType, label: 'Due Soon', icon: Clock },
    { value: 'fine_added' as FilterType, label: 'Fines', icon: DollarSign },
  ]

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-soft p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-slate-600" />
            {filterOptions.map((option) => {
              const Icon = option.icon
              return (
                <Button
                  key={option.value}
                  variant={filter === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(option.value)}
                  className={cn(
                    'gap-1.5',
                    filter === option.value && 'bg-gradient-to-r from-primary to-primary/80'
                  )}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {option.label}
                  {option.count !== undefined && option.count > 0 && (
                    <span className={cn(
                      'ml-1 px-1.5 py-0.5 rounded-full text-xs font-semibold',
                      filter === option.value
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-700'
                    )}>
                      {option.count}
                    </span>
                  )}
                </Button>
              )
            })}
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-lg shadow-soft p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-600">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg shadow-soft p-12 text-center">
            <Bell className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="font-serif text-xl font-semibold text-slate-900 mb-2">
              No notifications
            </h3>
            <p className="text-slate-600">
              {filter === 'unread'
                ? "You're all caught up! No unread notifications."
                : filter === 'all'
                ? "You don't have any notifications yet."
                : `No ${filter.replace('_', ' ')} notifications found.`}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const Icon = notificationTypeIcons[notification.type as keyof typeof notificationTypeIcons] || Bell
            const typeColor = notificationTypeColors[notification.type as keyof typeof notificationTypeColors] || notificationTypeColors.general

            return (
              <div
                key={notification.id}
                className={cn(
                  'bg-white border border-slate-200 rounded-lg shadow-soft p-5 transition-all hover:shadow-lift group',
                  !notification.isRead && 'border-l-4 border-l-primary bg-blue-50/30'
                )}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className={cn(
                    'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br shadow-soft',
                    typeColor
                  )}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="font-serif text-lg font-semibold text-slate-900 mb-1">
                          {notification.title}
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {notification.message}
                        </p>
                      </div>
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3">
                      {notification.link && (
                        <Link href={notification.link}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => !notification.isRead && markAsRead(notification.id)}
                          >
                            View Details
                          </Button>
                        </Link>
                      )}
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="h-8 gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Mark as read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="h-8 gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
