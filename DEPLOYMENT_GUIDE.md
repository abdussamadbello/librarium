# Librarium Deployment Guide
## Deploy to Vercel + Neon (100% FREE!)

Complete guide for deploying Librarium to production using Vercel and Neon PostgreSQL.

---

## 🎯 Overview

**Stack:**
- **Hosting:** Vercel (Next.js optimized, global CDN)
- **Database:** Neon (Serverless PostgreSQL)
- **Cost:** **FREE** for both test and production! 🎉

**What you get:**
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Auto-deploy on git push
- ✅ Serverless PostgreSQL
- ✅ Automatic backups
- ✅ Zero configuration scaling

---

## 📋 Prerequisites

1. **GitHub Account** - Your code is already on GitHub ✅
2. **Vercel Account** - Sign up at https://vercel.com (free)
3. **Neon Account** - Sign up at https://neon.tech (free)

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Create Neon Database (2 minutes)

1. **Visit:** https://neon.tech
2. **Sign up** with GitHub
3. **Create Project:**
   - Click "Create Project"
   - Name: `librarium-production`
   - Region: Choose closest to your users
   - PostgreSQL version: 16 (default)
4. **Copy Connection String:**
   - Click "Connection string"
   - Copy the connection string
   - Keep it handy!

**Example connection string:**
```
postgresql://neondb_owner:abc123@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

---

### Step 2: Deploy to Vercel (3 minutes)

#### Option A: GitHub Integration (Easiest)

1. **Visit:** https://vercel.com/new
2. **Import Repository:**
   - Click "Import Git Repository"
   - Select your `librarium` repository
   - Click "Import"

3. **Configure Project:**
   - **Framework Preset:** Next.js ✅ (auto-detected)
   - **Root Directory:** `./` (default)
   - Leave build settings as default

4. **Add Environment Variables:**

Click "Environment Variables" and add these:

| Variable | Value | Where to get it |
|----------|-------|-----------------|
| `DATABASE_URL` | Your Neon connection string | From Step 1 |
| `USE_NEON` | `true` | Type it |
| `NEXTAUTH_SECRET` | Generate with command below | See below |
| `NEXTAUTH_URL` | `https://librarium.vercel.app` | Your Vercel URL |
| `NEXT_PUBLIC_APP_URL` | `https://librarium.vercel.app` | Your Vercel URL |

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

**Optional but recommended:**
| Variable | Value | Purpose |
|----------|-------|---------|
| `GOOGLE_BOOKS_API_KEY` | Your API key | Better book data |
| `GOOGLE_CLIENT_ID` | Your Google OAuth ID | Google login |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth secret | Google login |

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app will be live! 🎉

---

#### Option B: Vercel CLI

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Link project (from your repo directory)
cd /path/to/librarium
vercel link

# 4. Add environment variables
vercel env add DATABASE_URL production
# Paste your Neon connection string

vercel env add USE_NEON production
# Enter: true

vercel env add NEXTAUTH_SECRET production
# Generate and paste: openssl rand -base64 32

vercel env add NEXTAUTH_URL production
# Enter your Vercel URL (you'll get this after first deploy)

vercel env add NEXT_PUBLIC_APP_URL production
# Enter your Vercel URL

# 5. Deploy to production
vercel --prod
```

---

### Step 3: Set Up Database (2 minutes)

Since Vercel is serverless, you'll run migrations from your local machine against Neon:

```bash
# 1. Set your Neon connection string locally
export DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require"

# 2. Install dependencies (if not already)
pnpm install

# 3. Run migrations
pnpm db:migrate

# 4. Seed initial data (users, categories, authors)
pnpm db:seed

