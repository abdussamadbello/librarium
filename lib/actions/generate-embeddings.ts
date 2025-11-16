'use server';

import { db } from '@/lib/db';
import { books, bookEmbeddings } from '@/lib/db/schema';
import { generateEmbedding, chunkText, estimateTokens } from '@/lib/ai/embeddings';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

/**
 * Generate embeddings for a single book
 * This should be run when a new book is added
 */
export async function generateBookEmbeddings(bookId: number) {
  try {
    // Fetch book with related data
    const result = await db.select().from(books).where(eq(books.id, bookId)).limit(1);
    const book = result[0];

    if (!book) {
      throw new Error(`Book with ID ${bookId} not found`);
    }

    // Delete existing embeddings for this book
    await db.delete(bookEmbeddings).where(eq(bookEmbeddings.bookId, bookId));

    // Prepare comprehensive text for embedding
    const bookText = `
Title: ${book.title}
Author: ${(book as any).author?.name || 'Unknown'}
Category: ${(book as any).category?.name || 'Uncategorized'}
ISBN: ${book.isbn || 'N/A'}
Publisher: ${book.publisher || 'Unknown'}
Year: ${book.publicationYear || 'Unknown'}
Language: ${book.language || 'Unknown'}
Description: ${book.description || 'No description available'}
Tags: ${book.tags?.join(', ') || 'None'}
Location: ${book.shelfLocation || 'Unknown'}
    `.trim();

    // Create chunks
    const chunks = chunkText(bookText, 500);

    // Generate embeddings for each chunk
    const embeddingsToInsert: any[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      if (!chunk) continue;
      
      const embedding = await generateEmbedding(chunk);
      
      embeddingsToInsert.push({
        bookId: book.id,
        content: chunk,
        embedding: sql`${`[${embedding.join(',')}]`}::vector`,
        metadata: {
          chunkIndex: i,
          type: 'description' as const,
          tokens: estimateTokens(chunk),
        },
      });

      // Rate limiting: wait 100ms between API calls
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Bulk insert embeddings
    if (embeddingsToInsert.length > 0) {
      await db.insert(bookEmbeddings).values(embeddingsToInsert);
    }

    return {
      success: true,
      bookId,
      chunksCreated: chunks.length,
    };
  } catch (error) {
    console.error('Error generating book embeddings:', error);
    throw error;
  }
}

/**
 * Generate embeddings for all books in the library
 * Use with caution - can be expensive and time-consuming
 */
export async function generateAllBookEmbeddings() {
  const allBooks = await db.select({ id: books.id }).from(books);
  
  const results = {
    total: allBooks.length,
    succeeded: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const book of allBooks) {
    try {
      await generateBookEmbeddings(book.id);
      results.succeeded++;
      console.log(`✓ Generated embeddings for book ${book.id}`);
    } catch (error) {
      results.failed++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      results.errors.push(`Book ${book.id}: ${errorMessage}`);
      console.error(`✗ Failed to generate embeddings for book ${book.id}:`, error);
    }

    // Rate limiting: wait 500ms between books
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return results;
}
