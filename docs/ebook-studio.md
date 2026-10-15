# Admin Ebook page designer

Open `/m-admin/ebook/` (or `/panel/ebook/`). Admins have access automatically. Custom roles need the **Ebook** view/create/edit permissions in Manage Users. Other roles do not receive access automatically.

Click **Start editing /ebook** to create a page draft from the existing client page. Chat can change the hero layout, cover presentation, colors, typography, section order, chapters, testimonials, FAQ and download area. The original page stays live until a design is published.

Optionally upload PDF, DOCX, PNG, JPG or WebP reference files. Each draft accepts up to eight files, 12 MB per file and 24 MB total. Word references use text content. Upload images separately to use them on the web page. Files provide content and visual context for the page redesign.

New attachments show in the composer before sending. The remove button works for pending and uploaded references. Removing an uploaded reference persists across reloads and excludes it from future AI input; its stored file remains available to saved and published designs that already use it. Limits apply to active references.

## AI configuration

The Ebook editor uses the server-only `EBOOK_AI_API_KEY` constant in `src/app/actions/ebook-studio.ts`. Keep that credential private when sharing source code. The default model is `googleai/gemini-2.5-flash`; `EBOOK_AI_MODEL` can override it. Source content is sent to Google when an admin submits a chat request. Never put API keys in a `NEXT_PUBLIC_` variable.

The editor checks structured page data before saving and uses a shared React renderer for the preview and live page. It does not execute generated scripts, HTML or CSS. Failed requests keep the current version.

## Storage and history

The `studio_ebook*` MySQL tables initialize when the admin opens the editor. Uploads live in `storage/ebooks/`, outside the public directory, and are served through authenticated routes. Only images referenced by the currently published design are accessible through the public asset endpoint. Reference PDFs, Word files and unused images stay protected. Deployments must provide persistent writable storage for that directory. Back up both MySQL and the source files.

Each successful chat edit creates a revision. Undo follows its parent; redo chooses the newest child. Restoring a specific version changes the current selection without deleting any versions. Editing an older version creates another branch. Concurrent changes to the selected revision or source files reject stale AI results.

## Publishing and verification

Click **Publish to /ebook** to make the selected design visible to clients. Undo, redo and restore change the draft selection only; publish the selection to apply it to the client page. To return to the existing page, restore **Original /ebook page** and publish. Publishing the original also removes public access to draft images. The existing client login gate, email capture, ebook download and success page remain functional.

Earlier document-editor revisions, if any, remain saved but cannot be published as web pages. Use chat to create a page design from them.

Run `node scripts/test-ebook-studio.cjs` and `npm run typecheck`. The self-check uses mock authorization and database responses and does not call a paid AI service or alter existing ebooks. Live generation requires a configured key and an authenticated admin session.
