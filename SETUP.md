# Quick Setup Guide

This is a quick reference for getting Solobooks Frontend up and running. For detailed information, see [README.md](./README.md).

## ⚡ Quick Start (5 minutes)

### 1. Prerequisites
- Node.js 20.x or later
- Backend API running
- Google OAuth credentials
- Stripe account (test mode OK)

### 2. Install & Configure

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your values
nano .env.local  # or use your preferred editor
```

### 3. Minimum Required Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-key
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3001](http://localhost:3001)

## 🔑 Getting API Keys

### Google OAuth (Required)
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Create OAuth 2.0 Client ID
5. Add authorized origins:
   - `http://localhost:3001` (development)
   - `https://yourdomain.com` (production)
6. Copy Client ID to `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

### Stripe (Required)
1. Sign up at [Stripe](https://dashboard.stripe.com/register)
2. Go to [API Keys](https://dashboard.stripe.com/apikeys)
3. Copy "Publishable key" (starts with `pk_test_` for testing)
4. Add to `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Sentry (Optional but Recommended)
1. Sign up at [Sentry.io](https://sentry.io/signup/)
2. Create a new project (JavaScript → Next.js)
3. Copy DSN from project settings
4. Add to `NEXT_PUBLIC_SENTRY_DSN`

## 🧪 Verify Installation

```bash
# Run linter
npm run lint

# Run tests
npm test

# Build for production
npm run build
```

## 🚨 Troubleshooting

### "Google OAuth not configured"
- Check `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set
- Verify Client ID format (ends with `.apps.googleusercontent.com`)
- Ensure localhost:3001 is in authorized origins

### "Stripe not properly configured"
- Check `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Verify key starts with `pk_test_` or `pk_live_`

### "Failed to connect to the server"
- Ensure backend is running
- Check `NEXT_PUBLIC_API_URL` matches backend URL
- Verify CORS is configured on backend

### Port 3001 already in use
```bash
# Find and kill process using port 3001
lsof -ti:3001 | xargs kill -9

# Or use a different port
npm run dev -- -p 3002
```

## 📚 Next Steps

- Read full [README.md](./README.md) for architecture details
- Review [Project Structure](./README.md#project-structure)
- Set up [Testing](./README.md#-testing)
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for Vercel deployment guide

## 🆘 Getting Help

- Check [Troubleshooting](./README.md#-troubleshooting) in README
- Review backend API documentation
- Contact: support@solobooks.com
