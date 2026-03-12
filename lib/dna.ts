/**
 * musicDNAmatch — TypeScript DNA Engine (v2.4)
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
// ── DNA Configuration ──────────────────────────────
import GENRE_DATA_RAW from "./genre-vectors.json";
import YT_TIERS_RAW from "./yt-tiers.json";

export const GENRE_VECTORS: Record<string, number[]> = {};
export const GENRE_NARRATIVES: Record<string, string> = {};

Object.entries(GENRE_DATA_RAW).forEach(([k, v]: [string, any]) => {
    if (v.vector) {
        GENRE_VECTORS[k] = v.vector;
        GENRE_NARRATIVES[k] = v.narrative;
    } else {
        GENRE_VECTORS[k] = v; // Fallback
    }
});

const YT_TIERS = (YT_TIERS_RAW as any).yt_tiers as Record<string, { gold: string[], silver: string[], bronze?: string[] }>;

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

const TIER_WEIGHTS = { GOLD: 1.0, SILVER: 0.6, BRONZE: 0.3 };


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

/**
 * Enhanced: Generate profile interpretation and suggested genres.
 * Now weights direct tag matches from metadata.
 */
export function generateInterpretation(vector: number[], metaTags: string[] = []) {
    if (!vector.length) return { characteristics: [], genreMatches: [], narrative: "" };

    // 1. Identify primary characteristics from vector axes
    const characteristics = vector.map((v, i) => ({ label: AXIS_LABELS[i], value: v }))
        .sort((a, b) => b.value - a.value).slice(0, 5)
        .map(axis => AXIS_DESCRIPTIONS[axis.label] || axis.label.replace(/_/g, " "));

    // 2. Compute genre matches from vector proximity
    const vectorMatches = Object.entries(GENRE_VECTORS)
        .map(([name, genreVec]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            key: name,
            score: euclideanSimilarityScore(vector, genreVec) // 0 to 1 scale
        }));

    // 3. Compute direct tag matches
    const tagMatches: Record<string, number> = {};
    const normalizedMetaTags = metaTags.map(t => t.toLowerCase().replace(/[^a-z0-9]/g, ""));

    Object.keys(GENRE_VECTORS).forEach(genre => {
        const gn = genre.toLowerCase().replace(/[^a-z0-9]/g, "");
        
        // Smarter Matching:
        // 1. Exact match (pop === pop)
        // 2. Direct inclusion ONLY if the tag is specific (long enough) 
        // 3. Or if the shorter word is exactly 'pop', it must be a precise match
        const isMatch = normalizedMetaTags.some(t => {
            if (t === gn) return true;
            if (t.length > 4 && (t.includes(gn) || gn.includes(t))) return true;
            return false;
        });

        if (isMatch) {
            tagMatches[genre] = 1.0; 
        }
    });

    // 4. Combine: (Vector Weight: 0.5, Tag Weight: 0.5)
    const sortedMatches = vectorMatches.map(m => {
        const genreKey = m.key;
        const tagScore = tagMatches[genreKey] || 0;
        return {
            name: m.name,
            key: m.key,
            score: (m.score * 0.5) + (tagScore * 0.5)
        };
    }).sort((a, b) => b.score - a.score);

    const finalMatches = sortedMatches.slice(0, 8); // Return top 8

    // 5. Generate Personalized Narrative (Diverse & Deduplicated)
    const distinctTop = [];
    if (sortedMatches.length > 0) {
        const first = sortedMatches[0];
        distinctTop.push(first);

        // Find a second one that is high scoring but sonically different
        const firstVec = GENRE_VECTORS[first.key];
        let bestDiverse = null;
        let maxDiversityScore = -1;

        for (let i = 1; i < Math.min(sortedMatches.length, 10); i++) {
            const current = sortedMatches[i];
            const currentVec = GENRE_VECTORS[current.key];
            if (!currentVec || !firstVec) continue;
            
            const similarity = euclideanSimilarityScore(firstVec, currentVec);
            // Diversity Score = Weight(Match Score) * Weight(Difference)
            const diversityScore = current.score * (1.1 - similarity); 

            if (diversityScore > maxDiversityScore) {
                maxDiversityScore = diversityScore;
                bestDiverse = current;
            }
        }
        if (bestDiverse) distinctTop.push(bestDiverse);
    }

    let narrative = "";
    if (distinctTop.length >= 2) {
        const n1 = GENRE_NARRATIVES[distinctTop[0].key] || "";
        const n2 = GENRE_NARRATIVES[distinctTop[1].key] || "";
        narrative = `${n1} This is fused with elements of ${distinctTop[1].name}, where ${n2.charAt(0).toLowerCase()}${n2.slice(1)}`;
    } else if (distinctTop.length === 1) {
        narrative = GENRE_NARRATIVES[distinctTop[0].key] || "Your signal is a unique sonic fingerprint.";
    }

    return {
        characteristics,
        genreMatches: finalMatches.map(g => g.name),
        narrative
    };
}

