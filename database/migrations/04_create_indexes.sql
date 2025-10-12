-- Script de optimización: Crear índices para mejorar performance
-- Fecha: 2025-10-12
-- Descripción: Índices para búsquedas y ordenación de listas por user_id

-- ============================================================================
-- ÍNDICES PARA TABLA listas_compra
-- ============================================================================

-- Índice para búsqueda por user_id
-- Mejora queries: SELECT * FROM listas_compra WHERE user_id = ?
CREATE INDEX IF NOT EXISTS idx_listas_user_id 
  ON listas_compra(user_id);

-- Índice para ordenación por fecha (descendente)
-- Mejora queries: ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_listas_created_at 
  ON listas_compra(created_at DESC);

-- Índice compuesto user_id + fecha
-- Mejora queries que filtran por usuario Y ordenan por fecha
-- SELECT * FROM listas_compra WHERE user_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_listas_user_created 
  ON listas_compra(user_id, created_at DESC);

-- Índice para búsqueda por estado completado
-- Mejora queries: WHERE completada = true/false
CREATE INDEX IF NOT EXISTS idx_listas_completada 
  ON listas_compra(completada);

-- Índice compuesto user_id + completada
-- Mejora queries: WHERE user_id = ? AND completada = ?
CREATE INDEX IF NOT EXISTS idx_listas_user_completada 
  ON listas_compra(user_id, completada);

-- ============================================================================
-- ÍNDICES PARA TABLA items_lista
-- ============================================================================

-- Índice para búsqueda por lista
-- Mejora queries: SELECT * FROM items_lista WHERE id_lista = ?
-- (Ya existe implícitamente por FK, pero lo explicitamos para claridad)
CREATE INDEX IF NOT EXISTS idx_items_lista_id 
  ON items_lista(id_lista);

-- Índice para búsqueda por producto
-- Mejora queries de análisis: productos más comprados
CREATE INDEX IF NOT EXISTS idx_items_producto_id 
  ON items_lista(id_producto);

-- Índice para items comprados/pendientes
-- Mejora queries: WHERE comprado = true/false
CREATE INDEX IF NOT EXISTS idx_items_comprado 
  ON items_lista(comprado);

-- Índice compuesto lista + comprado
-- Mejora queries: progreso de compra por lista
CREATE INDEX IF NOT EXISTS idx_items_lista_comprado 
  ON items_lista(id_lista, comprado);

-- ============================================================================
-- ÍNDICES PARA TABLA profiles
-- ============================================================================

-- Índice para búsqueda por email
-- Mejora queries: WHERE email = ?
CREATE INDEX IF NOT EXISTS idx_profiles_email 
  ON profiles(email);

-- Índice para búsqueda por rol
-- Mejora queries de admin: WHERE role = 'admin'
CREATE INDEX IF NOT EXISTS idx_profiles_role 
  ON profiles(role);

-- ============================================================================
-- ÍNDICES PARA TABLA admin_logs
-- ============================================================================

-- Índice para búsqueda por admin_id
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin 
  ON admin_logs(admin_id);

-- Índice para ordenación por fecha (ya existe, verificar)
-- CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at 
--   ON admin_logs(created_at DESC);

-- Índice compuesto admin + fecha
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_created 
  ON admin_logs(admin_id, created_at DESC);

-- ============================================================================
-- VERIFICACIÓN DE ÍNDICES CREADOS
-- ============================================================================

-- Query para verificar índices en listas_compra
SELECT 
  tablename, 
  indexname, 
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'listas_compra'
ORDER BY indexname;

-- Query para verificar índices en items_lista
SELECT 
  tablename, 
  indexname, 
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'items_lista'
ORDER BY indexname;

-- Query para verificar índices en profiles
SELECT 
  tablename, 
  indexname, 
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'profiles'
ORDER BY indexname;

-- ============================================================================
-- ESTADÍSTICAS DE USO (OPCIONAL - Solo para monitoreo)
-- ============================================================================

-- Ver tamaño de índices
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename IN ('listas_compra', 'items_lista', 'profiles', 'admin_logs')
ORDER BY pg_relation_size(indexrelid) DESC;

-- Ver uso de índices (requiere actividad en la BD)
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan AS number_of_scans,
  idx_tup_read AS tuples_read,
  idx_tup_fetch AS tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename IN ('listas_compra', 'items_lista', 'profiles', 'admin_logs')
ORDER BY idx_scan DESC;

