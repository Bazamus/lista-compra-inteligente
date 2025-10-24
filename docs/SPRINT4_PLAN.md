# 🎨 Sprint 4: UX de Resultados y Menús

**Sprint:** 4  
**Fecha inicio:** 24 de octubre de 2025  
**Duración estimada:** 1.5-2 semanas  
**Enfoque:** Mejoras MUY visibles en experiencia de usuario

---

## 🎯 Objetivos

Mejorar drásticamente la **experiencia de edición y visualización** de listas de compra:

1. **Edición más rápida:** 70% menos clics para ajustar cantidades
2. **Organización visual:** Listas ordenadas como en supermercado
3. **Planificación semanal:** Ver menús en formato calendario
4. **Compartir offline:** Imprimir o exportar a PDF
5. **Personalización:** Añadir notas a productos

---

## 🎁 Features a Implementar (5)

### 1. ✨ Edición Inline de Cantidades

**Descripción:**  
Botones +/- directamente en cada producto de ResultsPage para ajustar cantidades sin navegar a otra vista.

**Componentes:**
- `QuantityControls.tsx` - Botones +/- con animación
- Modificar `ResultsPage.tsx` - Integrar controles inline

**Funcionalidades:**
- ✅ Botón `-` para reducir cantidad (mínimo 1)
- ✅ Display de cantidad actual
- ✅ Botón `+` para incrementar
- ✅ Icono 🗑️ para eliminar producto (cantidad = 0)
- ✅ Animación al cambiar (scale + bounce)
- ✅ Actualización instantánea de presupuesto total

**Impacto:**  
De **3 clics** (abrir modal → cambiar → cerrar) a **1 clic** (+/-)

**Tiempo:** 2-3 horas

---

### 2. 🎯 Drag & Drop para Reordenar

**Descripción:**  
Arrastrar y soltar productos para organizarlos por secciones del supermercado (lácteos juntos, carnes juntas, etc.)

**Librerías:**
- `@dnd-kit/core` - Core de drag & drop
- `@dnd-kit/sortable` - Ordenamiento sortable
- `@dnd-kit/utilities` - Utilidades

**Componentes:**
- `DraggableProductList.tsx` - Lista con drag & drop
- `DraggableProductItem.tsx` - Item individual draggable

**Funcionalidades:**
- ✅ Drag handle visual (icono ⋮⋮)
- ✅ Animación smooth al arrastrar
- ✅ Drop zones visuales
- ✅ Persistencia del orden en localStorage
- ✅ Orden por defecto: categorías agrupadas
- ✅ Feedback visual (sombra, elevación)

**Impacto:**  
Listas organizadas como en supermercado = compras 30% más rápidas

**Tiempo:** 4-5 horas

---

### 3. 📅 Menú Semanal Visual

**Descripción:**  
Calendario de 7 días mostrando qué comidas están planificadas cada día.

**Componentes:**
- `WeeklyMenuCalendar.tsx` - Calendario completo
- `DayCard.tsx` - Card de cada día
- `MealTag.tsx` - Tag para comida/cena

**Funcionalidades:**
- ✅ Vista de 7 días (Lun-Dom)
- ✅ Tags de comidas por día: 🍽️ Comida, 🌙 Cena, 🍞 Desayuno
- ✅ Click en día → ver detalles de menú
- ✅ Productos relacionados resaltados
- ✅ Navegación prev/next semana
- ✅ Vista compacta y expandida

**Datos:**  
Extraer de `resultado.menus` (ya viene de IA):
```typescript
menus: {
  "Lunes": {
    comida: "Pasta carbonara",
    cena: "Ensalada césar"
  },
  // ...
}
```

**Impacto:**  
Planificación visual = 50% más claridad

**Tiempo:** 4-5 horas

---

### 4. 🖨️ Impresión y Exportación

**Descripción:**  
Imprimir lista en formato limpio o exportar a PDF para llevar al supermercado sin teléfono.

**Librerías:**
- `react-to-print` - Impresión optimizada
- `jspdf` + `jspdf-autotable` - Generación PDF

**Componentes:**
- `PrintableList.tsx` - Template optimizado para impresión
- `ExportMenu.tsx` - Menú con opciones de exportación

**Formatos:**
1. **Impresión directa:**
   - Layout limpio sin colores
   - Checkboxes para marcar
   - Agrupado por categorías
   - Footer con presupuesto total

