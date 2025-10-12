# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Idioma

**Comunicarse siempre en Español de España** al interactuar con el usuario.

---

## Descripción del Proyecto

Aplicación web inteligente para planificación optimizada de listas de compra con IA, utilizando productos de Mercadona (4,429 productos en base de datos).

**Características principales:**
- Generación automática de listas y menús con OpenAI GPT-4o-mini
- Formulario conversacional de 8 pasos para capturar preferencias
- Base de datos SupaBase con catálogo completo de Mercadona
- Optimización de presupuesto y recomendaciones personalizadas
- **Sistema multi-usuario con autenticación** (Supabase Auth)
- **Modo Demo** para usuarios no registrados (localStorage temporal)
- **Dashboard de administración** con roles (Admin/User)
- **Features Premium** para usuarios autenticados
- **Estado:** ✅ DESPLEGADA Y FUNCIONANDO EN PRODUCCIÓN

## 🚀 Deployment en Producción

**URL de la aplicación:** https://lista-compra-inteligente-ivory.vercel.app

**Repositorio GitHub:** https://github.com/Bazamus/lista-compra-inteligente.git

**Plataforma:** Vercel con funciones serverless

**Estado:** ✅ FUNCIONANDO CORRECTAMENTE

---

## Stack Tecnológico

### Frontend
- **Framework:** React 18 + TypeScript + Vite
- **Estilos:** Tailwind CSS
- **Animaciones:** Framer Motion
- **Routing:** React Router DOM
- **Estado:** React Context API

### Backend
- **API:** Funciones serverless en Vercel (`lista-compra-inteligente/api/`)
- **Runtime:** Node.js con `@vercel/node`
- **Base de datos:** Supabase (PostgreSQL)
- **IA:** OpenAI GPT-4o-mini

---

## Comandos de Desarrollo

### Instalación
```bash
cd lista-compra-inteligente
npm install
```

### Desarrollo
```bash
npm run dev  # Inicia servidor en http://localhost:5173
```

### Build
```bash
npm run build  # TypeScript + Vite build
```

### Linting
```bash
npm run lint  # ESLint
```

### Testing de API
```bash
# Modo desarrollo con componente TestAPI
http://localhost:5173?test=api

# Testing manual de endpoints serverless
npm run preview  # Previsualizar build con API
```

### Debugging Local de API
```bash
# Las funciones serverless en /api solo funcionan en Vercel o con Vercel CLI
npm install -g vercel  # Instalar Vercel CLI global
vercel dev             # Ejecutar entorno serverless local (puerto 3000)

# Alternativamente, usar build + preview
npm run build && npm run preview
```

---

## Arquitectura del Proyecto

### Estructura de Carpetas

