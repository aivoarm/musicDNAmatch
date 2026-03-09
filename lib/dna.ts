/**
 * musicDNAmatch — TypeScript DNA Engine (v2.3)
 * Full Implementation: All Exports Restored & Logic Enhanced.
 */

// ── Axis labels & Descriptions ──────────────────────
export const AXIS_LABELS = [
    "spectral_energy", "harmonic_depth", "rhythmic_drive",
    "melodic_warmth", "structural_complexity", "sonic_texture",
    "tempo_variance", "tonal_brightness", "dynamic_range",
    "genre_fusion", "experimental_index", "emotional_density",
] as const;

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

export const DNA_SCHEMA_VERSION = 2;

// ── Genre Bias Vectors ───────────────────────────────
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

// ── Internal Helpers ────────────────────────────────

const round4 = (n: number) => Math.round(n * 10000) / 10000;

const euclideanDistance = (a: number[], b: number[]) =>
    Math.sqrt(a.reduce((acc, val, i) => acc + Math.pow(val - b[i], 2), 0));

const cosineSimilarity = (a: number[], b: number[]) => {
    const dot = a.reduce((acc, val, i) => acc + val * b[i], 0);
    const normA = Math.sqrt(a.reduce((acc, val) => acc + val * val, 0));
    const normB = Math.sqrt(b.reduce((acc, val) => acc + val * val, 0));
    return dot / (normA * normB + 1e-9);
};

const makeDNA = (vector: number[], confidence: number[], source: string, metadata: Record<string, any>): DNAVector => ({
    vector, confidence, coherence_index: calculateCoherence(vector, confidence),
    schema_version: DNA_SCHEMA_VERSION, source, metadata
});

// ── Data Mappings ──────────────────────────────────

const TIER_WEIGHTS = { GOLD: 1.0, SILVER: 0.6 };

const YT_TIERS: Record<string, { gold: string[], silver: string[] }> = {
    "kpop": {
        gold: ["kpop", "blackpink", "bts", "twice", "newjeans", "huntrix", "stray kids", "exo", "red velvet", "aespa", "itzy"],
        silver: ["k-pop", "korean", "hallyu", "idol"]
    },
    "rock": {
        gold: ["queen", "led zeppelin", "nirvana", "ac/dc", "pink floyd", "the beatles", "rolling stones", "arctic monkeys", "radiohead"],
        silver: ["rock", "guitar", "live aid", "classic rock", "stadium rock"]
    },
    "metal": {
        gold: ["metallica", "slayer", "megadeth", "iron maiden", "black sabbath", "slipknot", "system of a down", "gojira"],
        silver: ["metal", "heavy metal", "death metal", "thrash", "djent"]
    },
    "electronic": {
        gold: ["daft punk", "aphex twin", "skrillex", "deadmau5", "tiesto", "avicii", "disclosure", "kaytranada", "flume"],
        silver: ["electronic", "techno", "house", "edm", "synth", "mix", "remix", "dj set"]
    },
    "hiphop": {
        gold: ["kendrick lamar", "drake", "eminem", "kanye west", "travis scott", "2pac", "biggie", "jay-z", "j cole", "nas"],
        silver: ["hiphop", "rap", "trap", "drill", "beats", "type beat", "hip-hop"]
    },
    "jazz": {
        gold: ["miles davis", "coltrane", "herbie hancock", "brubeck", "nina simone", "bill evans", "kamasi washington"],
        silver: ["jazz", "sax", "trumpet", "smooth jazz", "bebop", "blue note"]
    },
    "rnb": {
        gold: ["frank ocean", "sza", "the weeknd", "alicia keys", "usher", "lauryn hill", "erykah badu", "brent faiyaz"],
        silver: ["rnb", "r&b", "soul", "neo-soul", "contemporary rnb"]
    },
    "ambient": {
        gold: ["brian eno", "stars of the lid", "aphex twin - selected ambient", "william basinski", "tim hecker"],
        silver: ["ambient", "drone", "meditation", "sleep", "calm", "lofi", "study beats"]
    },
    "indie": {
        gold: ["tame impala", "the strokes", "bon iver", "mac demarco", "phoebe bridgers", "mitski", "boygenius"],
        silver: ["indie", "alternative", "alt-rock", "dream pop", "shoegaze"]
    },
    "classical": {
        gold: ["bach", "beethoven", "mozart", "chopin", "debussy", "stravinsky", "hans zimmer", "john williams"],
        silver: ["classical", "orchestra", "piano", "violin", "symphony", "composition"]
    },
    "latin": {
        gold: ["bad bunny", "j balvin", "karol g", "rosalía", "daddy yankee", "shakira", "selena", "santana"],
        silver: ["latin", "reggaeton", "salsa", "bossa nova", "tango", "bachata"]
    },
    "soul": {
        gold: ["aretha franklin", "marvin gaye", "stevie wonder", "otis redding", "al green", "sam cooke"],
        silver: ["soul", "motown", "classic soul", "stax"]
    },
    "funk": {
        gold: ["james brown", "parliament", "funkadelic", "vulfpeck", "khruangbin", "the meters", "prince"],
        silver: ["funk", "groove", "slap bass"]
    },
    "synthwave": {
        gold: ["kavinsky", "the midnight", "carpenter brut", "gunship", "perturbator"],
        silver: ["synthwave", "retrowave", "80s synth", "outrun"]
    },
    "folk": {
        gold: ["bob dylan", "joni mitchell", "fleet foxes", "the tallest man on earth", "simon & garfunkel"],
        silver: ["folk", "acoustic", "singer-songwriter", "americana"]
    }
};

