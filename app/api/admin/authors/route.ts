import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { authors } from '@/lib/db/schema'
import { desc, like } from 'drizzle-orm'
import { canAccessAdmin } from '@/lib/auth/roles'
import { authorSchema } from '@/lib/validations/category'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''

    let query = db.select().from(authors).orderBy(desc(authors.createdAt))

    if (search) {
      query = query.where(like(authors.name, `%${search}%`)) as any
    }

    const allAuthors = await query

    return NextResponse.json(allAuthors)
  } catch (error) {
    console.error('Error fetching authors:', error)
    return NextResponse.json({ error: 'Failed to fetch authors' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = authorSchema.parse(body)

    const [newAuthor] = await db
      .insert(authors)
      .values({
        name: validatedData.name,
        bio: validatedData.bio,
        imageUrl: validatedData.imageUrl,
        createdAt: new Date(),
      })
      .returning()

    return NextResponse.json(newAuthor, { status: 201 })
  } catch (error: any) {
    console.error('Error creating author:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Failed to create author' }, { status: 500 })
  }
}
