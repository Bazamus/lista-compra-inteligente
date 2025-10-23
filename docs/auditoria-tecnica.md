# Auditoría Técnica - Lista Inteligente de Compra

_Fecha:_ 15 de octubre de 2025  
_Responsable:_ GPT-5 Codex

## 1. Contextos y Estado Global

### 1.1 `src/contexts/AppContext.tsx`
- **Ámbito:** datos temporales de formularios, lista/mMenú activo, catálogo en memoria.
- **Hallazgos:**
  - El `formData` y la lista/mMenú actuales se resetean al cerrar sesión pero no existe persistencia entre recargas.
  - No hay separación entre estado derivado de IA vs lista manual; las vistas mezclan responsabilidades.
  - Falta memoización/selectores; los componentes consumidores reciben el contexto completo y fuerzan re-render de árbol.
- **Riesgos:** potenciales incoherencias cuando `ResultsPage` actualiza lista guardada y cuando `HistoryPage` hidrata datos; ausencia de serialización/rehidratación dificulta recuperación tras refresh.
- **Recomendaciones inmediatas:**
  1. Dividir en subcontextos (ej. `FormContext`, `ListSessionContext`) o migrar a Zustand.
  2. Añadir persistencia opcional (sessionStorage con versión) para evitar pérdida de progreso.
  3. Exponer selectores memoizados para prevenir renders masivos.

### 1.2 `src/features/auth/context/AuthContext.tsx`
- **Ámbito:** sesión Supabase, perfil, helpers auth.
- **Hallazgos:**
  - `loading` queda en `false` aunque falle `fetchProfile` por timeout → consumidores no diferencian entre error y sin perfil.
  - El listener `onAuthStateChange` invoca `setLoading(false)` incluso si aún no se resolvió `fetchProfile` interno.
  - No se cachea el perfil; toda recarga dispara consulta completa.
- **Riesgos:** condiciones de carrera (UI lee `profile` `null` aunque exista), falta manejo explícito de errores.
- **Recomendaciones:**
  1. Unificar flujo de inicialización (`initializeAuth`) con loader/suspense.
  2. Guardar perfil en `localStorage` cifrado/sanitizado o en Supabase cache.
  3. Exponer `authError` y `refreshing` para UI específicas.

### 1.3 Hooks relacionados
- `useListHistory.ts`: mezcla lógica offline/online; bloqueo duro ante errores de Supabase provocará vacíos en UI. No existe mecanismo de reintento.
- `useCart.ts`: persistencia en `localStorage` sin namespacing por usuario; riesgo de mezclar carritos entre cuentas.
- `useProducts.ts`: delega filtros al frontend cuando la búsqueda está vacía; conviene migrar a vistas paginadas.

## 2. Dependencias Críticas y Contratos

| Dominio | Archivo(s) | Descripción | Riesgos |
|---------|------------|-------------|---------|
| Supabase | `src/lib/supabase.ts`, `api/*.ts`, hooks `useListHistory`, `AuthContext` | CRUD listas, perfiles, productos, auth | Claves expuestas en entorno Vercel; falta `service_role` para acciones administrativas; latencias sin métricas |
| OpenAI | `api/generar-lista.ts` | Prompting para generación de menús y listas | No hay cache; costo dependiente de tráfico; sin fallback si API falla |
| Exportaciones | `src/utils/exportPDF.ts`, `exportExcel.ts` | Generación PDF/Excel | Uso intensivo en cliente, riesgo de bloqueo UI; sin pruebas |
| Service Worker | `public/sw.js` | Cache PWA | Solo cache estático; no gestiona actualizaciones de precios ni push |

### 2.1 Contratos API internos
- `GET/POST /api/listas` espera header `Authorization`; la lógica demo (listas sin `user_id`) convive con productiva, se necesita sanitizar.
- Los endpoints retornan objetos JSON con `lista` + `items`; falta versiónado y esquema documentado.
- `generar-lista.ts` retorna payload sin tipado fuerte, UI asume campos.

## 3. Métricas Objetivo Propuestas

| Métrica | Descripción | Fuente | Objetivo inicial |
|---------|-------------|--------|------------------|
| Tasa de conversión IA | % usuarios que completan ConversationalForm y guardan lista | Eventos front (Analítica) | ≥ 45% |
| Tiempo respuesta IA | ms desde submit SummaryStep a payload en `ResultsPage` | Logging en `api/generar-lista.ts` | P95 < 7s |
| Ahorro medio | Diferencia entre presupuesto usuario y coste real | Resultados guardados (`data_json`) | Mostrar en dashboard y buscar ≥12% |
| Engagement catálogo manual | Productos añadidos / sesión catálogo | Métricas front + Supabase | ≥ 6 productos promedio |
| Retención listas | Número de listas guardadas por usuario/mes | `listas_compra` | >3 |

## 4. Riesgos y Deuda Técnica Prioritaria

1. **Inconsistencia de datos entre modos IA/Manual**: `ResultsPage` guarda estructura distinta dependiendo del origen → definir formato canónico.
2. **Falta de multi-tenant**: no existe separación clara por organizaciones; se requiere RLS reforzado antes de compartir listas.
3. **Ausencia de métricas/monitorización**: sin logs estructurados, no se puede escalar.
4. **Procesos largos en UI**: exportaciones y generación IA bloquean thread principal.
5. **Gestión de OTA PWA**: service worker no comunica actualizaciones, riesgo de versiones obsoletas.

## 5. Próximos Pasos (Input para Plan de Mejora)
- Formalizar `data_json` como contrato único (schemata versionado) y actualizar `useListHistory`, `ResultsPage`, APIs.
- Implementar capa de métricas (Supabase functions + Analytics front) para las KPIs listadas.
- Preparar capa de caché/colas para OpenAI (Supabase Edge Functions o Vercel KV) y degradar con recetas pre-curadas.
- Diseñar builder de prompts versionado (plantillas YAML) para nuevas preferencias.
- Evaluar migración parcial de estado a React Query (evitar duplicado de fetch).

---

**Estado actual de auditoría:** completada. Este documento alimenta las propuestas de las tareas siguientes del roadmap.

