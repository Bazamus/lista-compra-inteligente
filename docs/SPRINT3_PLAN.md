# 🎯 Sprint 3: Plan Estratégico

**Fecha de Planificación:** 23 de octubre de 2025  
**Sprints Completados:** Sprint 1 (Compartir Listas), Sprint 2 (Gestión Avanzada de Historial)  
**Estado del Proyecto:** ~87% completado

---

## 📊 Contexto del Proyecto

### Sprints Anteriores
- ✅ **Sprint 1:** Compartir Listas (QR codes, enlaces públicos, API routes)
- ✅ **Sprint 2:** Gestión Avanzada de Historial (filtros, duplicación, vista previa)

### Deuda Técnica Documentada
- ⚠️ **CRÍTICA:** RLS deshabilitado en tabla `list_shares` (seguridad)
- ⚠️ **ALTA:** Sin monitorización (Sentry o similar)
- ⚠️ **ALTA:** Sin tests automatizados
- ⚠️ **MEDIA:** Cache de API OpenAI (costos)
- ⚠️ **MEDIA:** Performance en fetchProfile (timeout 10s)

### Estado del Usuario
- **Usuarios:** Muy pocos (< 10) - Fase de desarrollo
- **Prioridad:** Features visibles para mostrar progreso
- **Monitorización:** Alternativas simples (no Sentry aún)

---

## 🎯 Opciones para Sprint 3

He analizado la guía estratégica y tu contexto. Aquí están las **3 mejores opciones**:

---

## Opción A: Mejorar UX de Resultados y Menús 🎨
**Duración:** 1.5-2 semanas (18-24 horas)  
**Tipo:** Feature visible - Alta satisfacción de usuario

### ✨ Funcionalidades

#### 1. Edición Inline de Cantidades (FASE 1)
- **Objetivo:** Editar cantidades sin modal
- **Implementación:**
  - Input inline en cada producto
  - Botones +/- para incrementar/decrementar
  - Actualización automática de presupuesto
  - Animaciones suaves
  
**Impacto UX:** 70% más rápido para ajustar cantidades

#### 2. Drag & Drop para Reordenar Productos (FASE 1)
- **Objetivo:** Organizar productos por orden de compra
- **Implementación:**
  - React DnD o dnd-kit
  - Agrupar por categorías
  - Arrastrar entre categorías
  - Guardar orden personalizado
  
**Impacto UX:** Lista organizada como en el supermercado

#### 3. Menú Semanal Visual Mejorado (FASE 2)
- **Objetivo:** Vista calendario del menú semanal
- **Implementación:**
  - Grid semanal (7 días x 3 comidas)
  - Cards visuales por comida
  - Edición inline de platos
  - Vincular platos con productos
  
**Impacto UX:** Planificación visual más intuitiva

#### 4. Impresión/Exportación de Lista (FASE 2)
- **Objetivo:** Llevar lista impresa al supermercado
- **Implementación:**
  - Vista de impresión optimizada
  - Exportar a PDF
  - Exportar a texto plano
  - Checkbox para marcar productos comprados
  
**Impacto UX:** Facilita compra física

#### 5. Notas por Producto (FASE 3)
- **Objetivo:** Añadir notas/comentarios a productos
- **Implementación:**
  - Campo de notas opcional
  - Mostrar en vista de lista
  - Incluir en impresión
  
**Impacto UX:** Mayor personalización

---

### 📦 Componentes a Crear/Modificar

**Nuevos:**
- `InlineQuantityEditor.tsx` - Editor inline con +/-
- `DraggableProductList.tsx` - Lista con drag & drop
- `MenuCalendarView.tsx` - Vista calendario de menús
- `PrintableList.tsx` - Vista optimizada para impresión
- `ExportMenu.tsx` - Modal para exportar
- `ProductNotes.tsx` - Editor de notas

