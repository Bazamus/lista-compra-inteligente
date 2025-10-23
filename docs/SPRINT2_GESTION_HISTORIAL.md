# Sprint 2: Gestión Avanzada de Historial - Plan de Implementación

**Fecha inicio:** 2025-10-23  
**Duración estimada:** 1-2 semanas  
**Objetivo:** Mejorar HistoryPage con filtros, edición directa, duplicación y vista previa

---

## 🎯 Objetivos del Sprint

### Funcionalidades Principales

1. **Editar Lista Directamente** ✏️
   - Abrir lista desde historial en modo edición
   - Modificar productos, cantidades, precios
   - Guardar cambios sin crear nueva lista

2. **Duplicar Lista** 📋
   - Crear copia exacta de lista existente
   - Útil para listas recurrentes (semanal, mensual)
   - Opción de renombrar al duplicar

3. **Filtros Avanzados** 🔍
   - Por tipo: IA / Manual / Todos
   - Por rango de fecha: Hoy, Esta semana, Este mes, Personalizado
   - Por rango de presupuesto: < 20€, 20-50€, 50-100€, > 100€
   - Por número de productos: Pocos (1-10), Medio (11-30), Muchos (30+)

4. **Ordenamiento** 📊
   - Más reciente (default)
   - Más antigua
   - Mayor presupuesto
   - Menor presupuesto
   - Más productos
   - Menos productos

5. **Vista Previa Rápida** 👁️
   - Hover sobre card muestra tooltip con productos principales
   - Modal rápido con resumen sin navegar
   - Mostrar primeros 5 productos + "y X más"

6. **Acciones Rápidas** ⚡
   - Menú contextual (3 puntos)
   - Editar / Duplicar / Compartir / Eliminar
   - Confirmación para eliminar

---

## 📋 Plan de Implementación

### Fase 1: Backend y Lógica (Días 1-3)

#### Día 1: Actualizar useListHistory Hook

**Archivo:** `src/hooks/useListHistory.ts`

**Nuevas funciones a añadir:**

```typescript
// Duplicar lista
const duplicateList = async (listaId: string, nuevoNombre?: string): Promise<string>

// Editar lista existente (ya existe updateListInDB, mejorar)
const editList = async (listaId: string, cambios: Partial<SavedList>): Promise<void>

// Filtrar listas
const filterLists = (
  lists: SavedList[], 
  filters: ListFilters
): SavedList[]

// Ordenar listas
const sortLists = (
  lists: SavedList[], 
  sortBy: SortOption
): SavedList[]
```

**Tipos a añadir:**

```typescript
interface ListFilters {
  tipo?: 'IA' | 'Manual' | null;
  fechaInicio?: Date;
  fechaFin?: Date;
  presupuestoMin?: number;
  presupuestoMax?: number;
  productosMin?: number;
  productosMax?: number;
}

type SortOption = 
  | 'fecha_desc' 
  | 'fecha_asc' 
  | 'presupuesto_desc' 
  | 'presupuesto_asc'
  | 'productos_desc' 
  | 'productos_asc';
```

#### Día 2: Implementar Función de Duplicación

**Lógica:**
1. Obtener lista original por ID
2. Crear nueva lista con mismo contenido
3. Cambiar nombre (añadir " - Copia" o nombre personalizado)
4. Insertar en BD con nueva fecha
5. Refrescar lista de historial

**Consideraciones:**
- Preservar todos los productos
- Preservar menús si es lista IA
- Actualizar `created_at` a fecha actual
- NO copiar `id_lista` (generar nuevo)

#### Día 3: Implementar Funciones de Filtrado y Ordenamiento

**Filtrado (client-side):**
- Aplicar múltiples filtros simultáneamente (AND logic)
- Cache de resultados filtrados
- Animación suave al filtrar

**Ordenamiento (client-side):**
- Ordenar después de filtrar
- Mantener orden al actualizar
- Persistir preferencia en localStorage

---

### Fase 2: Frontend - Filtros y Ordenamiento (Días 4-5)

#### Día 4: Componente de Filtros

**Archivo nuevo:** `src/components/history/ListFilters.tsx`

