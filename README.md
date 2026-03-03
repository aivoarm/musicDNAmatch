# 🎵 Music DNA Match
> **Sonic Structural Mapping & Neural Discovery Protocol.**

[Live Site: dna.armanayva.com](https://dna.armanayva.com/)

Music DNA Match is a high-fidelity musical discovery engine that strips away cultural labels and genres to focus on the underlying mathematics of sound. By scanning your digital music footprint (Spotify & YouTube), it generates a **12-dimensional sonic vector**—a mathematical fingerprint of your unique musical identity.

---

## ✨ Features

### 🎧 Multimodal Signal Capture
- **Spotify Native Scan:** A pure TypeScript implementation that systematically scans Spotify discovery signals (Playlists, Top Tracks) without requiring a Python environment.
- **YouTube Frequency Extraction:** Real-time extraction of structural audio DNA from any YouTube signal (Artist, Track, or Vibe).
- **Frictionless Discovery:** No login required for standard frequency scanning.

### 🧬 Neural Discovery Protocol
- **Vector Space Mapping:** Your DNA is quantized across 12 distinct axes (Spectral, Harmonic, Transient, etc.) and projected into a high-dimensional vector space.
- **Euclidean Matching:** High-precision similarity search finds "Sonic Soulmates" by calculating the multi-dimensional distance between user profiles.
- **Coherence Index:** A geometric measurement of your signal's internal consistency and structured complexity.

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
| **Music APIs** | Spotify Public API + YouTube Data API v3 |

---

## 🚀 Recent Improvements

1. **Python-Free Architecture:** Ported the core Spotify scanning logic from a Python child process to a native TypeScript `SpotifyPublicFetcher`. This enables seamless deployment on Edge runtimes (Vercel, Cloudflare) and improves performance.
2. **Mobile-First Refactoring:** Extensively updated global paddings, font sizes, and input behaviors to ensure the "Neural Matching Protocol" looks premium on small screens.
3. **Optimized Prefetching:** Reduced unnecessary network noise by disabling background prefetching on heavy data routes, resulting in faster perceived page loads.

---

## ⚙️ Setup & Installation

### 1. Environment Variables
Create `.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# API Signals
YOUTUBE_API_KEY=...
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...

# Site Config
NEXT_PUBLIC_SITE_URL=https://dna.armanayva.com
```

### 2. Initialization
```bash
npm install
npm run dev
```

---

## 📄 License
© 2026 Arman Ayva. All rights reserved. [dna.armanayva.com](https://dna.armanayva.com/)
MIT License for protocol implementation.
