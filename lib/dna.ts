/**
 * musicDNAmatch — TypeScript DNA Engine
 * ======================================
 * Calculates a 12-dimensional Musical DNA vector from:
 *   - Genre preferences (50% weight)
 *   - Spotify audio features (25% weight)
 *   - YouTube metadata (25% weight)
 */

// ── Axis labels ─────────────────────────────────────
export const AXIS_LABELS = [
    "spectral_energy", "harmonic_depth", "rhythmic_drive",
    "melodic_warmth", "structural_complexity", "sonic_texture",
    "tempo_variance", "tonal_brightness", "dynamic_range",
    "genre_fusion", "experimental_index", "emotional_density",
] as const;

export const DNA_SCHEMA_VERSION = 2;

export const AXIS_DESCRIPTIONS: Record<string, string> = {
    "spectral_energy": "High-energy, intense soundscapes",
    "harmonic_depth": "Rich harmony and tonal complexity",
    "rhythmic_drive": "Groove-forward, rhythmic music",
    "melodic_warmth": "Warm, melodic focus",
    "structural_complexity": "Intricate, progressive structures",
    "sonic_texture": "Layered and detailed production",
    "tempo_variance": "Dynamic tempo and timing changes",
    "tonal_brightness": "Bright, uplifting tonal palette",
    "dynamic_range": "High dynamic contrast",
    "genre_fusion": "Experimental genre blending",
    "experimental_index": "Avant-garde, unconventional sounds",
    "emotional_density": "Deep emotional and atmospheric weight",
};

/**
 * Decodes a DNA vector into layman's terms.
 */
export function generateInterpretation(vector: number[]) {
    if (!vector || vector.length === 0) return { characteristics: [], genreMatches: [] };

    // Get top 5 characteristics
    const characteristics = vector
        .map((v, i) => ({ label: AXIS_LABELS[i], value: v }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)
        .map(axis => AXIS_DESCRIPTIONS[axis.label] || axis.label.replace(/_/g, " "));

    // Get top 5 matching genres based on euclidean distance (lower is better)
    const genreMatches = Object.entries(GENRE_VECTORS)
        .map(([name, genreVec]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            score: euclideanDistance(vector, genreVec)
        }))
        .sort((a, b) => a.score - b.score)
        .slice(0, 5)
        .map(g => g.name);

    return {
        characteristics,
        genreMatches
    };
}

// ── Genre display list (for the UI picker) ──────────
export const GENRE_OPTIONS = [
    { key: "electronic", label: "Electronic", emoji: "⚡" },
    { key: "hiphop", label: "Hip-Hop", emoji: "🎤" },
    { key: "indie", label: "Indie/Alt", emoji: "🎸" },
    { key: "classical", label: "Classical", emoji: "🎻" },
    { key: "jazz", label: "Jazz", emoji: "🎷" },
    { key: "rnb", label: "R&B/Soul", emoji: "🎶" },
    { key: "metal", label: "Metal/Rock", emoji: "🤘" },
    { key: "pop", label: "Pop", emoji: "✨" },
    { key: "folk", label: "Folk/Acoustic", emoji: "🪕" },
    { key: "latin", label: "Latin", emoji: "💃" },
    { key: "world", label: "World/Global", emoji: "🌍" },
    { key: "ambient", label: "Ambient/Drone", emoji: "🌫️" },
] as const;