const SPOTIFY_AXIS_MAP: Record<number, [string, number][]> = {
    0: [["energy", 0.6], ["loudness_norm", 0.4]], 1: [["instrumentalness", 0.5], ["acousticness", 0.5]],
    2: [["danceability", 0.5], ["tempo_norm", 0.5]], 3: [["valence", 0.4], ["acousticness", 0.6]],
    4: [["time_signature_norm", 0.5], ["key_norm", 0.5]], 5: [["liveness", 0.4], ["instrumentalness", 0.6]],
    6: [["tempo_norm", 0.7], ["time_signature_norm", 0.3]], 7: [["valence", 0.5], ["mode_norm", 0.5]],
    8: [["loudness_norm", 0.5], ["energy", 0.5]], 9: [["speechiness", 0.5], ["liveness", 0.5]],
    10: [["instrumentalness", 0.4], ["acousticness", 0.6]], 11: [["valence", 0.4], ["energy", 0.6]],
};

// ── Core Exports ───────────────────────────────────

export function calculateCoherence(vector: number[], confidence: number[] = []): number {
    if (!vector.length) return 0;
    const conf = confidence.length === vector.length ? confidence : Array(vector.length).fill(1.0);
    const totalConf = conf.reduce((a, b) => a + b, 0) + 1e-9;
    const weights = conf.map(c => c / totalConf);
    const mean = weights.reduce((sum, w, i) => sum + w * vector[i], 0);
    const variance = weights.reduce((sum, w, i) => sum + w * Math.pow(vector[i] - mean, 2), 0);
    return round4(Math.max(0, Math.min(1, 1.0 - Math.sqrt(variance) / 0.5)));
}

export function generateInterpretation(vector: number[]) {
    if (!vector.length) return { characteristics: [], genreMatches: [] };
    const characteristics = vector.map((v, i) => ({ label: AXIS_LABELS[i], value: v }))
        .sort((a, b) => b.value - a.value).slice(0, 5)
        .map(axis => AXIS_DESCRIPTIONS[axis.label] || axis.label.replace(/_/g, " "));
    const genreMatches = Object.entries(GENRE_VECTORS)
        .map(([name, genreVec]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), score: euclideanDistance(vector, genreVec) }))
        .sort((a, b) => a.score - b.score).slice(0, 5).map(g => g.name);
    return { characteristics, genreMatches };
}