2. **PDF:**
   - Logo de ListaGPT
   - Tabla con productos
   - Columnas: Producto | Cantidad | Precio | ☐
   - Total al final

**Funcionalidades:**
- ✅ Botón "Imprimir" en ResultsPage
- ✅ Botón "Exportar PDF"
- ✅ Opción: incluir/excluir precios
- ✅ Opción: incluir/excluir menús
- ✅ Diseño responsive para papel A4
- ✅ Toast notification al exportar

**Impacto:**  
Flexibilidad offline, usuarios sin smartphone

**Tiempo:** 3-4 horas

---

### 5. 📝 Notas por Producto

**Descripción:**  
Añadir notas personalizadas a productos ("Preferir marca X", "Si no hay, comprar Y", etc.)

**Componentes:**
- `ProductNoteInput.tsx` - Input para añadir nota
- `ProductNoteDisplay.tsx` - Display de nota existente

**Funcionalidades:**
- ✅ Icono 📝 junto a cada producto
- ✅ Click → abrir input inline o modal
- ✅ Guardar nota en localStorage con producto
- ✅ Display de nota bajo nombre de producto
- ✅ Límite: 100 caracteres
- ✅ Editar/eliminar nota
- ✅ Notas se mantienen al reordenar

**Estructura datos:**
```typescript
interface ProductNote {
  id_producto: number;
  note: string;
  created_at: string;
}

// En localStorage:
cart_notes_{userId} = ProductNote[]
```

**Impacto:**  
Personalización, recordatorios útiles

**Tiempo:** 2-3 horas

---

## 📦 Dependencias a Instalar

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install react-to-print jspdf jspdf-autotable
npm install --save-dev @types/jspdf
```

---

## 🏗️ Arquitectura

### Nuevos Hooks
1. `useDragAndDrop` - Gestión de drag & drop state
2. `useProductNotes` - CRUD de notas de productos
3. `usePrintableList` - Preparar datos para impresión

### Nuevos Componentes (11)
1. `QuantityControls.tsx`
2. `DraggableProductList.tsx`
3. `DraggableProductItem.tsx`
4. `WeeklyMenuCalendar.tsx`
5. `DayCard.tsx`
6. `MealTag.tsx`
7. `PrintableList.tsx`
8. `ExportMenu.tsx`
9. `ProductNoteInput.tsx`
10. `ProductNoteDisplay.tsx`
11. `PrintButton.tsx`

### Modificaciones
- `ResultsPage.tsx` - Integrar todos los nuevos componentes
- `src/types/cart.types.ts` - Añadir interfaces de notas

---

## 📐 Diseño UX

### ResultsPage Layout (Nuevo)

```
┌─────────────────────────────────────────────┐
│  [← Volver]  Lista: Compra Semanal          │
│  💰 Total: 45.50€                          │
│  [🖨️ Imprimir] [📥 PDF] [📅 Ver Menú]      │
├─────────────────────────────────────────────┤
│                                             │
│  📅 MENÚ SEMANAL (expandible)               │
│  ┌───┬───┬───┬───┬───┬───┬───┐            │
│  │Lun│Mar│Mie│Jue│Vie│Sab│Dom│            │
│  └───┴───┴───┴───┴───┴───┴───┘            │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  🥛 Lácteos y huevos (3 productos)          │
│  ┌──────────────────────────────────────┐  │
│  │ ⋮⋮ Leche Semidesnatada               │  │
│  │    1.19€ x 2 = 2.38€                 │  │
│  │    [−] 2 [+] 🗑️  📝                  │  │
│  │    💬 "Preferir marca Hacendado"      │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  🥩 Carnes (2 productos)                    │
│  ...                                        │
│                                             │
└─────────────────────────────────────────────┘
```

**Mejoras visuales:**
- Drag handle (⋮⋮) a la izquierda
- Controles inline (+/-) sin modal
- Notas en texto pequeño bajo producto
- Agrupación por categorías colapsables
- Calendario compacto arriba

---

## 🔄 Flujo de Implementación

### Fase 1: Edición Inline (Day 1-2)
1. Crear `QuantityControls.tsx`
2. Integrar en `ResultsPage.tsx`
3. Testing de incremento/decremento
4. Animaciones y feedback

### Fase 2: Drag & Drop (Day 3-5)
1. Instalar `@dnd-kit`
2. Crear componentes draggables
3. Implementar persistencia de orden
4. Testing de reordenamiento

### Fase 3: Menú Semanal (Day 6-8)
1. Crear `WeeklyMenuCalendar.tsx`
2. Parsear datos de `resultado.menus`
3. Vista expandible/colapsable
4. Resaltar productos relacionados

### Fase 4: Impresión/PDF (Day 9-10)
1. Instalar librerías
2. Crear `PrintableList.tsx`
3. Implementar generación PDF
4. Testing de formatos

### Fase 5: Notas (Day 11-12)
1. Crear hook `useProductNotes`
2. Componentes de input/display
3. Persistencia en localStorage
4. Integración en lista

### Fase 6: Testing & Polish (Day 13-14)
1. Testing completo de todas las features
2. Ajustes de UI/UX
3. Performance optimization
4. Deploy

---

## 🎨 Paleta de Colores (Mantener coherencia)

```css
/* Drag & Drop */
--drag-handle: #9CA3AF;
--drag-active: #3B82F6;
--drop-zone: #DBEAFE;

