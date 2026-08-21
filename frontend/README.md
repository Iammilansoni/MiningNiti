# MiningNiti — Frontend

The Next.js client for **MiningNiti**, an AI document-intelligence platform for the
coal mining industry. It is the whole user-facing surface: the marketing landing
page, Clerk-authenticated sign-in, and the signed-in application — document upload
and registry, streamed RAG chat with page-level citations, an inline PDF viewer,
compliance audits, prompt templates and the analytics dashboard.

All AI work happens in the FastAPI backend; this app renders it and streams from it.

**Live:** [miningniti.vercel.app](https://miningniti.vercel.app) · **Full project docs:** [`../README.md`](../README.md)

---

## Tech Stack

| Area | What is used |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19 |
| Language | TypeScript 5 (`strict: true`) |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`), design tokens in `src/styles/design-tokens.css` |
| Components | shadcn/ui over Radix UI primitives, `lucide-react` icons, Geist font |
| Auth | Clerk (`@clerk/nextjs` v6) |
| Server state | TanStack Query v5 |
| Client state | Zustand v5 |
| Charts | Recharts v2 |
| Motion | Framer Motion v12, Lenis smooth scroll |
| Documents | `react-pdf` v10, `react-dropzone`, `react-markdown` |
| Forms | React Hook Form + Zod |

---

## Local Setup

**Prerequisite:** Node.js 24+ (pinned in `.nvmrc` and `package.json` `engines`).

```bash
npm install
cp .env.example .env.local     # then fill in the values below
npm run dev                    # http://localhost:3000
```

### Environment variables

`.env.example` documents each one in full; the short version:

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Yes | FastAPI backend base URL, no trailing slash — the client appends `/api/v1`. `http://localhost:8000` locally, the HuggingFace Space URL in production |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key — server-side only, the one genuinely secret value here |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `..._SIGN_UP_URL` | Yes | Where the Clerk auth pages live (`/sign-in`, `/sign-up`) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` / `..._SIGN_UP_...` | Yes | Landing route after auth when no redirect target is set |

Everything prefixed `NEXT_PUBLIC_` is compiled into the browser bundle and is
public by definition. Next.js inlines these at **build** time, so changing a
value on Vercel does nothing until you redeploy.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (`eslint .`) — a **blocking** check in CI |

---

## Project Layout

```
src/
├── app/                 # App Router
│   ├── (auth)/          # sign-in, sign-up
│   ├── (dashboard)/     # chat, documents, compliance, analytics, prompts, settings, dashboard
│   ├── about/ contact/ privacy/
│   └── page.tsx         # landing page
├── components/
│   ├── landing/         # 15 landing sections (hero, pipeline diagram, ROI calculator, FAQ, …)
│   ├── chat/ documents/ dashboard/ analytics/ prompts/ product/
│   ├── layout/ settings/
│   └── ui/              # shadcn/ui primitives
├── hooks/               # use-chat-stream (SSE), use-mobile
├── lib/                 # api.ts (typed client + auth headers), document-file.ts, utils.ts
├── providers/           # QueryProvider (TanStack Query)
├── stores/              # uiStore (Zustand)
├── styles/              # design-tokens.css
└── proxy.ts             # route protection (see below)
```

Note that `(dashboard)` is a route group, so those pages are served at `/chat`,
`/documents`, `/analytics`, `/compliance`, `/prompts` and `/settings` — not
under `/dashboard/*`.

---

## Auth and routing

Authentication is enforced server-side in **`src/proxy.ts`** — Next.js 16's
replacement for `middleware.ts`. Do not reintroduce a root `middleware.ts`
alongside it.

It is deny-by-default: only `/`, `/about`, `/contact`, `/privacy`, `/sign-in*`
and `/sign-up*` are public, and everything else requires a Clerk session. A new
page is therefore protected the moment it is created, rather than the moment
someone remembers to add it to a list.

Requests to the backend carry the Clerk session token; the backend verifies it
independently against Clerk's JWKS.

---

## Testing

There is **no frontend test suite yet.** `npm run lint` and the production build
are the only automated checks, and both gate CI. Backend tests live in
[`../backend/tests/`](../backend/tests).

---

## Deployment

Deployed on Vercel from this directory. Set the environment variables above in
the project settings — including `NEXT_PUBLIC_API_BASE_URL` pointing at the
deployed backend — and redeploy after any change to a `NEXT_PUBLIC_*` value.
