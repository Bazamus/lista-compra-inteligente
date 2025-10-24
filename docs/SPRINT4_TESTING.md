# 🧪 SPRINT 4 - TESTING MANUAL

## 📋 RESUMEN DEL SPRINT

**Sprint:** Sprint 4 - Mejorar UX de Resultados y Menús
**Fecha:** Octubre 2025
**Features Implementadas:** 5 principales

### ✅ Features Completadas

1. **Edición inline de cantidades** - Botones +/- directos
2. **Drag & Drop para reordenar** - Reorganizar productos arrastrando
3. **Menú semanal visual** - Calendario interactivo
4. **Impresión/Exportación PDF** - Configuración de opciones
5. **Notas por producto** - Comentarios personalizados

---

## 🎯 CASOS DE PRUEBA

### FASE 1: Edición Inline de Cantidades

#### TC-1.1: Incrementar Cantidad
**Objetivo:** Verificar que el botón + incrementa la cantidad correctamente

**Pasos:**
1. Ir a ResultsPage con una lista generada
2. Localizar un producto
3. Click en botón "+" de QuantityControls
4. Verificar cambios

**Resultado Esperado:**
- ✅ Cantidad aumenta en 1
- ✅ Precio total se actualiza correctamente
- ✅ Animación smooth del cambio
- ✅ Presupuesto total actualizado en header

---

#### TC-1.2: Decrementar Cantidad
**Objetivo:** Verificar que el botón - decrementa la cantidad correctamente

**Pasos:**
1. Ir a ResultsPage con una lista
2. Localizar producto con cantidad > 1
3. Click en botón "-"
4. Verificar cambios

**Resultado Esperado:**
- ✅ Cantidad disminuye en 1
- ✅ Precio total se actualiza
- ✅ Si cantidad llega a 0, no permite más decrementos
- ✅ Presupuesto total actualizado

---

#### TC-1.3: Eliminar Producto
**Objetivo:** Verificar eliminación con botón X

**Pasos:**
1. Ir a ResultsPage
2. Click en botón "X" rojo en QuantityControls
3. Confirmar eliminación en diálogo

**Resultado Esperado:**
- ✅ Producto desaparece de la lista
- ✅ Animación de salida smooth
- ✅ Contador de productos actualizado
- ✅ Presupuesto recalculado
- ✅ Si lista queda vacía, mostrar mensaje apropiado

---

#### TC-1.4: Vista Responsive Mobile
**Objetivo:** Verificar que controles funcionan en móvil

**Pasos:**
1. Abrir DevTools, modo móvil (375px)
2. Verificar layout de QuantityControls
3. Probar +/- y X

**Resultado Esperado:**
- ✅ Botones con tamaño táctil apropiado (min 44x44px)
- ✅ Layout en columna en mobile, fila en desktop
- ✅ Texto legible, sin solapamiento
- ✅ Controles accesibles sin scroll horizontal

---

### FASE 2: Drag & Drop para Reordenar

#### TC-2.1: Activar Modo Reordenar
**Objetivo:** Verificar transición a vista drag & drop

**Pasos:**
1. Ir a ResultsPage
2. Click en botón "Modo Reordenar" (icono List)
3. Observar cambios

**Resultado Esperado:**
- ✅ Vista cambia a lista plana (sin categorías)
- ✅ Handles de drag (GripVertical) visibles
- ✅ Botón se actualiza a "Vista Categorías"
- ✅ Productos ordenables aparecen correctamente

---

#### TC-2.2: Arrastrar Producto
**Objetivo:** Verificar funcionalidad de drag & drop

**Pasos:**
1. Activar modo reordenar
2. Arrastrar un producto por el handle (GripVertical)
3. Soltarlo en otra posición
4. Verificar orden

**Resultado Esperado:**
- ✅ Producto se arrastra visualmente
- ✅ Otros productos se desplazan para hacer espacio
- ✅ Al soltar, producto queda en nueva posición
- ✅ Orden se persiste en localStorage
- ✅ Animaciones fluidas

---

#### TC-2.3: Restaurar Orden Original
**Objetivo:** Verificar botón de reset

**Pasos:**
1. Reordenar varios productos
2. Click en "Restaurar Orden" (RotateCcw)
3. Confirmar acción