**Modificados:**
- `ResultsPage.tsx` - Integrar nuevos componentes
- `ProductCard.tsx` - Añadir drag handle y notas
- `MenuSection.tsx` - Vista mejorada de menús

### 🔧 Dependencias Nuevas
```json
{
  "@dnd-kit/core": "^6.1.0",
  "@dnd-kit/sortable": "^8.0.0",
  "react-to-print": "^2.15.1",
  "jspdf": "^2.5.2"
}
```

### ✅ Ventajas
- ✨ Features MUY visibles para usuarios
- 🚀 Mejora significativa de UX
- 📊 Fácil de demostrar a stakeholders
- 💪 No requiere cambios en BD
- ⚡ Rápido de implementar

### ⚠️ Desventajas
- No resuelve deuda técnica
- No mejora seguridad (RLS)
- No añade monitorización

---

## Opción B: Resolver Deuda Técnica Crítica 🔧
**Duración:** 1 semana (12-14 horas)  
**Tipo:** Fundamentos - Preparar para escalado

### 🛠️ Tareas

#### 1. Resolver RLS en `list_shares` (CRÍTICA) ⚠️
- **Problema:** Tabla expuesta sin seguridad
- **Solución:**
  - Habilitar RLS
  - Aplicar políticas correctas
  - Testing exhaustivo
  - Documentar políticas
  
**Tiempo:** 2-3 horas  
**Prioridad:** CRÍTICA

#### 2. Implementar Logging Simple (ALTA)
- **Problema:** Sin visibilidad de errores
- **Solución:**
  - Winston o Pino para logging
  - Logs estructurados
  - Niveles: error, warn, info, debug
  - Escribir a archivo + consola
  
**Tiempo:** 3-4 horas  
**Prioridad:** ALTA

#### 3. Cache de API OpenAI (MEDIA)
- **Problema:** Costos elevados por llamadas repetidas
- **Solución:**
  - Redis o cache en memoria (node-cache)
  - Cache por parámetros de consulta
  - TTL de 24 horas
  - Invalidación manual si necesario
  
**Tiempo:** 4-5 horas  
**Prioridad:** MEDIA

#### 4. Optimizar fetchProfile (MEDIA)
- **Problema:** Timeout de 10s, múltiples llamadas
- **Solución:**
  - Implementar debounce
  - Cache de perfil en memoria
  - Reducir timeout a 5s
  - Índice en BD si no existe
  
**Tiempo:** 2-3 horas  
**Prioridad:** MEDIA

#### 5. Tests Básicos (BAJA para MVP)
- **Implementación:**
  - Vitest setup
  - Tests unitarios para hooks críticos
  - Tests de componentes clave
  
**Tiempo:** 3-4 horas  
**Prioridad:** BAJA (para MVP)

---

### ✅ Ventajas
- 🔒 Mejora seguridad (RLS)
- 💰 Reduce costos (cache OpenAI)
- 🐛 Facilita debugging (logging)
- ⚡ Mejora performance (fetchProfile)
- 🏗️ Prepara para escalado

### ⚠️ Desventajas
- No visible para usuarios finales
- No "wow factor" para demos
- Más técnico, menos "vendible"

---

## Opción C: Quick Wins - Mejoras Pequeñas Múltiples 🎁
**Duración:** 1 semana (10-12 horas)  
**Tipo:** Mejoras incrementales visibles

### 🎯 Mejoras

#### 1. Favoritos de Productos (FASE 3.1)
- Marcar productos como favoritos
- Sección "Mis Favoritos" en catálogo
- Añadir rápido desde favoritos
  
**Tiempo:** 2-3 horas

#### 2. Productos Recurrentes (FASE 3.2)
- Detectar productos que siempre compras
- Sugerencias al crear nueva lista
- Badge "Compras seguido"
  
**Tiempo:** 3-4 horas

