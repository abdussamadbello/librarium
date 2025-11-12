#!/bin/bash
set -e

# PostgreSQL Initialization Script for Librarium
# This script runs once when the database container is first created

echo "🚀 Initializing Librarium PostgreSQL database..."

# Create extensions
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Enable useful PostgreSQL extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";
    CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

    -- Create indexes for better full-text search
    -- (These will be created by migrations, but we can prepare the extension)

    -- Grant necessary permissions
    GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO $POSTGRES_USER;

    -- Log success
    \echo '✅ Extensions installed successfully'
EOSQL

echo "✅ PostgreSQL initialization complete!"
