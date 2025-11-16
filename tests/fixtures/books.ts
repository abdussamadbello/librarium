/**
 * Test book fixtures
 * These match the books created in db-setup.ts seedTestData()
 */

export interface TestBook {
  title: string;
  isbn: string;
  author: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  publicationYear: number;
  description: string;
}

export const TEST_BOOKS = {
  nineteenEightyFour: {
    title: '1984',
    isbn: '9780140449136',
    author: 'George Orwell',
    category: 'Fiction',
    totalCopies: 5,
    availableCopies: 5,
    publicationYear: 1949,
    description: 'A dystopian social science fiction novel',
  } as TestBook,

  toKillAMockingbird: {
    title: 'To Kill a Mockingbird',
    isbn: '9780061120084',
    author: 'Harper Lee',
    category: 'Fiction',
    totalCopies: 3,
    availableCopies: 0, // All borrowed - useful for testing unavailable books
    publicationYear: 1960,
    description: 'A novel about racial injustice',
  } as TestBook,

  braveNewWorld: {
    title: 'Brave New World',
    isbn: '9780060850524',
    author: 'Aldous Huxley',
    category: 'Fiction',
    totalCopies: 4,
    availableCopies: 4,
    publicationYear: 1932,
    description: 'A dystopian novel',
  } as TestBook,

  fahrenheit451: {
    title: 'Fahrenheit 451',
    isbn: '9781451673319',
    author: 'Ray Bradbury',
    category: 'Fiction',
    totalCopies: 2,
    availableCopies: 1,
    publicationYear: 1953,
    description: 'A dystopian novel about book burning',
  } as TestBook,

  harryPotter: {
    title: 'Harry Potter and the Philosopher\'s Stone',
    isbn: '9780439708180',
    author: 'J.K. Rowling',
    category: 'Fiction',
    totalCopies: 10,
    availableCopies: 10,
    publicationYear: 1997,
    description: 'The first Harry Potter book',
  } as TestBook,

  foundation: {
    title: 'Foundation',
    isbn: '9780553293357',
    author: 'Isaac Asimov',
    category: 'Science',
    totalCopies: 3,
    availableCopies: 3,
    publicationYear: 1951,
    description: 'Science fiction novel',
  } as TestBook,
};

export const CATEGORIES = [
  'Fiction',
  'Non-Fiction',
  'Science',
  'Technology',
  'History',
  'Biography',
];

export const AUTHORS = [
  'George Orwell',
  'Harper Lee',
  'Aldous Huxley',
  'Ray Bradbury',
  'J.K. Rowling',
  'Isaac Asimov',
];
