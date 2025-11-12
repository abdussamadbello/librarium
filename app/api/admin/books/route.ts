import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { books, authors, categories, bookCopies, activityLog } from '@/lib/db/schema'
import { eq, like, or, desc, sql } from 'drizzle-orm'
import { canAccessAdmin } from '@/lib/auth/roles'
import { bookSchema } from '@/lib/validations/book'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = db
      .select({
        book: books,
        author: authors,
        category: categories,
      })
      .from(books)
      .leftJoin(authors, eq(books.authorId, authors.id))
      .leftJoin(categories, eq(books.categoryId, categories.id))
      .orderBy(desc(books.createdAt))
      .limit(limit)
      .offset(offset)

    // Apply search filter
    if (search) {
      query = query.where(
        or(
          like(books.title, `%${search}%`),
          like(books.isbn, `%${search}%`),
          like(authors.name, `%${search}%`)
        )
      ) as any
    }

    // Apply category filter
    if (categoryId) {
      query = query.where(eq(books.categoryId, parseInt(categoryId))) as any
    }

    const result = await query

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(books)

    return NextResponse.json({
      books: result,
      total: countResult?.count || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching books:', error)
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = bookSchema.parse(body)

    const result = await db.transaction(async (tx) => {
      // Create book
      const [newBook] = await tx
        .insert(books)
        .values({
          ...validatedData,
          availableCopies: validatedData.totalCopies,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()

      // Create book copies
      const copies = []
      for (let i = 1; i <= validatedData.totalCopies; i++) {
        copies.push({
          bookId: newBook!.id,
          copyNumber: i,
          status: 'available' as const,
          condition: 'new' as const,
        })
      }

      await tx.insert(bookCopies).values(copies)

      // Log activity
      await tx.insert(activityLog).values({
        userId: session.user.id,
        action: 'create_book',
        entityType: 'book',
        entityId: newBook!.id,
        metadata: { title: newBook!.title, copies: validatedData.totalCopies },
      })

      return newBook!
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    console.error('Error creating book:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create book' }, { status: 500 })
  }
}