#### 3. Modo Compra (Checklist) (FASE 2)
- Toggle para vista de "compra"
- Checkbox para marcar comprado
- Progreso visual (X de Y comprados)
- Confetti al completar 🎉
  
**Tiempo:** 3-4 horas

#### 4. Búsqueda Mejorada en Catálogo (FASE 3)
- Fuzzy search (ya existe, mejorar)
- Búsqueda por categoría
- Filtros de precio
- Ordenar por relevancia
  
**Tiempo:** 2-3 horas

#### 5. Dark Mode Persistente (UX)
- Guardar preferencia en localStorage
- Toggle visible en header
- Transición suave
  
**Tiempo:** 1-2 horas

---

### ✅ Ventajas
- ✨ Múltiples mejoras visibles
- 🎯 Cada una es independiente
- 🚀 Progreso rápido y constante
- 💪 Flexibilidad (priorizar sobre la marcha)
- 🎉 Sensación de "muchas mejoras"

### ⚠️ Desventajas
- Menor impacto individual
- No resuelve deuda técnica crítica
- Puede parecer "parches" vs features grandes

---

## 🎯 Recomendación Basada en Tu Contexto

Considerando que:
- Tienes **muy pocos usuarios** (< 10)
- Estás en **fase de desarrollo**
- Quieres **features visibles**
- No tienes urgencia de monitorización compleja
- Prefieres **mostrar progreso rápido**

### Mi Recomendación: **Opción A + Resolver RLS** (Híbrida)

**Sprint 3: UX de Resultados + Seguridad Crítica**  
**Duración:** 1.5-2 semanas (20-26 horas)

**Fase 1 (1 semana):**
1. ⚠️ **Resolver RLS en `list_shares`** (2-3h) - CRÍTICO para seguridad
2. ✨ **Edición inline de cantidades** (4-5h) - UX mejorada
3. ✨ **Modo Compra con checklist** (3-4h) - Feature visible
4. 📋 **Impresión/Exportación básica** (3-4h) - Utilidad práctica

**Fase 2 (opcional, semana siguiente):**
5. 🎨 **Drag & Drop para reordenar** (5-6h) - UX avanzada
6. 📅 **Menú semanal visual mejorado** (6-7h) - Feature "wow"

### ¿Por qué esta combinación?
- ✅ Resuelve el problema de seguridad CRÍTICO (RLS)
- ✅ Añade 3-4 features MUY visibles para usuarios
- ✅ Mejora UX de forma significativa
- ✅ Mantiene momentum de desarrollo visible
- ✅ Prepara para más usuarios (RLS resuelto)

---

## 📋 Decisión Necesaria

**¿Qué opción prefieres para Sprint 3?**

### A) Opción A: UX de Resultados y Menús (pura)
- Enfoque 100% en mejoras visibles de UX
- Drag & drop, edición inline, menú visual, impresión
- RLS queda como deuda técnica

### B) Opción B: Deuda Técnica (pura)
- Resolver RLS, logging, cache OpenAI, optimizar fetchProfile
- Fundamentos técnicos sólidos
- Sin features visibles

### C) Opción C: Quick Wins Múltiples
- Favoritos, recurrentes, modo compra, búsqueda mejorada
- Muchas mejoras pequeñas
- Progreso constante

### D) Opción A + RLS (Híbrida - MI RECOMENDACIÓN)
- **Fase 1:** RLS + Edición inline + Modo compra + Impresión
- **Fase 2 (opcional):** Drag & drop + Menú visual
- Mejor de ambos mundos

---

## 🚀 Siguiente Paso

Una vez que elijas la opción, procederé a:

1. ✅ Crear documento detallado del sprint
2. ✅ Definir componentes y arquitectura
3. ✅ Listar dependencias necesarias
4. ✅ Crear TODOs y empezar implementación

**¿Qué opción eliges: A, B, C, o D (recomendada)?**

---

**Última actualización:** 23 de octubre de 2025  
**Versión:** 1.0

