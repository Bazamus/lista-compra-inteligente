# Experiencia del Comprador - Hoja de Ruta

Basado en la auditoría técnica (15/10/2025), se propone un conjunto de mejoras enfocadas en colaboración, transparencia de precios y enriquecimiento de la generación IA.

## 1. Compartición y Colaboración de Listas

### 1.1 API y Seguridad
- Extender `api/listas.ts`:
  - Endpoint para generar token de acceso corto (`POST /listas/compartir`).
  - Validación Supabase (tabla `listas_shares` con `lista_id`, `token`, `expira_el`, `permisos`).
- Añadir migración (`database/migrations/05_create_list_shares.sql`).
- Middleware en `ProtectedRoute` para interpretar tokens compartidos y permitir modo lectura.

### 1.2 UI
- `ResultsPage.tsx`:
  - Botón “Compartir” → abre modal con enlace, QR y opciones (solo lectura / editable / clonar).
  - Estado visual para indicar que una lista es compartida.
- `useListHistory.ts`:
  - Función `duplicateSharedList(token)` para incorporar copia a cuenta personal.

### 1.3 Seguimiento
- Registrar eventos de acceso en `admin_logs` (nuevo tipo: `share_view`).
- Dashboard admin: métrica “Listas compartidas vs consumidas”.

## 2. Precios Dinámicos y Alertas

### 2.1 Captura de datos
- Crear cron job (Supabase Edge Function) que guarde historial de precios en tabla `productos_historial_precio` (`producto_id`, `precio`, `capturado_en`).
- Integrar fuente externa (API scraping Mercadona o dataset manual). Guardar delta vs precio actual.

### 2.2 UI y Hooks
- `useProducts.ts`:
  - Incluir precio histórico y variación `%` en respuesta.
  - Exponer `obtenerOfertas()` (productos con reducción >5%).
- `CatalogPage.tsx` y `ProductCard.tsx`:
  - Badges “-12% esta semana”, tooltip con historial.
  - Sección “Ofertas recomendadas” priorizada por afinidad con carrito.
- `ResultsPage.tsx`:
  - Alertar cuando un producto subió/bajó desde la última lista guardada.

### 2.3 Notificaciones
- PWA: notificaciones push cuando productos favoritos bajan de precio.
- Configurar topic `price-drop` en service worker (`sw.js`).

## 3. Generación IA Enriquecida

### 3.1 Prompts y Parámetros
- `api/generar-lista.ts`:
  - Incorporar nuevas preferencias: tiempo de preparación, cocina favorita, restricciones nutricionales (calorías objetivo, macros), temporada.
  - Plantillas de prompt versionadas (YAML/JSON) alojadas en `prompts/`.
- Validar respuesta IA con esquema Zod antes de persistir.

### 3.2 Editor de Menús
- `ResultsPage.tsx`:
  - Vista semanal editable (drag & drop) para reordenar comidas.
  - Capacidad de marcar sustituciones y regenerar un solo día vía IA (endpoint parcial `POST /generar-lista/dia`).

### 3.3 Asistente Conversacional
- Nuevo componente `MealAssistant.tsx` (modal/chat):
  - Permite al usuario pedir ajustes (“haz el menú más proteico”, “sustituye cena día 3 por algo vegano”).
  - Usa la misma infraestructura de prompts con `conversation_id` para contexto.

## 4. Móvil y PWA

### 4.1 Instalación y Retención
- `InstallPrompt.tsx`:
  - Añadir analítica de conversiones (cuántos aceptan instalar).
  - Mostrar beneficios alineados con funcionalidades nuevas (alertas precio, listas compartidas offline).

### 4.2 Service Worker
- `public/sw.js`:
  - Actualizar a Workbox + canales de comunicación `postMessage`.
  - Cache prioritario para assets críticos + fallback offline de última lista.
- Endpoint background sync para actualizar precios en segundo plano.

### 4.3 UX móvil
- Ajustar `CatalogPage.tsx` y `ResultsPage.tsx` para microinteracciones táctiles (swipe para marcar comprado, sticky bottom bar con progreso).

## 5. Roadmap y Dependencias

| Hito | Dependencias | Entregables |
|------|--------------|-------------|
| Compartir listas (MVP) | Migración tablas, tokens, modal compartir | Semana 1-2 |
| Seguimiento precios | Cron Supabase, UI badges, notificaciones | Semana 3-4 |
| IA avanzada | Plantillas prompt, editor de menús, asistente | Semana 5-7 |
| PWA mejorada | Service worker, push, UX táctil | Semana 6-8 |

## 6. Métricas de Éxito
- Compartidos activos / semana ≥ 50.
- Tiempo medio en catálogo < 90s gracias a ofertas personalizadas.
- Satisfacción IA (encuesta in-app) ≥ 4/5.
- Tasa instalación PWA +30% tras nuevos beneficios.

---

Este plan alimenta el backlog de desarrollo y se sincroniza con las tareas `buyer-experience`, `catalog-intelligence` y `calidad-devops` del roadmap global.

