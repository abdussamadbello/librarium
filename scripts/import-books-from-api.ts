/**
 * Import Books from Free APIs
 *
 * This script fetches real book data from Open Library and Google Books APIs
 * to populate the Librarium database with 200+ books.
 *
 * Usage:
 *   pnpm tsx scripts/import-books-from-api.ts
 *   pnpm tsx scripts/import-books-from-api.ts --limit 200
 *   pnpm tsx scripts/import-books-from-api.ts --source openlibrary
 */

import { db } from '../lib/db'
import { books, authors, categories, bookCopies } from '../lib/db/schema'
import { eq } from 'drizzle-orm'

interface BookData {
  title: string
  isbn: string | null
  isbn13: string | null
  author: string
  publisher: string | null
  publishYear: number | null
  description: string | null
  coverImage: string | null
  pageCount: number | null
  language: string
  subjects: string[]
}

// Curated list of popular books across genres
const BOOK_QUERIES = [
  // Fiction Classics
  'Pride and Prejudice',
  'To Kill a Mockingbird',
  '1984',
  'The Great Gatsby',
  'Jane Eyre',
  'Wuthering Heights',
  'The Catcher in the Rye',
  'Animal Farm',
  'Lord of the Flies',
  'Brave New World',

  // Fantasy & Sci-Fi
  'The Hobbit',
  'Dune',
  'Foundation',
  'Ender\'s Game',
  'Neuromancer',
  'Snow Crash',
  'The Left Hand of Darkness',
  'A Wizard of Earthsea',

  // Mystery & Thriller
  'The Girl with the Dragon Tattoo',
  'Gone Girl',
  'The Da Vinci Code',
  'And Then There Were None',
  'The Silence of the Lambs',

  // Non-Fiction
  'Sapiens',
  'Educated',
  'Becoming',
  'The Immortal Life of Henrietta Lacks',
  'Thinking Fast and Slow',
  'Freakonomics',
  'A Brief History of Time',
  'The Selfish Gene',
  'Guns Germs and Steel',

  // Technology & Programming
  'Clean Code',
  'The Pragmatic Programmer',
  'Design Patterns',
  'Introduction to Algorithms',
  'Structure and Interpretation of Computer Programs',
  'Code Complete',
  'Refactoring',
  'The Mythical Man-Month',

  // Business & Self-Help
  'Think and Grow Rich',
  'How to Win Friends and Influence People',
  'The 7 Habits of Highly Effective People',
  'Atomic Habits',
  'The Lean Startup',
  'Zero to One',

  // History & Biography
  'The Diary of a Young Girl',
  'Long Walk to Freedom',
  'Steve Jobs',
  'Einstein: His Life and Universe',
  'The Wright Brothers',

  // Science
  'The Origin of Species',
  'Silent Spring',
  'Cosmos',
  'A Short History of Nearly Everything',
  'The Double Helix',

  // Philosophy & Social Science
  'The Republic',
  'Meditations',
  'The Prince',
  'The Communist Manifesto',
  'The Wealth of Nations',
]

/**
 * Fetch book data from Open Library API
 */
async function fetchFromOpenLibrary(query: string): Promise<BookData | null> {
  try {
    const searchUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=1`
    const response = await fetch(searchUrl)

    if (!response.ok) {
      console.error(`❌ Open Library API error: ${response.status}`)
      return null
    }

    const data = await response.json()

    if (!data.docs || data.docs.length === 0) {
      console.log(`⚠️  No results for: ${query}`)
      return null
    }

    const book = data.docs[0]

    // Get cover image URL
    const coverId = book.cover_i
    const coverImage = coverId
      ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
      : null

    // Extract ISBNs
    const isbn = book.isbn?.[0] || null
    const isbn13 = book.isbn?.find((i: string) => i.length === 13) || null

    // Get author name
    const authorName = book.author_name?.[0] || 'Unknown Author'

    // Get subjects for categorization
    const subjects = book.subject?.slice(0, 5) || []

    return {
      title: book.title,
      isbn,
      isbn13,
      author: authorName,
      publisher: book.publisher?.[0] || null,
      publishYear: book.first_publish_year || null,
      description: null, // Open Library search doesn't include description
      coverImage,
      pageCount: book.number_of_pages_median || null,
      language: book.language?.[0] || 'eng',
      subjects,
    }
  } catch (error) {
    console.error(`❌ Error fetching from Open Library:`, error)
    return null
  }
}

/**
 * Fetch detailed book info from Open Library Works API
 */
async function fetchBookDetails(workId: string): Promise<{ description: string | null }> {
  try {
    const url = `https://openlibrary.org${workId}.json`
    const response = await fetch(url)

    if (!response.ok) return { description: null }

    const data = await response.json()

    let description = null
    if (data.description) {
      description = typeof data.description === 'string'
        ? data.description
        : data.description.value
    }

    return { description }
  } catch {
    return { description: null }
  }
}

