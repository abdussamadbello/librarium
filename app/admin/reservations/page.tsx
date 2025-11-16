'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BookMarked, Bell, Clock, Check, Search, Filter } from 'lucide-react'
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
    availableCopies: number
  } | null
  user: {
    id: string
    name: string | null
    email: string | null
  } | null
}

export default function AdminReservationsPage() {
  const { toast } = useToast()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'fulfilled' | 'expired'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [fulfillingId, setFulfillingId] = useState<number | null>(null)

  useEffect(() => {
    fetchReservations()
  }, [filter])

  const fetchReservations = async () => {
    try {
      const url = filter === 'all'
        ? '/api/admin/reservations'
        : `/api/admin/reservations?status=${filter}`

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

  const handleFulfill = async (reservationId: number) => {
    setFulfillingId(reservationId)
    try {
      const res = await fetch(`/api/admin/reservations/${reservationId}/fulfill`, {
        method: 'POST',
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to fulfill reservation')
      }

      const result = await res.json()
      toast({
        title: 'Reservation fulfilled',
        description: result.message || 'Member has been notified.',
      })

      // Refresh list
      await fetchReservations()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fulfill reservation',
        variant: 'destructive',
      })
    } finally {
      setFulfillingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-600">Active</Badge>
      case 'fulfilled':
        return <Badge className="bg-green-600">Ready</Badge>
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
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diff = expiry.getTime() - now.getTime()
    const hoursRemaining = Math.floor(diff / (1000 * 60 * 60))

    if (hoursRemaining < 0) return 'Expired'
    if (hoursRemaining < 24) return `${hoursRemaining}h remaining`
    return `${Math.floor(hoursRemaining / 24)}d ${hoursRemaining % 24}h remaining`
  }

  // Filter reservations by search term
  const filteredReservations = reservations.filter((item) => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      item.book?.title.toLowerCase().includes(search) ||
      item.user?.name?.toLowerCase().includes(search) ||
      item.user?.email?.toLowerCase().includes(search)
    )
  })

  if (loading) {
    return (
      <div className="text-center py-20">
        <BookMarked className="w-16 h-16 text-slate-300 mx-auto mb-4 animate-pulse" />
        <p className="text-slate-600">Loading reservations...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-4xl font-bold text-slate-900 mb-2">
          Reservations Management
        </h1>
        <p className="text-slate-600">
          Manage book reservations and fulfill holds for members
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total</p>
                <p className="text-2xl font-bold text-slate-900">
                  {reservations.length}
                </p>
              </div>
              <BookMarked className="w-8 h-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active</p>
                <p className="text-2xl font-bold text-blue-600">
                  {reservations.filter((r) => r.reservation.status === 'active').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Ready</p>
                <p className="text-2xl font-bold text-green-600">
                  {reservations.filter((r) => r.reservation.status === 'fulfilled').length}
                </p>
              </div>
              <Bell className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Expired</p>
                <p className="text-2xl font-bold text-red-600">
                  {reservations.filter((r) => r.reservation.status === 'expired').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by book title, member name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
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
                Ready
              </Button>
              <Button
                variant={filter === 'expired' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('expired')}
                className={filter === 'expired' ? 'bg-primary hover:bg-primary/90' : ''}
              >
                Expired
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reservations List */}
      {filteredReservations.length === 0 ? (
        <Card className="shadow-soft">
          <CardContent className="py-12">
            <div className="text-center">
              <BookMarked className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="font-serif text-xl font-semibold text-slate-900 mb-2">
                No reservations found
              </h3>
              <p className="text-slate-600">
                {searchTerm
                  ? 'No reservations match your search.'
                  : filter === 'all'
                  ? 'No reservations in the system yet.'
                  : `No ${filter} reservations found.`}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReservations.map(({ reservation, book, user }) => (
            <Card
              key={reservation.id}
              className={`shadow-soft transition-all hover:shadow-lift ${
                reservation.status === 'fulfilled'
                  ? 'border-green-200 bg-gradient-to-r from-green-50/50 to-transparent'
                  : reservation.status === 'active' && reservation.queuePosition === 1
                  ? 'border-blue-200 bg-gradient-to-r from-blue-50/50 to-transparent'
                  : ''
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Member Info */}
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          {user?.name || 'Unknown Member'}
                        </p>
                        <p className="text-sm text-slate-600">{user?.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Reservation ID</p>
                        <p className="text-sm font-mono text-slate-900">#{reservation.id}</p>
                      </div>
                    </div>

                    {/* Book Info */}
                    <div className="border-l-2 border-primary/20 pl-4">
                      <Link
                        href={`/admin/books/${book?.id}`}
                        className="font-serif text-lg font-semibold text-slate-900 hover:text-primary transition-colors"
                      >
                        {book?.title || 'Unknown Book'}
                      </Link>
                      <p className="text-sm text-slate-600">
                        {book?.publisher}
                        {book?.publicationYear && ` • ${book.publicationYear}`}
                      </p>
                    </div>

                    {/* Status and Queue Info */}
                    <div className="flex items-center gap-3 flex-wrap">
                      {getStatusBadge(reservation.status)}

                      {reservation.queuePosition !== null && (
                        <div className="flex items-center gap-1.5 text-sm">
                          <Clock className="w-4 h-4 text-slate-500" />
                          <span className={reservation.queuePosition === 1 ? 'font-semibold text-blue-700' : 'text-slate-600'}>
                            Queue position: #{reservation.queuePosition}
                            {reservation.queuePosition === 1 && ' (Next in line)'}
                          </span>
                        </div>
                      )}

                      {reservation.status === 'fulfilled' && reservation.expiresAt && (
                        <div className="flex items-center gap-1.5 text-sm text-green-700 font-medium">
                          <Bell className="w-4 h-4" />
                          <span>{getTimeRemaining(reservation.expiresAt)}</span>
                        </div>
                      )}

                      {book && (
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <span>{book.availableCopies} available</span>
                        </div>
                      )}
                    </div>

                    {/* Dates */}
                    <div className="text-xs text-slate-500 space-y-1">
                      <p>Reserved: {formatDate(reservation.reservedAt)}</p>
                      {reservation.fulfilledAt && (
                        <p>Fulfilled: {formatDate(reservation.fulfilledAt)}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {reservation.status === 'active' && book && book.availableCopies > 0 && (
                    <Button
                      onClick={() => handleFulfill(reservation.id)}
                      disabled={fulfillingId === reservation.id}
                      className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {fulfillingId === reservation.id ? 'Fulfilling...' : 'Mark Ready'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results count */}
      {filteredReservations.length > 0 && (
        <p className="text-sm text-slate-600 text-center">
          Showing {filteredReservations.length} of {reservations.length} reservation(s)
        </p>
      )}
    </div>
  )
}
