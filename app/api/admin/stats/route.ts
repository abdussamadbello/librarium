import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { books, users, transactions, fines } from '@/lib/db/schema'
import { eq, isNull, and, sql } from 'drizzle-orm'
import { canAccessAdmin } from '@/lib/auth/roles'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get total books count
    const [totalBooksResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(books)

    // Get borrowed books count (active transactions)
    const [borrowedBooksResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(transactions)
      .where(isNull(transactions.returnDate))

    // Get overdue books count
    const allActive = await db
      .select({
        id: transactions.id,
        dueDate: transactions.dueDate,
      })
      .from(transactions)
      .where(isNull(transactions.returnDate))

    const overdueCount = allActive.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date()
    ).length

    // Get total members count (users with member role)
    const [membersResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.role, 'member'))

    // Get pending fines total
    const pendingFines = await db
      .select({ amount: fines.amount })
      .from(fines)
      .where(eq(fines.status, 'pending'))

    const totalPendingFines = pendingFines.reduce(
      (sum, f) => sum + parseFloat(f.amount || '0'),
      0
    )

    // Get category distribution
    const categoryDist = await db.execute(sql`
      SELECT c.name, COUNT(b.id)::int as count
      FROM categories c
      LEFT JOIN books b ON c.id = b.category_id
      GROUP BY c.id, c.name
      ORDER BY count DESC
      LIMIT 10
    `)

    const toArray = <T>(result: any): T[] => {
      if (Array.isArray(result)) return result
      if ('rows' in result) return result.rows
      return []
    }

    const stats = {
      totalBooks: totalBooksResult?.count || 0,
      borrowedBooks: borrowedBooksResult?.count || 0,
      overdueBooks: overdueCount,
      totalMembers: membersResult?.count || 0,
      pendingFines: totalPendingFines,
      categoryDistribution: toArray(categoryDist),
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
