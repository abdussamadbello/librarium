import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { books, authors, categories, reviews } from '@/lib/db/schema'
import { eq, like, or, and, gte, lte, desc, asc, sql } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    // Search parameters
    const query = searchParams.get('q') || ''
    const categoryId = searchParams.get('category')
    const authorId = searchParams.get('author')
    const language = searchParams.get('language')
    const tags = searchParams.get('tags') // Comma-separated tags
    const minRating = searchParams.get('minRating')
    const yearFrom = searchParams.get('yearFrom')
    const yearTo = searchParams.get('yearTo')
    const availability = searchParams.get('availability') // 'available', 'all'
    const sortBy = searchParams.get('sortBy') || 'relevance' // title, year, author, rating, newest, relevance
    const sortOrder = searchParams.get('sortOrder') || 'desc' // asc, desc
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where conditions
    const conditions: any[] = []

    // Text search - search in title, author name, ISBN, description, and tags
    if (query) {
      conditions.push(
        or(
          like(books.title, `%${query}%`),
          like(books.isbn, `%${query}%`),
          like(books.description, `%${query}%`),
          like(authors.name, `%${query}%`),
          sql`${books.tags}::text LIKE ${`%${query}%`}`
        )
      )
    }

    // Category filter
    if (categoryId) {
      conditions.push(eq(books.categoryId, parseInt(categoryId)))
    }

    // Author filter
    if (authorId) {
      conditions.push(eq(books.authorId, parseInt(authorId)))
    }

    // Language filter
    if (language && language !== 'all') {
      conditions.push(eq(books.language, language))
    }

    // Tags filter - check if any of the provided tags match
    if (tags) {
      const tagList = tags.split(',').map(t => t.trim())
      conditions.push(
        sql`EXISTS (
          SELECT 1 FROM jsonb_array_elements_text(${books.tags}) AS tag
          WHERE tag = ANY(${tagList})
        )`
      )
    }

    // Year range filter
    if (yearFrom) {
      conditions.push(gte(books.publicationYear, parseInt(yearFrom)))
    }
    if (yearTo) {
      conditions.push(lte(books.publicationYear, parseInt(yearTo)))
    }

    // Availability filter
    if (availability === 'available') {
      conditions.push(sql`${books.availableCopies} > 0`)
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // Build order by with rating and relevance support
    let orderByClause
    const direction = sortOrder === 'desc' ? desc : asc

    switch (sortBy) {
      case 'year':
        orderByClause = direction(books.publicationYear)
        break
      case 'author':
        orderByClause = direction(authors.name)
        break
      case 'rating':
        orderByClause = direction(sql`COALESCE(avg_rating, 0)`)
        break
      case 'newest':
        orderByClause = desc(books.createdAt)
        break
      case 'relevance':
        // When searching, order by relevance (title matches first, then others)
        if (query) {
          orderByClause = sql`
            CASE
              WHEN ${books.title} ILIKE ${`%${query}%`} THEN 1
              WHEN ${authors.name} ILIKE ${`%${query}%`} THEN 2
              WHEN ${books.description} ILIKE ${`%${query}%`} THEN 3
              ELSE 4
            END, ${books.title} ASC
          `
        } else {
          orderByClause = desc(books.createdAt) // Default to newest if no query
        }
        break
      default:
        orderByClause = direction(books.title)
    }

    // Fetch books with filters and rating aggregation
    const results = await db
      .select({
        book: {
          id: books.id,
          title: books.title,
          isbn: books.isbn,
          publisher: books.publisher,
          publicationYear: books.publicationYear,
          language: books.language,
          description: books.description,
          coverImageUrl: books.coverImageUrl,
          totalCopies: books.totalCopies,
          availableCopies: books.availableCopies,
          tags: books.tags,
          createdAt: books.createdAt,
        },
        author: {
          id: authors.id,
          name: authors.name,
        },
        category: {
          id: categories.id,
          name: categories.name,
        },
        avgRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`.as('avg_rating'),
        reviewCount: sql<number>`COUNT(${reviews.id})`.as('review_count'),
      })
      .from(books)
      .leftJoin(authors, eq(books.authorId, authors.id))
      .leftJoin(categories, eq(books.categoryId, categories.id))
      .leftJoin(reviews, eq(books.id, reviews.bookId))
      .where(whereClause)
      .groupBy(books.id, authors.id, categories.id)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset)

    // Filter by minimum rating if specified (post-aggregation)
    let filteredResults = results
    if (minRating) {
      const minRatingNum = parseFloat(minRating)
      filteredResults = results.filter(r => r.avgRating >= minRatingNum)
    }

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(DISTINCT ${books.id})::int` })
      .from(books)
      .leftJoin(authors, eq(books.authorId, authors.id))
      .leftJoin(reviews, eq(books.id, reviews.bookId))
      .where(whereClause)

    let total = countResult[0]?.count || 0

    // Adjust total if filtering by rating
    if (minRating) {
      total = filteredResults.length
    }

    // Get unique languages for filter options
    const languagesResult = await db
      .selectDistinct({ language: books.language })
      .from(books)
      .where(sql`${books.language} IS NOT NULL`)

    const languages = languagesResult
      .map(r => r.language)
      .filter(l => l !== null)
      .sort()

    // Get unique tags for filter options
    const tagsResult = await db
      .select({ tags: books.tags })
      .from(books)
      .where(sql`${books.tags} IS NOT NULL`)

    const allTags = new Set<string>()
    tagsResult.forEach(r => {
      if (r.tags && Array.isArray(r.tags)) {
        r.tags.forEach(tag => allTags.add(tag))
      }
    })

    return NextResponse.json({
      results: filteredResults,
      total,
      limit,
      offset,
      filters: {
        languages,
        tags: Array.from(allTags).sort(),
      },
    })
  } catch (error) {
    console.error('Error searching books:', error)
    return NextResponse.json({ error: 'Failed to search books' }, { status: 500 })
  }
}
