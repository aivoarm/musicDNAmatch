# 🎵 Music DNA Match (YouTube Edition)

> **AI-orchestrated musical geometry extracted from your YouTube signal.**  
> We strip away cultural labels and focus on the underlying mathematics of sound activity.

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-pgvector-3ECF8E?logo=supabase)](https://supabase.com/)
[![YouTube](https://img.shields.io/badge/YouTube-API-FF0000?logo=youtube)](https://developers.google.com/youtube/v3)
[![Gemini](https://img.shields.io/badge/Gemini-2.0--flash-4285F4?logo=google)](https://ai.google.dev/)

---

## ✨ What is Music DNA Match?

Music DNA Match converts a user's **YouTube Watch History** into a **12-dimensional sonic vector** — a mathematical fingerprint of their musical identity. This "DNA" is then used to:

1. **Match** you with other listeners whose musical DNA is closest to yours via high-dimensional vector similarity search.
2. **Generate AI theses** via Gemini explaining the spectral and temporal resonance of your connection.
3. **Open an ephemeral Bridge** where matched users can chat and collaborate in a shared "Green Room".
4. **Merge Signals** — Create a collaborative YouTube playlist placeholder for your shared vibe.

---

## 🧬 How the DNA Works

The 12D Musical DNA vector is computed by scanning your YouTube watch history and filtering specifically for **Music Category (10)** activities. 

| Source | What we extract |
29: |---|---|
| YouTube Data API v3 | Recent watch history metadata (titles, channel, category) |
| lib/youtube.ts | Strictly filtered music-only signals |

Each dimension of the vector maps to a psychoacoustic trait derived from visual and musical signals:
- Spectral Centroid, Transient Density, Harmonicity, Pulse Saliency, Timbral Warmth, Era Centroid, etc.

---

## 🚀 Features

### 🎙️ Vibe Broadcast
- Authenticate with **Google OAuth 2.0**.
- Compute your 12D DNA vector from your YouTube listening history.
- Real-time "X-Ray" scanner for individual video signals.
- Store your sonic embedding in Supabase using `pgvector`.

### 🔎 Sonic Soulmate Discovery
- Vector similarity search using Euclidean distance (`<->` operator).
- Matches sorted by closeness in 12D space.
- AI-generated "Musical Thesis" (why you two are compatible).

### 🌿 The Green Room (Bridge)
- Ephemeral collaboration space created between two matched users.
- Real-time chat powered by **Supabase Realtime**.
- **YouTube Merge** — Initializing a shared connection bridge.

### 🔐 Authentication & Compliance
- Full **Google Identity Protocol** integration.
- CSRF protection via secure `state` parameters.
- Built-in **Privacy Policy** and **Terms of Service** at the root protocol.
- Secure HTTP-only session management.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript |
| **Styling** | Vanilla CSS + custom CSS variables |
| **Animations** | Framer Motion |
| **Database** | Supabase (PostgreSQL + pgvector) |
| **Realtime** | Supabase Realtime Channels |
| **Auth** | Google OAuth 2.0 (OIDC) |
| **AI** | Google Gemini 2.0 Flash |
| **Music API** | YouTube Data API v3 |
| **Icons** | Lucide React |

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- pnpm
- A [Google Cloud Console](https://console.cloud.google.com/) project with **YouTube Data API v3** enabled.
- A [Supabase](https://supabase.com) project with `pgvector` enabled.

### 1. Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
YOUTUBE_API_KEY=...
```

### 2. Database Setup
Run `supabase/migrations/setup.sql` in your Supabase SQL editor. Note that user IDs are now Google `sub` strings.

---

## 📄 License
© 2026 Arman Ayva. All rights reserved. www.armanayva.com
MIT License for protocol implementation.
