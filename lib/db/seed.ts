import { drizzle } from 'drizzle-orm/neon-serverless'
import { Pool } from '@neondatabase/serverless'
import { config } from 'dotenv'
import * as bcrypt from 'bcryptjs'
import * as schema from './schema'
import { UserRole } from '@/lib/auth/roles'

// Load environment variables
config({ path: '.env.local' })

async function seed() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined in environment variables')
  }

  console.log('🌱 Starting database seed...')

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const db = drizzle(pool, { schema })

  try {
    // Create users with different roles
    console.log('Creating users...')
    const hashedPassword = await bcrypt.hash('password123', 10)

    const [director] = await db
      .insert(schema.users)
      .values({
        id: crypto.randomUUID(),
        name: 'Director User',
        email: 'director@librarium.com',
        password: hashedPassword,
        role: UserRole.DIRECTOR,
        emailVerified: new Date(),
        membershipStart: new Date(),
        createdAt: new Date(),
      })
      .returning()

    const [admin] = await db
      .insert(schema.users)
      .values({
        id: crypto.randomUUID(),
        name: 'Admin User',
        email: 'admin@librarium.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
        emailVerified: new Date(),
        membershipStart: new Date(),
        createdAt: new Date(),
      })
      .returning()

    const [staff] = await db
      .insert(schema.users)
      .values({
        id: crypto.randomUUID(),
        name: 'Staff User',
        email: 'staff@librarium.com',
        password: hashedPassword,
        role: UserRole.STAFF,
        emailVerified: new Date(),
        membershipStart: new Date(),
        createdAt: new Date(),
      })
      .returning()

    const [member] = await db
      .insert(schema.users)
      .values({
        id: crypto.randomUUID(),
        name: 'Member User',
        email: 'member@librarium.com',
        password: hashedPassword,
        role: UserRole.MEMBER,
        emailVerified: new Date(),
        membershipType: 'premium',
        membershipStart: new Date(),
        createdAt: new Date(),
      })
      .returning()

    console.log('✅ Created 4 users (director, admin, staff, member)')

    // Create categories
    console.log('Creating categories...')
    const categories = await db
      .insert(schema.categories)
      .values([
        {
          name: 'Fiction',
          description: 'Fictional works including novels and short stories',
        },
        {
          name: 'Non-Fiction',
          description: 'Factual books including biographies and essays',
        },
        {
          name: 'Science',
          description: 'Scientific literature and research',
        },
        {
          name: 'Technology',
          description: 'Technology, programming, and computing',
        },
        {
          name: 'History',
          description: 'Historical accounts and analyses',
        },
        {
          name: 'Biography',
          description: 'Life stories and memoirs',
        },
        {
          name: 'Fantasy',
          description: 'Fantasy and magical realism',
          parentId: 1, // Fiction subcategory
        },
        {
          name: 'Mystery',
          description: 'Mystery and thriller novels',
          parentId: 1, // Fiction subcategory
        },
      ])
      .returning()

    console.log(`✅ Created ${categories.length} categories`)

    // Create authors
    console.log('Creating authors...')
    const authors = await db
      .insert(schema.authors)
      .values([
        {
          name: 'J.K. Rowling',
          bio: 'British author, best known for the Harry Potter series',
        },
        {
          name: 'George Orwell',
          bio: 'English novelist and essayist, journalist and critic',
        },
        {
          name: 'Jane Austen',
          bio: 'English novelist known for her romantic fiction',
        },
        {
          name: 'Stephen King',
          bio: 'American author of horror, supernatural fiction, and fantasy',
        },
        {
          name: 'Robert C. Martin',
          bio: 'American software engineer and author, known as Uncle Bob',
        },
        {
          name: 'Yuval Noah Harari',
          bio: 'Israeli historian and author of Sapiens',
        },
      ])
      .returning()

    console.log(`✅ Created ${authors.length} authors`)

    // Create books
    console.log('Creating books...')
    const books = await db
      .insert(schema.books)
      .values([
        {
          title: "Harry Potter and the Philosopher's Stone",
          isbn: '978-0-7475-3269-9',
          authorId: authors[0]!.id,
          categoryId: categories[6]!.id, // Fantasy
          publisher: 'Bloomsbury Publishing',
          publicationYear: 1997,
          language: 'English',
          description:
            'The first novel in the Harry Potter series and the first novel for children by British author J.K. Rowling.',
          coverImageUrl: '/covers/harry-potter-1.jpg',
          availableCopies: 3,
          totalCopies: 5,
        },
        {
          title: '1984',
          isbn: '978-0-452-28423-4',
          authorId: authors[1]!.id,
          categoryId: categories[0]!.id, // Fiction
          publisher: 'Secker & Warburg',
          publicationYear: 1949,
          language: 'English',
          description:
            'A dystopian social science fiction novel and cautionary tale about the dangers of totalitarianism.',
          coverImageUrl: '/covers/1984.jpg',
          availableCopies: 2,
          totalCopies: 3,
        },
        {
          title: 'Pride and Prejudice',
          isbn: '978-0-14-143951-8',
          authorId: authors[2]!.id,
          categoryId: categories[0]!.id, // Fiction
          publisher: 'T. Egerton, Whitehall',
          publicationYear: 1813,
          language: 'English',
          description:
            'A romantic novel of manners that follows the character development of Elizabeth Bennet.',
          coverImageUrl: '/covers/pride-and-prejudice.jpg',
          availableCopies: 4,
          totalCopies: 4,
        },
        {
          title: 'The Shining',
          isbn: '978-0-385-12167-5',
          authorId: authors[3]!.id,
          categoryId: categories[0]!.id, // Fiction
          publisher: 'Doubleday',
          publicationYear: 1977,
          language: 'English',
          description:
            'A horror novel about a family that moves to an isolated hotel for the winter.',
          coverImageUrl: '/covers/the-shining.jpg',
          availableCopies: 1,
          totalCopies: 2,
        },
        {
          title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
          isbn: '978-0-13-235088-4',
          authorId: authors[4]!.id,
          categoryId: categories[3]!.id, // Technology
          publisher: 'Prentice Hall',
          publicationYear: 2008,
          language: 'English',
          description:
            'A handbook of agile software craftsmanship with best practices for writing clean, maintainable code.',
          coverImageUrl: '/covers/clean-code.jpg',
          availableCopies: 5,
          totalCopies: 5,
        },
        {
          title: 'Sapiens: A Brief History of Humankind',
          isbn: '978-0-06-231609-7',
          authorId: authors[5]!.id,
          categoryId: categories[4]!.id, // History
          publisher: 'Harper',
          publicationYear: 2011,
          language: 'English',
          description:
            'An exploration of human history from the Stone Age to the present.',
          coverImageUrl: '/covers/sapiens.jpg',
          availableCopies: 3,
          totalCopies: 4,
        },
      ])
      .returning()

    console.log(`✅ Created ${books.length} books`)

    // Create book copies
    console.log('Creating book copies...')
    let totalCopiesCreated = 0

    for (const book of books) {
      const copies = []
      for (let i = 0; i < book.totalCopies; i++) {
        copies.push({
          bookId: book.id,
          copyNumber: i + 1,
          status: i < book.availableCopies ? 'available' : 'borrowed',
          condition: 'good',
        })
      }

      await db.insert(schema.bookCopies).values(copies)
      totalCopiesCreated += copies.length
    }

    console.log(`✅ Created ${totalCopiesCreated} book copies`)

    // Create some favorites for the member user
    console.log('Creating favorites...')
    await db.insert(schema.favorites).values([
      {
        userId: member!.id,
        bookId: books[0]!.id, // Harry Potter
      },
      {
        userId: member!.id,
        bookId: books[4]!.id, // Clean Code
      },
      {
        userId: member!.id,
        bookId: books[5]!.id, // Sapiens
      },
    ])

    console.log('✅ Created 3 favorites for member user')

    // Create a custom shelf for the member user
    console.log('Creating custom shelves...')
    const [shelf] = await db
      .insert(schema.customShelves)
      .values({
        userId: member!.id,
        name: 'Want to Read',
        description: 'Books I plan to read soon',
        isPublic: true,
      })
      .returning()

    await db.insert(schema.shelfBooks).values([
      {
        shelfId: shelf!.id,
        bookId: books[1]!.id, // 1984
      },
      {
        shelfId: shelf!.id,
        bookId: books[3]!.id, // The Shining
      },
    ])

    console.log('✅ Created 1 custom shelf with 2 books')

    console.log('\n🎉 Database seed completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`   - 4 users (1 director, 1 admin, 1 staff, 1 member)`)
    console.log(`   - ${categories.length} categories`)
    console.log(`   - ${authors.length} authors`)
    console.log(`   - ${books.length} books`)
    console.log(`   - ${totalCopiesCreated} book copies`)
    console.log(`   - 3 favorites`)
    console.log(`   - 1 custom shelf with 2 books`)
    console.log('\n🔐 Login credentials (all users have same password):')
    console.log('   Password: password123')
    console.log('   - director@librarium.com (Director)')
    console.log('   - admin@librarium.com (Admin)')
    console.log('   - staff@librarium.com (Staff)')
    console.log('   - member@librarium.com (Member)')
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

seed()
