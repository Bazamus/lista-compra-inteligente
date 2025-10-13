-- =====================================================
-- FIX FINAL: Solución completa al problema de roles
-- =====================================================

-- 1. RECREAR FUNCIÓN PARA NO SOBRESCRIBIR PERFILES
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user')
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. ELIMINAR TODAS LAS POLÍTICAS ANTIGUAS
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Admins can delete any profile" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;

-- 3. CREAR POLÍTICAS CORRECTAS

-- Policy: Usuarios pueden ver su propio perfil (SIEMPRE)
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy: Usuarios pueden actualizar su propio perfil (SIEMPRE)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Policy: Admins pueden ver TODOS los perfiles (incluyendo el suyo)
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Policy: Admins pueden actualizar CUALQUIER perfil
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Policy: Admins pueden eliminar perfiles (excepto el propio)
CREATE POLICY "Admins can delete any profile"
  ON profiles FOR DELETE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    AND id != auth.uid()  -- No puede eliminarse a sí mismo
  );

-- Policy: Admins pueden insertar perfiles
CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- 4. VERIFICAR Y ACTUALIZAR EL ROL DE TU USUARIO
UPDATE profiles
SET role = 'admin'
WHERE email = 'davidreya@gmail.com';

-- 5. HABILITAR RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Ver todas las políticas:
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Ver tu perfil:
SELECT id, email, role, created_at FROM profiles WHERE email = 'davidreya@gmail.com';
