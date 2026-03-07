# MusicDNA Match - Codebase Documentation

**Project**: musicDNAmatch — A 12-dimensional Musical DNA matching platform  
**Framework**: Next.js 15 (App Router) + React 19  
**Database**: Supabase (PostgreSQL)  
**Styling**: Tailwind CSS + Framer Motion  
**Language**: TypeScript/TSX

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Directory Structure](#directory-structure)
3. [Core Libraries](#core-libraries)
4. [API Routes](#api-routes)
5. [Page Components](#page-components)
6. [Reusable Components](#reusable-components)
7. [Utilities & Helpers](#utilities--helpers)
8. [Database Schema](#database-schema)
9. [Key Flows](#key-flows)

---

## Architecture Overview

### System Design

musicDNAmatch is a **web application** that:

1. **Analyzes** users' music preferences from genre selection, Spotify, and YouTube
2. **Generates** a 12-dimensional Musical DNA vector using:
   - 50% genre preferences (user selection)
   - 25% Spotify audio features (energy, valence, danceability, etc.)
   - 25% YouTube metadata (category, tags, title)
3. **Matches** users based on cosine similarity of their DNA vectors
4. **Facilitates** connections ("Bridges") between matched users with email confirmation workflows

### Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Next.js 15 (App Router), TypeScript |
| **Styling** | Tailwind CSS, Framer Motion (animations) |
| **Backend** | Next.js API Routes, Node.js |
| **Database** | Supabase (PostgreSQL), pgvector extension |
| **Auth** | Guest IDs (cookies), Google OAuth (future) |
| **External APIs** | Spotify API, YouTube API |

### Key Concepts

- **Musical DNA**: 12-dimensional vector `[0-1]` representing sonic fingerprint
- **Coherence Index**: Confidence measure `[0-1]` indicating data quality
- **Match Score**: Cosine similarity between two DNA vectors (`0-1`)
- **Bridge**: A connection object between two matched users
- **Soulmate**: A user with high musical DNA similarity (convergent/resonant match)

---

## Directory Structure

```
MusicDNA/
├── app/                                 # Next.js App Router
│   ├── api/                            # API routes
│   │   ├── auth/me/route.ts            # Get current user session info
│   │   ├── bridge/                     # Messaging & synthesis
│   │   │   ├── create/route.ts
│   │   │   ├── info/route.ts
│   │   │   ├── consent/route.ts
│   │   │   ├── messages/route.ts
│   │   │   ├── merge/route.ts
│   │   │   └── synthesize/route.ts
│   │   ├── dna/                        # DNA profile management
│   │   │   ├── generate/route.ts       # Core DNA calculation
│   │   │   ├── invite/route.ts
│   │   │   ├── intent/route.ts
│   │   │   ├── match/route.ts
│   │   │   └── profile/
│   │   │       ├── me/route.ts
│   │   │       ├── save/route.ts
│   │   │       ├── delete/route.ts
│   │   │       └── check-email/route.ts
│   │   ├── match/                      # Matching & signals
│   │   │   ├── join/route.ts           # Express interest
│   │   │   └── notifications/route.ts  # Get incoming signals
│   │   ├── spotify/
│   │   │   └── scan/route.ts           # Analyze Spotify profile
│   │   ├── youtube/
│   │   │   ├── search/route.ts
│   │   │   ├── history/route.ts
│   │   │   ├── trending/route.ts
│   │   │   └── analyze/route.ts        # Analyze YouTube videos
│   │   └── test/
│   │       └── reset/route.ts
│   ├── (page routes)
│   │   ├── page.tsx                    # Home / Discovery
│   │   ├── about/page.tsx
│   │   ├── profile/page.tsx            # User profile & settings
│   │   ├── soulmates/page.tsx          # Match browsing
│   │   ├── artists/page.tsx
│   │   ├── broadcast/page.tsx
│   │   ├── youtube/page.tsx
│   │   ├── privacy/page.tsx
│   │   ├── terms/page.tsx
│   │   ├── bridge/[id]/page.tsx        # Bridge detail view
│   │   └── temp-room/[id]/page.tsx
│   ├── layout.tsx                      # Root layout (Navbar, fonts, metadata)
│   ├── globals.css                     # Tailwind & base styles
│   ├── loading.tsx
│   ├── error.tsx
│   └── not-found.tsx
├── components/                          # Reusable React components
│   ├── Navbar.tsx                      # Top navigation
│   ├── CookieConsent.tsx               # Cookie banner
│   ├── ShareDNACard.tsx                # DNA sharing modal
│   └── ui/                             # Utility components
├── lib/                                 # Utility libraries
│   ├── dna.ts                          # Core DNA engine
│   ├── spotify.ts                      # Spotify API wrapper
│   ├── youtube.ts                      # YouTube API wrapper
│   ├── supabase.ts                     # Supabase client
│   ├── utils.ts                        # General utilities
│   └── server/
│       └── dns-check.ts                # Email validation
├── public/                              # Static assets
│   └── avatars/
├── supabase/                           # Database migrations
│   └── migrations/
│       ├── 20260302_init.sql
│       ├── 20260302_collaboration.sql
│       ├── 20260302_match_interests.sql
│       └── 20260306_fix_created_at.sql
├── middleware.ts                       # Next.js middleware (guest_id cookie)
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── package.json
└── README.md
```

---

## Core Libraries

### `lib/dna.ts` — Musical DNA Engine

**Purpose**: Core calculation engine for generating and manipulating Musical DNA vectors.

#### Key Exports:

##### Constants:
- `AXIS_LABELS`: 12 dimensions of the DNA vector
  - `spectral_energy`, `harmonic_depth`, `rhythmic_drive`, `melodic_warmth`, `structural_complexity`, `sonic_texture`, `tempo_variance`, `tonal_brightness`, `dynamic_range`, `genre_fusion`, `experimental_index`, `emotional_density`
  
- `GENRE_OPTIONS`: Display list of 12 user-selectable genres
- `GENRE_VECTORS`: Pre-mapped 12-dimensional vectors for 35+ genres (e.g., `electronic: [0.9, 0.5, 0.8, ...]`)
- `DNA_SCHEMA_VERSION`: v2

##### Interfaces:
- `DNAVector`: Contains `vector: number[]`, `confidence: number[]`, `coherence_index: number`, `schema_version: number`, `source: string`, `metadata: Record<string, any>`
- `SpotifyAudioFeatures`: Spotify track-level features (energy, valence, danceability, etc.)

##### Core Functions:

| Function | Purpose | Returns |
|----------|---------|---------|
| `computeGenreVector(genres: string[])` | Maps selected genres to 12D vector | `DNAVector` |
| `computeSpotifyVector(features, artistGenres)` | Processes Spotify audio features + artist genres | `DNAVector` |
| `computeYouTubeVector(videos)` | Extracts metadata from YouTube videos → genres | `DNAVector` |
| `combineDNA(genreDNA, spotifyDNA, youtubeDNA)` | Blends 3 sources (50%/25%/25% weighting) | `DNAVector` |
| `matchScore(a, b)` | Computes cosine similarity & axis differences | `{ cosine_similarity, divergence_score, match_mode, axis_diff }` |
| `calculateCoherence(vector, confidence)` | Confidence-weighted variance score | `number [0-1]` |
| `generateInterpretation(vector)` | Decodes vector to readable characteristics | `{ characteristics, genreMatches }` |

##### Helpers:
- `cosineSimilarity(a, b)`: Compute dot product similarity
- `euclideanDistance(a, b)`: L2 distance between vectors
- `round4(n)`: Round to 4 decimal places

---

### `lib/spotify.ts` — Spotify API Integration

**Purpose**: Public Spotify API client for fetching user playlists and audio features.

#### Key Class: `SpotifyPublicFetcher`

**Constructor**: `new SpotifyPublicFetcher(clientId, clientSecret)`

**Methods**:
- `getAccessToken()`: Obtain OAuth client credentials token
- `getUserPublicData(spotifyUserId, playlistIdToFetch?, limit, offset)`: Fetch playlists or specific playlist tracks

**Interfaces**:
- `SpotifyPlaylist`: `{ id, name, image, track_count, url }`
- `SpotifyTrack`: `{ id, title, artist, artistId, thumbnail, url }`

---

### `lib/youtube.ts` — YouTube API Integration

**Purpose**: YouTube Data API v3 wrapper for music video analysis.

#### Functions:

| Function | Purpose | Returns |
|----------|---------|---------|
| `searchYouTube(query, maxResults)` | Search music videos | `YouTubeVideo[]` |
| `getVideoDetails(videoId)` | Get snippet, duration, categories | Video details object |
| `getTrendingMusic(maxResults)` | Fetch trending music videos | `YouTubeVideo[]` |
| `getPersonalHistory(accessToken, maxResults)` | Fetch user's watch history (requires auth) | `YouTubeVideo[]` |
| `filterMusicVideos(videos)` | Filter by category #10 (Music) | `YouTubeVideo[]` |

**Interface**: `YouTubeVideo = { id, title, thumbnail, channelTitle, publishedAt }`

**Helpers**:
- `extractVideoId(url)`: Parse multiple URL formats (youtu.be, youtube.com, shorts, embed)
- `parseDuration(iso)`: Convert ISO 8601 duration to seconds

---

### `lib/supabase.ts` — Database Client

**Purpose**: Centralized Supabase instance and utilities.

#### Exports:
- `supabase`: Initialized Supabase client
- `toUUID(str)`: Convert string to v4 UUID format (preserves existing UUIDs, hashes new ones)

#### DNA Profile Schema:
```typescript
{
  id: string,                    // UUID
  user_id: string,               // Hashed UUID from guest_id cookie
  sonic_embedding: number[],     // 12-dim vector
  broadcasting: boolean,         // User opted-in with email
  email: string,                 // Uppercase
  city: string,                  // Uppercase
  metadata: {                    // Flexible schema
    display_name: string,
    top_genres: string[],
    recent_tracks: any[],
    confidence: number[],
    coherence_index: number,
    narrative: string,
    // ... more fields
  },
  created_at: timestamp
}
```

---

### `lib/server/dns-check.ts` — Email Validation

**Purpose**: Validate email domain via DNS MX record lookup (Node.js only).

#### Functions:
- `isEmailDomainValid(email)`: Async MX record check → `boolean`

---

### `lib/utils.ts` — General Utilities

**Purpose**: Tailwind CSS utility merging.

#### Functions:
- `cn(...inputs)`: Merge Tailwind classes using clsx + twMerge

---

## API Routes

### Authentication

#### `GET /api/auth/me`
Fetch current session user information.

**Response**:
```typescript
{
  id: string (UUID),
  display_name: string,
  email: string | null
}
```

---

### DNA Profile Management

#### `POST /api/dna/generate`
**Core endpoint**: Generate and save Musical DNA.

**Request Body**:
```typescript
{
  genres: string[],                    // User-selected genres
  audioFeatures?: SpotifyAudioFeatures[],
  youtubeVideos?: { categoryId, title, tags }[],
  spotifyTracks?: any[],               // Track metadata
  youtubeTracks?: any[],
  artistGenres?: string[],             // Explicit artist genres
  displayName?: string,
  email?: string,
  city?: string,
  dry_run?: boolean                    // Validate without saving
}
```

**Response**:
```typescript
{
  success: boolean,
  profileId: string,
  userId: string,
  vector: number[],                    // 12-dim DNA
  confidence: number[],
  coherence_index: number,
  axes: string[],
  narrative: string,
  metadata: {...},
  created_at: timestamp
}
```

**Logic**:
1. Computes 3 DNA vectors (genre 50%, Spotify 25%, YouTube 25%)
2. Validates email domain via DNS MX check (skips on dry_run)
3. Upserts to `dna_profiles` table
4. Auto-deletes unsecured profiles >24h old
5. Sets cookies: `guest_id`, `has_dna`, `profile_id`

---

#### `GET /api/dna/profile/me`
Fetch current user's DNA profile.

**Response**:
```typescript
{
  found: boolean,
  profileId?: string,
  userId?: string,
  dna?: {
    vector: number[],
    coherence_index: number,
    confidence: number[],
    display_name: string,
    top_genres: string[],
    email: string | null,
    city: string | null,
    metadata: {...},
    axes: string[]
  }
}
```

---

#### `POST /api/dna/profile/save`
Update profile metadata (email, city, display name, broadcasting status).

**Request Body**:
```typescript
{
  displayName?: string,
  email?: string,
  city?: string,
  genres?: string[],
  bio?: string,
  broadcasting?: boolean,
  forceOverwrite?: boolean              // Allow email takeover
}
```

**Response**:
```typescript
{
  success: boolean
} 
// OR if email conflict:
{
  success: false,
  clash: {
    user_id: string,
    display_name: string,
    email: string,
    city: string,
    created_at: timestamp
  }
}
```

**Logic**:
- Checks for email conflicts (unless forceOverwrite=true)
- Validates domain via DNS MX
- Preserves non-updated fields

---

#### `POST /api/dna/profile/delete`
Delete user's DNA profile.

---

#### `GET /api/dna/profile/check-email`
Check if email is already taken.

---

### Matching & Signals

#### `GET /api/dna/match`
Fetch list of matched users (soulmates).

**Query**: None (uses authenticated user from cookies)

**Response**:
```typescript
[
  {
    user_id: string,
    metadata: {...},
    sonic_embedding: number[],
    similarity: number (0-1),            // Cosine similarity
    coherence: number,
    match_mode: "convergent" | "resonant" | "divergent",
    common_songs: any[],                 // Track overlaps
    common_artists_count: number,
    has_signal: boolean,                 // User has expressed interest
    is_mutual: boolean,
    city: string | null,
    bridge_id?: string
  },
  ...
]
```

**Logic**:
1. Queries RPC function `match_sonic_soulmates_v2` with pgvector
2. Filters duplicates by display name
3. Enriches with track/artist overlaps and match interests
4. Returns sorted by similarity

---

#### `POST /api/match/join`
Express interest in a candidate (create match_interests record).

**Request Body**:
```typescript
{
  targetId: string,
  email: string
}
```

**Response**:
```typescript
{
  success: boolean,
  message: string,
  isMutual: boolean,               // True if targetId also interested in caller
  bridgeId?: string                // Auto-created if mutual match
}
```

**Logic**:
1. Creates `match_interests` record
2. Detects mutual match (bidirectional interest)
3. Auto-creates `bridges` record if mutual
4. Prevents self-interest

---

#### `GET /api/match/notifications`
Fetch incoming interest signals (who has marked interest in this user).

**Response**:
```typescript
{
  signals: [
    {
      id: string,
      senderId: string,
      senderName: string,
      createdAt: timestamp
    },
    ...
  ]
}
```

---

### Spotify Integration

#### `POST /api/spotify/scan`
Analyze Spotify profile and extract tracks + audio features.

**Request Body**:
```typescript
{
  spotify_user_id: string,
  playlist_ids?: string[],             // Multi-playlist mode (max 5)
  playlist_id?: string,                // Single playlist mode
  limit?: number,
  offset?: number
}
```

**Response**:
```typescript
{
  tracks: SpotifyTrack[],              // Max 100
  audioFeatures: Record<trackId, SpotifyAudioFeatures>,
  artistGenres: string[],              // Deduplicated textual genres
  count: number
}
```

**Logic**:
1. Supports both multi-playlist and legacy single-playlist modes
2. Deduplicates by track ID
3. Fetches audio features batch API
4. Extracts artist textual genres

---

### YouTube Integration

#### `POST /api/youtube/analyze`
Analyze YouTube URLs and extract video metadata.

**Request Body**:
```typescript
{
  urls: string[]                       // Max 5 URLs
}
```

**Response**:
```typescript
{
  videos: [
    {
      id: string,
      title: string,
      channelTitle: string,
      categoryId: string,
      durationSeconds: number,
      tags: string[],
      thumbnail: string
    },
    ...
  ]
}
```

---

#### `GET /api/youtube/search`, `/history`, `/trending`
Search, fetch history, or get trending music videos.

---

### Bridge Management

#### `POST /api/bridge/create`
Create a new bridge between two users.

**Request Body**:
```typescript
{
  targetUserId: string
}
```

**Response**: Bridge object

---

#### `GET /api/bridge/info`
Get bridge details and participant info.

**Query**: `?bridgeId=xxx`

**Response**:
```typescript
{
  bridgeId: string,
  createdAt: timestamp,
  me: { userId, email, name },
  partner: { userId, email, name }
}
```

---

#### `POST /api/bridge/consent`
Accept/decline sharing email within a bridge.

**Request Body**:
```typescript
{
  bridgeId: string,
  consent: boolean
}
```

**Response**: Updated consents + revealed emails if both agreed

---

#### `POST /api/bridge/synthesize`
Generate a "fusion" playlist concept (midpoint DNA vector + description).

**Request Body**:
```typescript
{
  bridgeId: string
}
```

**Response**:
```typescript
{
  name: string,
  description: string,
  midpoint: number[],                // Averaged DNA vectors
  vibe: string[],
  tracks: Array<{ title, artist, duration }>
}
```

---

#### `GET /api/bridge/messages`, `POST /api/bridge/messages`
Fetch or send messages within a bridge conversation.

**GET Query**: `?bridgeId=xxx`

**POST Body**: `{ bridgeId, content }`

---

## Page Components

### `app/page.tsx` — Home / Discovery (1697 lines)

**Purpose**: Main landing and onboarding flow for generating DNA.

**Key Features**:
- Multi-stage flow: `landing` → `intro` → `genre_selection` → `sources` → `analyzing` → `complete` → `email_capture`
- Genre selection (56 genres)
- Spotify playlist scanning
- YouTube video analysis
- Email capture & profile completion
- DNA visualization (radar chart)
- Real-time ticker of analytics

**Key State**:
- `stage`: Current onboarding stage
- `selectedGenres`: User-picked genres
- `spotifyData`: Fetched Spotify tracks/features
- `youtubeData`: Fetched YouTube videos
- `generatedDNA`: Final 12D vector

**Components Used**:
- `DNAHelix`: Animated canvas animation
- `Ctr`: Animated counter
- `ShareDNACard`: Share modal

---

### `app/soulmates/page.tsx` — Match Browsing (562 lines)

**Purpose**: Browse and interact with matched users.

**Key Features**:
- Display all matched users sorted by similarity
- Filter by match mode (convergent/resonant/divergent)
- City-based filtering
- One-click interest expression
- Show track/artist overlap with each match
- Email & broadcasting setup modal

**Key State**:
- `matches`: Array of matched profiles
- `filter`: Match mode filter
- `cityFilter`: Selected city
- `selectedMatch`: Expanded match card
- `email`, `tempCity`: User registration data

**Key Functions**:
- `computeDisplaySimilarity`: Scale vector similarity to UX scale
- `classifyMatch`: Categorize by similarity threshold
- `handleInterest`: Send interest expression

---

### `app/profile/page.tsx` — User Profile & Settings (429 lines)

**Purpose**: View and manage personal DNA profile.

**Key Features**:
- Display 12-axis radar chart visualization
- Show top 3 traits, coherence score
- Edit email, city, display name
- Profile deletion option
- Share DNA card
- Regenerate DNA option

**Key Visualizations**:
- `RadarChart`: SVG polar graph of DNA vector
- `AxisBar`: Animated progress bars for each dimension

**Key State**:
- `profile`: Full DNA object
- `email`, `city`: Editable fields
- `saving`, `deleting`: Loading states

---

### Other Pages

| Page | Purpose |
|------|---------|
| `app/about/page.tsx` | About the platform |
| `app/privacy/page.tsx` | Privacy policy |
| `app/terms/page.tsx` | Terms of service |
| `app/artists/page.tsx` | Artist recommendation feature |
| `app/broadcast/page.tsx` | Broadcasting/visibility settings |
| `app/youtube/page.tsx` | YouTube integration tutorial |
| `app/bridge/[id]/page.tsx` | Bridge conversation & synthesis |
| `app/temp-room/[id]/page.tsx` | Temporary sharing room |

---

## Reusable Components

### `components/Navbar.tsx` (205 lines)

**Purpose**: Global top navigation bar.

**Key Features**:
- Brand logo with link to home
- Nav links: Discovery, Soulmates, Profile, About
- Notification bell with dropdown
- Mobile hamburger menu
- Dynamic link visibility based on user DNA status

**Key Props**: None (uses hooks internally)

**State**:
- `hasDna`: Whether current user has a DNA profile
- `notifications`: Incoming interest signals
- `showNotifications`: Dropdown visibility

---

### `components/CookieConsent.tsx` (73 lines)

**Purpose**: Compliant cookie banner.

**Features**:
- Auto-hides after user accepts
- Persists acceptance in localStorage
- Animated entrance/exit (Framer Motion)
- Accept & close buttons

---

### `components/ShareDNACard.tsx` (594 lines)

**Purpose**: Capture and share Musical DNA card.

**Key Features**:
- Hidden card rendering (600x800px)
- HTML2Canvas screenshot capture
- Download as PNG
- Social media sharing (Twitter, Facebook, LinkedIn, WhatsApp)
- Native share API (mobile)
- Copy link functionality

**Key Props**:
- `profile`: DNA profile object
- `siteUrl?`: Custom share URL

**Sub-components**:
- `MiniRadar`: Small radar visualization for card

---

## Utilities & Helpers

### `middleware.ts`

**Purpose**: Next.js middleware to ensure persistent guest identity.

**Key Logic**:
1. Skip static files, `_next`, favicons
2. Assign `guest_id` UUID if missing
3. Check if user has DNA profile on home page
4. Redirect to `/soulmates` if DNA exists
5. Set persistent cookie (1 year)

---

### `lib/utils.ts`

**Exports**: `cn()` function (Tailwind class merging)

---

## Database Schema

### Tables (Supabase)

#### `dna_profiles`
```sql
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id           TEXT UNIQUE NOT NULL
sonic_embedding   vector(12)  -- pgvector type
metadata          JSONB       -- Flexible schema
email             TEXT UNIQUE
city              TEXT
broadcasting      BOOLEAN DEFAULT false
created_at        TIMESTAMP DEFAULT now()
updated_at        TIMESTAMP DEFAULT now()
```

#### `match_interests`
```sql
id        UUID PRIMARY KEY
user_id   TEXT REFERENCES dna_profiles(user_id)
target_id TEXT REFERENCES dna_profiles(user_id)
email     TEXT
created_at TIMESTAMP DEFAULT now()
UNIQUE(user_id, target_id)
```

#### `bridges`
```sql
id                  UUID PRIMARY KEY
user_a              TEXT
user_b              TEXT
common_ground_data  JSONB        -- Flexible: consents, synthesis, synthesis
created_at          TIMESTAMP DEFAULT now()
```

#### `bridge_messages`
```sql
id        UUID PRIMARY KEY
bridge_id UUID REFERENCES bridges(id)
sender_id TEXT
content   TEXT
created_at TIMESTAMP DEFAULT now()
```

### RPC Functions

#### `match_sonic_soulmates_v2(query_embedding, match_threshold, match_count, caller_id)`
Uses pgvector `<->` operator to find top N similar profiles.

---

## Key Flows

### 1. User Onboarding → DNA Generation

```
User visits home
    ↓
Middleware assigns guest_id cookie
    ↓
Stage 1: Landing screen
    ↓
Stage 2: Intro / Guided tour
    ↓
Stage 3: Welcome (name entry)
    ↓
Stage 4: Story (optional context)
    ↓
Stage 5: Source selection (Spotify/YouTube)
    ↓
Stage 6: Genre selection (56 genres)
    ↓
[If Spotify selected]
  Fetch playlists via /api/spotify/scan
  Extract audio features
  
[If YouTube selected]
  Paste video URLs
  Analyze via /api/youtube/analyze
    ↓
Stage 7: Analyzing screen (ticker animation)
    ↓
POST /api/dna/generate
  - Compute 3 DNA vectors
  - Blend with weights (50/25/25)
  - Validate email domain
  - Upsert to dna_profiles
    ↓
Stage 8: Complete (show DNA card)
    ↓
Stage 9: Email capture (optional)
    ↓
Set cookies: has_dna=true, profile_id
    ↓
Redirect or show next steps
```

---

### 2. Matching & Connection Flow

```
User views Soulmates page
    ↓
GET /api/dna/match
  - Fetch user's DNA
  - RPC pgvector search (top 10 similar)
  - Join with interests/bridges
  - Compute overlapping tracks/artists
    ↓
Display paginated list
  Filter by: mode (convergent/resonant/divergent), city
    ↓
User clicks profile card
    ↓
User can express interest ("Send Signal")
    ↓
POST /api/match/join (targetId, email)
  - Create match_interests record
  - Check if mutual (bidirectional)
    ↓
If Mutual:
  - Auto-create bridges record
  - Both users notified
    ↓
User navigates to bridge
    ↓
Bridge workflow:
  1. Request consent to share email
  2. Once both consent → emails revealed
  3. Optionally synthesize shared playlist
  4. Send messages within bridge
```

---

### 3. Profile Management Flow

```
User visits /profile
    ↓
GET /api/dna/profile/me
    ↓
Display:
  - 12-axis radar chart
  - Top 3 traits
  - Coherence score
  - Recent tracks
  - Share button
    ↓
User can:
  - Edit email/city
  - Delete profile
  - Regenerate DNA
  - Share DNA card
    ↓
POST /api/dna/profile/save
  - Resolve email conflicts
  - Update metadata
  - Set broadcasting flag
```

---

### 4. Data Flow: Genre → Vector

```
User selects: ["Electronic", "Jazz", "Lo-Fi"]
    ↓
computeGenreVector(genres)
  - Look up GENRE_VECTORS["electronic"], GENRE_VECTORS["jazz"], etc.
  - Average the 3 vectors
  - Return DNAVector with confidence array
    ↓
Result: 12D vector e.g. [0.7, 0.6, 0.5, ...]
```

---

### 5. Data Flow: Spotify → Vector

```
User provides Spotify playlist ID
    ↓
POST /api/spotify/scan
  - Use SpotifyPublicFetcher
  - Fetch tracks & audio features (energy, valence, etc.)
  - Extract artist genres (textual)
    ↓
computeSpotifyVector(audioFeatures, artistGenres)
  - Map features to SPOTIFY_AXIS_MAP
  - Normalize to [0.3, 0.95] range
  - Weight artist genres heavily (10x)
  - Average all tracks
    ↓
Result: 12D vector from Spotify
```

---

### 6. DNA Blending (Final Weights)

```
genreDNA   = computeGenreVector(selectedGenres)       [has data]
spotifyDNA = computeSpotifyVector(features)           [maybe null]
youtubeDNA = computeYouTubeVector(videos)             [maybe null]
    ↓
combineDNA(genreDNA, spotifyDNA, youtubeDNA)
  - Check what data is available
  - Adjust weights dynamically:
    - If all 3: 50% genre, 25% Spotify, 25% YouTube
    - If genre + Spotify: 50% genre, 50% Spotify
    - If genre only: 100% genre
    ↓
Final vector = weighted blend across all 3 sources
```

---

### 7. Matching & Similarity

```
User A DNA:   [0.7, 0.5, 0.8, 0.6, 0.4, 0.9, 0.5, 0.7, 0.6, 0.8, 0.5, 0.7]
User B DNA:   [0.72, 0.51, 0.79, 0.58, 0.42, 0.91, 0.52, 0.69, 0.58, 0.79, 0.52, 0.69]
    ↓
cosineSimilarity(A, B)
  - Dot product: A·B / (||A|| × ||B||)
  - Result: 0.99847 (very similar)
    ↓
matchScore(A, B)
  - Cosine: 0.99847
  - Match mode: "convergent" (>0.85)
  - Axis differences: [0.02, 0.01, 0.01, ...]
    ↓
Display on UI:
  - Show match card as "Convergent"
  - Display overlap %: ~99%
```

---

## Configuration

### Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# Spotify
SPOTIFY_CLIENT_ID=xxx
SPOTIFY_CLIENT_SECRET=xxx

# YouTube
YOUTUBE_API_KEY=xxx

# Optional: Google OAuth (future)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx
```

### Build & Run

```bash
# Install dependencies
pnpm install

# Development
pnpm dev

# Production build
pnpm build
pnpm start

# Lint
pnpm lint
```

---

## Performance Notes

- **DNA Calculation**: O(n) where n = number of tracks (typically <100)
- **Matching**: Uses pgvector index for fast similarity search (O(log N))
- **Email Validation**: Async DNS MX check (network I/O)
- **Caching**: Spotify/YouTube results cached on client
- **Pagination**: Matches returned in batches (10 per request)

---

## Future Enhancements

1. **AI Recommendations**: Replace hardcoded narratives with LLM summaries
2. **Real-time Messaging**: WebSocket support for live bridge chat
3. **Playlist Synthesis**: Generate Spotify playlist from bridge synthesis
4. **Social Proof**: Show mutual friend count, shared venues
5. **Advanced Filters**: By instrument, tempo, mood
6. **Mobile App**: React Native implementation
7. **Analytics**: User engagement tracking
8. **Recommendations Engine**: Collaborative filtering for new genres

---

## Security Considerations

- **Email Privacy**: Stored as UPPERCASE, validated via DNS MX
- **Email Reveal**: Only after mutual consent within bridge
- **Data Retention**: Auto-delete unsecured profiles >24h old
- **CORS**: API routes only from same origin
- **SQL Injection**: Supabase parameterized queries
- **XSS Protection**: React sanitization, CSP headers
- **Rate Limiting**: None currently (consider adding)

---

## File Statistics

| Category | Count | Total Lines |
|----------|-------|-------------|
| API Routes | 23 | ~1,500 |
| Page Components | 10+ | ~3,500 |
| Reusable Components | 3 | ~900 |
| Libraries | 5 | ~2,000 |
| Config Files | 5 | ~100 |
| **Total** | **50+** | **~8,000** |

---

## Maintenance & Debugging

### Common Issues

1. **"No guest session"**: Cookies disabled or middleware not loaded
2. **Email validation fails**: DNS resolution issue or no MX records
3. **Spotify auth fails**: Client credentials expired or not set
4. **Pgvector similarity returns 0**: Vector schema mismatch or NULL values
5. **Bridge not created**: User already has interest record with that target

### Logging

- API errors logged to console with context
- Client errors caught and displayed as user-friendly alerts
- No server-side logging infrastructure (use Supabase logs)

### Testing

- E2E tests via Playwright (`@playwright/test`)
- Manual test endpoint: `GET /api/test/reset`
- Can reset database to seed state (guards needed)

---

**Last Updated**: March 6, 2026  
**Documentation Version**: 1.0
