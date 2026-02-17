# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Diseño con Alas" — a design agency website for Bibi Lasala in General Belgrano, Buenos Aires, Argentina. Monorepo with npm workspaces containing a NestJS backend and React frontend. All user-facing content is in Argentine Spanish.

## Project Structure

```
conalas/
├── package.json                          # Root monorepo (npm workspaces)
├── CLAUDE.md
├── .vscode/launch.json                   # Debug Backend config
│
├── backend/                              # NestJS 11 API
│   ├── src/
│   │   ├── main.ts                       # Bootstrap (CORS, ValidationPipe)
│   │   ├── app.module.ts                 # Root module
│   │   ├── app.controller.ts             # GET /health
│   │   ├── app.service.ts
│   │   ├── app.controller.spec.ts
│   │   └── contact/                      # Contact feature module
│   │       ├── contact.module.ts
│   │       ├── contact.controller.ts     # POST /contact
│   │       ├── contact.service.ts
│   │       └── create-contact.dto.ts     # Validation with class-validator
│   ├── test/                             # E2E tests
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                             # React 19 + Vite 7
│   ├── .env                              # VITE_API_URL
│   ├── index.html                        # Entry point, favicon, title
│   ├── vite.config.ts
│   ├── src/
│   │   ├── main.tsx                      # React entry
│   │   ├── App.tsx                       # BrowserRouter + Routes
│   │   ├── App.css
│   │   ├── index.css                     # Global styles, CSS vars, fonts
│   │   ├── components/
│   │   │   ├── Header/                   # Sticky nav with NavLink
│   │   │   ├── Hero/                     # Landing hero section
│   │   │   ├── Services/                 # 6 service cards
│   │   │   ├── Portfolio/                # Swiper carousel (14 items)
│   │   │   ├── About/                    # Company info + values
│   │   │   ├── Contact/                  # Form (react-hook-form) + info
│   │   │   ├── Footer/                   # Nav, socials, API status (dev)
│   │   │   └── ScrollToTop.tsx           # Scroll reset on route change
│   │   ├── pages/                        # Route page wrappers
│   │   │   ├── HomePage.tsx              # /
│   │   │   ├── ServiciosPage.tsx         # /servicios
│   │   │   ├── PortfolioPage.tsx         # /portfolio
│   │   │   ├── NosotrosPage.tsx          # /nosotros
│   │   │   └── ContactoPage.tsx          # /contacto
│   │   └── assets/
│   │       ├── logos/                    # Brand logos (4 variants)
│   │       └── portfolio/                # Portfolio images (14 photos)
│   └── package.json
```

## Commands

```bash
# Development (run from root)
npm run dev:backend          # NestJS watch mode on :3000
npm run dev:frontend         # Vite dev server on :5173

# Testing
npm test                     # Backend Jest tests
npm test -- --watch          # Watch mode (from root)

# Single test file (from backend/)
npx jest src/contact/contact.controller.spec.ts

# Build
npm run build --workspace=backend    # NestJS → dist/
npm run build --workspace=frontend   # tsc + vite → dist/

# Linting
npm run lint --workspace=backend     # ESLint + Prettier fix
npm run lint --workspace=frontend    # ESLint

# Type checking (frontend only, backend uses nest build)
cd frontend && npx tsc --noEmit
```

## Architecture

**Monorepo** with `backend/` and `frontend/` npm workspaces. Root `package.json` has convenience scripts prefixed with `dev:`.

### Backend (NestJS 11)

Modular architecture: each feature gets its own module folder under `src/`.

- `main.ts` — bootstrap with Helmet, CORS (restricted via `CORS_ORIGIN` env var) + global `ValidationPipe(whitelist, transform)`
- `app.module.ts` — root module, imports feature modules, global rate limiting via `@nestjs/throttler` (10 req/min, 50 req/hour per IP)
- Feature modules follow the pattern: `src/<feature>/` containing `<feature>.module.ts`, `<feature>.controller.ts`, `<feature>.service.ts`, and DTOs
- DTOs use `class-validator` decorators for request validation (including `@MaxLength`)
- Port configured via `process.env.PORT` (default 3000)

