# Development, Verification & Testing

This document details local development workflows, environment configuration, testing procedures, and framework-specific invariants.

---

## 1. Environment Configuration

Copy `.env.example` to `.env` and provide the following variables:

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/job-tracker?retryWrites=true&w=majority

# Better Auth Secret (generate with: openssl rand -base64 32)
BETTER_AUTH_SECRET=your_generated_secret_here

# Base URL for auth callbacks and sessions
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```

---

## 2. Standard Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Starts the Next.js development server with Turbopack (`http://localhost:3000`) |
| `npm run build` | Compiles the production build with Turbopack and static optimization |
| `npm run lint` | Runs ESLint 9 checks against all app and component files |
| `npx tsc --noEmit` | Runs full TypeScript static type checking without emitting JS |
| `npx tsx scripts/seed.ts` | Populates MongoDB with sample jobs across all Kanban columns |

---

## 3. Strict Coding Invariants

### React 19 / ESLint 9 Rules
1. **No Synchronous `setState` in `useEffect`**: Calling `setState` synchronously in an effect causes cascading re-renders and is flagged as an ESLint error. Compute derived state in render or adjust state during render when a key prop changes.
2. **Deterministic `useMemo` Dependencies**: If deriving filtered lists from deeply nested objects, assign local variables before memoization to prevent unstable reference loops:
   ```ts
   const columns = board?.columns;
   const filteredColumns = useMemo(() => { ... }, [columns, searchQuery, selectedTag]);
   ```

### Server Action Return Contracts
All Server Actions returning results to TanStack Query hooks must return a consistent shape:
```ts
// Always return both error and data (or error and success)
return { error: null, data: JSON.parse(JSON.stringify(resultDoc)) };
// On failure:
return { error: "Specific error message", data: null };
```
Omitting `error: null` from success returns produces union types in TypeScript that break client-side `if (res.error)` assertions.

### Peer Dependency Management
- Better Auth uses Zod internally, while `@hookform/resolvers` requires Zod v3.
- Standard packages: `zod@^3.24.2` and `@hookform/resolvers@^3.10.0`.
- Do not upgrade Zod to v4 without updating form resolver bridges.

---

## 4. Pre-Commit / Pre-PR Verification Checklist

Before pushing any changes or completing an agent task, ensure all three pass with 0 errors and 0 warnings:
```bash
npm run lint
npx tsc --noEmit
npm run build
```
