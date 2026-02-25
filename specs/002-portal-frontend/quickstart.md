# Quickstart: InnovatEPAM Portal Frontend

## Prerequisites

- Node.js 18+ and npm 9+
- Backend running at `http://localhost:8000` (see root README)

## Setup

```bash
cd frontend
npm install
```

## Development

```bash
npm run dev
```

Opens at `http://localhost:5173`. Hot-reloads on file save.

## Testing

```bash
npm run test
```

Runs Vitest in watch mode.

## Build

```bash
npm run build
npm run preview
```

## Environment

Create `frontend/.env` if you need to override the API URL:

```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Project Structure

```text
frontend/
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.json
├── .env
├── public/
├── src/
│   ├── main.tsx                 # Entry point
│   ├── App.tsx                  # Router setup
│   ├── api/
│   │   └── client.ts            # Axios instance + interceptors
│   ├── context/
│   │   └── AuthContext.tsx       # JWT token + user role state
│   ├── components/
│   │   ├── Layout.tsx            # Navbar + page wrapper
│   │   ├── ProtectedRoute.tsx    # Auth guard
│   │   ├── IdeaCard.tsx          # Dashboard card component
│   │   ├── IdeaForm.tsx          # Create idea form
│   │   ├── EvaluationPanel.tsx   # Evaluate idea form
│   │   ├── StatusBadge.tsx       # Status pill component
│   │   ├── Pagination.tsx        # Page controls
│   │   └── ErrorBanner.tsx       # Global error display
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── IdeaDetailPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── hooks/
│   │   ├── useIdeas.ts           # Fetch + filter ideas
│   │   └── useAuth.ts            # Auth context convenience hook
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   └── utils/
│       └── constants.ts          # Categories, routes, etc.
└── __tests__/
    ├── LoginPage.test.tsx
    ├── DashboardPage.test.tsx
    └── IdeaForm.test.tsx
```
