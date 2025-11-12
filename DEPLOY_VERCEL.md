# Deploy Librarium to Vercel + Neon (FREE)

Deploy your Librarium app to Vercel with Neon PostgreSQL - completely free!

## Why Vercel + Neon?

- ✅ **100% FREE** (both platforms have generous free tiers)
- ✅ **Easiest Next.js hosting** (made by Next.js creators)
- ✅ **Global CDN** included
- ✅ **Auto-deploy** on git push
- ✅ **Zero downtime** deployments
- ✅ **Serverless PostgreSQL** with Neon

---

## Prerequisites

- GitHub account
- Vercel account (free): https://vercel.com
- Neon account (free): https://neon.tech

---

## Step 1: Set Up Neon Database

### 1.1 Create Neon Account

1. Visit: https://neon.tech
2. Sign up with GitHub (easiest)
3. Verify your email

### 1.2 Create Database

1. Click "Create Project"
2. Configure:
   - **Project name:** librarium
   - **PostgreSQL version:** 16
   - **Region:** Choose closest to your users
3. Click "Create Project"

### 1.3 Get Connection String

1. After creation, copy the connection string
2. It looks like: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb`
3. Save this - you'll need it soon!

---

## Step 2: Prepare Your Code

### 2.1 Update Database Configuration

Your `lib/db/index.ts` already supports Neon! It auto-detects when using Neon.

### 2.2 Ensure Environment Variables

Your `.env.example` already has the right structure.

---

## Step 3: Deploy to Vercel

### Method A: GitHub Integration (Easiest)

#### 3.1 Push Code to GitHub

Your code is already on GitHub. Merge your Docker branch to main or deploy from feature branch.

```bash
# If you want to merge to main first
git checkout main
git merge claude/docker-postgres-pragma-setup-011CV4h3hnLZYTjWWuL3P5cH
git push origin main
```

#### 3.2 Connect to Vercel

1. Visit: https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `librarium` repository
4. Click "Import"

#### 3.3 Configure Project

Vercel auto-detects Next.js settings:
- **Framework Preset:** Next.js
- **Root Directory:** ./
- **Build Command:** Auto-detected
- **Output Directory:** Auto-detected

**Important:** Remove `output: 'standalone'` from `next.config.ts` for Vercel:

```typescript
// next.config.ts - for Vercel
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Note: Remove 'output: standalone' for Vercel
  // Keep it only for Docker deployments
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'covers.openlibrary.org',
        pathname: '/b/**',
      },
      {
        protocol: 'https',
        hostname: 'books.google.com',
        pathname: '/books/**',
      },
    ],
  },
};

export default nextConfig;
```

#### 3.4 Add Environment Variables

Click "Environment Variables" and add:

```bash
# Database (from Neon)
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb
USE_NEON=true

# NextAuth (generate secret)
NEXTAUTH_SECRET=<your-secret-from-openssl-rand-base64-32>
NEXTAUTH_URL=https://librarium.vercel.app

# App URL
NEXT_PUBLIC_APP_URL=https://librarium.vercel.app

# Optional: Google Books API
GOOGLE_BOOKS_API_KEY=your-key-here
```

**To generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

#### 3.5 Deploy

1. Click "Deploy"
2. Wait 2-3 minutes
3. Vercel builds and deploys your app

---

### Method B: Vercel CLI (Alternative)

#### 3.1 Install Vercel CLI

```bash
npm install -g vercel
```

#### 3.2 Login

```bash
vercel login
```

#### 3.3 Deploy

```bash
# From your project directory
cd /home/user/librarium

# Deploy (first time - creates project)
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Scope: Your account
# - Link to existing project? No
# - Project name: librarium
# - Directory: ./
# - Override settings? No
```

#### 3.4 Add Environment Variables

```bash
# Add DATABASE_URL
vercel env add DATABASE_URL production
# Paste your Neon connection string

# Add USE_NEON
vercel env add USE_NEON production
# Enter: true

# Generate and add NEXTAUTH_SECRET
vercel env add NEXTAUTH_SECRET production
# Paste: output from `openssl rand -base64 32`

