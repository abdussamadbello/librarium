import { pgTable, serial, integer, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { customType } from 'drizzle-orm/pg-core';

// Define vector type for pgvector
const vector = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return 'vector(1536)';
  },
  toDriver(value: number[]): string {
    return `[${value.join(',')}]`;
  },
});

export const bookEmbeddings = pgTable(
  'book_embeddings',
  {
    id: serial('id').primaryKey(),
    bookId: integer('book_id')
      .notNull(),
    content: text('content').notNull(), // Chunked text
    embedding: vector('embedding').notNull(),
    metadata: jsonb('metadata').$type<{
      chunkIndex: number;
      type: 'title' | 'description' | 'excerpt' | 'metadata';
      tokens: number;
    }>(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  },
  (table) => ({
    bookIdIdx: index('book_embeddings_book_id_idx').on(table.bookId),
  })
);

export const chatConversations = pgTable('chat_conversations', {
  id: text('id').primaryKey(), // nanoid
  userId: text('user_id')
    .notNull(),
  bookId: integer('book_id'), // Optional: specific book chat
  title: text('title'), // Auto-generated from first message
  messages: jsonb('messages').$type<Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
  }>>().notNull().$defaultFn(() => []),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
});
