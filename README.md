# 🎵 Music DNA Match
> **Sonic Structural Mapping & Neural Discovery Protocol.**

[Live Site: dna.armanayva.com](https://dna.armanayva.com/)

Music DNA Match is a high-fidelity musical discovery engine that strips away cultural labels and genres to focus on the underlying mathematics of sound. By scanning your digital music footprint (Spotify & YouTube), it generates a **12-dimensional sonic vector**—a mathematical fingerprint of your unique musical identity—then matches you with like-minded listeners ("Sonic Soulmates").

---

## ✨ Features

### 🧬 Neural Discovery Flow
- **Frictionless Onboarding:** No mandatory sign-up or login. Users are assigned a persistent **Digital Identity** via guest cookies, allowing instant DNA extraction.
- **Multimodal Signal Capture:**
    - **Spotify Native Scan:** Analyzes public playlists and listening signals without requiring account connection.
    - **YouTube Search & Paste:** Supplement your DNA with specific tracks found on YouTube.
- **The Identity Stage:** At the end of the extraction process, users define their **Signal Profile** with a display name and an optional email (used for reconnecting and matching).

### 🧬 Neural Discovery Protocol
- **Vector Space Mapping:** DNA is quantized across 12 distinct axes: *Spectral Energy, Harmonic Depth, Rhythmic Drive, Melodic Warmth, Structural Complexity, Sonic Texture, Tempo Variance, Tonal Brightness, Dynamic Range, Genre Fusion, Experimental Index, and Emotional Density.*
- **Similarity Matching:** Uses Euclidean distance and cosine similarity via `pgvector` to find users with overlapping sonic fingerprints.
- **Coherence Index:** A geometric measurement of your signal's internal consistency and musical complexity.

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
| **Identification** | Cookie-based Guest Session + Optional Email Identity |
| **Icons** | Lucide React |

---

## 🗺️ Project Structure

```
app/
├── (home) page.tsx      # Multi-stage discovery flow (Genres -> Spotify -> YouTube -> Identity)
├── profile/page.tsx     # Your 12-dimensional DNA visualization
├── soulmates/page.tsx   # Discovery feed for finding sonic matches
├── bridge/[id]/         # Mutual match connection rooms
├── api/
│   ├── dna/             # Generation, profile retrieval, and matching logic
│   ├── match/           # Interest registration and bridge creation
│   └── spotify/         # Public playlist scanner
└── components/
    └── Navbar.tsx       # Dynamic navigation based on DNA availability
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
© 2026 Arman Ayva. All rights reserved. [dna.armanayva.com](https://dna.armanayva.com/)
MIT License for protocol implementation.
