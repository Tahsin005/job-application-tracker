# AGENTS.md

Welcome to the **Job Application Tracker** codebase. This repository is a production-grade Kanban web application engineered with Next.js 16 (App Router & Turbopack), React 19, TypeScript, MongoDB (Mongoose), Better Auth, TanStack Query v5, Zustand v5, React Hook Form, Zod v3, and `@dnd-kit`.

To keep documentation clean, maintainable, and modular, detailed guides are organized inside the [`docs/`](file:///home/tahsin005/Downloads/Codes/bits-and-pieces/pets/job-application-tracker/docs) directory.

---

## 📚 Documentation Index

Before implementing features or refactoring code, consult the relevant modular documentation:

| Document | Description | Key Modules Covered |
|---|---|---|
| [**Architecture**](file:///home/tahsin005/Downloads/Codes/bits-and-pieces/pets/job-application-tracker/docs/architecture.md) | High-level system architecture, technology stack, directory structure, and end-to-end data flow. | Tech stack, folder structure, data flow diagram |
| [**State Management**](file:///home/tahsin005/Downloads/Codes/bits-and-pieces/pets/job-application-tracker/docs/state-management.md) | Asynchronous server caching, client UI state, optimistic updates, and the Facade pattern. | `useBoardFacade`, `board-queries.ts`, `board-store.ts` |
| [**Database & Models**](file:///home/tahsin005/Downloads/Codes/bits-and-pieces/pets/job-application-tracker/docs/database-and-models.md) | MongoDB schemas, connection singleton, 100x order-spacing reordering, and seeding. | `lib/models/`, `lib/db.ts`, `scripts/seed.ts` |
| [**Authentication**](file:///home/tahsin005/Downloads/Codes/bits-and-pieces/pets/job-application-tracker/docs/authentication.md) | Better Auth configuration, edge session cookie caching, route protection proxy, and navbar skeleton. | `lib/auth/`, `proxy.ts`, `components/navbar.tsx` |
| [**Forms & Validation**](file:///home/tahsin005/Downloads/Codes/bits-and-pieces/pets/job-application-tracker/docs/forms-and-validation.md) | React Hook Form patterns, Zod validation schemas, `.trim().min()` rule, and edit dialog isolation. | `lib/validations/`, dialogs, auth forms |
| [**UI & Components**](file:///home/tahsin005/Downloads/Codes/bits-and-pieces/pets/job-application-tracker/docs/ui-and-components.md) | `@dnd-kit` drag-and-drop setup, column droppables, sensor thresholds, design tokens, and toasts. | `kanban-board.tsx`, `job-application-card.tsx` |
| [**Development & Testing**](file:///home/tahsin005/Downloads/Codes/bits-and-pieces/pets/job-application-tracker/docs/development-and-testing.md) | Environment setup, dev/build scripts, React 19 / ESLint 9 rules, and pre-commit verification. | NPM scripts, ESLint rules, server action contracts |

---

## ⚡ Critical Agent Non-Negotiables ("Golden Rules")

When modifying this repository, AI agents and developers must uphold the following architectural invariants:

### 1. The Facade-First Rule
- **Never** import TanStack Query hooks, query clients, mutations, or Zustand slices directly inside UI components.
- All board interactions (reading columns, searching, filtering tags, creating, updating, moving, or deleting jobs) must go through `useBoardFacade` (`lib/facades/useBoardFacade.ts`).

### 2. Drag-and-Drop Calculation Safety
- In `components/kanban-board.tsx`, `useBoardFacade` provides both `columns` (filtered by active search/tags) and `rawColumns` (complete, unfiltered).
- **`columns`** / `sortedColumns`: Use **only** for rendering visual cards.
- **`rawColumns`** / `orderColumns`: Use **strictly** for calculating target indices in `handleDragEnd`.
- *Why*: Calculating drop positions against filtered columns corrupts order indices in the database when a search filter is active.

### 3. Zod String Normalization (`.trim().min()`)
- In Zod schemas (`lib/validations/`), all non-empty string fields must be declared as `.string().trim().min(N)`, **never** `.string().min(N).trim()`.
- *Why*: Calling `.min(1)` before `.trim()` allows strings containing only whitespace (`"   "`) to pass validation before transforming into an empty string.

### 4. In-Progress Form Edit Protection
- In `components/job-application-card.tsx`, do **not** include the `job` server object in the `useEffect` dependency array when resetting form values on dialog open:
  ```tsx
  useEffect(() => {
      if (isEditing) {
          reset({ ...jobValues });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, reset]);
  ```
- *Why*: Background TanStack Query refetches return fresh `job` instances. Including `job` wipes out unsaved user keystrokes mid-edit.

### 5. TanStack Query Cache Invalidation & Revalidation Rule
- Every mutation hook (e.g. create, update, move, delete) **must** explicitly revalidate and invalidate the cache using `queryClient.invalidateQueries({ queryKey: boardKeys.all })` in its `onSuccess` or `onSettled` callback.
- **Optimistic Mutations**: For instant UI updates (such as `useMoveJobMutation`), always:
  1. `await queryClient.cancelQueries({ queryKey: boardKeys.all })` to prevent race conditions.
  2. Snapshot previous cache data to return in the mutation context.
  3. Optimistically update `queryClient.setQueryData(boardKeys.current(), ...)`.
  4. Rollback to snapshot on `onError`.
  5. Revalidate via `invalidateQueries({ queryKey: boardKeys.all })` in `onSettled`.
- *Why*: Server Actions execute on the server and modify MongoDB, but the client renders from TanStack Query's memory cache. Without explicit query invalidation, client state immediately becomes stale.

### 6. Server Action Return Shape Contract
- Every Server Action in `lib/actions/` must explicitly return `{ error: string | null, data: T | null }` (or `{ error: string | null, success: boolean }`).
- Never omit `error: null` from success returns. Omitting it breaks TypeScript's type narrowing on the client.

### 7. Zero Tolerance for Lint & Type Errors
- Every PR or agent turn must cleanly pass:
  ```bash
  npm run lint
  npx tsc --noEmit
  npm run build
  ```
- Do not use `@ts-ignore`, `any`, or `--force` to bypass peer dependencies.

---

## 🛠️ Common Workflows for Agents

### Adding a New Field to Job Applications
1. **Model**: Update `IJobApplication` and `JobApplicationSchema` in `lib/models/job-application.ts`.
2. **Type Definition**: Update `JobApplication` in `lib/models/models.types.ts`.
3. **Zod Validation**: Add the field with proper validation in `lib/validations/job-application.ts`.
4. **Server Actions**: Accept and persist the field in `createJobApplication` and `updateJobApplication` in `lib/actions/job-applications.ts`.
5. **UI & Forms**:
   - Add the input field in `components/create-job-dialog.tsx`.
   - Add the input field and reset mapping in `components/job-application-card.tsx`.
   - Display the field on the card if appropriate.

### Adding a New Mutation
1. **Server Action**: Create or update the server action in `lib/actions/`. Ensure session verification and standard `{ error, data }` return.
2. **Query Hook**: Define the mutation in `lib/queries/board-queries.ts` with invalidation of `boardKeys.all` (and optimistic updates if necessary).
3. **Facade Integration**: Expose a clean handler function with Sonner toast feedback in `lib/facades/useBoardFacade.ts`.
4. **Component Consumption**: Call the handler from `useBoardFacade` in your component.

---

## ✅ Pre-Flight Checklist

Before marking any task as complete, run:
```bash
# 1. Verify ESLint compliance
npm run lint

# 2. Verify TypeScript types
npx tsc --noEmit

# 3. Verify Next.js build compilation
npm run build
```
