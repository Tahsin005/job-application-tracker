# Forms & Validation Standards

This document establishes the patterns, conventions, and invariants for form handling using **React Hook Form** and **Zod v3** across the codebase.

---

## 1. Libraries & Architecture

- **Validation Engine**: `zod@^3.24.2`
- **Form Controller**: `react-hook-form`
- **Bridge Resolver**: `@hookform/resolvers@^3.10.0`
- **Location**: Schemas live in `lib/validations/`. Forms live in `components/` and `app/`.

---

## 2. Validation Schemas & The `.trim().min()` Standard

### The Golden Rule: Normalize Before Checking Length
In Zod, chained operators execute in sequence. 
```ts
// ❌ INCORRECT: Whitespace string "   " passes length check, then trims to ""
z.string().min(1, "Required").trim()

// ✅ CORRECT: Trims whitespace first, correctly rejecting "   "
z.string().trim().min(1, "Required")
```
Every required text field (company, position, name) MUST follow this pattern.

### Auth Schemas (`lib/validations/auth.ts`)
```ts
export const signInSchema = z.object({
    email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const signUpSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters long"),
    email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
});
```

### Optional URL Validation Pattern (`lib/validations/job-application.ts`)
Optional URLs must allow blank/empty input without failing the strict `.url()` validator:
```ts
jobUrl: z
    .string()
    .optional()
    .refine(
        (val) => !val || val.length === 0 || z.string().url().safeParse(val).success,
        { message: "Please enter a valid URL" }
    )
    .default("")
```

---

## 3. Form Setup Pattern

Standard React Hook Form structure used throughout the app:

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createJobApplicationSchema, type CreateJobApplicationInput } from "@/lib/validations/job-application";

const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
} = useForm<CreateJobApplicationInput>({
    resolver: zodResolver(createJobApplicationSchema),
    defaultValues: {
        company: "",
        position: "",
        location: "",
        salary: "",
        jobUrl: "",
        tags: "",
        description: "",
        notes: "",
        columnId: defaultColumnId,
        boardId: boardId,
    },
});
```

---

## 4. Dialog Edit State & Background Refetch Isolation

### The In-Progress Edit Protection Rule
In `components/job-application-card.tsx`, applications can be edited inside a dialog.
Because TanStack Query mutations invalidate `boardKeys.all`, background refetches regularly return fresh `job` object references.

**Do NOT include `job` in the `useEffect` dependency array when resetting form values:**
```tsx
// components/job-application-card.tsx
useEffect(() => {
    if (isEditing) {
        reset({
            company: job.company,
            position: job.position,
            location: job.location || "",
            notes: job.notes || "",
            salary: job.salary || "",
            jobUrl: job.jobUrl || "",
            tags: job.tags?.join(", ") || "",
            description: job.description || "",
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isEditing, reset]);
```
- **Why**: If `job` is included in dependencies, any background board refetch while the dialog is open will trigger `reset()` and silently erase whatever the user is actively typing!
- Reset must only execute once when `isEditing` transitions to `true`.
