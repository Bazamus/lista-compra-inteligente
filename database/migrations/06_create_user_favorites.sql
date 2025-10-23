-- ================================================================
-- Migration: 06 - User Favorites
-- Description: Tabla para gestionar productos favoritos por usuario
-- Date: 2025-10-23
-- Sprint: 3 - Quick Wins
-- ================================================================

-- Crear tabla de favoritos
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraint: Un usuario no puede tener el mismo producto favorito dos veces
  UNIQUE(user_id, product_id)
);

-- Índices para optimizar búsquedas
CREATE INDEX idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_product ON user_favorites(product_id);
CREATE INDEX idx_user_favorites_created ON user_favorites(created_at);

-- ================================================================
-- Row Level Security (RLS)
-- ================================================================

ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propios favoritos
CREATE POLICY "Users can view own favorites"
  ON user_favorites FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Política: Los usuarios solo pueden añadir sus propios favoritos
CREATE POLICY "Users can insert own favorites"
  ON user_favorites FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Política: Los usuarios solo pueden eliminar sus propios favoritos
CREATE POLICY "Users can delete own favorites"
  ON user_favorites FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ================================================================
-- Funciones útiles
-- ================================================================

-- Función para obtener productos favoritos de un usuario
CREATE OR REPLACE FUNCTION get_user_favorite_products(user_id_param UUID)
RETURNS TABLE (
  product_id INTEGER,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uf.product_id,
    uf.created_at
  FROM user_favorites uf
  WHERE uf.user_id = user_id_param
  ORDER BY uf.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si un producto es favorito
CREATE OR REPLACE FUNCTION is_product_favorite(user_id_param UUID, product_id_param INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_favorites 
    WHERE user_id = user_id_param 
    AND product_id = product_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para contar favoritos de un usuario
CREATE OR REPLACE FUNCTION count_user_favorites(user_id_param UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM user_favorites
    WHERE user_id = user_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- Comentarios
-- ================================================================

COMMENT ON TABLE user_favorites IS 'Almacena los productos favoritos de cada usuario';
COMMENT ON COLUMN user_favorites.user_id IS 'ID del usuario propietario';
COMMENT ON COLUMN user_favorites.product_id IS 'ID del producto favorito (referencia a catálogo)';
COMMENT ON COLUMN user_favorites.created_at IS 'Fecha cuando se marcó como favorito';

-- ================================================================
-- Testing
-- ================================================================

-- Test 1: Insertar favorito
-- INSERT INTO user_favorites (user_id, product_id) 
-- VALUES ('your-user-id', 123);

-- Test 2: Ver favoritos
-- SELECT * FROM get_user_favorite_products('your-user-id');

-- Test 3: Verificar favorito
-- SELECT is_product_favorite('your-user-id', 123);

-- Test 4: Contar favoritos
-- SELECT count_user_favorites('your-user-id');

-- ================================================================
-- Rollback (si es necesario)
-- ================================================================

-- DROP FUNCTION IF EXISTS count_user_favorites(UUID);
-- DROP FUNCTION IF EXISTS is_product_favorite(UUID, INTEGER);
-- DROP FUNCTION IF EXISTS get_user_favorite_products(UUID);
-- DROP TABLE IF EXISTS user_favorites CASCADE;

