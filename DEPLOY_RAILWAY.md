# Deploy Librarium to Railway - Complete Guide

Quick guide to deploy your Dockerized Librarium app to Railway in minutes.

## Prerequisites

- GitHub account (to connect your repo)
- Railway account (free): https://railway.app

---

## Method 1: GitHub Deploy (Recommended - No CLI needed)

### Step 1: Push Code to GitHub

Your code is already on GitHub in the branch:
`claude/docker-postgres-pragma-setup-011CV4h3hnLZYTjWWuL3P5cH`

Merge to main or deploy from this branch directly.

### Step 2: Create Railway Project

1. Visit: https://railway.app
2. Click "Start a New Project"
3. Click "Deploy from GitHub repo"
4. Authorize GitHub and select your repository
5. Select the branch

### Step 3: Add PostgreSQL Database

1. In your Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway automatically provisions a database

### Step 4: Configure Environment Variables

Railway will ask you to set environment variables. Add these:

```bash
# Required
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}

# Optional (for better book data)
GOOGLE_BOOKS_API_KEY=your-api-key-if-you-have-one

# Auto-setup (first deploy only)
AUTO_MIGRATE=true
AUTO_SEED=true
AUTO_IMPORT_BOOKS=true
```

**Note:** Railway automatically sets `DATABASE_URL` for you!

### Step 5: Deploy

1. Click "Deploy"
2. Railway will:
   - Build your Docker image
   - Start PostgreSQL
   - Run migrations
   - Seed data
   - Import 200 books
   - Provide a public URL

### Step 6: Access Your App

Railway will provide a URL like:
`https://librarium-production.up.railway.app`

Login with:
- **Email:** director@librarium.com
- **Password:** password123

---

## Method 2: CLI Deploy (Advanced)

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

### Step 2: Login

```bash
railway login
```

This opens a browser for authentication.

### Step 3: Initialize Project

```bash
# From your project directory
cd /home/user/librarium

# Initialize Railway project
railway init
```

Choose:
- "Create a new project"
- Give it a name: "librarium"

### Step 4: Add PostgreSQL

```bash
railway add --plugin postgresql
```

Railway provisions a PostgreSQL database and sets `DATABASE_URL` automatically.

### Step 5: Set Environment Variables

```bash
# Generate secret
railway variables set NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Set auth URL (get your Railway domain first)
railway variables set NEXTAUTH_URL=https://your-app.up.railway.app

# Auto-setup for first deploy
railway variables set AUTO_MIGRATE=true
railway variables set AUTO_SEED=true
railway variables set AUTO_IMPORT_BOOKS=true

# Optional: Google Books API
railway variables set GOOGLE_BOOKS_API_KEY=your-key-here
```

### Step 6: Deploy

```bash
railway up
```

Railway will:
1. Upload your code
2. Build Docker image from your Dockerfile
3. Start the container
4. Run health checks
5. Provide a public URL

### Step 7: Get Your URL

```bash
railway domain
```

Or visit the Railway dashboard to see your URL.

---

## Configuration Details

### Dockerfile Usage

Railway automatically detects and uses your `Dockerfile`. No changes needed!

### Database Connection

Railway sets these environment variables automatically:
- `DATABASE_URL` - Full PostgreSQL connection string
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`

Your app uses `DATABASE_URL` which Railway provides.

### Health Checks

Railway monitors your app using the health check endpoint:
`/api/health`

This was already created in your app!

---

## Post-Deployment Steps

### 1. Verify Database Setup

Check Railway logs to ensure:
- ✅ Migrations ran successfully
- ✅ Test data was seeded
- ✅ Books were imported

```bash
# CLI method
railway logs

# Or view in Railway dashboard
```

### 2. Test the Application

Visit your Railway URL and:
1. Login as director@librarium.com / password123
2. Navigate to Admin → Books
3. Verify 200+ books are present
4. Test book checkout flow

### 3. Disable Auto-Setup (Important!)

After first successful deploy, disable auto-setup to prevent re-running on every deploy:

```bash
railway variables set AUTO_MIGRATE=false
railway variables set AUTO_SEED=false
railway variables set AUTO_IMPORT_BOOKS=false
```

Or in the Railway dashboard:
Settings → Variables → Remove or set to false

### 4. Set Up Custom Domain (Optional)

1. In Railway dashboard, go to Settings → Domains
2. Click "Add Domain"
3. Add your custom domain: librarium.yourdomain.com
4. Update DNS records as shown by Railway
5. Update `NEXTAUTH_URL` to your custom domain

---

## Automatic Deployments

Railway automatically deploys when you:
- Push to your connected GitHub branch
- Merge pull requests
- Make commits

To deploy a different branch:
1. Railway dashboard → Settings
2. Change "Production Branch"

---

## Monitoring & Logs

### View Logs

**CLI:**
```bash
railway logs
```

**Dashboard:**
- Click on your service
- Click "View Logs"
- Real-time logs appear

### Metrics

Railway dashboard shows:
- CPU usage
- Memory usage
- Network traffic
- Request count

### Health Status

Your `/api/health` endpoint returns:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "database": "connected"
}
```

