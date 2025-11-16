import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { fulfillReservation } from '@/lib/services/reservations'

/**
 * POST /api/admin/reservations/[id]/fulfill
 * Mark a reservation as fulfilled (ready for pickup)
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    // Check if user is admin or staff
    if (!session?.user?.id || !['admin', 'staff', 'director'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const reservationId = parseInt(id)

    if (isNaN(reservationId)) {
      return NextResponse.json({ error: 'Invalid reservation ID' }, { status: 400 })
    }

    // Fulfill reservation
    const fulfilled = await fulfillReservation({
      reservationId,
      fulfilledBy: session.user.id,
    })

    return NextResponse.json({
      success: true,
      reservation: fulfilled,
      message: 'Reservation fulfilled successfully. Member has been notified.',
    })
  } catch (error) {
    console.error('Fulfill reservation error:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to fulfill reservation' },
      { status: 500 }
    )
  }
}
