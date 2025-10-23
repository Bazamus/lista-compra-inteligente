-- ================================================================
-- MIGRACIÓN 05: Sistema de Compartir Listas
-- ================================================================
-- Descripción: Crea tabla list_shares para gestionar enlaces públicos
--              de listas compartidas con tokens seguros y expiración
-- Fecha: 2025-10-23
-- ================================================================

-- Tabla para gestionar enlaces compartidos
CREATE TABLE IF NOT EXISTS list_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lista_id UUID NOT NULL REFERENCES listas_compra(id_lista) ON DELETE CASCADE,
  share_token VARCHAR(64) UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  visit_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ================================================================
-- ÍNDICES para optimizar búsquedas
-- ================================================================

-- Índice para búsqueda rápida por token (caso más común)
CREATE INDEX idx_list_shares_token ON list_shares(share_token);

-- Índice para obtener shares de una lista específica
CREATE INDEX idx_list_shares_lista ON list_shares(lista_id);

-- Índice compuesto para filtrar shares activos y no expirados
CREATE INDEX idx_list_shares_active ON list_shares(is_active, expires_at)
  WHERE is_active = true;

-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================

-- Habilitar RLS en la tabla
ALTER TABLE list_shares ENABLE ROW LEVEL SECURITY;

-- Política: Usuarios autenticados pueden crear shares de sus propias listas
CREATE POLICY "Users can create shares of own lists"
  ON list_shares FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM listas_compra 
      WHERE id_lista = list_shares.lista_id 
      AND user_id = auth.uid()
    )
  );

-- Política: Cualquiera (incluso anónimos) puede ver shares activos y no expirados
-- Esto es necesario para la vista pública
CREATE POLICY "Anyone can view active shares"
  ON list_shares FOR SELECT
  USING (
    is_active = true AND
    (expires_at IS NULL OR expires_at > NOW())
  );

-- Política: Creador puede actualizar sus propios shares (desactivar, extender expiración)
CREATE POLICY "Creators can update own shares"
  ON list_shares FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Política: Creador puede eliminar sus propios shares
CREATE POLICY "Creators can delete own shares"
  ON list_shares FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- ================================================================
-- FUNCIONES AUXILIARES
-- ================================================================

-- Función para incrementar contador de visitas
-- SECURITY DEFINER permite ejecutarla sin permisos RLS
CREATE OR REPLACE FUNCTION increment_share_visits(token_param VARCHAR)
RETURNS void AS $$
BEGIN
  UPDATE list_shares
  SET visit_count = visit_count + 1,
      updated_at = NOW()
  WHERE share_token = token_param
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para limpiar shares expirados (ejecutar periódicamente)
CREATE OR REPLACE FUNCTION cleanup_expired_shares()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM list_shares
  WHERE expires_at IS NOT NULL 
    AND expires_at < NOW() - INTERVAL '30 days'; -- Mantener 30 días después de expirar
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- VERIFICACIÓN
-- ================================================================

-- Verificar que la tabla se creó correctamente
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'list_shares') THEN
    RAISE NOTICE '✅ Tabla list_shares creada correctamente';
  ELSE
    RAISE EXCEPTION '❌ Error: Tabla list_shares no se creó';
  END IF;
END $$;

-- Verificar índices
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_list_shares_token') THEN
    RAISE NOTICE '✅ Índices creados correctamente';
  ELSE
    RAISE WARNING '⚠️ Algunos índices pueden no haberse creado';
  END IF;
END $$;

-- ================================================================
-- CONSULTAS ÚTILES PARA ADMINISTRACIÓN
-- ================================================================

-- Ver todos los shares activos:
-- SELECT ls.*, lc.nombre_lista 
-- FROM list_shares ls
-- JOIN listas_compra lc ON ls.lista_id = lc.id_lista
-- WHERE ls.is_active = true
-- ORDER BY ls.created_at DESC;

-- Ver shares más visitados:
-- SELECT ls.share_token, lc.nombre_lista, ls.visit_count, ls.created_at
-- FROM list_shares ls
-- JOIN listas_compra lc ON ls.lista_id = lc.id_lista
-- ORDER BY ls.visit_count DESC
-- LIMIT 10;

-- Ejecutar limpieza de shares expirados:
-- SELECT cleanup_expired_shares();

