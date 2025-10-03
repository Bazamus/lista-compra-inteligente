# 🛒 Lista Inteligente de Compra

Una aplicación web inteligente que utiliza IA para generar listas de compra y menús personalizados basados en preferencias del usuario, número de personas, duración y presupuesto.

## ✨ Características

- **Formulario interactivo** con preguntas personalizadas
- **Inteligencia Artificial** con OpenAI para recomendaciones
- **Base de datos** de +6,000 productos de Mercadona
- **Generación automática** de menús y listas de compra
- **Optimización de presupuesto** inteligente
- **Exportación** a PDF y Excel
- **Diseño responsivo** con Tailwind CSS

## 🛠️ Stack Tecnológico

- **Frontend:** React 18 + TypeScript + Vite
- **Estilos:** Tailwind CSS
- **Base de datos:** Supabase (PostgreSQL)
- **IA:** OpenAI GPT-4 API
- **Icons:** Lucide React
- **HTTP Client:** Axios

## 🚀 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repo-url>
   cd lista-compra-inteligente
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```

   Completar las variables en `.env`:
   ```env
   VITE_SUPABASE_URL=tu_url_supabase
   VITE_SUPABASE_ANON_KEY=tu_clave_supabase
   VITE_OPENAI_API_KEY=tu_clave_openai
   ```

4. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── common/          # Componentes reutilizables
│   ├── forms/           # Formularios
│   ├── products/        # Componentes de productos
│   └── lists/           # Componentes de listas
├── pages/               # Páginas principales
├── contexts/            # React Context
├── hooks/               # Custom hooks
├── services/            # Servicios y APIs
├── types/               # Tipos TypeScript
├── utils/               # Utilidades y constantes
└── api/                 # Funciones de API
```

## 🎯 Roadmap

### ✅ FASE 1: Configuración Inicial (Completada)
- [x] Configuración React + TypeScript + Vite
- [x] Instalación de dependencias
- [x] Configuración Tailwind CSS
- [x] Estructura de carpetas
- [x] Componentes base
- [x] Context de la aplicación

### 🔄 FASE 2: Base de Datos (En Desarrollo)
- [ ] Configuración Supabase
- [ ] Importación datos Mercadona
- [ ] Esquema de tablas
- [ ] Conexión desde la app

### 📋 FASE 3: Backend/API
- [ ] Funciones serverless
- [ ] Integración OpenAI
- [ ] Endpoints de productos
- [ ] Lógica de recomendaciones

### 🎨 FASE 4: Frontend - Formulario
- [ ] Formulario interactivo
- [ ] Validaciones
- [ ] UX/UI optimizada

### 🤖 FASE 5: IA y Generación
- [ ] Prompts optimizados
- [ ] Generación de menús
- [ ] Optimización de listas

### ⚡ FASE 6-9: Funcionalidades Avanzadas
- [ ] Exportación PDF/Excel
- [ ] Historial de listas
- [ ] Testing completo
- [ ] Despliegue producción

## 🤝 Contribución

Este es un proyecto en desarrollo activo. Las contribuciones son bienvenidas.

## 📄 Licencia

MIT License - ver archivo LICENSE para detalles.

---

*Desarrollado con ❤️ usando React + IA*