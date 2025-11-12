'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Check, Trash2, CheckCheck } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface Notification {
  id: number
  type: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: Date
}

interface NotificationPanelProps {
  onClose: () => void
  onNotificationRead: () => void
}

export function NotificationPanel({ onClose, onNotificationRead }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: number) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      })

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        )
        onNotificationRead()
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const deleteNotification = async (id: number) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
        onNotificationRead()
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      })

      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
        onNotificationRead()
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'overdue':
        return 'bg-red-100 border-red-200'
      case 'due_soon':
        return 'bg-orange-100 border-orange-200'
      case 'fine_added':
        return 'bg-yellow-100 border-yellow-200'
      case 'reservation_ready':
        return 'bg-green-100 border-green-200'
      default:
        return 'bg-blue-100 border-blue-200'
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <Card className="absolute right-0 top-12 w-96 max-h-[600px] overflow-hidden shadow-lg z-50">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-white">
          <h3 className="font-semibold text-lg">Notifications</h3>
          <div className="flex items-center gap-2">
            {notifications.some((n) => !n.isRead) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Mark all read
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-[500px]">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <p>No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-slate-50 transition-colors ${
                    !notification.isRead ? 'bg-slate-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        !notification.isRead ? 'bg-teal-600' : 'bg-slate-300'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                      {notification.link && (
                        <Link
                          href={notification.link}
                          className="text-sm text-teal-600 hover:text-teal-700 mt-2 inline-block"
                          onClick={() => markAsRead(notification.id)}
                        >
                          View details →
                        </Link>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs h-7"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Mark read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="text-xs h-7 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </>
  )
}
