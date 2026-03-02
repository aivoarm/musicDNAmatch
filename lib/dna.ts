export interface TrackData {
    popularity: number;     // 0-100
    duration_ms: number;
    release_year: number;
    genres: string[];       // from artist
}

export interface MusicalDNA {
    version: string;
    vector: number[]; // 12 dimensions
    markers: {
        tension: number;
        stability: number;
        warmth: number;
    };
}

// Genre keyword maps to psychoacoustic traits
const GENRE_TRAITS: Record<string, Partial<Record<string, number>>> = {
    "electronic": { energy: 0.85, brightness: 0.9, warmth: 0.2 },
    "ambient": { energy: 0.2, brightness: 0.3, warmth: 0.8 },
    "jazz": { complexity: 0.85, warmth: 0.9, tension: 0.4 },
    "classical": { complexity: 0.9, warmth: 0.8, tension: 0.3 },
    "hip hop": { percussiveness: 0.8, energy: 0.75, brightness: 0.6 },
    "rock": { energy: 0.9, percussiveness: 0.85, tension: 0.7 },
    "pop": { brightness: 0.8, energy: 0.7, warmth: 0.5 },
    "metal": { energy: 1.0, percussiveness: 0.95, tension: 0.9 },
    "folk": { warmth: 0.9, energy: 0.3, complexity: 0.4 },
    "r&b": { warmth: 0.85, energy: 0.6, brightness: 0.7 },
    "soul": { warmth: 0.9, energy: 0.55, tension: 0.3 },
    "techno": { energy: 0.9, percussiveness: 0.9, brightness: 0.7 },
    "indie": { brightness: 0.6, warmth: 0.6, complexity: 0.6 },
    "country": { warmth: 0.8, energy: 0.45, brightness: 0.6 },
};

function getGenreTraits(genres: string[]) {
    const traits: Record<string, number[]> = {
        energy: [], brightness: [], warmth: [], complexity: [], percussiveness: [], tension: []
    };

    for (const genre of genres) {
        const lowerGenre = genre.toLowerCase();
        for (const [key, genreMap] of Object.entries(GENRE_TRAITS)) {
            if (lowerGenre.includes(key)) {
                for (const [trait, val] of Object.entries(genreMap)) {
                    if (!traits[trait]) traits[trait] = [];
                    traits[trait].push(val);
                }
            }
        }
    }

    const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0.5;
    return {
        energy: avg(traits.energy),
        brightness: avg(traits.brightness),
        warmth: avg(traits.warmth),
        complexity: avg(traits.complexity),
        percussiveness: avg(traits.percussiveness),
        tension: avg(traits.tension),
    };
}

/**
 * Computes a 12D Musical DNA vector from track metadata and artist genres.
 * Does NOT require the deprecated /audio-features endpoint.
 */
export function computeDNA(tracks: TrackData[]): MusicalDNA {
    if (tracks.length === 0) {
        return { version: "2.1", vector: new Array(12).fill(0.5), markers: { tension: 0.5, stability: 0.5, warmth: 0.5 } };
    }

    // Aggregate genre traits across all tracks
    const allGenres = tracks.flatMap(t => t.genres);
    const genreTraits = getGenreTraits(allGenres);

    // Normalize track-level metrics
    const avgPopularity = tracks.reduce((a, t) => a + t.popularity, 0) / tracks.length / 100;
    const avgDuration = tracks.reduce((a, t) => a + t.duration_ms, 0) / tracks.length;
    const normDuration = Math.min(avgDuration / 600000, 1); // 10 min max
    const avgYear = tracks.reduce((a, t) => a + t.release_year, 0) / tracks.length;
    const normEra = Math.min(Math.max((avgYear - 1960) / 65, 0), 1); // Newer = higher

    // 12D Vector
    const vector = [
        genreTraits.brightness,                         // 0: Spectral Centroid
        genreTraits.percussiveness,                      // 1: Transient Density
        1 - genreTraits.energy,                          // 2: Harmonicity (inverse energy)
        normDuration,                                    // 3: Dynamic Range (longer = more expressive)
        genreTraits.complexity,                          // 4: Polyrhythmic Complexity
        genreTraits.tension,                             // 5: Intervalic Tension
        genreTraits.percussiveness * 0.7 + genreTraits.energy * 0.3, // 6: Pulse Saliency
        genreTraits.warmth,                              // 7: Timbral Warmth
        1 - avgPopularity,                              // 8: Abstraction (inverse popularity)
        genreTraits.complexity * 0.5 + normDuration * 0.5, // 9: Spatial Density
        genreTraits.energy,                              // 10: Energy
        normEra,                                         // 11: Era Centroid
    ].map(v => Math.max(0, Math.min(1, v)));

    return {
        version: "2.1",
        vector,
        markers: {
            tension: vector[5],
            stability: vector[6],
            warmth: vector[7],
        },
    };
}
