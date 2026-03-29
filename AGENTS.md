# AGENTS.md

This file provides context and instructions for AI coding agents working on the **MenuBldr (MenuSnap)** project.

## Project Overview
MenuBldr is a modern web application for managing digital menus, orders, and clients. It features a CRM-like admin dashboard, a menu editor with real-time collaboration, and WhatsApp integration.

## Tech Stack
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/), [Lucide React](https://lucide.dev/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/), [Shadcn/ui](https://ui.shadcn.com/)
- **Database**: MySQL (via `mysql2`)
- **AI**: [Google Genkit](https://github.com/firebase/genkit)
- **Real-time**: [Socket.io](https://socket.io/), [Yjs](https://yjs.dev/) (for collaborative editing)
- **Forms**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)

## Directory Structure
- `src/app`: Next.js App Router pages and layouts.
  - `(app)/m-admin`: Admin dashboard and management pages.
  - `actions`: Server actions for database operations and business logic.
- `src/components`: Reusable UI components (including Shadcn components).
- `src/lib`: Shared utilities, database connection (`mysql.ts`), and helper functions.
- `src/hooks`: Custom React hooks.
- `src/types`: TypeScript definitions and interfaces.
- `src/ai`: Genkit AI flows and configuration.
- `public`: Static assets (images, fonts).

## Coding Standards

### Server Actions
- All server actions should reside in `src/app/actions`.
- Use `"use server"` at the top of the file.
- Functions should return a consistent object structure: `{ success: boolean, data?: any, error?: string }`.
- Always wrap database operations in `try-catch` blocks.
- Use JSDoc comments to document function purpose and parameters.

### UI Development
- Prioritize **visual excellence** and **premium design**.
- Use Tailwind CSS for styling. Avoid inline styles.
- Use Radix UI primitives for accessible components (Accordions, Dialogs, etc.).
- Ensure **100% mobile responsiveness**.
- Use Framer Motion for smooth transitions and micro-animations.

### Database
- Use manual SQL queries with the MySQL pool (`@/lib/mysql`).
- Ensure tables exist using initialization functions (like `ensureClientsTable`) within actions if necessary.

## Common Commands
- `npm run dev`: Start the development server on port 9002.
- `npm run build`: Build the application for production.
- `npm run lint`: Run ESLint.
- `npm run genkit:dev`: Start Genkit Dev UI.

## Specific Task Instructions for AI
- **Context Awareness**: Always check the `src/app/actions` directory before creating new database logic to see if similar functions already exist.
- **Styling**: When creating or modifying UI, lean towards a minimal, professional SaaS aesthetic (dark modes, subtle borders, glassmorphism).
- **Responsiveness**: Always verify that new UI components don't cause horizontal overflow on mobile devices.
- **Communication Language**: All responses must be in **English only**. Bengali script (বাংলা অক্ষর) is **STRICTLY FORBIDDEN**. 
- **Banglish Summary**: At the very end of each turn, provide a brief summary of the completed task in **Banglish** (Bengali words written with English/Latin characters only, NO Bengali script).