/**
 * Fetch book data from Google Books API (optional, requires API key)
 */
async function fetchFromGoogleBooks(query: string, apiKey?: string): Promise<BookData | null> {
  if (!apiKey) return null

  try {
    const searchUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${apiKey}&maxResults=1`
    const response = await fetch(searchUrl)

    if (!response.ok) {
      console.error(`❌ Google Books API error: ${response.status}`)
      return null
    }

    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      return null
    }

    const book = data.items[0].volumeInfo

    // Extract ISBNs
    const isbn13 = book.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13')?.identifier || null
    const isbn = book.industryIdentifiers?.find((id: any) => id.type === 'ISBN_10')?.identifier || null

    return {
      title: book.title,
      isbn,
      isbn13,
      author: book.authors?.[0] || 'Unknown Author',
      publisher: book.publisher || null,
      publishYear: book.publishedDate ? parseInt(book.publishedDate.substring(0, 4)) : null,
      description: book.description || null,
      coverImage: book.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
      pageCount: book.pageCount || null,
      language: book.language || 'en',
      subjects: book.categories || [],
    }
  } catch (error) {
    console.error(`❌ Error fetching from Google Books:`, error)
    return null
  }
}

/**
 * Get or create author
 */
async function getOrCreateAuthor(authorName: string): Promise<number> {
  // Check if author exists
  const existing = await db
    .select()
    .from(authors)
    .where(eq(authors.name, authorName))
    .limit(1)

  if (existing.length > 0) {
    return existing[0]!.id
  }

  // Create new author
  const [newAuthor] = await db
    .insert(authors)
    .values({
      name: authorName,
      bio: null,
      imageUrl: null,
    })
    .returning()

  return newAuthor!.id
}

/**
 * Get or create category based on subjects
 */
async function getOrCreateCategory(subjects: string[]): Promise<number> {
  // Default to "General" category if no subjects
  if (subjects.length === 0) {
    const generalCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.name, 'General'))
      .limit(1)

    if (generalCategory.length > 0) {
      return generalCategory[0]!.id
    }

    // Create General category
    const [newCategory] = await db
      .insert(categories)
      .values({
        name: 'General',
        description: 'General books',
        parentId: null,
      })
      .returning()

    return newCategory!.id
  }

  // Map subjects to categories
  const subjectKeywords = {
    Fiction: ['fiction', 'novel', 'literature', 'romance', 'mystery', 'thriller'],
    Technology: ['technology', 'computer', 'programming', 'software', 'web', 'digital'],
    Science: ['science', 'biology', 'physics', 'chemistry', 'astronomy', 'nature'],
    History: ['history', 'historical', 'war', 'ancient', 'medieval'],
    Biography: ['biography', 'autobiography', 'memoir', 'life'],
    Business: ['business', 'economics', 'finance', 'management', 'entrepreneurship'],
    Philosophy: ['philosophy', 'ethics', 'metaphysics', 'logic'],
    'Self-Help': ['self-help', 'motivation', 'personal development', 'success'],
  }

  // Find matching category
  let categoryName = 'General'

  for (const subject of subjects) {
    const lowerSubject = subject.toLowerCase()
    for (const [category, keywords] of Object.entries(subjectKeywords)) {
      if (keywords.some(keyword => lowerSubject.includes(keyword))) {
        categoryName = category
        break
      }
    }
    if (categoryName !== 'General') break
  }

  // Get or create category
  const existing = await db
    .select()
    .from(categories)
    .where(eq(categories.name, categoryName))
    .limit(1)

  if (existing.length > 0) {
    return existing[0]!.id
  }

  // Create category
  const [newCategory] = await db
    .insert(categories)
    .values({
      name: categoryName,
      description: `Books about ${categoryName.toLowerCase()}`,
      parentId: null,
    })
    .returning()

  return newCategory!.id
}

/**
 * Import a single book to the database
 */
async function importBook(bookData: BookData): Promise<boolean> {
  try {
    // Check if book already exists (by title or ISBN)
    let existing = null

    if (bookData.isbn13) {
      existing = await db
        .select()
        .from(books)
        .where(eq(books.isbn, bookData.isbn13))
        .limit(1)
    }

    if (!existing || existing.length === 0) {
      existing = await db
        .select()
        .from(books)
        .where(eq(books.title, bookData.title))
        .limit(1)
    }

    if (existing && existing.length > 0) {
      console.log(`⏭️  Already exists: ${bookData.title}`)
      return false
    }

    // Get or create author
    const authorId = await getOrCreateAuthor(bookData.author)

    // Get or create category
    const categoryId = await getOrCreateCategory(bookData.subjects)

    // Insert book
    const [newBook] = await db
      .insert(books)
      .values({
        title: bookData.title,
        authorId,
        categoryId,
        isbn: bookData.isbn13 || bookData.isbn,
        publisher: bookData.publisher,
        publicationYear: bookData.publishYear,
        description: bookData.description,
        coverImageUrl: bookData.coverImage,
        language: bookData.language,
        availableCopies: 3, // Start with 3 copies
        totalCopies: 3,
        tags: bookData.subjects,
      })
      .returning()

    // Create book copies (3 copies per book)
    for (let i = 1; i <= 3; i++) {
      await db.insert(bookCopies).values({
        bookId: newBook!.id,
        copyNumber: i,
        status: 'available',
        condition: i === 1 ? 'new' : 'good',
        qrCode: `BOOK-${newBook!.id}-COPY-${i}`,
      })
    }

    console.log(`✅ Imported: ${bookData.title} by ${bookData.author}`)
    return true
  } catch (error) {
    console.error(`❌ Error importing book:`, error)
    return false
  }
}

/**
 * Main import function
 */
async function main() {
  const args = process.argv.slice(2)
  const limitIndex = args.indexOf('--limit')
  const limit = limitIndex >= 0 ? parseInt(args[limitIndex + 1] || '200') : 200

  const sourceIndex = args.indexOf('--source')
  const source = sourceIndex >= 0 ? args[sourceIndex + 1] : 'openlibrary'

  const googleApiKey = process.env.GOOGLE_BOOKS_API_KEY

  console.log(`\n🚀 Starting book import...`)
  console.log(`📊 Target: ${limit} books`)
  console.log(`🔌 Source: ${source}`)
  console.log(`\n`)

  let imported = 0
  let skipped = 0
  let failed = 0

  for (const query of BOOK_QUERIES) {
    if (imported >= limit) break

    console.log(`\n📖 Searching: ${query}`)

    // Fetch book data
    let bookData: BookData | null = null

    if (source === 'google' && googleApiKey) {
      bookData = await fetchFromGoogleBooks(query, googleApiKey)
    }

    if (!bookData) {
      bookData = await fetchFromOpenLibrary(query)
    }

    if (!bookData) {
      console.log(`⚠️  Not found: ${query}`)
      failed++
      continue
    }

    // Import to database
    const success = await importBook(bookData)

    if (success) {
      imported++
    } else {
      skipped++
    }

    // Rate limiting: wait 100ms between requests
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log(`\n`)
  console.log(`📊 ========== IMPORT SUMMARY ==========`)
  console.log(`✅ Imported: ${imported} books`)
  console.log(`⏭️  Skipped: ${skipped} books (already exist)`)
  console.log(`❌ Failed: ${failed} books (not found)`)
  console.log(`📚 Total: ${imported + skipped + failed} books processed`)
  console.log(`\n`)
}

// Run the import
main()
  .then(() => {
    console.log('✅ Import complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Import failed:', error)
    process.exit(1)
  })
