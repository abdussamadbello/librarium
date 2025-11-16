import { db } from '@/lib/db'
import { books, authors, categories, transactions, bookCopies, reviews, favorites, customShelves, shelfBooks } from '@/lib/db/schema'
import { eq, and, sql, desc, inArray, ne, notInArray } from 'drizzle-orm'

interface RecommendedBook {
  book: typeof books.$inferSelect
  author: typeof authors.$inferSelect | null
  category: typeof categories.$inferSelect | null
  avgRating: number
  reviewCount: number
  score: number // Recommendation score
  reason: string // Why this book is recommended
}

/**
 * Get personalized book recommendations for a user
 * Uses collaborative filtering and content-based filtering
 */
export async function getRecommendationsForUser(
  userId: string,
  limit: number = 10
): Promise<RecommendedBook[]> {
  try {
    // Get user's reading history
    const userHistory = await getUserReadingHistory(userId)
    const borrowedBookIds = userHistory.map(h => h.bookId)

    // Get user's favorite categories and authors
    const preferences = await getUserPreferences(userId)

    // Get recommendations from multiple sources
    const [
      similarBooksRecs,
      categoryRecs,
      authorRecs,
      popularRecs,
    ] = await Promise.all([
      getSimilarBooksRecommendations(borrowedBookIds, limit),
      getCategoryBasedRecommendations(preferences.topCategories, borrowedBookIds, limit),
      getAuthorBasedRecommendations(preferences.topAuthors, borrowedBookIds, limit),
      getPopularRecommendations(borrowedBookIds, limit),
    ])

    // Combine and score recommendations
    const allRecs = new Map<number, RecommendedBook>()

    // Weight different recommendation sources
    const addRecommendations = (recs: RecommendedBook[], weight: number) => {
      recs.forEach(rec => {
        const existing = allRecs.get(rec.book.id)
        if (existing) {
          existing.score += rec.score * weight
        } else {
          allRecs.set(rec.book.id, { ...rec, score: rec.score * weight })
        }
      })
    }

    addRecommendations(similarBooksRecs, 1.5) // Highest weight for similar books
    addRecommendations(categoryRecs, 1.2)
    addRecommendations(authorRecs, 1.3)
    addRecommendations(popularRecs, 0.8) // Lower weight for popular books

    // Sort by score and return top N
    return Array.from(allRecs.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  } catch (error) {
    console.error('Error getting recommendations:', error)
    return []
  }
}

/**
 * Get recommendations based on a specific book (for "You might also like" on book pages)
 */
export async function getSimilarBooks(bookId: number, limit: number = 6): Promise<RecommendedBook[]> {
  try {
    // Get the book details
    const [book] = await db
      .select()
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1)

    if (!book) return []

    // Get books by same author
    const sameAuthorBooks = book.authorId
      ? await db
          .select({
            book: books,
            author: authors,
            category: categories,
            avgRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
            reviewCount: sql<number>`COUNT(${reviews.id})`,
          })
          .from(books)
          .leftJoin(authors, eq(books.authorId, authors.id))
          .leftJoin(categories, eq(books.categoryId, categories.id))
          .leftJoin(reviews, eq(books.id, reviews.bookId))
          .where(and(eq(books.authorId, book.authorId), ne(books.id, bookId)))
          .groupBy(books.id, authors.id, categories.id)
          .orderBy(desc(sql`COALESCE(AVG(${reviews.rating}), 0)`))
          .limit(3)
      : []

    // Get books in same category
    const sameCategoryBooks = book.categoryId
      ? await db
          .select({
            book: books,
            author: authors,
            category: categories,
            avgRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
            reviewCount: sql<number>`COUNT(${reviews.id})`,
          })
          .from(books)
          .leftJoin(authors, eq(books.authorId, authors.id))
          .leftJoin(categories, eq(books.categoryId, categories.id))
          .leftJoin(reviews, eq(books.id, reviews.bookId))
          .where(and(eq(books.categoryId, book.categoryId), ne(books.id, bookId)))
          .groupBy(books.id, authors.id, categories.id)
          .orderBy(desc(sql`COALESCE(AVG(${reviews.rating}), 0)`))
          .limit(4)
      : []

    // Combine and format
    const combined = [
      ...sameAuthorBooks.map(r => ({
        ...r,
        score: 1.0,
        reason: `By the same author: ${r.author?.name}`,
      })),
      ...sameCategoryBooks.map(r => ({
        ...r,
        score: 0.8,
        reason: `In the same category: ${r.category?.name}`,
      })),
    ]

    return combined
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  } catch (error) {
    console.error('Error getting similar books:', error)
    return []
  }
}

