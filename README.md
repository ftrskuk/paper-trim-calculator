# Paper Trim Calculator (MVP)

AI-assisted web application that helps paper mill planners build optimal trim size production combinations. This MVP follows the requirements outlined in `docs/PRD.md` and reuses logic from the original prototype.

## Tech Stack

- Next.js 16 (App Router) with React 19 and TypeScript
- Tailwind CSS 4 (JIT via `@tailwind` directives)
- Supabase client (placeholder integration)
- OpenAI Responses API (server-side)
- XLSX & jsPDF for exports

## Key Features

- **Dynamic calculator UI**: Configure base mill settings, roll requirements, and flexible set combinations with live width/weight totals.
- **AI "Fill with GPT"**: Calls `/api/optimize` which proxies to OpenAI for deckle-compliant set suggestions.
- **History/API stubs**: REST endpoints prepared for Supabase-backed persistence.
- **Data export**: One-click Excel (.xlsx) and PDF (.pdf) downloads of the current calculator state.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env.local` with your keys:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   OPENAI_API_KEY=sk-...
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Visit [http://localhost:3000](http://localhost:3000) and log in with the mock session (auto-signed in).

## Project Structure

- `src/app/page.tsx`: Main calculator experience.
- `src/app/api/optimize/route.ts`: Server endpoint that calls OpenAI Responses API.
- `src/utils/calculations.ts`: Deterministic width/weight aggregation helpers.
- `src/utils/export.ts`: Excel/PDF export helpers.
- `src/services/supabase.ts`: Server client placeholder for Supabase integration.
- `docs/PRD.md`: Product requirements reference.

## Next Steps

- Replace auth mock with Supabase Auth (Google SSO).
- Implement Supabase CRUD endpoints for calculation history.
- Harden OpenAI prompt + add retry/error telemetry.
- Add Playwright or Cypress E2E tests around the calculator flow.
