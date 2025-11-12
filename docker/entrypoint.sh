#!/bin/sh
set -e

echo "🚀 Starting Librarium application..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until pg_isready -h postgres -p 5432 -U librarium; do
  echo "   PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "✅ PostgreSQL is ready!"

# Run migrations if AUTO_MIGRATE is enabled
if [ "$AUTO_MIGRATE" = "true" ]; then
  echo "🔄 Running database migrations..."
  pnpm db:migrate || echo "⚠️  Migration failed or already up to date"
fi

# Run seed script if AUTO_SEED is enabled
if [ "$AUTO_SEED" = "true" ]; then
  echo "🌱 Seeding database with initial data..."
  pnpm db:seed || echo "⚠️  Seeding failed or already completed"
fi

# Import books from APIs if AUTO_IMPORT_BOOKS is enabled
if [ "$AUTO_IMPORT_BOOKS" = "true" ]; then
  echo "📚 Importing books from free APIs..."
  pnpm db:import:200 || echo "⚠️  Book import failed or skipped"
fi

echo "✅ Database setup complete!"
echo "🚀 Starting Next.js server..."

# Execute the main container command
exec "$@"