```
lista-compra-inteligente/
├── api/                          # Serverless functions (Vercel)
│   ├── productos.ts              # GET /productos con filtros y paginación
│   ├── categorias.ts             # GET /categorias con subcategorías
│   ├── listas.ts                 # CRUD de listas de compra
│   └── generar-lista.ts          # POST generación con OpenAI
│
├── src/
│   ├── components/
│   │   ├── common/               # Componentes reutilizables
│   │   │   ├── Button.tsx        # Botón con variants
│   │   │   ├── Header.tsx        # Navegación principal
│   │   │   └── LoadingSpinner.tsx
│   │   ├── forms/
│   │   │   ├── ConversationalForm.tsx  # Formulario principal
│   │   │   ├── ProgressIndicator.tsx   # Indicador de progreso
│   │   │   └── steps/            # 8 pasos del formulario
│   │   │       ├── DurationStep.tsx
│   │   │       ├── PeopleStep.tsx
│   │   │       ├── BudgetStep.tsx
│   │   │       ├── MealsStep.tsx
│   │   │       ├── BasicsStep.tsx
│   │   │       ├── AdditionalStep.tsx
│   │   │       ├── RestrictionsStep.tsx
│   │   │       └── SummaryStep.tsx
│   │   ├── history/
│   │   │   └── ListHistoryCard.tsx   # Tarjeta de lista guardada
│   │   └── products/
│   │       ├── ProductSearchModal.tsx  # Modal búsqueda productos
│   │       └── ProductEditModal.tsx    # Modal edición productos
│   │
│   ├── pages/
│   │   ├── HomePage.tsx          # Página inicial con formulario
│   │   ├── ResultsPage.tsx       # Página de resultados con lista generada
│   │   └── HistoryPage.tsx       # Página de listas guardadas
│   │
│   ├── contexts/
│   │   └── AppContext.tsx        # Estado global de la aplicación
│   │
│   ├── hooks/
│   │   ├── useMultiStepForm.ts   # Hook navegación formulario
│   │   └── useListHistory.ts     # Hook gestión historial localStorage
│   │
│   ├── lib/
│   │   └── api.ts                # Cliente API con tipos
│   │
│   ├── services/
│   │   └── supabase.ts           # Cliente Supabase configurado
│   │
│   ├── types/
│   │   ├── index.ts              # Tipos principales
│   │   └── form.types.ts         # Tipos del formulario
│   │
│   └── utils/
│       ├── constants.ts          # Configuración y constantes
│       ├── exportPDF.ts          # Exportación a PDF con jsPDF
│       └── exportExcel.ts        # Exportación a Excel con xlsx
│
├── mercadata/                    # Datasets de productos (CSV, JSON)
├── supabase_schema.sql           # Esquema BD (6 tablas)
├── import_mercadona_supabase.sql # Script importación
└── vercel.json                   # Config despliegue
```

### Patrones de Arquitectura

- **Arquitectura:** MVC con separación client/server
- **Principios:** SOLID, componentes reutilizables
- **Estado:** Context API para estado global, hooks locales para componentes
- **Tipos:** TypeScript estricto con interfaces en `src/types/`

### Consideraciones Importantes

**Funciones Serverless:**
- Las API functions en `/api` usan `@vercel/node` y solo se ejecutan correctamente en Vercel
- Para desarrollo local, usar `vercel dev` o trabajar con el build de producción
- No usar `"type": "module"` en package.json (causa errores con Vercel)

**OpenAI Integration:**
- GPT-4o-mini requiere parsing robusto del JSON (puede devolver markdown)
- Usar regex para extraer JSON del contenido: `/```json\n?([\s\S]*?)\n?```/`
- Manejar timeouts (generación puede tomar 10-30 segundos)

**Supabase:**
- Usar cliente configurado en `src/lib/supabase.ts`
- RLS (Row Level Security) habilitado en `listas_compra`, `items_lista`
- RLS temporalmente deshabilitado en `profiles` (para desarrollo)
- 4,429 productos importados - usar paginación siempre

---

## Sistema de Autenticación

**Arquitectura:** Multi-usuario con roles (Admin/User)
**Provider:** Supabase Auth
**Modo Demo:** Usuarios no autenticados pueden probar la app (máx 3 listas temporales)

### Características:
- Login/Register con email + contraseña
- Row Level Security (RLS) en tablas sensibles
- Listas vinculadas con `user_id` en BD
- Features Premium para usuarios autenticados
- Dashboard Admin para gestión de usuarios
- Sistema híbrido: BD para usuarios autenticados, localStorage para modo Demo

### Estructura:
```
src/features/auth/          # Sistema de autenticación
├── components/
│   ├── LoginForm.tsx       # Formulario de login
│   ├── RegisterForm.tsx    # Formulario de registro
│   ├── ProtectedRoute.tsx  # HOC para rutas protegidas
│   ├── DemoBanner.tsx      # Banner para usuarios Demo
│   └── PremiumGate.tsx     # Gate para features premium
├── context/
│   └── AuthContext.tsx     # Context de autenticación
├── hooks/
│   ├── useAuth.ts          # Hook principal de auth
│   └── useDemoMode.ts      # Hook para gestión modo Demo
└── utils/
    └── migrateDemoLists.ts # Migración listas Demo a BD

src/features/admin/         # Dashboard administración
├── layout/
│   └── AdminLayout.tsx     # Layout con sidebar
├── pages/
│   ├── AdminDashboard.tsx  # Dashboard principal
│   ├── UsersManagement.tsx # Gestión de usuarios
│   ├── DatabaseManagement.tsx # Visualizador de BD
│   └── AnalyticsPage.tsx   # Analytics y estadísticas
└── components/
    └── [componentes UI]

database/migrations/        # Scripts SQL
├── 01_create_profiles.sql  # Tabla profiles + triggers
├── 02_add_user_id_to_lists.sql # Vincular listas con usuarios
├── 03_create_admin_logs.sql # Tabla de auditoría
└── 04_create_indexes.sql   # Índices para optimización
```

