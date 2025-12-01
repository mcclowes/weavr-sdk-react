# Contributing to @weavr/react-sdk

Thank you for your interest in contributing to the Weavr React SDK! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone. Please be considerate and constructive in your communications.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Add the upstream repository as a remote:
   ```bash
   git remote add upstream https://github.com/weavr-io/weavr-sdk-react.git
   ```

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Install dependencies
npm install

# Set up Husky hooks
npm run prepare

# Start development mode
npm run dev
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development mode with watch |
| `npm run build` | Build the library for production |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run lint` | Check for linting errors |
| `npm run lint:fix` | Fix linting errors automatically |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run storybook` | Start Storybook dev server |
| `npm run build-storybook` | Build Storybook for deployment |

## Making Changes

1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. Make your changes following the [coding standards](#coding-standards)

3. Write or update tests as needed

4. Run the full test suite:
   ```bash
   npm run test:run
   npm run lint
   npm run typecheck
   ```

5. Commit your changes following the [commit guidelines](#commit-guidelines)

## Commit Guidelines

We follow conventional commit messages. Each commit message should have a structured format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring without feature changes
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates

### Examples

```
feat(SecureInput): add support for custom validation messages
fix(KYC): resolve callback not firing on completion
docs(README): add troubleshooting section
chore(deps): update storybook to v8.6.12
```

## Pull Request Process

1. Ensure your branch is up to date with `main`:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

3. Create a Pull Request against the `main` branch

4. Fill out the PR template with:
   - Description of changes
   - Related issue numbers
   - Testing performed
   - Screenshots (if applicable)

5. Wait for review and address any feedback

### PR Checklist

- [ ] Tests pass (`npm run test:run`)
- [ ] Linting passes (`npm run lint`)
- [ ] Type checking passes (`npm run typecheck`)
- [ ] Documentation updated (if applicable)
- [ ] Storybook stories updated (if applicable)
- [ ] CHANGELOG.md updated

## Coding Standards

### TypeScript

- Use TypeScript for all source files
- Prefer explicit types over `any`
- Export types that consumers might need
- Use interfaces for object shapes, types for unions/primitives

### React

- Use functional components with hooks
- Use proper cleanup in `useEffect`
- Forward refs when wrapping DOM elements
- Handle loading and error states

### Naming Conventions

- **Components**: PascalCase (e.g., `SecureInput`)
- **Hooks**: camelCase with `use` prefix (e.g., `useSecureForm`)
- **Files**: Match the export name (e.g., `SecureInput.tsx`)
- **Types/Interfaces**: PascalCase (e.g., `SecureInputProps`)

### File Organization

```
src/
├── components/     # React components
├── hooks/          # Custom React hooks
├── __tests__/      # Test files
├── stories/        # Storybook stories
├── client.ts       # Core client functions
├── context.tsx     # React context
├── types.ts        # TypeScript definitions
└── index.ts        # Public exports
```

## Testing

### Running Tests

```bash
# Run in watch mode
npm run test

# Run once
npm run test:run

# Run with coverage
npm run test:run -- --coverage
```

### Writing Tests

- Place tests in `src/__tests__/`
- Name test files as `*.test.ts` or `*.test.tsx`
- Mock external dependencies (Weavr client)
- Test both success and error scenarios

### Test Structure

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('ComponentName', () => {
  it('should do something', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

## Documentation

### Code Comments

- Add JSDoc comments to exported functions and types
- Explain "why" not "what" in inline comments
- Keep comments up to date with code changes

### Storybook

- Create stories for new components
- Include multiple variants/states
- Add interactive controls
- Write documentation in MDX format

### README

- Update README.md for new features
- Include code examples
- Document breaking changes

## Questions?

If you have questions or need help, please:

1. Check existing issues and discussions
2. Open a new issue with the "question" label
3. Reach out to the maintainers

Thank you for contributing!
