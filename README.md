# AI Habit Tracker

AI Habit Tracker is a full-stack habit-building app for creating routines, recording daily progress, and understanding consistency over time. Its dashboards and statistics help make progress visible, while optional AI coaching turns habit history into weekly reflections, suggestions, and recovery plans.

## What the project does

- Register and sign in with a personal account.
- Create, edit, reorder, archive, and delete habits.
- Mark habits complete and review daily and historical activity.
- Track streaks, completion statistics, charts, and a completion heatmap.
- Use optional Gemini-powered habit suggestions, weekly reports, recovery plans, morning motivation, and habit-data chat.
- Use the responsive interface with light and dark themes.

AI coaching requires a Gemini API key on the backend. The rest of the tracker works without it.

## Project structure

```text
.
├── backend/       Express API, MongoDB models, authentication, and AI services
├── frontend/      React and Vite application
└── README.md
```

The frontend communicates with the backend over the `/api` endpoints. The backend stores account, habit, and completion data in MongoDB; protected API routes use JWT bearer tokens.

## Requirements

- Node.js and npm
- A MongoDB database (local or hosted, such as MongoDB Atlas)
- A Gemini API key only if you want to enable AI coaching

## Run locally

Open two terminals from the project root.

### 1. Configure and run the backend

Create `backend/.env`:

```env
PORT=8000
MONGO_URI=mongodb://127.0.0.1:27017/ai-habit-tracker
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=30d
CLIENT_URL=http://localhost:5173

# Optional: enable Gemini-powered features
GEMINI_API_KEY=your-gemini-api-key
# Optional; defaults to gemini-2.5-flash
GEMINI_MODEL=gemini-2.5-flash
```

Install dependencies and start the API:

```bash
cd backend
npm install
npm run dev
```

The API listens on `http://localhost:8000` by default. Check `http://localhost:8000/api/health` for its health response.

### 2. Configure and run the frontend

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

Install dependencies and start Vite:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`).

## Environment variables

### Backend

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret used to sign and verify authentication tokens |
| `CLIENT_URL` | For deployed frontend | Comma-separated frontend origins allowed by CORS |
| `PORT` | No | API port; defaults to `8000` locally and uses the host-provided port in deployment |
| `JWT_EXPIRES_IN` | No | Token lifetime; defaults to `30d` |
| `GEMINI_API_KEY` | No | Enables AI coaching |
| `GEMINI_MODEL` | No | Gemini model; defaults to `gemini-2.5-flash` |

Keep secrets in environment configuration, not in source control. For multiple frontend origins, set `CLIENT_URL` to a comma-separated list, for example `https://your-app.vercel.app,https://preview.example.com`.

### Frontend

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | For deployment | Backend API base URL, including `/api`; defaults to `http://localhost:8000/api` |

Vite embeds frontend environment values at build time. Set or update `VITE_API_URL` before building or redeploying the frontend.

## API overview

All API routes are under `/api`.

| Route | Purpose |
| --- | --- |
| `GET /health` | Health check |
| `/auth` | Registration, login, current-user lookup, and profile updates |
| `/habits` | Habit creation, listing, updates, reordering, archiving, and deletion |
| `/logs` | Habit completion and history, heatmap, and statistics |
| `/ai` | Optional AI reports, suggestions, recovery plans, chat, and morning messages |

Habit, log, and AI endpoints require authentication.

## Deploy

### Backend (Render or another Node.js host)

1. Deploy the `backend` directory as a Node.js service.
2. Use `npm install` as the install command and `npm start` as the start command.
3. Configure `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL` in the service environment. Add `GEMINI_API_KEY` if AI coaching is desired.
4. Set `CLIENT_URL` to the exact origin of the deployed frontend, such as `https://your-app.vercel.app` (no `/api` path). Separate multiple allowed origins with commas.
5. After deployment, check `https://your-backend-host/api/health`.

### Frontend (Vercel)

1. Deploy the `frontend` directory as the Vercel project root.
2. Set `VITE_API_URL` to the backend URL plus `/api`, for example `https://your-backend.onrender.com/api`.
3. Redeploy after changing frontend environment variables.
4. Ensure the backend's `CLIENT_URL` contains the exact Vercel origin. If you use Vercel preview deployments, add the relevant preview origin(s) to that comma-separated allowlist.

The Vercel configuration in `frontend/vercel.json` sends app routes to `index.html` so client-side routes can load directly.

## Useful commands

Run commands from the corresponding directory:

```bash
# backend
npm run dev
npm start
npm run seed

# frontend
npm run dev
npm run build
npm run lint
npm run preview
```

The seed script creates sample habit data for a demo account. Review `backend/scripts/seed.js` before running it against a database with data you want to keep.
