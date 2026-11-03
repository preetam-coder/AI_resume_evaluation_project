# ResumeIQ

ResumeIQ is a responsive resume-to-role analysis app built with React, TypeScript, Vite, Supabase Auth/Postgres/RLS and a server-side Groq Edge Function.

## Included

- Landing page, account creation/sign-in, email confirmation handling, password reset, protected workspace, theme preference and profile settings.
- PDF/DOCX upload and text extraction, 8 MB upload limit, selectable text preview, section parsing and local skill extraction; scanned-PDF/OCR guidance.
- Explainable deterministic baseline scoring and existing AI skill-gap detection; contextual Groq analysis, editable ATS-focused resume drafts, factual project structuring, professional summaries, and fact-preserving bullet rewrites.
- Puppeteer-generated single-column PDF exports from editable resume drafts.
- Consent-based saving, owner-scoped history/search/filter/detail/delete, account-wide analysis deletion and RLS policies.
- No permanent file upload. Resume text is stored only when the signed-in user opts into saving. Text is sent to Groq when an AI feature is requested.

## Local setup

Prerequisites: Node.js 20.19+ or 22.12+, npm, and a Supabase project.

```powershell
npm install
Copy-Item .env.example .env.local
```

Set `.env.local`:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_publishable_or_anon_key
```

Start the app with `npm run dev`; create a production build with `npm run build`. The Resume Builder PDF endpoint uses Puppeteer Core and an installed Chrome or Edge browser. It auto-detects common locations; set `PUPPETEER_EXECUTABLE_PATH` if your browser is installed elsewhere. The PDF endpoint is served by the Vite dev/preview server, so a static-only production host needs an equivalent Node endpoint for PDF export.

## Supabase setup

1. Apply `supabase/migrations/20261102000000_resumeiq_schema.sql` to your project (Supabase CLI migration workflow or SQL editor). Tables are `profiles` and `resume_analyses`; RLS policies scope all rows to `auth.uid()`.
2. Deploy `supabase/functions/analyze-resume/index.ts` as the `analyze-resume` Edge Function with JWT verification enabled.
3. Add `GROQ_API_KEY` to the Edge Function secrets in Supabase Dashboard → Edge Functions → Secrets. Do not put it in a `VITE_` variable, `.env.example`, or browser code.
4. Configure Supabase Auth email confirmation and redirect URLs for local development and your production origin. Add the exact app origin plus `/auth` (for example, `http://localhost:5173/auth`) to the Auth redirect allowlist. The sign-up flow redirects confirmation links back to the app origin.
5. For production sign-ups, configure a custom SMTP provider under Supabase Auth settings. Supabase's built-in mail service is rate-limited and is intended for testing; if it returns an email rate-limit error, wait for the limit to reset and configure SMTP before retrying.
6. Create `.env.local` using the project URL and its publishable/anon key. These are the only Supabase values exposed to the browser.

The function authenticates the caller's Supabase JWT before invoking Groq for analysis, resume generation, project structuring, summaries, or bullet rewrites. Groq errors, rate limits, timeouts and missing credentials produce clear errors. When the AI service is unavailable, the browser uses a deterministic keyword/section baseline and discloses that it is a baseline.

## Scoring and privacy

The AI estimate weights keyword relevance 40%, skill overlap 30%, experience relevance 20%, and education/section completeness 10%. The fallback baseline derives keyword and section estimates directly from text. These scores are heuristic estimates; they do not replicate employer ATS systems or predict interview selection.

Without save consent, an analysis is held only for the current tab session. With consent, the app stores the extracted resume text, job description, score, structured findings and role title in the user's private row. Delete individual records from history or all analyses in Settings. Uploaded files are never stored. Account deletion must currently be completed through the Supabase dashboard/admin workflow; deleting the Auth user cascades profile and analysis rows.

Uploaded resume/job text is untrusted and the Edge Function instructs the model to ignore embedded instructions. The bullet rewriting feature may improve wording but should be reviewed; only user-provided facts are allowed.

## REA reference limitation

The requested REA repository was inspected at its public documentation level. No local REA command or integration was configured, and no reference target beyond the tool repository was provided. No global installation/configuration was changed. The app follows the supplied requirements and has an original visual design.

## Verification

Run `npm run build` for TypeScript and production-bundle checks. Configure a Supabase project and Groq secret to exercise authenticated AI analysis. RLS should be verified with two separate user accounts before production use.

# AI_resume_evaluation_project
