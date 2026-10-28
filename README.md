# Siempre — A Living Digital Ofrenda
> *"Some stories deserve to stay."*  
> *A little place for the people who will always be with us.*

**Siempre** is a private, AI-powered digital memorial and living ofrenda inspired by Día de los Muertos traditions. It preserves family memories, photographs, spoken stories, heirloom objects, favorite foods, songs, and remembrance notes.

Built with an artisanal, scrapbook-inspired visual design, authentic SVG artwork, and a local-first open-source AI architecture that guarantees personal memories stay securely on your computer.

---

## Key Features

1. **The Interactive Ofrenda (Altar Workspace):**
   - Layered tiered composition: Top Tier (portraits, sacred space, vigils), Middle Tier (favorite dishes, songs, keepsakes), Base Tier (golden cempasúchil marigolds, written memory slips).
   - Dynamic item cards: Polaroid-framed photographs with rotation, Mexican clay cazuela bowls (mole poblano), sweet pan de muerto bread, music cards with direct play links, flickering wax candles.
   - Click any object on the altar to open its story modal, recipe notes, or linked audio.
   - Vigil / Preview Mode for serene, distraction-free viewing.
   - Drag/tier movement controls and accessible reordering.
   - Cultural style switcher: Día de los Muertos ofrenda vs. Serene personal memorial.

2. **Ethical AI Remembrance Studio (Local Open-Weight LLMs):**
   - Integrates with local **Ollama** (`llama3.2:3b`, `mistral:7b`, etc.).
   - Explicit ethical guardrails: never invents facts, quotes, or relationships; never pretends to speak for the deceased; strictly grounds in user-selected memories.
   - Tone selection (Warm, Reflective, Celebratory, Poetic, Formal, Simple) and format options (Short remembrance, Tribute, Letter to loved one, Ceremony reading, Inscription).
   - Displays exact source memory tags used.
   - Generated drafts are always editable and never overwrite original memories automatically.
   - Graceful offline handling: provides clear setup instructions if Ollama is not running.

3. **Family Spoken Voice Archive & Transcription:**
   - Real in-browser microphone recording with live waveform and duration timer.
   - Audio file upload support (WebM, WAV, MP3, M4A, OGG).
   - Audio player with interactive timestamp navigation: clicking a transcript segment jumps the audio player to that exact moment!
   - Speech-to-text integration with `faster-whisper` and modular local fallbacks.
   - Direct transcript editing and single-click Markdown / Audio export.

4. **Archive Search & Rediscovery:**
   - Full-text keyword search across titles, descriptions, memory slips, tags, and transcripts.
   - Instant filtering by memorial and item category.
   - Excerpt snippets highlighting matching context.
   - Direct navigation from search results straight to the altar object or timestamped transcript segment.

5. **Local-First Privacy & Preservability:**
   - All data stored in SQLite (`backend/data/siempre.db`) and local media directories (`backend/data/media/`).
   - Zero telemetry, third-party analytics, or external cloud calls.
   - One-click JSON export for long-term family archival.
   - Print-friendly layout (`@media print`) for creating physical paper keepsakes or PDFs.

---

## Architecture & Tech Stack

```text
siempre/
├── frontend/                  # React + TypeScript + Vite
│   ├── public/
│   │   └── artwork/           # Original SVGs (marigolds, candles, papel picado, cazuela, pan de muerto)
│   ├── src/
│   │   ├── components/        # Navigation, header, modals
│   │   ├── features/
│   │   │   ├── altar/         # Interactive tiered ofrenda & item detail views
│   │   │   ├── memorial/      # 5-step memorial creation wizard with draft persistence
│   │   │   ├── remembrance/   # AI Remembrance Studio & prompt controls
│   │   │   ├── stories/       # Voice recording, audio player, timestamped transcripts
│   │   │   └── search/        # Search & rediscovery with snippet highlighting
│   │   ├── services/          # API client for backend communication
│   │   ├── styles/            # Handcrafted paper tokens, typography, and animations
│   │   └── types/             # TypeScript interfaces
│   ├── package.json
│   └── vite.config.ts
├── backend/                   # FastAPI + SQLite + SQLAlchemy
│   ├── app/
│   │   ├── api/               # REST routes (memorials, items, stories, ai, search, demo)
│   │   ├── core/              # Config & async database session engine
│   │   ├── models/            # SQLAlchemy models (Memorial, MemoryItem, Story)
│   │   ├── prompts/           # Grounded system prompts & ethical guidelines
│   │   ├── schemas/           # Pydantic v2 validation schemas
│   │   ├── services/          # OllamaService, TranscriptionService, SearchService, DemoData
│   │   └── main.py            # App entry point, CORS, static media mount
│   ├── tests/                 # Pytest test suite
│   ├── requirements.txt
│   └── .env.example
├── start.sh                   # One-click startup script
└── README.md
```