**Current modules**: AppModule (health check), ContactModule (POST /contact)

**Security**: Helmet (HTTP headers), `@nestjs/throttler` (rate limiting), Cloudflare Turnstile (CAPTCHA)

### Frontend (React 19 + Vite 7)

Multi-page app using React Router. Each section is a separate route.

- **Routing**: `BrowserRouter` in App.tsx, pages in `src/pages/`, components in `src/components/<Name>/`
- **Styling**: CSS Modules colocated with components, global CSS vars in `index.css`
- **Env**: `VITE_API_URL` and `VITE_TURNSTILE_SITE_KEY` in `.env`
- **Dev indicator**: Footer shows API health status in dev mode only (`import.meta.env.DEV`)
- **Libraries**: react-router-dom (routing), Swiper (carousel), react-hook-form (forms), react-icons (icons), react-turnstile (CAPTCHA)
- **Assets**: logos in `src/assets/logos/`, portfolio images in `src/assets/portfolio/`

### API Contract

| Endpoint | Method | Body | Response |
|----------|--------|------|----------|
| `/health` | GET | — | `{ status: boolean }` |
| `/contact` | POST | `{ nombre, email, telefono, mensaje?, turnstileToken }` | `{ success: boolean }` |

## Code Style

- **Backend**: Prettier (single quotes, trailing commas) + ESLint with typescript-eslint
- **Frontend**: ESLint with react-hooks and react-refresh plugins
- CSS Modules for component styling, CSS custom properties (brand colors) defined in `index.css`
- Brand colors: navy `#2B3A67`, pink `#E91E7B`, gold `#F5A623`, teal `#4ECDC4`

## Debugging

VS Code launch config in `.vscode/launch.json` — select "Debug Backend" and press F5 to debug NestJS with breakpoints.

## Security

### Cloudflare Turnstile (CAPTCHA)

The contact form is protected by [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/). Flow: frontend widget generates a token using the public Site Key → token is sent with the form POST → backend verifies the token against Cloudflare's `siteverify` API using the private Secret Key → only valid tokens allow the contact to be saved.

| Env Variable | Where | Purpose |
|-------------|-------|---------|
| `VITE_TURNSTILE_SITE_KEY` | `frontend/.env` | Public key — identifies the widget to Cloudflare |
| `TURNSTILE_SECRET_KEY` | `backend/.env` | Private key — backend uses it to verify tokens with Cloudflare |
| `CORS_ORIGIN` | `backend/.env` | Allowed frontend origin(s), comma-separated |

**Dev keys** (always pass): Site `1x00000000000000000000AA`, Secret `1x0000000000000000000000000000000AA`

