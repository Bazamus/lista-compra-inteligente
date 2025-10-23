# Calidad, Observabilidad y DevOps

## 1. Testing y QA

### 1.1 Cobertura prioritaria
- **Formularios IA**: pruebas de componente (`ConversationalForm`, pasos) + integración (submit completo).
- **Catálogo manual**: `CatalogPage`, `CartModal`, exportaciones.
- **Admin**: `AdminDashboard`, `UsersManagement` (casos de rol, errores Supabase).
- **APIs**: tests contractuales (Jest + supertest) para `api/*.ts` usando mocks Supabase/OpenAI.

### 1.2 Infraestructura de pruebas
- Configurar Jest con `@testing-library/react`, MSW para mockear Supabase/OpenAI.
- Añadir `scripts` en `package.json`: `test`, `test:watch`, `test:coverage`.
- CI (GitHub Actions): job `test` con matriz Node 18/20.

### 1.3 QA automatizado
- Lighthouse CI (performance PWA) en deploy preview (Vercel).
- Visual regression (Chromatic o Percy) para componentes críticos.

## 2. Monitorización y Logging

### 2.1 Observabilidad front
- Integrar Sentry/LogRocket para capturar errores y sesiones.
- Configurar dashboards para:
  - Errores por vista.
  - TTFB de `generar-lista`.
  - Fallas de exportación.

### 2.2 Observabilidad backend
- Supabase logs → activar métricas (pg_stat_statements).
- Añadir logging estructurado en `api/*` (JSON con `requestId`).
- Health checks (<code>GET /api/health</code>) con verificación de Supabase y OpenAI (latencia).
- Alertas (Sentry/Slack) cuando error rate > 5%.

## 3. Rendimiento y Resiliencia

### 3.1 Frontend
- Code splitting: lazy load para rutas admin/catálogo (React.lazy + Suspense).
- Prefetch selectivo (React Router) para formularios.
- Lazy loading en exportaciones (dynamic import jsPDF/xlsx).
- Monitorizar Web Vitals (CLS, LCP) con `web-vitals` + dashboard BigQuery.

### 3.2 Backend/Infra
- Cache en Supabase para resultados IA (tabla `listas_cache_ia` con TTL 24h).
- Retries exponenciales en llamadas a OpenAI; fallback a plantillas.
- Programar backups automáticos (Supabase) y verificar restauración.

## 4. Documentación y Playbooks

### 4.1 Documentación técnica
- Actualizar `README.md` con secciones: testing, despliegue, troubleshooting común.
- `AUTH_SYSTEM.md`: roles, RLS, flujo compartidos.
- Nueva doc `RUNBOOKS.md`: procedimientos ante incidentes (IA caída, Supabase downtime, fallos exportación).

### 4.2 Onboarding
- Guía `docs/onboarding.md` con setup local, credenciales dummy, scripts seeds.
- Checklist pre-release.

## 5. Roadmap y Ejecución

| Fase | Entregables | Tiempo |
|------|--------------|--------|
| Testing base | Configuración Jest, cobertura formularios/catalogo | 1.5 semanas |
| Monitorización | Integrar Sentry, healthchecks, alertas | 1 semana |
| Performance | Code-splitting, lazy modules, métricas Web Vitals | 1 semana |
| Documentación | README, runbooks, onboarding | 0.5 semana |

## 6. Indicadores de éxito
- Cobertura mínima 65% en áreas críticas.
- MTTR < 2h gracias a alertas y runbooks.
- Error rate front < 1% semanal.
- Tiempo LCP medio < 2.5s en PWA.

---

Este plan complementa los roadmaps de experiencia y admin, asegurando que las nuevas funcionalidades puedan operar con calidad y resiliencia.

