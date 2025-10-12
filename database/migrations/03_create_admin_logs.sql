-- Tabla de auditoría para acciones de administradores
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id TEXT,
  changes JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índice para mejorar consultas por admin
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);

-- Habilitar RLS
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Solo admins pueden ver logs
CREATE POLICY "Admins can view logs"
  ON admin_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Solo admins pueden insertar logs
CREATE POLICY "Admins can insert logs"
  ON admin_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