**Resultado Esperado:**
- ✅ Productos vuelven a orden alfabético/original
- ✅ Orden custom eliminado de localStorage
- ✅ Toast notification confirma reset
- ✅ Animación de reordenamiento

---

#### TC-2.4: Persistencia de Orden
**Objetivo:** Verificar que orden se guarda entre sesiones

**Pasos:**
1. Reordenar productos
2. Refrescar página (F5)
3. Volver a ResultsPage

**Resultado Esperado:**
- ✅ Orden personalizado se mantiene
- ✅ Botón "Restaurar Orden" sigue activo
- ✅ LocalStorage contiene `productOrder_userId`

---

#### TC-2.5: Drag en Mobile
**Objetivo:** Verificar drag & drop en táctil

**Pasos:**
1. Modo móvil en DevTools
2. Activar modo reordenar
3. Simular touch drag (o usar mouse)

**Resultado Esperado:**
- ✅ Handle visible y táctil
- ✅ Drag inicia con 8px de threshold
- ✅ Feedback visual durante drag
- ✅ Drop funciona correctamente

---

### FASE 3: Menú Semanal Visual

#### TC-3.1: Visualizar Menú Semanal
**Objetivo:** Verificar renderizado del calendario

**Pasos:**
1. Generar lista con IA que incluya menú semanal
2. Ir a ResultsPage
3. Scroll hacia abajo al menú

**Resultado Esperado:**
- ✅ Calendario de 7 días visible
- ✅ Cada día en tarjeta individual (DayCard)
- ✅ Nombre del día en header (Lunes, Martes...)
- ✅ Comidas agrupadas por tipo (Desayuno, Comida, Cena)
- ✅ Layout grid responsive (1 col mobile, 2-3 desktop)

---

#### TC-3.2: Verificar MealTags
**Objetivo:** Verificar etiquetas de comida

**Pasos:**
1. Examinar un día con múltiples comidas
2. Verificar MealTag de cada comida

**Resultado Esperado:**
- ✅ Desayuno: emoji ☕, fondo naranja
- ✅ Comida: emoji 🍽️, fondo verde
- ✅ Cena: emoji 🌙, fondo índigo
- ✅ Tags legibles y estéticos

---

#### TC-3.3: Menú con Días Vacíos
**Objetivo:** Verificar comportamiento con días sin menú

**Pasos:**
1. Generar lista con menú incompleto (ej: solo 3 días)
2. Ver calendario

**Resultado Esperado:**
- ✅ Días vacíos muestran mensaje "Sin menú asignado"
- ✅ Layout no se rompe
- ✅ Tarjeta con estilo apropiado (gris, no error)

---

#### TC-3.4: Responsive Menú Semanal
**Objetivo:** Verificar adaptación a diferentes pantallas

**Pasos:**
1. Ver menú en mobile (375px)
2. Ver en tablet (768px)
3. Ver en desktop (1280px)

**Resultado Esperado:**
- ✅ Mobile: 1 columna, scroll vertical
- ✅ Tablet: 2 columnas
- ✅ Desktop: 3 columnas, grid compacto
- ✅ Texto legible en todos los tamaños

---

### FASE 4: Impresión y Exportación PDF

#### TC-4.1: Abrir Modal de Exportación
**Objetivo:** Verificar apertura del modal

**Pasos:**
1. Ir a ResultsPage
2. Click en "Exportar" (Download icon)
3. Click en "Imprimir / PDF"

**Resultado Esperado:**
- ✅ ExportOptionsModal aparece
- ✅ Animación Framer Motion smooth
- ✅ Overlay oscuro detrás
- ✅ Modal centrado y responsive

---

#### TC-4.2: Configurar Opciones
**Objetivo:** Verificar checkboxes de configuración

**Pasos:**
1. Abrir modal exportación
2. Toggle "Incluir precios"
3. Toggle "Incluir menú semanal"

**Resultado Esperado:**
- ✅ Checkboxes visualmente claros
- ✅ Estado persiste durante sesión
- ✅ Labels descriptivos
- ✅ Funcionalidad de toggle suave

---

#### TC-4.3: Imprimir con react-to-print
**Objetivo:** Verificar impresión directa