**Production keys**: Set real keys from the [Cloudflare Turnstile dashboard](https://dash.cloudflare.com/?to=/:account/turnstile) as Vercel environment variables.

### Other Protections

- **Helmet** (`main.ts`): HTTP security headers (X-Content-Type-Options, X-Frame-Options, HSTS, etc.)
- **Rate limiting** (`app.module.ts`): Global 10 req/min + 50 req/hour; POST /contact stricter at 3 req/min + 10 req/hour
- **CORS** (`main.ts`): Restricted to `CORS_ORIGIN` env var (defaults to `http://localhost:5173`)
- **Input validation**: `@MaxLength` on all DTO fields, `whitelist: true` strips unknown properties
- **Error sanitization**: Supabase errors logged server-side only, generic messages returned to client
- **No PII in logs**: Contact data (name, email, phone) is never written to stdout

## Task Routing Rules

When processing a user request, match it against the rules below and delegate to the appropriate skill or subagent. If multiple match, pick the most specific one. If none match, handle the task directly.

### Skills (invoke via `Skill` tool)

| Skill | Trigger When | Examples |
|-------|-------------|----------|
| `nestjs-expert` | Any work inside `backend/`: new modules, controllers, services, DTOs, guards, interceptors, pipes, middleware, DI issues, NestJS testing, NestJS debugging | "add a new endpoint", "fix dependency injection error", "create a guard for auth", "write unit tests for contact service" |
| `ui-ux-pro-max` | UI/UX design decisions, choosing styles/palettes/fonts, building or reviewing visual components, accessibility audits, design system generation, landing page design | "choose a color palette", "review this component for UX issues", "make the hero section more engaging", "generate a design system", "check accessibility" |
| `vercel-react-best-practices` | Writing, reviewing, or optimizing React components in `frontend/`: performance, re-renders, bundle size, data fetching, hooks patterns | "optimize this component", "reduce bundle size", "fix re-render issue", "review this React code for performance", "implement lazy loading" |
| `postgresql-table-design` | Designing new database tables, choosing column types, defining constraints, indexing strategy, schema migrations | "design the users table", "what data type for prices", "add an index", "create a schema for orders" |
| `supabase-postgres-best-practices` | Optimizing existing SQL queries, connection pooling, RLS policies, monitoring/diagnostics, locking issues, Supabase-specific Postgres config | "this query is slow", "set up row-level security", "configure connection pooling", "analyze query plan" |
| `nextjs-supabase-auth` | Authentication with Supabase + Next.js: login/signup flows, auth middleware, protected routes, OAuth callbacks, session handling | "add Supabase auth", "protect this route", "implement login with Google", "set up auth middleware" |
| `find-skills` | User asks for a capability that no installed skill covers, or explicitly asks to find/install a skill | "is there a skill for X", "find a skill for deployment", "can you do X" (when X is outside current skill coverage) |
| `keybindings-help` | Customizing Claude Code keyboard shortcuts | "rebind ctrl+s", "change the submit key", "customize keybindings" |

### Subagents (invoke via `Task` tool)

| Subagent | Trigger When | Examples |
|----------|-------------|----------|
| `Explore` | Broad codebase exploration, finding patterns across many files, understanding how a feature works end-to-end, when simple Glob/Grep won't suffice (needs 3+ queries) | "how does routing work in this project", "find all places that call the API", "understand the auth flow" |
| `Plan` | Designing implementation strategy for non-trivial features before writing code, architectural trade-off analysis | "plan how to add user accounts", "what's the best approach to add payments" |
| `Bash` | Running shell commands: git operations, npm scripts, builds, dev servers, system tasks | "run the tests", "start the backend", "install a package", "check git log" |
| `general-purpose` | Multi-step research tasks, searching for code across the codebase when unsure of location, complex investigations | "investigate why the build fails", "find and summarize all API endpoints", "research how Swiper is configured" |
| `claude-code-guide` | Questions about Claude Code itself: features, settings, hooks, MCP servers, IDE integrations, Agent SDK, Anthropic API | "how do I configure hooks", "does Claude Code support X", "how to use MCP servers" |

### Routing Priority

1. **Exact domain match** — If the request clearly falls within one skill's domain, use that skill.
2. **Backend vs Frontend** — Requests about `backend/` go to `nestjs-expert`; requests about `frontend/` components/pages first check `vercel-react-best-practices` (for perf) or `ui-ux-pro-max` (for design).
3. **Database** — Schema design goes to `postgresql-table-design`; query optimization and Supabase config go to `supabase-postgres-best-practices`.
4. **Exploration before action** — For ambiguous requests, use `Explore` subagent first to understand the codebase, then delegate to the appropriate skill.
5. **Direct handling** — Simple edits (rename a variable, fix a typo, add a comment) don't need delegation. Just do them.
6. **Skill discovery** — If the user needs a capability not covered by any installed skill, use `find-skills` to search the ecosystem.
