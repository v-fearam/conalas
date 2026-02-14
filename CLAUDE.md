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

- `main.ts` — bootstrap with CORS + global `ValidationPipe(whitelist, transform)`
- `app.module.ts` — root module, imports feature modules
- Feature modules follow the pattern: `src/<feature>/` containing `<feature>.module.ts`, `<feature>.controller.ts`, `<feature>.service.ts`, and DTOs
- DTOs use `class-validator` decorators for request validation
- Port configured via `process.env.PORT` (default 3000)

**Current modules**: AppModule (health check), ContactModule (POST /contact)

### Frontend (React 19 + Vite 7)

Multi-page app using React Router. Each section is a separate route.

- **Routing**: `BrowserRouter` in App.tsx, pages in `src/pages/`, components in `src/components/<Name>/`
- **Styling**: CSS Modules colocated with components, global CSS vars in `index.css`
- **Env**: `VITE_API_URL` in `.env` configures backend URL
- **Dev indicator**: Footer shows API health status in dev mode only (`import.meta.env.DEV`)
- **Libraries**: react-router-dom (routing), Swiper (carousel), react-hook-form (forms), react-icons (icons)
- **Assets**: logos in `src/assets/logos/`, portfolio images in `src/assets/portfolio/`

### API Contract

| Endpoint | Method | Body | Response |
|----------|--------|------|----------|
| `/health` | GET | — | `{ status: boolean }` |
| `/contact` | POST | `{ nombre, email, telefono, mensaje? }` | `{ success: boolean }` |

## Code Style

- **Backend**: Prettier (single quotes, trailing commas) + ESLint with typescript-eslint
- **Frontend**: ESLint with react-hooks and react-refresh plugins
- CSS Modules for component styling, CSS custom properties (brand colors) defined in `index.css`
- Brand colors: navy `#2B3A67`, pink `#E91E7B`, gold `#F5A623`, teal `#4ECDC4`

## Debugging

VS Code launch config in `.vscode/launch.json` — select "Debug Backend" and press F5 to debug NestJS with breakpoints.