// ── Genre bias vectors (12-dim per genre) ───────────
export const GENRE_VECTORS: Record<string, number[]> = {
    "electronic": [0.9, 0.5, 0.8, 0.3, 0.7, 0.9, 0.6, 0.8, 0.7, 0.7, 0.8, 0.5],
    "techno": [0.9, 0.4, 0.9, 0.2, 0.6, 0.9, 0.5, 0.7, 0.7, 0.6, 0.8, 0.4],
    "house": [0.8, 0.5, 0.9, 0.4, 0.5, 0.8, 0.4, 0.8, 0.6, 0.6, 0.6, 0.6],
    "ambient": [0.4, 0.6, 0.2, 0.6, 0.6, 0.9, 0.8, 0.5, 0.9, 0.5, 0.8, 0.6],
    "hiphop": [0.7, 0.4, 0.9, 0.6, 0.5, 0.7, 0.5, 0.6, 0.8, 0.8, 0.5, 0.8],
    "rnb": [0.6, 0.7, 0.7, 0.9, 0.5, 0.7, 0.4, 0.6, 0.6, 0.6, 0.4, 0.9],
    "indie": [0.5, 0.6, 0.5, 0.8, 0.7, 0.6, 0.7, 0.5, 0.7, 0.6, 0.6, 0.7],
    "classical": [0.4, 0.9, 0.3, 0.9, 0.9, 0.5, 0.8, 0.6, 0.9, 0.3, 0.4, 0.8],
    "jazz": [0.5, 0.9, 0.6, 0.7, 0.8, 0.6, 0.8, 0.5, 0.7, 0.7, 0.7, 0.7],
    "metal": [0.9, 0.6, 0.9, 0.3, 0.7, 0.8, 0.5, 0.4, 0.8, 0.5, 0.7, 0.7],
    "rock": [0.8, 0.6, 0.7, 0.5, 0.6, 0.7, 0.5, 0.5, 0.7, 0.5, 0.5, 0.7],
    "pop": [0.6, 0.5, 0.7, 0.7, 0.4, 0.6, 0.4, 0.8, 0.5, 0.5, 0.3, 0.7],
    "folk": [0.3, 0.7, 0.4, 0.9, 0.6, 0.4, 0.6, 0.6, 0.8, 0.4, 0.5, 0.8],
    "latin": [0.6, 0.6, 0.9, 0.7, 0.5, 0.6, 0.5, 0.7, 0.6, 0.7, 0.4, 0.8],
    "world": [0.5, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.6, 0.6, 0.9, 0.7, 0.7],
    "country": [0.4, 0.6, 0.5, 0.8, 0.5, 0.5, 0.4, 0.7, 0.6, 0.4, 0.3, 0.7],
    "blues": [0.5, 0.8, 0.5, 0.8, 0.6, 0.5, 0.5, 0.4, 0.7, 0.5, 0.5, 0.9],
    "soul": [0.6, 0.7, 0.6, 0.9, 0.5, 0.6, 0.4, 0.6, 0.6, 0.6, 0.4, 0.9],
    "punk": [0.8, 0.4, 0.8, 0.4, 0.4, 0.7, 0.4, 0.5, 0.6, 0.4, 0.6, 0.6],
    "reggae": [0.4, 0.6, 0.7, 0.8, 0.5, 0.6, 0.5, 0.6, 0.5, 0.6, 0.4, 0.8],
    "disco": [0.7, 0.5, 0.9, 0.6, 0.4, 0.7, 0.4, 0.8, 0.6, 0.6, 0.4, 0.7],
    "funk": [0.7, 0.6, 0.9, 0.7, 0.5, 0.7, 0.5, 0.6, 0.7, 0.7, 0.5, 0.8],
    "synthwave": [0.8, 0.5, 0.7, 0.5, 0.6, 0.9, 0.5, 0.8, 0.7, 0.6, 0.7, 0.6],
    "lofi": [0.3, 0.5, 0.4, 0.7, 0.4, 0.7, 0.6, 0.5, 0.5, 0.5, 0.5, 0.7],
    "kpop": [0.7, 0.5, 0.8, 0.6, 0.6, 0.7, 0.5, 0.9, 0.6, 0.7, 0.5, 0.7],
    "afrobeats": [0.7, 0.6, 0.9, 0.7, 0.5, 0.7, 0.5, 0.7, 0.6, 0.8, 0.5, 0.8],
    "gospel": [0.5, 0.8, 0.6, 0.9, 0.6, 0.5, 0.5, 0.7, 0.7, 0.4, 0.3, 0.9],
    "experimental": [0.6, 0.6, 0.5, 0.4, 0.9, 0.8, 0.9, 0.4, 0.8, 0.7, 0.9, 0.5],
    "phonk": [0.8, 0.4, 0.9, 0.5, 0.4, 0.8, 0.4, 0.6, 0.7, 0.7, 0.6, 0.8],
    "synthpop": [0.7, 0.6, 0.8, 0.7, 0.5, 0.8, 0.4, 0.8, 0.6, 0.6, 0.5, 0.7],
    "grunge": [0.7, 0.6, 0.6, 0.5, 0.6, 0.7, 0.5, 0.4, 0.7, 0.5, 0.5, 0.8],
    "industrial": [0.9, 0.5, 0.8, 0.2, 0.7, 0.9, 0.6, 0.4, 0.8, 0.6, 0.8, 0.5],
    "garage": [0.8, 0.5, 0.9, 0.5, 0.5, 0.7, 0.5, 0.7, 0.6, 0.6, 0.5, 0.7],
    "trap": [0.8, 0.4, 0.9, 0.5, 0.4, 0.8, 0.5, 0.7, 0.8, 0.8, 0.5, 0.8],
    "drill": [0.8, 0.4, 0.9, 0.4, 0.5, 0.8, 0.5, 0.6, 0.8, 0.8, 0.5, 0.8],
    "dubstep": [0.9, 0.4, 0.9, 0.3, 0.7, 0.9, 0.6, 0.6, 0.8, 0.6, 0.8, 0.5],
    "trance": [0.9, 0.5, 0.8, 0.4, 0.6, 0.8, 0.5, 0.9, 0.6, 0.5, 0.7, 0.5],
};