export function computeGenreVector(selectedGenres: string[]): DNAVector {
    const normalised = selectedGenres.map(g => g.toLowerCase().replace(/[^a-z0-9]/g, ""));
    const vecs = normalised.map(g => GENRE_VECTORS[g]).filter(Boolean) as number[][];
    const vector = vecs.length ? Array(12).fill(0).map((_, i) => vecs.reduce((sum, v) => sum + v[i], 0) / vecs.length) : Array(12).fill(0.5);
    return makeDNA(vector, Array(12).fill(1.0), "genre", { genres: selectedGenres });
}

export function computeSpotifyVector(features: SpotifyAudioFeatures[], artistGenres: string[] = []): DNAVector {
    const hasFeatures = features.length > 0;
    const hasGenres = artistGenres.length > 0;

    if (!hasFeatures && !hasGenres) {
        return makeDNA(Array(12).fill(0.5), Array(12).fill(0.1), "spotify", { track_count: 0 });
    }

    // 1. Audio Feature Vectors
    const featureVecs: number[][] = [];
    if (hasFeatures) {
        features.forEach(f => {
            const norm: Record<string, number> = {
                energy: f.energy ?? 0.5,
                loudness_norm: Math.min(((f.loudness ?? -10) + 60) / 60, 1.0),
                instrumentalness: f.instrumentalness ?? 0.0,
                acousticness: f.acousticness ?? 0.5,
                danceability: f.danceability ?? 0.5,
                tempo_norm: Math.min((f.tempo ?? 120) / 200, 1.0),
                valence: f.valence ?? 0.5,
                time_signature_norm: Math.min((f.time_signature ?? 4) / 7, 1.0),
                key_norm: (f.key ?? 0) / 11,
                liveness: f.liveness ?? 0.1,
                speechiness: f.speechiness ?? 0.05,
                mode_norm: f.mode ?? 1,
            };
            const vec = Array(12).fill(0).map((_, i) =>
                0.3 + Math.pow(SPOTIFY_AXIS_MAP[i].reduce((sum, [k, w]) => sum + (norm[k] ?? 0.5) * w, 0), 0.75) * 0.65
            );
            featureVecs.push(vec);
        });
    }

    // 2. Artist Genre Vectors
    const genreVecs: number[][] = [];
    if (hasGenres) {
        artistGenres.forEach(g => {
            const normalized = g.toLowerCase().replace(/[^a-z0-9]/g, "");
            const vec = GENRE_VECTORS[normalized];
            if (vec) genreVecs.push(vec);
        });
    }

    // 3. Combine with Weights (Audio: 40%, Genres: 60% if both exist)
    const finalVector = Array(12).fill(0.5);

    const avgFeature = featureVecs.length > 0
        ? Array(12).fill(0).map((_, i) => featureVecs.reduce((sum, v) => sum + v[i], 0) / featureVecs.length)
        : null;

    const avgGenre = genreVecs.length > 0
        ? Array(12).fill(0).map((_, i) => genreVecs.reduce((sum, v) => sum + v[i], 0) / genreVecs.length)
        : null;

    if (avgFeature && avgGenre) {
        for (let i = 0; i < 12; i++) finalVector[i] = (avgFeature[i] * 0.4) + (avgGenre[i] * 0.6);
    } else if (avgFeature) {
        for (let i = 0; i < 12; i++) finalVector[i] = avgFeature[i];
    } else if (avgGenre) {
        for (let i = 0; i < 12; i++) finalVector[i] = avgGenre[i];
    }

    return makeDNA(finalVector, Array(12).fill(0.6), "spotify", { track_count: features.length, genre_count: artistGenres.length });
}

