import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { reservations, books, users } from '@/lib/db/schema'
import { eq, asc, desc } from 'drizzle-orm'

/**
 * GET /api/admin/reservations
 * Get all reservations (admin only)
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is admin or staff
    if (!session?.user?.id || !['admin', 'staff', 'director'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const bookId = searchParams.get('bookId')
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 20

    // Build query
    let query = db
      .select({
        reservation: reservations,
        book: books,
        user: users,
      })
      .from(reservations)
      .leftJoin(books, eq(reservations.bookId, books.id))
      .leftJoin(users, eq(reservations.userId, users.id))
      .$dynamic()

    // Filter by status if provided
    if (status) {
      query = query.where(eq(reservations.status, status))
    }

    // Filter by bookId if provided
    if (bookId) {
      query = query.where(eq(reservations.bookId, parseInt(bookId)))
    }

    // Order by queue position and reservation date
    const allReservations = await query.orderBy(
      asc(reservations.queuePosition),
      desc(reservations.reservedAt)
    )

    // Paginate
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedReservations = allReservations.slice(startIndex, endIndex)

    return NextResponse.json({
      reservations: paginatedReservations,
      pagination: {
        page,
        limit,
        total: allReservations.length,
        totalPages: Math.ceil(allReservations.length / limit),
      },
    })
  } catch (error) {
    console.error('Get admin reservations error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reservations' },
      { status: 500 }
    )
  }
}
