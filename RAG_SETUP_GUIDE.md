# RAG Chatbot - Quick Setup Guide

## ✅ Implementation Complete!

The RAG (Retrieval Augmented Generation) chatbot has been successfully implemented in Librarium.

## 📦 What Was Installed

- `ai` (v5.0.93) - Vercel AI SDK
- `@ai-sdk/openai` (v2.0.67) - OpenAI provider
- pgvector extension enabled in PostgreSQL

## 🗄️ Database Changes

New tables created:
- `book_embeddings` - Stores vector embeddings of book content
- `chat_conversations` - Saves chat history (optional feature)

## 🔑 Required Environment Variables

Add to your `.env.local` file:

```bash
# OpenAI API Configuration
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4-turbo
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
MAX_TOKENS_PER_RESPONSE=500
```

Get your OpenAI API key at: https://platform.openai.com/api-keys

## 🚀 How to Use

### 1. Generate Embeddings for Your Books

Before the chat works, you need to generate embeddings:

```bash
# Generate embeddings for all books in your library
pnpm embeddings:generate
```

⚠️ **Note:** This will make API calls to OpenAI and incur costs (approximately $0.01 per 1000 books)

### 2. Access the Chat Interface

Navigate to: `http://localhost:3000/member/chat`

(Must be logged in as a member)

### 3. Start Chatting!

Try questions like:
- "What science fiction books do you have?"
- "I'm looking for a mystery novel set in Victorian England"
- "Show me books about artificial intelligence"
- "Do you have any books by George Orwell?"

## 📁 Files Created

### Core Logic
- `lib/ai/embeddings.ts` - Embedding generation utilities
- `lib/ai/retrieval.ts` - Semantic search functions
- `lib/actions/generate-embeddings.ts` - Server actions for embeddings

### API
- `app/api/member/chat/route.ts` - Chat endpoint with streaming

### UI
- `app/member/chat/page.tsx` - Chat interface

### Database
- `lib/db/schema/embeddings.ts` - Embeddings schema
- `scripts/enable-pgvector.ts` - pgvector enabler
- `scripts/generate-all-embeddings.ts` - Bulk embedding generator

## 💰 Cost Estimates

### One-time Setup (Generating Embeddings)
- 100 books: ~$0.001
- 1,000 books: ~$0.01
- 10,000 books: ~$0.10

### Per Chat Message
- Using GPT-4 Turbo: ~$0.01 per message
- Using GPT-3.5 Turbo: ~$0.001 per message

**To reduce costs:** Change `OPENAI_MODEL=gpt-3.5-turbo` in your .env file

## 🔧 Troubleshooting

### "No relevant books found"
- Make sure you've run `pnpm embeddings:generate`
- Check that books have descriptions in your database

### "Unauthorized" error
- Ensure you're logged in as a member
- Check the authentication middleware

### Slow responses
- This is normal for streaming - responses build gradually
- Consider using gpt-3.5-turbo for faster responses

### High API costs
- Set `MAX_TOKENS_PER_RESPONSE=200` to reduce response length
- Implement rate limiting (not included yet)
- Use GPT-3.5-turbo instead of GPT-4

## 🎯 Next Steps

1. **Add to Navigation** - Add link to chat in member sidebar
2. **Book-Specific Chat** - Create chat pages for individual books
3. **Save Chat History** - Implement conversation persistence
4. **Rate Limiting** - Prevent API abuse
5. **Cost Monitoring** - Track OpenAI usage

## 📊 Feature Status

Updated in `JTBD_IMPACT_MATRIX.md`:
- Status: ✅ Implemented
- Priority: 1.1 (Tier 3 - Strategic)
- Impact: 9/10
- Effort: 8/10

## 📚 Documentation

Full implementation details: `RAG_CHATBOT_IMPLEMENTATION.md`

---

**Implementation Date:** November 16, 2025  
**Status:** Ready for Testing
