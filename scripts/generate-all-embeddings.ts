/**
 * Background script to generate embeddings for all books
 * Run with: pnpm embeddings:generate
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
