import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { canAccessAdmin } from '@/lib/auth/roles'
import { db } from '@/lib/db'
import { users, bookCopies, books, authors, transactions, fines } from '@/lib/db/schema'
import { eq, and, isNull, sql } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { qrCode } = body

    if (!qrCode) {
      return NextResponse.json({ error: 'QR code is required' }, { status: 400 })
    }

    // Determine if it's a user or book QR code
    if (qrCode.startsWith('USER_')) {
      // Scan user QR code
      const [user] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          address: users.address,
          role: users.role,
          membershipType: users.membershipType,
          membershipStart: users.membershipStart,
          membershipExpiry: users.membershipExpiry,
          qrCode: users.qrCode,
        })
        .from(users)
        .where(eq(users.qrCode, qrCode))
        .limit(1)

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Check if membership is valid
      const isExpired = user.membershipExpiry
        ? new Date(user.membershipExpiry) < new Date()
        : false

      // Get active borrows count
      const activeBorrowsResult = await db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(transactions)
        .where(and(eq(transactions.userId, user.id), isNull(transactions.returnDate)))

      const activeBorrows = activeBorrowsResult[0]?.count || 0

      // Get total unpaid fines
      const totalFinesResult = await db
        .select({ total: sql<number>`COALESCE(SUM(amount - paid_amount), 0)::float` })
        .from(fines)
        .where(eq(fines.userId, user.id))

      const totalFines = totalFinesResult[0]?.total || 0

      return NextResponse.json({
        type: 'user',
        data: {
          ...user,
          activeBorrows,
          totalFines,
        },
        isExpired,
      })
    } else if (qrCode.startsWith('BOOK_')) {
      // Scan book QR code
      const [bookCopy] = await db
        .select({
          copy: bookCopies,
          book: books,
          author: authors,
        })
        .from(bookCopies)
        .leftJoin(books, eq(bookCopies.bookId, books.id))
        .leftJoin(authors, eq(books.authorId, authors.id))
        .where(eq(bookCopies.qrCode, qrCode))
        .limit(1)

      if (!bookCopy) {
        return NextResponse.json({ error: 'Book copy not found' }, { status: 404 })
      }

      return NextResponse.json({
        type: 'book',
        data: {
          copy: bookCopy.copy,
          book: bookCopy.book,
          author: bookCopy.author,
        },
      })
    } else {
      return NextResponse.json({ error: 'Invalid QR code format' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error scanning QR code:', error)
    return NextResponse.json({ error: 'Failed to scan QR code' }, { status: 500 })
  }
}
