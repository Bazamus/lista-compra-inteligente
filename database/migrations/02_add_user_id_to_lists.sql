-- Agregar columna user_id a listas_compra
ALTER TABLE listas_compra 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Agregar índice para mejorar performance
CREATE INDEX IF NOT EXISTS idx_listas_compra_user_id ON listas_compra(user_id);

-- Habilitar RLS en listas_compra
ALTER TABLE listas_compra ENABLE ROW LEVEL SECURITY;

-- Policy: Usuarios ven solo sus listas
CREATE POLICY "Users can view own lists"
  ON listas_compra FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Usuarios crean sus listas
CREATE POLICY "Users can create own lists"
  ON listas_compra FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Usuarios actualizan solo sus listas
CREATE POLICY "Users can update own lists"
  ON listas_compra FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Usuarios eliminan solo sus listas
CREATE POLICY "Users can delete own lists"
  ON listas_compra FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Admins ven todas las listas
CREATE POLICY "Admins can view all lists"
  ON listas_compra FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins pueden hacer todo con las listas
CREATE POLICY "Admins can manage all lists"
  ON listas_compra FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Habilitar RLS en items_lista
ALTER TABLE items_lista ENABLE ROW LEVEL SECURITY;

-- Policy: Usuarios ven items de sus listas
CREATE POLICY "Users can view own list items"
  ON items_lista FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM listas_compra
      WHERE listas_compra.id_lista = items_lista.id_lista
      AND listas_compra.user_id = auth.uid()
    )
  );

-- Policy: Usuarios crean items en sus listas
CREATE POLICY "Users can create own list items"
  ON items_lista FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listas_compra
      WHERE listas_compra.id_lista = items_lista.id_lista
      AND listas_compra.user_id = auth.uid()
    )
  );

-- Policy: Usuarios actualizan items de sus listas
CREATE POLICY "Users can update own list items"
  ON items_lista FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM listas_compra
      WHERE listas_compra.id_lista = items_lista.id_lista
      AND listas_compra.user_id = auth.uid()
    )
  );

-- Policy: Usuarios eliminan items de sus listas
CREATE POLICY "Users can delete own list items"
  ON items_lista FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM listas_compra
      WHERE listas_compra.id_lista = items_lista.id_lista
      AND listas_compra.user_id = auth.uid()
    )
  );

-- Policy: Admins pueden gestionar todos los items
CREATE POLICY "Admins can manage all list items"
  ON items_lista FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
