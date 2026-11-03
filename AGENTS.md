## NAGSI architecture

- Blueprint's /frontend, /backend, /ai-service, /database map onto: `src/routes` (UI), Supabase tables + RLS (backend/database), `src/lib/chat.server.ts` + `/api/chat` (AI assistant). Why: the platform runs one TanStack Start app, not separate Express/FastAPI services.
- Risk triage scoring lives only in `src/lib/risk.ts` (tested). Why: keeps the score explainable and in one place.
- Gov portal access is gated by `is_gov()` RLS; demo signup grants gov_officer to everyone. Why: prototype convenience; tighten before real use.
