# Panel Admin y Operaciones - Plan de Expansión

## 1. Métricas y Dashboard

### 1.1 Nuevos KPIs
- **Retención de usuarios**: usuarios con ≥1 lista cada semana/mes.
- **Ahorro promedio**: diferencia entre presupuesto y coste real.
- **Top categorías y productos**: ranking por frecuencia y gasto.
- **Uso catálogo manual vs IA**: ratio por usuario.

### 1.2 Implementación
- Crear vistas materializadas en Supabase (`vw_admin_kpis`) precalculadas mediante cron (pg_cron) cada hora.
- `AdminDashboard.tsx`:
  - Tarjetas con KPIs + variación vs periodo anterior.
  - Gráfico sparkline (usar Recharts o nivo) por métrica.
- `AnalyticsPage.tsx`:
  - Tabs: “Uso IA”, “Catálogo Manual”, “Finanzas”.
  - Gráficos de barras/apilados para listas por categoría, ahorro por usuario.

### 1.3 Alertas proactivas
- Configurar triggers Supabase + Edge Functions para enviar alertas Slack/email cuando:
  - Ahorro medio < objetivo.
  - Fallos IA > umbral.

## 2. Auditoría y Seguridad

### 2.1 Bitácora de acciones
- Tabla `admin_logs` (ya creada) → extender con columnas `actor_id`, `tipo`, `payload`, `resultado`.
- Registrar acciones clave: cambio de rol, eliminación de lista, generación masiva.
- UI en página admin nueva (`AdminAudits.tsx`) con filtros por fecha/tipo.

### 2.2 Políticas RLS y permisos
- Revisión exhaustiva de políticas Supabase:
  - Listas: solo propietario o administradores.
  - Inventario futuro: multi-tenant asegurado.
- Añadir roles “support” con permisos restringidos (solo lectura).
- Documentar en `AUTH_SYSTEM.md` el flujo de roles.

### 2.3 Auditoría técnica automatizada
- Script semanal que verifica integridad (listas sin `data_json`, productos sin categoría) y genera reporte.
- Mostrar resumen en `DatabaseManagement.tsx`.

## 3. Gestión Avanzada de Usuarios

### 3.1 UsersManagement improvements
- Filtro por rol, fecha registro, actividad.
- Buscador por email/nombre.
- Columnas adicionales: plan (free/premium), listas creadas, última actividad.
- Acciones masivas (enviar invitación, reset password).

### 3.2 Upselling y planes
- Tabla `suscripciones` para gestionar planes premium.
- Integrar pasarela (Stripe) para upgrade desde admin.
- Dashboard: métricas suscripción y churn.

### 3.3 Gestión de feedback
- Crear formulario in-app → tabla `feedback`.
- Página admin “Feedback & Issues” para revisar, etiquetar y resolver.

## 4. Roadmap

| Hito | Descripción | Tiempo estimado |
|------|-------------|-----------------|
| KPIs + dashboard visual | Vistas SQL + UI tarjetas/gráficos | 2 semanas |
| Auditoría & logs | Tabla ampliada, página filtros, scripts | 1.5 semanas |
| Gestión usuarios avanzada | Filtros, columnas, acciones masivas | 1 semana |
| Feedback y planes premium | Nuevas tablas + UI | 2 semanas |

## 5. Dependencias y Riesgos
- Necesidad de activar `pg_cron` y roles de servicio en Supabase.
- Integración Stripe requiere backend seguro (Edge Function).
- Incremento de datos en logs → planificar retención (TTL 90 días).
- Gráficos incrementan bundle, considerar lazy loading.

## 6. Métricas de Éxito
- Tiempo medio de reacción ante incidencias < 24h.
- Retención mensual > 65% tras monitoreo proactivo.
- % usuarios premium ≥ 15% en Q2.
- 100% de acciones sensibles registradas con auditoría accesible.

---

Este plan sirve de entrada para épicos de operaciones y se alinea con la estrategia de calidad y DevOps.