### Tablas de Autenticación:

**1. profiles** - Perfiles extendidos con roles
```sql
- id: UUID (PK, FK a auth.users)
- email: TEXT
- role: TEXT ('admin' | 'user')
- full_name: TEXT
- avatar_url: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**2. admin_logs** - Auditoría de acciones admin
```sql
- id: UUID (PK)
- admin_id: UUID (FK a auth.users)
- action: TEXT
- table_name: TEXT
- record_id: TEXT
- changes: JSONB
- created_at: TIMESTAMP
```

**3. listas_compra** - Modificada con user_id
```sql
- ... (campos existentes)
- user_id: UUID (FK a auth.users) # NUEVO
```

### Features Premium vs Free:

**Usuario Autenticado (Premium):**
- ✅ Listas ilimitadas guardadas en la nube
- ✅ Acceso desde cualquier dispositivo
- ✅ Exportación a PDF y Excel
- ✅ Historial completo de compras
- ✅ Compartir listas (futuro)
- ✅ Analytics personal (futuro)

**Modo Demo (Free):**
- ✅ Generación de listas con IA
- ✅ Formulario completo de 8 pasos
- ✅ Visualización de resultados
- ✅ Hasta 3 listas en localStorage
- ❌ Exportación bloqueada con PremiumGate
- ❌ Acceso limitado a historial

### Flujo de Autenticación:

1. **Usuario No Autenticado:**
   - Ve DemoBanner en HomePage y HistoryPage
   - Puede usar formulario IA
   - Listas se guardan en localStorage (máx 3)
   - Features premium bloqueadas con overlay

2. **Registro:**
   - Formulario simple: email + contraseña
   - Trigger automático crea perfil con role='user'
   - Opción de migrar listas Demo a BD
   - Redirección automática a login

3. **Login:**
   - AuthContext carga user + profile
   - Header muestra avatar y menú
   - Hook useListHistory carga listas desde BD
   - Acceso completo a features

4. **Admin:**
   - Acceso a /admin/* rutas
   - Dashboard con estadísticas
   - Gestión de usuarios (CRUD)
   - Ver todas las listas (RLS permite)

### Crear Usuario Admin:

```sql
-- Método 1: Actualizar usuario existente
UPDATE profiles
SET role = 'admin'
WHERE email = 'tu_email@ejemplo.com';

-- Método 2: Durante registro (vía trigger modificado)
-- Primer usuario registrado puede ser admin automáticamente
```

### Troubleshooting Común:

**Error: "Email not confirmed"**
```sql
-- Confirmar email manualmente en desarrollo
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'tu_email@ejemplo.com';
```

**Error: 500 al cargar profile**
- Verificar que RLS esté configurado correctamente
- Temporalmente deshabilitar RLS en profiles si hay problemas:
```sql
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

**Listas no se guardan con user_id**
- Verificar que AuthContext esté en App.tsx
- Confirmar que useAuth() retorna user correctamente
- Check que saveList() use el sistema híbrido

---

## Base de Datos (Supabase)

### Proyecto Supabase
- **Project ID:** `hnnjfqokgbhnydkfuhxy`
- **URL:** `https://hnnjfqokgbhnydkfuhxy.supabase.co`

### Tablas Principales

1. **categorias** - Categorías principales
2. **subcategorias** - Subcategorías por categoría
3. **productos** - Catálogo completo (4,429 productos)
4. **listas_compra** - Listas generadas por usuario
5. **items_lista** - Productos en cada lista
6. **historial_compras** - Historial para análisis IA

