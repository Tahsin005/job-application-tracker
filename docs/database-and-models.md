# Database & Data Models

This document details the MongoDB database architecture, Mongoose schemas, relationships, indexing, order-spacing algorithms, and seeding procedures.

---

## 1. Connection Singleton (`lib/db.ts`)

The database connection uses a global cached singleton pattern to prevent connection exhaustion in serverless Next.js environments:

```ts
// lib/db.ts
interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };
```

- In development, Next.js hot-reloading preserves `global.mongoose`.
- In production, serverless function invocations reuse the cached database connection.
- Throws an explicit error if `MONGODB_URI` is not defined in `.env`.

---

## 2. Entity Relationship Model

The data hierarchy follows a strict 3-tier cascade:
```
User (Better Auth)
  └── Board (1:1 with user for current MVP)
        └── Columns (1:N, ordered list)
              └── JobApplications (1:N, ordered cards)
```

### Schema Definitions

#### `Board` (`lib/models/board.ts`)
Represents a user's Kanban workspace.
- **Fields**:
  - `name`: string (e.g., `"Job Hunt"`).
  - `userId`: string (indexed, foreign key to Better Auth user).
  - `columns`: Array of `ObjectId` references (`ref: "Column"`).
  - `timestamps`: `createdAt`, `updatedAt`.

#### `Column` (`lib/models/column.ts`)
Represents a workflow status column (e.g., Wish List, Applied, Interviewing, Offer, Rejected).
- **Fields**:
  - `name`: string.
  - `boardId`: `ObjectId` (`ref: "Board"`, indexed).
  - `order`: number (0-indexed column display order).
  - `jobApplications`: Array of `ObjectId` references (`ref: "JobApplication"`).
  - `timestamps`: `createdAt`, `updatedAt`.

#### `JobApplication` (`lib/models/job-application.ts`)
Represents an individual job application card.
- **Fields**:
  - `company`: string (required).
  - `position`: string (required).
  - `location`: string (optional).
  - `status`: string (default: `"applied"`).
  - `columnId`: `ObjectId` (`ref: "Column"`, indexed).
  - `boardId`: `ObjectId` (`ref: "Board"`, indexed).
  - `userId`: string (indexed).
  - `order`: number (spaced positioning index).
  - `salary`: string (optional).
  - `jobUrl`: string (optional).
  - `notes`: string (optional).
  - `description`: string (optional).
  - `tags`: string array (optional).
  - `appliedDate`: Date (optional).
  - `resumeId`: `ObjectId` (`ref: "Resume"`, optional).
  - `attachedResumeName`: string (optional).
  - `atsAnalysis`: Object containing `score`, `missingKeywords`, `matchedKeywords`, `actionVerbRecommendations`, `summary`, `analyzedAt`, `resumeName`.
  - `aiCoverLetter`: string (optional).
  - `aiOutreachMessage`: string (optional).
  - `aiApplicationEmail`: string (optional).
  - `timestamps`: `createdAt`, `updatedAt`.

#### `Resume` (`lib/models/resume.ts`)
Stores multiple versioned resumes per user for ATS matching and version tracking.
- **Fields**:
  - `userId`: string (indexed).
  - `name`: string (e.g. `"Resume_Frontend_v3.pdf"`).
  - `textContent`: string (extracted plain text used for LLM context).
  - `fileData`: string (base64 data URI for viewing/downloading).
  - `fileSize`: number.
  - `isDefault`: boolean.
  - `timestamps`: `createdAt`, `updatedAt`.

#### `UserUsage` (`lib/models/user-usage.ts`)
Enforces per-user feature-wise quotas (default: 3 tries per feature) with atomic decrementing.
- **Fields**:
  - `userId`: string (unique index).
  - `atsScanCount`: number (default: 0).
  - `atsScanLimit`: number (default: 3).
  - `coverLetterCount`: number (default: 0).
  - `coverLetterLimit`: number (default: 3).
  - `outreachCount`: number (default: 0).
  - `outreachLimit`: number (default: 3).
  - `applicationEmailCount`: number (default: 0).
  - `applicationEmailLimit`: number (default: 3).
  - `timestamps`: `createdAt`, `updatedAt`.

---

## 3. Order Spacing & Batch Reordering Algorithm

To achieve smooth drag-and-drop reordering without requiring every item in a column to be re-indexed on every drop:

1. **100x Spacing Multiplier**:
   - Stored `order` values use multiples of 100 (`newOrderValue = order * 100`).
   - This provides room between positions for intermediate insertions.

2. **Cross-Column Moves (`updateJobApplication` in `lib/actions/job-applications.ts`)**:
   - Card is pulled from source column: `Column.findByIdAndUpdate(currentCol, { $pull: { jobApplications: id } })`.
   - Cards in target column at or above destination are incremented:
     ```ts
     const jobsThatNeedToShift = jobsInTargetColumn.slice(order);
     if (jobsThatNeedToShift.length > 0) {
         await JobApplication.updateMany(
             { _id: { $in: jobsThatNeedToShift.map(j => j._id) } },
             { $inc: { order: 100 } }
         );
     }
     ```
   - Card is pushed to target column: `Column.findByIdAndUpdate(newCol, { $push: { jobApplications: id } })`.

3. **Same-Column Reordering**:
   - If moved up or down within the same column, intermediate cards are shifted via `$inc: 100` or `$inc: -100` accordingly.

---

## 4. User Provisioning (`lib/init-user-board.ts`)

When a new user signs up, Better Auth's `databaseHooks.user.create.after` lifecycle hook automatically invokes `initializeUserBoard(user.id)`.

This creates a default `"Job Hunt"` board with 5 standard columns:
1. **Wish List** (`order: 0`)
2. **Applied** (`order: 1`)
3. **Interviewing** (`order: 2`)
4. **Offer** (`order: 3`)
5. **Rejected** (`order: 4`)

---

## 5. Database Seeding (`scripts/seed.ts`)

A standalone TypeScript script populates sample job data for demonstration or local development:

```bash
npx tsx scripts/seed.ts
```

- Clears existing jobs for the target test user.
- Creates applications distributed across Wish List, Applied, Interviewing, Offer, and Rejected.
- Updates column reference arrays and links back to the user's board.