**Pasos:**
1. Configurar opciones (precios ON, menú ON)
2. Click en "Imprimir"
3. Inspeccionar vista previa de impresión

**Resultado Esperado:**
- ✅ Diálogo de impresión del navegador aparece
- ✅ Contenido formateado para A4
- ✅ Productos agrupados por categoría
- ✅ Checkboxes ☐ para marcar manualmente
- ✅ Precios mostrados (si configurado)
- ✅ Menú semanal en página aparte (si configurado)
- ✅ Footer con fecha y "ListaGPT"

---

#### TC-4.4: Descargar PDF con jsPDF
**Objetivo:** Verificar generación de PDF

**Pasos:**
1. Configurar opciones (precios ON, menú OFF)
2. Click en "Descargar PDF"
3. Abrir PDF descargado

**Resultado Esperado:**
- ✅ PDF se descarga automáticamente
- ✅ Nombre: `Lista_de_Compra_ListaGPT.pdf`
- ✅ Header con nombre de lista
- ✅ Metadata: personas, días, fecha
- ✅ Tablas con productos por categoría
- ✅ Columnas: Checkbox | Producto | Cant | Precio/ud | Total
- ✅ Paginación automática si contenido largo
- ✅ Footer con "Página X de Y"

---

#### TC-4.5: Opciones de Exportación (Precios OFF)
**Objetivo:** Verificar que opciones se aplican

**Pasos:**
1. Configurar "Incluir precios" = OFF
2. Descargar PDF
3. Verificar contenido

**Resultado Esperado:**
- ✅ Tabla NO muestra columnas de precio
- ✅ Solo: Checkbox | Producto | Cantidad
- ✅ Layout ajustado correctamente
- ✅ Información coherente

---

#### TC-4.6: Opciones de Exportación (Menú ON)
**Objetivo:** Verificar inclusión de menú

**Pasos:**
1. Configurar "Incluir menú semanal" = ON
2. Descargar PDF
3. Verificar contenido

**Resultado Esperado:**
- ✅ Menú semanal en sección separada
- ✅ Título "Menú Semanal"
- ✅ Grid 2 columnas con días
- ✅ Comidas agrupadas por día
- ✅ Formato legible

---

#### TC-4.7: Excel Exportation (Legacy)
**Objetivo:** Verificar que Excel sigue funcionando

**Pasos:**
1. Click en "Exportar"
2. Click en "Exportar Excel"

**Resultado Esperado:**
- ✅ Archivo .xlsx se descarga
- ✅ Formato correcto
- ✅ Compatibilidad con Excel/Google Sheets

---

### FASE 5: Notas por Producto

#### TC-5.1: Añadir Nota a Producto
**Objetivo:** Verificar creación de nota

**Pasos:**
1. Ir a ResultsPage
2. Click en icono FileText (gris) junto a nombre de producto
3. Modal ProductNoteModal aparece
4. Escribir nota: "Comprar ecológico"
5. Click en "Guardar"

**Resultado Esperado:**
- ✅ Modal se abre con animación
- ✅ Producto nombre en header del modal
- ✅ TextArea autofocus
- ✅ Al guardar, modal se cierra
- ✅ Toast notification: "Nota añadida"
- ✅ Icono FileText cambia a azul
- ✅ Nota aparece debajo del nombre (azul, italic)
- ✅ Texto: "📝 Comprar ecológico"

---

#### TC-5.2: Editar Nota Existente
**Objetivo:** Verificar edición de nota

**Pasos:**
1. Producto con nota existente
2. Click en icono FileText (azul)
3. Modal muestra nota actual
4. Modificar texto: "Sin lactosa, marca X"
5. Guardar

**Resultado Esperado:**
- ✅ Modal pre-relleno con nota actual
- ✅ Texto editable
- ✅ Al guardar, nota actualizada
- ✅ Toast: "Nota añadida"
- ✅ Visualización actualizada

---

#### TC-5.3: Eliminar Nota
**Objetivo:** Verificar eliminación de nota

**Pasos:**
1. Producto con nota
2. Click en FileText
3. Click en "Eliminar Nota" (rojo)
4. Verificar cambios

**Resultado Esperado:**
- ✅ Nota desaparece
- ✅ Toast: "Nota eliminada"
- ✅ Icono vuelve a gris
- ✅ Texto de nota no visible