# Add NEXTAUTH_URL
vercel env add NEXTAUTH_URL production
# Enter: https://your-app.vercel.app

# Add NEXT_PUBLIC_APP_URL
vercel env add NEXT_PUBLIC_APP_URL production
# Enter: https://your-app.vercel.app
```

#### 3.5 Deploy Production

```bash
vercel --prod
```

---

## Step 4: Set Up Database

### 4.1 Run Migrations

Since you can't run commands directly in Vercel (serverless), you'll run migrations locally against Neon:

```bash
# Set Neon connection string locally
export DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb"

# Run migrations
pnpm db:migrate

# Seed initial data
pnpm db:seed

# Import books
pnpm db:import:200
```

**Note:** This connects to Neon database from your local machine.

### 4.2 Alternative: Use Neon Console

1. Visit Neon dashboard
2. Click "SQL Editor"
3. Run migration SQL files manually from `drizzle/` folder

---

## Step 5: Verify Deployment

### 5.1 Access Your App

Visit your Vercel URL (shown after deployment):
`https://librarium-xxx.vercel.app`

### 5.2 Test Login

- **Email:** director@librarium.com
- **Password:** password123

### 5.3 Check Books

Navigate to Admin → Books to see your 200+ imported books.

---

## Configuration for Both Docker and Vercel

To support both Docker and Vercel deployments, use environment-based config:

### next.config.ts

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone only for Docker (not Vercel)
  ...(process.env.DOCKER_BUILD === 'true' && { output: 'standalone' }),

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'covers.openlibrary.org',
        pathname: '/b/**',
      },
      {
        protocol: 'https',
        hostname: 'books.google.com',
        pathname: '/books/**',
      },
    ],
  },
};

export default nextConfig;
```

### Dockerfile

Add environment variable:

```dockerfile
# In builder stage
ENV DOCKER_BUILD=true
```

---

## Automatic Deployments

### Vercel automatically deploys when:
- Push to main/production branch
- Merge pull requests
- Create new commits

### Preview Deployments:
- Every PR gets a unique preview URL
- Test before merging to production

---

## Custom Domain

### 4.1 Add Domain to Vercel

1. Vercel dashboard → Project Settings → Domains
2. Click "Add"
3. Enter your domain: librarium.yourdomain.com
4. Follow DNS instructions

### 4.2 Update Environment Variables

```bash
vercel env add NEXTAUTH_URL production
# Update to: https://librarium.yourdomain.com