**Diseño:**
```
┌─────────────────────────────────────────────┐
│ 🔍 Filtrar listas                           │
├─────────────────────────────────────────────┤
│ Tipo: [Todos ▼] [IA] [Manual]              │
│ Fecha: [Esta semana ▼]                      │
│ Presupuesto: €[__] - €[__]                 │
│ Productos: [__] - [__]                      │
│                                              │
│ [Limpiar filtros]  [Aplicar]               │
└─────────────────────────────────────────────┘
```

**Features:**
- Diseño tipo accordion (colapsable)
- Botones de preset para filtros comunes
- Contador de listas filtradas: "Mostrando 15 de 42 listas"
- Animación al abrir/cerrar

#### Día 5: Componente de Ordenamiento

**Archivo:** Integrar en `src/pages/HistoryPage.tsx`

**Diseño:**
```
┌────────────────────────────────────┐
│ Ordenar por: [Más reciente ▼]     │
└────────────────────────────────────┘
  ↓
┌────────────────────────────────────┐
│ • Más reciente                     │
│ • Más antigua                       │
│ • Mayor presupuesto                 │
│ • Menor presupuesto                 │
│ • Más productos                     │
│ • Menos productos                   │
└────────────────────────────────────┘
```

**Features:**
- Dropdown elegante
- Íconos para cada opción
- Transición suave al reordenar

---

### Fase 3: Frontend - Acciones Avanzadas (Días 6-8)

#### Día 6: Botón Duplicar y Lógica

**Ubicación:** `ListHistoryCard.tsx`

**Flujo:**
1. Click en "Duplicar"
2. Modal pregunta: "¿Nombre para la copia?"
3. Input con valor default: "[Nombre Original] - Copia"
4. Confirmar → Duplicar
5. Toast: "Lista duplicada correctamente"
6. Scroll automático a la nueva lista

**Componente nuevo:** `src/components/history/DuplicateListModal.tsx`

#### Día 7: Botón Editar desde Historial

**Flujo:**
1. Click en "Editar"
2. Navegar a `/results` con lista cargada
3. Modo edición activado
4. Usuario modifica productos
5. Al guardar, actualiza lista existente (NO crea nueva)

**Cambios necesarios:**
- `ResultsPage.tsx`: Detectar si viene de edición
- Pasar `editMode={true}` como prop
- Mostrar banner: "Editando lista guardada"

#### Día 8: Vista Previa Rápida

**Componente nuevo:** `src/components/history/QuickPreviewModal.tsx`

**Trigger:**
- Hover sobre card → Tooltip con 3 productos
- Click en ícono "ojo" → Modal completo

**Contenido del modal:**
```
┌────────────────────────────────────────┐
│ 📋 Lista_Manual               [✕]      │
├────────────────────────────────────────┤
│ 🛒 15 productos • 👥 2 personas        │
│ 📅 7 días • 💰 45.50€                 │
├────────────────────────────────────────┤
│ Productos principales:                  │
│ • Leche (2 ud) - 2.50€                 │
│ • Pan (3 ud) - 3.00€                   │
│ • Huevos (1 docena) - 2.80€            │
│ • Pollo (500g) - 5.50€                 │
│ • Arroz (1kg) - 1.90€                  │
│                                         │
│ ... y 10 productos más                 │
├────────────────────────────────────────┤
│ [Ver lista completa] [Duplicar]        │
└────────────────────────────────────────┘
```

---

### Fase 4: Mejoras UX y Animaciones (Días 9-10)

#### Día 9: Animaciones con Framer Motion

**Animaciones a añadir:**
1. Filtrado: Cards se reorganizan suavemente
2. Ordenamiento: Transición fluida de posiciones
3. Eliminación: Card desaparece con fade out
4. Duplicación: Nueva card aparece con slide in
5. Hover: Elevación suave de card

**Código ejemplo:**
```typescript
<motion.div
  layout
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.9 }}
  transition={{ duration: 0.3 }}
>
  <ListHistoryCard ... />
</motion.div>
```

#### Día 10: Responsive y Mobile

**Adaptaciones móviles:**
- Filtros en modal bottom sheet (mobile)
- Cards en una sola columna
- Acciones en menú hamburguesa
- Vista previa en modal fullscreen

---

### Fase 5: Testing y Documentación (Días 11-12)

#### Día 11: Testing Manual Completo

