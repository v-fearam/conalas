# Diseño con Alas

Sitio web para **Diseño con Alas**, estudio de diseño gráfico e imprenta de Bibi Lasala en General Belgrano, Buenos Aires, Argentina.

---

## Sobre el proyecto

Diseño con Alas es una agencia de diseño que ofrece servicios de cartelería, papelería comercial, souvenirs personalizados, indumentaria y más. Este sitio web permite a los clientes conocer los servicios, explorar el portfolio de trabajos y enviar consultas a través de un formulario de contacto seguro.

## Funcionalidades

- **Navegación multi-página** con rutas dedicadas para cada sección (Inicio, Servicios, Portfolio, Nosotros, Contacto)
- **Catálogo de servicios** — Servicios cargados desde la base de datos con CRUD desde admin
- **Galería de portfolio** — Carrusel interactivo con imágenes almacenadas en Supabase Storage, CRUD desde admin
- **Formulario de contacto** — Validación en tiempo real, protegido con CAPTCHA (Cloudflare Turnstile)
- **Notificaciones por email** — Alerta automática por email (vía Resend) cuando se recibe una nueva consulta
- **Panel de administración** — Login con JWT, gestión de contactos, servicios y portfolio
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
| Resend | 6 | Notificaciones por email |
| Jest | 30 | Testing unitario y E2E |
| Supertest | 7 | Testing de endpoints HTTP |

### Infraestructura

