# RAG Chatbot Implementation Guide - Librarium

**Feature:** AI Book Chat Assistant  
**Date:** November 16, 2025  
**Priority:** Tier 3 (Impact: 9, Effort: 8, Score: 1.1)  
**Status:** Planning - Not Started

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Database Schema](#database-schema)
5. [Implementation Steps](#implementation-steps)
6. [API Endpoints](#api-endpoints)
7. [UI Components](#ui-components)
8. [Cost Analysis](#cost-analysis)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Checklist](#deployment-checklist)
11. [Future Enhancements](#future-enhancements)

---

## Overview

### What is This Feature?

A **Retrieval Augmented Generation (RAG)** chatbot that allows library members to have intelligent conversations about books in your collection. The system uses AI embeddings and semantic search to provide accurate, context-aware responses based on book metadata, descriptions, and content.

### User Story (JTBD)

> "As a member, I want to chat with an AI assistant about books so I can discover relevant titles based on my interests, get summaries, and find exactly what I'm looking for without browsing through hundreds of books."

### Key Benefits

- **Enhanced Discovery:** Members find books through natural conversation
- **Reduced Librarian Workload:** AI handles common queries 24/7
- **Better Engagement:** Interactive experience increases member satisfaction
- **Competitive Advantage:** Modern AI feature differentiates your library
- **Data Insights:** Learn what members are interested in

### Example Interactions

```
Member: "I'm looking for a mystery novel set in Victorian England"
AI: "Based on our collection, I recommend 'The Hound of the Baskervilles' by 
     Arthur Conan Doyle. It's a classic Sherlock Holmes mystery set in 1889..."

Member: "Tell me about books on artificial intelligence for beginners"
AI: "We have 'Life 3.0' by Max Tegmark, which provides an accessible introduction 
     to AI and its future implications. It's currently available with 2 copies..."
```

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Member Chat Interface                     │
│                  (React Component + useChat)                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Chat API Route (/api/member/chat)               │
│          (Handles streaming, context retrieval)              │
└──────────────────────┬──────────────────────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
┌──────────────────┐      ┌──────────────────────┐
│ Embedding Service│      │  Vector DB Search    │
│  (OpenAI API)    │      │  (pgvector + SQL)    │
└──────────────────┘      └──────────────────────┘
         │                           │
         └─────────────┬─────────────┘
                       ▼
         ┌──────────────────────────┐
         │  PostgreSQL Database     │
         │  - book_embeddings       │
         │  - chat_conversations    │
         │  - books (existing)      │
         └──────────────────────────┘
```

### Data Flow

1. **Member sends message** → Chat UI
2. **Message sent to API** → `/api/member/chat`
3. **Query embedding created** → OpenAI Embeddings API
4. **Semantic search performed** → PostgreSQL with pgvector
5. **Relevant chunks retrieved** → Top 5 most similar book content
6. **Context + Query sent to LLM** → OpenAI GPT-4
7. **Streaming response returned** → Chat UI updates in real-time

---

## Prerequisites

### Required Services

1. **OpenAI API Account**
   - Sign up at https://platform.openai.com/
   - Generate API key
   - Add credits ($5-10 minimum recommended)

2. **PostgreSQL with pgvector**
   - Already set up in your project ✅
   - Need to enable pgvector extension

### Required NPM Packages

```bash
pnpm add ai @ai-sdk/openai pgvector
```

**Package Details:**
- `ai` (v3.x): Vercel AI SDK for streaming chat responses
- `@ai-sdk/openai` (v0.x): OpenAI provider for embeddings and completions
- `pgvector` (v0.x): PostgreSQL vector extension type support

### Environment Variables

Add to `.env`:

```bash
# OpenAI API Configuration
OPENAI_API_KEY=sk-...your-key-here...

# Optional: Control costs
OPENAI_MODEL=gpt-4-turbo  # or gpt-3.5-turbo for cheaper option
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
MAX_TOKENS_PER_RESPONSE=500
```

---

## Database Schema

### Migration 1: Enable pgvector Extension

Create: `drizzle/migrations/000X_enable_pgvector.sql`

```sql
-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;
```

Run migration:
```bash
pnpm db:migrate
```

### Migration 2: Create book_embeddings Table

Create: `lib/db/schema/embeddings.ts`

```typescript
import { pgTable, serial, integer, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { vector } from 'pgvector/drizzle-orm';
import { books } from './schema';

export const bookEmbeddings = pgTable(
  'book_embeddings',
  {
    id: serial('id').primaryKey(),
    bookId: integer('book_id')
      .references(() => books.id, { onDelete: 'cascade' })
      .notNull(),
    content: text('content').notNull(), // Chunked text
    embedding: vector('embedding', { dimensions: 1536 }).notNull(), // OpenAI embedding
    metadata: jsonb('metadata').$type<{
      chunkIndex: number;
      type: 'title' | 'description' | 'excerpt' | 'metadata';
      tokens: number;
    }>(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  },
  (table) => ({
    // HNSW index for fast cosine similarity search
    embeddingIndex: index('embedding_cosine_idx')
      .using('hnsw', table.embedding.op('vector_cosine_ops'))
      .with({ m: 16, ef_construction: 64 }),
    bookIdIdx: index('book_embeddings_book_id_idx').on(table.bookId),
  })
);
```

### Migration 3: Create chat_conversations Table (Optional)

Create: `lib/db/schema/chats.ts`

```typescript
import { pgTable, text, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { users, books } from './schema';

export const chatConversations = pgTable('chat_conversations', {
  id: text('id').primaryKey(), // nanoid
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  bookId: integer('book_id').references(() => books.id), // Optional: specific book chat
  title: text('title'), // Auto-generated from first message
  messages: jsonb('messages').$type<Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
  }>>().notNull().default([]),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
});
```

### Schema Relationships

```
books (existing)
  ↓ one-to-many
book_embeddings (new)

users (existing)
  ↓ one-to-many
chat_conversations (new)
  ↓ many-to-one (optional)
books (existing)
```

Push schema changes:
```bash
pnpm db:push
```

---

## Implementation Steps

### Step 1: Create Embedding Utilities

**File:** `lib/ai/embeddings.ts`

```typescript
import { embed } from 'ai';
import { openai } from '@ai-sdk/openai';

/**
 * Generate embedding vector for a given text
 * Uses OpenAI's text-embedding-3-small model (1536 dimensions)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: text,
  });
  return embedding;
}

/**
 * Split text into chunks for embedding
 * Strategy: Sentence-based chunking with max size
 */
export function chunkText(text: string, maxChunkSize = 500): string[] {
  // Split into sentences (basic implementation)
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    const potentialChunk = currentChunk + ' ' + sentence;
    
    if (potentialChunk.length > maxChunkSize && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk = potentialChunk;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Estimate token count (rough approximation)
 * OpenAI uses ~4 chars per token on average
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
```

### Step 2: Create Book Embedding Generation Service

**File:** `lib/actions/generate-embeddings.ts`

```typescript
'use server';

import { db } from '@/lib/db';
import { books, bookEmbeddings } from '@/lib/db/schema';
import { generateEmbedding, chunkText, estimateTokens } from '@/lib/ai/embeddings';
import { eq } from 'drizzle-orm';

/**
 * Generate embeddings for a single book
 * This should be run when a new book is added
 */
export async function generateBookEmbeddings(bookId: number) {
  try {
    // Fetch book with related data
    const book = await db.query.books.findFirst({
      where: eq(books.id, bookId),
      with: {
        author: true,
        category: true,
      },
    });

    if (!book) {
      throw new Error(`Book with ID ${bookId} not found`);
    }

    // Delete existing embeddings for this book
    await db.delete(bookEmbeddings).where(eq(bookEmbeddings.bookId, bookId));

    // Prepare comprehensive text for embedding
    const bookText = `
Title: ${book.title}
Author: ${book.author?.name || 'Unknown'}
Category: ${book.category?.name || 'Uncategorized'}
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
    const embeddingsToInsert = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await generateEmbedding(chunk);
      
      embeddingsToInsert.push({
        bookId: book.id,
        content: chunk,
        embedding: embedding,
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
    await db.insert(bookEmbeddings).values(embeddingsToInsert);

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
      results.errors.push(`Book ${book.id}: ${error}`);
      console.error(`✗ Failed to generate embeddings for book ${book.id}:`, error);
    }

    // Rate limiting: wait 500ms between books
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return results;
}
```

### Step 3: Create Semantic Search Function

**File:** `lib/ai/retrieval.ts`

```typescript
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
    const vectorString = `[${queryEmbedding.join(',)}]`;

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

    return results.rows as SearchResult[];
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

    if (avgEmbedding.rows.length === 0) {
      return [];
    }

    const embedding = avgEmbedding.rows[0].embedding;
    const vectorString = `[${embedding.join(',')}]`;

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

    return results.rows as SearchResult[];
  } catch (error) {
    console.error('Error finding similar books:', error);
    throw error;
  }
}
```

### Step 4: Create Chat API Endpoint

**File:** `app/api/member/chat/route.ts`

```typescript
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { findRelevantContent } from '@/lib/ai/retrieval';
import { getCurrentUser } from '@/lib/auth/utils';

export const runtime = 'edge'; // Optional: use edge runtime for faster responses

export async function POST(req: Request) {
  try {
    // Authentication check
    const user = await getCurrentUser();
    if (!user || user.role !== 'member') {
      return new Response('Unauthorized', { status: 401 });
    }

    // Parse request body
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1];

    if (!lastMessage || lastMessage.role !== 'user') {
      return new Response('Invalid message format', { status: 400 });
    }

    // Retrieve relevant book content using RAG
    const relevantDocs = await findRelevantContent(lastMessage.content, 5, 0.7);

    // Build context from retrieved documents
    const context = relevantDocs.length > 0
      ? relevantDocs
          .map((doc, idx) => `
[Book ${idx + 1}]
Title: ${doc.bookTitle}
Author: ${doc.author || 'Unknown'}
ISBN: ${doc.isbn || 'N/A'}
Available Copies: ${doc.availableCopies}
Content: ${doc.content}
Similarity Score: ${(doc.similarity * 100).toFixed(1)}%
          `.trim())
          .join('\n\n---\n\n')
      : 'No relevant books found in our collection.';

    // System prompt for the AI
    const systemPrompt = `You are a helpful and knowledgeable library assistant for Librarium. Your role is to help members discover books, answer questions about our collection, and provide reading recommendations.

**Guidelines:**
- Only reference books from the provided context below
- If you don't find relevant information in the context, politely say so and suggest the member browse the catalog or ask a librarian
- Mention book availability (number of copies available)
- Be concise but informative
- Use a friendly, professional tone
- If asked about borrowing or account details, direct members to the library desk or their account page

**Context from our book collection:**
${context}

**Important:** Base your responses only on the context provided above. Do not make up book information.`;

    // Stream the AI response
    const result = await streamText({
      model: openai(process.env.OPENAI_MODEL || 'gpt-4-turbo'),
      system: systemPrompt,
      messages,
      maxTokens: parseInt(process.env.MAX_TOKENS_PER_RESPONSE || '500'),
      temperature: 0.7,
    });

    // Return streaming response
    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
```

### Step 5: Create Chat UI Component

**File:** `app/member/chat/page.tsx`

```typescript
'use client';

import { useChat } from 'ai/react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function BookChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/member/chat',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Hello! I\'m your library assistant. Ask me anything about books in our collection, and I\'ll help you find what you\'re looking for. What are you interested in reading today?',
      },
    ],
  });

  return (
    <div className="container max-w-4xl mx-auto p-4 h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">Book Chat Assistant</h1>
        <p className="text-muted-foreground">
          Ask questions about our book collection
        </p>
      </div>

      {/* Messages Container */}
      <Card className="flex-1 overflow-y-auto p-4 space-y-4 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`flex gap-3 max-w-[80%] ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="w-5 h-5" />
                ) : (
                  <Bot className="w-5 h-5" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-muted">
                <Bot className="w-5 h-5" />
              </div>
              <div className="rounded-lg px-4 py-2 bg-muted">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about books... (e.g., 'Science fiction novels about space exploration')"
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
```

### Step 6: Create Background Job for Embedding Generation

**File:** `scripts/generate-all-embeddings.ts`

```typescript
/**
 * Background script to generate embeddings for all books
 * Run with: pnpm tsx scripts/generate-all-embeddings.ts
 */

import { generateAllBookEmbeddings } from '@/lib/actions/generate-embeddings';

async function main() {
  console.log('Starting bulk embedding generation...\n');
  console.log('⚠️  This may take a while and incur OpenAI API costs\n');

  const startTime = Date.now();
  
  try {
    const results = await generateAllBookEmbeddings();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n' + '='.repeat(50));
    console.log('EMBEDDING GENERATION COMPLETE');
    console.log('='.repeat(50));
    console.log(`Total books: ${results.total}`);
    console.log(`✓ Succeeded: ${results.succeeded}`);
    console.log(`✗ Failed: ${results.failed}`);
    console.log(`Duration: ${duration}s`);
    
    if (results.errors.length > 0) {
      console.log('\nErrors:');
      results.errors.forEach(err => console.log(`  - ${err}`));
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
```

Add to `package.json` scripts:
```json
{
  "scripts": {
    "embeddings:generate": "tsx scripts/generate-all-embeddings.ts"
  }
}
```

---

## API Endpoints

### POST /api/member/chat

**Purpose:** Handle streaming chat conversations with RAG

**Authentication:** Required (member role)

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "What mystery novels do you have?"
    }
  ]
}
```

**Response:** Streaming text (Server-Sent Events)

**Rate Limiting:** Consider implementing (e.g., 10 requests/minute)

---

## UI Components

### Chat Interface (`/member/chat`)

**Features:**
- Real-time streaming responses
- Message history display
- User/Assistant avatars
- Loading states
- Auto-scroll to latest message
- Mobile-responsive design

**Future Enhancements:**
- Save conversation history
- Export chat transcript
- Share conversations
- Voice input (Web Speech API)
- Suggested questions
- Book quick actions (view, reserve, borrow)

---

## Cost Analysis

### OpenAI API Pricing (as of Nov 2025)

**Embeddings (text-embedding-3-small):**
- $0.00002 per 1K tokens
- Average book: ~500 tokens → $0.00001 per book
- 1,000 books embedded: ~$0.01

**Chat Completions (GPT-4 Turbo):**
- Input: $0.01 per 1K tokens
- Output: $0.03 per 1K tokens
- Average chat: ~300 input + 200 output tokens → $0.009 per message

**Monthly Estimates:**

| Usage Level | Chats/Day | Monthly Cost |
|-------------|-----------|--------------|
| Low | 50 | $13.50 |
| Medium | 200 | $54.00 |
| High | 500 | $135.00 |

**Cost Reduction Strategies:**
1. Use GPT-3.5-turbo instead of GPT-4 (90% cheaper)
2. Implement response caching
3. Limit context window size
4. Rate limit users
5. Use smaller embedding models

---

## Testing Strategy

### Unit Tests

**File:** `lib/ai/embeddings.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { chunkText, estimateTokens } from './embeddings';

describe('Embedding Utils', () => {
  it('should chunk text by sentences', () => {
    const text = 'First sentence. Second sentence. Third sentence.';
    const chunks = chunkText(text, 20);
    expect(chunks.length).toBeGreaterThan(1);
  });

  it('should estimate tokens correctly', () => {
    const text = 'Hello world';
    const tokens = estimateTokens(text);
    expect(tokens).toBeGreaterThan(0);
  });
});
```

### Integration Tests

**Test Scenarios:**
1. Generate embedding for sample book
2. Perform semantic search with known query
3. Verify similarity scores are reasonable
4. Test chat API with mock data
5. Verify streaming response format

### Manual Testing Checklist

- [ ] Upload sample books (10-20)
- [ ] Generate embeddings successfully
- [ ] Search for books by topic
- [ ] Verify search results are relevant
- [ ] Test chat with various queries
- [ ] Check response quality
- [ ] Test edge cases (no results, long queries)
- [ ] Verify authentication works
- [ ] Test mobile responsiveness
- [ ] Check loading states

---

## Deployment Checklist

### Pre-Deployment

- [ ] Set up OpenAI API account and get API key
- [ ] Add `OPENAI_API_KEY` to production environment variables
- [ ] Enable pgvector extension on production database
- [ ] Run database migrations
- [ ] Generate embeddings for existing books
- [ ] Test chat functionality in staging
- [ ] Set up error monitoring (Sentry, LogRocket)
- [ ] Configure rate limiting
- [ ] Set up usage tracking/analytics

### Post-Deployment

- [ ] Monitor API costs daily
- [ ] Track user engagement metrics
- [ ] Collect user feedback
- [ ] Monitor error rates
- [ ] Optimize based on usage patterns
- [ ] Update documentation based on user behavior

### Monitoring Metrics

**Technical:**
- API response time (target: <2s)
- Embedding generation time
- Vector search performance
- Error rate (target: <1%)
- Token usage per chat

**Business:**
- Daily active chat users
- Average messages per session
- Book discovery rate (books found via chat)
- User satisfaction (feedback)
- Conversion to borrowing

---

## Future Enhancements

### Phase 2 Features

1. **Conversation History**
   - Save past chats
   - Resume conversations
   - Search chat history

2. **Multi-modal Support**
   - Upload book cover to find similar books
   - Voice input/output
   - PDF/document upload for context

3. **Personalization**
   - Learn from borrowing history
   - Personalized recommendations
   - Remember user preferences

4. **Advanced Search**
   - Filter by availability
   - Search within specific categories
   - Date range filtering

5. **Book Actions**
   - Quick reserve from chat
   - Add to custom shelf
   - Share recommendations

6. **Analytics Dashboard**
   - Popular search terms
   - Most discussed books
   - User engagement heatmap

### Phase 3 Features

1. **Multi-language Support**
   - Translate queries
   - Multilingual book support

2. **Citation Generator**
   - Generate MLA/APA citations
   - Export reference lists

3. **Reading Groups**
   - Group chat about books
   - Book club integration

4. **Librarian Tools**
   - View chat analytics
   - Improve responses
   - Flag inappropriate content

---

## Troubleshooting

### Common Issues

**Issue:** Embeddings not generating
- **Solution:** Check OpenAI API key, verify pgvector is enabled

**Issue:** Poor search results
- **Solution:** Increase chunk size, improve book descriptions, lower similarity threshold

**Issue:** Chat responses are irrelevant
- **Solution:** Improve system prompt, increase number of retrieved documents

**Issue:** High API costs
- **Solution:** Switch to GPT-3.5-turbo, implement caching, add rate limits

**Issue:** Slow response times
- **Solution:** Optimize vector index, reduce context size, use edge runtime

---

## Resources

### Documentation
- [Vercel AI SDK](https://sdk.vercel.ai)
- [OpenAI API](https://platform.openai.com/docs)
- [pgvector](https://github.com/pgvector/pgvector)
- [RAG Best Practices](https://sdk.vercel.ai/docs/guides/rag-chatbot)

### Example Projects
- [Vercel AI SDK Examples](https://github.com/vercel/ai/tree/main/examples)
- [RAG Starter](https://github.com/vercel/ai-sdk-rag-starter)

### Related Features in JTBD Matrix
- AI Recommendations (Tier 3, Priority 1.1)
- Advanced Search Filters (Tier 1, Priority 2.7)
- Book Reviews/Ratings (Tier 3, Priority 1.2)

---

**Last Updated:** November 16, 2025  
**Next Review:** After implementation completion  
**Maintained By:** Development Team
