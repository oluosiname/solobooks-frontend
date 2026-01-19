# Solobooks Frontend

Professional accounting and invoicing application for freelancers and small businesses. Built with Next.js 16, React 19, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Authentication**: Email/password and Google OAuth integration
- **Client Management**: Track clients with invoicing history
- **Invoice Generation**: Create and manage professional invoices
- **Transaction Tracking**: Monitor income and expenses
- **Bank Connections**: Sync transactions from bank accounts
- **VAT/Tax Reports**: Generate compliance reports
- **P&L Reports**: Profit and loss statements with visualizations
- **Multi-language Support**: English and German (i18n ready)
- **Subscription Management**: Tiered plans with Stripe integration
- **Error Monitoring**: Sentry integration for production monitoring

## 📋 Prerequisites

- **Node.js**: 20.x or later
- **npm**: 9.x or later (comes with Node.js)
- **Backend API**: Solobooks backend server running (see backend repo)

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management**: [TanStack Query (React Query)](https://tanstack.com/query)
- **Forms**: React hooks with custom validation
- **Authentication**: JWT with automatic token refresh
- **Payments**: [Stripe](https://stripe.com/)
- **Error Tracking**: [Sentry](https://sentry.io/)
- **Internationalization**: [next-intl](https://next-intl-docs.vercel.app/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Testing**: [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/react)

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/solobooks-frontend.git
cd solobooks-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

```env
# Required
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key

# Optional (recommended for production)
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

#### Environment Variable Details:

| Variable | Required | Description | Where to Get |
|----------|----------|-------------|--------------|
| `NEXT_PUBLIC_API_URL` | ✅ Yes | Backend API base URL | Your backend server URL |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | ✅ Yes | Google OAuth Client ID | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ Yes | Stripe Publishable Key | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
| `NEXT_PUBLIC_SENTRY_DSN` | ⚠️ Optional | Sentry error tracking DSN | [Sentry Project Settings](https://sentry.io/) |

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3001](http://localhost:3001)

## 🔧 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3001 |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server on port 3001 |
| `npm run lint` | Run ESLint to check code quality |
| `npm run lint:fix` | Run ESLint and auto-fix issues |
| `npm test` | Run tests with Vitest |
| `npm run test:ui` | Run tests with UI interface |
| `npm run test:coverage` | Generate test coverage report |

### Project Structure

```
solobooks-frontend/
├── public/                  # Static assets (images, icons, manifest)
├── src/
│   ├── app/                # Next.js App Router pages and layouts
│   │   ├── api/           # API routes
│   │   ├── login/         # Login page
│   │   ├── register/      # Registration page
│   │   ├── clients/       # Client management
│   │   ├── invoices/      # Invoice management
│   │   ├── transactions/  # Transaction tracking
│   │   ├── reports/       # Financial reports
│   │   ├── settings/      # User settings
│   │   └── ...
│   ├── components/         # React components
│   │   ├── atoms/         # Basic UI components (Button, Input, etc.)
│   │   ├── molecules/     # Composite components (InputField, etc.)
│   │   ├── organisms/     # Complex components (DataTable, etc.)
│   │   ├── layout/        # Layout components (Header, Sidebar, etc.)
│   │   └── ...
│   ├── contexts/          # React contexts (AuthContext)
│   ├── lib/               # API clients and utilities
│   │   ├── auth-api.ts    # Authentication API
│   │   ├── base-api.ts    # Base API client with auth handling
│   │   ├── clients-api.ts # Clients API
│   │   └── ...
│   ├── services/          # Business logic and data transformation
│   ├── types/             # TypeScript type definitions
│   ├── messages/          # i18n translation files (en.json, de.json)
│   └── test/              # Test configuration and utilities
├── .env.example           # Example environment variables
├── .gitignore             # Git ignore rules
├── next.config.ts         # Next.js configuration
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vitest.config.ts       # Vitest test configuration
└── README.md              # This file
```

### Architecture

#### Authentication Flow

1. User logs in via email/password or Google OAuth
2. Backend returns JWT access token (1 hour) and refresh token (30 days)
3. Tokens stored in localStorage (consider httpOnly cookies for production)
4. `AuthContext` manages authentication state
5. `RouteGuard` protects routes requiring authentication
6. Automatic token refresh 10 minutes before expiry
7. API client automatically retries requests with refreshed token on 401

#### Data Flow

```
User Interaction → Component → API Client (lib/) → Backend API
                                     ↓
                              Data Transformer (camelize)
                                     ↓
                              React Query Cache
                                     ↓
                              Component Re-render
```

#### Key Patterns

- **API Communication**: All API calls use `BaseApiClient` with automatic auth handling
- **Data Transformation**: Backend snake_case → Frontend camelCase using `humps`
- **State Management**: TanStack Query for server state, Context API for auth state
- **Error Handling**: Global `ErrorBoundary` + Sentry integration
- **Route Protection**: `RouteGuard` component wraps all routes
- **Internationalization**: next-intl with locale detection and persistence

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Test Structure

- Unit tests: `**/__tests__/*.test.ts(x)`
- Testing utilities: `src/test/setup.ts`
- Current coverage: Auth, RouteGuard, Login, Register pages

## 🚢 Deployment

### Environment Setup

1. **Backend API**: Ensure backend is deployed and accessible
2. **Google OAuth**: Add production domain to authorized origins
3. **Stripe**: Use live API keys for production
4. **Sentry**: Create production project and get DSN

### Vercel Deployment (Recommended)

This project deploys to Vercel via GitHub integration for automatic deployments on every push.

#### Initial Setup

1. **Push to GitHub**:
   ```bash
   git push origin main
   ```

2. **Import Project to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Build Settings**:
   Vercel will auto-detect Next.js settings, but verify:
   - Framework Preset: `Next.js`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
   - Node Version: `20.x`

4. **Set Environment Variables**:
   - In Vercel Dashboard, go to: Project → Settings → Environment Variables
   - Add all variables from `.env.example`:
   
   **Production Environment:**
   ```
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-production-client-id.apps.googleusercontent.com
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-production-key
   NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
   ```
   
   - Set Environment: `Production`, `Preview`, and `Development` (as needed)
   - Click "Save"

5. **Deploy**:
   - Click "Deploy" button in Vercel Dashboard
   - Or push to your GitHub repository (automatic deployment)

#### Automatic Deployments

Once connected, Vercel automatically deploys:
- **Production**: Every push to `main` branch
- **Preview**: Every push to feature branches and PRs

#### Post-Deployment Checklist

- [ ] Update Google OAuth authorized origins with Vercel domain
- [ ] Update backend CORS settings to allow Vercel domain
- [ ] Verify Stripe webhooks point to production domain
- [ ] Test authentication flow on production
- [ ] Verify Sentry is capturing errors
- [ ] Check all environment variables are set correctly

#### Deployment Commands (Optional - CLI)

If you prefer CLI deployment:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Build-time environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_SENTRY_DSN

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3001
ENV PORT=3001

CMD ["node", "server.js"]
```

Build and run:

```bash
docker build -t solobooks-frontend \
  --build-arg NEXT_PUBLIC_API_URL=https://api.yourdomain.com \
  --build-arg NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id \
  --build-arg NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx \
  --build-arg NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx \
  .

docker run -p 3001:3001 solobooks-frontend
```

### Manual Deployment (Any Host)

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Set environment variables** on your host

3. **Start production server**:
   ```bash
   npm run start
   ```

4. **Configure reverse proxy** (nginx example):
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 🔒 Security Considerations

### Production Checklist

- [ ] Use HTTPS for all connections
- [ ] Set `NEXT_PUBLIC_API_URL` to HTTPS backend URL
- [ ] Use production Stripe keys (pk_live_...)
- [ ] Configure CSP headers in `next.config.ts`
- [ ] Consider moving tokens to httpOnly cookies
- [ ] Enable rate limiting on backend
- [ ] Review and update CORS settings on backend
- [ ] Set up monitoring and alerting
- [ ] Regular security audits
- [ ] Keep dependencies updated

## 🐛 Troubleshooting

### Common Issues

**Issue**: Build fails with "Module not found"
```bash
# Solution: Clear cache and reinstall
rm -rf .next node_modules
npm install
```

**Issue**: "Google OAuth not configured" error
```bash
# Solution: Verify NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local
# Ensure domain is authorized in Google Cloud Console
```

**Issue**: "Stripe not properly configured" error
```bash
# Solution: Check NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# Verify it starts with pk_test_ or pk_live_
```

**Issue**: API requests failing with CORS errors
```bash
# Solution: Ensure backend allows your frontend domain
# Check backend CORS configuration
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TanStack Query Documentation](https://tanstack.com/query/latest/docs/react/overview)
- [Stripe Documentation](https://stripe.com/docs)

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes and test thoroughly
3. Run linter: `npm run lint:fix`
4. Run tests: `npm test`
5. Commit changes: `git commit -m "Add my feature"`
6. Push to branch: `git push origin feature/my-feature`
7. Create Pull Request

## 📄 License

Proprietary - All rights reserved

## 👥 Team

Solobooks Development Team

## 📞 Support

For issues or questions:
- Create an issue in the repository
- Contact: support@solobooks.com
