import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { createReservation, getUserReservations } from '@/lib/services/reservations'
import { createReservationSchema, listReservationsSchema } from '@/lib/validations/reservation'

/**
 * POST /api/reservations
 * Create a new reservation
 */
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // Validate input
    const validation = createReservationSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.format() },
        { status: 400 }
      )
    }

    const { bookId } = validation.data

    // Create reservation
    const reservation = await createReservation({
      userId: session.user.id,
      bookId,
    })

    return NextResponse.json({
      success: true,
      reservation,
      message: 'Book reserved successfully! You will be notified when it becomes available.',
    })
  } catch (error) {
    console.error('Create reservation error:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to create reservation' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/reservations
 * Get user's reservations
 */
export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || undefined
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 20

    // Validate query params
    const validation = listReservationsSchema.safeParse({ status, page, limit })
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validation.error.format() },
        { status: 400 }
      )
    }

    // Get user's reservations
    const allReservations = await getUserReservations(session.user.id)

    // Filter by status if provided
    let filteredReservations = allReservations
    if (status) {
      filteredReservations = allReservations.filter(r => r.reservation.status === status)
    }

    // Paginate
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedReservations = filteredReservations.slice(startIndex, endIndex)

    return NextResponse.json({
      reservations: paginatedReservations,
      pagination: {
        page,
        limit,
        total: filteredReservations.length,
        totalPages: Math.ceil(filteredReservations.length / limit),
      },
    })
  } catch (error) {
    console.error('Get reservations error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reservations' },
      { status: 500 }
    )
  }
}
