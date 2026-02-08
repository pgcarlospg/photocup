# PhotoCup Platform 2026 - Monorepo

MVP robusto para el concurso internacional de fotografía.

### Stack
- **Backend:** Python + FastAPI + PostgreSQL + SQLAlchemy + Alembic
- **Frontend:** React + Vite + Tailwind CSS + Tremor
- **Storage:** MinIO (S3 Compatible)
- **Deployment:** Docker Compose

### Requisitos
- Docker & Docker Compose

### Instalación y Arranque
1. Clona el repositorio.
2. Copia el archivo de ejemplo de variables de entorno:
   ```bash
   cp .env.example .env
   ```
3. Levanta la plataforma completa:
   ```bash
   docker compose up --build
   ```

### URLs de Acceso
- **Frontend:** [http://localhost:4000](http://localhost:4000)
- **Backend API Docs:** [http://localhost:4001/api/docs](http://localhost:4001/api/docs)
- **MinIO API:** [http://localhost:4002](http://localhost:4002)
- **MinIO Console:** [http://localhost:9001](http://localhost:9001) (User: `minioadmin` / Pass: `minioadmin123`)

### Usuarios de Prueba (Seed Demo)
| Rol | Email | Password |
| :--- | :--- | :--- |
| **ADMIN** | admin@photocup.com | `admin123` |
| **JUDGE** | judge@photocup.com | `judge123` |
| **PARTICIPANT** | user@photocup.com | `user123` |

### Funcionalidades Implementadas
- [x] Estructura Monorepo
- [x] Dockerization (Frontend, Backend, DB, S3)
- [x] Esquema de Base de Datos (Users, Photos, Scores)
- [x] Dashboard de Administración con Insights (React + Tremor)
- [x] Paleta de colores Mensa (#FAAA00, #052C65)
- [x] Configuración de seguridad con JWT
