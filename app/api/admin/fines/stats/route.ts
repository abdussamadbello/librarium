import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { fines } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { canAccessAdmin } from '@/lib/auth/roles'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get fine statistics
    const stats = await db
      .select({
        status: fines.status,
        count: sql<number>`count(*)::int`,
        total: sql<number>`sum(${fines.amount})::decimal`,
      })
      .from(fines)
      .groupBy(fines.status)

    const totalPending = stats.find((s) => s.status === 'pending')
    const totalPaid = stats.find((s) => s.status === 'paid')
    const totalWaived = stats.find((s) => s.status === 'waived')

    return NextResponse.json({
      pending: {
        count: totalPending?.count || 0,
        amount: parseFloat(totalPending?.total as any || '0'),
      },
      paid: {
        count: totalPaid?.count || 0,
        amount: parseFloat(totalPaid?.total as any || '0'),
      },
      waived: {
        count: totalWaived?.count || 0,
        amount: parseFloat(totalWaived?.total as any || '0'),
      },
    })
  } catch (error) {
    console.error('Error fetching fine stats:', error)
    return NextResponse.json({ error: 'Failed to fetch fine stats' }, { status: 500 })
  }
}