---

## Database Management

### Access PostgreSQL

**Get connection string:**
```bash
railway variables get DATABASE_URL
```

**Connect via psql:**
```bash
railway run psql $DATABASE_URL
```

**Or from Railway dashboard:**
1. Click on PostgreSQL service
2. Click "Connect"
3. Copy connection details

### Backups

Railway automatically backs up your PostgreSQL database.

**Manual backup:**
```bash
railway run pg_dump $DATABASE_URL > backup.sql
```

### Restore

```bash
cat backup.sql | railway run psql $DATABASE_URL
```

---

## Scaling

### Vertical Scaling (More Resources)

1. Railway dashboard → Service → Settings
2. Adjust:
   - Memory limit
   - CPU priority
   - Restart policy

### Horizontal Scaling (Multiple Instances)

Railway Pro plan supports multiple replicas:
1. Settings → Scaling
2. Set replica count

**Note:** Requires session affinity for NextAuth.js

---

## Troubleshooting

### Issue: Build Fails

**Check:**
1. Railway logs for build errors
2. Ensure all dependencies in package.json
3. Verify Dockerfile is valid

**Solution:**
```bash
# Test build locally
docker build -t librarium .
```

### Issue: Database Connection Failed

**Check:**
1. `DATABASE_URL` is set (Railway sets automatically)
2. PostgreSQL service is running
3. Health check in Railway dashboard

**Solution:**
```bash
# Check variables
railway variables

# Restart services
railway restart
```

### Issue: Migration Errors

**Check:**
1. Railway logs during startup
2. Ensure AUTO_MIGRATE=true for first deploy

**Solution:**
```bash
# Manually run migrations
railway run pnpm db:migrate
```

### Issue: Books Not Importing

**Check:**
1. AUTO_IMPORT_BOOKS=true
2. Network connectivity from Railway
3. Open Library API is accessible

**Solution:**
```bash
# Manually import
railway run pnpm db:import:200
```

### Issue: 503 Errors

**Check:**
1. Health check endpoint: /api/health
2. Container logs
3. Memory limits

**Solution:**
- Increase memory in Railway settings
- Check for application errors in logs

---

## Cost Optimization

### Current Usage Estimate

For a library app with moderate traffic:

| Resource | Usage | Cost |
|----------|-------|------|
| **Web Service** | ~$5-8/month | Included in $5 credit initially |
| **PostgreSQL** | ~$5-10/month | Included in $5 credit initially |
| **Total** | ~$10-18/month | After free credit |

### Optimization Tips

1. **Disable auto-import after first deploy**
   - Saves startup time and resources

2. **Optimize database**
   - Railway charges for storage
   - Regular cleanup of old logs/activity

3. **Use caching**
   - Reduce database queries
   - Use React Query effectively

4. **Monitor usage**
   - Railway dashboard shows costs
   - Set up spending alerts

---

## Production Checklist

Before going live:

- [ ] Change `NEXTAUTH_SECRET` (use strong random value)
- [ ] Set up custom domain
- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Disable auto-import: `AUTO_IMPORT_BOOKS=false`
- [ ] Set up Google OAuth (optional)
- [ ] Configure email service (Resend)
- [ ] Test all user flows
- [ ] Set up monitoring/alerts
- [ ] Configure database backups
- [ ] Review Railway usage limits
- [ ] Update test user passwords
- [ ] Enable CORS if needed

---

## Security Considerations

### Environment Variables

Never commit these to GitHub:
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_SECRET`
- Database passwords (Railway manages)
- API keys

### Database Security

- Railway PostgreSQL is private by default
- Only accessible from your Railway services
- Automatic backups enabled

### HTTPS

- Railway provides free SSL certificates
- Automatic HTTPS for all domains
- HTTP → HTTPS redirect enabled

---

## Alternative Railway Setup (Using docker-compose.yml)

Railway can also deploy using your `docker-compose.yml`:

### Method: Railway Config File

Create `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "node server.js",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Railway will use this configuration instead of auto-detection.

---

## Support & Resources

### Railway Documentation
- https://docs.railway.app

### Railway Discord
- https://discord.gg/railway (very responsive community)

### Railway Status
- https://status.railway.app

### Pricing
- https://railway.app/pricing
- $5 free credit/month
- Pay-as-you-go after

---

## Quick Command Reference

```bash
# Install CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add PostgreSQL
railway add --plugin postgresql

# Set variables
railway variables set KEY=value

# Deploy
railway up

# View logs
railway logs

# Run commands in Railway environment
railway run <command>

# Get domain
railway domain

# Open dashboard
railway open
```

---

## Summary

Railway deployment is:
- ✅ **5 minutes** from code to production
- ✅ **Automatic** builds and deployments
- ✅ **Zero config** (works with your Dockerfile)
- ✅ **Managed PostgreSQL** included
- ✅ **$5 free credit** to start

**Result:** Your Librarium app running at a public URL with PostgreSQL and 200+ books imported automatically!

---

**Ready to deploy?** Just run:

```bash
railway login
railway init
railway add --plugin postgresql
railway up
```

Done! 🚀
