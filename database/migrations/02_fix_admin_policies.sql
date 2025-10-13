-- =====================================================
-- FIX: Políticas RLS para Admin
-- Solución al problema de carga infinita en /admin/users
-- =====================================================

-- Eliminar políticas existentes problemáticas
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;

-- POLÍTICA MEJORADA: Admins pueden ver todos los perfiles
-- Usa una subconsulta más eficiente para evitar recursión
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- POLÍTICA MEJORADA: Admins pueden actualizar cualquier perfil
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- POLÍTICA MEJORADA: Admins pueden eliminar perfiles
CREATE POLICY "Admins can delete any profile"
  ON profiles FOR DELETE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- POLÍTICA: Admins pueden insertar perfiles (para crear usuarios manualmente)
CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Verificar que RLS esté habilitado
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- VERIFICACIÓN: Consulta para comprobar políticas
-- =====================================================
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';
