# Deuda Técnica - ListaGPT

**Última actualización:** 2025-10-23

---

## 🔴 Crítico (Alta Prioridad)

### 1. RLS Deshabilitado en Tabla `list_shares`

**Descripción:**  
La tabla `list_shares` tiene Row Level Security (RLS) deshabilitado para que funcione la vista pública de listas compartidas.

**Riesgo:**  
- Cualquier usuario puede ver todos los enlaces compartidos de todos los usuarios
- Posible modificación o eliminación de shares sin autenticación
- Fuga de información de listas privadas

**Impacto:** 🔴 **Crítico** - Seguridad y privacidad comprometidas

**Solución:**  
Habilitar RLS con políticas correctas que permitan:
1. Usuarios autenticados crear shares de sus listas
2. Vista pública (anónima) leer shares activos y no expirados
3. Creadores actualizar/eliminar solo sus propios shares

**Script SQL de solución:**
```sql
-- Habilitar RLS
ALTER TABLE list_shares ENABLE ROW LEVEL SECURITY;

-- Política para vista pública (CRÍTICO)
CREATE POLICY "Anyone can view active shares"
  ON list_shares FOR SELECT
  TO public  -- Usar 'public' para acceso anónimo
  USING (
    is_active = true AND
    (expires_at IS NULL OR expires_at > NOW())
  );

-- Política para creación (usuarios autenticados)
CREATE POLICY "Users can create shares of own lists"
  ON list_shares FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM listas_compra 
      WHERE id_lista = list_shares.lista_id 
      AND user_id = auth.uid()
    )
  );

-- Política para actualización/eliminación
CREATE POLICY "Creators can manage own shares"
  ON list_shares FOR ALL
  TO authenticated
  USING (created_by = auth.uid());
```

**Estimación:** 2 horas  
**Asignado a:** Pendiente  
**Sprint sugerido:** Sprint 2 (Calidad básica)

---

## 🟡 Medio (Deuda Técnica)

### 2. Falta Testing Automatizado

**Descripción:**  
No hay tests unitarios ni E2E para las funcionalidades implementadas.

**Riesgo:**  
- Regresiones no detectadas
- Dificulta refactoring
- Mayor tiempo de debugging

**Impacto:** 🟡 **Medio** - Calidad y mantenibilidad

**Solución:**  
Implementar tests con Vitest + React Testing Library (parte de FASE 0)

**Estimación:** 1 semana (ver guía-implementacion-estrategica.md)  
**Sprint sugerido:** Sprint 2 (FASE 0 - Calidad y DevOps)

---

### 3. Sin Monitorización ni Logs Estructurados

**Descripción:**  
Solo hay `console.log` básicos, sin Sentry ni logging estructurado.

**Riesgo:**  
- Errores en producción no detectados
- Debugging difícil sin trazabilidad
- No hay métricas de uso real

**Impacto:** 🟡 **Medio** - Observabilidad

**Solución:**  
- Integrar Sentry (ver plan-calidad-devops.md)
- Implementar Winston logger con `requestId`
- Dashboard de métricas

**Estimación:** 3-4 días  
**Sprint sugerido:** Sprint 2 (FASE 0 - Calidad y DevOps)

---

### 4. Variables de Entorno Duplicadas

**Descripción:**  
Se necesitan variables duplicadas en Vercel (`VITE_*` y sin prefijo) para frontend y APIs.

**Riesgo:**  
- Confusión en configuración
- Posible desincronización de valores

**Impacto:** 🟡 **Medio** - Mantenibilidad

**Solución:**  
- Unificar acceso a variables en un módulo centralizado
- Automatizar sincronización con Vercel CLI

**Estimación:** 4 horas  
**Sprint sugerido:** Sprint 2 o 3

---

## 🟢 Bajo (Mejoras Futuras)

### 5. Rate Limiting Básico en Memoria

**Descripción:**  
El rate limiting de `api/compartir.ts` usa un Map en memoria que se resetea con cada deploy.

**Riesgo:**  
- No persiste entre reinicios
- No funciona en ambientes multi-instancia
- Fácil bypass con múltiples IPs

**Impacto:** 🟢 **Bajo** - Seguridad moderada

**Solución:**  
- Implementar rate limiting con Upstash Redis
- O usar Vercel Edge Middleware

**Estimación:** 1 día  
**Sprint sugerido:** Sprint 3 o posterior

---

### 6. Sin Analytics de Shares

**Descripción:**  
Solo hay contador de visitas básico, sin métricas avanzadas.

**Riesgo:**  
- No sabemos qué shares son más populares
- No hay datos para optimizar feature

**Impacto:** 🟢 **Bajo** - Product analytics

**Solución:**  
- Implementar tracking con eventos
- Dashboard de métricas de shares

**Estimación:** 2 días  
**Sprint sugerido:** Sprint 3 o 4

---

### 7. Sin Caché de Lista Compartida

**Descripción:**  
Cada visita a un share hace query a Supabase, incluso si el contenido no cambió.

**Riesgo:**  
- Aumento de costos de BD
- Latencia innecesaria

**Impacto:** 🟢 **Bajo** - Performance y costos

**Solución:**  
- Cache de 5 minutos en Vercel Edge
- O usar `Cache-Control` headers

**Estimación:** 4 horas  
**Sprint sugerido:** Sprint 4 (Performance)

---

## 📊 Resumen por Prioridad

| Prioridad | Cantidad | Estimación Total |
|-----------|----------|------------------|
| 🔴 Crítico | 1 | 2 horas |
| 🟡 Medio | 3 | ~2 semanas |
| 🟢 Bajo | 3 | ~4 días |
| **TOTAL** | **7** | **~3 semanas** |

---

## 🎯 Plan de Remediación Sugerido

### Sprint 2: Calidad Básica (Semana 1)
1. ✅ Fix RLS en `list_shares` (2h) - **CRÍTICO**
2. ✅ Implementar testing básico (3 días)
3. ✅ Configurar Sentry básico (1 día)

### Sprint 3: Calidad Avanzada (Semana 2)
4. ✅ Logs estructurados (2 días)
5. ✅ Unificar variables de entorno (4h)
6. ✅ Rate limiting con Redis (1 día)

### Sprint 4: Optimización (Semana 3)
7. ✅ Analytics de shares (2 días)
8. ✅ Caché de listas compartidas (4h)

---

## 📝 Proceso de Gestión

### Cómo Añadir Nueva Deuda Técnica

1. Usar este template:
```markdown
### X. Título Descriptivo

**Descripción:** ¿Qué está mal?
**Riesgo:** ¿Qué puede pasar?
**Impacto:** 🔴/🟡/🟢 + Categoría
**Solución:** ¿Cómo se arregla?
**Estimación:** Tiempo aproximado
**Sprint sugerido:** Cuándo hacerlo
```

2. Categorías de impacto:
   - 🔴 **Crítico:** Seguridad, pérdida de datos, bloqueante
   - 🟡 **Medio:** Calidad, mantenibilidad, UX degradada
   - 🟢 **Bajo:** Optimización, nice-to-have

3. Actualizar este documento al final de cada sprint

---

## 🔄 Estado de Items

- ⏳ **Pendiente:** No iniciado
- 🔄 **En Progreso:** Trabajando en ello
- ✅ **Resuelto:** Completado y verificado
- ❌ **No Aplica:** Decidimos no hacerlo

---

**Mantener este documento actualizado es responsabilidad del equipo.**