---

#### TC-5.4: Shortcut Ctrl+Enter
**Objetivo:** Verificar atajo de teclado

**Pasos:**
1. Abrir modal de nota
2. Escribir texto
3. Presionar Ctrl+Enter

**Resultado Esperado:**
- ✅ Nota se guarda (igual que click en Guardar)
- ✅ Modal se cierra
- ✅ Cambios aplicados

---

#### TC-5.5: Notas en Modo Reordenar
**Objetivo:** Verificar notas en drag & drop

**Pasos:**
1. Añadir nota a producto
2. Activar modo reordenar
3. Verificar visualización

**Resultado Esperado:**
- ✅ Botón FileText visible en DraggableProductItem
- ✅ Nota mostrada debajo del nombre
- ✅ Funcionalidad idéntica
- ✅ Click en botón abre modal

---

#### TC-5.6: Notas en Impresión
**Objetivo:** Verificar notas en PrintableList

**Pasos:**
1. Añadir notas a 2-3 productos
2. Imprimir lista
3. Verificar vista previa

**Resultado Esperado:**
- ✅ Nota visible debajo de "Cantidad:"
- ✅ Formato: "📝 Nota del usuario"
- ✅ Color azul (text-blue-700)
- ✅ Italic
- ✅ Layout limpio

---

#### TC-5.7: Notas en PDF
**Objetivo:** Verificar notas en PDF generado

**Pasos:**
1. Añadir notas a productos
2. Descargar PDF
3. Abrir y verificar

**Resultado Esperado:**
- ✅ Nota en fila adicional debajo del producto
- ✅ Formato: "📝 Nota"
- ✅ Sin checkbox, cantidad, ni precio en fila de nota
- ✅ Tabla coherente y legible

---

#### TC-5.8: Persistencia de Notas
**Objetivo:** Verificar que notas se guardan

**Pasos:**
1. Añadir notas a productos
2. Guardar lista
3. Recargar página
4. Volver a lista desde Historial

**Resultado Esperado:**
- ✅ Notas se mantienen
- ✅ Persistidas en data_json de Supabase
- ✅ Iconos FileText en estado correcto (azul)
- ✅ Visualización idéntica

---

### INTEGRACIÓN Y REGRESIÓN

#### TC-INT-1: Flujo Completo Usuario
**Objetivo:** Simular uso real completo

**Pasos:**
1. Generar lista con IA (incluir menú)
2. Editar cantidades con +/-
3. Añadir notas a 3 productos
4. Activar modo reordenar y reorganizar
5. Restaurar orden
6. Descargar PDF con precios y menú
7. Guardar lista
8. Ir a Historial
9. Reabrir lista
10. Verificar todo se mantiene

**Resultado Esperado:**
- ✅ Todas las funcionalidades trabajan juntas
- ✅ Sin errores en consola
- ✅ Datos persistentes correctamente
- ✅ UX fluida

---

#### TC-INT-2: Modo Compra + Notas
**Objetivo:** Verificar compatibilidad con Sprint 3

**Pasos:**
1. Lista con notas añadidas
2. Activar modo compra (checkbox)
3. Marcar productos como comprados

**Resultado Esperado:**
- ✅ Notas visibles incluso con productos tachados
- ✅ Botón FileText accesible
- ✅ No conflictos visuales

---

#### TC-INT-3: Favoritos + Reordenar
**Objetivo:** Verificar interacción con favoritos

**Pasos:**
1. Añadir productos favoritos
2. Incluir en lista
3. Reordenar lista
4. Verificar favoritos

**Resultado Esperado:**
- ✅ Productos favoritos mantienen estado
- ✅ Estrella visible en drag & drop
- ✅ Funcionalidad independiente

---

#### TC-INT-4: Dark Mode
**Objetivo:** Verificar todas las features en dark mode

**Pasos:**
1. Activar dark mode
2. Probar:
   - QuantityControls
   - Drag & drop
   - Menú semanal
   - Modal exportación
   - Modal de notas

**Resultado Esperado:**
- ✅ Todos los componentes visibles
- ✅ Contraste apropiado
- ✅ Sin texto ilegible
- ✅ Colores consistentes con dark mode

