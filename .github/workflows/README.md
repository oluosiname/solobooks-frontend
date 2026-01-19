# GitHub Actions Workflows

This directory contains automated CI/CD workflows for the Solobooks Frontend project.

## 🔄 Workflows Overview

### CI Pipeline (`ci.yml`)

**Triggers:** Push to `main`/`develop`, Pull Requests

**Jobs:**
1. **Lint** - Runs ESLint to check code quality
2. **Test** - Runs Vitest unit tests with coverage report
3. **Build** - Verifies production build succeeds
4. **Type Check** - Validates TypeScript types
5. **CI Success** - Confirms all checks passed

**Features:**
- ⚡ Parallel job execution for faster feedback
- 📊 Coverage reports uploaded as artifacts
- ✅ Automatic PR comments on success
- 🚫 Cancels in-progress runs on new pushes

### Security Analysis (`codeql.yml`)

**Triggers:** Push, Pull Requests, Weekly schedule (Mondays 6 AM UTC)

**Purpose:** Automated security vulnerability scanning using GitHub CodeQL

**Features:**
- 🔒 Detects security vulnerabilities
- 📈 Security-extended query suite
- 🔔 Creates GitHub Security Advisories for findings

### Dependency Review (`dependency-review.yml`)

**Triggers:** Pull Requests only

**Purpose:** Reviews dependency changes for security vulnerabilities

**Features:**
- 🛡️ Fails on high/critical vulnerabilities
- 📝 Comments on PR with findings
- 🔍 Checks for license compatibility

### PR Labeler (`pr-labeler.yml`)

**Triggers:** PR open, synchronize, or reopen

**Purpose:** Automatically labels PRs based on:
- Files changed (components, API, tests, etc.)
- PR size (XS, S, M, L, XL)

**Benefits:**
- 🏷️ Better organization
- 👀 Quick identification of change scope
- 📊 Metrics on PR complexity

### Stale Management (`stale.yml`)

**Triggers:** Daily at 1:00 AM UTC

**Purpose:** Manages inactive issues and PRs

**Settings:**
- Issues: Stale after 60 days, close after 7 more days
- PRs: Stale after 30 days, close after 7 more days
- Exempt labels: `bug`, `security`, `enhancement`, `help wanted`, `work in progress`, `on hold`

## 🚀 Workflow Status Badges

Add these to your README.md:

```markdown
[![CI](https://github.com/YOUR_ORG/solobooks-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_ORG/solobooks-frontend/actions/workflows/ci.yml)
[![CodeQL](https://github.com/YOUR_ORG/solobooks-frontend/actions/workflows/codeql.yml/badge.svg)](https://github.com/YOUR_ORG/solobooks-frontend/actions/workflows/codeql.yml)
```

## 📋 Pull Request Workflow

When you create a PR, the following happens automatically:

1. ✅ **CI Checks Run**
   - Linting
   - Unit tests
   - Build verification
   - Type checking

2. 🏷️ **Auto-Labeling**
   - Size label (XS-XL)
   - Category labels (components, API, etc.)

3. 🔒 **Security Checks**
   - Dependency review
   - CodeQL analysis (if code files changed)

4. 💬 **Status Comments**
   - Success/failure notifications
   - Coverage reports
   - Dependency findings

## 🛠️ Local Testing Before Push

Run these commands locally to catch issues before CI:

```bash
# Run linter
npm run lint

# Run tests
npm test

# Check types
npx tsc --noEmit

# Build
npm run build
```

Or run all checks at once:

```bash
npm run lint && npm test -- --run && npx tsc --noEmit && npm run build
```

## 🔧 Configuration

### Environment Variables for CI

The CI workflow uses mock environment variables for testing and building.
These are defined in each workflow job under the `env` section.

**For Tests:**
```yaml
NEXT_PUBLIC_API_URL: http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID: test-client-id
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: pk_test_mock
NEXT_PUBLIC_SENTRY_DSN: ''
```

### Customizing Workflows

#### Change Node.js Version

Edit the `node-version` in any workflow:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'  # Change this
```

#### Modify Test Coverage Threshold

Update `vitest.config.ts` to set coverage thresholds:

```typescript
export default defineConfig({
  test: {
    coverage: {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
  },
});
```

#### Add New Auto-Labels

Edit `.github/labeler.yml` to add new label patterns:

```yaml
'new-label':
  - changed-files:
    - any-glob-to-any-file: ['path/to/files/**/*']
```

## 📊 Viewing Results

### GitHub Actions Tab

1. Go to repository → **Actions** tab
2. Select a workflow from the left sidebar
3. Click on a specific run to see details
4. View logs for each job

### PR Checks

1. Open any Pull Request
2. Scroll to **Checks** section
3. See status of all workflows
4. Click **Details** to view logs

### Coverage Reports

1. Go to Actions tab
2. Click on a CI workflow run
3. Scroll to **Artifacts** section
4. Download `coverage-report`

## 🚨 Troubleshooting

### CI Failing on Lint

```bash
# Fix locally
npm run lint:fix
git add .
git commit -m "Fix linting issues"
git push
```

### CI Failing on Tests

```bash
# Run tests locally with verbose output
npm test -- --reporter=verbose

# Fix failing tests
# Commit and push changes
```

### CI Failing on Build

```bash
# Build locally to see errors
npm run build

# Common issues:
# - Missing environment variables (add mocks to workflow)
# - TypeScript errors (fix in code)
# - Import errors (check file paths)
```

### Type Check Failing

```bash
# Run locally
npx tsc --noEmit

# Fix TypeScript errors
# Commit and push
```

## 📚 Best Practices

1. **Always run checks locally** before pushing
2. **Keep PRs small** for faster CI runs
3. **Write tests** for new features
4. **Update docs** when changing workflows
5. **Monitor workflow runs** in Actions tab
6. **Fix failing checks immediately** - don't merge broken code

## 🔗 Related Documentation

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel + GitHub Integration](../DEPLOYMENT.md)
- [Testing Guide](../../README.md#-testing)
- [Contributing Guidelines](../../README.md#-contributing)

## 🆘 Getting Help

If workflows are failing and you can't figure out why:

1. Check the Actions tab for detailed logs
2. Look for error messages in the job output
3. Compare with successful runs
4. Ask in team chat or create an issue
5. Tag `@devops` for workflow-specific issues
