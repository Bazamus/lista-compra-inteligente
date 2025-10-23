# Testing Manual - Corrección de Bugs Críticos

**Fecha:** 2025-01-23
**Versión:** Fix persistencia de sesión + guardado de listas
**Servidor:** http://localhost:5173

---

## 🎯 Objetivo del Testing

Verificar que los dos bugs reportados están corregidos:
1. ✅ Lista se guarda correctamente para usuarios autenticados
2. ✅ Sesión persiste al refrescar navegador (F5)

---

## ⚙️ Preparación

### 1. Abrir Aplicación
```
URL: http://localhost:5173
```

### 2. Abrir DevTools
```
Presiona F12
Ir a pestaña "Console"
```

### 3. Limpiar localStorage (testing limpio)
```javascript
// En consola de DevTools:
localStorage.clear()
location.reload()
```

---

## 🧪 TEST 1: Persistencia de Sesión (F5)

### Objetivo
Verificar que usuario NO pierde sesión al refrescar navegador

### Pasos:

#### 1.1 - Login
```
1. Ir a "Iniciar Sesión" o "Registrarse"
2. Usar credenciales de prueba:
   - Email: tu_email@ejemplo.com
   - Password: tu_password
3. Login exitoso
4. Verificar que aparece nombre de usuario en header
```

**Resultado Esperado:** ✅ Login exitoso, usuario visible en header

#### 1.2 - Verificar localStorage
```javascript
// En consola de DevTools:
const authData = localStorage.getItem('lista-compra-auth');
console.log('🔐 Auth data:', authData);

// Debería mostrar un JSON con token de sesión
```

**Resultado Esperado:** ✅ Existe key 'lista-compra-auth' con datos de sesión

#### 1.3 - Refrescar Página (CRÍTICO)
```
1. Presionar F5 (o Ctrl+R / Cmd+R)
2. Esperar a que cargue la página
3. Verificar header
```

**Resultado Esperado:** ✅ Usuario SIGUE autenticado después de F5

#### 1.4 - Verificar en Consola
```javascript
// La consola debería mostrar:
🔐 Inicializando autenticación...
👤 Sesión encontrada, cargando perfil...
✅ (sin errores)
```

**Resultado Esperado:** ✅ No hay errores de autenticación en consola

---

## 🧪 TEST 2: Guardar Lista desde Catálogo (Usuario Autenticado)

### Objetivo
Verificar que lista se guarda correctamente en BD para usuario autenticado

### Pre-requisitos
- Usuario DEBE estar autenticado (Test 1 completado)
- Verificar en consola que `user` existe

### Pasos:

#### 2.1 - Ir al Catálogo
```
1. Click en "Explorar Productos"
2. Esperar a que carguen productos
```

**Resultado Esperado:** ✅ Catálogo muestra productos de Mercadona

#### 2.2 - Añadir Productos al Carrito
```
1. Buscar o navegar productos
2. Click en "Añadir al carrito" en 2-3 productos diferentes
3. Verificar contador de carrito en esquina superior derecha
```

**Resultado Esperado:** ✅ Contador muestra cantidad de productos (ej: 3)

#### 2.3 - Ver Carrito
```
1. Click en icono de carrito (esquina superior derecha)
2. Verificar lista de productos en modal
3. Click en "Ver Lista Completa" o "Ir a Resultados"
```

**Resultado Esperado:** ✅ Modal muestra productos, navega a ManualListResults

#### 2.4 - Guardar Lista (CRÍTICO)
```
1. Estar en página "Compra semanal" (ManualListResults)
2. Abrir consola de DevTools (F12)
3. Click en botón "Guardar lista" (azul)
4. OBSERVAR CONSOLA
```

**Logs Esperados en Consola:**
```javascript
🎯 handleSaveList: Iniciando guardado...
👤 Usuario autenticado: true
👤 User ID: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
📦 Productos en lista: 3
🎯 handleSaveList: Llamando a saveList con datos: {...}
💾 saveListToDB: Iniciando guardado para user: xxxxxxxx...
✅ handleSaveList: Lista guardada exitosamente con ID: "yyyyyyyy..."
```

**Resultado Esperado:**
- ✅ Toast verde: "Lista guardada correctamente"
- ✅ Botón cambia a "Lista guardada" con check
- ✅ Logs en consola sin errores

#### 2.5 - Si hay ERROR
```javascript
// Si aparece error en consola:
❌ Error al guardar lista: {mensaje}

// Copiar y pegar TODO el error completo aquí:
```

---

## 🧪 TEST 3: Verificar Lista en Historial

### Objetivo
Confirmar que lista guardada aparece en historial del usuario

### Pasos:

#### 3.1 - Ir a Historial
```
1. Click en "Historial" en navegación
2. Esperar a que cargue
```

**Resultado Esperado:** ✅ Página de historial carga