### Ejecución de Scripts SQL

Ver instrucciones completas en: [INSTRUCCIONES_EJECUCION_SUPABASE.md](INSTRUCCIONES_EJECUCION_SUPABASE.md)

```bash
# En Dashboard Supabase > SQL Editor:
1. Ejecutar supabase_schema.sql
2. Crear tabla temporal con crear_tabla_temporal.sql
3. Importar CSV desde Table Editor
4. Ejecutar script_conversion_definitivo.sql
```

---

## API Endpoints

Ver documentación completa en: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

### Base URL
- Desarrollo: `http://localhost:5173/api`
- Producción: `https://tu-dominio.vercel.app/api`

### Endpoints Principales

```typescript
GET  /api/productos       # Filtros: categoria, search, precio_min/max, limit, offset
GET  /api/categorias      # Lista categorías con subcategorías
GET  /api/listas          # Obtener listas, query: lista_id, incluir_items
POST /api/listas          # Crear lista
PUT  /api/listas          # Actualizar lista
DELETE /api/listas        # Eliminar lista
POST /api/generar-lista   # Generar con OpenAI
```

### Cliente API

Usar funciones de `src/lib/api.ts`:

```typescript
import { api } from '@/lib/api';

// Buscar productos
const { productos } = await api.productos.obtener({ search: 'aceite', limit: 10 });

// Generar lista con IA
const resultado = await api.listas.generarConIA({
  numPersonas: 2,
  diasDuracion: 7,
  presupuesto: 50,
  // ... más parámetros
});
```

---

## Variables de Entorno

Crear archivo `.env` en `lista-compra-inteligente/`:

```env
VITE_SUPABASE_URL=https://hnnjfqokgbhnydkfuhxy.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_supabase
VITE_OPENAI_API_KEY=tu_clave_openai
```

**Importante:** Nunca commitear el archivo `.env` (ya está en `.gitignore`)

---

## Flujo de la Aplicación

1. **HomePage** → Usuario inicia formulario
2. **ConversationalForm** → 8 pasos interactivos:
   - Duración (días)
   - Personas
   - Presupuesto
   - Preferencias alimentarias (desayuno, comida, cena)
   - Alimentos básicos
   - Productos adicionales (limpieza, etc.)
   - Restricciones dietéticas
   - Resumen y confirmación
3. **API /generar-lista** → OpenAI genera lista optimizada
4. **Resultados** → Muestra lista, menús y recomendaciones

---

## Integración OpenAI

La generación de listas utiliza GPT-4o-mini en `api/generar-lista.ts`.

### Proceso:
1. Recibe parámetros del formulario
2. Consulta productos en Supabase por categorías
3. Envía prompt estructurado a OpenAI con catálogo
4. OpenAI devuelve JSON con productos, cantidades y menús
5. Se calcula presupuesto y se guarda en BD

### Estructura de Respuesta:
```typescript
{
  lista: ListaCompra,
  productos: ItemLista[],
  menus: { [dia: string]: { desayuno, comida, cena } },
  presupuesto_estimado: number,
  recomendaciones: string[]
}
```

---

## Progreso del Proyecto

**Estado actual:** 70% completado (6/9 fases + 2 tareas de FASE 7)

✅ Fases completadas:
- FASE 1: Configuración inicial React + TypeScript + Tailwind
- FASE 2: Base de datos Supabase (4,429 productos importados)
- FASE 3: Backend API (4 endpoints funcionales)
- FASE 4: Formulario interactivo (8 pasos completos)
- FASE 5: Integración completa OpenAI (generación de resultados)
- FASE 6: Funcionalidades core (búsqueda, edición, recálculo)
- FASE 7.1: Historial de listas con localStorage ✅
- FASE 7.2: Exportación a PDF y Excel ✅

🔄 Pendientes:
- FASE 7.3-7.5: Compartir lista, comparación precios, ofertas
- FASE 8: Testing (Jest, integración, optimización)
- FASE 9: Mejoras finales (monitoreo, analytics, documentación usuario)

