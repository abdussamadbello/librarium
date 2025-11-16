'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Bell, X, Check, Trash2, ExternalLink, BookOpen, Clock, AlertCircle, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

interface NotificationDropdownProps {
  onClose: () => void
  onNotificationRead: () => void
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

export function NotificationDropdown({ onClose, onNotificationRead }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchNotifications()

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications?limit=10')
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
        onNotificationRead()
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
        onNotificationRead()
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
        onNotificationRead()
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-slate-200 z-50 max-h-[500px] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="font-serif text-lg font-semibold text-slate-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs text-primary hover:text-primary/80"
            >
              <Check className="w-3 h-3 mr-1" />
              Mark all read
            </Button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notification) => {
              const typeColor = notificationTypeColors[notification.type as keyof typeof notificationTypeColors] || notificationTypeColors.general

              return (
                <div
                  key={notification.id}
                  className={cn(
                    'p-4 hover:bg-slate-50 transition-colors relative group',
                    !notification.isRead && 'bg-blue-50/30'
                  )}
                >
                  {/* Unread Indicator */}
                  {!notification.isRead && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}

                  <div className="flex gap-3 pl-3">
                    {/* Icon */}
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br shadow-soft',
                      typeColor
                    )}>
                      {(() => {
                        const Icon = notificationTypeIcons[notification.type as keyof typeof notificationTypeIcons] || Bell
                        return <Icon className="w-5 h-5 text-white" />
                      })()}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm text-slate-900 leading-tight">
                          {notification.title}
                        </h4>
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all text-red-600"
                          aria-label="Delete notification"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-slate-500">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>

                        <div className="flex gap-2">
                          {notification.link && (
                            <Link href={notification.link} onClick={onClose}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs text-primary hover:text-primary/80"
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                View
                              </Button>
                            </Link>
                          )}
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="h-6 px-2 text-xs"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Mark read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-slate-200 bg-slate-50">
          <Link href="/member/notifications" onClick={onClose}>
            <Button
              variant="ghost"
              className="w-full text-sm text-primary hover:text-primary/80 hover:bg-primary/10"
            >
              View All Notifications
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