/**
 * Get user's reading history with book IDs
 */
async function getUserReadingHistory(userId: string) {
  const history = await db
    .select({
      bookId: bookCopies.bookId,
      checkoutDate: transactions.checkoutDate,
    })
    .from(transactions)
    .leftJoin(bookCopies, eq(transactions.bookCopyId, bookCopies.id))
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.checkoutDate))
    .limit(50)

  return history.filter(h => h.bookId !== null) as Array<{ bookId: number; checkoutDate: Date | null }>
}

/**
 * Get user's preferences (favorite categories and authors)
 */
async function getUserPreferences(userId: string) {
  // Get user's most borrowed categories
  const categoryStats = await db
    .select({
      categoryId: books.categoryId,
      count: sql<number>`COUNT(*)`,
    })
    .from(transactions)
    .leftJoin(bookCopies, eq(transactions.bookCopyId, bookCopies.id))
    .leftJoin(books, eq(bookCopies.bookId, books.id))
    .where(eq(transactions.userId, userId))
    .groupBy(books.categoryId)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(3)

  // Get user's most borrowed authors
  const authorStats = await db
    .select({
      authorId: books.authorId,
      count: sql<number>`COUNT(*)`,
    })
    .from(transactions)
    .leftJoin(bookCopies, eq(transactions.bookCopyId, bookCopies.id))
    .leftJoin(books, eq(bookCopies.bookId, books.id))
    .where(eq(transactions.userId, userId))
    .groupBy(books.authorId)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(3)

  return {
    topCategories: categoryStats
      .filter(s => s.categoryId !== null)
      .map(s => s.categoryId!),
    topAuthors: authorStats
      .filter(s => s.authorId !== null)
      .map(s => s.authorId!),
  }
}

/**
 * Get recommendations based on similar books users have borrowed
 */
async function getSimilarBooksRecommendations(
  borrowedBookIds: number[],
  limit: number
): Promise<RecommendedBook[]> {
  if (borrowedBookIds.length === 0) return []

  // Find other users who borrowed similar books
  const similarUsers = await db
    .select({
      userId: transactions.userId,
      commonBooks: sql<number>`COUNT(DISTINCT ${bookCopies.bookId})`,
    })
    .from(transactions)
    .leftJoin(bookCopies, eq(transactions.bookCopyId, bookCopies.id))
    .where(inArray(bookCopies.bookId, borrowedBookIds))
    .groupBy(transactions.userId)
    .having(sql`COUNT(DISTINCT ${bookCopies.bookId}) >= 2`)
    .orderBy(desc(sql`COUNT(DISTINCT ${bookCopies.bookId})`))
    .limit(10)

  if (similarUsers.length === 0) return []

  const similarUserIds = similarUsers.map(u => u.userId!).filter(id => id !== null)

  // Get books these similar users have borrowed (excluding already borrowed)
  const recommendations = await db
    .select({
      book: books,
      author: authors,
      category: categories,
      avgRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
      reviewCount: sql<number>`COUNT(DISTINCT ${reviews.id})`,
      borrowCount: sql<number>`COUNT(DISTINCT ${transactions.id})`,
    })
    .from(transactions)
    .leftJoin(bookCopies, eq(transactions.bookCopyId, bookCopies.id))
    .leftJoin(books, eq(bookCopies.bookId, books.id))
    .leftJoin(authors, eq(books.authorId, authors.id))
    .leftJoin(categories, eq(books.categoryId, categories.id))
    .leftJoin(reviews, eq(books.id, reviews.bookId))
    .where(
      and(
        inArray(transactions.userId, similarUserIds),
        notInArray(bookCopies.bookId, borrowedBookIds)
      )
    )
    .groupBy(books.id, authors.id, categories.id)
    .orderBy(desc(sql`COUNT(DISTINCT ${transactions.id})`))
    .limit(limit)

  return recommendations
    .filter(r => r.book !== null)
    .map(r => ({
      book: r.book!,
      author: r.author,
      category: r.category,
      avgRating: r.avgRating,
      reviewCount: r.reviewCount,
      score: 1.0,
      reason: 'Popular among similar readers',
    }))
}

