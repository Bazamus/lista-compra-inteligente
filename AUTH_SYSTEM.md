# Sistema de Autenticación - Documentación Completa

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Arquitectura](#arquitectura)
3. [Modo Demo vs Usuario Autenticado](#modo-demo-vs-usuario-autenticado)
4. [Guías de Usuario](#guías-de-usuario)
5. [Guías de Administrador](#guías-de-administrador)
6. [Troubleshooting](#troubleshooting)
7. [Configuración Técnica](#configuración-técnica)

---

## Introducción

El sistema de autenticación permite a los usuarios registrarse, iniciar sesión y acceder a features premium como:

- **Listas ilimitadas** guardadas en la nube
- **Acceso multi-dispositivo** a tus listas
- **Exportación** a PDF y Excel
- **Historial completo** de compras

### Características Principales

✅ **Multi-usuario** - Cada usuario tiene su propio espacio  
✅ **Modo Demo** - Prueba sin registro (máximo 3 listas temporales)  
✅ **Dashboard Admin** - Panel de gestión para administradores  
✅ **Features Premium** - Funcionalidades exclusivas para usuarios registrados  
✅ **Seguridad RLS** - Row Level Security en Supabase

---

## Arquitectura

### Componentes del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    APLICACIÓN WEB                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐      ┌──────────────────┐           │
│  │  Usuario Demo    │      │  Usuario Auth    │           │
│  │  (localStorage)  │      │   (Supabase BD)  │           │
│  └────────┬─────────┘      └────────┬─────────┘           │
│           │                         │                      │
│           ├─────────────┬───────────┤                      │
│                         │                                  │
│              ┌──────────▼──────────┐                       │
│              │   AuthContext       │                       │
│              │   useAuth()         │                       │
│              └──────────┬──────────┘                       │
│                         │                                  │
│       ┌─────────────────┼─────────────────┐               │
│       │                 │                 │               │
│  ┌────▼────┐    ┌───────▼──────┐   ┌─────▼──────┐       │
│  │HomePage │    │ResultsPage   │   │HistoryPage │       │
│  │         │    │              │   │            │       │
│  │DemoBanner    │PremiumGate   │   │DemoBanner  │       │
│  └─────────┘    └──────────────┘   └────────────┘       │
│                                                           │
└───────────────────────────────────────────────────────────┘
                         │
            ┌────────────▼────────────┐
            │   Supabase Backend     │
            │                        │
            │  • auth.users          │
            │  • profiles (roles)    │
            │  • listas_compra       │
            │  • items_lista         │
            │  • admin_logs          │
            └────────────────────────┘
```

### Flujo de Datos

**1. Usuario No Autenticado (Demo):**
```
Usuario → HomePage → DemoBanner
                  ↓
              Genera Lista
                  ↓
            localStorage (máx 3)
```

**2. Usuario Autenticado:**
```
Usuario → Login → AuthContext
                      ↓
                  user + profile
                      ↓
                 Genera Lista
                      ↓
              Supabase BD (ilimitado)
```

**3. Administrador:**
```
Admin → Login → AuthContext (role: admin)
                      ↓
                /admin/dashboard
                      ↓
           Gestión Usuarios + Stats
```

---

## Modo Demo vs Usuario Autenticado

### Comparación de Características

| Feature | Modo Demo | Usuario Autenticado |
|---------|-----------|---------------------|
| Generar listas con IA | ✅ | ✅ |
| Formulario 8 pasos | ✅ | ✅ |
| Ver resultados | ✅ | ✅ |
| Guardar listas | ⚠️ Hasta 3 en localStorage | ✅ Ilimitado en BD |
| Acceso multi-dispositivo | ❌ | ✅ |
| Exportar PDF/Excel | ❌ Bloqueado | ✅ |
| Historial completo | ⚠️ Solo 3 listas | ✅ Todas |
| Compartir listas | ❌ | ✅ (futuro) |
| Analytics personal | ❌ | ✅ (futuro) |

### Modo Demo

**¿Qué es?**  
Permite probar la aplicación sin necesidad de registro.

**Limitaciones:**
- Máximo 3 listas guardadas (localStorage)
- No persistente (se pierde al limpiar caché)
- No acceso desde otros dispositivos
- Exportación bloqueada

**Banner Informativo:**  
Los usuarios en modo Demo verán un banner amarillo/naranja en la parte superior de las páginas principales:

```
🎯 Modo Demo Activo
Tus listas se guardan temporalmente. Regístrate para acceso permanente.
[Iniciar Sesión] [Registrarse Gratis]
```

**Migración a Cuenta:**  
Al registrarse, el sistema ofrece migrar las listas del modo Demo a la cuenta permanente.

---

## Guías de Usuario

### Cómo Registrarse

1. Haz clic en **"Registrarse"** en el header o banner
2. Completa el formulario:
   - Email válido
   - Contraseña (mínimo 6 caracteres)
   - Confirmar contraseña
3. Haz clic en **"Registrarse"**
4. Serás redirigido automáticamente al login

### Cómo Iniciar Sesión

1. Haz clic en **"Iniciar Sesión"** en el header
2. Ingresa tu email y contraseña
3. Haz clic en **"Iniciar Sesión"**
4. Serás redirigido a la aplicación con tu sesión activa

### Cómo Cerrar Sesión

1. Haz clic en tu **avatar** en la esquina superior derecha
2. Selecciona **"Cerrar Sesión"** en el menú desplegable
3. Serás redirigido a la página de inicio en modo Demo

### Gestionar Listas

**Usuario Demo:**
- Genera listas normalmente con el formulario IA
- Se guardan automáticamente en localStorage
- Límite: 3 listas
- Ver en: Historial (header → "Historial")

**Usuario Autenticado:**
- Genera listas normalmente
- Se guardan automáticamente en Supabase
- Sin límite de listas
- Sincronización automática entre dispositivos
- Ver en: Historial (header → "Historial")

### Features Premium

**Exportación:**
- PDF: Lista completa con formato profesional
- Excel: Hoja de cálculo editable
- Solo disponible para usuarios autenticados

Si no estás autenticado, verás un overlay con:
```
🔒 Feature Premium
Exportación PDF/Excel está disponible solo para usuarios registrados

Al registrarte obtendrás:
✓ Listas ilimitadas guardadas en la nube
✓ Acceso desde cualquier dispositivo
✓ Exportación a PDF y Excel
✓ Historial completo de compras
✓ Compartir listas con otros usuarios

[Registrarse Gratis] [Ya tengo cuenta]
```

---

## Guías de Administrador

### Acceso al Dashboard Admin

1. Inicia sesión con una cuenta de administrador
2. Haz clic en tu avatar (esquina superior derecha)
3. Selecciona **"Panel Admin"** del menú
4. Serás redirigido a `/admin/dashboard`

### Página Principal del Dashboard

**Estadísticas Visibles:**
- Total de usuarios registrados
- Total de listas creadas
- Listas creadas en los últimos 7 días
- Total de productos en catálogo (4,429)

**Acciones Rápidas:**
- Gestionar Usuarios
- Explorar Base de Datos

### Gestión de Usuarios

**Ubicación:** `/admin/users`

**Funciones:**
1. **Ver todos los usuarios**
   - Email
   - Rol (Admin/Usuario)
   - Fecha de registro

2. **Cambiar rol de usuario**
   - Dropdown en cada fila
   - Cambio inmediato (Admin ↔ Usuario)

3. **Eliminar usuarios**
   - Botón "Eliminar" en cada fila
   - Confirmación requerida
   - Elimina usuario y todas sus listas (CASCADE)

4. **Botón Actualizar**
   - Refresca la lista de usuarios

### Explorador de Base de Datos

**Ubicación:** `/admin/database`

**Funciones:**
- Ver estructura de tablas
- Información de columnas
- Total de registros por tabla
- Enlaces rápidos a Supabase Dashboard

**Tablas Disponibles:**
- Perfiles de Usuario (profiles)
- Listas de Compra (listas_compra)
- Items de Listas (items_lista)
- Productos (productos)
- Categorías (categorias)
- Subcategorías (subcategorias)

### Analytics

**Ubicación:** `/admin/analytics`

**Métricas:**
- Listas creadas hoy
- Listas últimos 7 días
- Listas últimos 30 días
- Presupuesto promedio
- Resumen de usuarios
- Resumen de listas

---

## Troubleshooting

### Error: "Email not confirmed"

**Problema:** Al intentar iniciar sesión, aparece mensaje de email no confirmado.

**Solución para Desarrollo:**
```sql
-- Ejecutar en Supabase Dashboard > SQL Editor
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'tu_email@ejemplo.com';
```

**Solución para Producción:**
- Habilitar confirmación de email en Supabase Dashboard
- Settings > Authentication > Email Confirmation

### Error: "Invalid login credentials"

**Problema:** Credenciales incorrectas al iniciar sesión.

**Soluciones:**
1. Verificar email y contraseña (mínimo 6 caracteres)
2. Confirmar que el usuario está registrado
3. Intentar restablecer contraseña (futuro)

### Error: 500 al cargar perfil

**Problema:** Error 500 al cargar datos del perfil después de login.

**Causa:** Problemas con políticas RLS en tabla `profiles`.

**Solución Temporal:**
```sql
-- Deshabilitar RLS en profiles (solo para desarrollo)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

**Solución Permanente:**
- Revisar políticas RLS en `01_create_profiles.sql`
- Ejecutar políticas corregidas

### Listas no se guardan

**Problema:** Las listas no aparecen en el historial.

**Verificaciones:**
1. **Usuario Demo:** Revisar localStorage del navegador
   - F12 > Application > Local Storage
   - Buscar clave `shoppingListHistory`

2. **Usuario Autenticado:** Verificar en Supabase
   - Dashboard > Table Editor > listas_compra
   - Filtrar por `user_id`

3. **Código:** Verificar que `handleSaveList()` funcione
   - Revisar consola del navegador (F12)
   - Buscar errores de JavaScript

### Límite de 3 listas en Demo

**Problema:** No puedo guardar más de 3 listas en modo Demo.

**Solución:**
- Esto es intencional para incentivar el registro
- Opciones:
  1. Registrarse para listas ilimitadas
  2. Eliminar listas antiguas del historial
  3. Exportar listas antes de eliminarlas (si fuera usuario autenticado)

### No aparece opción "Panel Admin"

**Problema:** Usuario no ve opción de Panel Admin en el menú.

**Causas posibles:**
1. El usuario no tiene rol de administrador
2. Sesión no está actualizada

**Solución:**
```sql
-- Verificar rol del usuario
SELECT id, email, role FROM profiles WHERE email = 'tu_email@ejemplo.com';

-- Si role = 'user', actualizar a admin
UPDATE profiles SET role = 'admin' WHERE email = 'tu_email@ejemplo.com';
```

**Luego:**
1. Cerrar sesión
2. Limpiar caché del navegador
3. Volver a iniciar sesión

---

## Configuración Técnica

### Variables de Entorno

**Archivo `.env` en la raíz del proyecto:**
```env
VITE_SUPABASE_URL=https://hnnjfqokgbhnydkfuhxy.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_aqui
VITE_OPENAI_API_KEY=tu_clave_aqui
```

### Scripts SQL Necesarios

Ejecutar en orden en Supabase Dashboard > SQL Editor:

1. **01_create_profiles.sql** - Crea tabla profiles y triggers
2. **02_add_user_id_to_lists.sql** - Vincula listas con usuarios + RLS
3. **03_create_admin_logs.sql** - Tabla de auditoría para admins
4. **04_create_indexes.sql** - Índices para optimización

### Crear Primer Usuario Admin

**Método 1: Registro Normal + SQL**
```sql
-- 1. Registrarse en la app normalmente
-- 2. Ejecutar SQL:
UPDATE profiles
SET role = 'admin'
WHERE email = 'tu_email@ejemplo.com';
```

**Método 2: Inserción Directa** (No recomendado)
```sql
-- Requiere crear usuario en auth.users primero
INSERT INTO profiles (id, email, role)
VALUES ('uuid_del_usuario', 'admin@ejemplo.com', 'admin');
```

### Seguridad RLS

**Estado Actual:**
- `profiles`: RLS deshabilitado (para desarrollo)
- `listas_compra`: RLS habilitado
- `items_lista`: RLS habilitado
- `admin_logs`: RLS habilitado

**Políticas Activas:**
- Usuarios solo ven sus propias listas
- Admins ven todas las listas
- Solo admins pueden modificar roles

### Componentes Clave

**Frontend:**
- `src/features/auth/context/AuthContext.tsx` - Context de autenticación
- `src/features/auth/hooks/useAuth.ts` - Hook principal
- `src/hooks/useListHistory.ts` - Sistema híbrido BD/localStorage
- `src/features/auth/components/DemoBanner.tsx` - Banner modo Demo
- `src/features/auth/components/PremiumGate.tsx` - Gate para features

**Backend:**
- `src/lib/supabase.ts` - Cliente Supabase configurado
- `database/migrations/` - Scripts SQL del sistema

### Testing

**Manual Checklist:**
- [ ] Registro de nuevo usuario funciona
- [ ] Login con credenciales correctas
- [ ] Logout funciona
- [ ] Sesión persiste al recargar
- [ ] Usuario Demo ve DemoBanner
- [ ] Usuario Demo limitado a 3 listas
- [ ] Usuario autenticado guarda en BD
- [ ] Admin ve opción Panel Admin
- [ ] Admin puede gestionar usuarios
- [ ] Dashboard muestra estadísticas correctas

---

## Soporte

Para problemas técnicos o preguntas:
- Revisar logs del navegador (F12 > Console)
- Verificar logs de Supabase Dashboard
- Revisar documentación en `CLAUDE.md`
- Consultar el plan de implementación completo

**Última actualización:** Octubre 2025  
**Versión:** 1.0.0

