-- ============================================================
-- Diseño con Alas — Script de inicialización de base de datos
-- Supabase (PostgreSQL)
--
-- Ejecutar en el SQL Editor de Supabase para recrear
-- todas las tablas, índices, RLS policies y storage
-- en un proyecto nuevo desde cero.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. TABLAS
-- ────────────────────────────────────────────────────────────

-- 1.1 admin_users: usuarios administradores (login JWT)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  nombre      text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 1.2 contacts: mensajes del formulario de contacto
CREATE TABLE IF NOT EXISTS public.contacts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre        text NOT NULL,
  email         text NOT NULL,
  telefono      text NOT NULL,
  mensaje       text,
  created_at    timestamptz NOT NULL DEFAULT timezone('utc', now()),
  respondido    boolean NOT NULL DEFAULT false,
  respondido_at timestamptz
);

-- 1.3 services: servicios que ofrece el taller
CREATE TABLE IF NOT EXISTS public.services (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo      varchar NOT NULL,
  descripcion varchar NOT NULL,
  icono       varchar NOT NULL,
  orden       integer NOT NULL DEFAULT 0,
  activo      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 1.4 portfolio: trabajos realizados
CREATE TABLE IF NOT EXISTS public.portfolio (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id  uuid NOT NULL REFERENCES public.services(id),
  titulo      varchar NOT NULL,
  descripcion varchar,
  foto_url    text,
  fecha       date NOT NULL,
  activo      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 2. ÍNDICES
-- ────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_services_activo_orden
  ON public.services (activo, orden);

CREATE INDEX IF NOT EXISTS idx_portfolio_activo_fecha
  ON public.portfolio (activo, fecha DESC);

CREATE INDEX IF NOT EXISTS idx_portfolio_service_id
  ON public.portfolio (service_id);

-- ────────────────────────────────────────────────────────────
-- 3. ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────────────────────

-- 3.1 admin_users — RLS habilitado (sin policies públicas;
--     solo service_role accede desde el backend)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 3.2 contacts
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts"
  ON public.contacts FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated reads"
  ON public.contacts FOR SELECT
  TO public
  USING (auth.role() = 'authenticated');

-- 3.3 services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active services"
  ON public.services FOR SELECT
  TO anon
  USING (activo = true);

-- 3.4 portfolio
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon puede leer portfolio activo"
  ON public.portfolio FOR SELECT
  TO anon
  USING (activo = true);

CREATE POLICY "Service role acceso total portfolio"
  ON public.portfolio FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ────────────────────────────────────────────────────────────
-- 4. STORAGE — Bucket para imágenes de portfolio
-- ────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO NOTHING;

-- Lectura pública de imágenes
CREATE POLICY "Anon puede leer portfolio bucket"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id = 'portfolio');

-- El backend (service_role) puede subir/borrar
CREATE POLICY "Service role acceso total portfolio bucket"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'portfolio')
  WITH CHECK (bucket_id = 'portfolio');

-- ────────────────────────────────────────────────────────────
-- 5. DATOS INICIALES (opcional)
-- ────────────────────────────────────────────────────────────
-- Para crear un usuario admin, ejecutá lo siguiente reemplazando
-- el hash con el resultado de bcrypt (10 rounds):
--
--   INSERT INTO public.admin_users (email, password_hash, nombre)
--   VALUES (
--     'tu-email@ejemplo.com',
--     '$2b$10$...hash_generado_con_bcrypt...',
--     'Tu Nombre'
--   );
--
-- Podés generar el hash con Node.js:
--   node -e "require('bcrypt').hash('tu-password', 10).then(h => console.log(h))"
