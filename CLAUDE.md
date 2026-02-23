# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Diseño con Alas" — a design agency website for Bibi Lasala in General Belgrano, Buenos Aires, Argentina. Monorepo with npm workspaces containing a NestJS backend and React frontend. All user-facing content is in Argentine Spanish.

## Project Structure

```
conalas/
├── package.json                          # Root monorepo (npm workspaces)
├── CLAUDE.md
├── README.md                             # Project readme (Spanish)
├── .vscode/launch.json                   # Debug Backend config
├── .mcp.json                             # MCP server config (Supabase)
│
├── backend/                              # NestJS 11 API
│   ├── src/
│   │   ├── main.ts                       # Bootstrap (Helmet, CORS, ValidationPipe, body limit)
│   │   ├── app.module.ts                 # Root module (imports all feature modules + ThrottlerModule)
│   │   ├── app.controller.ts             # GET /health
│   │   ├── app.service.ts
│   │   ├── app.controller.spec.ts
│   │   ├── supabase/                     # @Global() shared module
│   │   │   ├── supabase.module.ts
│   │   │   └── supabase.service.ts       # Supabase client wrapper
│   │   ├── auth/                         # Authentication module (JWT + bcrypt)
│   │   │   ├── auth.module.ts            # JwtModule.registerAsync, exports AuthGuard
│   │   │   ├── auth.controller.ts        # POST /auth/login
│   │   │   ├── auth.service.ts           # bcrypt verify + JWT sign
│   │   │   ├── auth.guard.ts             # CanActivate guard (Bearer token)
│   │   │   └── login.dto.ts              # { email, password } validation
│   │   ├── resend/                       # @Global() email notification module (Resend)
│   │   │   ├── resend.module.ts
│   │   │   └── resend.service.ts         # Sends contact notification emails
│   │   ├── contact/                      # Contact feature module
│   │   │   ├── contact.module.ts
│   │   │   ├── contact.controller.ts     # POST, GET (auth), PATCH :id (auth)
│   │   │   ├── contact.service.ts        # Turnstile verification + Supabase CRUD
│   │   │   ├── create-contact.dto.ts     # Validation with class-validator + @MaxLength
│   │   │   ├── find-all-contacts.dto.ts  # Pagination, sorting, filtering query params
│   │   │   └── update-contact.dto.ts     # { respondido: boolean }
│   │   ├── services/                     # Services feature module
│   │   │   ├── services.module.ts
│   │   │   ├── services.controller.ts    # GET (public), GET /admin, POST, PATCH, DELETE, PATCH /reorder (auth)
│   │   │   ├── services.service.ts       # CRUD + in-memory cache (2h TTL)
│   │   │   ├── services.controller.spec.ts
│   │   │   ├── create-service.dto.ts
│   │   │   ├── update-service.dto.ts
│   │   │   └── find-all-services.dto.ts
│   │   └── portfolio/                    # Portfolio feature module
│   │       ├── portfolio.module.ts
│   │       ├── portfolio.controller.ts   # GET (public), GET /admin, POST, PATCH, DELETE (auth, multipart)
│   │       ├── portfolio.service.ts      # CRUD + Supabase Storage upload + in-memory cache (2h TTL)
│   │       ├── portfolio.controller.spec.ts
│   │       ├── create-portfolio.dto.ts
│   │       ├── update-portfolio.dto.ts
│   │       └── find-all-portfolio.dto.ts
│   ├── test/                             # E2E tests
│   ├── vercel.json                       # Vercel deployment config
│   ├── nest-cli.json
│   ├── eslint.config.mjs
│   ├── tsconfig.json
│   ├── tsconfig.build.json
│   └── package.json
│
├── frontend/                             # React 19 + Vite 7
│   ├── .env                              # VITE_API_URL, VITE_TURNSTILE_SITE_KEY
│   ├── index.html                        # Entry point, CSP meta tag, favicon
│   ├── vite.config.ts
│   ├── vercel.json                       # Vercel rewrites (SPA fallback)
│   ├── public/
│   │   ├── portfolio/                    # Legacy portfolio images (migrated to Supabase Storage)
│   │   ├── googlec7cd0729972b90b2.html   # Google Search Console verification
│   │   ├── robots.txt
│   │   └── sitemap.xml
│   ├── src/
│   │   ├── main.tsx                      # React entry (wraps App in AuthProvider)
│   │   ├── App.tsx                       # BrowserRouter + Routes (public + admin + 404)
│   │   ├── App.css
│   │   ├── index.css                     # Global styles, CSS vars, fonts
│   │   ├── constants/
│   │   │   └── site.ts                   # Shared constants (phone, address, social links)
│   │   ├── context/
│   │   │   └── AuthContext.tsx            # Auth state (login, logout, token in localStorage)
│   │   ├── components/
│   │   │   ├── Header/                   # Sticky nav with NavLink
│   │   │   ├── Hero/                     # Landing hero section
│   │   │   │   ├── Services/                 # Service cards fetched from API (Services.tsx)
│   │   │   ├── Portfolio/                # Swiper carousel fetched from API (Portfolio.tsx)
│   │   │   ├── About/                    # Company info + values (data.tsx + About.tsx)
│   │   │   ├── Contact/                  # Form (react-hook-form + Turnstile) + info
│   │   │   ├── Footer/                   # Brand, socials, API status (dev only)
│   │   │   ├── ScrollToTop.tsx           # Scroll reset on route change
│   │   │   ├── SEO.tsx                    # Reusable SEO component (React 19 native meta)
│   │   │   ├── PublicLayout.tsx           # Layout wrapper: Header + Outlet + Footer
│   │   │   ├── AdminLayout/              # Admin layout with topbar nav + Outlet
│   │   │   └── ProtectedRoute.tsx         # Redirects to /admin/login if not authenticated
│   │   ├── pages/                        # Route page wrappers
│   │   │   ├── HomePage.tsx              # /
│   │   │   ├── ServiciosPage.tsx         # /servicios
│   │   │   ├── PortfolioPage.tsx         # /portfolio
│   │   │   ├── NosotrosPage.tsx          # /nosotros
│   │   │   ├── ContactoPage.tsx          # /contacto
│   │   │   ├── NotFoundPage.tsx          # /* (404 catch-all)
│   │   │   └── admin/                    # Admin panel pages
│   │   │       ├── LoginPage.tsx         # /admin/login
│   │   │       ├── LoginPage.module.css
│   │   │       ├── ContactosPage.tsx     # /admin/contactos (list, filter, mark responded)
│   │   │       ├── ContactosPage.module.css
│   │   │       ├── ServiciosAdminPage.tsx     # /admin/servicios (CRUD, reorder, toggle active)
│   │   │       ├── ServiciosAdminPage.module.css
│   │   │       ├── PortfolioAdminPage.tsx     # /admin/portfolio (CRUD, search, pagination, file upload)
│   │   │       └── PortfolioAdminPage.module.css
│   │   └── assets/
│   │       └── logos/                    # Brand logos (4 variants)
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

- `main.ts` — bootstrap with Helmet, CORS (restricted via `CORS_ORIGIN` env var, methods: GET/POST/PATCH/DELETE/OPTIONS), global `ValidationPipe(whitelist, transform)`, body size limit (`5mb` for multipart uploads)
- `app.module.ts` — root module, imports feature modules + `SupabaseModule`, global rate limiting via `@nestjs/throttler` (10 req/min, 50 req/hour per IP)
- `supabase/` — `@Global()` shared module providing `SupabaseService` to all feature modules (no need to import per-module)
- Feature modules follow the pattern: `src/<feature>/` containing `<feature>.module.ts`, `<feature>.controller.ts`, `<feature>.service.ts`, and DTOs
- DTOs use `class-validator` decorators for request validation (including `@MaxLength`)
- **Error handling**: services throw NestJS exceptions (`BadRequestException`, `InternalServerErrorException`) — never return `{ success: false, error }` objects
- Port configured via `process.env.PORT` (default 3000)

**Current modules**: AppModule (health check), SupabaseModule (global), ResendModule (global, email notifications), AuthModule (JWT login + guard), ContactModule (CRUD + Turnstile + email alert), ServicesModule (CRUD + in-memory cache), PortfolioModule (CRUD + Supabase Storage uploads + in-memory cache)

**Security**: Helmet (HTTP headers), `@nestjs/throttler` (rate limiting), Cloudflare Turnstile (CAPTCHA), JWT authentication (AuthGuard), body size limit

### Frontend (React 19 + Vite 7)

Multi-page app using React Router. Public site + admin panel behind authentication.

- **Routing**: `BrowserRouter` in App.tsx with two layout groups:
  - **Public routes** (`PublicLayout`): `/`, `/servicios`, `/portfolio`, `/nosotros`, `/contacto` — wrapped with Header + Footer
  - **Admin routes** (`ProtectedRoute`): `/admin/login`, `/admin/contactos`, `/admin/servicios`, `/admin/portfolio` — login is public, rest require auth. `/admin` redirects to `/admin/contactos`
  - `/*` catch-all renders NotFoundPage
- **Auth**: `AuthContext` in `src/context/AuthContext.tsx` — provides `login()`, `logout()`, `isAuthenticated`, `token`. Token stored in `localStorage` as `admin_token`. `ProtectedRoute` redirects unauthenticated users to `/admin/login`.
- **Styling**: CSS Modules colocated with components, global CSS vars in `index.css`. Never hardcode colors — always use CSS variables.
- **Data pattern**: Services and Portfolio fetch from the API with sessionStorage cache (2h TTL). Static data files (`data.ts`/`data.tsx`) used only for About section
- **Shared constants**: Site-wide info (phone, address, social links) centralized in `constants/site.ts`
- **Env**: `VITE_API_URL` and `VITE_TURNSTILE_SITE_KEY` in `.env` — accessed via `import.meta.env.VITE_*  ?? ''` (never `as string`)
- **Dev indicator**: Footer shows API health status in dev mode only (`import.meta.env.DEV`)
- **Libraries**: react-router-dom (routing), Swiper (carousel), react-hook-form (forms), react-icons (icons), react-turnstile (CAPTCHA)
- **Assets**: logos in `src/assets/logos/`, portfolio images served from Supabase Storage (uploaded via admin)
- **SEO**: `robots.txt`, `sitemap.xml`, Google Search Console verification file in `public/`
- **CSP**: Content Security Policy defined via `<meta>` tag in `index.html` — update it when adding new external resources

### API Contract

| Endpoint | Method | Auth | Body / Query | Response |
|----------|--------|------|-------------|----------|
| `/health` | GET | No | — | `{ status: boolean }` |
| `/auth/login` | POST | No | `{ email, password }` | `{ access_token, user: { id, email, nombre } }` |
| `/contact` | POST | No | `{ nombre, email, telefono, mensaje?, turnstileToken }` | `{ success: boolean }` |
| `/contact` | GET | JWT | `?page, limit, sortField, sortOrder, respondido, startDate, endDate` | `{ data, total, page, limit, totalPages }` |
| `/contact/:id` | PATCH | JWT | `{ respondido: boolean }` | `{ success: boolean }` |
| `/services` | GET | No | — | `ServiceData[]` (active, ordered by orden, cached 2h) |
| `/services/admin` | GET | JWT | `?page, limit, sortField, sortOrder, activo` | `{ data, total, page, limit }` |
| `/services` | POST | JWT | `{ titulo, descripcion, icono, orden?, activo? }` | `{ success: boolean }` |
| `/services/:id` | PATCH | JWT | Partial `CreateServiceDto` | `{ success: boolean }` |
| `/services/:id` | DELETE | JWT | — | `{ success: boolean }` |
| `/services/reorder` | PATCH | JWT | `[{ id, orden }]` | `{ success: boolean }` |
| `/portfolio` | GET | No | — | `PortfolioItem[]` (active, ordered by fecha DESC, cached 2h) |
| `/portfolio/admin` | GET | JWT | `?page, limit, sortField, sortOrder, activo, service_id, search` | `{ data, total, page, limit }` |
| `/portfolio` | POST | JWT | multipart: `titulo, service_id, fecha, descripcion?, activo?, foto?` | `{ success: boolean }` |
| `/portfolio/:id` | PATCH | JWT | multipart: partial fields + optional `foto` | `{ success: boolean }` |
| `/portfolio/:id` | DELETE | JWT | — | `{ success: boolean }` |

## Code Style

- **Backend**: Prettier (single quotes, trailing commas) + ESLint with typescript-eslint
- **Frontend**: ESLint with react-hooks and react-refresh plugins
- CSS Modules for component styling, CSS custom properties defined in `index.css`
- **Never hardcode colors** — always use CSS variables (`var(--color-*)`)
- Brand colors: navy `#2B3A67` (`--color-navy`), pink `#E91E7B` (`--color-pink`), gold `#F5A623` (`--color-gold`), teal `#4ECDC4` (`--color-teal`)
- Utility colors: `--color-slate-50/200/400/600`, `--color-error`, `--color-pink-hover`

## Debugging

VS Code launch config in `.vscode/launch.json` — select "Debug Backend" and press F5 to debug NestJS with breakpoints.

## Security

### Cloudflare Turnstile (CAPTCHA)

The contact form is protected by [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/). Flow: frontend widget generates a token using the public Site Key → token is sent with the form POST → backend verifies the token against Cloudflare's `siteverify` API using the private Secret Key → only valid tokens allow the contact to be saved.

| Env Variable | Where | Purpose |
|-------------|-------|---------|
| `VITE_TURNSTILE_SITE_KEY` | `frontend/.env` | Public key — identifies the widget to Cloudflare |
| `TURNSTILE_SECRET_KEY` | `backend/.env` | Private key — backend uses it to verify tokens with Cloudflare |
| `JWT_SECRET` | `backend/.env` | Secret for signing/verifying JWT tokens (min 32 chars) |
| `RESEND_API_KEY` | `backend/.env` | Resend API key for email notifications (optional — emails disabled if missing) |
| `NOTIFICATION_EMAIL` | `backend/.env` | Email address that receives contact form alerts |
| `CORS_ORIGIN` | `backend/.env` | Allowed frontend origin(s), comma-separated |

**Dev keys** (always pass): Site `1x00000000000000000000AA`, Secret `1x0000000000000000000000000000000AA`

**Production keys**: Set real keys from the [Cloudflare Turnstile dashboard](https://dash.cloudflare.com/?to=/:account/turnstile) as Vercel environment variables.

### Other Protections

- **Helmet** (`main.ts`): HTTP security headers (X-Content-Type-Options, X-Frame-Options, HSTS, etc.)
- **JWT authentication** (`auth/`): Admin endpoints protected by `AuthGuard` (Bearer token). Tokens signed with `JWT_SECRET`, expire in 8h. Passwords hashed with bcrypt. Admin users created directly in DB (no public registration).
- **Rate limiting** (`app.module.ts`): Global 10 req/min + 50 req/hour; POST /contact stricter at 3 req/min + 10 req/hour; POST /auth/login at 5 req/min + 20 req/hour
- **CORS** (`main.ts`): Restricted to `CORS_ORIGIN` env var (defaults to `http://localhost:5173`)
- **Body size limit** (`main.ts`): `express.json({ limit: '5mb' })` to support image uploads
- **CSP** (`index.html`): Content Security Policy meta tag restricts script/style/font/image/frame/connect sources
- **Input validation**: `@MaxLength` on all DTO fields, `whitelist: true` strips unknown properties
- **Error sanitization**: Supabase errors logged server-side only, generic messages returned to client
- **No PII in logs**: Contact data (name, email, phone) is never written to stdout

### Known Issues

- **Supabase RLS not enabled**: The `contacts` table has no Row-Level Security policies. The anon key can SELECT/DELETE rows. Enable RLS in the Supabase dashboard and add an INSERT-only policy for the `anon` role.

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
