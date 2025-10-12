# Database Migrations - Sistema de Autenticación y Dashboard

Scripts SQL para configurar el sistema de autenticación, roles y Row Level Security (RLS).

## 📋 Orden de Ejecución

Ejecutar los scripts en **Supabase Dashboard > SQL Editor** en el siguiente orden:

### 1. Crear tabla profiles y triggers (01_create_profiles.sql)
**Descripción**:
- Crea la tabla `profiles` con campos: id, email, role, full_name, avatar_url
- Configura triggers automáticos para crear perfil al registrar usuario
- Implementa políticas RLS para perfiles

**Ejecutar**: Copiar y pegar todo el contenido del archivo `01_create_profiles.sql`

---

### 2. Agregar user_id a listas y RLS (02_add_user_id_to_lists.sql)
**Descripción**:
- Agrega columna `user_id` a tabla `listas_compra`
- Habilita RLS en `listas_compra` e `items_lista`
- Configura políticas para que usuarios solo vean sus propias listas
- Admins pueden ver y gestionar todas las listas

**Ejecutar**: Copiar y pegar todo el contenido del archivo `02_add_user_id_to_lists.sql`

---

### 3. Crear tabla de logs de administración (03_create_admin_logs.sql)
**Descripción**:
- Crea tabla `admin_logs` para auditoría
- Solo admins pueden insertar y ver logs
- Registra acciones administrativas

**Ejecutar**: Copiar y pegar todo el contenido del archivo `03_create_admin_logs.sql`

---

## 🔐 Crear Primer Usuario Admin

Después de ejecutar los 3 scripts anteriores:

1. Registra un usuario en la aplicación (o usa uno existente)
2. En Supabase SQL Editor, ejecuta:

```sql
-- Reemplazar con tu email real
UPDATE profiles
SET role = 'admin'
WHERE email = 'tu_email@ejemplo.com';
```

3. Verifica que se actualizó correctamente:

```sql
SELECT id, email, role FROM profiles WHERE role = 'admin';
```

---

## ✅ Verificación de la Configuración

### Verificar tablas creadas:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'admin_logs');
```

### Verificar RLS habilitado:
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'listas_compra', 'items_lista', 'admin_logs');
```

### Verificar políticas RLS:
```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';
```

### Verificar triggers:
```sql
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

---

## 🔧 Troubleshooting

### Error: "duplicate key value violates unique constraint"
**Solución**: La tabla `profiles` ya existe. Ejecutar:
```sql
DROP TABLE IF EXISTS profiles CASCADE;
```
Y volver a ejecutar el script 01.

### Error: "column user_id already exists"
**Solución**: La columna ya fue agregada previamente. Puedes omitir este script o ejecutar:
```sql
-- Ver si la columna existe
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'listas_compra' AND column_name = 'user_id';
```

### Error: "policy already exists"
**Solución**: Eliminar políticas existentes antes de recrearlas:
```sql
DROP POLICY IF EXISTS "policy_name" ON table_name;
```

---

## 📊 Estructura Final de BD

Después de ejecutar todos los scripts:

### Tabla: profiles
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | PK, referencia a auth.users |
| email | TEXT | Email del usuario |
| role | TEXT | 'admin' o 'user' |
| full_name | TEXT | Nombre completo (opcional) |
| avatar_url | TEXT | URL avatar (opcional) |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

### Tabla: listas_compra (modificada)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| ... | ... | Campos existentes |
| user_id | UUID | NUEVO - FK a auth.users |

### Tabla: admin_logs (nueva)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | PK |
| admin_id | UUID | FK a auth.users |
| action | TEXT | Tipo de acción (UPDATE, DELETE, etc.) |
| table_name | TEXT | Tabla afectada |
| record_id | TEXT | ID del registro modificado |
| changes | JSONB | Cambios realizados |
| created_at | TIMESTAMP | Fecha de la acción |

---

## 🚀 Siguiente Paso

Una vez ejecutados todos los scripts y verificado que funcionan correctamente, continuar con la implementación del frontend (Sistema de Autenticación).
