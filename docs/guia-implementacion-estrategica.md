# Guía de Implementación Estratégica - ListaGPT

**Fecha:** 2025-10-20
**Versión:** 1.0
**Estado del Proyecto:** 85% completado (FASE 7.6 finalizada)

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Contexto: Documentos Analizados](#contexto-documentos-analizados)
3. [Matriz de Priorización](#matriz-de-priorización)
4. [Plan de Implementación por Fases](#plan-de-implementación-por-fases)
5. [Opciones de Roadmap](#opciones-de-roadmap)
6. [Riesgos Críticos y Soluciones](#riesgos-críticos-y-soluciones)
7. [Sprint 0: Plan de Acción Inmediato](#sprint-0-plan-de-acción-inmediato)
8. [Métricas de Éxito](#métricas-de-éxito)
9. [Dependencias y Prerequisitos](#dependencias-y-prerequisitos)

---

## Resumen Ejecutivo

### Situación Actual

ListaGPT ha completado el 85% de su desarrollo inicial con funcionalidades core operativas:
- Generación de listas con IA (OpenAI GPT-4o-mini)
- Sistema de autenticación multi-usuario
- PWA con soporte offline
- Catálogo de 4,429 productos de Mercadona
- Dashboard de administración básico

### Recomendación Principal

**Empezar por Calidad y DevOps (FASE 0) antes de añadir nuevas funcionalidades.**

**Razón estratégica:**
- Sin observabilidad, testing y documentación robusta, añadir más features aumentará la deuda técnica exponencialmente
- Los 4 planes restantes añaden ~30 nuevas funcionalidades que requerirán mantenimiento
- Problemas críticos detectados en auditoría técnica bloquean escalabilidad

**Tiempo estimado:** 14 semanas para completar todos los planes
**Riesgo actual:** Alto (deuda técnica acumulada)
**Prioridad #1:** Cimentar fundamentos técnicos

---

## Contexto: Documentos Analizados

### 1. `auditoria-tecnica.md`
**Hallazgos clave:**
- 12 problemas críticos detectados en componentes core
- AuthContext tiene condición de carrera
- useListHistory sin manejo de errores con reintentos
- APIs sin cache (costos OpenAI elevados)
- Sin monitorización ni alertas

### 2. `plan-calidad-devops.md`
**Propuesta:**
- Testing automatizado (Jest + Vitest + E2E)
- Monitorización con Sentry
- CI/CD con GitHub Actions
- Performance optimization (code-splitting, lazy loading)
- Health checks robustos

### 3. `plan-admin-operations.md`
**Propuesta:**
- Dashboard visual con KPIs
- Analytics avanzado con Recharts
- Sistema de auditoría completo
- Gestión de configuraciones
- Alertas operativas

### 4. `plan-catalogo-inteligente.md`
**Propuesta:**
- Recomendaciones basadas en IA
- Sistema de comparación de productos
- Listas colaborativas
- Productos favoritos y recurrentes
- Búsqueda semántica avanzada

### 5. `plan-experiencia-comprador.md`
**Propuesta:**
- Compartir listas (QR + enlaces)
- Precios dinámicos con histórico
- Asistente conversacional IA
- Editor visual de menús
- Notificaciones push

---

## Matriz de Priorización

| Plan | Valor Usuario | Complejidad Técnica | Riesgo | Dependencias | Prioridad |
|------|---------------|---------------------|--------|--------------|-----------|
| **Calidad-DevOps** | Bajo (interno) | Media | **Alto** (bloquea escalado) | Ninguna | **1 - CRÍTICO** |
| **Admin Operations** | Medio (operaciones) | Baja | Medio | Calidad-DevOps (Sentry) | **2 - IMPORTANTE** |
| **Compartir Listas** | **Alto** | Baja | Bajo | Ninguna | **3 - QUICK WIN** |
| **Catálogo Inteligente** | **Alto** | Media | Medio | Datos reales de uso | **4 - ITERATIVO** |
| **IA Avanzada + Precios** | **Muy Alto** | **Alta** | **Alto** | Calidad-DevOps + histórico | **5 - LARGO PLAZO** |

### Criterios de Evaluación

- **Valor Usuario:** Impacto percibido por usuarios finales
- **Complejidad:** Esfuerzo de desarrollo + testing
- **Riesgo:** Probabilidad de fallos o bloqueos
- **Dependencias:** Qué necesita estar listo antes

---

## Plan de Implementación por Fases

### FASE 0: Fundamentos Técnicos (Calidad-DevOps)
**Duración:** 3 semanas
**Objetivo:** Asegurar que lo existente funcione de manera robusta y observable

#### Semana 1: Testing Base
**Tareas:**
1. Configurar Jest + React Testing Library + MSW (Mock Service Worker)
2. Tests críticos:
   - `ConversationalForm.test.tsx` - Flujo completo 8 pasos
   - `useListHistory.test.ts` - Sistema híbrido localStorage + BD
   - `AuthContext.test.tsx` - Login/logout/session management
   - Mock API endpoints (`/productos`, `/categorias`, `/generar-lista`)
3. Scripts NPM:
   ```bash
   npm run test           # Ejecutar tests
   npm run test:watch     # Modo watch
   npm run test:coverage  # Coverage con objetivo 50%
   ```

**Entregables:**
- Suite de tests con mínimo 50% coverage
- CI pipeline con tests automáticos en PRs
- Badge de coverage en README

#### Semana 2: Monitorización y Observabilidad
**Tareas:**
1. Integrar **Sentry**:
   - Frontend: errores React + performance traces
   - Backend: errores serverless functions
   - Configurar alertas: error rate > 5% → Slack/Email
2. Health Check robusto (`/api/healthcheck`):
   ```typescript
   {
     status: "healthy" | "degraded" | "down",
     checks: {
       supabase: { latency: 45, status: "ok" },
       openai: { status: "ok" },  // Sin gastar tokens
       database: { connections: 5 }
     },
     timestamp: "2025-10-20T10:30:00Z"
   }
   ```
3. Logging estructurado:
   - Añadir `requestId` a todas las API calls
   - Winston logger con niveles (debug/info/warn/error)
   - Logs en JSON para Vercel/Sentry

**Entregables:**
- Dashboard Sentry configurado
- Health endpoint con SLO 99.5% uptime
- Alertas automáticas funcionando

#### Semana 3: Performance y Documentación
**Tareas:**
1. Code-splitting:
   ```typescript
   // Lazy load rutas pesadas
   const AdminDashboard = lazy(() => import('@/features/admin/pages/AdminDashboard'))
   const CatalogPage = lazy(() => import('@/pages/CatalogPage'))
   ```
2. Lazy imports:
   - Exportación PDF/Excel solo cuando se usa
   - Recharts solo en admin dashboard
3. Web Vitals tracking:
   - LCP (Largest Contentful Paint) < 2.5s
   - CLS (Cumulative Layout Shift) < 0.1
   - FID (First Input Delay) < 100ms
4. Documentación:
   - `docs/RUNBOOKS.md` - Procedimientos ante incidentes
   - `docs/ARCHITECTURE.md` - Diagramas de arquitectura
   - Actualizar README con setup testing

**Entregables:**
- Lighthouse score > 90
- Bundle size reducido 30%
- Documentación técnica completa

---

### FASE 1: Admin Operations
**Duración:** 2 semanas
**Prerequisitos:** FASE 0 completa (Sentry + testing)

#### Semana 1: KPIs y Dashboard Visual
**Tareas:**
1. Vistas SQL materializadas:
   ```sql
   CREATE MATERIALIZED VIEW vw_admin_kpis AS
   SELECT
     COUNT(DISTINCT user_id) as usuarios_activos,
     COUNT(*) as listas_generadas,
     AVG(presupuesto_estimado) as presupuesto_promedio,
     SUM(ahorro_calculado) as ahorro_total
   FROM listas_compra
   WHERE created_at > NOW() - INTERVAL '30 days';
   ```
2. Componentes visuales:
   - `KPICard.tsx` con sparklines (Recharts)
   - `UsageChart.tsx` - Gráfico de uso diario
   - `TopProductsTable.tsx` - Productos más agregados
3. Endpoint `GET /api/admin/kpis`

**Entregables:**
- Dashboard visual con 10 métricas clave
- Gráficos interactivos con Recharts
- Refresco automático cada 5 minutos

#### Semana 2: Auditoría Avanzada
**Tareas:**
1. Ampliar `admin_logs`:
   ```sql
   ALTER TABLE admin_logs ADD COLUMN payload JSONB;
   ALTER TABLE admin_logs ADD COLUMN resultado TEXT;
   ALTER TABLE admin_logs ADD COLUMN duracion_ms INTEGER;
   ```
2. Nueva página `AdminAudits.tsx`:
   - Filtros: fecha, acción, usuario
   - Paginación con React Table
   - Exportación a CSV
3. Middleware automático:
   ```typescript
   // Registrar todas las acciones admin
   export const auditMiddleware = (action: string) => {
     // Capturar antes/después
   }
   ```

**Entregables:**
- Sistema de auditoría completo
- Página de logs con búsqueda avanzada
- Alertas para acciones sensibles

---

### FASE 2A: Experiencia Comprador - Compartir Listas (Quick Win)
**Duración:** 2 semanas
**Prerequisitos:** Ninguno (puede hacerse en paralelo con FASE 0)

#### Semana 1: Backend y Seguridad
**Tareas:**
1. Migración SQL:
   ```sql
   -- database/migrations/05_create_list_shares.sql
   CREATE TABLE list_shares (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     lista_id UUID REFERENCES listas_compra(id),
     token VARCHAR(64) UNIQUE,
     expires_at TIMESTAMP,
     is_active BOOLEAN DEFAULT true,
     visits INTEGER DEFAULT 0
   );
   ```
2. Endpoint `POST /api/listas/compartir`:
   ```typescript
   {
     lista_id: "uuid",
     expiration_hours: 48  // Opcional
   }
   → { share_url: "https://app.com/shared/abc123", qr_code: "data:image/png..." }
   ```
3. Middleware de validación:
   - Verificar que usuario es dueño
   - Generar token criptográfico seguro
   - Rate limiting: 5 shares/minuto

**Entregables:**
- Tabla `list_shares` con RLS
- API de compartir funcional
- Tests de seguridad

#### Semana 2: Frontend y UX
**Tareas:**
1. Modal "Compartir" en `ResultsPage.tsx`:
   - Botón "Compartir Lista"
   - Generar código QR con `qrcode.react`
   - Copiar enlace al portapapeles
   - Configurar expiración (24h/48h/7días)
2. Página pública `/shared/:token`:
   - Layout sin autenticación
   - Vista read-only de la lista
   - Botón "Crear mi propia copia"
3. Tracking analítico:
   - Evento: `share_created`
   - Evento: `share_viewed`

**Entregables:**
- Modal de compartir con QR
- Página pública responsiva
- Analytics configurado

---

### FASE 2B: Catálogo Inteligente - Recomendaciones IA
**Duración:** 3 semanas
**Prerequisitos:** Datos reales de uso (mínimo 100 listas generadas)

#### Semana 1: Motor de Recomendaciones
**Tareas:**
1. Migración SQL:
   ```sql
   -- database/migrations/06_productos_relaciones.sql
   CREATE TABLE productos_relacionados (
     producto_id UUID REFERENCES productos(id),
     relacionado_id UUID REFERENCES productos(id),
     tipo_relacion VARCHAR(50), -- 'complementario', 'sustituto', 'upgrade'
     score FLOAT,
     PRIMARY KEY (producto_id, relacionado_id)
   );
   ```
2. Script ETL para poblar relaciones:
   ```bash
   npm run etl:product-affinity
   ```
   - Analizar coocurrencia en listas históricas
   - Calcular score de afinidad (Jaccard similarity)
3. Endpoint `GET /api/productos/:id/recomendaciones`

**Entregables:**
- Tabla de relaciones poblada
- API de recomendaciones con cache
- Tests con datos sintéticos

#### Semana 2: Integración Frontend
**Tareas:**
1. `ProductDetailModal.tsx`:
   - Nueva sección "Completa tu compra"
   - Carrusel de productos recomendados
   - Botón "Añadir al carrito"
2. `RecommendedProducts.tsx` component:
   - Lazy loading de imágenes
   - Skeleton mientras carga
3. `CatalogPage.tsx`:
   - Banner "Basado en tu lista anterior"
   - Filtro "Recomendados para ti"

**Entregables:**
- Modal de producto con recomendaciones
- Tracking de clics en recomendaciones
- A/B test preparado (50% usuarios)

#### Semana 3: Machine Learning Simple
**Tareas:**
1. Algoritmo de scoring:
   ```typescript
   // Combina múltiples señales
   score = 0.4 * coocurrencia +
           0.3 * categoría_similar +
           0.2 * precio_similar +
           0.1 * popularidad
   ```
2. Cron job semanal:
   - Recalcular relaciones con datos nuevos
   - Limpiar relaciones con score < 0.1
3. Dashboard admin:
   - Ver top relaciones
   - Editar manualmente reglas

**Entregables:**
- Algoritmo de recomendación v1.0
- Job automático configurado
- Métricas: CTR (Click-Through Rate)

---

### FASE 3: IA Avanzada y Precios Dinámicos
**Duración:** 4 semanas
**Prerequisitos:** FASE 0 completa + histórico de 3 meses

#### Semana 1: Histórico de Precios
**Tareas:**
1. Migración SQL:
   ```sql
   CREATE TABLE productos_historial_precio (
     id UUID PRIMARY KEY,
     producto_id UUID REFERENCES productos(id),
     precio DECIMAL(10,2),
     fuente VARCHAR(50), -- 'scraper', 'manual', 'api'
     created_at TIMESTAMP DEFAULT NOW()
   );
   CREATE INDEX idx_precio_producto ON productos_historial_precio(producto_id, created_at DESC);
   ```
2. Cron job Supabase:
   ```sql
   -- Ejecutar diariamente a las 03:00
   SELECT cron.schedule(
     'captura-precios',
     '0 3 * * *',
     $$ INSERT INTO productos_historial_precio (producto_id, precio, fuente)
        SELECT id, precio, 'snapshot' FROM productos $$
   );
   ```
3. API `GET /api/productos/:id/precio-historico`

**Entregables:**
- Histórico de precios automatizado
- Endpoint con gráfico de tendencia
- Detección de outliers (ofertas)

#### Semana 2: Prompts Versionados
**Tareas:**
1. Sistema de templates:
   ```yaml
   # config/prompts/generar-lista-v2.yaml
   version: "2.0"
   temperature: 0.7
   max_tokens: 2000
   system_prompt: |
     Eres un asistente experto en nutrición...
   user_prompt_template: |
     Genera una lista para {num_personas} personas...
   validation:
     schema: zod-schema-id
     required_fields: [productos, menus]
   ```
2. Validación con Zod:
   ```typescript
   const ListaGeneradaSchema = z.object({
     productos: z.array(ProductoSchema).min(10),
     menus: z.record(z.object({ desayuno: z.string() }))
   });
   ```
3. Versionado en BD:
   ```sql
   ALTER TABLE listas_compra ADD COLUMN prompt_version VARCHAR(10);
   ```

**Entregables:**
- Sistema de prompts como código
- Validación estricta de respuestas IA
- Rollback fácil si nueva versión falla

#### Semana 3: Editor Visual de Menús
**Tareas:**
1. `MenuEditor.tsx` component:
   - Drag & drop con `dnd-kit`
   - Grid semanal (7 días × 3 comidas)
   - Buscar y añadir productos
2. Persistencia:
   ```typescript
   // Guardar estructura JSON en menus_personalizados JSONB
   {
     "lunes": { "desayuno": ["producto_id_1"], "comida": [...] },
     ...
   }
   ```
3. Integración con ResultsPage:
   - Botón "Editar Menús"
   - Modal fullscreen con editor
   - Recalcular lista tras cambios

**Entregables:**
- Editor drag & drop funcional
- Guardado automático
- Mobile-friendly

#### Semana 4: Asistente Conversacional
**Tareas:**
1. `MealAssistant.tsx` component:
   - Chat interface con burbujas
   - Streaming de respuestas (OpenAI SSE)
   - Contexto de lista actual
2. Prompts conversacionales:
   ```
   User: "Cambia el pollo por pescado"
   AI: "He sustituido el pollo por merluza. ¿Quieres que ajuste las cantidades?"
   ```
3. Comandos especiales:
   - `/cambiar [ingrediente] por [otro]`
   - `/añadir [producto]`
   - `/eliminar [producto]`
   - `/sugerir alternativas`

**Entregables:**
- Asistente conversacional funcional
- Streaming de respuestas en tiempo real
- 10 comandos implementados

---

## Opciones de Roadmap

### Opción A: Conservador (Recomendado)
```
FASE 0 (3 sem) → FASE 1 (2 sem) → FASE 2A (2 sem) → FASE 2B (3 sem) → FASE 3 (4 sem)
Total: 14 semanas
```

**Pros:**
- Calidad asegurada desde el inicio
- Testing y monitorización desde el principio
- Menor riesgo de bugs en producción

**Contras:**
- Usuarios no ven nuevas features hasta semana 3
- Trabajo "invisible" al inicio (testing, DevOps)

**Recomendado si:** Tienes usuarios reales en producción que esperan estabilidad

---

### Opción B: Quick Wins Primero
```
FASE 2A (2 sem) → FASE 0 (3 sem) → FASE 1 (2 sem) → FASE 2B (3 sem) → FASE 3 (4 sem)
Total: 14 semanas
```

**Pros:**
- Feature visible (Compartir) en semana 2
- Feedback de usuarios más temprano
- Momentum positivo del equipo

**Contras:**
- Añades features sin observabilidad
- Debugging más difícil si hay problemas
- Deuda técnica se acumula temporalmente

**Recomendado si:** Necesitas demostrar progreso rápido a stakeholders

---

### Opción C: Híbrido (Mi Favorita)
```
FASE 0 Sem 1-2 (Testing + Sentry) → FASE 2A (2 sem) →
FASE 0 Sem 3 (Performance) → FASE 1 (2 sem) → FASE 2B (3 sem) → FASE 3 (4 sem)
Total: 14 semanas
```

**Pros:**
- Observabilidad mínima rápido (Sentry en semana 2)
- Quick win de Compartir en semana 4
- Balance entre calidad y features

**Contras:**
- Fase 0 fragmentada (requiere más coordinación)
- Testing completo llega después del quick win

**Recomendado si:** Quieres lo mejor de ambos mundos

---

## Riesgos Críticos y Soluciones

### De `auditoria-tecnica.md`

#### 1. AuthContext - Condición de Carrera
**Problema:**
```typescript
// En fetchProfile(), si falla la petición:
setLoading(false)  // ❌ Se pone en false aunque no haya profile
// UI lee profile=null y muestra login aunque usuario esté autenticado
```

**Impacto:** Usuarios autenticados ven pantalla de login intermitentemente

**Solución:**
```typescript
const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'unauthenticated' | 'error'>('loading')

const initializeAuth = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const profile = await fetchProfile(session.user.id)
      setAuthState('authenticated')
    } else {
      setAuthState('unauthenticated')
    }
  } catch (error) {
    setAuthState('error')
    Sentry.captureException(error)
  }
}
```

**Prioridad:** Alta - Resolver en FASE 0 Semana 1

---

#### 2. useListHistory - Sin Reintentos ante Errores Supabase
**Problema:**
```typescript
const saveList = async (lista) => {
  const { error } = await supabase.from('listas_compra').insert(lista)
  if (error) {
    console.error(error)  // ❌ Solo log, usuario no ve nada
    // Lista se pierde
  }
}
```

**Impacto:** Listas generadas se pierden silenciosamente si Supabase falla

**Solución:**
```typescript
import { toast } from 'sonner'

const saveListWithRetry = async (lista: ListaCompra, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const { data, error } = await supabase.from('listas_compra').insert(lista)
      if (!error) {
        toast.success('Lista guardada correctamente')
        return data
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
    } catch (error) {
      if (i === maxRetries - 1) {
        // Último intento falló, guardar en localStorage como backup
        localStorage.setItem(`backup_lista_${Date.now()}`, JSON.stringify(lista))
        toast.error('Error al guardar. Lista respaldada localmente.')
        Sentry.captureException(error)
      }
    }
  }
}
```

**Prioridad:** Alta - Resolver en FASE 0 Semana 1

---

#### 3. useCart - Sin Namespacing por Usuario
**Problema:**
```typescript
localStorage.setItem('cart', JSON.stringify(items))
// ❌ Si dos usuarios usan el mismo navegador, comparten carrito
```

**Impacto:** Familias con múltiples usuarios ven productos mezclados

**Solución:**
```typescript
const getCartKey = (userId?: string) => {
  if (userId) return `cart_${userId}`
  // Generar ID anónimo persistente si no autenticado
  const anonId = localStorage.getItem('anon_cart_id') || crypto.randomUUID()
  if (!localStorage.getItem('anon_cart_id')) {
    localStorage.setItem('anon_cart_id', anonId)
  }
  return `cart_demo_${anonId}`
}

const saveCart = (items: CartItem[], userId?: string) => {
  localStorage.setItem(getCartKey(userId), JSON.stringify(items))
}
```

**Prioridad:** Media - Resolver en FASE 1

---

#### 4. API /generar-lista - Sin Cache (Costos Elevados)
**Problema:**
```typescript
// Cada llamada a OpenAI cuesta ~$0.02
// Sin cache, peticiones duplicadas cuestan dinero
```

**Impacto:** Costos OpenAI innecesarios (hasta $500/mes con 25k generaciones)

**Solución:**
```sql
-- database/migrations/07_create_cache_ia.sql
CREATE TABLE listas_cache_ia (
  id UUID PRIMARY KEY,
  params_hash VARCHAR(64) UNIQUE, -- Hash de parámetros
  respuesta JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  hits INTEGER DEFAULT 1
);

CREATE INDEX idx_cache_params ON listas_cache_ia(params_hash);
CREATE INDEX idx_cache_expiry ON listas_cache_ia(created_at)
  WHERE created_at > NOW() - INTERVAL '24 hours';
```

```typescript
// api/generar-lista.ts
const paramsHash = crypto.createHash('sha256')
  .update(JSON.stringify({ numPersonas, presupuesto, preferencias }))
  .digest('hex')

// Buscar en cache (válido 24h)
const cached = await supabase
  .from('listas_cache_ia')
  .select('respuesta')
  .eq('params_hash', paramsHash)
  .gte('created_at', new Date(Date.now() - 24*60*60*1000))
  .single()

if (cached.data) {
  await supabase.from('listas_cache_ia')
    .update({ hits: cached.data.hits + 1 })
    .eq('params_hash', paramsHash)
  return cached.data.respuesta
}

// Si no hay cache, llamar OpenAI y guardar
const resultado = await openai.chat.completions.create(...)
await supabase.from('listas_cache_ia').insert({
  params_hash: paramsHash,
  respuesta: resultado
})
```

**Ahorro estimado:** 70% reducción de llamadas a OpenAI (de $500/mes → $150/mes)

**Prioridad:** Alta - Resolver en FASE 0 Semana 2

---

#### 5. Service Worker - Error en Desarrollo Local
**Problema actual (del log que compartiste):**
```
❌ Error al registrar Service Worker:
SecurityError: The script has an unsupported MIME type ('text/html')
```

**Causa:** Las funciones serverless (`/api/*`) no funcionan con `npm run dev`, devuelven HTML del router de Vite

**Solución documentada en CLAUDE.md:**
```bash
# NUNCA usar npm run dev para probar APIs
# Usar uno de estos métodos:

# Método 1: Vercel CLI (recomendado)
npm install -g vercel
vercel dev

# Método 2: Build + Preview
npm run build && npm run preview

# Método 3: Apuntar a producción temporalmente
# .env.local
VITE_API_BASE_URL=https://lista-compra-inteligente-ivory.vercel.app/api
```

**Acción inmediata:**
- Actualizar README con warning claro
- Añadir script `npm run dev:api` que ejecute `vercel dev` automáticamente

**Prioridad:** Media - Resolver en FASE 0 Semana 3 (Documentación)

---

## Sprint 0: Plan de Acción Inmediato

**Objetivo:** Resolver los 2 problemas críticos más urgentes ESTA SEMANA

### Día 1-2: Testing Base + Sentry
**Tareas (6-8 horas):**
1. Instalar dependencias:
   ```bash
   npm install -D jest @testing-library/react @testing-library/jest-dom
   npm install -D @testing-library/user-event msw
   npm install @sentry/react @sentry/tracing
   ```
2. Configurar Jest:
   - `jest.config.js` con setup de React Testing Library
   - `src/test/setup.ts` con mocks globales
3. Escribir 5 tests críticos:
   - `ConversationalForm.test.tsx` - Navegación entre pasos
   - `AuthContext.test.tsx` - Login/logout
   - `useListHistory.test.ts` - saveList fallback
   - `api/productos.test.ts` - Endpoint con MSW
   - `useCart.test.ts` - Namespacing por usuario
4. Configurar Sentry:
   ```typescript
   // src/lib/sentry.ts
   Sentry.init({
     dsn: import.meta.env.VITE_SENTRY_DSN,
     integrations: [new BrowserTracing()],
     tracesSampleRate: 0.1,
     beforeSend(event) {
       // Filtrar errores de dev
       if (import.meta.env.DEV) return null
       return event
     }
   })
   ```

**Entregable:**
- Suite de tests ejecutándose con `npm run test`
- Sentry capturando errores en staging

---

### Día 3-4: Fixes Críticos
**Tareas (8-10 horas):**
1. **Fix AuthContext:**
   - Refactorizar con máquina de estados
   - Añadir `authError` state
   - Tests de condición de carrera
2. **Fix useListHistory:**
   - Implementar `saveListWithRetry()`
   - Añadir toast notifications con Sonner
   - Tests de reintentos
3. **Fix useCart:**
   - Implementar `getCartKey(userId)`
   - Migrar carritos existentes
   - Tests de múltiples usuarios

**Entregable:**
- 3 bugs críticos resueltos
- Tests pasando al 100%
- PR con review code

---

### Día 5: Documentación y Deployment
**Tareas (4-6 horas):**
1. Actualizar README:
   ```markdown
   ## ⚠️ IMPORTANTE: Desarrollo Local

   Las API functions serverless NO funcionan con `npm run dev`.
   Usa uno de estos métodos:

   ### Opción 1: Vercel CLI (Recomendado)
   npm install -g vercel
   vercel dev  # Puerto 3000

   ### Opción 2: Build + Preview
   npm run build && npm run preview

   ### Opción 3: Apuntar a Producción
   # .env.local
   VITE_API_BASE_URL=https://lista-compra-inteligente-ivory.vercel.app/api
   ```
2. Crear `docs/RUNBOOKS.md`:
   - Procedimiento: "Service Worker no registra"
   - Procedimiento: "Listas no se guardan"
   - Procedimiento: "Error 500 en /generar-lista"
3. Deployment a staging:
   ```bash
   vercel --prod=false
   ```
   - Probar con datos reales
   - Verificar Sentry captura errores

**Entregable:**
- Documentación actualizada
- Deploy a staging exitoso
- Ticket resuelto y cerrado

---

## Métricas de Éxito

### FASE 0: Calidad-DevOps
- **Testing:**
  - Coverage > 50% (objetivo: 70% en 3 meses)
  - 0 tests flakey
  - CI pipeline < 5 minutos
- **Monitorización:**
  - Error rate < 1% (Sentry)
  - Uptime > 99.5%
  - MTTD (Mean Time To Detection) < 10 minutos
- **Performance:**
  - Lighthouse score > 90
  - LCP < 2.5s
  - Bundle size reducido 30%

### FASE 1: Admin Operations
- **KPIs Visibles:**
  - Dashboard con 10 métricas actualizadas en tiempo real
  - Tiempo de carga < 2 segundos
- **Auditoría:**
  - 100% acciones sensibles registradas
  - Retención de logs: 90 días
  - Tiempo de búsqueda < 1 segundo

### FASE 2A: Compartir Listas
- **Adopción:**
  - 20% de listas generadas se comparten
  - 50% de enlaces compartidos se abren
- **Conversión:**
  - 10% de visitantes de enlace público se registran
- **Seguridad:**
  - 0 accesos no autorizados
  - Rate limit: 0 abusos detectados

### FASE 2B: Catálogo Inteligente
- **Engagement:**
  - CTR recomendaciones > 15%
  - +25% productos añadidos desde recomendaciones
- **Relevancia:**
  - Score promedio de recomendaciones > 0.6
  - Feedback positivo > 70%

### FASE 3: IA Avanzada
- **Costos:**
  - Reducción 70% en llamadas OpenAI duplicadas
  - Cache hit rate > 50%
- **UX:**
  - Asistente conversacional: 80% intenciones comprendidas
  - Editor visual: 0 pérdidas de datos

---

## Dependencias y Prerequisitos

### Para FASE 0
- **Ninguna** - Puede empezar inmediatamente
- Acceso a Sentry (cuenta free tier suficiente)
- Node.js >= 20.19.0

### Para FASE 1
- FASE 0 Semana 2 completada (Sentry configurado)
- Permisos admin en Supabase para crear vistas materializadas
- Recharts instalado: `npm install recharts`

### Para FASE 2A
- **Ninguna** - Puede hacerse en paralelo con FASE 0
- Librería QR: `npm install qrcode.react`

### Para FASE 2B
- Mínimo **100 listas generadas** en producción (para análisis de afinidad)
- Si no hay suficientes datos, usar dataset sintético

### Para FASE 3
- FASE 0 completada (para monitorizar costos OpenAI)
- Histórico de 3 meses de datos reales
- Upgrade a Supabase Pro ($25/mes) para cron jobs

---

## Próximos Pasos Recomendados

### Esta Semana (Sprint 0)
1. Revisar esta guía con el equipo
2. Decidir roadmap: Opción A, B o C
3. Ejecutar Sprint 0 (testing + Sentry + fixes críticos)
4. Crear épicas en GitHub Projects para cada fase

### Próxima Semana
- Si elegiste **Opción A o C:** Empezar FASE 0 Semana 1
- Si elegiste **Opción B:** Empezar FASE 2A (Compartir)

### Reunión de Planning
**Agenda sugerida:**
1. Presentar esta guía (15 min)
2. Discutir riesgos y dependencias (15 min)
3. Votar roadmap (10 min)
4. Asignar tareas Sprint 0 (20 min)

---

## Recursos Adicionales

### Documentación Relacionada
- `docs/auditoria-tecnica.md` - Detalle de problemas detectados
- `docs/plan-calidad-devops.md` - Especificaciones técnicas FASE 0
- `docs/plan-admin-operations.md` - Especificaciones FASE 1
- `docs/plan-catalogo-inteligente.md` - Especificaciones FASE 2B
- `docs/plan-experiencia-comprador.md` - Especificaciones FASE 2A y FASE 3

### Herramientas Recomendadas
- **Testing:** Jest + React Testing Library + MSW
- **Monitorización:** Sentry (free tier: 5k errores/mes)
- **CI/CD:** GitHub Actions (incluido en repos públicos)
- **Analytics:** Vercel Analytics ($10/mes) o Google Analytics (free)
- **Diagramas:** Excalidraw o Mermaid (para docs/ARCHITECTURE.md)

### Comunidad y Soporte
- Discord de Supabase: https://discord.supabase.com
- React Testing Library Docs: https://testing-library.com/react
- Sentry Docs: https://docs.sentry.io/platforms/javascript/guides/react/

---

**Última actualización:** 2025-10-20
**Autor:** Análisis estratégico basado en 5 documentos de planificación
**Próxima revisión:** Después de completar FASE 0
