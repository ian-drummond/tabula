# Tabula

Personal planner and journal. Inspired by GTD, bullet journaling and commonplace books.
Markdown everywhere; all data exportable as a folder of Markdown files.

## How it is built (v0.1)
- The full Tabula app (originally a claude.ai artifact) runs unchanged from `public/legacy/app.js`.
- `src/platform.ts` gives it the capabilities it had on claude.ai, backed by Supabase and the browser:
  - `db` → table `public.records` (one row per record: `coll`, `id`, `data` jsonb; owner-only RLS; realtime)
  - `sample` (AI) → Edge Function `ai`, which calls the Anthropic API with a key kept in Supabase secrets
  - `assets` → private Storage bucket `images/<user id>/…`
  - `downloads` → browser download; `dictation` → browser speech recognition
  - `mcp` (Google Calendar, Evernote) → off for now; Google OAuth comes later
- `src/main.ts` adds email sign-in (magic link) and loads the app after sign-in.
- `src/importZip.ts` restores a "Download all" zip from the old Tabula, images included (Data → Import).
- Over time, parts of `legacy/app.js` move into typed modules in `src/`.

## Setup
1. **Supabase**: create a project. In the SQL editor, run `supabase/migrations/20261126000000_init.sql`.
   - Authentication → URL configuration: set Site URL to the Vercel URL (and add `http://localhost:5173` for local dev).
   - After you have signed in once, turn off new sign-ups (Authentication → Sign In / Providers → allow new users: off).
   - Edge Function: deploy `supabase/functions/ai` (Supabase CLI: `supabase functions deploy ai`), then
     Edge Functions → Secrets: add `ANTHROPIC_API_KEY`.
2. **Vercel**: import this GitHub repo (framework: Vite). Environment variables:
   `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (Supabase → Settings → API).
3. **Local**: `cp .env.example .env.local`, fill in, `npm install`, `npm run dev`.

## Data
- Export: Data → "Download all" (zip of Markdown files with YAML frontmatter, images, full JSON backup).
- Planned: `git-sync` Edge Function that keeps the private `tabula-data` repo in step (see the project plan).
