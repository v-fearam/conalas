# Diseño con Alas

Sitio web para **Diseño con Alas**, estudio de diseño gráfico e imprenta de Bibi Lasala en General Belgrano, Buenos Aires, Argentina.

---

## Sobre el proyecto

Diseño con Alas es una agencia de diseño que ofrece servicios de cartelería, papelería comercial, souvenirs personalizados, indumentaria y más. Este sitio web permite a los clientes conocer los servicios, explorar el portfolio de trabajos y enviar consultas a través de un formulario de contacto seguro.

## Funcionalidades

- **Navegación multi-página** con rutas dedicadas para cada sección (Inicio, Servicios, Portfolio, Nosotros, Contacto)
- **Catálogo de servicios** — Etiquetas escolares, cartelería, papelería comercial, eventos religiosos, souvenirs y vinilo
- **Galería de portfolio** — Carrusel interactivo con imágenes de trabajos realizados
- **Formulario de contacto** — Validación en tiempo real, protegido con CAPTCHA (Cloudflare Turnstile)
- **Panel de administración** — Login con JWT, visualización de contactos y marcado de respondidos
- **Autenticación** — JWT con bcrypt, usuarios dados de alta directamente en la base de datos
- **Diseño responsive** — Adaptado a móviles, tablets y escritorio
- **Página 404** personalizada para rutas inexistentes
- **Health check** — Indicador de estado del API visible en modo desarrollo

## Tecnologías

### Frontend

| Tecnología | Versión | Uso |
|---|---|---|
| React | 19 | Biblioteca de UI |
| Vite | 7 | Bundler y servidor de desarrollo |
| TypeScript | 5.9 | Tipado estático |
| React Router | 7 | Enrutamiento SPA |
| React Hook Form | 7 | Manejo de formularios |
| Swiper | 12 | Carrusel de imágenes |
| React Icons | 5 | Iconografía |
| React Turnstile | 1 | Widget CAPTCHA de Cloudflare |
| CSS Modules | — | Estilos con alcance por componente |

### Backend

| Tecnología | Versión | Uso |
|---|---|---|
| NestJS | 11 | Framework de API |
| TypeScript | 5.7 | Tipado estático |
| Supabase JS | 2 | Cliente de base de datos |
| @nestjs/jwt | 11 | Autenticación JWT |
| bcrypt | 6 | Hashing de contraseñas |
| Helmet | 8 | Cabeceras HTTP de seguridad |
| class-validator | 0.14 | Validación de DTOs |
| class-transformer | 0.5 | Transformación de datos |
| Jest | 30 | Testing unitario y E2E |
| Supertest | 7 | Testing de endpoints HTTP |

### Infraestructura

| Servicio | Uso |
|---|---|
| Supabase | Base de datos PostgreSQL |
| Cloudflare Turnstile | Protección CAPTCHA |
| Vercel | Hosting y despliegue |

## Arquitectura

```
┌─────────────────────────────────────────────────┐
│                   Monorepo                       │
│               (npm workspaces)                   │
│                                                  │
│  ┌──────────────────┐   ┌─────────────────────┐ │
│  │    Frontend       │   │      Backend        │ │
│  │  React 19 + Vite  │──▶│    NestJS 11        │ │
│  │                   │   │                     │ │
│  │  /                │   │  GET  /health       │ │
│  │  /servicios       │   │  POST /contact      │ │
│  │  /portfolio       │   │  GET  /contact  *   │ │
│  │  /nosotros        │   │  PATCH /contact/:id*│ │
│  │  /contacto        │   │  POST /auth/login   │ │
│  │  /admin/login     │   │                     │ │
│  │  /admin/contactos │   │  ┌───────────────┐  │ │
│  │  /* (404)         │   │  │SupabaseModule │  │ │
│  │                   │   │  │  (global)     │  │ │
│  └──────────────────┘   │  └───────┬───────┘  │ │
│                          │  ┌───────┼───────┐  │ │
│                          │  │AuthModule     │  │ │
│                          │  │ JWT + bcrypt  │  │ │
│                          │  └───────┬───────┘  │ │
│                          │  ┌───────▼───────┐  │ │
│                          │  │ContactModule  │  │ │
│                          │  │ + Turnstile   │  │ │
│                          │  └───────┬───────┘  │ │
│                          └──────────┼──────────┘ │
└─────────────────────────────────────┼────────────┘
                                      │
                              ┌───────▼───────┐
                              │   Supabase    │
                              │  PostgreSQL   │
                              └───────────────┘
```

