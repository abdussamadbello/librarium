import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { findRelevantContent } from '@/lib/ai/retrieval';
import { getCurrentUser } from '@/lib/auth/utils';

export const runtime = 'nodejs'; // Use nodejs runtime

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
    const result = streamText({
      model: openai(process.env.OPENAI_MODEL || 'gpt-4-turbo'),
      system: systemPrompt,
      messages,
      temperature: 0.7,
    });

    // Return streaming response
    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
