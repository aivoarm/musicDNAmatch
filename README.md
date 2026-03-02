# 🎵 Music DNA Match

> **Community-driven, AI-orchestrated music discovery platform.**  
> We strip away cultural labels and focus on the underlying mathematics of sound.

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-pgvector-3ECF8E?logo=supabase)](https://supabase.com/)
[![Spotify](https://img.shields.io/badge/Spotify-API-1DB954?logo=spotify)](https://developer.spotify.com/)
[![Gemini](https://img.shields.io/badge/Gemini-2.0--flash-4285F4?logo=google)](https://ai.google.dev/)

---

## ✨ What is Music DNA Match?

Music DNA Match converts a user's Spotify listening history into a **12-dimensional sonic vector** — a mathematical fingerprint of their musical identity. This "DNA" is then used to:

1. **Match** you with other listeners whose musical DNA is closest to yours via high-dimensional vector similarity search
2. **Generate AI theses** explaining *why* two people are sonically compatible
3. **Open a 48-hour Green Room** where matched users can chat and have an AI Maestro synthesize a collaborative playlist
4. **Merge the playlist** directly onto both users' Spotify accounts

---

## 🧬 How the DNA Works

The 12D Musical DNA vector is computed **without** the deprecated Spotify `/audio-features` endpoint. Instead it uses:

| Source | What we extract |
|---|---|
| `/me/top/tracks` (all time ranges) | Popularity, duration, release year |
| `/me/player/recently-played` | Fallback if top tracks are empty |
| `/artists?ids=...` (batch) | Genre tags per artist |

Each dimension of the vector maps to a psychoacoustic trait:

| Dim | Trait | Source |
|---|---|---|
| 0 | Spectral Centroid | Genre brightness |
| 1 | Transient Density | Genre percussiveness |
| 2 | Harmonicity | Inverse of energy |
| 3 | Dynamic Range | Avg track duration |
| 4 | Polyrhythmic Complexity | Genre complexity |
| 5 | Intervalic Tension | Genre tension |
| 6 | Pulse Saliency | Percussiveness × Energy |
| 7 | Timbral Warmth | Genre warmth |
| 8 | Abstraction | Inverse of popularity |
| 9 | Spatial Density | Complexity × Duration |
| 10 | Energy | Genre energy |
| 11 | Era Centroid | Avg release year (normalized) |

---

## 🚀 Features

### 🎙️ Vibe Broadcast
- Authenticate with Spotify OAuth
- Compute your 12D DNA vector from listening history (top tracks → recently played fallback)
- Display your top genres as color-coded badges
- Show recent listening history with album art and Spotify links
- Store your sonic embedding in Supabase using `pgvector`

### 🔎 Sonic Soulmate Discovery
- Vector similarity search using Euclidean distance (`<->` operator)
- Matches sorted by closeness in 12D space
- AI-generated "Musical Thesis" for each match (why you two are compatible)
- Shows matched user's top genres and similarity percentage

### 🌿 The Green Room (48-hour Bridge)
- Ephemeral collaboration space created between two matched users
- Real-time chat powered by **Supabase Realtime**
- AI Maestro (Gemini) synthesizes a collaborative playlist name and vibe from both users' genre profiles
- **Confirm & Merge** — creates a real shared playlist on both users' Spotify accounts

### 🔐 Authentication
- Full **Spotify OAuth 2.0** flow
- Tokens stored as HTTP-only cookies (`spotify_access_token`, `spotify_refresh_token`)
- Global Navbar shows user avatar + name when authenticated
- "Sign in with Spotify" button visible when logged out

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + custom CSS variables |
| **Animations** | Framer Motion |
| **Database** | Supabase (PostgreSQL + pgvector) |
| **Realtime** | Supabase Realtime Channels |
| **Auth** | Spotify OAuth 2.0 (custom, no NextAuth) |
| **AI** | Google Gemini 2.0 Flash |
| **Music API** | Spotify Web API |
| **Icons** | Lucide React |
| **Fonts** | Outfit (Google Fonts) |

---

## 📁 Project Structure

```
MusicDNA/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── me/route.ts              # Check auth status (Navbar)
│   │   │   ├── spotify/login/route.ts   # Initiate Spotify OAuth
│   │   │   └── callback/spotify/route.ts # Handle OAuth callback + set cookies
│   │   ├── dna/
│   │   │   ├── generate/route.ts        # Compute + store DNA vector
│   │   │   └── match/route.ts           # Find sonic soulmates via pgvector
│   │   └── bridge/
│   │       ├── create/route.ts          # Create a 48h Green Room
│   │       ├── message/route.ts         # Send a chat message
│   │       ├── synthesize/route.ts      # AI playlist synthesis
│   │       └── merge/route.ts           # Create real Spotify playlists
│   ├── broadcast/page.tsx               # Vibe Broadcast UI
│   ├── match/page.tsx                   # Sonic Soulmates UI
│   ├── temp-room/[id]/page.tsx          # Green Room (real-time chat)
│   ├── layout.tsx                       # Root layout (includes Navbar)
│   └── page.tsx                         # Landing page
├── components/
│   └── Navbar.tsx                       # Global navigation bar
├── lib/
│   ├── dna.ts                           # 12D DNA computation engine
│   ├── gemini.ts                        # Gemini AI utility
│   ├── spotify.ts                       # Spotify API helpers
│   └── supabase.ts                      # Supabase client
└── supabase/
    └── migrations/
        └── setup.sql                    # Complete DB setup (run once)
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- pnpm (`npm install -g pnpm`)
- A [Spotify Developer App](https://developer.spotify.com/dashboard)
- A [Supabase](https://supabase.com) project with `pgvector` enabled
- A [Google AI Studio](https://aistudio.google.com) API key

### 1. Clone & Install

```bash
git clone <your-repo>
cd MusicDNA
pnpm install
```

### 2. Environment Variables

Create `.env.local` in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Spotify (from developer.spotify.com/dashboard)
SPOTIFY_CLIENT_ID=your-client-id
SPOTIFY_CLIENT_SECRET=your-actual-secret
SPOTIFY_REDIRECT_URI=https://music-dna-match.vercel.app/api/auth/callback/spotify

# Google Gemini
GEMINI_API_KEY=your-gemini-api-key
```

> ⚠️ **Critical**: Ensure `SPOTIFY_REDIRECT_URI` matches the environment you are accessing the app from. For Vercel, it should be the `https://xxxx.vercel.app` URL.

### 3. Spotify App Configuration

In your [Spotify Developer Dashboard](https://developer.spotify.com/dashboard):
- Add `https://music-dna-match.vercel.app/api/auth/callback/spotify` to **Redirect URIs**
- Required scopes are requested automatically:
  - `user-read-private`
  - `user-read-email`
  - `user-top-read`
  - `user-read-recently-played`
  - `playlist-modify-public`
  - `playlist-modify-private`

### 4. Database Setup

Go to your **[Supabase SQL Editor](https://supabase.com/dashboard)** and run the full contents of `supabase/migrations/setup.sql`:

```sql
-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- DNA Profiles (Spotify user IDs are TEXT, not UUID)
CREATE TABLE IF NOT EXISTS dna_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  sonic_embedding VECTOR(12),
  broadcasting BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE dna_profiles DISABLE ROW LEVEL SECURITY;

-- Bridges (ephemeral collaboration spaces)
CREATE TABLE IF NOT EXISTS bridges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a TEXT NOT NULL,
  user_b TEXT NOT NULL,
  common_ground_data JSONB DEFAULT '{}'::jsonb,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + interval '48 hours'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE bridges DISABLE ROW LEVEL SECURITY;

-- Bridge Messages (real-time chat)
CREATE TABLE IF NOT EXISTS bridge_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bridge_id UUID REFERENCES bridges(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE bridge_messages DISABLE ROW LEVEL SECURITY;

-- Soulmate matching function
CREATE OR REPLACE FUNCTION match_sonic_soulmates (
  query_embedding VECTOR(12),
  match_threshold FLOAT,
  match_count INT,
  caller_id TEXT
)
RETURNS TABLE (id UUID, user_id TEXT, metadata JSONB, similarity FLOAT)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT dna_profiles.id, dna_profiles.user_id, dna_profiles.metadata,
    1 - (dna_profiles.sonic_embedding <-> query_embedding) AS similarity
  FROM dna_profiles
  WHERE dna_profiles.user_id != caller_id
    AND 1 - (dna_profiles.sonic_embedding <-> query_embedding) > match_threshold
  ORDER BY dna_profiles.sonic_embedding <-> query_embedding
  LIMIT match_count;
END;
$$;
```

### 5. Run the App

```bash
pnpm dev
```

Open your app URL (e.g. `https://music-dna-match.vercel.app` or `http://127.0.0.1:3000` for development).

---

## 🎯 User Journey

```
[Landing Page]
     ↓ Sign in with Spotify (top-right button)
[Spotify OAuth]
     ↓ Token stored as HTTP-only cookie
[Broadcast Page]
     ↓ Click "Analyze Musical DNA"
     → Fetches top tracks (short/medium/long term + recently-played fallback)
     → Fetches artist genres
     → Computes 12D DNA vector
     → Stores in Supabase dna_profiles
     → Shows genres + recent tracks
[Match Page]
     ↓ Vector similarity search via match_sonic_soulmates()
     → AI Maestro generates thesis for each match
     ↓ Click "Enter Green Room"
[Green Room /temp-room/:id]
     → 48-hour countdown
     → Real-time chat via Supabase Realtime
     → AI synthesizes a playlist name/vibe
     ↓ Click "Confirm & Merge"
     → Creates shared playlist on both Spotify accounts
```

---

## ⚠️ Known Limitations

### Gemini Rate Limits (Free Tier)
The free Gemini API tier has strict limits:
- **15 requests/minute** per model
- **1,500 requests/day** per model

If you hit 429 errors, the app gracefully falls back to a static thesis/description. To remove limits, [set up billing](https://ai.google.dev/gemini-api/docs/rate-limits) in Google AI Studio.

### Spotify `/audio-features` Deprecation
The `/v1/audio-features` endpoint was deprecated for new apps in **November 2024**. This project uses genre tags + metadata instead, which actually provides richer cultural context.

### Matching Requires Multiple Users
The vector similarity search only returns results if multiple users have broadcasted their DNA. For solo testing, insert a seed profile directly into `dna_profiles` via the Supabase dashboard.

### Cookie Domain
Always ensure the URL in your browser matches the one configured in your Environment Variables.

---

## 🗺️ Roadmap

- [ ] Refresh token rotation (auto re-auth when token expires)
- [ ] Production RLS policies for Supabase
- [ ] Mobile-responsive Green Room layout
- [ ] Push notifications for match alerts
- [ ] Multi-user Green Rooms (up to 4 users)
- [ ] Playlist history and replay

---

## 📄 License

MIT © 2026 Music DNA Match
