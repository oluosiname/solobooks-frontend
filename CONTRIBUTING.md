# Contributing to Solobooks Frontend

Thank you for your interest in contributing! This guide will help you get started.

## 🎯 Quick Start

1. **Fork the repository** and clone your fork
2. **Set up your environment** - see [SETUP.md](./SETUP.md)
3. **Create a feature branch** from `main`
4. **Make your changes** following our guidelines below
5. **Test thoroughly** - run all checks locally
6. **Submit a Pull Request** using our template

## 📋 Before You Start

- Check existing issues and PRs to avoid duplicate work
- Discuss major changes in an issue first
- Keep changes focused and atomic
- Follow the existing code style

## 🔧 Development Workflow

### 1. Set Up Your Environment

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/solobooks-frontend.git
cd solobooks-frontend

# Add upstream remote
git remote add upstream https://github.com/YOUR_ORG/solobooks-frontend.git

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Start development server
npm run dev
```

### 2. Create a Feature Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create and switch to feature branch
git checkout -b feature/your-feature-name
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates
- `chore/` - Maintenance tasks

### 3. Make Your Changes

Follow these guidelines:

#### Code Style

- Use TypeScript - no `any` types without justification
- Follow existing code patterns
- Use meaningful variable and function names
- Keep functions small and focused
- Add comments for complex logic

#### Component Structure

```typescript
// components/atoms/MyComponent.tsx
import { forwardRef } from "react";

export interface MyComponentProps {
  // Define props with JSDoc comments
}

export const MyComponent = forwardRef<HTMLDivElement, MyComponentProps>(
  ({ prop1, prop2, ...props }, ref) => {
    // Component logic
    return (
      <div ref={ref} {...props}>
        {/* Component JSX */}
      </div>
    );
  }
);

MyComponent.displayName = "MyComponent";
```

#### API Calls

- Always use existing API clients from `src/lib/`
- Use `camelize` for transforming API responses
- Use `humps.decamelizeKeys` for requests to backend
- Handle errors properly with try/catch

```typescript
import { clientsApi } from "@/lib/clients-api";
import { camelize } from "@/services/api-transformer";

const fetchData = async () => {
  try {
    const response = await clientsApi.getClients();
    return camelize(response.data);
  } catch (error) {
    showToast.apiError(error, "Failed to fetch clients");
    throw error;
  }
};
```

### 4. Write Tests

All new features should include tests:

```typescript
// components/__tests__/MyComponent.test.tsx
import { render, screen } from "@testing-library/react";
import { MyComponent } from "../MyComponent";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Expected text")).toBeInTheDocument();
  });
});
```

### 5. Run All Checks Locally

**Before pushing, run all CI checks locally:**

```bash
# Linting
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Type checking
npx tsc --noEmit

# Build verification
npm run build
```

**Quick check all at once:**

```bash
npm run lint && npm test -- --run && npx tsc --noEmit && npm run build
```

### 6. Commit Your Changes

Follow conventional commit format:

```bash
git add .
git commit -m "feat: add new feature"
```

**Commit types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Test additions/updates
- `chore:` - Maintenance tasks
- `perf:` - Performance improvements
- `ci:` - CI/CD changes

**Examples:**
```bash
git commit -m "feat: add client export functionality"
git commit -m "fix: resolve authentication token refresh issue"
git commit -m "docs: update deployment guide"
git commit -m "test: add unit tests for invoice creation"
```

### 7. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create PR on GitHub
# Use the PR template to fill in details
```

## 🔍 Pull Request Process

### PR Template

When you create a PR, fill out the template completely:

- **Description**: What does this PR do?
- **Type of Change**: Bug fix, feature, etc.
- **Related Issue**: Link to issue (if applicable)
- **Changes Made**: Bullet list of changes
- **Screenshots**: For UI changes
- **Testing**: How to test the changes
- **Checklist**: Mark all completed items

### CI Checks

Your PR will automatically trigger:

1. **Lint Check** - ESLint validation
2. **Test Suite** - All unit tests
3. **Type Check** - TypeScript validation
4. **Build Check** - Production build verification
5. **Security Scan** - CodeQL analysis
6. **Dependency Review** - Vulnerability check

All checks must pass before merge.

### Code Review

- At least one approval required
- Address all review comments
- Keep discussion professional and constructive
- Push updates to the same branch

### After Approval

Once approved and all checks pass:
- Squash commits if needed
- Merge will trigger automatic deployment to preview
- Production deployment happens on merge to `main`

## 🎨 Code Style Guide

### TypeScript

```typescript
// ✅ Good
interface User {
  id: string;
  email: string;
}

const fetchUser = async (id: string): Promise<User> => {
  // Implementation
};

// ❌ Bad
const fetchUser = async (id: any) => {
  // Implementation
};
```

### React Components

```typescript
// ✅ Good - Clean, typed component
interface ButtonProps {
  label: string;
  onClick: () => void;
}

export const Button = ({ label, onClick }: ButtonProps) => {
  return <button onClick={onClick}>{label}</button>;
};

// ❌ Bad - No types, inline styles
export const Button = ({ label, onClick }) => {
  return <button style={{ color: "blue" }} onClick={onClick}>{label}</button>;
};
```

### Imports

```typescript
// ✅ Good - Organized imports
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms";
import { useAuth } from "@/contexts/AuthContext";
import type { User } from "@/types";

// ❌ Bad - Messy imports
import { Button } from "../../components/atoms/Button";
import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";
```

## 🐛 Bug Reports

When reporting bugs, include:

1. **Description** - Clear and concise
2. **Steps to Reproduce** - Numbered list
3. **Expected Behavior** - What should happen
4. **Actual Behavior** - What actually happens
5. **Screenshots** - If applicable
6. **Environment** - Browser, OS, version
7. **Console Errors** - Browser console output

## ✨ Feature Requests

When requesting features:

1. **Use Case** - Why is this needed?
2. **Proposed Solution** - How should it work?
3. **Alternatives** - Other options considered
4. **Additional Context** - Any other info

## 📚 Documentation

When updating documentation:

- Keep it clear and concise
- Include code examples
- Update table of contents if needed
- Check for broken links
- Follow markdown best practices

## 🔒 Security

**Never commit:**
- Actual API keys or secrets
- `.env.local` or any `.env` files
- Sensitive user data
- Passwords or tokens

**If you find a security vulnerability:**
- **Do NOT** create a public issue
- Email security@solobooks.com
- Include detailed description
- We'll respond within 48 hours

## ❓ Getting Help

- **Setup Issues**: See [SETUP.md](./SETUP.md)
- **Deployment**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **CI/CD**: See [`.github/workflows/README.md`](.github/workflows/README.md)
- **Questions**: Open a discussion on GitHub
- **Bugs**: Create an issue with the bug template

## 📞 Contact

- **Email**: dev@solobooks.com
- **GitHub Discussions**: [Link]
- **Slack**: #solobooks-dev (team members only)

## 🙏 Thank You

Your contributions make Solobooks better for everyone. Thank you for taking the time to contribute!

---

**Happy coding! 🚀**