// ── Spotify audio feature → DNA axis mapping ────────
const SPOTIFY_AXIS_MAP: Record<number, [string, number][]> = {
    0: [["energy", 0.6], ["loudness_norm", 0.4]],
    1: [["instrumentalness", 0.5], ["acousticness", 0.5]],
    2: [["danceability", 0.5], ["tempo_norm", 0.5]],
    3: [["valence", 0.4], ["acousticness", 0.6]],
    4: [["time_signature_norm", 0.5], ["key_norm", 0.5]],
    5: [["liveness", 0.4], ["instrumentalness", 0.6]],
    6: [["tempo_norm", 0.7], ["time_signature_norm", 0.3]],
    7: [["valence", 0.5], ["mode_norm", 0.5]],
    8: [["loudness_norm", 0.5], ["energy", 0.5]],
    9: [["speechiness", 0.5], ["liveness", 0.5]],
    10: [["instrumentalness", 0.4], ["acousticness", 0.6]],
    11: [["valence", 0.4], ["energy", 0.6]],
};

// YouTube category → genre mapping
const YT_CATEGORY_GENRE: Record<string, string> = {
    "10": "pop", "24": "electronic", "17": "rnb",
    "1": "ambient", "2": "world", "22": "pop",
    "23": "hiphop", "25": "world", "26": "experimental",
    "27": "classical", "28": "jazz",
};

// YouTube Title/Tag → Genre Keywords
const YT_GENRE_KEYWORDS: Record<string, string[]> = {
    "rock": ["rock", "queen", "nirvana", "sting", "police", "led zeppelin", "pink floyd", "arctic monkeys", "radiohead", "guitar", "live aide"],
    "metal": ["metal", "metallica", "slayer", "megadeth", "iron maiden", "hardcore", "heavy"],
    "hiphop": ["hiphop", "rap", "trap", "drill", "eminem", "drake", "kendrick", "beats"],
    "electronic": ["electronic", "techno", "house", "edm", "synth", "mix", "remix", "dj"],
    "jazz": ["jazz", "miles davis", "coltrane", "sax", "trumpet", "smooth"],
    "rnb": ["rnb", "soul", "motown", "blues", "frank ocean", "sZA"],
    "classical": ["classical", "bach", "beethoven", "mozart", "orchestra", "piano", "violin"],
    "pop": ["pop", "taylor swift", "bieber", "top hits", "chart", "billboard"],
    "ambient": ["ambient", "drone", "meditation", "sleep", "calm", "lofi"],
};

// ── Types ───────────────────────────────────────────
export interface DNAVector {
    vector: number[];
    confidence: number[];
    coherence_index: number;
    schema_version: number;
    source: string;
    metadata: Record<string, any>;
}

