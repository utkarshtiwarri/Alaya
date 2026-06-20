# ALAYA — Decision Thinking Assistant

This repository contains a local-first web app that helps users clarify hard decisions by mapping values, surfacing biases, and generating a short validation action plan.

## Overview
- Frontend: React + TypeScript (in `src/`) with small UI components for Values DNA, Tradeoffs, Bias detection, and Action Protocols.
- Backend: Express server (`server.ts`) that invokes an AI backend to generate follow-up questions and synthesize a structured decision report.

> The app requires an API key for the configured AI provider. You can develop and test with a mock or local stub if you don't want to use a live key during development.

## Run Locally

**Prerequisites:** Node.js (LTS)

1. Install dependencies:

```powershell
cd C:\Users\Utkarsh\Downloads\alaya
npm install
```

2. Configure environment variables (create a `.env` or `.env.local`):

```
# Example env file
GEMINI_API_KEY=your_api_key_here
NODE_ENV=development
```

3. Start development server (backend + Vite middleware):

```powershell
npm run dev
```

Open http://localhost:3000 in your browser.

## Type checking & build

```powershell
npm run lint    # type check (tsc --noEmit)
npm run build   # production build
npm start       # run built server
```

## Notes
- If you prefer not to use a live AI key while developing, consider implementing a small mock that returns example questions/reports for the API endpoints in `server.ts`.
- The main files to review are `server.ts` (API and AI prompts) and `src/App.tsx` (user flow and rendering).

If you want, I can also add a simple mock mode and update `README.md` with instructions for the hackathon submission.

## Mock / Demo Mode (no AI key required)

To run the app without a live AI key (handy for local demos or hackathon submissions), enable mock mode.

1. Create or update your `.env` file in the project root and add:

```
MOCK_MODE=true
# GEMINI_API_KEY can be left empty when MOCK_MODE=true
```

2. Start the dev server:

```powershell
npm run dev
```

When `MOCK_MODE` is enabled the backend returns deterministic example questions and a sample report so you can demonstrate the full UI without network calls to an external AI provider.
