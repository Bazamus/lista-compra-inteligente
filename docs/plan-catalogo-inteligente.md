# Catálogo Inteligente y List Builder

Objetivo: elevar la experiencia de compra manual añadiendo personalización, gestión de inventario doméstico y comparativa con la lista generada por IA.

## 1. Recomendaciones Cruzadas y Bundles

### 1.1 Reglas de afinidad
- Crear tabla `productos_relaciones` (`producto_id`, `relacionado_id`, `tipo`, `score`) con migración 06.
- CLI/script para poblar reglas iniciales (ej. pasta ↔ salsa, tortilla ↔ huevos).
- `useProducts.ts`: exponer `getRelatedProducts(productId)`.
- `ProductDetailModal.tsx`:
  - Mostrar sección “Completa tu compra” con hasta 4 sugerencias.
  - Botón “Añadir bundle” para agregar múltiples items al carrito.

### 1.2 Recomendaciones basadas en carrito
- `useCart.ts`:
  - Calcular categorías dominantes y sugerir producto faltante (ej. faltan especias).
- `CatalogPage.tsx`:
  - Banner “Ideas para ti” alimentado por `useCart` + afinidad.
- Grabar eventos Supabase (`cart_recommendation_click`).

## 2. Inventario Doméstico y Autocompletado

### 2.1 Estado y datos
- Nuevo contexto `InventoryContext` con almacenamiento en Supabase (`inventario_domestico`):
  - Campos: `producto_id`, `cantidad_actual`, `unidad`, `ultima_actualizacion`.
- Flujo onboarding: wizard para introducir inventario inicial (opcional).

### 2.2 UI/UX
- `ProductCard.tsx`/`ProductDetailModal.tsx`:
  - Indicar cuánto hay en inventario y sugerir compra (“Te quedan 2/5 unidades”).
- `CartModal.tsx`:
  - Ajustar cantidad recomendada según inventario; mostrar badge “Sugerido: compra 3 más”.
- Recordatorios push cuando stock baja bajo umbral configurable.

### 2.3 Integración con formularios
- `ConversationalForm` pasos:
  - Añadir pregunta “¿Qué productos tienes en casa?” (autocompletar inventario).
- Guardar respuesta en `data_json.inventario_inicial` para IA y listas manuales.

## 3. Comparador IA vs Manual

### 3.1 Modelo de datos
- Unificar estructura de `resultado` (IA y manual) en esquema `ListaDetallada`:
  - Productos con atributos comunes: `origen` (ia/manual), `precio`, `categoria`, `nutricion`.
- Al guardar lista manual, generar versión IA de referencia (invocar IA con parámetros similares pero sin persistir).

### 3.2 UI
- Nueva vista en `ManualListResults.tsx`:
  - Tabla comparativa con columnas: Precio Total, Nº productos, Distribución categorías, kcal estimadas.
  - Gráficos mini (sparklines) para variación de presupuesto.
- Botón “Actualizar con IA” que permite fusionar sugerencias IA en lista manual.

### 3.3 Analítica
- Registrar acciones de conversión manual→IA (`manual_to_ai_conversion`).
- Dashboard admin: % de usuarios que adoptan recomendaciones IA tras comparación.

## 4. Roadmap Técnico

| Hito | Dependencias | Tiempo estimado |
|------|--------------|-----------------|
| Reglas afinidad + UI detalle | Migración 06, hooks actualizados | 1.5 semanas |
| Inventario doméstico | Backend Supabase + nuevos componentes | 2 semanas |
| Comparador IA/manual | Estandarizar datos + UI analytics | 1.5 semanas |

## 5. Riesgos y Mitigaciones
- **Complejidad de datos:** riesgo de desincronización inventario ↔ carrito → implementar jobs nocturnos que limpien inconsistencias.
- **Coste IA adicional:** comparador requiere llamadas extra → cachear resultados IA en Supabase (tabla `listas_cache_ia`).
- **Aceptación de usuario:** introducir estas funciones con tutorial in-app y tooltips.

## 6. Métricas
- % de usuarios que usan recomendaciones cruzadas ≥ 60%.
- Reducción de compras duplicadas (inventario) ≥ 25%.
- Incremento de adopción IA tras comparar vs manual ≥ 40%.

---

Este documento alimenta los épicos del roadmap general y se coordina con el plan de experiencia del comprador y el de analytics/admin.

