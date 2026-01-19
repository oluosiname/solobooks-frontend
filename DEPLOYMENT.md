# Deployment Guide - Vercel (GitHub Integration)

This guide covers deploying Solobooks Frontend to Vercel using GitHub integration for automatic deployments.

## 📋 Prerequisites

- [ ] GitHub repository with code pushed
- [ ] Vercel account ([sign up here](https://vercel.com/signup))
- [ ] Backend API deployed and accessible
- [ ] Production Google OAuth credentials configured
- [ ] Production Stripe API keys
- [ ] Sentry project created (optional but recommended)

## 🚀 Initial Deployment

### Step 1: Connect GitHub to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. If first time:
   - Click **"Connect GitHub Account"**
   - Authorize Vercel to access your repositories
   - Select your organization/account
5. Find your `solobooks-frontend` repository
6. Click **"Import"**

### Step 2: Configure Project Settings

Vercel will auto-detect Next.js, but verify these settings:

**Framework Preset:** Next.js  
**Root Directory:** `./` (leave as default)  
**Build Command:** `npm run build`  
**Output Directory:** `.next`  
**Install Command:** `npm install`  
**Node.js Version:** 20.x

Click **"Deploy"** (we'll add environment variables next)

### Step 3: Set Environment Variables

⚠️ **Important**: The first deployment will fail without environment variables. This is expected.

1. In Vercel Dashboard, go to your project
2. Click **Settings** → **Environment Variables**
3. Add each variable below:

#### Required Variables

| Variable Name | Environment | Example Value |
|--------------|-------------|---------------|
| `NEXT_PUBLIC_API_URL` | Production, Preview, Development | `https://api.solobooks.com` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Production, Preview, Development | `123-abc.apps.googleusercontent.com` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Production, Preview | `pk_live_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Development | `pk_test_...` |

#### Optional Variables

| Variable Name | Environment | Example Value |
|--------------|-------------|---------------|
| `NEXT_PUBLIC_SENTRY_DSN` | Production, Preview | `https://xxx@sentry.io/123` |

**How to add:**
1. Enter variable name (e.g., `NEXT_PUBLIC_API_URL`)
2. Enter value (e.g., `https://api.solobooks.com`)
3. Select environments: ✅ Production, ✅ Preview, ✅ Development
4. Click **"Add"**
5. Repeat for all variables

### Step 4: Redeploy with Environment Variables

1. Go to **Deployments** tab
2. Find the failed deployment
3. Click **"..."** → **"Redeploy"**
4. Or push a new commit to trigger deployment

### Step 5: Configure Production Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain (e.g., `app.solobooks.com`)
3. Follow DNS configuration instructions
4. Wait for SSL certificate provisioning (automatic)

## 🔄 Continuous Deployment

Once set up, deployments happen automatically:

### Production Deployments (main branch)

```bash
git checkout main
git pull origin main
# Make your changes
git add .
git commit -m "Your commit message"
git push origin main
```

Vercel automatically:
1. Detects the push
2. Builds the application
3. Runs checks
4. Deploys to production domain

### Preview Deployments (feature branches)

```bash
git checkout -b feature/new-feature
# Make your changes
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
```

Vercel automatically:
1. Creates a preview deployment
2. Generates unique preview URL
3. Comments on PR with preview link
4. Updates preview on every push

## 🔧 Post-Deployment Configuration

### 1. Update Google OAuth

Add your Vercel domains to authorized origins:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your OAuth 2.0 Client ID
3. Add to **Authorized JavaScript origins**:
   ```
   https://your-app.vercel.app
   https://app.yourdomain.com
   ```
4. Add to **Authorized redirect URIs**:
   ```
   https://your-app.vercel.app
   https://app.yourdomain.com
   ```
5. Click **Save**

### 2. Update Backend CORS

Ensure your backend API allows requests from:
- `https://your-app.vercel.app`
- `https://app.yourdomain.com`
- `https://*.vercel.app` (for preview deployments)

### 3. Configure Stripe Webhooks (if applicable)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://your-app.vercel.app/api/webhooks/stripe`
3. Select events to listen to
4. Copy webhook signing secret
5. Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

### 4. Verify Sentry

1. Trigger an error in production
2. Check [Sentry Dashboard](https://sentry.io/)
3. Verify errors are being captured
4. Set up alerts as needed

## 📊 Monitoring Deployments

### Vercel Dashboard

Monitor your deployments:
- **Deployments**: View all deployment history
- **Analytics**: Track Web Vitals and performance
- **Logs**: Real-time function and build logs
- **Speed Insights**: Performance metrics

### GitHub Integration

Deployment status shown in:
- GitHub commit statuses
- Pull request checks
- PR comments with preview URLs

## 🐛 Troubleshooting

### Deployment Failed

**Check build logs:**
1. Go to Vercel Dashboard → Deployments
2. Click on failed deployment
3. View build logs for errors

**Common issues:**
- Missing environment variables
- TypeScript errors
- Linting errors
- Build command issues

**Solution:**
```bash
# Test build locally first
npm run build

# Fix any errors
npm run lint:fix
npm test
```

### Environment Variables Not Working

**Symptoms:**
- App works locally but not on Vercel
- "Configuration error" messages
- OAuth/Stripe not working

**Solution:**
1. Verify variables in Vercel Settings → Environment Variables
2. Ensure variable names start with `NEXT_PUBLIC_` for client-side access
3. Check correct environment selected (Production/Preview/Development)
4. Redeploy after adding variables

### Preview Deployments Not Working

**Check:**
1. GitHub integration is connected
2. Vercel has access to repository
3. Branch protection rules aren't blocking

**Reconnect if needed:**
1. Go to Vercel Account Settings → Git
2. Reconnect GitHub integration

### "API Connection Failed" in Production

**Check:**
1. `NEXT_PUBLIC_API_URL` is set correctly
2. Backend API is accessible from Vercel (public URL)
3. Backend CORS allows Vercel domain
4. Backend is running and healthy

## 🔐 Security Best Practices

### Environment Variables
- ✅ Use different keys for preview vs production
- ✅ Never commit `.env.local` to git
- ✅ Rotate keys regularly
- ✅ Use Vercel's encrypted environment variables

### Domains
- ✅ Always use HTTPS (automatic on Vercel)
- ✅ Configure custom domain with proper SSL
- ✅ Use secure headers (configured in `next.config.ts`)

### Access Control
- ✅ Limit Vercel project access to team members only
- ✅ Use GitHub branch protection on `main`
- ✅ Require PR reviews before merging
- ✅ Enable deployment protection rules

## 📈 Optimization

### Build Performance

**Enable caching:**
```bash
# Automatically enabled on Vercel
# Uses build cache for dependencies and Next.js cache
```

**Optimize bundle size:**
```bash
# Analyze bundle
npm run build
# Check .next/analyze (if configured)
```

### Runtime Performance

**Vercel automatically provides:**
- Edge network CDN
- Image optimization
- Automatic compression
- HTTP/2 and HTTP/3
- Smart caching headers

## 🔄 Rollback Process

If a deployment has issues:

### Method 1: Vercel Dashboard
1. Go to **Deployments**
2. Find last working deployment
3. Click **"..."** → **"Promote to Production"**

### Method 2: Git Revert
```bash
# Revert last commit
git revert HEAD
git push origin main

# Or revert to specific commit
git revert <commit-hash>
git push origin main
```

### Method 3: Instant Rollback
1. In Vercel Dashboard → Deployments
2. Click **"..."** on previous deployment
3. Click **"Promote to Production"**
4. Instant rollback (no rebuild needed)

## 📞 Getting Help

- **Vercel Documentation**: https://vercel.com/docs
- **Vercel Support**: support@vercel.com
- **GitHub Issues**: Report deployment issues in repo
- **Team Contact**: team@solobooks.com

## ✅ Deployment Checklist

Use this checklist for each major deployment:

- [ ] All tests passing locally (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] Build successful locally (`npm run build`)
- [ ] Environment variables updated in Vercel
- [ ] Google OAuth origins updated
- [ ] Backend CORS updated
- [ ] Stripe webhooks configured (if changed)
- [ ] Database migrations run (if applicable)
- [ ] Feature flags configured (if applicable)
- [ ] Monitoring alerts configured
- [ ] Team notified of deployment
- [ ] Smoke test on production after deploy
- [ ] Rollback plan ready

## 🎯 Quick Commands Reference

```bash
# Check deployment status
vercel ls

# View deployment logs
vercel logs [deployment-url]

# Pull environment variables to local
vercel env pull .env.local

# Link local project to Vercel
vercel link

# Deploy from CLI (if needed)
vercel --prod
```