# 5. Import 200 books from free APIs
pnpm db:import:200
```

**What gets created:**
- ✅ All 17 database tables
- ✅ 4 test users (director, admin, staff, member)
- ✅ 8 categories (Fiction, Technology, Science, etc.)
- ✅ 6 authors (with bios)
- ✅ 200+ books with metadata and cover images
- ✅ 600+ book copies with QR codes

---

### Step 4: Verify Deployment

1. **Visit your Vercel URL:**
   ```
   https://librarium-xxx.vercel.app
   ```

2. **Login with test account:**
   - Email: `director@librarium.com`
   - Password: `password123`

3. **Check books:**
   - Navigate to Admin → Books
   - You should see 200+ books with covers!

4. **Test functionality:**
   - Browse books
   - Check out a book
   - View member dashboard

---

## 🌍 Setting Up Test Environment

Create a separate Neon database and Vercel project for testing:

### Test Database (Neon)

1. In Neon dashboard, click "Create Project"
2. Name: `librarium-test`
3. Copy connection string

### Test Deployment (Vercel)

**Option 1: Use Preview Deployments** (Recommended)

Vercel automatically creates preview deployments for every branch/PR:
- Push to any branch → Automatic preview URL
- Each PR gets its own URL
- Test before merging to production

**Option 2: Separate Vercel Project**

1. Create new Vercel project
2. Link to same GitHub repo
3. Configure to deploy from `develop` branch
4. Add test environment variables (use test DATABASE_URL)

---

## 🔧 Configuration Details

### Environment Variables Reference

#### Required

```bash
# Database
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
USE_NEON=true

# Authentication
NEXTAUTH_SECRET=your-secret-from-openssl-rand-base64-32
NEXTAUTH_URL=https://your-app.vercel.app

# App
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

#### Optional (Recommended)

```bash
# Enhanced book data (1000 free requests/day)
GOOGLE_BOOKS_API_KEY=your-api-key

# Google OAuth login
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Email notifications (optional)
RESEND_API_KEY=your-resend-key

# File uploads (optional)
UPLOADTHING_SECRET=your-uploadthing-secret
UPLOADTHING_APP_ID=your-uploadthing-app-id
```

### Getting API Keys

