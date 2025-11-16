import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { generateEmbedding } from './embeddings';

export interface SearchResult {
  bookId: number;
  bookTitle: string;
  content: string;
  similarity: number;
  isbn: string | null;
  author: string | null;
  coverImage: string | null;
  availableCopies: number;
}

/**
 * Find relevant book content using semantic search
 * Uses cosine similarity with pgvector
 */
export async function findRelevantContent(
  query: string,
  limit = 5,
  similarityThreshold = 0.7
): Promise<SearchResult[]> {
  try {
    // Generate embedding for the search query
    const queryEmbedding = await generateEmbedding(query);
    
    // Convert embedding array to PostgreSQL vector format
    const vectorString = `[${queryEmbedding.join(',')}]`;

    // Perform semantic search using cosine similarity
    // The <=> operator computes cosine distance (1 - cosine similarity)
    const results = await db.execute(sql`
      SELECT 
        be.book_id as "bookId",
        b.title as "bookTitle",
        be.content,
        b.isbn,
        a.name as author,
        b.cover_image_url as "coverImage",
        b.available_copies as "availableCopies",
        1 - (be.embedding <=> ${vectorString}::vector) as similarity
      FROM book_embeddings be
      INNER JOIN books b ON b.id = be.book_id
      LEFT JOIN authors a ON a.id = b.author_id
      WHERE 1 - (be.embedding <=> ${vectorString}::vector) > ${similarityThreshold}
      ORDER BY be.embedding <=> ${vectorString}::vector
      LIMIT ${limit}
    `);

    return (Array.isArray(results) ? results : results.rows) as unknown as SearchResult[];
  } catch (error) {
    console.error('Error in semantic search:', error);
    throw error;
  }
}

/**
 * Find books similar to a given book
 * Useful for "You might also like..." features
 */
export async function findSimilarBooks(
  bookId: number,
  limit = 5
): Promise<SearchResult[]> {
  try {
    // Get average embedding for the book
    const avgEmbedding = await db.execute(sql`
      SELECT embedding
      FROM book_embeddings
      WHERE book_id = ${bookId}
      LIMIT 1
    `);

    const rows = Array.isArray(avgEmbedding) ? avgEmbedding : avgEmbedding.rows;
    if (!rows || rows.length === 0) {
      return [];
    }

    const embedding = (rows[0] as any).embedding;
    const vectorString = `${embedding}`;

    const results = await db.execute(sql`
      SELECT DISTINCT
        be.book_id as "bookId",
        b.title as "bookTitle",
        be.content,
        b.isbn,
        a.name as author,
        b.cover_image_url as "coverImage",
        b.available_copies as "availableCopies",
        1 - (be.embedding <=> ${vectorString}::vector) as similarity
      FROM book_embeddings be
      INNER JOIN books b ON b.id = be.book_id
      LEFT JOIN authors a ON a.id = b.author_id
      WHERE be.book_id != ${bookId}
      ORDER BY be.embedding <=> ${vectorString}::vector
      LIMIT ${limit}
    `);

    return (Array.isArray(results) ? results : results.rows) as unknown as SearchResult[];
  } catch (error) {
    console.error('Error finding similar books:', error);
    throw error;
  }
}
