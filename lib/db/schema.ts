import { pgTable, serial, text, timestamp, integer, boolean, decimal, jsonb, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// AUTHENTICATION TABLES (NextAuth.js schema)
// ============================================================================

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  password: text('password'), // For email/password auth
  role: text('role').notNull().default('member'), // member, staff, admin, director
  membershipType: text('membership_type'), // standard, premium, student
  membershipStart: timestamp('membership_start', { mode: 'date' }),
  membershipExpiry: timestamp('membership_expiry', { mode: 'date' }),
  phone: text('phone'),
  address: text('address'),
  dateOfBirth: timestamp('date_of_birth', { mode: 'date' }),
  qrCode: text('qr_code').unique(), // Unique QR code for member checkout
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
});

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  sessionToken: text('session_token').notNull().unique(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull().unique(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

// ============================================================================
// LIBRARY MANAGEMENT TABLES
// ============================================================================

// Authors table
export const authors = pgTable('authors', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  bio: text('bio'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
});

// Publishers table
export const publishers = pgTable('publishers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  website: text('website'),
  contactEmail: text('contact_email'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
});

// Categories table (supports hierarchical categories)
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  parentId: integer('parent_id').references((): any => categories.id),
  description: text('description'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
});

// Books table
export const books = pgTable('books', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  isbn: text('isbn').unique(),
  authorId: integer('author_id').references(() => authors.id),
  categoryId: integer('category_id').references(() => categories.id),
  publisher: text('publisher'), // Legacy text field - kept for backward compatibility
  publisherId: integer('publisher_id').references(() => publishers.id), // New foreign key
  publicationYear: integer('publication_year'),
  language: text('language'),
  description: text('description'),
  coverImageUrl: text('cover_image_url'),
  totalCopies: integer('total_copies').notNull().default(1),
  availableCopies: integer('available_copies').notNull().default(1),
  shelfLocation: text('shelf_location'),
  tags: jsonb('tags').$type<string[]>(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
});

// Book Copies table (individual physical copies)
export const bookCopies = pgTable('book_copies', {
  id: serial('id').primaryKey(),
  bookId: integer('book_id').references(() => books.id, { onDelete: 'cascade' }),
  copyNumber: integer('copy_number').notNull(),
  status: text('status').notNull().default('available'), // available, borrowed, in_repair, lost
  condition: text('condition'), // new, good, fair, poor
  notes: text('notes'),
  qrCode: text('qr_code').unique(), // Unique QR code for book copy checkout
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
});

// Transactions table (checkouts & returns)
export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  bookCopyId: integer('book_copy_id').references(() => bookCopies.id),
  type: text('type').notNull(), // checkout, return
  checkoutDate: timestamp('checkout_date', { mode: 'date' }),
  dueDate: timestamp('due_date', { mode: 'date' }),
  returnDate: timestamp('return_date', { mode: 'date' }),
  issuedBy: text('issued_by').references(() => users.id),
  returnedTo: text('returned_to').references(() => users.id),
  notes: text('notes'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
});

// Fines table
export const fines = pgTable('fines', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  transactionId: integer('transaction_id').references(() => transactions.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  reason: text('reason'), // overdue, damage, loss
  daysOverdue: integer('days_overdue'),
  status: text('status').notNull().default('pending'), // pending, paid, waived
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
});

// Payments table
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  fineId: integer('fine_id').references(() => fines.id),
  userId: text('user_id').references(() => users.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text('payment_method'), // cash, card, online
  processedBy: text('processed_by').references(() => users.id),
  notes: text('notes'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
});

// Custom Shelves table
export const customShelves = pgTable('custom_shelves', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  isPublic: boolean('is_public').default(false),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
});

// Shelf Books (many-to-many)
export const shelfBooks = pgTable('shelf_books', {
  id: serial('id').primaryKey(),
  shelfId: integer('shelf_id').references(() => customShelves.id, { onDelete: 'cascade' }),
  bookId: integer('book_id').references(() => books.id, { onDelete: 'cascade' }),
  addedAt: timestamp('added_at', { mode: 'date' }).defaultNow(),
});

