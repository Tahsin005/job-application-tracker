# Job Application Tracker

A high-performance, real-time Kanban board tailored specifically for organizing, tracking, and prioritizing your job hunting lifecycle. Built with the bleeding-edge Next.js 16 architecture, this platform allows developers and professionals to seamlessly drag-and-drop applications across custom pipelines natively.

## Features
- **Kanban Pipeline Strategy:** Beautifully organized column interfaces mapping your exact life-cycle (Applied, Interviewing, Offer, Rejection). 
- **Optimistic Drag and Drop UI:** Powered by `@dnd-kit`, experience hyper-smooth 60FPS physics when moving task cards. UI interactions resolve instantly before database commitments happen!
- **Edge-Level Security Guarding:** Powered by `better-auth` running on Next.js Global Proxy Middlewares, unauthorized users are intelligently routed away from private boards natively.
- **Micro-Aggregated Database Calls:** Heavily optimized MongoDB sorting functions running `updateMany` queries instead of recursive loops, keeping your server cost and compute metrics bare-minimum.
- **Granular Interactions:** Shadcn's interactive toolchains and Radix UI elements provide slick modal edits, popover form interactions, and reactive `sonner` Toaster alerts globally.

## Technology Stack
- **Framework:** Next.js 16.2 (App Router & Turbopack)
- **Database:** MongoDB & Mongoose Object Modeling
- **Authentication:** Better Auth (Secure edge-runtime session validation)
- **Styling:** Tailwind CSS V4 & Custom CSS variables
- **Components:** Shadcn-UI & Lucide React
- **Complex UI States:** `@dnd-kit/core` and `useTransition` hooks natively.

## Getting Started Locally

### 1. Clone the repository
```bash
git clone https://github.com/Tahsin005/job-application-tracker.git
cd job-application-tracker
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Duplicate the `.env.example` mapping to a local `.env` file, and fill in the necessary secrets (specifically your `MONGODB_URI` string alongside your local or production network secrets).
```bash
cp .env.example .env
```

### 4. Boot up the Development Server
```bash
npm run dev
```

Finally, open [http://localhost:3000](http://localhost:3000) inside your browser!

## Active Developments
Feel free to open Issues or PRs mapping specific functionality you'd love integrated into the tracker schema natively! 
