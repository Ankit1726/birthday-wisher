# 🎂 Birthday Wish Album

A private, animated "birthday wish album" you build for someone special: her photo in
a locket that opens on tap, a wish message, a song playlist, and cake/confetti/balloon
animations — in a dark theme with a pink accent that you pick per album.

Built exactly to the blueprint: **Login & Authentication** page → **Birthday Wish +
Photo + Song Album Card** page → shareable public album with animations, upload to
MongoDB cloud DB, and a footer credit ("By ♥ {creator} — special for {her name}").

## Stack

| Layer     | Tech |
|-----------|------|
| Frontend  | Plain HTML / CSS / JS (no build step) — dark theme, pink variants, CSS+canvas animations |
| Backend   | FastAPI (Python), JWT auth, async Mongo driver (Motor) |
| Database  | MongoDB Atlas (cloud) — stores users, albums, and uploaded photos/songs as documents |
| Deploy    | Docker (single image serves both API and frontend) + Render |

## Project structure

```
.
├── Dockerfile
├── docker-compose.yml
├── app.py                  ← FastAPI app, mounts frontend, CORS, lifespan
├── backend/
│   ├── config.py            ← reads environment variables
│   ├── database/            ← Mongo connection and Pydantic models
│   ├── auth/                ← JWT authentication
│   ├── keepalive.py         ← optional self-ping job
│   └── routes/              ← auth, album, and health endpoints
│           ├── auth.py     ← /api/auth/register, /api/auth/login
│           ├── album.py    ← album CRUD + photo/song upload + public view
│           └── health.py   ← /health
└── frontend/
    ├── index.html          ← Page 1: Login & Authentication (blueprint page 1)
    ├── dashboard.html      ← Your albums, "Create New Album" button
    ├── create.html         ← Page 2: photo + wish + theme + songs (blueprint page 2)
    ├── album.html          ← Public animated album (locket, cake, confetti, player)
    ├── css/style.css       ← dark theme, 4 pink variants, all animations
    └── js/                 ← api.js, auth.js, create.js, album.js, hearts.js, confetti.js
```

## 1. Set up MongoDB Atlas (cloud DB)

1. Create a free cluster at https://www.mongodb.com/cloud/atlas.
2. Under **Database Access**, create a database user + password.
3. Under **Network Access**, allow access from anywhere (`0.0.0.0/0`) so Render can connect.
4. Copy the connection string — it looks like
   `mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`.

## 2. Configure secrets (.env)

```bash
cp backend/.env.example backend/.env
```

Then edit `.env` and fill in real values for:
- `MONGO_URI` — the Atlas connection string from step 1
- `JWT_SECRET` — any long random string (used to sign login sessions)
- `SELF_URL` — leave blank for now; fill in **after** your first Render deploy (step 5)

`.env` is already excluded from Docker builds via `.dockerignore` and should
never be committed to git — it holds every secret the app needs.

## 3. Run it locally

```bash
pip install -r requirements.txt   # use a venv on local development
uvicorn app:app --reload --port 8000
```

Open http://localhost:8000 — the FastAPI app serves the login page and all static assets.
Create an account with a username → you land on the dashboard → "Create New Album" → fill in
the recipient, custom birthday date, photo, wish, theme, and songs → Save → you get a shareable link like
`/album?slug=kanchan-98f2af`.

## 4. Run it with Docker

```bash
docker build -t birthday-album .
docker run -p 8000:8000 --env-file .env birthday-album
```

or with docker-compose:

```bash
docker-compose up --build
```

The image has a built-in `HEALTHCHECK` that hits `/health` every 30s.

## 5. Deploy to Render

1. Push this repo to GitHub.
2. On Render: **New → Web Service** → connect the repo → environment: **Docker**.
3. Render auto-detects the root `Dockerfile`. Leave build/start commands blank.
4. Add `MONGO_URI`, `MONGO_DB_NAME`, and `JWT_SECRET` under **Environment** (with your
  real values). Optionally add `ALLOWED_ORIGINS`, `SELF_URL`, and
  `KEEPALIVE_ENABLED` — Render's environment tab is where secrets actually live in
   production, not a committed `.env` file.
5. Deploy. Once it's live, copy the public URL Render gives you
   (e.g. `https://birthday-album.onrender.com`).
6. Go back to Environment, set `SELF_URL` to that exact URL, and redeploy once more.

## 6. Keep the Render service warm

Render's free tier can spin a service down after **15 minutes** with no inbound traffic.
The in-process keep-alive is only useful while the process is already running, so it
cannot guarantee that a sleeping free service stays awake. For periodic traffic, use an
external monitor such as UptimeRobot or Better Uptime:

1. Create an HTTP monitor for `https://YOUR-APP.onrender.com/health`.
2. Set the interval to **5 minutes** or the shortest interval available on your plan.
3. Keep `KEEPALIVE_ENABLED=false` on Render; the external monitor is the real wake-up request.

The `/health` endpoint returns HTTP 200 while the app and database are available. A paid
Render instance is the only way to get a platform-level no-sleep guarantee.

## Design notes

- **Theme variants**: `rose`, `blush`, `magenta`, `lavender` — pick one per album so
  each girl's page can feel like it was made just for her (`data-theme` attribute on
  `<body>`, driving CSS custom properties).
- **Signature animation**: a heart-shaped locket that flips open on tap to reveal her
  photo, plus a candle that blows out on click, confetti bursts, floating hearts,
  sparkles and balloons — all toggleable per album from the "Animations" chips on the
  create page, driven by plain CSS keyframes and a small canvas confetti engine (no
  external animation library).
- **Songs**: upload an audio file or use **Fetch & add audio** with a direct public
  MP3/WAV/OGG/M4A/AAC/FLAC URL. The backend stores fetched audio in MongoDB and the
  album plays it from its own `/api/media/...` URL. Spotify/YouTube page URLs are not
  audio files and are rejected instead of opening video pages.

## Security notes

- Login uses the username and password. Each album has its own customizable birthday date.
- Sessions are signed JWTs (`JWT_SECRET`) with a 7-day expiry by default.
- Only an album's owner can edit or delete it (`PATCH`/`DELETE` check `owner_id`).
- All secrets live in `.env` locally and in Render's Environment tab in
  production — nothing sensitive is hard-coded or committed.
