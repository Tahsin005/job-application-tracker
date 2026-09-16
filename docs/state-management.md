# State Management & Facade Pattern

This application strictly separates **Server State** (asynchronous data managed by TanStack Query) from **Client UI State** (synchronous interaction state managed by Zustand), bound together by a **Facade Layer** (`useBoardFacade`).

---

## 1. TanStack Query Layer (`lib/queries/board-queries.ts`)

### Query Key Factory
All board-related queries use a centralized key factory to ensure consistent cache access and precise invalidation:
```ts
export const boardKeys = {
    all: ["boards"] as const,
    current: () => [...boardKeys.all, "current"] as const,
    detail: (boardId?: string) => [...boardKeys.all, boardId ?? "current"] as const,
    jobs: (boardId?: string) => [...boardKeys.detail(boardId), "jobs"] as const,
    jobList: (columnId?: string) => ["jobs", columnId ?? "all"] as const,
};
```

### Hook-Based Queries
- **`useBoardQuery(initialBoard)`**: Fetches the user's board document with populated columns and job applications. Configured with a `staleTime: 120000` (2 minutes).
- **`useJobListQuery(columnId)`**: Derives the job applications belonging to a specific column from the active board query.

### Mutations, Cache Invalidation & Revalidation Lifecycle
Every mutating action in the application triggers an explicit cache invalidation or optimistic revalidation to ensure the client-side state mirrors MongoDB:

#### Standard Invalidation Flow (`onSuccess`)
Used for create, update, and delete actions where UI latency is negligible:
```ts
export function useCreateJobMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateJobApplicationInput) => {
            const res = await createJobApplication(data);
            if (res.error) throw new Error(res.error);
            return res.data;
        },
        onSuccess: () => {
            // Invalidate all board-related queries to trigger an immediate background refetch
            queryClient.invalidateQueries({ queryKey: boardKeys.all });
        },
    });
}
```

#### Optimistic Revalidation Flow (`onMutate` -> `onError` -> `onSettled`)
Used for drag-and-drop operations (`useMoveJobMutation`) for instant 60FPS visual feedback without waiting for server responses:
1. **`onMutate`**:
   - `await queryClient.cancelQueries({ queryKey: boardKeys.all })`: Halts in-flight queries so server responses don't overwrite our optimistic change.
   - `const previousBoard = queryClient.getQueryData<Board>(boardKeys.current())`: Snapshots current board state.
   - Slices and positions the dragged job in the target column at `newOrder`.
   - `queryClient.setQueryData(boardKeys.current(), optimisticBoard)`: Instantly renders the new card position.
   - Returns `{ previousBoard }` as context.
2. **`onError`**:
   - If the server action fails, rolls back the client state:
     ```ts
     onError: (_err, _variables, context) => {
         if (context?.previousBoard) {
             queryClient.setQueryData(boardKeys.current(), context.previousBoard);
         }
     }
     ```
3. **`onSettled`**:
   - Whether the mutation succeeded or failed, revalidates the cache against MongoDB:
     ```ts
     onSettled: () => {
         queryClient.invalidateQueries({ queryKey: boardKeys.all });
     }
     ```

---

## 2. Zustand Client State (`lib/store/board-store.ts`)

Purely transient UI states live in the Zustand `useBoardStore`:
```ts
interface BoardUIState {
    activeId: string | null;           // Currently dragged card ID for Dnd-Kit
    setActiveId: (id: string | null) => void;
    searchQuery: string;               // Live filter text
    setSearchQuery: (query: string) => void;
    selectedTag: string | null;        // Active tag filter
    setSelectedTag: (tag: string | null) => void;
    resetFilters: () => void;
}
```

---

## 3. The Facade Layer (`lib/facades/useBoardFacade.ts`)

### Purpose
Components should **never** import TanStack Query hooks, mutations, or Zustand slices directly. Instead, they interact exclusively with `useBoardFacade`.

### Key Responsibilities
1. **Unifies State**: Merges data from `useBoardQuery` and UI flags from `useBoardStore`.
2. **Computes Derived State**: Computes `filteredColumns` (matching `searchQuery` and `selectedTag`) while simultaneously providing `rawColumns` (complete, unfiltered columns).
3. **Encapsulates Operations**: Exposes straightforward async functions (`moveJob`, `createJob`, `updateJob`, `deleteJob`) wrapped with Sonner toast feedback.