vercel env add NEXT_PUBLIC_APP_URL production
# Update to: https://librarium.yourdomain.com
```

### 4.3 Redeploy

```bash
vercel --prod
```

---

## Monitoring & Analytics

### Vercel Analytics (Free)

1. Vercel dashboard → Analytics
2. Click "Enable"
3. View:
   - Page views
   - Top pages
   - Visitor countries
   - Device types

### Vercel Logs

1. Vercel dashboard → Deployments
2. Click on a deployment
3. View "Functions" tab for logs

### Neon Monitoring

1. Neon dashboard → Your project
2. View:
   - Connection count
   - Database size
   - Query performance
   - Backups

---

## Database Management

### Connect to Neon Database

**Via psql:**
```bash
psql "postgresql://user:pass@ep-xxx.neon.tech/neondb"
```

**Via Neon SQL Editor:**
1. Neon dashboard → SQL Editor
2. Run queries directly

**Via Drizzle Studio:**
```bash
# Locally with Neon connection
export DATABASE_URL="your-neon-connection-string"
pnpm db:studio
```

### Backups

Neon automatically backs up your database:
- Point-in-time recovery
- 7-day retention (free tier)
- 30-day retention (paid tiers)

### Manual Backup

```bash
pg_dump "postgresql://user:pass@ep-xxx.neon.tech/neondb" > backup.sql
```

---

## Scaling

### Vercel Scaling (Automatic)
- Automatic horizontal scaling
- Global edge network
- No configuration needed
- Handles traffic spikes automatically

### Neon Scaling
Free tier limits:
- 0.5 GB storage
- 1 project
- Unlimited queries

To scale:
- Upgrade to paid plan: $19/month
- More storage, more projects
- Better performance

---

## Cost Breakdown

| Service | Free Tier | Paid |
|---------|-----------|------|
| **Vercel** | Unlimited (Hobby) | $20/month (Pro) |
| **Neon** | 0.5 GB storage | $19/month |
| **Total** | **$0/month** 🎉 | $39/month |

Free tier is perfect for:
- Personal projects
- Small libraries
- Testing/development
- Low-medium traffic

---

## Troubleshooting

### Issue: Build Fails

**Error:** `output: 'standalone' not supported on Vercel`

**Solution:** Remove from `next.config.ts` or use conditional config

### Issue: Database Connection Error

**Check:**
1. DATABASE_URL is correct
2. USE_NEON=true is set
3. Neon database is active (free tier sleeps after inactivity)

**Solution:**
```bash
# Test connection locally
psql $DATABASE_URL
```

### Issue: Migrations Not Running

Vercel doesn't auto-run migrations. Run manually:

```bash
# Locally against Neon
export DATABASE_URL="your-neon-connection-string"
pnpm db:migrate
```

### Issue: NextAuth Errors

**Common causes:**
- NEXTAUTH_SECRET not set
- NEXTAUTH_URL incorrect
- Domain mismatch

**Solution:** Verify all auth env vars in Vercel dashboard

---

## Production Checklist

- [ ] Neon database created and active
- [ ] Migrations run successfully
- [ ] Test data seeded
- [ ] Books imported
- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] NEXTAUTH_URL matches your domain
- [ ] Custom domain configured (optional)
- [ ] Test all user flows
- [ ] Update test user passwords
- [ ] Enable Vercel Analytics
- [ ] Set up error monitoring (Sentry)
- [ ] Configure email service (Resend)

---

## Comparison: Docker vs. Vercel

| Feature | Docker (Railway) | Vercel + Neon |
|---------|------------------|---------------|
| **Setup Complexity** | Moderate | Easy |
| **Cost (Free Tier)** | $5 credit | $0 truly free |
| **Scaling** | Manual | Automatic |
| **Database** | Included | Separate (Neon) |
| **Global CDN** | ❌ | ✅ |
| **Edge Functions** | ❌ | ✅ |
| **Container Support** | ✅ | ❌ |
| **Custom Scripts** | ✅ Easy | ❌ Limited |
| **Best For** | Full control | Next.js apps |

---

## Advanced: Neon Branching

Neon has a unique feature: database branches!

### Create Branch for Testing

```bash
# Via Neon CLI (install first)
npm install -g neonctl

# Login
neonctl auth

# Create branch
neonctl branches create --project-id your-project-id --name staging
```

### Use Cases:
- Test migrations without affecting production
- Preview deployments with isolated data
- Temporary testing environments

---

## Summary

Deploying to Vercel + Neon gives you:
- ✅ **Free hosting** (forever, with generous limits)
- ✅ **Automatic scaling** globally
- ✅ **Zero config** deployments
- ✅ **Managed PostgreSQL** with Neon
- ✅ **Perfect for Next.js** apps

**Result:** Production-ready Librarium app with 200+ books, completely free! 🚀

---

## Quick Command Reference

```bash
# Vercel CLI
npm install -g vercel
vercel login
vercel                    # Deploy
vercel --prod            # Deploy to production
vercel env add KEY       # Add environment variable
vercel logs              # View logs
vercel domains add       # Add custom domain

# Neon CLI (optional)
npm install -g neonctl
neonctl auth
neonctl projects list
neonctl branches list

# Database operations (local → Neon)
export DATABASE_URL="your-neon-url"
pnpm db:migrate
pnpm db:seed
pnpm db:import:200
```

---

**Ready to deploy?**

1. Create Neon database: https://neon.tech
2. Deploy to Vercel: https://vercel.com/new
3. Run migrations locally
4. Done! 🎉
