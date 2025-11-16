import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { books, users, transactions, fines, categories } from '@/lib/db/schema'
import { eq, sql, gte, and, isNull } from 'drizzle-orm'
import { canAccessAdmin } from '@/lib/auth/roles'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || '30' // days

    const daysAgo = parseInt(period)
    const periodStart = new Date()
    periodStart.setDate(periodStart.getDate() - daysAgo)

    // Circulation stats
    const circulationStats = await db.execute(sql`
      SELECT
        DATE(created_at) as date,
        COUNT(*)::int as count
      FROM transactions
      WHERE created_at >= ${periodStart.toISOString()}
      GROUP BY DATE(created_at)
      ORDER BY date
    `)

    // Popular books (most borrowed)
    const popularBooks = await db.execute(sql`
      SELECT
        b.id,
        b.title,
        a.name as author,
        COUNT(t.id)::int as borrow_count
      FROM transactions t
      JOIN book_copies bc ON t.book_copy_id = bc.id
      JOIN books b ON bc.book_id = b.id
      LEFT JOIN authors a ON b.author_id = a.id
      WHERE t.created_at >= ${periodStart.toISOString()}
      GROUP BY b.id, b.title, a.name
      ORDER BY borrow_count DESC
      LIMIT 10
    `)

    // Category distribution
    const categoryStats = await db.execute(sql`
      SELECT
        c.name as category,
        COUNT(b.id)::int as book_count,
        COUNT(t.id)::int as borrow_count
      FROM categories c
      LEFT JOIN books b ON c.id = b.category_id
      LEFT JOIN book_copies bc ON b.id = bc.book_id
      LEFT JOIN transactions t ON bc.id = t.book_copy_id
        AND t.created_at >= ${periodStart.toISOString()}
      GROUP BY c.id, c.name
      ORDER BY borrow_count DESC
    `)

    // Member activity
    const memberActivity = await db.execute(sql`
      SELECT
        u.id,
        u.name,
        u.email,
        COUNT(t.id)::int as total_borrows,
        SUM(CASE WHEN f.status = 'pending' THEN 1 ELSE 0 END)::int as pending_fines
      FROM users u
      LEFT JOIN transactions t ON u.id = t.user_id
      LEFT JOIN fines f ON u.id = f.user_id
      WHERE u.role = 'member'
      GROUP BY u.id, u.name, u.email
      ORDER BY total_borrows DESC
      LIMIT 10
    `)

    // Overdue analysis
    const overdueAnalysis = await db.execute(sql`
      SELECT
        CASE
          WHEN CURRENT_DATE - due_date <= 7 THEN '1-7 days'
          WHEN CURRENT_DATE - due_date <= 14 THEN '8-14 days'
          WHEN CURRENT_DATE - due_date <= 30 THEN '15-30 days'
          ELSE '30+ days'
        END as overdue_range,
        COUNT(*)::int as count
      FROM transactions
      WHERE return_date IS NULL AND due_date < CURRENT_DATE
      GROUP BY overdue_range
      ORDER BY
        CASE overdue_range
          WHEN '1-7 days' THEN 1
          WHEN '8-14 days' THEN 2
          WHEN '15-30 days' THEN 3
          ELSE 4
        END
    `)

    // Revenue (fines) by month
    const revenueStats = await db.execute(sql`
      SELECT
        TO_CHAR(created_at, 'YYYY-MM') as month,
        SUM(amount::numeric)::float as total,
        COUNT(*)::int as fine_count
      FROM fines
      WHERE created_at >= ${periodStart.toISOString()}
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month
    `)

    // Return rate (on time vs late)
    const returnStats = await db.execute(sql`
      SELECT
        SUM(CASE WHEN return_date <= due_date THEN 1 ELSE 0 END)::int as on_time,
        SUM(CASE WHEN return_date > due_date THEN 1 ELSE 0 END)::int as late
      FROM transactions
      WHERE return_date IS NOT NULL
        AND created_at >= ${periodStart.toISOString()}
    `)

    // Handle different return types from db.execute() (RowList vs QueryResult)
    const toArray = <T>(result: any): T[] => {
      if (Array.isArray(result)) return result
      if ('rows' in result) return result.rows
      return []
    }

    return NextResponse.json({
      circulationStats: toArray(circulationStats),
      popularBooks: toArray(popularBooks),
      categoryStats: toArray(categoryStats),
      memberActivity: toArray(memberActivity),
      overdueAnalysis: toArray(overdueAnalysis),
      revenueStats: toArray(revenueStats),
      returnStats: toArray(returnStats)[0] || { on_time: 0, late: 0 },
      period: daysAgo,
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
