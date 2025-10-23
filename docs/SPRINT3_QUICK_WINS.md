# 🎁 Sprint 3: Quick Wins Múltiples

**Fecha de Inicio:** 23 de octubre de 2025  
**Duración:** 1 semana (10-12 horas efectivas)  
**Enfoque:** Mejoras pequeñas con alto impacto visible  
**Estado:** 🚀 EN DESARROLLO

---

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Features a Implementar](#features-a-implementar)
3. [Arquitectura y Componentes](#arquitectura-y-componentes)
4. [Plan de Implementación](#plan-de-implementación)
5. [Testing](#testing)
6. [Métricas de Éxito](#métricas-de-éxito)

---

## 🎯 Resumen Ejecutivo

### Objetivo
Implementar **5 mejoras incrementales** que sean individualmente pequeñas pero que en conjunto generen una sensación de "muchas mejoras" y progreso constante.

### Características Principales
- ✅ Cada feature es **independiente** (se puede hacer en cualquier orden)
- ✅ Todas son **visibles** para el usuario
- ✅ **Alto impacto** en satisfacción de usuario
- ✅ **Bajo riesgo** técnico
- ✅ **Rápidas** de implementar

---

## ✨ Features a Implementar

### 1. ⭐ Favoritos de Productos
**Duración:** 2-3 horas  
**Prioridad:** ALTA

**Funcionalidad:**
- Usuario puede marcar productos como favoritos con ⭐
- Sección "Mis Favoritos" en página de catálogo
- Persistencia en BD (para usuarios autenticados) y localStorage (demo)
- Contador de favoritos en header
- Añadir producto desde favoritos con 1 clic

**Flujo UX:**
1. Usuario ve producto en catálogo
2. Click en icono ⭐ (outline → filled con animación)
3. Toast: "Añadido a favoritos"
4. En tab "Mis Favoritos" del catálogo, ver todos los favoritos
5. Botón "Añadir a lista" más prominente

**Impacto:** Acceso rápido a productos que siempre compras

---

### 2. 🔄 Productos Recurrentes
**Duración:** 3-4 horas  
**Prioridad:** ALTA

**Funcionalidad:**
- Sistema detecta automáticamente productos que aparecen en múltiples listas
- Badge "Compras seguido" en productos recurrentes
- Al crear nueva lista, sugerir productos recurrentes
- Sección "Tus Básicos" en catálogo con productos recurrentes

**Lógica de Detección:**
- Producto aparece en 3+ de las últimas 5 listas → recurrente
- Se actualiza cada vez que se guarda una lista
- Se almacena en perfil de usuario

**Flujo UX:**
1. Usuario crea varias listas con leche, pan, huevos
2. Sistema detecta que son recurrentes
3. Al crear nueva lista, muestra sugerencia: "¿Añadir tus básicos? (3 productos)"
4. Usuario acepta → se añaden automáticamente
5. Ahorra tiempo en cada lista nueva

**Impacto:** 40-50% menos tiempo creando listas nuevas

---

### 3. ✅ Modo Compra (Checklist con Confetti)
**Duración:** 3-4 horas  
**Prioridad:** ALTA

**Funcionalidad:**
- Toggle "Modo Compra" en ResultsPage
- Vista optimizada para comprar en supermercado
- Checkbox grande junto a cada producto
- Barra de progreso visual (X de Y comprados)
- Productos comprados se mueven al final y se tachan
- **Confetti animado 🎉 al completar todos**

**Flujo UX:**
1. Usuario abre lista guardada
2. Click en botón "Iniciar Compra" (🛒)
3. Vista cambia: checkboxes grandes, productos agrupados por categoría
4. Usuario va marcando productos mientras compra
5. Barra de progreso: "15/20 productos (75%)"
6. Al marcar el último → Confetti 🎉 + "¡Lista completada!"
7. Botón "Finalizar compra" guarda estado

**Detalles Técnicos:**
- Estado de compra se guarda en localStorage (temporal)
- Se puede pausar y continuar después
- Opción de resetear progreso

**Impacto:** Experiencia gamificada, hace compras más divertidas

---

### 4. 🔍 Búsqueda Mejorada en Catálogo
**Duración:** 2-3 horas  
**Prioridad:** MEDIA

**Funcionalidad:**
- Mejorar búsqueda fuzzy existente (ya funciona con Fuse.js)
- Añadir filtros visuales:
  - Por categoría (dropdown)
  - Por rango de precio (slider)
  - Por disponibilidad (en stock)
- Ordenar resultados:
  - Por relevancia (default)
  - Por precio: menor a mayor
  - Por precio: mayor a menor
  - Alfabético
- Chips de filtros activos (removibles)

**Flujo UX:**
1. Usuario busca "leche"
2. Muestra resultados fuzzy (ya funciona)
3. Puede filtrar por categoría: "Lácteos"
4. Puede filtrar por precio: 1€ - 3€
5. Chips visibles: "Lácteos" [x], "1€-3€" [x]
6. Click en [x] quita el filtro

**Impacto:** Encontrar productos 60% más rápido

---

### 5. 🌙 Dark Mode Persistente
**Duración:** 1-2 horas  
**Prioridad:** BAJA (pero fácil)

**Funcionalidad:**
- Guardar preferencia de dark mode en localStorage
- Toggle visible en header/navbar
- Transición suave entre modos
- Respetar preferencia del sistema como default

**Flujo UX:**
1. Usuario hace clic en icono 🌙/☀️ en header
2. Modo cambia con animación suave
3. Preferencia se guarda automáticamente
4. Al volver, se carga su preferencia guardada

**Detalles Técnicos:**
- Ya existe soporte de dark mode en Tailwind
- Solo falta: persistencia + toggle UI

**Impacto:** Comodidad, especialmente para uso nocturno

---

## 🏗️ Arquitectura y Componentes

### Nuevos Hooks

#### `useFavorites.ts`
```typescript
export const useFavorites = () => {
  const [favorites, setFavorites] = useState<number[]>([])
  
  const toggleFavorite = (productId: number) => { }
  const isFavorite = (productId: number) => boolean
  const getFavorites = () => Product[]
  
  return { favorites, toggleFavorite, isFavorite, getFavorites }
}
```

#### `useRecurrentProducts.ts`
```typescript
export const useRecurrentProducts = () => {
  const [recurrentProducts, setRecurrentProducts] = useState<number[]>([])
  
  const detectRecurrent = () => { }
  const getRecurrent = () => Product[]
  const suggestRecurrent = () => Product[]
  
  return { recurrentProducts, detectRecurrent, getRecurrent, suggestRecurrent }
}
```

#### `useShoppingMode.ts`
```typescript
export const useShoppingMode = () => {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set())
  const [isComplete, setIsComplete] = useState(false)
  
  const toggleCheck = (productId: number) => { }
  const getProgress = () => { completed: number, total: number, percentage: number }
  const reset = () => { }
  
  return { checkedItems, toggleCheck, getProgress, reset, isComplete }
}
```

#### `useDarkMode.ts`
```typescript
export const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false)
  
  const toggle = () => { }
  const enable = () => { }
  const disable = () => { }
  
  return { isDark, toggle, enable, disable }
}
```

---

### Nuevos Componentes

#### `FavoriteButton.tsx`
- Botón estrella (outline/filled)
- Animación al toggle
- Toast feedback

#### `FavoritesTab.tsx`
- Tab en CatalogPage
- Grid de productos favoritos
- Botón "Añadir a lista" prominente

#### `RecurrentSuggestion.tsx`
- Banner de sugerencia
- Lista de productos recurrentes
- Botón "Añadir todos"

#### `ShoppingModeView.tsx`
- Vista optimizada para compra
- Checkboxes grandes
- Barra de progreso
- Confetti component

#### `ProgressBar.tsx`
- Barra visual de progreso
- Porcentaje y contador
- Animación smooth

#### `ConfettiCelebration.tsx`
- Animación de confetti
- Triggered al completar
- Auto-dismiss después de 3s

#### `SearchFilters.tsx`
- Filtros visuales (categoría, precio)
- Chips de filtros activos
- Dropdown de ordenamiento

#### `DarkModeToggle.tsx`
- Toggle switch 🌙/☀️
- Animación de transición
- Tooltip explicativo

---

### Modificaciones en Componentes Existentes

#### `CatalogPage.tsx`
- Añadir `FavoritesTab`
- Integrar `SearchFilters`
- Añadir `RecurrentSuggestion` al inicio

#### `ProductCard.tsx`
- Añadir `FavoriteButton` en esquina
- Mostrar badge "Compras seguido" si aplica

#### `ResultsPage.tsx`
- Añadir botón "Modo Compra"
- Toggle entre vista normal y `ShoppingModeView`

#### `Header.tsx` / `Navbar.tsx`
- Añadir `DarkModeToggle`
- Añadir contador de favoritos (opcional)

---

## 📅 Plan de Implementación

### Día 1-2: Favoritos (2-3h)
- [x] Crear hook `useFavorites`
- [x] Crear componente `FavoriteButton`
- [x] Crear componente `FavoritesTab`
- [x] Integrar en `CatalogPage`
- [x] Integrar en `ProductCard`
- [x] Testing básico

### Día 3-4: Productos Recurrentes (3-4h)
- [ ] Crear hook `useRecurrentProducts`
- [ ] Lógica de detección en `useListHistory`
- [ ] Crear componente `RecurrentSuggestion`
- [ ] Integrar en `CatalogPage`
- [ ] Badge en `ProductCard`
- [ ] Testing básico

### Día 5: Modo Compra (3-4h)
- [ ] Crear hook `useShoppingMode`
- [ ] Crear componente `ShoppingModeView`
- [ ] Crear componente `ProgressBar`
- [ ] Crear componente `ConfettiCelebration`
- [ ] Integrar en `ResultsPage`
- [ ] Testing básico

### Día 6: Búsqueda Mejorada (2-3h)
- [ ] Crear componente `SearchFilters`
- [ ] Implementar filtros de categoría y precio
- [ ] Implementar ordenamiento
- [ ] Chips de filtros activos
- [ ] Integrar en `CatalogPage`
- [ ] Testing básico

### Día 7: Dark Mode + Testing Final (1-2h + 1h)
- [ ] Crear hook `useDarkMode`
- [ ] Crear componente `DarkModeToggle`
- [ ] Integrar en `Header`
- [ ] Testing completo de todas las features
- [ ] Documentación de testing

---

## 🧪 Testing

### Test Cases por Feature

#### Favoritos (8 casos)
1. Marcar producto como favorito
2. Desmarcar favorito
3. Ver lista de favoritos
4. Añadir desde favoritos a lista
5. Favoritos persisten en reload
6. Favoritos en modo demo (localStorage)
7. Favoritos en modo autenticado (BD)
8. Animación de toggle

#### Recurrentes (6 casos)
1. Detección automática de recurrentes
2. Badge "Compras seguido" visible
3. Sugerencia al crear nueva lista
4. Añadir todos los recurrentes
5. Actualización al guardar lista
6. Sección "Tus Básicos" en catálogo

#### Modo Compra (10 casos)
1. Activar modo compra
2. Marcar producto como comprado
3. Desmarcar producto
4. Barra de progreso actualiza
5. Productos comprados se tachan
6. Productos comprados al final
7. Confetti al completar todos
8. Pausar y continuar
9. Resetear progreso
10. Finalizar compra

#### Búsqueda Mejorada (7 casos)
1. Búsqueda fuzzy funciona
2. Filtrar por categoría
3. Filtrar por precio
4. Ordenar por precio
5. Chips de filtros visibles
6. Remover filtros con [x]
7. Combinar múltiples filtros

#### Dark Mode (4 casos)
1. Toggle entre modos
2. Persistencia en reload
3. Transición suave
4. Default según sistema

**Total:** 35 test cases

---

## 📦 Dependencias Nuevas

```json
{
  "canvas-confetti": "^1.9.3",
  "react-use": "^17.5.1"
}
```

---

## 📈 Métricas de Éxito

### KPIs por Feature

#### Favoritos
- **Métrica:** % de usuarios que marcan favoritos
- **Target:** > 40% de usuarios activos

#### Recurrentes
- **Métrica:** Tiempo promedio para crear lista
- **Target:** Reducción de 40-50%

#### Modo Compra
- **Métrica:** % de listas completadas con modo compra
- **Target:** > 30% de listas abiertas

#### Búsqueda Mejorada
- **Métrica:** Tiempo para encontrar producto
- **Target:** Reducción de 60%

#### Dark Mode
- **Métrica:** % de usuarios usando dark mode
- **Target:** > 25% de usuarios

---

## 🎯 Criterios de Aceptación

### Favoritos ⭐
- [x] Usuario puede marcar/desmarcar favoritos
- [x] Favoritos persisten en reload
- [x] Tab "Mis Favoritos" muestra todos los favoritos
- [x] Toast feedback en cada acción
- [x] Animación suave en toggle

### Recurrentes 🔄
- [ ] Sistema detecta productos recurrentes (3+ apariciones en 5 listas)
- [ ] Badge visible en productos recurrentes
- [ ] Sugerencia al crear nueva lista
- [ ] Botón "Añadir todos" funciona
- [ ] Sección "Tus Básicos" en catálogo

### Modo Compra ✅
- [ ] Toggle activa/desactiva modo compra
- [ ] Checkboxes marcan productos
- [ ] Barra de progreso muestra porcentaje correcto
- [ ] Productos comprados se tachan y mueven
- [ ] Confetti aparece al completar todos
- [ ] Puede pausar y continuar

### Búsqueda Mejorada 🔍
- [ ] Filtros de categoría funcionan
- [ ] Filtros de precio funcionan
- [ ] Ordenamiento funciona (4 opciones)
- [ ] Chips de filtros removibles
- [ ] Resultados se actualizan en tiempo real

### Dark Mode 🌙
- [ ] Toggle cambia entre modos
- [ ] Preferencia se guarda en localStorage
- [ ] Transición suave (no abrupta)
- [ ] Default respeta preferencia del sistema

---

## 🚀 Estado de Implementación

| Feature | Estado | Progreso | Tiempo |
|---------|--------|----------|--------|
| ⭐ Favoritos | 🚀 EN DESARROLLO | 0% | 0/3h |
| 🔄 Recurrentes | ⏳ PENDIENTE | 0% | 0/4h |
| ✅ Modo Compra | ⏳ PENDIENTE | 0% | 0/4h |
| 🔍 Búsqueda | ⏳ PENDIENTE | 0% | 0/3h |
| 🌙 Dark Mode | ⏳ PENDIENTE | 0% | 0/2h |

**Progreso Total:** 0% (0/16 horas)

---

## 📝 Notas de Desarrollo

### Priorización Flexible
- Cada feature es independiente
- Se puede cambiar el orden según necesidad
- Si una feature se complica, se puede posponer

### Quick Wins Philosophy
- Cada feature debe ser "shippable" individualmente
- No esperar a completar todas para hacer deploy
- Deploy incremental después de cada 2-3 features

---

**Última actualización:** 23 de octubre de 2025  
**Próximo Sprint:** Sprint 4 - Opción A (UX de Resultados y Menús)

