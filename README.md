# 🎯 Job Application Tracker & Career Intelligence SaaS

> An intelligent, all-in-one career platform designed to help candidates organize their job search pipeline, optimize resumes, and accelerate their path to job offers with tailored AI assistance.

[![Next.js](https://img.shields.io/badge/Next.js-16_(Turbopack)-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

Managing job searches across multiple job boards, recruiters, and spreadsheets quickly leads to lost opportunities and application fatigue. **Job Application Tracker** transforms the candidate experience by pairing an intuitive drag-and-drop pipeline with contextual AI tools that analyze job descriptions, pinpoint keyword gaps, generate tailored materials, and track interview progress end-to-end.

---

## ⚡ The Candidate Workflow

1. **Pipeline & Organization**: Track every lead from discovery to offer across an interactive, real-time Kanban board with instant search, color-coded tags, and rich notes.
2. **AI Resume Matching**: Upload multiple resume variations and instantly benchmark candidate fit against job requirements with quantifiable ATS match scores and keyword suggestions.
3. **High-Converting Outreach**: Produce tailored cover letters, LinkedIn recruiter outreach, and ready-to-send application emails matching the company's tone and requirements.
4. **Interview Journey**: Schedule and track multiple interview rounds, record feedback, store prep notes, and review your conversion funnel analytics.

---

## ✨ Platform Features

### 📋 Interactive Kanban Pipeline
* **Fluid Drag-and-Drop**: High-performance card movement across customizable stages (*Wish List*, *Applied*, *Interviewing*, *Offered*, *Rejected*).
* **Instant Slicing & Search**: Real-time filtering by company, role title, or tags.
* **Rich Text Notes**: Built-in TipTap editor for role descriptions, interview talking points, and salary expectations.

### 🧠 AI Career Intelligence
* **ATS Resume Matcher**: Circular 0–100% match gauge identifying matched keywords, missing technical skills, and actionable bullet improvements.
* **Tailored Cover Letters**: 1-click personalized letters aligned precisely with job descriptions and candidate achievements.
* **Recruiter Outreach**: High-conversion InMail and cold messaging for hiring managers and recruiters.
* **Application Email Generator**: Formal email pitch drafts complete with tailored subject lines.

### 📄 Smart Resume Library
* **Multi-Resume Management**: Upload and version different target resumes (e.g. Frontend, Full-Stack, Engineering Lead) in PDF format.
* **Automated Text Extraction**: Fast, secure parsing powered by `unpdf` to feed candidate context into AI prompts.
* **Contextual Linking**: Designate a default resume or link specific versions to individual applications.

### 📅 Interview Journey Tracker
* **Multi-Stage Rounds**: Organize screening, technical, behavioral, and offer stages.
* **Schedules & Logs**: Record interview dates, durations, interviewer notes, and video call links.

### 📊 Conversion Analytics & Insights
* **Funnel Visualization**: Real-time conversion metrics tracking progression from application to interview and offer.
* **Outcome Breakdown**: Understand pipeline velocity and optimize your application strategy.

### 💳 Pricing, Top-Up & Fair Usage
* **Credit Packages**: Tiered credit bundles for on-demand ATS scans and AI generation.
* **MFS Payment Integration**: Native support for Bangladeshi Mobile Financial Services (bKash, Nagad, Rocket) with transaction verification.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | Next.js 16 (App Router & Turbopack), React 19, TypeScript |
| **Styling & Design System** | Tailwind CSS v4, Radix UI Primitives, Lucide Icons, Sonner |
| **State & Caching** | TanStack Query v5, Zustand v5 (Facade Architecture) |
| **Interactivity** | `@dnd-kit` (Kanban drag-and-drop), TipTap (ProseMirror rich text) |
| **Backend & Storage** | Next.js Server Actions, MongoDB with Mongoose 9 |
| **Authentication** | Better Auth (Edge Session Caching & Route Protection) |
| **AI Orchestration** | AgentRouter AI (OpenAI, Anthropic, Gemini compatible) |
| **Document Processing** | `unpdf` (Server-side PDF extraction) |

---

## 📖 Architecture & Developer Guides

For contributors and engineering documentation, explore the modular guides in [`docs/`](docs/):
* [System Architecture & Data Flow](docs/architecture.md)
* [State Management & Facades](docs/state-management.md)
* [Database Schemas & Ordering Algorithm](docs/database-and-models.md)
* [Authentication & Route Protection](docs/authentication.md)
* [UI Design & Sensor Configurations](docs/ui-and-components.md)
* [Development Standards & Quality Gates](docs/development-and-testing.md)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
