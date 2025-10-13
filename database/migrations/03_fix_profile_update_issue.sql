-- =====================================================
-- FIX: Problema de cambio de rol al navegar
-- El trigger handle_new_user() NO debe sobrescribir perfiles existentes
-- =====================================================

-- Recrear la función para que NO sobrescriba perfiles existentes
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo insertar si el perfil NO existe ya
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user')
  ON CONFLICT (id) DO NOTHING;  -- ← CLAVE: No sobrescribir si ya existe

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar que el trigger esté activo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- VERIFICACIÓN: Consultar perfiles existentes
-- =====================================================
-- SELECT id, email, role, created_at FROM profiles ORDER BY created_at DESC;
