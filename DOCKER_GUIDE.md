# Docker Setup Guide for Librarium

Complete guide for running Librarium as a Docker container with PostgreSQL database and automated data seeding.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Configuration](#configuration)
- [Running with Docker](#running-with-docker)
- [Data Import & Seeding](#data-import--seeding)
- [Database Management](#database-management)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)

---

## 🚀 Quick Start

Get Librarium running in Docker in under 5 minutes:

```bash
# 1. Clone and navigate to the project
cd librarium

# 2. Copy environment file for Docker
cp .env.docker .env

# 3. Start everything with Docker Compose
docker-compose up -d

# 4. Watch the logs
docker-compose logs -f app

# 5. Access the application
# App: http://localhost:3000
# pgAdmin: http://localhost:5050 (optional, use --profile dev)
```

That's it! The database will automatically:
- ✅ Run migrations
- ✅ Seed test data (4 users, categories, authors)
- ✅ Import 200+ real books from free APIs

---

## 🏗️ Architecture

### Services

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  Librarium App (Next.js 15)                     │
│  Container: librarium_app                       │
│  Port: 3000                                     │
│  - Automatic migrations                         │
│  - Automatic seeding                            │
│  - Book imports from APIs                       │
│                                                 │
└────────────────┬────────────────────────────────┘
                 │
                 │ connects to
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│                                                 │
│  PostgreSQL 16 (PragmaDB)                       │
│  Container: librarium_postgres                  │
│  Port: 5432                                     │
│  - Persistent volumes                           │
│  - Optimized configuration                      │
│  - Extensions: uuid-ossp, pg_trgm, pg_stat      │
│                                                 │
└─────────────────────────────────────────────────┘

Optional:
┌─────────────────────────────────────────────────┐
│  pgAdmin 4 (Database UI)                        │
│  Container: librarium_pgadmin                   │
│  Port: 5050                                     │
│  - Visual database management                   │
│  - Query editor                                 │
└─────────────────────────────────────────────────┘
```

### Docker Images

| Service | Base Image | Size | Purpose |
|---------|------------|------|---------|
| app | node:18-alpine | ~200MB | Next.js application |
| postgres | postgres:16-alpine | ~250MB | PostgreSQL database |
| pgadmin | dpage/pgadmin4 | ~400MB | DB management (optional) |

---

## 📦 Prerequisites

### Required

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Disk Space**: At least 1GB free

### Optional

- **Google Books API Key**: For enhanced book metadata (optional but recommended)
  - Get it here: https://console.cloud.google.com/apis/credentials
  - Free tier: 1,000 requests/day

### Check Your Setup

```bash
docker --version
docker-compose --version
```

---

## ⚙️ Configuration

### Environment Variables

Copy the Docker environment template:

```bash
cp .env.docker .env
```

Edit `.env` with your settings:

```env
# Database (auto-configured)
DATABASE_URL=postgresql://librarium:librarium_password@postgres:5432/librarium

# NextAuth Secret (IMPORTANT: Change in production!)
NEXTAUTH_SECRET=your-super-secret-key-here

# Google Books API (Optional - improves book data quality)
GOOGLE_BOOKS_API_KEY=your-api-key-here

# Auto-setup options
AUTO_MIGRATE=true           # Run migrations on startup
AUTO_SEED=true              # Seed initial data
AUTO_IMPORT_BOOKS=true      # Import 200 books from APIs
```

### Customization Options

**Change Database Credentials** (docker-compose.yml):

```yaml
environment:
  POSTGRES_USER: your_user
  POSTGRES_PASSWORD: your_password
  POSTGRES_DB: your_database
```

**Change Ports**:

```yaml
ports:
  - "8080:3000"  # Map to different host port
```

**Disable Auto-Import**:

```env
AUTO_IMPORT_BOOKS=false
```

---

## 🐳 Running with Docker

### Basic Commands

```bash
# Start all services
docker-compose up -d

# Start with pgAdmin (dev profile)
docker-compose --profile dev up -d

# View logs
docker-compose logs -f

# View app logs only
docker-compose logs -f app

# View database logs only
docker-compose logs -f postgres

# Stop services
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v

# Restart a specific service
docker-compose restart app

# Rebuild images
docker-compose build

# Rebuild and start
docker-compose up -d --build
```

### Service Status

Check if services are healthy:

```bash
docker-compose ps
```

Expected output:
```
NAME                  STATUS         PORTS
librarium_app         Up (healthy)   0.0.0.0:3000->3000/tcp
librarium_postgres    Up (healthy)   0.0.0.0:5432->5432/tcp
```

### Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| **Librarium App** | http://localhost:3000 | See test users below |
| **pgAdmin** | http://localhost:5050 | admin@librarium.local / admin |
| **PostgreSQL** | localhost:5432 | librarium / librarium_password |

---

## 📚 Data Import & Seeding

### Automated Data Setup

On first startup, the application automatically:

1. **Runs Migrations** → Creates all database tables
2. **Seeds Test Data** → Adds users, categories, authors
3. **Imports Books** → Fetches 200+ books from free APIs

### Test User Accounts

All test users have the password: **`password123`**

| Email | Role | Access Level |
|-------|------|--------------|
| director@librarium.com | Director | Full system access + analytics |
| admin@librarium.com | Admin | Manage books, members, staff |
| staff@librarium.com | Staff | Issue/return books, manage members |
| member@librarium.com | Member | Browse, borrow, and reserve books |

### Book Data Sources

Books are imported from:

- **Open Library API** (primary, no API key needed)
  - 30+ million books
  - Free, unlimited usage
  - Includes: titles, authors, ISBNs, covers, metadata

- **Google Books API** (optional, requires API key)
  - 40+ million books
  - Enhanced descriptions and ratings
  - 1,000 free requests/day

### Manual Data Import

Import books manually after startup:

```bash
# Import 200 books (default)
docker-compose exec app pnpm db:import:200

# Import custom amount
docker-compose exec app pnpm db:import -- --limit 500

# Import from specific source
docker-compose exec app pnpm db:import -- --source openlibrary

# With Google Books (requires API key)
docker-compose exec app pnpm db:import -- --source google
```

### Re-seed Database

Reset and re-seed the database:

```bash
# Run migrations
docker-compose exec app pnpm db:migrate

# Seed test data
docker-compose exec app pnpm db:seed

# Full setup (migrate + seed + import)
docker-compose exec app pnpm db:full-setup
```

### Book Import Details

The import script includes diverse books across genres:

| Category | Example Books | Count |
|----------|---------------|-------|
| **Fiction Classics** | 1984, Pride & Prejudice, The Great Gatsby | 10 |
| **Fantasy/Sci-Fi** | The Hobbit, Dune, Foundation | 8 |
| **Technology** | Clean Code, Design Patterns, The Pragmatic Programmer | 8 |
| **Non-Fiction** | Sapiens, Thinking Fast and Slow, Educated | 9 |
| **Business** | The Lean Startup, Zero to One, Atomic Habits | 6 |
| **History** | Guns Germs and Steel, Long Walk to Freedom | 5 |
| **Science** | A Brief History of Time, Cosmos, The Selfish Gene | 5 |

Each book includes:
- ✅ Title, author, ISBN
- ✅ Publisher, publish year
- ✅ Cover image (high quality)
- ✅ Page count, language
- ✅ Categories/subjects
- ✅ 3 physical copies (QR coded)

---

## 🗄️ Database Management

### Connect to PostgreSQL

**Via psql (from host):**

```bash
psql -h localhost -p 5432 -U librarium -d librarium
```

**Via Docker:**

```bash
docker-compose exec postgres psql -U librarium -d librarium
```

**Via pgAdmin:**

1. Start with dev profile: `docker-compose --profile dev up -d`
2. Visit: http://localhost:5050
3. Login: admin@librarium.local / admin
4. Add server:
   - Host: postgres
   - Port: 5432
   - Database: librarium
   - Username: librarium
   - Password: librarium_password

### Database Operations

**Backup Database:**

```bash
docker-compose exec postgres pg_dump -U librarium librarium > backup.sql
```

**Restore Database:**

```bash
cat backup.sql | docker-compose exec -T postgres psql -U librarium -d librarium
```

**View Database Size:**

```bash
docker-compose exec postgres psql -U librarium -d librarium -c "\l+"
```

**View All Tables:**

```bash
docker-compose exec postgres psql -U librarium -d librarium -c "\dt"
```

**Check Book Count:**

```bash
docker-compose exec postgres psql -U librarium -d librarium -c "SELECT COUNT(*) FROM books;"
```

### Drizzle Studio

Visual database browser (runs on host):

```bash
# Install dependencies first (if not in Docker)
pnpm install

# Open Drizzle Studio
pnpm db:studio
```

Visit: https://local.drizzle.studio

---

## 🔧 Troubleshooting

### Container Won't Start

**Issue**: App container exits immediately

**Solution**:
```bash
# Check logs
docker-compose logs app

# Common causes:
# 1. Database not ready → Wait for health check
# 2. Missing .env file → Copy .env.docker to .env
# 3. Port conflict → Change ports in docker-compose.yml
```

### Database Connection Failed

**Issue**: App can't connect to PostgreSQL

**Solution**:
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Verify connection string in .env
# Should be: postgresql://librarium:librarium_password@postgres:5432/librarium
```

### Migration Errors

**Issue**: Migrations fail on startup

**Solution**:
```bash
# Reset database
docker-compose down -v
docker-compose up -d

# Or manually run migrations
docker-compose exec app pnpm db:migrate
```

### Book Import Fails

**Issue**: Books not importing

**Solution**:
```bash
# Check app logs
docker-compose logs -f app

# Manually trigger import
docker-compose exec app pnpm db:import:200

# Common causes:
# 1. Rate limiting → Wait a few minutes
# 2. Network issues → Check internet connection
# 3. API down → Try different source
```

### Port Already in Use

**Issue**: Port 3000 or 5432 already in use

**Solution**:
```yaml
# Edit docker-compose.yml, change ports:
ports:
  - "8080:3000"  # App
  - "5433:5432"  # PostgreSQL
```

### Out of Disk Space

**Issue**: No space left on device

**Solution**:
```bash
# Clean up Docker resources
docker system prune -a --volumes

# Remove old images
docker image prune -a

# Check disk usage
docker system df
```

---

## 🚀 Production Deployment

### Security Checklist

Before deploying to production:

- [ ] Change `NEXTAUTH_SECRET` to a strong random value
  ```bash
  openssl rand -base64 32
  ```

- [ ] Change database credentials in docker-compose.yml

- [ ] Set `AUTO_IMPORT_BOOKS=false` (import manually)

- [ ] Remove or secure pgAdmin (dev profile only)

- [ ] Use environment-specific `.env` files

- [ ] Enable HTTPS/TLS

- [ ] Set up database backups

- [ ] Configure proper logging

- [ ] Set resource limits in docker-compose.yml

### Resource Limits

Add to docker-compose.yml:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M

  postgres:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
```

### Health Checks

App health endpoint:
```
GET http://localhost:3000/api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "database": "connected"
}
```

### Automated Backups

```bash
# Add to crontab
0 2 * * * docker-compose -f /path/to/docker-compose.yml exec -T postgres pg_dump -U librarium librarium | gzip > /backups/librarium-$(date +\%Y\%m\%d).sql.gz
```

### Monitoring

**View resource usage:**

```bash
docker stats
```

**Check container health:**

```bash
watch docker-compose ps
```

---

## 📊 Performance Optimization

### PostgreSQL Tuning

The `docker/postgres/postgresql.conf` is pre-configured for optimal performance:

- Shared buffers: 256MB
- Effective cache size: 1GB
- Connection pooling: 100 connections
- WAL optimization for write performance

### Next.js Optimization

- Uses standalone output mode (minimal size)
- Multi-stage Docker build
- Production mode enabled
- Static asset optimization

### Database Indexing

Indexes are automatically created by migrations:

- Books: title, ISBN, author, category
- Users: email, role
- Transactions: userId, bookId, status
- QR Codes: indexed for fast lookups

---

## 🆘 Getting Help

### Common Issues

1. **Slow book imports**: Normal, APIs have rate limits
2. **Migration errors on restart**: Database persists, migrations already applied
3. **Port conflicts**: Change ports in docker-compose.yml

### Logs

Always check logs first:

```bash
docker-compose logs -f
```

### Reset Everything

Nuclear option - fresh start:

```bash
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

---

## 📝 Summary

### What You Get

✅ Full library management system
✅ PostgreSQL database with PragmaDB flavor
✅ 200+ real books with metadata and covers
✅ 4 test users across all roles
✅ Automatic migrations and seeding
✅ Health checks and monitoring
✅ Production-ready Docker setup

### Quick Reference

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Logs
docker-compose logs -f app

# Reset
docker-compose down -v && docker-compose up -d

# Import more books
docker-compose exec app pnpm db:import -- --limit 500

# Database backup
docker-compose exec postgres pg_dump -U librarium librarium > backup.sql
```

---

**Happy coding! 📚✨**
