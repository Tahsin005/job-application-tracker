# System Architecture

## Overview
**Job Application Tracker** is a real-time, responsive Kanban board web application engineered for organizing, tracking, and prioritizing the job hunt lifecycle. Built on Next.js 16 (App Router), MongoDB/Mongoose, Better Auth, and modern state architecture.

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 16.2 (App Router & Turbopack) | Server Components, Route Handlers, Server Actions |
| **Language & Runtime** | TypeScript 5 & React 19 | Static type safety and latest React features |
| **Server State & Caching** | TanStack Query v5 (`@tanstack/react-query`) | Asynchronous server-state caching, invalidation, and optimistic updates |
| **Client UI State** | Zustand v5 | Pure client interaction state (active drag ID, search query, filters) |
| **Design Pattern** | Facade Pattern (`useBoardFacade`) | Encapsulates TanStack Query and Zustand into a unified interface for UI |
| **Form Management** | React Hook Form & Zod v3 (`@hookform/resolvers`) | Normalized schema validation and performant form state |
| **Database & ODM** | MongoDB with Mongoose v9 | Document persistence, relationship population, batch reordering |
| **Authentication** | Better Auth v1.6 | Edge session cookies, MongoDB adapter, auto-board provisioning |
| **Drag & Drop** | `@dnd-kit/core` & `@dnd-kit/sortable` | 60FPS pointer sensors, collision detection, and drag overlays |
| **Styling & UI Primitives** | Tailwind CSS v4, Shadcn UI, Lucide Icons | CSS tokens, accessible Radix primitives, Sonner toasts |

---

## Directory Structure

```
job-application-tracker/
├── app/                           # Next.js App Router
│   ├── api/auth/[...all]/route.ts # Better Auth route handler
│   ├── dashboard/page.tsx         # Authenticated board dashboard
│   ├── sign-in/page.tsx           # Sign In form (React Hook Form + Zod)
│   ├── sign-up/page.tsx           # Sign Up form (React Hook Form + Zod)
│   ├── layout.tsx                 # Root layout with QueryProvider, Navbar, Toaster
│   ├── page.tsx                   # Public landing page
│   ├── not-found.tsx              # 404 page
│   └── globals.css                # Tailwind v4 theme variables
├── components/                    # React UI Components
│   ├── providers/                 # Client providers (QueryProvider)
│   ├── ui/                        # Reusable Shadcn UI primitives
│   ├── kanban-board.tsx           # Core Kanban drag-and-drop board
│   ├── job-application-card.tsx   # Individual job card & edit dialog
│   ├── create-job-dialog.tsx      # Add application modal
│   ├── navbar.tsx                 # Top navigation bar with auth loading skeleton
│   ├── footer.tsx                 # Application footer
│   └── sign-out-btn.tsx           # Session logout action button
├── docs/                          # Developer & Agent modular documentation
│   ├── architecture.md            # System architecture & patterns
│   ├── state-management.md        # TanStack Query, Zustand, and Facade guide
│   ├── database-and-models.md     # MongoDB schemas & reordering logic
│   ├── authentication.md          # Better Auth & proxy routing
│   ├── forms-and-validation.md    # React Hook Form & Zod conventions
│   └── ui-and-components.md       # Dnd-Kit & component guidelines
├── lib/                           # Core utilities, actions, and business logic
│   ├── actions/                   # Next.js Server Actions (mutations & queries)
│   ├── auth/                      # Better Auth server configuration and client
│   ├── facades/                   # Facade hooks (useBoardFacade)
│   ├── hooks/                     # Custom utility hooks
│   ├── models/                    # Mongoose schemas & TypeScript types
│   ├── queries/                   # TanStack Query hooks & query key factories
│   ├── store/                     # Zustand state stores
│   ├── validations/               # Zod validation schemas
│   ├── db.ts                      # Cached Mongoose connection singleton
│   ├── init-user-board.ts         # User board bootstrap logic
│   └── utils.ts                   # Tailwind merge utility (cn)
├── proxy.ts                       # Next.js 16 routing proxy for auth guarding
└── scripts/
    └── seed.ts                    # Database seeder script
```

---

## Architectural Data Flow

```
[UI Components (KanbanBoard, Dialogs)]
                │
                ▼
        [useBoardFacade]
        ├── Client State ──> [Zustand (useBoardStore)]
        └── Server State ──> [TanStack Query (boardKeys, useBoardQuery, Mutations)]
                                        │
                                        ▼
                            [Next.js Server Actions]
                                        │
                                        ▼
                            [MongoDB via Mongoose]
```
