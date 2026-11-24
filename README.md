# CloakRelay: Zero-Leak Hybrid AI Workspace

CloakRelay is a privacy-first hybrid AI platform built for the Firebase #BuildHybridAI Hackathon. It enables users to leverage powerful cloud reasoning models without ever exposing Personally Identifiable Information (PII), secrets, or credentials to the cloud.

## Features

- **Split-Brain Architecture**: 
  - **Local Gate**: Uses Chrome's on-device Gemini Nano (via `firebase/ai`) + Regex defense-in-depth to identify and redact sensitive data.
  - **Cloud Reasoner**: Sends sanitized, placeholder-filled text to Gemini 3.8 Flash for high-intelligence tasks.
  - **Local Re-hydration**: Restores the original data into the AI response locally in the browser memory.
- **Privacy First**: Raw PII never leaves the user's browser, and never touches Firestore.
- **Offline Mode**: Supports summarizing and quick tasks entirely on-device when network is unavailable.
- **Secure Audit Trails**: Firestore persistent logs store only telemetry and sanitized previews.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: Tailwind CSS + ShadCN UI
- **AI SDK**: `firebase/ai` (v11+)
- **Security**: Firebase App Check (ReCaptcha Enterprise), Firebase Auth (Guest/Google)
- **Database**: Cloud Firestore (Offline Persistence)

## Setup

1. Copy `.env.example` to `.env.local` and fill in your Firebase project credentials.
2. Enable **Chrome Gemini Nano**:
   - Go to `chrome://flags/#optimization-guide-on-device-model` -> Set to "Enabled BypassPerfRequirement".
   - Go to `chrome://flags/#prompt-api-for-gemini-nano` -> Set to "Enabled".
   - Restart Chrome and wait for the model to download (check status in the app header).
3. Install dependencies and run: `npm install && npm run dev`.

## App Check Debugging

To use in development:
1. In Firebase Console, generate an App Check debug token.
2. Add it to `VITE_APPCHECK_DEBUG_TOKEN` in `.env.local`.