/* Botones +/- */
--increment: #10B981;
--decrement: #EF4444;
--delete: #F87171;

/* Menú Semanal */
--day-bg: #F3F4F6;
--meal-comida: #F59E0B;
--meal-cena: #8B5CF6;
--meal-desayuno: #EC4899;

/* Impresión */
--print-border: #D1D5DB;
--print-text: #374151;
```

---

## 📊 Métricas de Éxito

### KPIs Esperados
- 📉 **70% reducción** en clics para editar cantidades
- 🎯 **80% usuarios** reordenan lista al menos 1 vez
- 📅 **60% usuarios** abren menú semanal
- 🖨️ **30% usuarios** exportan/imprimen lista
- 📝 **40% usuarios** añaden al menos 1 nota

### Métricas Técnicas
- ⚡ Drag & Drop: < 16ms latencia
- 📄 PDF: < 2s generación
- 💾 Notas: < 50KB por usuario en localStorage

---

## 🐛 Riesgos Identificados

### Alto Riesgo
1. **Drag & Drop en móvil:** Touch events pueden ser complicados
   - **Mitigación:** `@dnd-kit` tiene soporte táctil nativo

2. **PDF muy grande:** Listas con 100+ productos
   - **Mitigación:** Paginar PDF automáticamente

### Medio Riesgo
3. **Impresión inconsistente:** Diferentes navegadores
   - **Mitigación:** Testing en Chrome, Firefox, Safari

4. **Notas excesivas:** localStorage limitado (5-10MB)
   - **Mitigación:** Límite de caracteres + cleanup antiguo

---

## 🔗 Dependencias con Otros Sprints

### De Sprint 3:
- ✅ `useCart` (edición de cantidades)
- ✅ Dark mode (aplicar a nuevos componentes)
- ✅ Favoritos (integrar en drag & drop)

### Para Sprint 5:
- [ ] Notas sincronizadas en BD (actualmente solo localStorage)
- [ ] Compartir con orden personalizado
- [ ] Plantillas de listas con orden guardado

---

## 📝 Checklist Pre-Sprint

- [x] ✅ Sprint 3 completado y desplegado
- [x] ✅ Plan detallado aprobado
- [ ] ⏳ Dependencias instaladas
- [ ] ⏳ Estructuras de datos definidas
- [ ] ⏳ Diseño de UI validado

---

## 📚 Referencias Técnicas

### @dnd-kit Documentation
- https://docs.dndkit.com/
- https://docs.dndkit.com/presets/sortable

### react-to-print
- https://github.com/gregnb/react-to-print

### jsPDF
- https://github.com/parallax/jsPDF
- https://github.com/simonbengtsson/jsPDF-AutoTable

---

## 🎯 Objetivo Final

Al finalizar Sprint 4, el usuario podrá:

1. ✨ Ajustar cantidades con **1 clic** (botones +/-)
2. 🎯 Organizar su lista **arrastrando** productos
3. 📅 Ver su **menú semanal** en calendario
4. 🖨️ **Imprimir** o exportar lista a PDF
5. 📝 Añadir **notas personalizadas** a productos

**Resultado:** Experiencia de edición de listas **70% más rápida** y **50% más organizada**

---

**Estado:** 📋 PLANIFICADO - Listo para implementación  
**Próximo paso:** Instalar dependencias e iniciar Fase 1 (Edición Inline)