**Google Books API (Free):**
1. Visit: https://console.cloud.google.com/apis/credentials
2. Create project (if you don't have one)
3. Enable "Books API"
4. Create credentials → API key
5. Copy key

**Google OAuth (Free):**
1. Same console: https://console.cloud.google.com/apis/credentials
2. Create credentials → OAuth 2.0 Client ID
3. Application type: Web application
4. Authorized redirect URIs:
   - `https://your-app.vercel.app/api/auth/callback/google`
5. Copy Client ID and Secret

**Resend (Email - Free):**
1. Sign up: https://resend.com
2. Generate API key
3. Free tier: 100 emails/day

---

## 🔄 Automatic Deployments

### Production Deployments

Vercel automatically deploys when you:
1. Push to `main` branch
2. Merge a pull request to `main`

### Preview Deployments

Every branch/PR automatically gets:
- Unique preview URL
- Isolated environment
- Same configuration as production

**Example workflow:**
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
git commit -m "Add new feature"

# Push to GitHub
git push origin feature/new-feature

# Vercel automatically creates preview deployment
# Get preview URL from Vercel dashboard or GitHub PR
```

---

## 📊 Database Management

### Access Neon Database

**Via Neon SQL Editor:**
1. Neon dashboard → Your project
2. Click "SQL Editor"
3. Write and execute queries

**Via psql:**
```bash
psql "postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require"
```

**Via Drizzle Studio (locally):**
```bash
export DATABASE_URL="your-neon-connection-string"
pnpm db:studio
```
Visit: https://local.drizzle.studio

### Database Operations

**Run new migrations:**
```bash
export DATABASE_URL="your-neon-connection-string"
pnpm db:migrate
```

**Import more books:**
```bash
export DATABASE_URL="your-neon-connection-string"
pnpm db:import -- --limit 500
```

**Backup database:**
```bash
pg_dump "postgresql://user:pass@ep-xxx.neon.tech/neondb" > backup.sql
```

**Restore database:**
```bash
psql "postgresql://user:pass@ep-xxx.neon.tech/neondb" < backup.sql
```

### Automatic Backups

Neon automatically backs up your database:
- **Frequency:** Continuous
- **Retention:** 7 days (free tier), 30 days (paid)
- **Point-in-time recovery:** Available
- **Access:** Neon dashboard → Backups

---

## 🔍 Monitoring & Logs

### Vercel Dashboard

**Deployments:**
- View all deployments
- Build logs
- Deployment status

**Analytics:**
1. Enable Vercel Analytics (free)
2. View:
   - Page views
   - Visitors
   - Top pages
   - Performance metrics

**Function Logs:**
1. Deployments → Click on deployment
2. Functions tab → View logs
3. Real-time log streaming

**View logs via CLI:**
```bash
vercel logs your-deployment-url
```

### Neon Dashboard

**Monitoring:**
- Connection count
- Database size
- Query performance
- Active queries

**Metrics:**
- CPU usage
- Storage usage
- Connection pool status

---

## 🎨 Custom Domain

### Add Custom Domain to Vercel

1. **Vercel Dashboard:**
   - Project Settings → Domains
   - Click "Add"
   - Enter your domain: `librarium.yourdomain.com`

2. **Update DNS:**
   - Add CNAME record:
     ```
     CNAME  librarium  cname.vercel-dns.com
     ```

3. **Update Environment Variables:**
   ```bash
   vercel env add NEXTAUTH_URL production
   # Enter: https://librarium.yourdomain.com

   vercel env add NEXT_PUBLIC_APP_URL production
   # Enter: https://librarium.yourdomain.com
   ```

4. **Redeploy:**
   ```bash
   vercel --prod
   ```

Vercel automatically provisions SSL certificate!

---

## 💰 Cost Breakdown

### Free Tier Limits

**Vercel (Hobby Plan):**
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Serverless functions
- ✅ Automatic HTTPS
- ✅ Preview deployments
- ✅ Analytics
- **Cost:** **$0/month**

**Neon (Free Tier):**
- ✅ 0.5 GB storage
- ✅ 1 project
- ✅ Unlimited compute time
- ✅ Automatic backups (7 days)
- ✅ Point-in-time recovery
- **Cost:** **$0/month**

**Total:** **$0/month** 🎉

### When to Upgrade

**Vercel Pro ($20/month):**
- More bandwidth (1 TB)
- Team collaboration
- Password protection
- Advanced analytics

**Neon Scale ($19/month):**
- More storage (10 GB)
- More projects (unlimited)
- Longer backups (30 days)
- Better performance

**For most library apps, free tier is sufficient!**

---

## 🔒 Security Best Practices

### Environment Variables

✅ **Do:**
- Use strong NEXTAUTH_SECRET (32+ characters)
- Never commit secrets to git
- Rotate secrets periodically
- Use different secrets for test/prod

❌ **Don't:**
- Use default/example values in production
- Share secrets in public channels
- Commit .env files

### Database

✅ **Do:**
- Use Neon's built-in SSL (enabled by default)
- Regular backups
- Test migrations on test database first
- Monitor connection count

❌ **Don't:**
- Expose connection strings publicly
- Skip migrations
- Use same database for test and prod

### Application

✅ **Do:**
- Keep dependencies updated
- Enable Vercel's security headers
- Use Content Security Policy
- Monitor error logs

---

## 🐛 Troubleshooting

### Build Fails on Vercel

**Error:** "Module not found"

**Solution:**
```bash
# Check package.json dependencies
# Make sure all imports are correct
# Clear Vercel cache: Settings → Clear Cache
```

**Error:** "Environment variable not set"

**Solution:**
- Verify all required env vars in Vercel dashboard
- Redeploy after adding variables

### Database Connection Issues

**Error:** "Connection timeout"

**Solutions:**
1. Check DATABASE_URL is correct
2. Verify USE_NEON=true
3. Ensure `?sslmode=require` in connection string
4. Check Neon project is active (free tier may sleep)

**Error:** "Too many connections"

**Solution:**
```bash
# Neon free tier: 100 connections max
# Check open connections in Neon dashboard
# Close idle connections
# Consider upgrading if needed
```

### Migration Errors

**Error:** "Relation already exists"

**Solution:**
```bash
# Migrations already run
# Check which migrations ran:
export DATABASE_URL="your-neon-url"
psql $DATABASE_URL -c "SELECT * FROM drizzle.__drizzle_migrations"
```

**Error:** "Permission denied"

**Solution:**
```bash
# Use connection string from Neon (includes proper user)
# Don't modify the connection string
```

### Books Not Importing

**Error:** "Network request failed"

**Solutions:**
1. Check internet connection
2. Open Library API may be down (try later)
3. Rate limiting (wait a few minutes)

**Error:** "No books found"

**Solution:**
```bash
# Check if migrations ran successfully
# Verify categories and authors exist
# Run seed first: pnpm db:seed
```

---

## 📱 Testing Checklist

Before going live:

### Functionality
- [ ] User registration works
- [ ] Login/logout works
- [ ] Admin can add/edit/delete books
- [ ] Members can borrow books
- [ ] Members can return books
- [ ] QR code scanning works
- [ ] Search functionality works
- [ ] Fines calculation correct

### Data
- [ ] All migrations ran successfully
- [ ] Test users created
- [ ] Books imported (200+)
- [ ] Categories populated
- [ ] Authors populated

### Security
- [ ] Strong NEXTAUTH_SECRET set
- [ ] Production URLs configured
- [ ] SSL working (HTTPS)
- [ ] Test users passwords changed

### Performance
- [ ] Pages load quickly
- [ ] Images load correctly
- [ ] Database queries optimized
- [ ] No console errors

---

## 🚀 Going Live Checklist

### Pre-Launch
- [ ] Test all features on preview deployment
- [ ] Update test user passwords
- [ ] Configure custom domain (optional)
- [ ] Set up Google OAuth (optional)
- [ ] Enable Vercel Analytics
- [ ] Test on mobile devices

### Launch
- [ ] Merge to main branch
- [ ] Verify production deployment
- [ ] Test production URL
- [ ] Announce to users

### Post-Launch
- [ ] Monitor Vercel logs
- [ ] Monitor Neon metrics
- [ ] Check for errors
- [ ] Gather user feedback
- [ ] Plan improvements

---

## 📚 Additional Resources

### Documentation
- **Vercel:** https://vercel.com/docs
- **Neon:** https://neon.tech/docs
- **Next.js:** https://nextjs.org/docs
- **Drizzle ORM:** https://orm.drizzle.team

### Support
- **Vercel Discord:** https://discord.gg/vercel
- **Neon Discord:** https://discord.gg/neon
- **GitHub Issues:** Create issues in your repo

### Useful Tools
- **Drizzle Studio:** Database GUI
- **Vercel CLI:** Command-line deployments
- **Neon CLI:** Database management

---

## 🎯 Summary

**You now have:**
- ✅ Production-ready deployment pipeline
- ✅ 100% free hosting (Vercel + Neon)
- ✅ Automatic deployments on git push
- ✅ Preview deployments for testing
- ✅ 200+ books with real data
- ✅ Global CDN with HTTPS
- ✅ Serverless PostgreSQL with backups

**Total setup time:** ~10 minutes
**Total cost:** **$0/month**
**Total awesomeness:** 🚀🎉

---

## 📞 Quick Reference

```bash
# Deploy to Vercel
vercel --prod

# View logs
vercel logs

# Add environment variable
vercel env add VARIABLE_NAME production

# Run migrations (locally → Neon)
export DATABASE_URL="your-neon-url"
pnpm db:migrate

# Import more books
pnpm db:import -- --limit 500

# Open Drizzle Studio
pnpm db:studio

# Generate new migration
pnpm db:generate
```

---

**Ready to deploy? Let's go! 🚀**

1. Create Neon database: https://neon.tech
2. Deploy to Vercel: https://vercel.com/new
3. Run migrations
4. You're live!
