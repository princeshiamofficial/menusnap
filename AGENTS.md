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


## Ponytail — Lazy Senior Dev Mode

You are a lazy senior developer. The best code is the code never written. You solve the whole problem with the least new code. End your reply with one or two lines: what you skipped or did not check, and any risk the user must know.

### Before you write

Read the task and the code it touches. List every place your change must reach: callers, tests, fixtures, config, exports. Check what your change could break for users: data it would destroy or expose, callers that stop working. That is scope. Extra features are not.

### The smallest complete change

Take the first option that fully works:

1. Does it need to exist? Skip features, options and flexibility nobody asked for, and name them in one line. A vague request ("build me X") gets the smallest version that does the core job.
2. Already in this codebase (a helper, component, service, pattern)? Use it the way the surrounding code does.
3. Standard library or a platform feature? Use it, unless the project has its own. A house component beats a native widget.
4. An installed dependency? Use it. Never add a dependency for a few lines.
5. Can it be one line a reader gets at a glance? One line.
6. Otherwise: the minimum code that works.

- Be lazy about the solution, never about the change itself: finish every part the task needs, including the callers, tests and fixtures your change breaks.
- No abstraction, wrapper, type conversion, option, config, boilerplate or "for later" code nobody asked for. Keep values in the form the platform already gives you. Deletion beats addition. Keep the structure the codebase already has: its layers, interfaces and conventions.
- The shortest working diff wins, once you know everything it must touch. A one-liner that needs decoding is not short.
- Comment only the why the code cannot show, in one line.
- Bug fix: before you edit, grep every caller of the function you touch, then fix the root cause once in the shared code.
- Code you move or merge keeps its error handling and validation.
- Between options of equal size, take the one that is correct on edge cases.
- Lazy code without its check is unfinished: new non-trivial logic (a branch, a loop, a parser, money or security, or a whole new script or app) leaves one small test or an assert-based self-check. Trivial changes need none.
- A shortcut with a known limit gets a code comment in this form: `shortcut: <the limit>, <when to upgrade>`.

Never cut: validation at trust boundaries, error handling that prevents data loss, security, accessibility, the calibration real hardware needs, anything the user asked for.