| Servicio | Uso |
|---|---|
| Supabase | Base de datos PostgreSQL + Storage (imágenes) |
| Cloudflare Turnstile | Protección CAPTCHA |
| Resend | Envío de emails transaccionales |
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
│  │  /servicios       │   │  POST /auth/login   │ │
│  │  /portfolio       │   │  POST /contact      │ │
│  │  /nosotros        │   │  GET  /contact  *   │ │
│  │  /contacto        │   │  PATCH /contact/:id*│ │
│  │  /admin/login     │   │  GET  /services     │ │
│  │  /admin/contactos │   │  CRUD /services  *  │ │
│  │  /admin/servicios │   │  GET  /portfolio    │ │
│  │  /admin/portfolio │   │  CRUD /portfolio *  │ │
│  │  /* (404)         │   │                     │ │
│  │                   │   │  ┌───────────────┐  │ │
│  └──────────────────┘   │  │SupabaseModule │  │ │
│                          │  │  (global)     │  │ │
│                          │  └───────┬───────┘  │ │
│                          │  ┌───────┼───────┐  │ │
│                          │  │AuthModule     │  │ │
│                          │  │ JWT + bcrypt  │  │ │
│                          │  └───────┬───────┘  │ │
│                          │  ┌───────┼───────┐  │ │
│                          │  │ResendModule   │  │ │
│                          │  │ Email alerts  │  │ │
│                          │  └───────┬───────┘  │ │
│                          │  ┌───────┼───────┐  │ │
│                          │  │ContactModule  │  │ │
│                          │  │ + Turnstile   │  │ │
│                          │  └───────┬───────┘  │ │
│                          │  ┌───────┼───────┐  │ │
│                          │  │ServicesModule │  │ │
│                          │  │ CRUD + caché  │  │ │
│                          │  └───────┬───────┘  │ │
│                          │  ┌───────┼───────┐  │ │
│                          │  │PortfolioModule│  │ │
│                          │  │CRUD + Storage │  │ │
│                          │  └───────┬───────┘  │ │
│                          └──────────┼──────────┘ │
└─────────────────────────────────────┼────────────┘
                                      │
                          ┌───────────▼──────────┐
                          │       Supabase       │
                          │ PostgreSQL + Storage  │
                          └──────────────────────┘
```

### Estructura del proyecto

```
conalas/
├── package.json              # Monorepo raíz (npm workspaces)
├── CLAUDE.md                 # Instrucciones del proyecto
│
├── backend/                  # API NestJS
│   └── src/
│       ├── main.ts           # Bootstrap (Helmet, CORS, validación, body limit 5mb)
│       ├── app.module.ts     # Módulo raíz + rate limiting
│       ├── supabase/         # Módulo global de Supabase
│       ├── auth/             # Módulo de autenticación (JWT + bcrypt)
│       ├── resend/           # Módulo global de notificaciones por email (Resend)
│       ├── contact/          # Módulo de contacto (CRUD + Turnstile)
│       ├── services/         # Módulo de servicios (CRUD + caché 2h)
│       └── portfolio/        # Módulo de portfolio (CRUD + Supabase Storage)
│
└── frontend/                 # App React + Vite
    └── src/
        ├── context/          # AuthContext (autenticación)
        ├── components/       # Header, Hero, Services, Portfolio, About, Contact, Footer, AdminLayout
        ├── pages/            # Páginas públicas + admin/ (Contactos, Servicios, Portfolio)
        ├── constants/        # Constantes compartidas (teléfono, redes, dirección)
        └── assets/logos/     # Logos de la marca
```

## Seguridad

- **Helmet** — Cabeceras HTTP de seguridad (X-Content-Type-Options, HSTS, etc.)
- **Autenticación JWT** — Tokens firmados con expiración de 8 horas, contraseñas hasheadas con bcrypt
- **Rate limiting** — 10 req/min global, 3 req/min en `/contact`, 5 req/min en `/auth/login`
- **CORS** — Restringido al origen configurado
- **Cloudflare Turnstile** — CAPTCHA en el formulario de contacto
- **Endpoints protegidos** — Endpoints admin requieren token JWT válido
- **Content Security Policy** — CSP definido en `index.html`
- **Validación de entrada** — `@MaxLength` en todos los campos, `whitelist: true` descarta propiedades desconocidas
- **Límite de body** — Máximo 5MB por request (para uploads de imágenes)

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
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
JWT_SECRET=tu_secreto_jwt_minimo_32_caracteres
RESEND_API_KEY=re_tu_api_key
NOTIFICATION_EMAIL=tu@email.com
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
| `/health` | GET | No | Estado del servidor |
| `/auth/login` | POST | No | Login admin → `{ access_token, user }` |
| `/contact` | POST | No | Enviar consulta (con Turnstile) |
| `/contact` | GET | JWT | Listar contactos (paginado, filtros) |
| `/contact/:id` | PATCH | JWT | Marcar respondido |
| `/services` | GET | No | Servicios activos (caché 2h) |
| `/services/admin` | GET | JWT | Todos los servicios (paginado) |
| `/services` | POST | JWT | Crear servicio |
| `/services/:id` | PATCH | JWT | Actualizar servicio |
| `/portfolio` | GET | No | Portfolio activo (caché 2h) |
| `/portfolio/admin` | GET | JWT | Todo el portfolio (paginado, búsqueda) |
| `/portfolio` | POST | JWT | Crear publicación (multipart con foto) |
| `/portfolio/:id` | PATCH | JWT | Actualizar publicación |
| `/portfolio/:id` | DELETE | JWT | Eliminar publicación + foto |

## Notificaciones por email

Cuando se recibe una nueva consulta a través del formulario de contacto, el sistema envía automáticamente un email de alerta a la dirección configurada en `NOTIFICATION_EMAIL`. El email incluye nombre, email, teléfono y mensaje del contacto.

Se utiliza [Resend](https://resend.com) como proveedor de email. Para configurarlo:

1. Crear una cuenta en [resend.com](https://resend.com)
2. Obtener una API key desde el dashboard
3. Configurar las variables de entorno `RESEND_API_KEY` y `NOTIFICATION_EMAIL`
4. En producción, agregar ambas como variables de entorno en Vercel

> Las notificaciones son "fire-and-forget": si el envío falla, el contacto se guarda igualmente en la base de datos.

## Panel de administración

El panel admin se accede desde `/admin/login`. Los usuarios admin se crean directamente en la tabla `admin_users` de Supabase (no hay registro público).

Secciones disponibles:
- **Contactos** (`/admin/contactos`) — Lista de consultas recibidas con filtros por fecha, estado y paginación
- **Servicios** (`/admin/servicios`) — CRUD de servicios con orden, icono y estado activo/inactivo
- **Portfolio** (`/admin/portfolio`) — CRUD de publicaciones con upload de fotos a Supabase Storage, búsqueda por título, filtros por servicio y estado

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

-- Tabla de servicios
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo VARCHAR(100) NOT NULL,
  descripcion VARCHAR(300),
  icono VARCHAR(50),
  orden INT NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_services_activo_orden ON services (activo, orden);
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Tabla de portfolio
CREATE TABLE portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id),
  titulo VARCHAR(150) NOT NULL,
  descripcion VARCHAR(500),
  foto_url TEXT,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_portfolio_activo_fecha ON portfolio (activo, fecha DESC);
CREATE INDEX idx_portfolio_service ON portfolio (service_id);
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;

-- Agregar campos de seguimiento a contactos
ALTER TABLE contacts
  ADD COLUMN respondido BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN respondido_at TIMESTAMPTZ;
```

### Supabase Storage

Crear un bucket llamado `portfolio` en Supabase Storage (público para lectura) para almacenar las fotos de las publicaciones del portfolio.

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