Ver progreso detallado en: [todo.md](todo.md)

---

## Principios de Desarrollo

- **Código limpio:** Seguir principios SOLID
- **Tipos estrictos:** Usar interfaces TypeScript para todo
- **Componentes reutilizables:** Evitar duplicación
- **Responsive:** Mobile-first con Tailwind
- **Performance:** Paginación y lazy loading
- **UX:** Formulario conversacional, animaciones fluidas

---

## Despliegue

### Vercel

```bash
# Desde lista-compra-inteligente/
vercel
```

**Configuración en vercel.json:**
- Serverless functions en `/api`
- Variables de entorno configuradas
- Build automático con `npm run build`

**Estado actual:** ✅ DESPLEGADO Y FUNCIONANDO
- URL: https://lista-compra-inteligente-ivory.vercel.app
- Auto-deploy desde GitHub activado
- Variables de entorno configuradas en Vercel Dashboard

### Troubleshooting Común

**Error 500 en API serverless:**
- Verificar que variables de entorno estén configuradas en Vercel Dashboard
- Comprobar que `"type": "module"` NO esté en package.json
- Revisar logs en Vercel Dashboard > Deployments > Function Logs

**Error parsing JSON de OpenAI:**
- OpenAI puede devolver JSON envuelto en markdown con ```json
- Verificar que el regex de extracción esté implementado en `generar-lista.ts`

**Build fails:**
- Ejecutar `npm run build` localmente primero
- Verificar errores TypeScript con `npm run lint`
- Asegurar que todas las dependencias estén en `dependencies`, no solo en `devDependencies`

---

## 📊 Progreso Actual del Proyecto

**Estado:** ✅ FASE 7.1 y 7.2 COMPLETADAS - HISTORIAL Y EXPORTACIÓN IMPLEMENTADOS

### ✅ Fases Completadas (70% del proyecto):
1. **FASE 1:** Configuración inicial ✅
2. **FASE 2:** Base de datos SupaBase ✅
3. **FASE 3:** Backend/API ✅
4. **FASE 4:** Formulario interactivo ✅
5. **FASE 5:** Integración OpenAI ✅
6. **FASE 6:** Funcionalidades core ✅
7. **FASE 7.1:** Historial de listas (localStorage) ✅
8. **FASE 7.2:** Exportación PDF/Excel ✅

### 🎯 Funcionalidades implementadas:
- ✅ Formulario conversacional de 8 pasos
- ✅ Generación de listas con IA (OpenAI GPT-4o-mini)
- ✅ ResultsPage con visualización completa
- ✅ Menús semanales planificados
- ✅ Cálculo de presupuesto y ahorro
- ✅ Lista de productos categorizados
- ✅ Recomendaciones de IA
- ✅ Sistema de búsqueda y filtrado de productos
- ✅ Edición manual de listas generadas
- ✅ Añadir/eliminar productos dinámicamente
- ✅ Recálculo automático de presupuesto
- ✅ **Historial de hasta 10 listas guardadas**
- ✅ **Página HistoryPage con gestión completa**
- ✅ **Exportación a PDF profesional**
- ✅ **Exportación a Excel con múltiples hojas**

### 🔧 Problemas resueltos en deployment:
1. **Error ESM/CommonJS:** Eliminado `"type": "module"` del package.json
2. **Error parsing JSON:** Añadido regex para extraer JSON del markdown de OpenAI
3. **Variables de entorno:** Configuradas correctamente en Vercel Dashboard
4. **Node.js version:** Especificado Node.js 20.x en .node-version

### 📋 Próximas fases (FASE 7.3-9):
- Compartir lista por enlace
- Comparación de precios entre productos
- Sugerencias de productos en oferta
- Testing automatizado (Jest)
- Monitoreo y analytics

---

## Archivos de Referencia

- **API_DOCUMENTATION.md** - Documentación completa de endpoints
- **INSTRUCCIONES_EJECUCION_SUPABASE.md** - Guía setup base de datos
- **todo.md** - Registro detallado de desarrollo y progreso
- **mercadata/** - Datasets CSV/JSON de productos Mercadona