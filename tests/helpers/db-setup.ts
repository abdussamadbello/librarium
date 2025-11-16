import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as schema from '@/lib/db/schema';
import * as bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

let pool: Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!db) {
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL is not defined in .env.test');
    }

    pool = new Pool({ connectionString: DATABASE_URL });
    db = drizzle(pool, { schema });
  }
  return db;
}

/**
 * Reset the test database to a clean state
 * Drops all tables and recreates them with migrations
 */
export async function resetDatabase() {
  const db = getDb();

  try {
    // Drop all tables (cascade to remove all data and constraints)
    await db.execute(`
      DROP SCHEMA IF EXISTS public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO postgres;
      GRANT ALL ON SCHEMA public TO public;
    `);

    // Run migrations to recreate tables
    await migrate(db, { migrationsFolder: './drizzle' });

    console.log('✅ Database reset complete');
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    throw error;
  }
}

/**
 * Seed the database with base test data
 * Creates test users, categories, authors, and books
 */
export async function seedTestData() {
  const db = getDb();

  try {
    // Hash password for all test users
    const hashedPassword = await bcrypt.hash('TestPassword123!', 10);

    // Create test users for each role
    console.log('  Creating test users...');
    const [director, admin, staff, standardMember, premiumMember, studentMember] = await db
      .insert(schema.users)
      .values([
        {
          id: 'test-director-1',
          name: 'Test Director',
          email: 'director@test.com',
          password: hashedPassword,
          role: 'director',
          emailVerified: new Date(),
          qrCode: 'QR-DIRECTOR-001',
          createdAt: new Date(),
        },
        {
          id: 'test-admin-1',
          name: 'Test Admin',
          email: 'admin@test.com',
          password: hashedPassword,
          role: 'admin',
          emailVerified: new Date(),
          qrCode: 'QR-ADMIN-001',
          createdAt: new Date(),
        },
        {
          id: 'test-staff-1',
          name: 'Test Staff',
          email: 'staff@test.com',
          password: hashedPassword,
          role: 'staff',
          emailVerified: new Date(),
          qrCode: 'QR-STAFF-001',
          createdAt: new Date(),
        },
        {
          id: 'test-member-1',
          name: 'Test Member (Standard)',
          email: 'member@test.com',
          password: hashedPassword,
          role: 'member',
          membershipType: 'standard',
          emailVerified: new Date(),
          membershipStart: new Date(),
          qrCode: 'QR-MEMBER-001',
          phone: '+1234567890',
          createdAt: new Date(),
        },
        {
          id: 'test-member-2',
          name: 'Test Member (Premium)',
          email: 'premium@test.com',
          password: hashedPassword,
          role: 'member',
          membershipType: 'premium',
          emailVerified: new Date(),
          membershipStart: new Date(),
          qrCode: 'QR-MEMBER-002',
          phone: '+1234567891',
          createdAt: new Date(),
        },
        {
          id: 'test-member-3',
          name: 'Test Member (Student)',
          email: 'student@test.com',
          password: hashedPassword,
          role: 'member',
          membershipType: 'student',
          emailVerified: new Date(),
          membershipStart: new Date(),
          qrCode: 'QR-MEMBER-003',
          phone: '+1234567892',
          createdAt: new Date(),
        },
      ])
      .returning();

    console.log('  ✓ Created 6 test users');

    // Create categories
    console.log('  Creating categories...');
    const categories = await db
      .insert(schema.categories)
      .values([
        { name: 'Fiction', description: 'Fictional works' },
        { name: 'Non-Fiction', description: 'Factual books' },
        { name: 'Science', description: 'Scientific literature' },
        { name: 'Technology', description: 'Tech and programming' },
        { name: 'History', description: 'Historical accounts' },
        { name: 'Biography', description: 'Life stories' },
      ])
      .returning();

    console.log('  ✓ Created 6 categories');

    // Create authors
    console.log('  Creating authors...');
    const authors = await db
      .insert(schema.authors)
      .values([
        { name: 'George Orwell', bio: 'English novelist and essayist' },
        { name: 'Harper Lee', bio: 'American novelist' },
        { name: 'Aldous Huxley', bio: 'English writer and philosopher' },
        { name: 'Ray Bradbury', bio: 'American author and screenwriter' },
        { name: 'J.K. Rowling', bio: 'British author of Harry Potter' },
        { name: 'Isaac Asimov', bio: 'American science fiction writer' },
      ])
      .returning();

    console.log('  ✓ Created 6 authors');

    // Create books with available copies
    console.log('  Creating books...');
    const books = await db
      .insert(schema.books)
      .values([
        {
          title: '1984',
          isbn: '9780140449136',
          authorId: authors[0].id,
          categoryId: categories[0].id,
          description: 'A dystopian social science fiction novel',
          totalCopies: 5,
          availableCopies: 5,
          publicationYear: 1949,
          language: 'English',
        },
        {
          title: 'To Kill a Mockingbird',
          isbn: '9780061120084',
          authorId: authors[1].id,
          categoryId: categories[0].id,
          description: 'A novel about racial injustice',
          totalCopies: 3,
          availableCopies: 0, // All borrowed for testing
          publicationYear: 1960,
          language: 'English',
        },
        {
          title: 'Brave New World',
          isbn: '9780060850524',
          authorId: authors[2].id,
          categoryId: categories[0].id,
          description: 'A dystopian novel',
          totalCopies: 4,
          availableCopies: 4,
          publicationYear: 1932,
          language: 'English',
        },
        {
          title: 'Fahrenheit 451',
          isbn: '9781451673319',
          authorId: authors[3].id,
          categoryId: categories[0].id,
          description: 'A dystopian novel about book burning',
          totalCopies: 2,
          availableCopies: 1,
          publicationYear: 1953,
          language: 'English',
        },
        {
          title: 'Harry Potter and the Philosopher\'s Stone',
          isbn: '9780439708180',
          authorId: authors[4].id,
          categoryId: categories[0].id,
          description: 'The first Harry Potter book',
          totalCopies: 10,
          availableCopies: 10,
          publicationYear: 1997,
          language: 'English',
        },
        {
          title: 'Foundation',
          isbn: '9780553293357',
          authorId: authors[5].id,
          categoryId: categories[2].id,
          description: 'Science fiction novel',
          totalCopies: 3,
          availableCopies: 3,
          publicationYear: 1951,
          language: 'English',
        },
      ])
      .returning();

    console.log('  ✓ Created 6 books');

    // Create book copies for each book
    console.log('  Creating book copies...');
    const bookCopies = [];
    for (const book of books) {
      for (let i = 1; i <= book.totalCopies; i++) {
        const copy = await db
          .insert(schema.bookCopies)
          .values({
            bookId: book.id,
            copyNumber: i,
            status: i <= book.availableCopies ? 'available' : 'borrowed',
            condition: 'good',
            qrCode: `QR-BOOK-${book.id}-${i}`,
          })
          .returning();
        bookCopies.push(copy[0]);
      }
    }

    console.log('  ✓ Created book copies');

    console.log('✅ Test data seeded successfully');

    return {
      users: { director, admin, staff, standardMember, premiumMember, studentMember },
      categories,
      authors,
      books,
      bookCopies,
    };
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

/**
 * Clean up database after tests
 * Optionally closes the connection pool
 */
export async function cleanupDatabase() {
  if (pool) {
    await pool.end();
    pool = null;
    db = null;
  }
}

/**
 * Create a test user
 */
export async function createTestUser(data: {
  email: string;
  name: string;
  role?: string;
  membershipType?: string;
  password?: string;
}) {
  const db = getDb();
  const hashedPassword = await bcrypt.hash(data.password || 'TestPassword123!', 10);

  const [user] = await db
    .insert(schema.users)
    .values({
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role || 'member',
      membershipType: data.membershipType || 'standard',
      emailVerified: new Date(),
      membershipStart: new Date(),
      qrCode: `QR-${crypto.randomUUID()}`,
      createdAt: new Date(),
    })
    .returning();

  return user;
}

/**
 * Create a test book
 */
export async function createTestBook(data: {
  title: string;
  isbn?: string;
  authorId?: number;
  categoryId?: number;
  totalCopies?: number;
  availableCopies?: number;
}) {
  const db = getDb();

  const [book] = await db
    .insert(schema.books)
    .values({
      title: data.title,
      isbn: data.isbn || `978${Math.random().toString().slice(2, 12)}`,
      authorId: data.authorId,
      categoryId: data.categoryId,
      totalCopies: data.totalCopies || 1,
      availableCopies: data.availableCopies ?? data.totalCopies ?? 1,
    })
    .returning();

  return book;
}

/**
 * Create a transaction (borrow/return)
 */
export async function createTestTransaction(data: {
  userId: string;
  bookCopyId: number;
  checkoutDate?: Date;
  dueDate?: Date;
  returnDate?: Date | null;
}) {
  const db = getDb();

  const checkoutDate = data.checkoutDate || new Date();
  const dueDate = data.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  const [transaction] = await db
    .insert(schema.transactions)
    .values({
      userId: data.userId,
      bookCopyId: data.bookCopyId,
      type: 'checkout',
      checkoutDate,
      dueDate,
      returnDate: data.returnDate,
      createdAt: new Date(),
    })
    .returning();

  return transaction;
}

/**
 * Create a fine
 */
export async function createTestFine(data: {
  userId: string;
  transactionId: number;
  amount: string;
  reason?: string;
  status?: string;
  daysOverdue?: number;
}) {
  const db = getDb();

  const [fine] = await db
    .insert(schema.fines)
    .values({
      userId: data.userId,
      transactionId: data.transactionId,
      amount: data.amount,
      reason: data.reason || 'overdue',
      status: data.status || 'pending',
      daysOverdue: data.daysOverdue,
      createdAt: new Date(),
    })
    .returning();

  return fine;
}