---

## 📊 MATRIZ DE COBERTURA

| Feature | Componentes | Tests | Estado |
|---------|-------------|-------|--------|
| Edición Inline | QuantityControls | 4 | ✅ |
| Drag & Drop | DraggableProductList, DraggableProductItem, useDragAndDrop | 5 | ✅ |
| Menú Semanal | WeeklyMenuCalendar, DayCard, MealTag | 4 | ✅ |
| Print/Export | PrintableList, ExportOptionsModal, generatePDF | 7 | ✅ |
| Notas | ProductNoteModal | 8 | ✅ |
| Integración | - | 4 | ✅ |
| **TOTAL** | **10 componentes** | **32 casos** | ✅ |

---

## 🐛 ERRORES CONOCIDOS Y LIMITACIONES

### Limitaciones Actuales

1. **Drag & Drop en Mobile Safari:**
   - Puede tener pequeños retrasos en iOS Safari
   - Alternativa: usar keyboard navigation (accesibilidad)

2. **Impresión en Chrome vs Firefox:**
   - Chrome: margin predeterminado puede variar
   - Solución: ajustar en diálogo de impresión

3. **PDF con Listas Muy Grandes (>100 productos):**
   - Paginación automática funciona, pero puede ser lento
   - Considerar dividir lista o filtrar

4. **Notas Muy Largas:**
   - No hay límite de caracteres
   - Layout puede romperse si nota > 200 caracteres
   - Recomendación: limitar a 150 caracteres (futuro)

---

## ✅ CHECKLIST PRE-DEPLOY

Antes de marcar Sprint 4 como completo, verificar:

- [ ] Todos los 32 tests pasan
- [ ] Sin errores TypeScript (`npx tsc --noEmit`)
- [ ] Sin warnings en build (`npm run build`)
- [ ] Sin errores en consola del navegador
- [ ] Responsive funciona en: 375px, 768px, 1280px
- [ ] Dark mode OK en todas las features
- [ ] Persistencia de datos verificada (localStorage + Supabase)
- [ ] Features compatibles con Sprint 1, 2, 3
- [ ] Documentación actualizada
- [ ] Commit messages descriptivos

---

## 🚀 CRITERIOS DE ACEPTACIÓN

### Feature 1: Edición Inline
- ✅ +/- actualiza cantidad instantáneamente
- ✅ Precio total recalcula automáticamente
- ✅ Botón X elimina con confirmación
- ✅ Responsive mobile

### Feature 2: Drag & Drop
- ✅ Modo toggle funciona
- ✅ Arrastrar reordena productos
- ✅ Restaurar orden funciona
- ✅ Orden persiste entre sesiones
- ✅ Touch drag funciona en móvil

### Feature 3: Menú Semanal
- ✅ Calendario renderiza 7 días
- ✅ Comidas agrupadas por tipo
- ✅ MealTags con colores correctos
- ✅ Responsive grid

### Feature 4: Print/Export
- ✅ Modal con opciones configurable
- ✅ Imprimir abre diálogo navegador
- ✅ PDF descarga correctamente
- ✅ Opciones se aplican (precios, menú)
- ✅ Formato profesional A4

### Feature 5: Notas
- ✅ Modal añade/edita/elimina notas
- ✅ Notas visibles inline (azul, italic)
- ✅ Icono FileText cambia color según estado
- ✅ Shortcut Ctrl+Enter funciona
- ✅ Notas en impresión y PDF
- ✅ Persistencia correcta

---

## 📝 NOTAS FINALES

### Tiempo Estimado de Testing Manual
- **Testing básico (smoke test):** 30 min
- **Testing completo (32 casos):** 2-3 horas
- **Testing de regresión:** 1 hora

### Herramientas Recomendadas
- Chrome DevTools (Responsive mode)
- React DevTools
- Supabase Dashboard (verificar data_json)
- PDF reader (Adobe, Preview, etc.)

### Próximos Pasos Post-Testing
1. Marcar `s4-testing` como completado
2. Verificar deploy en Vercel
3. Testing en producción con usuario real
4. Crear Sprint 5 o iterar mejoras

---

**Documento creado:** Octubre 2025  
**Última actualización:** Fase 5 completada  
**Versión:** 1.0