// Favorites table
export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  bookId: integer('book_id').references(() => books.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
});

// Reservations/Holds table
export const reservations = pgTable('reservations', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  bookId: integer('book_id').references(() => books.id),
  status: text('status').notNull().default('active'), // active, fulfilled, cancelled, expired
  queuePosition: integer('queue_position'), // Position in the hold queue (1 = first in line)
  reservedAt: timestamp('reserved_at', { mode: 'date' }).defaultNow(),
  notifiedAt: timestamp('notified_at', { mode: 'date' }), // When member was notified book is ready
  fulfilledAt: timestamp('fulfilled_at', { mode: 'date' }),
  expiresAt: timestamp('expires_at', { mode: 'date' }), // When the hold expires (48 hours after notification)
});

// Book Reviews table
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  bookId: integer('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(), // 1-5 stars
  reviewText: text('review_text'), // Optional review text
  isVerifiedBorrower: boolean('is_verified_borrower').notNull().default(false), // User has borrowed this book
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
}, (table) => ({
  // Ensure one review per user per book
  uniqueUserBook: uniqueIndex('unique_user_book_review').on(table.userId, table.bookId),
}));

// Activity Log table
export const activityLog = pgTable('activity_log', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  action: text('action').notNull(),
  entityType: text('entity_type'),
  entityId: integer('entity_id'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
});

// Notifications table
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // due_soon, overdue, fine_added, reservation_ready, general
  title: text('title').notNull(),
  message: text('message').notNull(),
  link: text('link'),
  isRead: boolean('is_read').default(false),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
});

// ============================================================================
// RELATIONS
// ============================================================================

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  transactions: many(transactions),
  fines: many(fines),
  customShelves: many(customShelves),
  favorites: many(favorites),
  reservations: many(reservations),
  notifications: many(notifications),
}));

export const booksRelations = relations(books, ({ one, many }) => ({
  author: one(authors, {
    fields: [books.authorId],
    references: [authors.id],
  }),
  category: one(categories, {
    fields: [books.categoryId],
    references: [categories.id],
  }),
  copies: many(bookCopies),
  favorites: many(favorites),
  reservations: many(reservations),
  shelfBooks: many(shelfBooks),
}));

export const authorsRelations = relations(authors, ({ many }) => ({
  books: many(books),
}));

export const categoriesRelations = relations(categories, ({ many, one }) => ({
  books: many(books),
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
  children: many(categories),
}));

export const bookCopiesRelations = relations(bookCopies, ({ one, many }) => ({
  book: one(books, {
    fields: [bookCopies.bookId],
    references: [books.id],
  }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  bookCopy: one(bookCopies, {
    fields: [transactions.bookCopyId],
    references: [bookCopies.id],
  }),
  fine: one(fines, {
    fields: [transactions.id],
    references: [fines.transactionId],
  }),
}));

export const finesRelations = relations(fines, ({ one, many }) => ({
  user: one(users, {
    fields: [fines.userId],
    references: [users.id],
  }),
  transaction: one(transactions, {
    fields: [fines.transactionId],
    references: [transactions.id],
  }),
  payments: many(payments),
}));

export const customShelvesRelations = relations(customShelves, ({ one, many }) => ({
  user: one(users, {
    fields: [customShelves.userId],
    references: [users.id],
  }),
  shelfBooks: many(shelfBooks),
}));

export const shelfBooksRelations = relations(shelfBooks, ({ one }) => ({
  shelf: one(customShelves, {
    fields: [shelfBooks.shelfId],
    references: [customShelves.id],
  }),
  book: one(books, {
    fields: [shelfBooks.bookId],
    references: [books.id],
  }),
}));

export const reservationsRelations = relations(reservations, ({ one }) => ({
  user: one(users, {
    fields: [reservations.userId],
    references: [users.id],
  }),
  book: one(books, {
    fields: [reservations.bookId],
    references: [books.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  book: one(books, {
    fields: [reviews.bookId],
    references: [books.id],
  }),
}));