export interface SpotifyAudioFeatures {
    energy?: number;
    valence?: number;
    danceability?: number;
    acousticness?: number;
    instrumentalness?: number;
    liveness?: number;
    speechiness?: number;
    loudness?: number;
    tempo?: number;
    key?: number;
    mode?: number;
    time_signature?: number;
}

// ── Core Functions ──────────────────────────────────

/**
 * Standardised coherence calculation to ensure consistency across all screens.
 */
export function calculateCoherence(vector: number[], confidence: number[] = []): number {
    if (!vector || vector.length === 0) return 0;
    const conf = confidence.length === vector.length ? confidence : Array(vector.length).fill(1.0);
    const totalConf = conf.reduce((a, b) => a + b, 0) + 1e-9;
    const weights = conf.map(c => c / totalConf);
    const mean = weights.reduce((sum, w, i) => sum + w * vector[i], 0);
    const variance = weights.reduce((sum, w, i) => sum + w * Math.pow(vector[i] - mean, 2), 0);
    return round4(Math.max(0, Math.min(1, 1.0 - Math.sqrt(variance) / 0.5)));
}

/**
 * Compute a DNA vector from user's selected genres.
 */
export function computeGenreVector(selectedGenres: string[]): DNAVector {
    const normalised = selectedGenres.map(g => {
        const s = g.toLowerCase().replace(/[^a-z0-9]/g, ""); // include numbers for K-Pop etc
        // Handle common variations/aliases
        if (s === "rb") return "rnb";
        if (s === "indierock") return "indie";
        if (s === "dreampop") return "indie";
        if (s === "hiphop") return "hiphop";
        if (s === "synthpop") return "synthpop";
        if (s === "phenk" || s === "phonk") return "phonk";
        if (s === "technopop") return "techno";
        if (s === "folkrock") return "rock";
        if (s === "kpop") return "kpop";
        if (s === "jpop") return "pop";
        if (s === "acidjazz") return "jazz";
        if (s === "deephouse") return "house";
        if (s === "futurebass") return "electronic";
        if (s === "nudisco") return "disco";
        // Map some more GENRES from page.tsx to lib/dna.ts keys
        if (g === "R&B") return "rnb";
        if (g === "Hip Hop") return "hiphop";
        return s;
    });

    const vecs = normalised
        .map(g => GENRE_VECTORS[g])
        .filter(Boolean);

    if (vecs.length === 0) {
        return makeDNA(Array(12).fill(0.5), Array(12).fill(0.3), "genre", { genres: selectedGenres });
    }

    const vector = Array(12).fill(0).map((_, i) =>
        vecs.reduce((sum, v) => sum + v[i], 0) / vecs.length
    );
    return makeDNA(vector, Array(12).fill(1.0), "genre", { genres: selectedGenres });
}


/**
 * Compute DNA vector from Spotify audio features and explicit Artist Genres.
 */
