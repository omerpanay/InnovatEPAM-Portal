# InnovatEPAM Portal — Production Ready

Full-stack innovation management platform for EPAM employees to submit, browse, and evaluate ideas.
This project has been heavily refined using a Multi-Agent architecture to reach **Presentation & Production Readiness**.

## 🚀 Key Features

* **Role-Based Access Control**: Submitters (propose) vs. Evaluators (review/approve).
* **Administrative Dashboard**: Live metrics row (Total, Submitted, Accepted, Rejected) powered by efficient SQL aggregates.
* **Real-time Idea Filtering**: Live search by text and category filters.
* **Premium EPAM Design System**: "Midnight Enterprise Minimalist" aesthetic featuring sharp geometries, deep navy contrast (`#0A0D14`), and complex micro-animations (`animate-reveal`, `hover-lift`).
* **SaaS-Style Split-Pane Profile**: Context-aware profile management preventing immutable data changes (Email).
* **Native PDF Export**: Custom `@media print` CSS delivering a pristine, black-and-white enterprise report directly from the browser.
* **Production-Ready Backend**: Complete structured logging, global exception handling, and optimized Docker multi-stage builds.

## 🛠 Tech Stack

### Backend

* **Framework**: FastAPI 0.115 (Python 3.11+)
* **Database**: PostgreSQL 15+ (async via SQLAlchemy + asyncpg)
* **Auth**: JWT (python-jose) + bcrypt
* **Migrations**: Alembic
* **Testing**: pytest (41/41 passing)

### Frontend

* **Framework**: React 19 (initialized via Vite 7)
* **Language**: TypeScript (strict mode)
* **Styling**: Tailwind CSS 4 with custom `index.css` animations
* **State/Routing**: React Router 7 + Custom Hooks (`useIdeas`, `useIdeaStats`)

### Containerization & DevOps

* **Docker Compose**: Orchestrates `db` (Postgres), `backend` (FastAPI), and `frontend` (Nginx).
* **Security**: Non-root `appuser` containers, `.env` interpolation, strict CORS matching.

## 🐳 Quick Start (Docker - Recommended)

```bash
# 1. Clone & prepare environment
cp .env.example .env
# Edit .env with your desired secrets

# 2. Build and start all services
docker compose up --build -d

# 3. Access the application
# Frontend: http://localhost:5173 (or 80)
# Backend API Docs: http://localhost:8000/docs
```

## 💻 Local Development

### Backend

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Start local DB (requires your own Postgres)
# Edit .env with your DATABASE_URL

alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🧪 Testing

### Backend Tests

```bash
# Backend
pytest tests/ -v
```

### Frontend Tests

```bash
# Frontend
cd frontend
npm run test
```

## 📁 Project Structure

```text
EpamPortal/
├── app/                        # Backend (FastAPI)
│   ├── config.py               # Env settings
│   ├── main.py                 # Factory + CORS + Root exception handler
│   ├── models/, schemas/       # ORM & Pydantic
│   ├── services/, routers/     # Business logic & Endpoints
│   └── database.py             # SQLAlchemy Async Engine
├── tests/                      # Pytest cases
├── frontend/                   # React + Vite Frontend
│   ├── src/pages/              # Dashboard, Profile, IdeaDetail
│   ├── src/components/         # UI Elements
│   ├── src/hooks/              # useIdeas, useIdeaStats, useAuth
│   └── src/index.css           # EPAM Design Tokens & Animations
├── docker-compose.yml          # Container orchestration
├── backend.Dockerfile          # Optimized Python image
└── frontend.Dockerfile         # Multi-stage Nginx image
```
