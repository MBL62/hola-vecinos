# 🏘️ Hola Vecinos

Marketplace vecinal geolocalizado. Publica productos, servicios, regalos o truques visibles en un mapa, enfocado en cercanía geográfica.

## Stack

- **Frontend**: React 18 + Vite
- **Estilos**: CSS Vanilla moderno (dark mode, glassmorphism)
- **Mapas**: Leaflet + OpenStreetMap (sin API key)
- **Backend**: Supabase (Auth, DB, Storage, Realtime)

---

## 🛠️ Configuración inicial

### 1. Instalar Node.js
Descarga e instala Node.js LTS desde: **https://nodejs.org/en/download**

Verifica la instalación:
```bash
node --version  # debe ser v18 o superior
npm --version
```

### 2. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta gratuita.
2. Crea un **Nuevo Proyecto** (anota la contraseña de la DB).
3. Espera que se inicialice (1–2 minutos).
4. Ve a **SQL Editor → New Query**, pega el contenido de [`supabase/schema.sql`](./supabase/schema.sql) y haz click en **Run**.
5. Ve a **Storage → New bucket**:
   - Nombre: `post-images`
   - Marca como **Public**
6. Anota tus credenciales desde **Settings → API**:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public key` → `VITE_SUPABASE_ANON_KEY`

### 3. Configurar variables de entorno

Copia el archivo de ejemplo:
```bash
copy .env.example .env
```

Edita `.env` con tus credenciales de Supabase:
```env
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_ANON_KEY_AQUI
```

### 4. Instalar dependencias y ejecutar

```bash
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

---

## 📂 Estructura del Proyecto

```
src/
├── context/
│   └── AuthContext.jsx      # Estado global de sesión
├── lib/
│   └── supabaseClient.js    # Cliente de Supabase
├── pages/
│   ├── AuthPage.jsx/css     # Login / Registro
│   ├── MapPage.jsx/css      # Vista principal (mapa)
│   └── ChatPage.jsx/css     # Chat directo
├── components/
│   ├── NewPostModal.jsx/css # Modal para crear publicación
│   ├── PostDetailModal.jsx/css # Detalle de publicación
│   └── PostCard.jsx/css     # Tarjeta de lista
├── App.jsx                  # Rutas y guards
├── main.jsx                 # Entry point
└── index.css                # Design system global
supabase/
└── schema.sql               # Script de base de datos
```

---

## 🚀 Deploy en Vercel

1. Instala Vercel CLI:
```bash
npm install -g vercel
```

2. Haz build del proyecto:
```bash
npm run build
```

3. Despliega:
```bash
vercel --prod
```

4. En el dashboard de Vercel, ve a **Settings → Environment Variables** y agrega:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

> **Alternativa sin CLI**: Conecta tu repositorio de GitHub a Vercel y configura las variables de entorno desde el dashboard.

### Google OAuth en producción

Para activar Login con Google en Supabase:
1. Ve a tu proyecto → **Authentication → Providers → Google**
2. Actívalo y configura las credenciales de Google (desde [console.cloud.google.com](https://console.cloud.google.com))
3. Agrega la URL de redirección de Supabase en tu app de Google OAuth

---

## 🔐 Seguridad implementada

- **Límite de 2 publicaciones activas** por usuario (trigger PostgreSQL)
- **Expiración automática de 24h** (filtro en consultas + RLS)
- **Filtro de contenido prohibido** (client-side regex + server-side trigger)
- **Row Level Security** en todas las tablas
- **Reportes manuales** con feedback a la comunidad

---

## 📋 Funcionalidades MVP

| Feature | Estado |
|---------|--------|
| Auth (Email + Google) | ✅ |
| Mapa interactivo con pines por categoría | ✅ |
| Publicar con imagen y ubicación GPS | ✅ |
| Vista de lista como alternativa | ✅ |
| Chat directo en tiempo real | ✅ |
| Sistema de reportes | ✅ |
| Expiración 24h + límite 2 posts | ✅ |
| Moderación de contenido | ✅ |
| Mobile-first responsive | ✅ |
