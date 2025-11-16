import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { getRecommendationsForUser } from '@/lib/services/recommendations'

/**
 * GET /api/recommendations - Get personalized book recommendations
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    const recommendations = await getRecommendationsForUser(session.user.id, limit)

    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    )
  }
}
