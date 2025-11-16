import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { fines, users, transactions, payments } from '@/lib/db/schema'
import { eq, desc, sql, and } from 'drizzle-orm'
import { canAccessAdmin } from '@/lib/auth/roles'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') // pending, paid, waived

    // Get all fines with user and transaction info
    let query = db
      .select({
        fine: fines,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
        transaction: {
          id: transactions.id,
          checkoutDate: transactions.checkoutDate,
          dueDate: transactions.dueDate,
          returnDate: transactions.returnDate,
        },
        payments: sql<any>`json_agg(${payments}) filter (where ${payments.id} is not null)`,
      })
      .from(fines)
      .leftJoin(users, eq(fines.userId, users.id))
      .leftJoin(transactions, eq(fines.transactionId, transactions.id))
      .leftJoin(payments, eq(payments.fineId, fines.id))
      .groupBy(fines.id, users.id, transactions.id)
      .orderBy(desc(fines.createdAt))

    if (status) {
      query = query.where(eq(fines.status, status)) as any
    }

    const allFines = await query

    return NextResponse.json(allFines)
  } catch (error) {
    console.error('Error fetching fines:', error)
    return NextResponse.json({ error: 'Failed to fetch fines' }, { status: 500 })
  }
}
