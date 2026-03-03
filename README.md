# 🎵 Music DNA Match
> **Sonic Structural Mapping & Neural Discovery Protocol.**

[Live Site: dna.armanayva.com](https://dna.armanayva.com/)

Music DNA Match is a high-fidelity musical discovery engine that strips away cultural labels and genres to focus on the underlying mathematics of sound. By scanning your digital music footprint (Spotify & YouTube), it generates a **12-dimensional sonic vector**—a mathematical fingerprint of your unique musical identity—then matches you with like-minded listeners so you can collaborate on shared playlists.

---

## ✨ Features

### 🎧 Multimodal Signal Capture
- **Spotify Native Scan:** Pure TypeScript implementation that systematically scans Spotify discovery signals (Playlists, Top Tracks) without requiring a Python environment.
- **YouTube Frequency Extraction:** Real-time extraction of structural audio DNA from any YouTube signal (Artist, Track, or Vibe).
- **Frictionless Discovery:** No login required for standard frequency scanning.

### 🧬 Neural Discovery Protocol
- **Vector Space Mapping:** Your DNA is quantized across 12 distinct axes (Spectral, Harmonic, Transient, etc.) and projected into a high-dimensional vector space.
- **Euclidean Matching:** High-precision similarity search finds "Sonic Soulmates" by calculating the multi-dimensional distance between user profiles.
- **Coherence Index:** A geometric measurement of your signal's internal consistency and structured complexity.

### 🤝 Matching & Collaboration
- **Interest Signals:** Express interest in matched users; when interest is mutual, a Bridge is automatically created.
- **DNA Bridge:** A streamlined connection page showing both participants' profiles and contact info.
- **Email Draft:** One-click button to draft a pre-written email introducing the match and proposing playlist collaboration.
- **Guest & Authenticated Users:** Works for both Google-authenticated users and anonymous guests via guest IDs.

### 🔐 Authentication
- **Google OAuth:** Sign in with Google for a persistent profile and email-based matching.
- **Guest Mode:** Instant access without sign-up—a guest ID is assigned automatically and carried through the matching flow.

### 📱 Premium Mobile Experience
- **Fluid Layouts:** Fully responsive design system optimized for all screen sizes, from mobile devices to desktop workstations.
- **Glassmorphism UI:** A stunning, translucent interface with vibrant gradients and micro-animations.
- **Performance Optimized:** Strategic link prefetching and native edge-compatible logic for instantaneous transitions.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript (Native Edge-Compatible Logic) |
| **Logic** | Custom Spotify Structural Fetcher (Pure TS) |
| **Styling** | Vanilla CSS + Tailwind Utility Layer |
| **Animations** | Framer Motion (60FPS Micro-interactions) |
| **Database** | Supabase (PostgreSQL + `pgvector`) |
| **Realtime** | Supabase Realtime Channels |
| **AI** | Google Gemini 2.0 Flash (Signal Synthesis) |
| **Auth** | Google OAuth 2.0 + Guest ID System |
| **Music APIs** | Spotify Public API + YouTube Data API v3 |

---

## 🗺️ Project Structure

```
app/
├── page.tsx              # Home — scan & generate your Music DNA
├── match/page.tsx        # Neural Matching Protocol — find soulmates
├── temp-room/[id]/       # DNA Bridge — email exchange with your match
├── broadcast/            # Broadcast discovery signals
├── youtube/              # YouTube frequency scanner
├── privacy/              # Privacy policy
├── terms/                # Terms of service
└── api/
    ├── auth/             # Google OAuth & session management
    ├── bridge/           # Bridge lifecycle (create, info, consent, merge, synthesize, message)
    ├── dna/              # DNA generation, profile CRUD, matching engine
    ├── match/            # Interest registration (join)
    └── spotify/          # Spotify public scan
```

---

## ⚙️ Setup & Installation

### 1. Environment Variables
Create `.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# API Signals
YOUTUBE_API_KEY=...
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...

# AI
GEMINI_API_KEY=...

# Site Config
NEXT_PUBLIC_SITE_URL=https://dna.armanayva.com
```

### 2. Initialization
```bash
pnpm install
pnpm dev
```

---

## 📄 License
© 2026 Arman Ayva. All rights reserved. [dna.armanayva.com](https://dna.armanayva.com/)
MIT License for protocol implementation.
