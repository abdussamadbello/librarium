import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { categories } from '@/lib/db/schema'
import { eq, isNull } from 'drizzle-orm'
import { canAccessAdmin } from '@/lib/auth/roles'
import { categorySchema } from '@/lib/validations/category'

export async function GET(req: NextRequest) {
  try {
    // Categories are public, but we'll check auth for consistency
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all categories with parent-child relationship
    const allCategories = await db.select().from(categories)

    return NextResponse.json(allCategories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = categorySchema.parse(body)

    const [newCategory] = await db
      .insert(categories)
      .values({
        name: validatedData.name,
        description: validatedData.description,
        parentId: validatedData.parentId,
        createdAt: new Date(),
      })
      .returning()

    return NextResponse.json(newCategory, { status: 201 })
  } catch (error: any) {
    console.error('Error creating category:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
