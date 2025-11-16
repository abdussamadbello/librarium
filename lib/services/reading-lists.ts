import { db } from '@/lib/db'
import { customShelves, shelfBooks, books, authors, categories, activityLog } from '@/lib/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'

interface CreateReadingListParams {
  userId: string
  name: string
  description?: string
  isPublic?: boolean
}

interface UpdateReadingListParams {
  listId: number
  userId: string
  name?: string
  description?: string
  isPublic?: boolean
}

interface AddBookToListParams {
  listId: number
  bookId: number
  userId: string
}

interface RemoveBookFromListParams {
  listId: number
  bookId: number
  userId: string
}

/**
 * Create a new reading list
 */
export async function createReadingList(params: CreateReadingListParams) {
  const { userId, name, description, isPublic = false } = params

  try {
    const result = await db.transaction(async (tx) => {
      const [newList] = await tx
        .insert(customShelves)
        .values({
          userId,
          name,
          description: description || null,
          isPublic,
        })
        .returning()

      // Log activity
      await tx.insert(activityLog).values({
        userId,
        action: 'create_reading_list',
        entityType: 'custom_shelf',
        entityId: newList!.id,
        metadata: { name, isPublic },
      })

      return newList!
    })

    return result
  } catch (error) {
    console.error('Error creating reading list:', error)
    throw new Error('Failed to create reading list')
  }
}

/**
 * Get all reading lists for a user
 */
export async function getUserReadingLists(userId: string) {
  try {
    const lists = await db
      .select({
        list: customShelves,
        bookCount: sql<number>`COUNT(${shelfBooks.id})`,
      })
      .from(customShelves)
      .leftJoin(shelfBooks, eq(customShelves.id, shelfBooks.shelfId))
      .where(eq(customShelves.userId, userId))
      .groupBy(customShelves.id)
      .orderBy(desc(customShelves.createdAt))

    return lists
  } catch (error) {
    console.error('Error fetching reading lists:', error)
    return []
  }
}

/**
 * Get a specific reading list with its books
 */
export async function getReadingListWithBooks(listId: number, userId: string) {
  try {
    // Get the list
    const [list] = await db
      .select()
      .from(customShelves)
      .where(eq(customShelves.id, listId))
      .limit(1)

    if (!list) {
      throw new Error('Reading list not found')
    }

    // Check ownership
    if (list.userId !== userId && !list.isPublic) {
      throw new Error('Unauthorized')
    }

    // Get books in the list
    const booksInList = await db
      .select({
        shelfBook: shelfBooks,
        book: books,
        author: authors,
        category: categories,
      })
      .from(shelfBooks)
      .leftJoin(books, eq(shelfBooks.bookId, books.id))
      .leftJoin(authors, eq(books.authorId, authors.id))
      .leftJoin(categories, eq(books.categoryId, categories.id))
      .where(eq(shelfBooks.shelfId, listId))
      .orderBy(desc(shelfBooks.addedAt))

    return {
      list,
      books: booksInList,
    }
  } catch (error) {
    console.error('Error fetching reading list:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to fetch reading list')
  }
}

/**
 * Update a reading list
 */
export async function updateReadingList(params: UpdateReadingListParams) {
  const { listId, userId, name, description, isPublic } = params

  try {
    // Verify ownership
    const [list] = await db
      .select()
      .from(customShelves)
      .where(eq(customShelves.id, listId))
      .limit(1)

    if (!list) {
      throw new Error('Reading list not found')
    }

    if (list.userId !== userId) {
      throw new Error('Unauthorized')
    }

    // Update the list
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (isPublic !== undefined) updateData.isPublic = isPublic

    const [updated] = await db
      .update(customShelves)
      .set(updateData)
      .where(eq(customShelves.id, listId))
      .returning()

    return updated
  } catch (error) {
    console.error('Error updating reading list:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to update reading list')
  }
}

/**
 * Delete a reading list
 */
export async function deleteReadingList(listId: number, userId: string) {
  try {
    // Verify ownership
    const [list] = await db
      .select()
      .from(customShelves)
      .where(eq(customShelves.id, listId))
      .limit(1)

    if (!list) {
      throw new Error('Reading list not found')
    }

    if (list.userId !== userId) {
      throw new Error('Unauthorized')
    }

    // Delete the list (cascade will delete shelf_books)
    await db.delete(customShelves).where(eq(customShelves.id, listId))

    return { success: true }
  } catch (error) {
    console.error('Error deleting reading list:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to delete reading list')
  }
}

/**
 * Add a book to a reading list
 */
export async function addBookToList(params: AddBookToListParams) {
  const { listId, bookId, userId } = params

  try {
    // Verify list ownership
    const [list] = await db
      .select()
      .from(customShelves)
      .where(eq(customShelves.id, listId))
      .limit(1)

    if (!list) {
      throw new Error('Reading list not found')
    }

    if (list.userId !== userId) {
      throw new Error('Unauthorized')
    }

    // Check if book already in list
    const existing = await db
      .select()
      .from(shelfBooks)
      .where(and(eq(shelfBooks.shelfId, listId), eq(shelfBooks.bookId, bookId)))
      .limit(1)

    if (existing.length > 0) {
      throw new Error('Book already in this list')
    }

    // Add book to list
    const result = await db.transaction(async (tx) => {
      const [newEntry] = await tx
        .insert(shelfBooks)
        .values({
          shelfId: listId,
          bookId,
        })
        .returning()

      // Log activity
      await tx.insert(activityLog).values({
        userId,
        action: 'add_book_to_list',
        entityType: 'shelf_book',
        entityId: newEntry!.id,
        metadata: { listId, bookId, listName: list.name },
      })

      return newEntry!
    })

    return result
  } catch (error) {
    console.error('Error adding book to list:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to add book to list')
  }
}

/**
 * Remove a book from a reading list
 */
export async function removeBookFromList(params: RemoveBookFromListParams) {
  const { listId, bookId, userId } = params

  try {
    // Verify list ownership
    const [list] = await db
      .select()
      .from(customShelves)
      .where(eq(customShelves.id, listId))
      .limit(1)

    if (!list) {
      throw new Error('Reading list not found')
    }

    if (list.userId !== userId) {
      throw new Error('Unauthorized')
    }

    // Remove book from list
    await db
      .delete(shelfBooks)
      .where(and(eq(shelfBooks.shelfId, listId), eq(shelfBooks.bookId, bookId)))

    return { success: true }
  } catch (error) {
    console.error('Error removing book from list:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to remove book from list')
  }
}

/**
 * Check if a book is in any of user's lists
 */
export async function getListsContainingBook(userId: string, bookId: number) {
  try {
    const lists = await db
      .select({
        list: customShelves,
      })
      .from(shelfBooks)
      .leftJoin(customShelves, eq(shelfBooks.shelfId, customShelves.id))
      .where(
        and(
          eq(shelfBooks.bookId, bookId),
          eq(customShelves.userId, userId)
        )
      )

    return lists.map(l => l.list)
  } catch (error) {
    console.error('Error checking book lists:', error)
    return []
  }
}
