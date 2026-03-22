# PhotoCup 2026 — Platform Documentation

> **Spark of Evolution** · Mensa International Photography Competition

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Frontend — Next.js](#frontend--nextjs)
4. [Backend — FastAPI](#backend--fastapi)
5. [User Roles & Permissions](#user-roles--permissions)
6. [API Reference](#api-reference)
7. [Running with Docker (Production)](#running-with-docker-production)
8. [Running in Development](#running-in-development)
9. [Environment Variables](#environment-variables)
10. [Google Drive Sync](#google-drive-sync)
11. [2025 Photo Import](#2025-photo-import)
12. [Database](#database)
13. [Pending / Manual Tasks](#pending--manual-tasks)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Browser / Mobile                  │
└────────────────────────┬────────────────────────────┘
                         │ HTTP  (port 9080 in Docker,
                         │        3000 in dev)
┌────────────────────────▼────────────────────────────┐
│          Frontend — Next.js 16 (App Router)         │
│  src/app/**  ·  TypeScript · TailwindCSS v4         │
│  Rewrites /api/v1/* and /uploads/* → backend        │
└────────────────────────┬────────────────────────────┘
                         │ HTTP  (port 5001)
┌────────────────────────▼────────────────────────────┐
│         Backend — FastAPI (Python 3.11)             │
│  photocup-platform/backend/app/**                   │
│  SQLite DB  ·  Pillow thumbnails  ·  Google Drive   │
└─────────────────────────────────────────────────────┘
```

**Key design choices:**
- Next.js acts as a reverse proxy: all `/api/v1/*` and `/uploads/*` requests are transparently forwarded to the FastAPI backend. No CORS issues.
- Authentication is JWT (signed by `JWT_SECRET`). Tokens are stored in `localStorage` (`pc_token`).
- Images are stored in the `uploads/` directory on the backend. A compressed JPEG thumbnail (max 900 px, quality 75) is auto-generated at `uploads/thumbs/` on every upload.
- Static assets (logos, poster, PhotOlympics images) are synced from Google Drive via service account.

---

## Project Structure

```
PhotoCup_New/                          ← Git root / Next.js root
├── src/
│   ├── app/                           ← Next.js App Router pages
│   │   ├── page.tsx                   ← Landing page
│   │   ├── layout.tsx                 ← Root HTML layout + fonts
│   │   ├── globals.css                ← TailwindCSS + custom variables
│   │   ├── login/page.tsx             ← Login form
│   │   ├── dashboard/page.tsx         ← Participant dashboard
│   │   ├── submit/page.tsx            ← Photo submission
│   │   ├── judge/page.tsx             ← Judge evaluation panel
│   │   ├── admin/page.tsx             ← Admin dashboard
│   │   ├── nm-dashboard/page.tsx      ← National Coordinator dashboard
│   │   ├── results/page.tsx           ← Public results / gallery
│   │   ├── rules/page.tsx             ← Competition rules + FAQ
│   │   ├── contact/page.tsx           ← Contact form (sends real email)
│   │   └── api/
│   │       ├── v1/[...path]/route.ts  ← Proxy to FastAPI backend
│   │       └── contact/route.ts       ← Nodemailer email sender
│   ├── components/
│   │   ├── Hero.tsx                   ← Landing hero section
│   │   ├── Navbar.tsx                 ← Responsive navbar + mobile drawer
│   │   ├── PhotoUploader.tsx          ← Drag-and-drop photo upload
│   │   └── RouteGuard.tsx             ← Auth + role gate for protected pages
│   └── lib/
│       ├── api.ts                     ← Typed API client (all fetch calls)
│       ├── auth.tsx                   ← Auth context (JWT decode, role mapping)
│       ├── utils.ts                   ← cn() helper (clsx + tailwind-merge)
│       └── exif.ts                    ← Client-side EXIF extraction (exifr)
├── public/                            ← Static assets served at /
│   ├── photocup26-logo-W.png          ← White logo (navbar, footer)
│   ├── photocup26-logo-G.png          ← Gold logo
│   ├── poster2026.jpg                 ← Hero background image
│   ├── photolympics26-W/G.png         ← PhotOlympics logos
│   ├── mi-logo-D/L.png                ← Mensa International logos
│   ├── spark-W.png / spark.png        ← SPARK wordmark
│   ├── spark-image.jpg                ← Hero poster without text
│   └── winners2025/1-10.webp          ← 2025 winner photos (gallery)
├── docker-compose.yml                 ← MAIN Docker Compose file
├── Dockerfile                         ← Next.js multi-stage build
├── next.config.ts                     ← Next.js config + proxy rewrites
├── package.json                       ← Node dependencies
├── .env.local                         ← SMTP credentials (not committed)
└── photocup-platform/
    └── backend/
        ├── app/
        │   ├── main.py                ← FastAPI app init + CORS + static
        │   ├── core/
        │   │   ├── config.py          ← Settings (JWT_SECRET, etc.)
        │   │   └── security.py        ← JWT create/verify, bcrypt hash
        │   ├── db/session.py          ← SQLAlchemy engine + SessionLocal
        │   ├── models/
        │   │   ├── user.py            ← User model + UserRole enum
        │   │   └── photo.py           ← Photo model + Score model
        │   └── api/
        │       ├── deps.py            ← get_current_user dependency
        │       └── v1/
        │           ├── api.py         ← Router aggregator
        │           └── endpoints/
        │               ├── auth.py        ← POST /auth/login
        │               ├── users.py       ← CRUD /users/
        │               ├── photos.py      ← Upload, score, stats, etc.
        │               ├── analytics.py   ← Governance metrics
        │               └── drive_sync.py  ← Google Drive asset sync
        ├── uploads/                   ← Uploaded photos (Docker volume)
        │   └── thumbs/                ← Auto-generated thumbnails
        ├── photocup.db                ← SQLite database (not committed)
        ├── import_2025.py             ← One-time 2025 photo import script
        ├── requirements.txt           ← Python dependencies
        └── Dockerfile                 ← Python 3.11-slim image
```

---

## Frontend — Next.js

### Pages & Routes

| Route | Page | Access | Description |
|-------|------|--------|-------------|
| `/` | `page.tsx` | Public | Landing page: hero, categories, timeline, PhotOlympics, rules teaser |
| `/login` | `login/page.tsx` | Public | Email + password login form |
| `/rules` | `rules/page.tsx` | Public | Full competition rules + FAQ |
| `/results` | `results/page.tsx` | Public | Scores leaderboard / gallery |
| `/contact` | `contact/page.tsx` | Public | Contact form — real email via SMTP |
| `/submit` | `submit/page.tsx` | PARTICIPANT | Upload photos (max 3 per participant) |
| `/dashboard` | `dashboard/page.tsx` | PARTICIPANT | View own submitted photos |
| `/judge` | `judge/page.tsx` | JUDGE | Blind evaluation panel (5 criteria) |
| `/nm-dashboard` | `nm-dashboard/page.tsx` | COORDINATOR | Country-scoped stats + upload on behalf |
| `/admin` | `admin/page.tsx` | ADMIN | Full system management |

### Key Libraries

| Library | Purpose |
|---------|---------|
| `framer-motion` | Page/element animations |
| `lucide-react` | Icons |
| `exifr` | Client-side EXIF extraction before upload |
| `tailwindcss` v4 | Utility CSS (custom: `glass`, `grad-gold`, `grad-premium`, `glow-gold`) |
| `nodemailer` | Server-side email sending (contact form) |

### Auth Flow (`src/lib/auth.tsx`)

1. User submits credentials → `POST /api/v1/auth/login` → receives JWT
2. JWT stored in `localStorage` as `pc_token`
3. `useAuth()` hook decodes the token client-side to extract `role` and `email`
4. `RouteGuard` component redirects unauthenticated/unauthorised users
5. All API calls attach `Authorization: Bearer <token>` header

### Judging Criteria (5 criteria, 1–10 each)

| Field (DB) | Display Name | Description |
|-----------|--------------|-------------|
| `impact` | Relevance to Theme | How well the image captures "Spark of Evolution" |
| `story` | Emotional Impact | Power to evoke emotions |
| `creativity` | Creativity & Original Vision | Originality of interpretation |
| `composition` | Composition & Visual Balance | Framing, light, space, visual harmony |
| `technique` | Technical Execution | Sharpness, exposure, colour accuracy |

**Total score** = arithmetic mean of the 5 criteria (range 0–10).

---

## Backend — FastAPI

### Endpoints

#### Auth (`/api/v1/auth`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/login` | Returns JWT. OAuth2 form fields: `username` + `password` |

#### Users (`/api/v1/users`)
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/users/` | ADMIN | List all users |
| POST | `/users/` | ADMIN | Create user |
| PUT | `/users/{id}` | ADMIN | Update user |
| DELETE | `/users/{id}` | ADMIN | Delete user |

#### Photos (`/api/v1/photos`)
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/photos/` | Authenticated | List all photos (includes thumbnail_path) |
| GET | `/photos/my` | PARTICIPANT | Own photos |
| GET | `/photos/stats` | Authenticated | Leaderboard + category/country stats |
| POST | `/photos/upload` | PARTICIPANT | Upload photo → auto-generates thumbnail |
| POST | `/photos/{id}/score` | JUDGE | Submit/update 5-criteria score |
| GET | `/photos/my-evaluations` | JUDGE | Own evaluation history |
| GET | `/photos/judge-detail` | JUDGE | Detailed score breakdown per photo |
| POST | `/photos/generate-thumbs` | ADMIN | Batch-generate thumbnails for all photos |
| DELETE | `/photos/my/{id}` | PARTICIPANT | Delete own photo |
| DELETE | `/photos/remove-item/{id}` | ADMIN | Delete any photo |
| GET | `/photos/coordinator/my-country-photos` | COORDINATOR | Country-scoped photos |
| GET | `/photos/coordinator/stats` | COORDINATOR | Country stats |
| GET | `/photos/coordinator/participants` | COORDINATOR | Country participants |
| POST | `/photos/coordinator/upload` | COORDINATOR | Upload on behalf of participant |
| DELETE | `/photos/coordinator/remove/{id}` | COORDINATOR | Remove own-country photo |

#### Analytics (`/api/v1/analytics`)
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/analytics/governance` | ADMIN | Governance metrics: participation, judging, results |

#### Drive Sync (`/api/v1/drive`)
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/drive/sync` | ADMIN | Download/update static assets from Google Drive |
| GET | `/drive/status` | ADMIN | Check local vs Drive file status per asset |

### Data Models

**User**
```
id, email, hashed_password, full_name,
role: ADMIN | PARTICIPANT | JUDGE | NATIONAL_COORDINATOR,
country, mensa_number, is_active
```

**Photo**
```
id, title, description, file_path, thumbnail_path,
mime_type, file_size, owner_id (→User),
country, category, metadata_exif (JSON), created_at
```

**Score**
```
id, photo_id (→Photo), judge_id (→User),
impact, story, creativity, composition, technique  (Integer 1–10),
total_score (Float, avg of 5), comment, created_at
```

---

## User Roles & Permissions

| Role | Access |
|------|--------|
| `PARTICIPANT` | Submit photos (max 3), view own submissions, view results |
| `JUDGE` | Blind evaluation of all photos using 5 criteria, edit own scores |
| `NATIONAL_COORDINATOR` | View + upload photos for their assigned country, country stats |
| `ADMIN` | Full access: users, all photos, analytics, Drive sync, thumbnail generation |

Default password for 2025 imported users: `PhotoCup2025!`

---

## Running with Docker (Production)

### Prerequisites
- Docker Desktop running
- Service account JSON at `photocup-platform/backend/photocupapp-service-account.json`

### Start

```bash
# Build and start (first time or after code changes)
docker compose up --build -d

# Start without rebuild (after docker compose down)
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

### URLs

| Service | URL |
|---------|-----|
| App (frontend) | http://localhost:9080 |
| API | http://localhost:5001 |
| Swagger UI | http://localhost:5001/docs |

### Data persistence

| Docker Volume | Mount inside container | Contents |
|--------------|----------------------|----------|
| `backend-uploads` | `/app/uploads` | Photos + thumbnails |
| `backend-db` | `/app` | `photocup.db` SQLite file |

Data survives `docker compose down` / `up`. To wipe everything: `docker compose down -v`.

### Database backup / restore

```bash
# Backup
docker cp photocup-backend:/app/photocup.db ./backup_$(date +%Y%m%d).db

# Restore
docker cp ./backup_YYYYMMDD.db photocup-backend:/app/photocup.db
docker compose restart backend
```

### Create first admin user

```bash
curl -X POST http://localhost:5001/api/v1/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@photocup.org",
    "password": "StrongPassword123",
    "full_name": "PhotoCup Admin",
    "role": "ADMIN",
    "country": "Global"
  }'
```

---

## Running in Development

### Backend

```bash
cd photocup-platform/backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 5001
```

### Frontend

```bash
# From project root
npm install
npm run dev
# → http://localhost:3000
```

---

## Environment Variables

### `.env.local` (project root — contact form SMTP)

```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=photocup@mensa.org
SMTP_PASS=YOUR_SMTP_PASSWORD
CONTACT_TO=photocup@mensa.org
```

### `photocup-platform/backend/.env`

```env
JWT_SECRET=your-strong-secret-key
DATABASE_URL=sqlite:///./photocup.db
```

---

## Google Drive Sync

Assets are synced from the **PhotoCup-in-a-box 2026** folder shared with:
`photocup-app@photocupapp.iam.gserviceaccount.com`

**From Admin panel:** Overview tab → Drive Sync section → **Sync Now**

**Via API:**
```bash
curl -X POST http://localhost:5001/api/v1/drive/sync \
  -H "Authorization: Bearer YOUR_ADMIN_JWT"
```

Files synced: all logos, poster, PhotOlympics images (11 files total).
Comparison is based on Drive `modifiedTime` — unchanged files are skipped.

---

## 2025 Photo Import

207 photos from 17 countries imported from Google Drive.
Script: `photocup-platform/backend/import_2025.py`

```bash
cd photocup-platform/backend
venv\Scripts\activate
python import_2025.py            # Full import (idempotent — skips duplicates)
python import_2025.py --dry-run  # Preview only
python import_2025.py --limit 5  # Import first 5 only
```

After import, generate thumbnails via Admin → Photos → **Gen. Thumbs**.

---

## Database

**Engine:** SQLite · **ORM:** SQLAlchemy 2.0

```bash
# Access directly (development)
cd photocup-platform/backend
sqlite3 photocup.db

.tables
SELECT count(*) FROM photos;
SELECT count(*) FROM scores;
SELECT role, count(*) FROM users GROUP BY role;
```

**Note:** SQLite does not support `DROP COLUMN`. To add columns:
```sql
ALTER TABLE scores ADD COLUMN new_col INTEGER DEFAULT 0;
```

---

## Pending / Manual Tasks

| Task | Command / Location |
|------|--------------------|
| Generate thumbnails for 2025 photos | Admin → Photos → **Gen. Thumbs** |
| Install nodemailer (contact form email) | `npm install nodemailer @types/nodemailer` in project root |
| Configure SMTP credentials | Edit `.env.local` at project root |
| Delete legacy Vite frontend (safe) | `photocup-platform/frontend/` — not used in Docker |
| Delete duplicate winners folder (safe) | Root-level `"winners 2025/"` — already in `public/winners2025/` |
| Delete old Python venvs (safe) | `photocup-platform/backend/venv/` and `venv_new/` |

---

## Contact

| Role | Email |
|------|-------|
| General Inquiry | photocup@mensa.org |
| Technical Support | rupesh.baitha@mensa.org |
| Press & Media | marketing@mensa.org |

---

*PhotoCup 2026 Platform v2 — Updated March 2026*
