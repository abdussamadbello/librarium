# AI Book Chat Assistant - Quick Start Guide

## Overview

The AI Book Chat Assistant is now implemented! Members can have intelligent conversations about books in your library collection using RAG (Retrieval Augmented Generation) technology.

## Setup Instructions

### 1. Prerequisites

- ✅ Dependencies installed (`ai`, `@ai-sdk/openai`)
- ✅ Database schema updated with `book_embeddings` and `chat_conversations` tables
- ✅ pgvector extension enabled

### 2. Required Environment Variables

Add to your `.env.local`:

```env
# OpenAI API Configuration
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4-turbo
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
MAX_TOKENS_PER_RESPONSE=500
```

Get your OpenAI API key from: https://platform.openai.com/api-keys

### 3. Generate Book Embeddings

Before members can chat, you need to generate embeddings for your books:

```bash
# Generate embeddings for all books
pnpm embeddings:generate
```

This will:
- Chunk each book's metadata and description
- Generate vector embeddings using OpenAI
- Store them in the `book_embeddings` table

**Cost Estimate:** ~$0.01 for 1,000 books (embeddings are very cheap!)

### 4. Access the Chat Interface

Members can access the chat at:
```
http://localhost:3000/member/chat
```

## Features Implemented

### ✅ Core Components

1. **Embedding System** (`lib/ai/embeddings.ts`)
   - Text chunking for optimal embedding
   - OpenAI text-embedding-3-small integration
   - Token estimation

2. **Semantic Search** (`lib/ai/retrieval.ts`)
   - Vector similarity search using pgvector
   - Cosine similarity ranking
   - Configurable similarity threshold

3. **Chat API** (`app/api/member/chat/route.ts`)
   - Streaming responses
   - RAG context injection
   - Member authentication

4. **Chat UI** (`app/member/chat/page.tsx`)
   - Real-time message streaming
   - Clean, responsive interface
   - Auto-scrolling messages

5. **Generation Scripts**
   - Bulk embedding generation
   - Individual book embedding
   - pgvector extension setup

### ✅ Database Schema

- `book_embeddings` - Stores vector representations of book content
- `chat_conversations` - Stores chat history (optional)

## Usage Examples

### Example Queries Members Can Ask:

```
"I'm looking for mystery novels set in Victorian England"
"Do you have any books about artificial intelligence for beginners?"
"What science fiction books are currently available?"
"Tell me about books similar to 1984"
"I need a book on web development with React"
```

### Admin Tasks

**Generate embeddings for a single book:**
```typescript
import { generateBookEmbeddings } from '@/lib/actions/generate-embeddings';

await generateBookEmbeddings(bookId);
```

**Find similar books:**
```typescript
import { findSimilarBooks } from '@/lib/ai/retrieval';

const similar = await findSimilarBooks(bookId, 5);
```

## Cost Management

### OpenAI API Pricing (Current)

**Embeddings:**
- $0.00002 per 1K tokens
- ~1,000 books = $0.01

**Chat (GPT-4 Turbo):**
- Input: $0.01 per 1K tokens
- Output: $0.03 per 1K tokens
- Average chat: ~$0.009

**Monthly Estimates:**
- 50 chats/day: ~$13.50/month
- 200 chats/day: ~$54/month
- 500 chats/day: ~$135/month

### Cost Reduction Tips

1. **Use GPT-3.5-turbo** (90% cheaper):
   ```env
   OPENAI_MODEL=gpt-3.5-turbo
   ```

2. **Reduce max tokens:**
   ```env
   MAX_TOKENS_PER_RESPONSE=300
   ```

3. **Increase similarity threshold** (fewer docs retrieved):
   ```typescript
   // In retrieval.ts
   findRelevantContent(query, 3, 0.8)  // Only 3 docs, 80% similarity
   ```

## Monitoring

### Track Usage

Monitor OpenAI usage at: https://platform.openai.com/usage

### Key Metrics to Watch

- Daily API costs
- Average tokens per chat
- User engagement (chats per member)
- Search accuracy (member feedback)

## Troubleshooting

### Issue: "No relevant books found"

**Solutions:**
1. Check embeddings are generated: `SELECT COUNT(*) FROM book_embeddings;`
2. Lower similarity threshold in `retrieval.ts`
3. Improve book descriptions in database

### Issue: Slow responses

**Solutions:**
1. Add HNSW index to embeddings table (already configured)
2. Reduce number of retrieved documents
3. Use smaller embedding model

### Issue: High API costs

**Solutions:**
1. Switch to GPT-3.5-turbo
2. Implement response caching
3. Add rate limiting per user

## Next Steps

### Phase 2 Enhancements (Future)

- [ ] Save conversation history
- [ ] Chat with specific books (book-specific chat)
- [ ] Voice input/output
- [ ] Multi-language support
- [ ] Book recommendations based on chat
- [ ] Quick actions (reserve, add to shelf) from chat

### Integration with Other Features

This chat feature can be enhanced with:
- **Custom Shelves** - "Add this book to my Want to Read shelf"
- **Reservations** - "Reserve this book for me"
- **Reading Analytics** - "What genres do I read most?"

## Security Notes

- Chat is member-only (requires authentication)
- API endpoints validate user role
- OpenAI API key should be kept secure
- Consider rate limiting per user

## Support

For issues or questions:
1. Check the full implementation guide: `RAG_CHATBOT_IMPLEMENTATION.md`
2. Review OpenAI API docs: https://platform.openai.com/docs
3. Check Vercel AI SDK docs: https://sdk.vercel.ai

---

**Status:** ✅ Fully Implemented  
**Date:** November 16, 2025  
**Priority:** Tier 3 (Impact: 9, Effort: 8, Score: 1.1)