### Estructura del proyecto

```
conalas/
├── package.json              # Monorepo raíz (npm workspaces)
├── CLAUDE.md                 # Instrucciones del proyecto
│
├── backend/                  # API NestJS
│   └── src/
│       ├── main.ts           # Bootstrap (Helmet, CORS, validación)
│       ├── app.module.ts     # Módulo raíz + rate limiting
│       ├── supabase/         # Módulo global de Supabase
│       ├── auth/             # Módulo de autenticación (JWT + bcrypt)
│       └── contact/          # Módulo de contacto (controller, service, DTO)
│
└── frontend/                 # App React + Vite
    ├── public/portfolio/     # Imágenes del portfolio
    └── src/
        ├── context/          # AuthContext (autenticación)
        ├── components/       # Header, Hero, Services, Portfolio, About, Contact, Footer, AdminLayout
        ├── pages/            # Páginas públicas + admin/
        ├── constants/        # Constantes compartidas (teléfono, redes, dirección)
        └── assets/logos/     # Logos de la marca
```

## Seguridad

- **Helmet** — Cabeceras HTTP de seguridad (X-Content-Type-Options, HSTS, etc.)
- **Autenticación JWT** — Tokens firmados con expiración de 8 horas, contraseñas hasheadas con bcrypt
- **Rate limiting** — 10 req/min global, 3 req/min en `/contact`, 5 req/min en `/auth/login`
- **CORS** — Restringido al origen configurado
- **Cloudflare Turnstile** — CAPTCHA en el formulario de contacto
- **Endpoints protegidos** — GET/PATCH `/contact` requieren token JWT válido
- **Content Security Policy** — CSP definido en `index.html`
- **Validación de entrada** — `@MaxLength` en todos los campos, `whitelist: true` descarta propiedades desconocidas
- **Límite de body** — Máximo 10KB por request

## Inicio rápido

### Requisitos previos

- Node.js 18+
- npm 9+

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/conalas.git
cd conalas

# Instalar dependencias (ambos workspaces)
npm install
```

### Variables de entorno

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3000
VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA
```

**Backend** (`backend/.env`):
```env
SUPABASE_URL=tu_url_de_supabase
SUPABASE_ANON_KEY=tu_anon_key
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
JWT_SECRET=tu_secreto_jwt_minimo_32_caracteres
CORS_ORIGIN=http://localhost:5173
PORT=3000
```

### Desarrollo

```bash
# Backend (puerto 3000)
npm run dev:backend

# Frontend (puerto 5173)
npm run dev:frontend
```

### Testing

```bash
# Ejecutar tests del backend
npm test

# Tests en modo watch
npm test -- --watch
```

### Build de producción

```bash
# Backend
npm run build --workspace=backend

# Frontend
npm run build --workspace=frontend
```

## API

| Endpoint | Método | Auth | Descripción |
|---|---|---|---|
| `/health` | GET | No | Estado del servidor (`{ status: boolean }`) |
| `/contact` | POST | No | Enviar consulta (`{ nombre, email, telefono, mensaje?, turnstileToken }`) |
| `/contact` | GET | JWT | Listar todos los contactos |
| `/contact/:id` | PATCH | JWT | Actualizar estado respondido (`{ respondido: boolean }`) |
| `/auth/login` | POST | No | Login admin (`{ email, password }`) → `{ access_token, user }` |

## Panel de administración

El panel admin se accede desde `/admin/login`. Los usuarios admin se crean directamente en la tabla `admin_users` de Supabase (no hay registro público).

### Configuración inicial de la base de datos

Ejecutar en el SQL Editor de Supabase:

```sql
-- Tabla de usuarios admin
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  nombre TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Agregar campos de seguimiento a contactos
ALTER TABLE contacts
  ADD COLUMN respondido BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN respondido_at TIMESTAMPTZ;
```

### Crear un usuario admin

Generar el hash de la contraseña:

```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('tu-contraseña', 10).then(h => console.log(h))"
```

Insertar en Supabase:

```sql
INSERT INTO admin_users (email, password_hash, nombre)
VALUES ('tu@email.com', '$2b$10$hash_generado', 'Tu Nombre');
```

## Licencia

Proyecto privado. Todos los derechos reservados.