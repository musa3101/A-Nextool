-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tabla: tenants
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  contact_email TEXT,
  website_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabla: tenant_users
CREATE TABLE IF NOT EXISTS tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner',
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tabla: obras
CREATE TABLE IF NOT EXISTS obras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'gallery',
  title_es TEXT NOT NULL,
  title_en TEXT,
  category_es TEXT,
  category_en TEXT,
  location_es TEXT,
  location_en TEXT,
  image_url TEXT NOT NULL,
  before_image_url TEXT,
  views_count INT NOT NULL DEFAULT 0,
  likes_count INT NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  fit_mode TEXT NOT NULL DEFAULT 'cover',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Tabla: leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  client_email TEXT,
  service_type TEXT,
  location TEXT,
  budget_estimated NUMERIC(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'nuevo',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Tabla: tenant_settings
CREATE TABLE IF NOT EXISTS tenant_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
  installed_version TEXT NOT NULL DEFAULT '001',
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  language TEXT NOT NULL DEFAULT 'es',
  auto_updates BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Tabla: audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_email TEXT,
  action TEXT NOT NULL,
  entity TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices de alto rendimiento
CREATE INDEX IF NOT EXISTS idx_obras_tenant ON obras(tenant_id, type, is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_leads_tenant ON leads(tenant_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tenant_users_email ON tenant_users(email);

-- Datos Semilla (Seed) para Ecuaplac
INSERT INTO tenants (slug, name, logo_url, contact_email, website_url, status)
VALUES ('ecuaplac', 'Ecuaplac Reformas Integrales', '/ecuaplac/fav-sin-fondo.svg', 'ecuaplacbyjyg@gmail.com', 'https://ecuaplac.es', 'active')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  contact_email = EXCLUDED.contact_email,
  website_url = EXCLUDED.website_url;

-- Usuarios de Ecuaplac y Musa
INSERT INTO tenant_users (tenant_id, email, role, display_name)
SELECT id, 'ecuaplacbyjyg@gmail.com', 'owner', 'José Rivadeneira'
FROM tenants WHERE slug = 'ecuaplac';

INSERT INTO tenant_users (tenant_id, email, role, display_name)
VALUES (NULL, 'musaabdul3101@gmail.com', 'superadmin', 'Musa (MYNEXT)');

-- Settings iniciales para Ecuaplac
INSERT INTO tenant_settings (tenant_id, installed_version, notifications_enabled, language, auto_updates)
SELECT id, '001', true, 'es', true
FROM tenants WHERE slug = 'ecuaplac'
ON CONFLICT (tenant_id) DO NOTHING;
