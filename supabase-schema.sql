-- RutaPet - Schema de base de datos
-- Ejecutar en Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Negocios (forrajerías)
CREATE TABLE IF NOT EXISTS negocios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  telefono TEXT,
  whatsapp TEXT,
  email TEXT,
  direccion TEXT,
  logo_url TEXT,
  metodos_pago TEXT[] DEFAULT ARRAY['efectivo'],
  dias_anticipacion INTEGER DEFAULT 1,
  plan TEXT DEFAULT 'trial',
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '45 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clientes de la forrajería
CREATE TABLE IF NOT EXISTS clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  negocio_id UUID REFERENCES negocios(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT,
  direccion TEXT,
  localidad TEXT,
  codigo_postal TEXT,
  partido TEXT,
  observacion_domicilio TEXT,
  observacion_cliente TEXT,
  ciclo_dias INTEGER DEFAULT 30,
  ultimo_pedido_fecha DATE,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mascotas (cada cliente puede tener varias)
CREATE TABLE IF NOT EXISTS mascotas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  marca_alimento TEXT NOT NULL,
  kilos DECIMAL(5,1) DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  negocio_id UUID REFERENCES negocios(id) ON DELETE CASCADE NOT NULL,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE NOT NULL,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  fecha_entrega DATE NOT NULL,
  kilos_override JSONB, -- { mascota_id: kilos } si el cliente modificó
  metodo_pago TEXT,
  notas TEXT,
  estado TEXT DEFAULT 'pendiente', -- pendiente, confirmado, entregado, cancelado
  whatsapp_enviado BOOLEAN DEFAULT false,
  whatsapp_enviado_at TIMESTAMPTZ,
  confirmado_at TIMESTAMPTZ,
  modificado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE negocios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mascotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "negocios_own" ON negocios FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "clientes_own" ON clientes FOR ALL USING (negocio_id IN (SELECT id FROM negocios WHERE user_id = auth.uid()));
CREATE POLICY "mascotas_own" ON mascotas FOR ALL USING (cliente_id IN (SELECT c.id FROM clientes c JOIN negocios n ON c.negocio_id = n.id WHERE n.user_id = auth.uid()));
CREATE POLICY "pedidos_own" ON pedidos FOR ALL USING (negocio_id IN (SELECT id FROM negocios WHERE user_id = auth.uid()));
-- Las rutas públicas (pedido/[token]) usan el admin client en el servidor
-- No se necesitan políticas públicas permisivas

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER update_negocios_updated_at BEFORE UPDATE ON negocios FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON pedidos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