/**
 * Get recommendations based on favorite categories
 */
async function getCategoryBasedRecommendations(
  categoryIds: number[],
  excludeBookIds: number[],
  limit: number
): Promise<RecommendedBook[]> {
  if (categoryIds.length === 0) return []

  const recommendations = await db
    .select({
      book: books,
      author: authors,
      category: categories,
      avgRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
      reviewCount: sql<number>`COUNT(${reviews.id})`,
    })
    .from(books)
    .leftJoin(authors, eq(books.authorId, authors.id))
    .leftJoin(categories, eq(books.categoryId, categories.id))
    .leftJoin(reviews, eq(books.id, reviews.bookId))
    .where(
      and(
        inArray(books.categoryId, categoryIds),
        excludeBookIds.length > 0 ? notInArray(books.id, excludeBookIds) : undefined
      )
    )
    .groupBy(books.id, authors.id, categories.id)
    .orderBy(desc(sql`COALESCE(AVG(${reviews.rating}), 0)`))
    .limit(limit)

  return recommendations.map(r => ({
    ...r,
    score: 0.9,
    reason: `You enjoy ${r.category?.name} books`,
  }))
}

/**
 * Get recommendations based on favorite authors
 */
async function getAuthorBasedRecommendations(
  authorIds: number[],
  excludeBookIds: number[],
  limit: number
): Promise<RecommendedBook[]> {
  if (authorIds.length === 0) return []

  const recommendations = await db
    .select({
      book: books,
      author: authors,
      category: categories,
      avgRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
      reviewCount: sql<number>`COUNT(${reviews.id})`,
    })
    .from(books)
    .leftJoin(authors, eq(books.authorId, authors.id))
    .leftJoin(categories, eq(books.categoryId, categories.id))
    .leftJoin(reviews, eq(books.id, reviews.bookId))
    .where(
      and(
        inArray(books.authorId, authorIds),
        excludeBookIds.length > 0 ? notInArray(books.id, excludeBookIds) : undefined
      )
    )
    .groupBy(books.id, authors.id, categories.id)
    .orderBy(desc(sql`COALESCE(AVG(${reviews.rating}), 0)`))
    .limit(limit)

  return recommendations.map(r => ({
    ...r,
    score: 0.95,
    reason: `More from ${r.author?.name}`,
  }))
}

/**
 * Get generally popular and well-rated books
 */
async function getPopularRecommendations(
  excludeBookIds: number[],
  limit: number
): Promise<RecommendedBook[]> {
  const recommendations = await db
    .select({
      book: books,
      author: authors,
      category: categories,
      avgRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
      reviewCount: sql<number>`COUNT(${reviews.id})`,
    })
    .from(books)
    .leftJoin(authors, eq(books.authorId, authors.id))
    .leftJoin(categories, eq(books.categoryId, categories.id))
    .leftJoin(reviews, eq(books.id, reviews.bookId))
    .where(excludeBookIds.length > 0 ? notInArray(books.id, excludeBookIds) : undefined)
    .groupBy(books.id, authors.id, categories.id)
    .having(sql`COUNT(${reviews.id}) >= 3`) // At least 3 reviews
    .orderBy(desc(sql`COALESCE(AVG(${reviews.rating}), 0)`))
    .limit(limit)

  return recommendations.map(r => ({
    ...r,
    score: 0.6,
    reason: 'Highly rated by our community',
  }))
}
