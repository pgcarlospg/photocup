# PhotoCup 2026 — Guía de Desarrollo y Despliegue

> Instrucciones completas para trabajar con la plataforma desde cualquier IDE y desplegar a producción sin errores.

---

## Índice

1. [Arquitectura del sistema](#1-arquitectura-del-sistema)
2. [Funciones de la aplicación](#2-funciones-de-la-aplicación)
3. [Entorno de desarrollo local](#3-entorno-de-desarrollo-local)
4. [Despliegue a producción](#4-despliegue-a-producción)
5. [Flujo de trabajo recomendado](#5-flujo-de-trabajo-recomendado)
6. [Variables de entorno](#6-variables-de-entorno)
7. [Base de datos](#7-base-de-datos)
8. [Solución de problemas comunes](#8-solución-de-problemas-comunes)

---

## 1. Arquitectura del sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCCIÓN: app.photocup.es                  │
│                   Servidor: 137.116.202.64 (Ubuntu)             │
│                                                                 │
│  ┌─────────────┐       ┌──────────────────────────────────┐    │
│  │   NGINX     │ :443  │  Docker Compose                  │    │
│  │  (SSL/TLS)  │──────▶│                                  │    │
│  │             │  /    │  ┌─────────────────────────┐    │    │
│  │  Let's      │──────▶│  │ frontend (Next.js 16)   │    │    │
│  │  Encrypt    │       │  │ Container: :9080→:3000   │    │    │
│  │             │/api/v1│  └─────────────────────────┘    │    │
│  │             │──────▶│  ┌─────────────────────────┐    │    │
│  │             │       │  │ backend (FastAPI Py3.11) │    │    │
│  └─────────────┘       │  │ Container: :5001→:5001   │    │    │
│                         │  └─────────────────────────┘    │    │
│                         │  Volúmenes Docker:               │    │
│                         │  · backend-uploads (fotos)       │    │
│                         │  · backend-db (photocup.db)      │    │
│                         └──────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    DESARROLLO LOCAL                             │
│                                                                 │
│  Navegador → localhost:3000 (Next.js dev server)               │
│                    │                                            │
│                    ▼ /api/v1/* (route handler Next.js)         │
│            https://app.photocup.es/api/v1/*  (backend prod)    │
│                                                                 │
│  NO se necesita backend local. El frontend local usa el        │
│  backend de producción vía BACKEND_URL en .env.local           │
└─────────────────────────────────────────────────────────────────┘
```

### Flujo de una petición API

**En producción** (`https://app.photocup.es/api/v1/photos/`):
```
Navegador → NGINX :443 → Backend FastAPI :5001/api/v1/photos/
```
nginx tiene `/api/v1/` configurado como proxy directo al backend.

**En desarrollo** (`http://localhost:3000/api/v1/photos/`):
```
Navegador → Next.js dev :3000 → Route Handler (server-side)
         → https://app.photocup.es/api/v1/photos/ (BACKEND_URL)
```
El route handler en `src/app/api/v1/[...path]/route.ts` actúa como proxy.

### Autenticación

- JWT (HS256) firmado por el backend con `JWT_SECRET`
- Token almacenado en `localStorage` como `pc_token` y `pc_role`
- Expira en 365 días
- El `AuthProvider` (React Context) gestiona el estado de sesión

---

## 2. Funciones de la aplicación

### Roles de usuario

| Rol | Código | Descripción |
|-----|--------|-------------|
| Administrador | `ADMIN` | Acceso total: usuarios, fotos, analíticas, Drive sync |
| Participante | `PARTICIPANT` | Sube fotos (máx 3), ve sus envíos |
| Juez | `JUDGE` | Evalúa fotos con 5 criterios (1-10) |
| Coordinador Nacional | `NATIONAL_COORDINATOR` | Gestiona su país, sube fotos en nombre de participantes |

### Páginas y rutas

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/` | Público | Landing page: hero, categorías, timeline |
| `/login` | Público | Formulario de login con JWT |
| `/rules` | Público | Normas de la competición |
| `/results` | Público | Ranking y galería de ganadores |
| `/contact` | Público | Formulario de contacto (envía email real vía SMTP) |
| `/submit` | PARTICIPANT | Sube fotos con metadatos EXIF |
| `/dashboard` | PARTICIPANT | Ve sus fotos enviadas |
| `/judge` | JUDGE | Panel de evaluación ciego (5 criterios) |
| `/nm-dashboard` | COORDINATOR | Stats de su país, sube en nombre de participantes |
| `/admin` | ADMIN | Panel completo: usuarios, fotos, analíticas, Drive sync |

### Criterios de evaluación (jueces)

| Campo BD | Nombre | Descripción |
|----------|--------|-------------|
| `impact` | Relevancia al tema | Refleja "Spark of Evolution" |
| `story` | Impacto emocional | Capacidad de evocar emociones |
| `creativity` | Creatividad | Originalidad de interpretación |
| `composition` | Composición | Encuadre, luz, equilibrio visual |
| `technique` | Técnica | Nitidez, exposición, color |

**Puntuación total** = media aritmética de los 5 criterios (rango 0-10)

---

## 3. Entorno de desarrollo local

### Requisitos previos

- Node.js 20+
- npm
- Git
- Acceso a internet (el backend local usa el servidor de producción)

### Configuración inicial (una sola vez)

```bash
# 1. Clonar el repositorio
git clone https://github.com/pgcarlospg/photocup.git
cd photocup

# 2. Instalar dependencias
npm install

# 3. Crear archivo de entorno local (si no existe)
# El archivo .env.local ya está en el repositorio con la configuración correcta
# Contiene: BACKEND_URL=https://app.photocup.es
# NO hace falta modificarlo para desarrollo estándar
```

### Arrancar el servidor de desarrollo

```bash
# Desde la raíz del proyecto
npm run dev
# → http://localhost:3000
```

El servidor de desarrollo:
- Conecta automáticamente al backend de producción (`https://app.photocup.es`)
- Los cambios en el código se reflejan en tiempo real (hot reload)
- Puedes usar las mismas credenciales que en producción

### Credenciales de prueba

| Email | Contraseña | Rol |
|-------|-----------|-----|
| `alex@photocup.com` | `alex` | ADMIN |
| `admin@photocup.com` | *(preguntar al equipo)* | ADMIN |

---

## 4. Despliegue a producción

### Método estándar (recomendado)

```bash
# 1. Hacer los cambios en tu IDE (cualquiera: VS Code, Cursor, Windsurf...)

# 2. Commit de los cambios
git add .
git commit -m "descripción del cambio"

# 3. Push al repositorio
git push origin main

# 4. Conectar al servidor de producción
ssh carlos@137.116.202.64
# Contraseña: CP8640sz

# 5. En el servidor: pull y rebuild
cd ~/Photocup_New
git pull origin main

# Si solo cambiaron archivos del frontend (src/, public/, next.config.ts, Dockerfile):
docker compose build frontend && docker compose up -d frontend

# Si solo cambiaron archivos del backend (photocup-platform/backend/):
docker compose build backend && docker compose up -d backend

# Si cambiaron ambos:
docker compose build && docker compose up -d
```

### Qué rebuild hacer según el cambio

| Cambio en | Rebuild necesario |
|-----------|------------------|
| `src/`, `public/`, `next.config.ts` | Solo `frontend` |
| `photocup-platform/backend/app/` | Solo `backend` |
| `Dockerfile` (raíz) | Solo `frontend` |
| `photocup-platform/backend/Dockerfile` | Solo `backend` |
| `docker-compose.yml` | Ambos (`docker compose up -d` sin build si es solo config) |

### Verificar el estado en producción

```bash
# Ver contenedores
docker compose ps

# Ver logs en tiempo real
docker compose logs -f

# Ver solo logs del frontend
docker compose logs -f frontend

# Ver solo logs del backend
docker compose logs -f backend
```

### URLs de producción

| Servicio | URL |
|---------|-----|
| Aplicación | https://app.photocup.es |
| API Swagger | https://app.photocup.es/api/docs |
| API ReDoc | https://app.photocup.es/api/redoc |

---

## 5. Flujo de trabajo recomendado

```
1. DESARROLLAR
   └── Editar código en IDE local
   └── Probar en localhost:3000
   └── Login con alex@photocup.com / alex

2. COMMIT
   └── git add <archivos>
   └── git commit -m "descripción clara"

3. PUSH
   └── git push origin main

4. DEPLOY
   └── ssh carlos@137.116.202.64
   └── cd ~/Photocup_New && git pull origin main
   └── docker compose build frontend && docker compose up -d frontend
   └── (o backend según lo que cambió)

5. VERIFICAR
   └── docker compose ps  (ver que esté healthy)
   └── Abrir https://app.photocup.es
   └── Login y prueba rápida
```

### Comandos útiles en el servidor

```bash
# Estado de los contenedores
docker compose ps

# Reiniciar solo un servicio
docker compose restart frontend
docker compose restart backend

# Parar todo (los datos se conservan en volúmenes)
docker compose down

# Parar y eliminar TODO incluyendo datos (¡CUIDADO!)
docker compose down -v

# Backup de la base de datos
docker cp photocup-backend:/app/data/photocup.db ./backup_$(date +%Y%m%d).db

# Restaurar base de datos
docker cp ./backup_20260322.db photocup-backend:/app/data/photocup.db
docker compose restart backend

# Ver espacio usado por volúmenes
docker system df -v
```

---

## 6. Variables de entorno

### `.env.local` (raíz del proyecto — desarrollo local)

```env
# URL del backend — apunta a producción para desarrollo local
BACKEND_URL=https://app.photocup.es

# SMTP para el formulario de contacto (opcional en dev)
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=photocup@mensa.org
SMTP_PASS=TU_CONTRASEÑA_SMTP
CONTACT_TO=photocup@mensa.org
```

### `photocup-platform/backend/.env` (backend — producción)

```env
JWT_SECRET=tu-clave-secreta-segura
DATABASE_URL=sqlite:///./photocup.db
```

### Docker Compose (producción)

En `docker-compose.yml`:
```yaml
frontend:
  environment:
    - BACKEND_URL=http://backend:5001   # URL interna Docker

backend:
  environment:
    - JWT_SECRET=${JWT_SECRET:-supersecretkey}
    - DATABASE_URL=sqlite:////app/data/photocup.db
```

**Importante**: En Docker, el frontend se comunica con el backend usando `http://backend:5001` (nombre del servicio Docker), no la URL pública.

---

## 7. Base de datos

- **Motor**: SQLite (archivo `photocup.db`)
- **ORM**: SQLAlchemy 2.0
- **Ubicación en producción**: Volumen Docker `backend-db`, montado en `/app/data/`

### Tablas principales

| Tabla | Descripción |
|-------|-------------|
| `users` | Usuarios con rol, país, email |
| `photos` | Fotos enviadas con metadatos EXIF |
| `scores` | Puntuaciones de los jueces (5 criterios) |

### Acceder a la BD en producción

```bash
# Desde el servidor, ejecutar Python dentro del contenedor
docker exec -it photocup-backend python3 -c "
from app.db.session import SessionLocal
from app.models.user import User
db = SessionLocal()
users = db.query(User).all()
for u in users:
    print(u.email, u.role)
"
```

### Backup automático recomendado

```bash
# Añadir al crontab del servidor (crontab -e):
0 2 * * * docker cp photocup-backend:/app/data/photocup.db /home/carlos/backups/photocup_$(date +\%Y\%m\%d).db
```

---

## 8. Solución de problemas comunes

### "Failed to fetch" al hacer login

**Causa**: El servidor estaba caído o reiniciándose durante el intento.
**Solución**: Esperar 30 segundos y volver a intentar.
```bash
# Verificar estado
docker compose ps
# Si está "starting", esperar a que sea "healthy"
```

### El login funciona pero rebota de vuelta al formulario

**Causa**: Versión antigua del JavaScript en caché del navegador.
**Solución**: Hard refresh en el navegador:
- Chrome/Edge: `Ctrl + Shift + R`
- Firefox: `Ctrl + Shift + R`
- Safari: `Cmd + Shift + R`

O abre el navegador en modo incógnito para probar.

### "not found" en rojo al cargar el admin

**Causa**: El token JWT expiró o el servidor se reinició con una clave diferente.
**Solución**: Cerrar sesión y volver a hacer login.

### El servidor de producción no responde

```bash
# Ver si los contenedores están corriendo
docker compose ps

# Reiniciar si es necesario
docker compose up -d

# Ver si hay errores
docker compose logs --tail=50
```

### Error al hacer `docker compose build`

```bash
# Limpiar caché de Docker si hay problemas raros
docker builder prune -f

# Reconstruir sin caché
docker compose build --no-cache frontend
```

### Error de git en el servidor (objeto vacío)

```bash
# El repositorio tiene un objeto corrupto (error benigno)
cd ~/Photocup_New
rm -f .git/gc.log
git gc --aggressive 2>/dev/null || true
git pull origin main
```

---

## Estructura del proyecto

```
PhotoCup_New/                          ← Raíz del proyecto / Next.js
├── src/
│   ├── app/                           ← Next.js App Router
│   │   ├── page.tsx                   ← Landing page (/)
│   │   ├── login/page.tsx             ← Login
│   │   ├── dashboard/page.tsx         ← Dashboard participante
│   │   ├── submit/page.tsx            ← Envío de fotos
│   │   ├── judge/page.tsx             ← Panel de jueces
│   │   ├── admin/page.tsx             ← Panel administrador
│   │   ├── nm-dashboard/page.tsx      ← Dashboard coordinador nacional
│   │   ├── results/page.tsx           ← Resultados públicos
│   │   ├── rules/page.tsx             ← Normas
│   │   ├── contact/page.tsx           ← Contacto
│   │   └── api/
│   │       ├── v1/[...path]/route.ts  ← Proxy al backend FastAPI
│   │       └── contact/route.ts       ← Envío de email (nodemailer)
│   ├── components/
│   │   ├── Navbar.tsx                 ← Barra de navegación
│   │   ├── RouteGuard.tsx             ← Protección de rutas por rol
│   │   └── PhotoUploader.tsx          ← Subida de fotos drag & drop
│   └── lib/
│       ├── api.ts                     ← Cliente API tipado (todas las llamadas)
│       ├── auth.tsx                   ← Contexto de autenticación (JWT)
│       ├── utils.ts                   ← Utilidades CSS (cn helper)
│       └── exif.ts                    ← Extracción EXIF del cliente
├── public/                            ← Assets estáticos (logos, imágenes)
├── docker-compose.yml                 ← Orquestación Docker (PRINCIPAL)
├── Dockerfile                         ← Build multi-stage del frontend
├── next.config.ts                     ← Configuración Next.js + proxy uploads
├── .env.local                         ← Variables de entorno locales (no en git)
└── photocup-platform/
    └── backend/
        ├── app/
        │   ├── main.py                ← FastAPI app init + CORS
        │   ├── api/v1/endpoints/      ← Endpoints: auth, users, photos, analytics
        │   ├── models/                ← Modelos SQLAlchemy (User, Photo, Score)
        │   ├── core/                  ← JWT, configuración
        │   └── db/                    ← Sesión SQLAlchemy
        ├── requirements.txt           ← Dependencias Python
        ├── Dockerfile                 ← Imagen Python 3.11
        └── import_2025.py             ← Script importación fotos 2025
```

---

*PhotoCup 2026 Platform — Actualizado Marzo 2026*