/**
 * Helper: Normalized similarity score (1.0 = identical, 0.0 = opposite)
 */
function euclideanSimilarityScore(a: number[], b: number[]): number {
    const dist = euclideanDistance(a, b);
    return Math.max(0, 1 - (dist / 2.0)); // Adjusted for our 12D space range
}

export function computeGenreVector(selectedGenres: string[]): DNAVector {
    const normalised = selectedGenres.map(g => g.toLowerCase().replace(/&/g, "n").replace(/[^a-z0-9]/g, ""));
    const vecs = normalised.map(g => GENRE_VECTORS[g]).filter(Boolean) as number[][];
    const vector = vecs.length ? Array(12).fill(0).map((_, i) => vecs.reduce((sum, v) => sum + v[i], 0) / vecs.length) : Array(12).fill(0.5);
    return makeDNA(vector, Array(12).fill(1.0), "genre", { genres: selectedGenres });
}

export function computeSpotifyVector(features: SpotifyAudioFeatures[], artistGenres: string[] = [], tracks: any[] = []): DNAVector {
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
            const normalized = g.toLowerCase().replace(/&/g, "n").replace(/[^a-z0-9]/g, "");
            const vec = GENRE_VECTORS[normalized];
            if (vec) genreVecs.push(vec);
        });
    }

    // 2.5. Artist Name matching via YT_TIERS (Tier matching for Spotify)
    if (tracks.length > 0) {
        tracks.forEach(t => {
            const artistName = (t.artist || "").toLowerCase();
            Object.entries(YT_TIERS).forEach(([genre, tiers]) => {
                if (tiers.gold.some(a => a.toLowerCase() === artistName)) {
                    const normalizedKey = genre.toLowerCase().replace(/&/g, "n").replace(/[^a-z0-9]/g, "");
                    const vec = GENRE_VECTORS[normalizedKey];
                    if (vec) genreVecs.push(vec);
                }
            });
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
        let bestGenres: string[] = ["pop"];
        let max = 0;
        Object.entries(YT_TIERS).forEach(([genre, tiers]) => {
            let score = 0;
            if (tiers.gold.some(k => title.includes(k))) score = TIER_WEIGHTS.GOLD;
            else if (tiers.silver.some(k => title.includes(k))) score = TIER_WEIGHTS.SILVER;
            else if (tiers.bronze?.some(k => title.includes(k))) score = TIER_WEIGHTS.BRONZE;

            if (score > max) {
                max = score;
                bestGenres = [genre];
            } else if (score === max && score > 0) {
                bestGenres.push(genre);
            }
        });

        // Average vectors for all tied best genres (e.g. Hip-Hop AND Rap)
        const pooled = Array(12).fill(0);
        bestGenres.forEach(g => {
            const normalizedKey = g.toLowerCase().replace(/&/g, "n").replace(/[^a-z0-9]/g, "");
            const vec = GENRE_VECTORS[normalizedKey] || GENRE_VECTORS["pop"];
            vec.forEach((v, i) => pooled[i] += v);
        });
        return pooled.map(v => v / bestGenres.length);
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
 * NEW: Compute DNA from MusicBrainz metadata.
 * Processes editor-vetted tags and artist types.
 */
export function computeMusicBrainzVector(tags: { name: string; count: number }[], artistType?: string): DNAVector {
    if (tags.length === 0) {
        return makeDNA(Array(12).fill(0.5), Array(12).fill(0.1), "musicbrainz", { tag_count: 0 });
    }

    const genreVecs: number[][] = [];
    tags.forEach(tag => {
        const normalized = tag.name.toLowerCase().replace(/[^a-z0-9]/g, "");
        const vector = GENRE_VECTORS[normalized];
        if (vector) genreVecs.push(vector);
    });

    const baseVector = genreVecs.length > 0
        ? Array(12).fill(0).map((_, i) => genreVecs.reduce((sum, v) => sum + v[i], 0) / genreVecs.length)
        : Array(12).fill(0.5);

    // Adjust for artist type (e.g., Groups often show higher Rhythmic Drive/Spectral Energy)
    if (artistType === "Group") {
        baseVector[0] = Math.min(baseVector[0] + 0.05, 1.0); // Spectral Energy boost
        baseVector[1] = Math.min(baseVector[1] + 0.05, 1.0); // Rhythmic Drive boost
    }

    // MusicBrainz represents the highest editorial confidence
    return makeDNA(baseVector, Array(12).fill(0.9), "musicbrainz", { tag_count: tags.length, type: artistType });
}

/**
 * REBALANCED v2.4: Blend Genre (30%) + Spotify (15%) + YouTube (15%) + Last.fm (20%) + MusicBrainz (20%)
 */
export function combineDNA(
    genreDNA: DNAVector,
    spotifyDNA: DNAVector | null,
    youtubeDNA: DNAVector | null,
    lastfmDNA?: DNAVector | null,
    musicbrainzDNA?: DNAVector | null
): DNAVector {
    const sCount = spotifyDNA?.metadata.track_count || 0;
    const yCount = youtubeDNA?.metadata.track_count || 0;
    const lCount = lastfmDNA?.metadata.tag_count || 0;
    const mCount = musicbrainzDNA?.metadata.tag_count || 0;

    // Weight Logic: MusicBrainz and Last.fm (Human Curation) are weighted slightly higher than raw source logs
    let wg = 0.3, ws = 0.15, wy = 0.15, wl = 0.2, wm = 0.2;

    const gCount = genreDNA.metadata.genres?.length || 0;

    // Dynamic adjustment if sources are missing
    if (gCount === 0) { wg = 0; }
    if (!lastfmDNA || lCount === 0) { wl = 0; }
    if (!musicbrainzDNA || mCount === 0) { wm = 0; }
    if (!spotifyDNA || sCount === 0) { ws = 0; }
    if (!youtubeDNA || yCount === 0) { wy = 0; }

    const activeWeightTotal = wg + ws + wy + wl + wm;
    // Normalize weights to 1.0
    const nwg = wg / activeWeightTotal;
    const nws = ws / activeWeightTotal;
    const nwy = wy / activeWeightTotal;
    const nwl = wl / activeWeightTotal;
    const nwm = wm / activeWeightTotal;

    const vector = Array(12).fill(0).map((_, i) =>
        (nwg * genreDNA.vector[i]) +
        (nws * (spotifyDNA?.vector[i] ?? genreDNA.vector[i])) +
        (nwy * (youtubeDNA?.vector[i] ?? genreDNA.vector[i])) +
        (nwl * (lastfmDNA?.vector[i] ?? genreDNA.vector[i])) +
        (nwm * (musicbrainzDNA?.vector[i] ?? genreDNA.vector[i]))
    );

    return makeDNA(vector, Array(12).fill(1.0), "combined-plus-mb", {
        spotify_tracks: sCount,
        youtube_tracks: yCount,
        lastfm_tags: lCount,
        musicbrainz_tags: mCount,
        genres: genreDNA.metadata.genres,
    });
}

export function matchScore(a: DNAVector, b: DNAVector) {
    if (!a?.vector || !b?.vector) return { cosine_similarity: 0, divergence_score: 1.0, match_mode: "unknown", axis_diff: Array(12).fill(1.0), axis_labels: [...AXIS_LABELS] };
    const cosine = cosineSimilarity(a.vector, b.vector);
    return { cosine_similarity: round4(cosine), divergence_score: round4(1.0 - cosine), match_mode: cosine >= 0.85 ? "convergent" : (cosine >= 0.7 ? "resonant" : "divergent"), axis_diff: a.vector.map((v, i) => round4(Math.abs(v - b.vector[i]))), axis_labels: [...AXIS_LABELS] };
}