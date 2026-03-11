# 🎵 Music DNA Match
> **Sonic Structural Mapping & Neural Discovery Protocol.**

[Live Site: dna.armanayva.com](https://dna.armanayva.com/)

Music DNA Match is a high-fidelity musical discovery engine that bridges the gap between **Artists and Fans** through shared musical biology. By scanning your digital music footprint (Spotify & YouTube), it generates a **12-dimensional sonic vector**—a mathematical fingerprint of your unique musical identity—then matches you with like-minded listeners ("Sonic Soulmates") and verified creators ("The Syndicate").

---

## ✨ Features

### 🧬 Neural Discovery Flow
- **Artist-Fan Bridge:** A tool designed for creators and listeners to find their tribe based on true musical resonance rather than algorithmic bias.
- **Frictionless Onboarding:** A multi-stage process (Sources → Review → Genres → Analysis) that allows users to refine AI-driven insights before generating their final DNA.
- **Profile Restoration:** A "Neural Handshake" portal allows returning users to securely recover their profile on any device using their registered email.
- **Multimodal Signal Capture:**
    - **Spotify Native Scan:** Analyzes public playlists and listening signals.
    - **YouTube Search & Paste:** Enrich your DNA with individual tracks or "Add Similar" tracks via automated discovery.
- **Signature Identification:** Users are assigned a **Signal ID** (e.g., `NAME-SIGNAL`) for secure profile reconnects and mutual match notifications.

### 🧬 Neural Discovery Protocol
- **Vector Space Mapping:** DNA is quantized across 12 distinct axes: *Spectral Energy, Harmonic Depth, Rhythmic Drive, Melodic Warmth, Structural Complexity, Sonic Texture, Tempo Variance, Tonal Brightness, Dynamic Range, Genre Fusion, Experimental Index, and Emotional Density.*
- **Similarity Matching:** Uses Euclidean distance and cosine similarity via `pgvector` to find users with overlapping sonic fingerprints.
- **Coherence Index:** A geometric measurement of your signal's internal consistency and musical complexity.
- **DNA Refinement:** An intelligent recommendation engine that suggests new artists based on your unique sonic vector, excluding already synced signals.

### 🤝 Matching & Bridge System
- **Soulmate Feed:** A real-time list of users sorted by matching percentage.
- **Interest Signals:** Express interest in a match. If the interest is mutual, a **Bridge** is created.
- **Collaborative Bridges:** Private spaces where users can view each other's full DNA signals and shared contact info for playlist collaboration.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router, Turbopack) |
| **Styling** | Vanilla CSS + Tailwind CSS (High-Contrast Premium Look) |
| **Animations** | Framer Motion (Smooth stage transitions & micro-interactions) |
| **Database** | Supabase (PostgreSQL + `pgvector`) |
| **Auth** | WorkOS AuthKit (Magic Auth) |
| **Identification** | Cookie-based Guest Session |
| **Icons** | Lucide React |

---

## 🗺️ Project Structure

```
app/
├── (home) page.tsx      # Entry hub (New Scan vs. Secure Profile Restore)
├── profile/page.tsx     # 12-dimensional DNA visualization & identity management
├── soulmates/page.tsx   # Discovery feed for finding sonic matches
├── bridge/[id]/         # Mutual match connection rooms
├── login/               # WorkOS Auth initiation
├── callback/            # WorkOS Auth callback
├── auth/complete/       # Post-auth profile linking
├── api/
│   ├── auth/            # Session and profile linking
│   ├── dna/             # Generation, profile retrieval, and matching logic
│   ├── match/           # Interest registration and bridge creation
│   └── spotify/         # Public playlist scanner
└── components/
    ├── Navbar.tsx       # Dynamic navigation based on DNA availability
    ├── UnifiedArtistCard.tsx # Artist profile with playback and sync
    └── MinimalArtistCard.tsx # Sleek discovery-focused card
```

---

## ⚙️ Setup & Installation

### 1. Environment Variables
Create `.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# API Keys
YOUTUBE_API_KEY=...
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...

# Site Config
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# WorkOS AuthKit
WORKOS_API_KEY=...
WORKOS_CLIENT_ID=...
WORKOS_COOKIE_PASSWORD=...
NEXT_PUBLIC_WORKOS_REDIRECT_URI=http://localhost:3000/callback
```

### 2. Database Schema
Run this in your Supabase SQL Editor:

```sql
-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- DNA Profiles
CREATE TABLE dna_profiles (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid UNIQUE NOT NULL,
  sonic_embedding   vector(12),
  metadata          jsonb DEFAULT '{}'::jsonb,
  broadcasting      boolean DEFAULT true,
  created_at        timestamptz DEFAULT now()
);

-- Match Interests
CREATE TABLE match_interests (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL,
  target_id         uuid NOT NULL,
  email             text NOT NULL,
  created_at        timestamptz DEFAULT now(),
  UNIQUE(user_id, target_id)
);

-- Similarity Search Function
CREATE OR REPLACE FUNCTION match_sonic_soulmates (
  query_embedding vector(12),
  match_threshold float,
  match_count int,
  caller_id uuid
)
RETURNS TABLE (id uuid, user_id uuid, metadata jsonb, similarity float)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.user_id, p.metadata, 1 - (p.sonic_embedding <=> query_embedding) AS similarity
  FROM dna_profiles p
  WHERE 1 - (p.sonic_embedding <=> query_embedding) > match_threshold
    AND p.user_id != caller_id
    AND p.broadcasting = true
  ORDER BY similarity DESC LIMIT match_count;
END;
$$;
```

### 3. Running Locally
```bash
pnpm install
pnpm dev
```

---

## 📄 License
© 2026 rights reserved by [armanayva.com](https://armanayva.com)
MIT License for protocol implementation.