**Checklist:**
- [ ] Duplicar lista cambia nombre correctamente
- [ ] Editar lista actualiza sin duplicar
- [ ] Filtros se aplican correctamente
- [ ] Ordenamiento funciona en todas opciones
- [ ] Vista previa muestra datos correctos
- [ ] Animaciones son fluidas (60fps)
- [ ] Mobile responsive funciona
- [ ] Listas vacías muestran mensaje apropiado
- [ ] Eliminar requiere confirmación
- [ ] Toast notifications son claras

#### Día 12: Documentación y Deploy

**Documentación a crear:**
- Actualizar `SPRINT2_GESTION_HISTORIAL.md` con resultados
- Screenshots de nuevas features
- GIF demostrativo del flujo completo

**Deploy:**
- Commit y push
- Verificar en Vercel
- Testing en producción

---

## 🎨 Diseño UI/UX

### Mockup de HistoryPage Mejorada

```
┌──────────────────────────────────────────────────────┐
│ 🕒 Mis Listas Guardadas                    [Inicio] │
│ 42 listas guardadas                                  │
├──────────────────────────────────────────────────────┤
│                                                       │
│ [🔍 Buscar...]  [Filtros ▼]  [Ordenar: Reciente ▼] │
│                                                       │
│ Mostrando 15 de 42 listas                           │
│                                                       │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│ │📋 Lista_IA   │  │📝 Lista_Man  │  │📋 Compra_Sem││
│ │🤖 IA         │  │✍️ Manual     │  │🤖 IA        ││
│ │👥 4 • 📅 7d  │  │👥 2 • 📅 3d  │  │👥 1 • 📅 14d││
│ │💰 89.50€     │  │💰 23.40€     │  │💰 45.00€    ││
│ │              │  │              │  │             ││
│ │[👁️][📋][✏️][🗑️]│  │[👁️][📋][✏️][🗑️]│  │[👁️][📋][✏️][🗑️]││
│ └──────────────┘  └──────────────┘  └──────────────┘│
│                                                       │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│ │...           │  │...           │  │...          ││
│ └──────────────┘  └──────────────┘  └──────────────┘│
└──────────────────────────────────────────────────────┘

Leyenda:
👁️ = Vista previa rápida
📋 = Duplicar
✏️ = Editar
🗑️ = Eliminar
```

---

## 📊 Métricas de Éxito

**Objetivos Sprint 2:**
- ✅ 80% de usuarios usan filtros al menos una vez
- ✅ 50% de usuarios duplican al menos una lista
- ✅ Tiempo para encontrar lista disminuye 60%
- ✅ 90% de ediciones actualizan (no duplican)

**KPIs a medir:**
- Uso de cada filtro (analytics)
- Número de duplicaciones por usuario
- Clicks en vista previa
- Tiempo promedio en HistoryPage

---

## 🚀 Quick Start

### Orden de Implementación Recomendado

1. ✅ Crear estructura de tipos (30 min)
2. ✅ Implementar `duplicateList` en hook (2h)
3. ✅ Implementar filtrado client-side (2h)
4. ✅ Implementar ordenamiento client-side (1h)
5. ✅ Crear `ListFilters.tsx` component (3h)
6. ✅ Crear `DuplicateListModal.tsx` (2h)
7. ✅ Integrar edición desde historial (3h)
8. ✅ Crear `QuickPreviewModal.tsx` (3h)
9. ✅ Añadir animaciones (2h)
10. ✅ Testing y fixes (4h)

**Total estimado:** 22 horas → 3-4 días de trabajo efectivo

---

## 📝 Notas Importantes

### Decisiones de Diseño

1. **Filtrado client-side vs server-side:**
   - Cliente: Rápido, sin latencia, suficiente para < 1000 listas
   - Servidor: Necesario cuando > 1000 listas por usuario

2. **Persistencia de filtros:**
   - Guardar en `localStorage`
   - Restaurar al volver a HistoryPage

3. **Duplicación:**
   - Siempre crear nueva lista (no sobrescribir)
   - Preservar todo el contenido exacto

4. **Edición:**
   - Actualizar lista existente (mismo `id_lista`)
   - Mostrar banner indicando modo edición

---

**Estado:** Listo para implementación  
**Próximo paso:** Iniciar con tipos y hook actualizado