export function computeYouTubeVector(videos: any[]): DNAVector {
    if (!videos.length) return makeDNA(Array(12).fill(0.5), Array(12).fill(0.1), "youtube", { track_count: 0 });
    const genreVecs = videos.map(v => {
        const title = (v.title || "").toLowerCase();
        let best = "pop";
        let max = 0;
        Object.entries(YT_TIERS).forEach(([genre, tiers]) => {
            let score = tiers.gold.some(k => title.includes(k)) ? TIER_WEIGHTS.GOLD : (tiers.silver.some(k => title.includes(k)) ? TIER_WEIGHTS.SILVER : 0);
            if (score > max) { max = score; best = genre; }
        });
        return GENRE_VECTORS[best] || GENRE_VECTORS.pop;
    }) as number[][];
    return makeDNA(Array(12).fill(0).map((_, i) => genreVecs.reduce((sum, v) => sum + v[i], 0) / genreVecs.length), Array(12).fill(0.4), "youtube", { track_count: videos.length });
}

/**
 * NEW: Compute DNA from Last.fm tags.
 * Maps human-curated tags to the 12D vector space.
 */
export function computeLastFMVector(tags: { name: string; count: number }[]): DNAVector {
    if (tags.length === 0) {
        return makeDNA(Array(12).fill(0.5), Array(12).fill(0.1), "lastfm", { tag_count: 0 });
    }

    const genreVecs: number[][] = [];

    // Normalize and match top 10 tags against GENRE_VECTORS
    tags.slice(0, 10).forEach(tag => {
        const normalized = tag.name.toLowerCase().replace(/[^a-z0-9]/g, "");
        const vector = GENRE_VECTORS[normalized];
        if (vector) {
            // Push matches into the calculation pool
            genreVecs.push(vector);
        }
    });

    const vector = genreVecs.length > 0
        ? Array(12).fill(0).map((_, i) => genreVecs.reduce((sum, v) => sum + v[i], 0) / genreVecs.length)
        : Array(12).fill(0.5);

    // Last.fm tags represent high human confidence
    return makeDNA(vector, Array(12).fill(0.8), "lastfm", { tag_count: tags.length });
}

/**
 * REBALANCED: Combine Genre (40%) + Spotify (20%) + YouTube (20%) + Last.fm (20%)
 */
export function combineDNA(
    genreDNA: DNAVector,
    spotifyDNA: DNAVector | null,
    youtubeDNA: DNAVector | null,
    lastfmDNA?: DNAVector | null
): DNAVector {
    const gCount = (genreDNA.metadata.genres || []).length;
    const sCount = spotifyDNA?.metadata.track_count || 0;
    const yCount = youtubeDNA?.metadata.track_count || 0;
    const lCount = lastfmDNA?.metadata.tag_count || 0;

    // Weight Logic: Genre (Intent) remains strongest, others balance by volume
    let wg = 0.4, ws = 0.2, wy = 0.2, wl = 0.2;

    // Dynamic adjustment if a source is missing
    if (!lastfmDNA || lCount === 0) {
        wl = 0;
        wg = 0.5; ws = 0.25; wy = 0.25; // Revert to v2.1 weights
    }

    const vector = Array(12).fill(0).map((_, i) =>
        (wg * genreDNA.vector[i]) +
        (ws * (spotifyDNA?.vector[i] ?? genreDNA.vector[i])) +
        (wy * (youtubeDNA?.vector[i] ?? genreDNA.vector[i])) +
        (wl * (lastfmDNA?.vector[i] ?? genreDNA.vector[i]))
    );

    return makeDNA(vector, Array(12).fill(1.0), "combined-plus", {
        spotify_tracks: sCount,
        youtube_tracks: yCount,
        lastfm_tags: lCount,
        genres: genreDNA.metadata.genres,
    });
}

export function matchScore(a: DNAVector, b: DNAVector) {
    if (!a?.vector || !b?.vector) return { cosine_similarity: 0, divergence_score: 1.0, match_mode: "unknown", axis_diff: Array(12).fill(1.0), axis_labels: [...AXIS_LABELS] };
    const cosine = cosineSimilarity(a.vector, b.vector);
    return { cosine_similarity: round4(cosine), divergence_score: round4(1.0 - cosine), match_mode: cosine >= 0.85 ? "convergent" : (cosine >= 0.7 ? "resonant" : "divergent"), axis_diff: a.vector.map((v, i) => round4(Math.abs(v - b.vector[i]))), axis_labels: [...AXIS_LABELS] };
}