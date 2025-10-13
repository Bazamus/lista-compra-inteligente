# 🔧 Instrucciones para Solucionar Error en /admin/users

## 🔴 Problema
La página `/admin/users` se queda cargando indefinidamente debido a políticas RLS (Row Level Security) mal configuradas en Supabase.

## ✅ Solución

### Opción 1: Ejecutar Script SQL en Supabase (Recomendado)

1. **Accede a Supabase Dashboard**
   - Ve a https://supabase.com/dashboard
   - Selecciona tu proyecto: `hnnjfqokgbhnydkfuhxy`

2. **Abre el SQL Editor**
   - En el menú lateral, click en **SQL Editor**
   - Click en **New query**

3. **Ejecuta el Script de Migración**
   - Copia el contenido completo del archivo: `database/migrations/02_fix_admin_policies.sql`
   - Pégalo en el editor SQL
   - Click en **Run** (Ejecutar)

4. **Verifica que se ejecutó correctamente**
   - Deberías ver: `Success. No rows returned`
   - Las políticas RLS antiguas fueron reemplazadas

### Opción 2: Ejecutar Manualmente

Si prefieres hacerlo manualmente, ejecuta estos comandos uno por uno:

```sql
-- 1. Eliminar políticas problemáticas
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;

-- 2. Crear política mejorada de SELECT
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- 3. Crear política mejorada de UPDATE
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- 4. Crear política mejorada de DELETE
CREATE POLICY "Admins can delete any profile"
  ON profiles FOR DELETE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- 5. Crear política de INSERT (opcional)
CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
```

### Opción 3: Desactivar RLS temporalmente (Solo para desarrollo)

⚠️ **NO RECOMENDADO PARA PRODUCCIÓN**

```sql
-- Desactivar RLS temporalmente
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

Esto permitirá acceso completo a la tabla `profiles` sin restricciones. Usar solo para debugging.

## 🧪 Verificar la Solución

1. **Refresca la página `/admin/users`** en tu navegador
2. Deberías ver la lista de usuarios cargándose correctamente
3. En la consola de DevTools, verifica estos logs:
   ```
   🔄 Cargando usuarios desde Supabase...
   📊 Respuesta de Supabase: { data: [...], error: null }
   ✅ Usuarios cargados: 2
   ```

## 🔍 Diagnóstico

Si después de aplicar el fix sigue sin funcionar:

### 1. Verifica que tu usuario sea Admin

En Supabase SQL Editor:

```sql
-- Verificar rol del usuario actual
SELECT id, email, role FROM profiles WHERE email = 'davidreya@gmail.com';
```

Debería mostrar `role: 'admin'`. Si no, actualízalo:

```sql
-- Hacer admin al usuario
UPDATE profiles SET role = 'admin' WHERE email = 'davidreya@gmail.com';
```

### 2. Verifica las políticas activas

```sql
-- Ver todas las políticas de la tabla profiles
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

Deberías ver 6 políticas:
- `Users can view own profile`
- `Users can update own profile`
- `Admins can view all profiles`
- `Admins can update any profile`
- `Admins can delete any profile`
- `Admins can insert profiles`

### 3. Verifica que la tabla existe

```sql
-- Ver estructura de la tabla
\d profiles;

-- O usar:
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles';
```

### 4. Revisa los logs de Supabase

En Supabase Dashboard:
1. Ve a **Database** > **Logs**
2. Filtra por errores recientes
3. Busca mensajes relacionados con `profiles` o RLS

## 📊 Estado Esperado

Después del fix:
- ✅ Página `/admin/users` carga correctamente
- ✅ Tabla muestra 2 usuarios registrados
- ✅ Puedes cambiar roles de usuario a admin
- ✅ Puedes eliminar usuarios (excepto tu propio usuario)

## 🐛 Troubleshooting Adicional

### Error: "permission denied for table profiles"

**Causa:** El usuario no tiene rol de admin o RLS está bloqueando el acceso

**Solución:**
```sql
-- Opción 1: Hacer admin tu usuario
UPDATE profiles SET role = 'admin' WHERE email = 'TU_EMAIL';

-- Opción 2: Desactivar RLS temporalmente (solo dev)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

### Error: "infinite loop detected"

**Causa:** Las políticas RLS tienen una recursión infinita

**Solución:** Ya debería estar solucionado con el script `02_fix_admin_policies.sql`

### La página carga pero no muestra usuarios

**Causa:** RLS funciona pero no hay registros en `profiles`

**Solución:**
```sql
-- Verificar usuarios en la tabla
SELECT * FROM profiles;

-- Si está vacía, crear perfiles manualmente
INSERT INTO profiles (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'TU_EMAIL';
```

## 🎯 Resumen

1. ✅ Ejecutar `02_fix_admin_policies.sql` en Supabase SQL Editor
2. ✅ Verificar que tu usuario tenga role='admin'
3. ✅ Refrescar `/admin/users`
4. ✅ Verificar en consola que se carguen los usuarios

Si sigues teniendo problemas, comparte los logs de la consola del navegador.