---

## Deployment & Production Architecture

### Why Are There 2 Tasks During Development?
During local active development, modern web applications run two processes:
1. **Frontend Dev Server (`vite` on port 5173):** Provides lightning-fast Hot Module Replacement (HMR) so UI changes reflect instantly without full browser reloads.
2. **Backend API Server (`fastapi/uvicorn` on port 8000):** Executes database operations, audio handling, and local AI queries.

### Single-Service Production Deployment (1 Process)
For deploying to production (such as a local server, VPS, Docker, Render, Railway, or Fly.io), you **do not run two separate processes**.
Instead:
1. The frontend is pre-compiled into static HTML, JavaScript, and CSS in `frontend/dist` (`npm run build`).
2. FastAPI mounts `frontend/dist` directly at the root `/` URL and serves both the React application and all `/api` endpoints simultaneously.

#### Option A: One-Command Deployment Script
```bash
./deploy.sh
```
This automatically builds the frontend and boots the unified single-process FastAPI server on `http://0.0.0.0:8000`.

#### Option B: Docker Container (Single Container)
```bash
docker compose up --build
```
Or with docker directly:
```bash
docker build -t siempre:latest .
docker run -p 8000:8000 -v siempre_data:/app/data siempre:latest
```
Access the application at `http://localhost:8000`.

---

## Quickstart Guide

### 1. Development Mode (Hot Reload)
```bash
./start.sh
```
Runs the backend on port 8000 and the Vite hot-reloading dev server on port 5173.

### 2. Production Mode (Single Port 8000)
```bash
./deploy.sh
```
Builds the production bundle and runs the entire app on `http://127.0.0.1:8000`.

### 2. Manual Startup

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
export PYTHONPATH=.
python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Setting Up Local AI (Optional & Recommended)

Siempre runs 100% locally and does not require AI for basic use. To enable local remembrance writing:

1. Download and install **Ollama** from [https://ollama.com](https://ollama.com).
2. Pull the configured open-weight model in your terminal:
   ```bash
   ollama run llama3.2:3b
   ```
   *(Or configure any model like `mistral:7b`, `gemma2:2b`, or `llama3.1:8b` via `OLLAMA_MODEL` in `backend/.env`)*
3. Visit the **Settings** page in Siempre to verify the model connection.

---

## Demonstration Experience

Siempre includes a pre-seeded, rich fictional demonstration memorial honoring:
**Elena Rosales (1938–2021) — "Abuela Elena"**
- Authentic vintage portrait frame
- Authentic recipes: 3-day Mole Poblano, sweet Pan de Muerto with orange blossom water
- Favorite song: "Amor Eterno" by Juan Gabriel
- Heirloom: 1954 Singer cast-iron sewing machine
- Spoken family story: *"Sunday Afternoons in the Courtyard"* with full timestamped transcript and audio playback.

To explore the demo at any time, click **"Explore Sample Memorial"** on the welcome page or **"Restore Demo Memorial"** in Settings.

---

## Running Tests

**Backend Test Suite:**
```bash
PYTHONPATH=backend ./backend/venv/bin/pytest backend/tests/
```

**Frontend Typecheck & Production Build:**
```bash
cd frontend
npm run build
```

---

## License

Built with care and cultural reverence for Día de los Muertos and personal remembrance traditions.  
*Some stories deserve to stay.*

