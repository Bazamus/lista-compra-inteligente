# Configuración de Variables de Entorno en Vercel

## ⚠️ IMPORTANTE: Variables Requeridas para API Functions

Las **API functions serverless** de Vercel (`/api/*`) **NO tienen acceso** a variables que empiezan con `VITE_`.

Las variables `VITE_*` solo están disponibles en el **frontend (build de Vite)**.

---

## 📋 Variables a Configurar en Vercel Dashboard

Ir a: **Vercel Dashboard → Tu Proyecto → Settings → Environment Variables**

### Variables para API Functions (Serverless)

Añadir las siguientes variables **sin el prefijo VITE_**:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `SUPABASE_URL` | `https://hnnjfqokgbhnydkfuhxy.supabase.co` | URL de Supabase |
| `SUPABASE_ANON_KEY` | `[TU_ANON_KEY_AQUÍ]` | Anon key de Supabase |

**Entornos donde aplicar:** ✅ Production, ✅ Preview, ✅ Development

---

## 🔍 Cómo Obtener las Keys de Supabase

1. Ir a **Supabase Dashboard**: https://app.supabase.com/
2. Seleccionar tu proyecto: `lista-compra-inteligente`
3. Ir a **Settings → API**
4. Copiar:
   - **Project URL** → Usar para `SUPABASE_URL`
   - **anon/public key** → Usar para `SUPABASE_ANON_KEY`

---

## ✅ Verificar Configuración

Después de añadir las variables:

1. **Re-deploy** el proyecto (Vercel → Deployments → ... → Redeploy)
2. Verificar en logs de Vercel que NO aparece:
   ```
   ❌ SUPABASE_ANON_KEY no está configurada en variables de entorno
   ```
3. Probar API en producción:
   ```bash
   curl https://www.listagpt.com/api/healthcheck
   ```

---

## 🐛 Troubleshooting

### Problema: Error 500 al crear share
**Causa:** Variables `SUPABASE_*` no configuradas en Vercel  
**Solución:** Añadir variables sin prefijo `VITE_` como se indica arriba

### Problema: "Cannot read properties of undefined"
**Causa:** `supabaseKey` es una cadena vacía  
**Solución:** Verificar que copiaste correctamente la anon key de Supabase

### Problema: Cambios no aplican después de añadir variables
**Causa:** Vercel cachea el build  
**Solución:** Forzar redeploy desde Vercel Dashboard

---

## 📝 Pasos Exactos para Configurar

### Paso 1: Copiar Keys de Supabase
```bash
# En Supabase Dashboard → Settings → API
Project URL: https://hnnjfqokgbhnydkfuhxy.supabase.co
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (tu key real)
```

### Paso 2: Ir a Vercel
1. https://vercel.com/dashboard
2. Seleccionar proyecto `lista-compra-inteligente`
3. Settings → Environment Variables

### Paso 3: Añadir Variables
Click en "Add New"

**Variable 1:**
- Key: `SUPABASE_URL`
- Value: `https://hnnjfqokgbhnydkfuhxy.supabase.co`
- Environments: ✅ Production ✅ Preview ✅ Development

**Variable 2:**
- Key: `SUPABASE_ANON_KEY`
- Value: `[PEGAR TU ANON KEY AQUÍ]`
- Environments: ✅ Production ✅ Preview ✅ Development

### Paso 4: Redeploy
1. Ir a Deployments
2. Click en el último deployment
3. Click en "..." → "Redeploy"
4. Esperar 2-3 minutos

### Paso 5: Verificar
```bash
# Probar que API funciona
curl -X POST https://www.listagpt.com/api/compartir \
  -H "Authorization: Bearer [TU_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{"lista_id":"test","expiration_hours":24}'
```

---

## 🎯 Resumen

**Problema:** APIs no pueden leer `VITE_*` variables  
**Solución:** Duplicar variables sin prefijo `VITE_`

**Variables Finales en Vercel:**
- ✅ `VITE_SUPABASE_URL` (para frontend)
- ✅ `VITE_SUPABASE_ANON_KEY` (para frontend)
- ✅ `SUPABASE_URL` (para APIs) ← **NUEVO**
- ✅ `SUPABASE_ANON_KEY` (para APIs) ← **NUEVO**

---

**Última actualización:** 2025-10-23

