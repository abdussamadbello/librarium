import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { getUserReadingLists, createReadingList } from '@/lib/services/reading-lists'
import { z } from 'zod'

const createListSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().optional().default(false),
})

/**
 * GET /api/reading-lists - Get user's reading lists
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

    const lists = await getUserReadingLists(session.user.id)

    return NextResponse.json({ lists })
  } catch (error) {
    console.error('Error fetching reading lists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reading lists' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/reading-lists - Create a new reading list
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createListSchema.parse(body)

    const list = await createReadingList({
      userId: session.user.id,
      ...validatedData,
    })

    return NextResponse.json({
      success: true,
      list,
      message: 'Reading list created successfully',
    })
  } catch (error) {
    console.error('Error creating reading list:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create reading list' },
      { status: 500 }
    )
  }
}