#### 3.2 - Verificar Lista Guardada
```
1. Buscar la lista recién guardada
2. Verificar nombre: "Compra semanal" o similar
3. Verificar que muestra productos y presupuesto
```

**Resultado Esperado:**
- ✅ Lista aparece en historial
- ✅ Muestra nombre correcto
- ✅ Muestra número de productos
- ✅ Muestra presupuesto total

#### 3.3 - Abrir Lista
```
1. Click en la lista guardada
2. Verificar que abre ResultsPage con todos los productos
```

**Resultado Esperado:** ✅ Lista se abre correctamente con todos los datos

---

## 🧪 TEST 4: Refrescar en Historial (Combo)

### Objetivo
Verificar que sesión + historial persisten juntos

### Pasos:

#### 4.1 - Refrescar en Historial
```
1. Estar en página Historial (con lista visible)
2. Presionar F5
3. Esperar a que recargue
```

**Resultado Esperado:**
- ✅ Usuario sigue autenticado
- ✅ Historial sigue mostrando listas
- ✅ Lista guardada previamente sigue visible

---

## 🧪 TEST 5: Modo Demo (Verificación)

### Objetivo
Verificar que modo demo SIGUE funcionando correctamente

### Pasos:

#### 5.1 - Logout
```
1. Click en usuario en header
2. Click en "Cerrar sesión"
3. Verificar redirección a home
```

**Resultado Esperado:** ✅ Logout exitoso

#### 5.2 - Crear Lista en Modo Demo
```
1. SIN hacer login
2. Ir a catálogo
3. Añadir productos
4. Guardar lista
```

**Resultado Esperado:**
- ✅ Lista se guarda en localStorage
- ✅ Toast: "Lista guardada localmente"
- ✅ Aparece en historial

#### 5.3 - Refrescar en Modo Demo
```
1. Presionar F5
2. Ir a Historial
```

**Resultado Esperado:**
- ✅ Lista demo SIGUE visible
- ✅ Banner naranja indica "Modo Demo"

---

## 📊 Resumen de Resultados

### Bug 1: Persistencia de Sesión
- [ ] ✅ PASS - Usuario persiste después de F5
- [ ] ❌ FAIL - Usuario pierde sesión

**Detalles si FAIL:**
```
[Describir qué pasa exactamente]
[Copiar logs de consola]
```

### Bug 2: Guardar Lista (Autenticado)
- [ ] ✅ PASS - Lista se guarda y aparece en historial
- [ ] ❌ FAIL - Lista no se guarda o no aparece

**Detalles si FAIL:**
```
[Describir qué pasa exactamente]
[Copiar logs de consola]
```

---

## 🔍 Debugging Adicional

Si algo falla, ejecutar en consola:

```javascript
// Verificar estado de auth
const authKey = localStorage.getItem('lista-compra-auth');
console.log('Auth:', authKey ? 'EXISTS' : 'NOT FOUND');

// Si existe, parsear
if (authKey) {
  const auth = JSON.parse(authKey);
  console.log('User ID:', auth?.user?.id);
  console.log('Email:', auth?.user?.email);
  console.log('Expires at:', auth?.session?.expires_at);
}

// Verificar listas en BD (solo si autenticado)
// [Esto requiere acceso a Supabase Dashboard]
```

---

## 📝 Notas Importantes

1. **Logs en Consola**: No borrar/limpiar consola durante testing
2. **Network Tab**: Puedes revisar llamadas a API en DevTools > Network
3. **Application Tab**: Puedes revisar localStorage en DevTools > Application > Local Storage
4. **Supabase Dashboard**: Puedes verificar en tabla `listas_compra` si la lista se guardó

---

## ✅ Checklist Final

- [ ] Servidor corriendo (http://localhost:5173)
- [ ] DevTools abierto con Console visible
- [ ] Test 1: Persistencia de sesión - PASS/FAIL
- [ ] Test 2: Guardar lista autenticado - PASS/FAIL
- [ ] Test 3: Lista en historial - PASS/FAIL
- [ ] Test 4: Refrescar en historial - PASS/FAIL
- [ ] Test 5: Modo demo funciona - PASS/FAIL
- [ ] Screenshots capturados (si hay errores)
- [ ] Logs de consola copiados (si hay errores)

---

## 🎯 Próximos Pasos Según Resultados

### Si TODO PASS ✅
1. Marcar bugs como resueltos
2. Deploy a producción confirmado
3. Notificar a usuarios que bugs están corregidos
4. Continuar con nuevas features

### Si HAY FAILS ❌
1. Compartir logs y screenshots
2. Identificar causa raíz adicional
3. Aplicar fix adicional
4. Re-testing

---

**Última actualización:** 2025-01-23 10:20
**Estado servidor:** ✅ RUNNING en http://localhost:5173
