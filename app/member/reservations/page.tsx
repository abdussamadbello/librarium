'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Bell, Clock, X, BookMarked } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

interface Reservation {
  reservation: {
    id: number
    userId: string
    bookId: number
    status: string
    queuePosition: number | null
    reservedAt: string
    notifiedAt: string | null
    fulfilledAt: string | null
    expiresAt: string | null
  }
  book: {
    id: number
    title: string
    publisher: string
    publicationYear: number | null
    totalCopies: number
    availableCopies: number
  } | null
}

export default function MemberReservationsPage() {
  const { toast } = useToast()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'fulfilled'>('all')
  const [cancellingId, setCancellingId] = useState<number | null>(null)

  useEffect(() => {
    fetchReservations()
  }, [filter])

  const fetchReservations = async () => {
    try {
      const url = filter === 'all'
        ? '/api/reservations'
        : `/api/reservations?status=${filter}`

      const res = await fetch(url)
      if (!res.ok) {
        throw new Error('Failed to fetch reservations')
      }
      const data = await res.json()
      setReservations(data.reservations || [])
    } catch (error) {
      console.error('Failed to fetch reservations:', error)
      toast({
        title: 'Error',
        description: 'Failed to load reservations',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (reservationId: number) => {
    setCancellingId(reservationId)
    try {
      const res = await fetch(`/api/reservations/${reservationId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to cancel reservation')
      }

      toast({
        title: 'Reservation cancelled',
        description: 'Your reservation has been cancelled successfully.',
      })

      // Refresh list
      await fetchReservations()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to cancel reservation',
        variant: 'destructive',
      })
    } finally {
      setCancellingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-600">Active</Badge>
      case 'fulfilled':
        return <Badge className="bg-green-600">Ready for Pickup</Badge>
      case 'cancelled':
        return <Badge variant="secondary">Cancelled</Badge>
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diff = expiry.getTime() - now.getTime()
    const hoursRemaining = Math.floor(diff / (1000 * 60 * 60))

    if (hoursRemaining < 0) return 'Expired'
    if (hoursRemaining < 24) return `${hoursRemaining}h remaining`
    return `${Math.floor(hoursRemaining / 24)}d remaining`
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <BookMarked className="w-16 h-16 text-slate-300 mx-auto mb-4 animate-pulse" />
        <p className="text-slate-600">Loading your reservations...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-4xl font-bold text-slate-900 mb-2">
          My Reservations
        </h1>
        <p className="text-slate-600">
          Manage your book reservations and view your queue positions
        </p>
      </div>

      {/* Filters */}
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-primary hover:bg-primary/90' : ''}
            >
              All
            </Button>
            <Button
              variant={filter === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('active')}
              className={filter === 'active' ? 'bg-primary hover:bg-primary/90' : ''}
            >
              Active
            </Button>
            <Button
              variant={filter === 'fulfilled' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('fulfilled')}
              className={filter === 'fulfilled' ? 'bg-primary hover:bg-primary/90' : ''}
            >
              Ready for Pickup
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reservations List */}
      {reservations.length === 0 ? (
        <Card className="shadow-soft">
          <CardContent className="py-12">
            <div className="text-center">
              <BookMarked className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="font-serif text-xl font-semibold text-slate-900 mb-2">
                No reservations found
              </h3>
              <p className="text-slate-600 mb-6">
                {filter === 'all'
                  ? "You haven't reserved any books yet."
                  : `No ${filter} reservations found.`}
              </p>
              <Link href="/member/discover">
                <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Browse Books
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reservations.map(({ reservation, book }) => (
            <Card
              key={reservation.id}
              className={`shadow-soft transition-all hover:shadow-lift ${
                reservation.status === 'fulfilled'
                  ? 'border-green-200 bg-gradient-to-r from-green-50/50 to-transparent'
                  : ''
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Book Title */}
                    <div>
                      <Link
                        href={`/member/books/${book?.id}`}
                        className="font-serif text-xl font-semibold text-slate-900 hover:text-primary transition-colors"
                      >
                        {book?.title || 'Unknown Book'}
                      </Link>
                      <p className="text-sm text-slate-600 mt-1">
                        {book?.publisher}
                        {book?.publicationYear && ` • ${book.publicationYear}`}
                      </p>
                    </div>

                    {/* Status and Queue Info */}
                    <div className="flex items-center gap-3 flex-wrap">
                      {getStatusBadge(reservation.status)}

                      {reservation.status === 'active' && reservation.queuePosition !== null && (
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Clock className="w-4 h-4" />
                          <span>Queue position: #{reservation.queuePosition}</span>
                        </div>
                      )}

                      {reservation.status === 'fulfilled' && reservation.expiresAt && (
                        <div className="flex items-center gap-1.5 text-sm text-green-700 font-medium">
                          <Bell className="w-4 h-4" />
                          <span>{getTimeRemaining(reservation.expiresAt)}</span>
                        </div>
                      )}
                    </div>

                    {/* Reservation Date */}
                    <p className="text-xs text-slate-500">
                      Reserved on {formatDate(reservation.reservedAt)}
                      {reservation.fulfilledAt && (
                        <> • Ready since {formatDate(reservation.fulfilledAt)}</>
                      )}
                    </p>

                    {/* Fulfilled Message */}
                    {reservation.status === 'fulfilled' && (
                      <div className="bg-green-100 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-800 font-medium">
                          Your book is ready for pickup! Please visit the library within 48 hours
                          or this reservation will expire.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {(reservation.status === 'active' || reservation.status === 'fulfilled') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancel(reservation.id)}
                      disabled={cancellingId === reservation.id}
                      className="text-slate-600 hover:text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Help Text */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-slate-200 shadow-soft">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-slate-600 mt-0.5" />
            <div className="text-sm text-slate-700 space-y-2">
              <p>
                <strong>How reservations work:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>When a book becomes available, the first person in queue is notified</li>
                <li>You have 48 hours to pick up your reserved book</li>
                <li>If not picked up within 48 hours, the reservation expires</li>
                <li>You can cancel your reservation at any time</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
