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