export function computeSpotifyVector(featuresList: SpotifyAudioFeatures[], artistGenres: string[] = []): DNAVector {
    if (featuresList.length === 0 && artistGenres.length === 0) {
        return makeDNA(Array(12).fill(0.5), Array(12).fill(0.1), "spotify", { track_count: 0 });
    }

    const axisValues: number[][] = Array.from({ length: 12 }, () => []);

    for (const f of featuresList) {
        const norm: Record<string, number> = {
            energy: f.energy ?? 0.5,
            valence: f.valence ?? 0.5,
            danceability: f.danceability ?? 0.5,
            acousticness: f.acousticness ?? 0.5,
            instrumentalness: f.instrumentalness ?? 0.0,
            liveness: f.liveness ?? 0.1,
            speechiness: f.speechiness ?? 0.05,
            loudness_norm: Math.min(((f.loudness ?? -10) + 60) / 60, 1.0),
            tempo_norm: Math.min((f.tempo ?? 120) / 200, 1.0),
            key_norm: (f.key ?? 0) / 11,
            mode_norm: f.mode ?? 1,
            time_signature_norm: Math.min((f.time_signature ?? 4) / 7, 1.0),
        };

        for (let axis = 0; axis < 12; axis++) {
            const mappings = SPOTIFY_AXIS_MAP[axis];
            const rawVal = mappings.reduce((sum, [key, weight]) => sum + (norm[key] ?? 0.5) * weight, 0);

            // Normalize against the GENRE_VECTORS baseline expectations.
            // Raw audio features often drop to 0.0 (like acousticness), but our genre vectors bottom out ~0.3.
            // This squashes the 0-1 range into a safer ~0.3-0.95 range.
            const val = 0.3 + (rawVal * 0.65);

            axisValues[axis].push(val);
        }
    }

    // Blend explicit Artist Genres if available
    if (artistGenres && artistGenres.length > 0) {
        const normalisedGenres = artistGenres.map(g => {
            const s = g.toLowerCase().replace(/[^a-z0-9]/g, "");
            if (s === "rb") return "rnb";
            if (s === "indierock") return "indie";
            if (s === "dreampop") return "indie";
            if (s === "hiphop") return "hiphop";
            if (s === "synthpop") return "synthpop";
            if (s === "phenk" || s === "phonk") return "phonk";
            if (s === "technopop") return "techno";
            if (s === "folkrock") return "rock";
            if (s === "kpop") return "kpop";
            if (s === "jpop") return "pop";
            if (s === "acidjazz") return "jazz";
            if (s === "deephouse") return "house";
            if (s === "futurebass") return "electronic";
            if (s === "nudisco") return "disco";
            return s;
        });

        const activeVectors = normalisedGenres
            .map(g => GENRE_VECTORS[g])
            .filter(Boolean);

        // Weigh each explicit genre heavily compared to raw audio averages
        for (const genreVec of activeVectors) {
            for (let axis = 0; axis < 12; axis++) {
                // Weight explicit textual labels heavily (e.g. push 10 copies into the average)
                for (let w = 0; w < 10; w++) {
                    axisValues[axis].push(genreVec[axis]);
                }
            }
        }
    }

    const vector = axisValues.map(vals => vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0.5);
    // Trust the data more if we actually have textual labels 
    const confidence = axisValues.map(vals => Math.min(1.0, (vals.length / 10) + (artistGenres.length > 0 ? 0.3 : 0)));

    return makeDNA(vector, confidence, "spotify", { track_count: Math.max(featuresList.length, artistGenres.length) });
}

/**
 * Compute DNA vector from YouTube video metadata.
 */
export function computeYouTubeVector(videos: { categoryId?: string; title?: string; tags?: string[] }[]): DNAVector {
    if (videos.length === 0) {
        return makeDNA(Array(12).fill(0.5), Array(12).fill(0.1), "youtube", { track_count: 0 });
    }

    const genreVecs: number[][] = [];

    for (const v of videos) {
        const title = (v.title || "").toLowerCase();
        const tags = (v.tags || []).map(t => t.toLowerCase());

        // Find best genre match via title/tags keywords
        let detectedGenre: string | null = null;
        for (const [genre, keywords] of Object.entries(YT_GENRE_KEYWORDS)) {
            if (keywords.some(k => title.includes(k) || tags.some(t => t.includes(k)))) {
                detectedGenre = genre;
                break;
            }
        }

        // Fallback to category mapping
        if (!detectedGenre) {
            detectedGenre = YT_CATEGORY_GENRE[v.categoryId || "10"] || "pop";
        }

        const vec = GENRE_VECTORS[detectedGenre] || GENRE_VECTORS["pop"];
        genreVecs.push(vec);
    }

    const vector = Array(12).fill(0).map((_, i) =>
        genreVecs.reduce((sum, v) => sum + v[i], 0) / genreVecs.length
    );

    return makeDNA(vector, Array(12).fill(0.4), "youtube", { track_count: videos.length });
}

/**
 * Combine genre (50%) + Spotify (25%) + YouTube (25%) into final DNA.
 */
