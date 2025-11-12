# Database Setup Guide

This guide will help you set up the PostgreSQL database for Librarium using Neon (serverless PostgreSQL).

## Prerequisites

- A Neon account (sign up at [neon.tech](https://neon.tech))
- Node.js 18+ installed
- pnpm package manager

## Step 1: Create a Neon Database

1. Go to [console.neon.tech](https://console.neon.tech)
2. Sign up or log in to your account
3. Click **"Create Project"**
4. Configure your project:
   - **Project name**: `librarium` (or your preferred name)
   - **Region**: Choose the region closest to your users
   - **PostgreSQL version**: 16 (recommended)
5. Click **"Create Project"**
6. Once created, copy your connection string from the dashboard

Your connection string will look like:
```
postgresql://username:password@ep-xxx-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
```

## Step 2: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and update the `DATABASE_URL`:
   ```env
   DATABASE_URL=postgresql://username:password@ep-xxx-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

3. Update other required environment variables:
   ```env
   # NextAuth.js Secret (generate with: openssl rand -base64 32)
   NEXTAUTH_SECRET=your-generated-secret-here

   # Google OAuth (optional, for SSO)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

## Step 3: Run Database Migrations

The database schema has already been generated. Now you need to apply it to your Neon database:

```bash
pnpm db:migrate
```

This will create all 16 tables in your database:
- ✅ users
- ✅ accounts
- ✅ sessions
- ✅ verification_tokens
- ✅ authors
- ✅ categories
- ✅ books
- ✅ book_copies
- ✅ transactions
- ✅ fines
- ✅ payments
- ✅ reservations
- ✅ favorites
- ✅ custom_shelves
- ✅ shelf_books
- ✅ activity_log

## Step 4: Seed the Database (Optional but Recommended)

Seed your database with sample data for testing:

```bash
pnpm db:seed
```

This will create:
- **4 test users** with different roles:
  - `director@librarium.com` (Director role)
  - `admin@librarium.com` (Admin role)
  - `staff@librarium.com` (Staff role)
  - `member@librarium.com` (Member role)
  - **Password for all**: `password123`

- **8 categories** including Fiction, Technology, Science, etc.
- **6 authors** including J.K. Rowling, George Orwell, etc.
- **6 books** with realistic data
- **Book copies** with barcodes and locations
- **Sample favorites** and **custom shelves**

## Step 5: Verify Setup

1. **View your database in Drizzle Studio**:
   ```bash
   pnpm db:studio
   ```
   This opens a visual database browser at `https://local.drizzle.studio`

2. **Check the tables** in Neon Console:
   - Go to your Neon project dashboard
   - Navigate to "Tables" section
   - Verify all 16 tables exist with data

## Available Database Scripts

| Script | Description |
|--------|-------------|
| `pnpm db:generate` | Generate new migration files from schema changes |
| `pnpm db:migrate` | Apply migrations to the database |
| `pnpm db:seed` | Seed database with sample data |
| `pnpm db:push` | Push schema changes directly (development only) |
| `pnpm db:studio` | Open Drizzle Studio visual database browser |
| `pnpm db:setup` | Run migrations + seed in one command |

## Quick Setup (All Steps Combined)

After getting your Neon connection string and updating `.env.local`:

```bash
# Install dependencies (if not already done)
pnpm install

# Setup database (migrate + seed)
pnpm db:setup
```

## Development Workflow

### Making Schema Changes

1. Modify `lib/db/schema.ts`
2. Generate new migration:
   ```bash
   pnpm db:generate
   ```
3. Review the generated SQL in `drizzle/` directory
4. Apply the migration:
   ```bash
   pnpm db:migrate
   ```

### Resetting the Database

To completely reset your database (⚠️ **destroys all data**):

1. Drop all tables in Neon Console or via SQL:
   ```sql
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   ```
2. Re-run setup:
   ```bash
   pnpm db:setup
   ```

## Troubleshooting

### Connection Errors

**Error**: `Connection refused` or `timeout`
- Verify your `DATABASE_URL` is correct in `.env.local`
- Check that your IP is allowed in Neon's connection settings
- Ensure `?sslmode=require` is in the connection string

### Migration Errors

**Error**: `relation already exists`
- Your database may have existing tables
- Either drop the tables or use `pnpm db:push` for development

**Error**: `Cannot find module 'dotenv'`
- Run `pnpm install` to ensure all dependencies are installed

### Seed Errors

**Error**: `Unique constraint violation`
- The database has already been seeded
- Either skip seeding or reset the database first

## Production Deployment

For production on Vercel:

1. Add `DATABASE_URL` to your Vercel environment variables
2. Migrations will run automatically on deployment (if configured)
3. **Do NOT seed production databases** with test data
4. Use different databases for staging and production

## Security Notes

- ✅ **Never commit** `.env.local` to version control
- ✅ `.env.example` is safe to commit (contains no secrets)
- ✅ Use strong, unique passwords for production
- ✅ Rotate `NEXTAUTH_SECRET` regularly in production
- ✅ Enable connection pooling in Neon for better performance
- ✅ Set up database backups in Neon dashboard

## Next Steps

After database setup:
1. Start the development server: `pnpm dev`
2. Visit `http://localhost:3000/auth/login`
3. Log in with any test user (password: `password123`)
4. Explore the admin portal or member app
5. Start building features according to the implementation plan

## Support

For issues or questions:
- Check the [Neon Documentation](https://neon.tech/docs)
- Check the [Drizzle ORM Documentation](https://orm.drizzle.team/docs)
- Review `IMPLEMENTATION_PLAN.md` for project roadmap
