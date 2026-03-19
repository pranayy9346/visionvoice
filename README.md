# VisionVoice

## Project structure

```text
src/
	frontend/
		components/
		services/
		hooks/

server/
	backend/
		controllers/
		routes/
		models/
		utils/
```

## Frontend setup

1. Copy `.env.example` to `.env` and set `VITE_API_BASE_URL`.
2. Install dependencies in project root:

```bash
npm install
```

3. Start frontend:

```bash
npm run dev
```

## Backend setup

1. Go to `server`:

```bash
cd server
```

2. Copy `.env.example` to `.env` and fill in `MONGODB_URI` and `GEMINI_API_KEY`.
3. Install server dependencies:

```bash
npm install
```

4. Start backend:

```bash
npm run dev
```

Or from the project root:

```bash
npm run dev:server
```

Server runs on `http://localhost:5000`.

## API endpoints

- `POST /analyze` with body `{ "image": "data:image/jpeg;base64,..." }`
- `GET /history` returns the latest 5 analyses.
