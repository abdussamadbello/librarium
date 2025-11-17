import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { activityLog } from '@/lib/db/schema'
import { sql, gte } from 'drizzle-orm'
import { canAccessAdmin } from '@/lib/auth/roles'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get total count
    const [totalCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(activityLog)

    // Get count by action type
    const actionStats = await db
      .select({
        action: activityLog.action,
        count: sql<number>`count(*)::int`,
      })
      .from(activityLog)
      .groupBy(activityLog.action)
      .orderBy(sql`count(*) desc`)
      .limit(10)

    // Get count by entity type
    const entityStats = await db
      .select({
        entityType: activityLog.entityType,
        count: sql<number>`count(*)::int`,
      })
      .from(activityLog)
      .where(sql`${activityLog.entityType} is not null`)
      .groupBy(activityLog.entityType)

    // Get today's activity count
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [todayCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(activityLog)
      .where(gte(activityLog.createdAt, today))

    // Get this week's activity count
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const [weekCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(activityLog)
      .where(gte(activityLog.createdAt, weekAgo))

    return NextResponse.json({
      total: totalCount?.count ?? 0,
      today: todayCount?.count ?? 0,
      thisWeek: weekCount?.count ?? 0,
      byAction: actionStats,
      byEntity: entityStats,
    })
  } catch (error) {
    console.error('Error fetching audit log stats:', error)
    return NextResponse.json({ error: 'Failed to fetch audit log stats' }, { status: 500 })
  }
}