export function combineDNA(
    genreDNA: DNAVector,
    spotifyDNA: DNAVector | null,
    youtubeDNA: DNAVector | null,
): DNAVector {
    const vg = genreDNA.vector;
    const vs = spotifyDNA?.vector;
    const vy = youtubeDNA?.vector;

    const cg = genreDNA.confidence;
    const cs = spotifyDNA?.confidence;
    const cy = youtubeDNA?.confidence;

    const hasGenre = (genreDNA.metadata.genres || []).length > 0;
    const hasSpot = !!spotifyDNA && (spotifyDNA.metadata.track_count || 0) > 0;
    const hasYt = !!youtubeDNA && (youtubeDNA.metadata.track_count || 0) > 0;

    let wg = 0.5, ws = 0.25, wy = 0.25;

    if (hasGenre && hasSpot && hasYt) { wg = 0.5; ws = 0.25; wy = 0.25; }
    else if (hasGenre && hasSpot && !hasYt) { wg = 0.5; ws = 0.5; wy = 0; }
    else if (hasGenre && !hasSpot && hasYt) { wg = 0.5; ws = 0; wy = 0.5; }
    else if (hasGenre && !hasSpot && !hasYt) { wg = 1.0; ws = 0; wy = 0; }
    else if (!hasGenre && hasSpot && hasYt) { wg = 0; ws = 0.5; wy = 0.5; }
    else if (!hasGenre && hasSpot && !hasYt) { wg = 0; ws = 1.0; wy = 0; }
    else if (!hasGenre && !hasSpot && hasYt) { wg = 0; ws = 0; wy = 1.0; }
    else { wg = 0.5; ws = 0.25; wy = 0.25; } // fallback

    const vector = Array(12).fill(0).map((_, i) =>
        wg * vg[i] + ws * (vs ? vs[i] : vg[i]) + wy * (vy ? vy[i] : vg[i])
    );
    const confidence = Array(12).fill(0).map((_, i) =>
        Math.min(1.0, wg * cg[i] + ws * (cs ? cs[i] : 0) + wy * (cy ? cy[i] : 0))
    );

    return makeDNA(vector, confidence, "combined", {
        spotify_tracks: spotifyDNA?.metadata.track_count ?? 0,
        youtube_tracks: youtubeDNA?.metadata.track_count ?? 0,
        genres: genreDNA.metadata.genres ?? [],
    });
}

/**
 * Compute match score between two DNA vectors.
 */
export function matchScore(a: DNAVector, b: DNAVector) {
    if (!a?.vector || !b?.vector || !Array.isArray(a.vector) || !Array.isArray(b.vector)) {
        return {
            cosine_similarity: 0,
            divergence_score: 1.0,
            match_mode: "unknown",
            axis_diff: Array(12).fill(1.0),
            axis_labels: [...AXIS_LABELS],
        };
    }
    const cosine = cosineSimilarity(a.vector, b.vector);
    const mode = cosine >= 0.85 ? "convergent" : cosine >= 0.70 ? "resonant" : "divergent";

    return {
        cosine_similarity: round4(cosine),
        divergence_score: round4(1.0 - cosine),
        match_mode: mode,
        axis_diff: a.vector.map((v, i) => round4(Math.abs(v - b.vector[i]))),
        axis_labels: [...AXIS_LABELS],
    };
}

// ── Helpers ─────────────────────────────────────────

function makeDNA(vector: number[], confidence: number[], source: string, metadata: Record<string, any>): DNAVector {
    return {
        vector,
        confidence,
        coherence_index: computeCoherence(vector, confidence),
        schema_version: DNA_SCHEMA_VERSION,
        source,
        metadata,
    };
}

function computeCoherence(vector: number[], confidence: number[]): number {
    const totalConf = confidence.reduce((a, b) => a + b, 0) + 1e-9;
    const weights = confidence.map(c => c / totalConf);
    const mean = weights.reduce((sum, w, i) => sum + w * vector[i], 0);
    const variance = weights.reduce((sum, w, i) => sum + w * Math.pow(vector[i] - mean, 2), 0);
    return round4(Math.max(0, Math.min(1, 1.0 - Math.sqrt(variance) / 0.5)));
}

function cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB) + 1e-9;
    return Math.max(0, Math.min(1, dot / denom));
}

function euclideanDistance(a: number[], b: number[]): number {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
        sum += Math.pow(a[i] - b[i], 2);
    }
    return Math.sqrt(sum);
}

function round4(n: number): number {
    return Math.round(n * 10000) / 10000;
}
