import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { categories, books } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'
import { canAccessAdmin } from '@/lib/auth/roles'
import { categorySchema } from '@/lib/validations/category'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const categoryId = parseInt(id)

    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId))

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Get book count for this category
    const [bookCount] = await db
      .select({ count: count() })
      .from(books)
      .where(eq(books.categoryId, categoryId))

    return NextResponse.json({
      ...category,
      bookCount: bookCount?.count ?? 0,
    })
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const categoryId = parseInt(id)
    const body = await req.json()
    const validatedData = categorySchema.parse(body)

    const [updatedCategory] = await db
      .update(categories)
      .set({
        name: validatedData.name,
        description: validatedData.description,
        parentId: validatedData.parentId,
      })
      .where(eq(categories.id, categoryId))
      .returning()

    if (!updatedCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json(updatedCategory)
  } catch (error: any) {
    console.error('Error updating category:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const categoryId = parseInt(id)

    // Check if category has books
    const [bookCount] = await db
      .select({ count: count() })
      .from(books)
      .where(eq(books.categoryId, categoryId))

    if ((bookCount?.count ?? 0) > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${bookCount?.count ?? 0} associated books` },
        { status: 400 }
      )
    }

    // Check if category has child categories
    const [childCount] = await db
      .select({ count: count() })
      .from(categories)
      .where(eq(categories.parentId, categoryId))

    if ((childCount?.count ?? 0) > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${childCount?.count ?? 0} subcategories` },
        { status: 400 }
      )
    }

    const [deletedCategory] = await db
      .delete(categories)
      .where(eq(categories.id, categoryId))
      .returning()

    if (!deletedCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