### Critical Rule: `rawColumns` vs. `columns`
```ts
const { columns, rawColumns, moveJob } = useBoardFacade(board);
```
- **`columns`**: Use **strictly for rendering** UI cards. When a search filter is applied, this list is truncated to matching items.
- **`rawColumns`**: Use **strictly for drag-and-drop calculation** (`handleDragEnd`). Index math and position calculations MUST be computed against the full set of applications, otherwise dragging a card during an active search filter will write corrupted index orders to the database.

---

## 4. The AI & Resume Intelligence Facade (`lib/facades/useAiResumeFacade.ts`)

UI components needing resume library management or AI intelligence (ATS matching, cover letters, outreach, quotas) interact through `useAiResumeFacade`.

### Query Keys (`lib/queries/ai-queries.ts`)
```ts
export const aiKeys = {
    all: ["ai"] as const,
    resumes: () => [...aiKeys.all, "resumes"] as const,
    usage: () => [...aiKeys.all, "usage"] as const,
};
```

### Key Responsibilities
1. **Reads Asynchronous State**: Subscribes to `useUserResumesQuery` and `useUserUsageQuery` with automatic caching.
2. **Encapsulates Operations with Feedback**:
   - `runAtsMatch(jobId, resumeId)`: Triggers GLM-5.3 ATS scan, persists analysis to job, and invalidates `boardKeys.all` + `aiKeys.usage()`.
   - `generateCoverLetter(jobId, resumeId)`: Generates tailored 3-paragraph letter.
   - `generateOutreach(jobId, resumeId)`: Crafts recruiter LinkedIn/email message.
   - `createResume(input)`: Saves resume (PDF or text) to user's library and invalidates `aiKeys.resumes()`.
   - `attachResume(jobId, resumeId)`: Links a specific resume version to a job application.
   - `extractPdfText(file)`: Server-side PDF extraction via `unpdf`.

---

## 5. The Admin Management Facade (`lib/facades/useAdminFacade.ts`)

Encapsulates administrative operations for managing user telemetry and AI quota limits.

### Key Responsibilities
1. **User Usage & Quota Administration**:
   - `updateUserUsage(input)`: Validates and updates user feature counts and limits (`atsScanCount`, `coverLetterCount`, `outreachCount`, and their respective limits) with Sonner toast feedback and Next.js router revalidation.
2. **Loading States**: Exposes `isUpdatingUsage` for responsive button feedback and preventing duplicate submissions.

---

## 6. The Admin AI Provider Facade (`lib/facades/useAdminAiFacade.ts`)

Encapsulates interaction with the dynamic AI Provider Factory, live probe testing playground, and database configuration management.

### Key Responsibilities
1. **Ephemeral Connection Testing**:
   - `testConnection(input)`: Sends lightweight test probes to arbitrary provider endpoints (AgentRouter, OpenAI, Groq, Anthropic, Gemini, or custom) without persisting to MongoDB, returning latency measurements and status feedback.
2. **Provider Persistence & Defaults**:
   - `saveConfig(input)`: Persists tested configurations into MongoDB and synchronizes the active default provider.
   - `setDefaultConfig(id, name)`: Atomically switches the default active provider.
   - `deleteConfig(id, name)`: Deletes configurations and automatically re-promotes an alternative if the active provider was deleted.
3. **Unified State & Telemetry**:
   - Exposes `isTesting`, `testResult`, `isSaving`, `actionLoadingId`, and `clearTestResult()`.

---

## 7. The Admin AI Prompts Facade (`lib/facades/useAdminPromptsFacade.ts`)

Encapsulates prompt management for the three core AI intelligence actions (`atsScan`, `coverLetter`, `outreach`).

### Key Responsibilities
1. **Prompt Customization**:
   - `savePrompt(input)`: Validates and saves custom system instructions and user prompt templates to MongoDB with Next.js cache revalidation.
2. **Codebase Sane Default Restoration**:
   - `resetPrompt(action, name)`: Deletes the MongoDB override for an action, immediately reverting to the hardcoded codebase sane defaults.
3. **Telemetry & Feedback**:
   - Exposes `isSaving`, `isResetting`, and `activeActionId` for responsive inline button spinners and Sonner notifications.

