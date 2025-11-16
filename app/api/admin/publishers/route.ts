import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { publishers } from '@/lib/db/schema'
import { desc, like } from 'drizzle-orm'
import { canAccessAdmin } from '@/lib/auth/roles'
import { publisherSchema } from '@/lib/validations/category'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''

    let query = db.select().from(publishers).orderBy(desc(publishers.createdAt))

    if (search) {
      query = query.where(like(publishers.name, `%${search}%`)) as any
    }

    const allPublishers = await query

    return NextResponse.json(allPublishers)
  } catch (error) {
    console.error('Error fetching publishers:', error)
    return NextResponse.json({ error: 'Failed to fetch publishers' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = publisherSchema.parse(body)

    const [newPublisher] = await db
      .insert(publishers)
      .values({
        name: validatedData.name,
        description: validatedData.description || null,
        website: validatedData.website || null,
        contactEmail: validatedData.contactEmail || null,
        createdAt: new Date(),
      })
      .returning()

    return NextResponse.json(newPublisher, { status: 201 })
  } catch (error: any) {
    console.error('Error creating publisher:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    if (error.code === '23505') {
      // Unique constraint violation
      return NextResponse.json(
        { error: 'Publisher with this name already exists' },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Failed to create publisher' }, { status: 500 })
  }
}
