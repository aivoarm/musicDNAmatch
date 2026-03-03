import numpy as np
from dataclasses import dataclass, field
from typing import Optional
import warnings

DNA_SCHEMA_VERSION = 2

AXIS_LABELS = [
    "spectral_energy", "harmonic_depth", "rhythmic_drive",
    "melodic_warmth", "structural_complexity", "sonic_texture",
    "tempo_variance", "tonal_brightness", "dynamic_range",
    "genre_fusion", "experimental_index", "emotional_density",
]

# Genre bias vectors — each genre maps to a 12-dim axis preset
GENRE_VECTORS = {
    "electronic": [0.9,0.5,0.8,0.3,0.7,0.9,0.6,0.8,0.7,0.7,0.8,0.5],
    "hiphop":     [0.7,0.4,0.9,0.6,0.5,0.7,0.5,0.6,0.8,0.8,0.5,0.8],
    "indie":      [0.5,0.6,0.5,0.8,0.7,0.6,0.7,0.5,0.7,0.6,0.6,0.7],
    "classical":  [0.4,0.9,0.3,0.9,0.9,0.5,0.8,0.6,0.9,0.3,0.4,0.8],
    "jazz":       [0.5,0.9,0.6,0.7,0.8,0.6,0.8,0.5,0.7,0.7,0.7,0.7],
    "rnb":        [0.6,0.7,0.7,0.9,0.5,0.7,0.4,0.6,0.6,0.6,0.4,0.9],
    "metal":      [0.9,0.6,0.9,0.3,0.7,0.8,0.5,0.4,0.8,0.5,0.7,0.7],
    "pop":        [0.6,0.5,0.7,0.7,0.4,0.6,0.4,0.8,0.5,0.5,0.3,0.7],
    "folk":       [0.3,0.7,0.4,0.9,0.6,0.4,0.6,0.6,0.8,0.4,0.5,0.8],
    "latin":      [0.6,0.6,0.9,0.7,0.5,0.6,0.5,0.7,0.6,0.7,0.4,0.8],
    "world":      [0.5,0.7,0.7,0.7,0.7,0.7,0.7,0.6,0.6,0.9,0.7,0.7],
    "ambient":    [0.4,0.6,0.2,0.6,0.6,0.9,0.8,0.5,0.9,0.5,0.8,0.6],
}

# Spotify audio feature → DNA axis mapping weights
# Keys match Spotify's /audio-features response fields
SPOTIFY_AXIS_MAP = {
    # axis_index: [(feature_key, weight), ...]
    0: [("energy", 0.6), ("loudness_norm", 0.4)],          # spectral_energy
    1: [("instrumentalness", 0.5), ("acousticness", 0.5)], # harmonic_depth
    2: [("danceability", 0.5), ("tempo_norm", 0.5)],       # rhythmic_drive
    3: [("valence", 0.4), ("acousticness", 0.6)],          # melodic_warmth
    4: [("time_signature_norm", 0.5), ("key_norm", 0.5)],  # structural_complexity
    5: [("liveness", 0.4), ("instrumentalness", 0.6)],     # sonic_texture
    6: [("tempo_norm", 0.7), ("time_signature_norm", 0.3)],# tempo_variance
    7: [("valence", 0.5), ("mode_norm", 0.5)],             # tonal_brightness
    8: [("loudness_norm", 0.5), ("energy", 0.5)],          # dynamic_range
    9: [("speechiness", 0.5), ("liveness", 0.5)],          # genre_fusion
    10:[("instrumentalness", 0.4), ("acousticness", 0.6)], # experimental_index
    11:[("valence", 0.4), ("energy", 0.6)],                # emotional_density
}

@dataclass
class DNAVector:
    vector: list
    confidence: list
    coherence_index: float
    schema_version: int = DNA_SCHEMA_VERSION
    source: str = "unknown"
    metadata: dict = field(default_factory=dict)

    def to_dict(self):
        return {
            "vector": self.vector,
            "confidence": self.confidence,
            "coherence_index": self.coherence_index,
            "schema_version": self.schema_version,
            "source": self.source,
            "metadata": self.metadata,
        }


def spotify_features_to_vector(features_list: list[dict]) -> DNAVector:
    """
    Convert a list of Spotify audio-feature objects into a DNA vector.
    Each features dict should contain the raw Spotify /audio-features response.
    """
    if not features_list:
        raise ValueError("features_list must be non-empty")

    axis_values = [[] for _ in range(12)]

    for f in features_list:
        # Normalise Spotify features to [0,1]
        norm = {
            "energy":             float(f.get("energy", 0.5)),
            "valence":            float(f.get("valence", 0.5)),
            "danceability":       float(f.get("danceability", 0.5)),
            "acousticness":       float(f.get("acousticness", 0.5)),
            "instrumentalness":   float(f.get("instrumentalness", 0.0)),
            "liveness":           float(f.get("liveness", 0.1)),
            "speechiness":        float(f.get("speechiness", 0.05)),
            "loudness_norm":      (float(f.get("loudness", -10)) + 60) / 60,
            "tempo_norm":         min(float(f.get("tempo", 120)) / 200, 1.0),
            "key_norm":           float(f.get("key", 0)) / 11,
            "mode_norm":          float(f.get("mode", 1)),
            "time_signature_norm":min(float(f.get("time_signature", 4)) / 7, 1.0),
        }
        for axis_idx, mappings in SPOTIFY_AXIS_MAP.items():
            val = sum(norm.get(k, 0.5) * w for k, w in mappings)
            axis_values[axis_idx].append(val)

    vector = [float(np.mean(v)) if v else 0.5 for v in axis_values]
    confidence = [min(1.0, len(v) / 10) for v in axis_values]
    coherence = _compute_coherence(np.array(vector), np.array(confidence))

    return DNAVector(
        vector=vector,
        confidence=confidence,
        coherence_index=coherence,
        source="spotify",
        metadata={"track_count": len(features_list)},
    )


def youtube_metadata_to_vector(videos: list[dict]) -> DNAVector:
    """
    Convert YouTube video metadata dicts to a partial DNA vector.
    Each dict should contain: category_id, duration_seconds, tags (list), title.
    """
    # YouTube category → rough genre mapping
    YT_CATEGORY_GENRE = {
        "10": "pop", "24": "electronic", "17": "rnb",
    }
    genre_hits = []
    for v in videos:
        cat = str(v.get("category_id", "10"))
        genre = YT_CATEGORY_GENRE.get(cat, "pop")
        genre_hits.append(genre)

    genre_vecs = [GENRE_VECTORS.get(g, GENRE_VECTORS["pop"]) for g in genre_hits]
    vector = list(np.mean(genre_vecs, axis=0)) if genre_vecs else [0.5]*12
    confidence = [0.4] * 12  # YouTube metadata → lower confidence
    coherence = _compute_coherence(np.array(vector), np.array(confidence))

    return DNAVector(
        vector=vector,
        confidence=confidence,
        coherence_index=coherence,
        source="youtube",
        metadata={"track_count": len(videos)},
    )


def compute_genre_vector(selected_genres: list[str]) -> DNAVector:
    """Build a DNA vector from the user's genre selections."""
    vecs = [GENRE_VECTORS[g] for g in selected_genres if g in GENRE_VECTORS]
    if not vecs:
        vecs = [GENRE_VECTORS["pop"]]
    vector = list(np.mean(vecs, axis=0))
    confidence = [1.0] * 12
    coherence = _compute_coherence(np.array(vector), np.array(confidence))
    return DNAVector(vector=vector, confidence=confidence,
                     coherence_index=coherence, source="genre")


def combine_vectors(
    genre_dna: DNAVector,
    spotify_dna: Optional[DNAVector] = None,
    youtube_dna: Optional[DNAVector] = None,
) -> DNAVector:
    """
    Final combination:  V = 0.50 × genre  +  0.25 × spotify  +  0.25 × youtube
    Missing sources are filled with the genre vector at reduced confidence.
    """
    vg = np.array(genre_dna.vector)
    cg = np.array(genre_dna.confidence)

    vs = np.array(spotify_dna.vector if spotify_dna else genre_dna.vector)
    cs = np.array(spotify_dna.confidence if spotify_dna else [0.3]*12)

    vy = np.array(youtube_dna.vector if youtube_dna else genre_dna.vector)
    cy = np.array(youtube_dna.confidence if youtube_dna else [0.2]*12)

    vector = 0.50 * vg + 0.25 * vs + 0.25 * vy
    confidence = np.clip(0.50 * cg + 0.25 * cs + 0.25 * cy, 0, 1)
    coherence = _compute_coherence(vector, confidence)

    return DNAVector(
        vector=vector.tolist(),
        confidence=confidence.tolist(),
        coherence_index=round(coherence, 4),
        source="combined",
        metadata={
            "genre_tracks": len(genre_dna.metadata.get("genres", [])),
            "spotify_tracks": spotify_dna.metadata.get("track_count", 0) if spotify_dna else 0,
            "youtube_tracks": youtube_dna.metadata.get("track_count", 0) if youtube_dna else 0,
        }
    )


def match_score(dna_a: DNAVector, dna_b: DNAVector) -> dict:
    """Cosine similarity match between two DNA profiles."""
    va = np.array(dna_a.vector)
    vb = np.array(dna_b.vector)
    ca = np.array(dna_a.confidence)
    cb = np.array(dna_b.confidence)

    cosine = _cosine_similarity(va, vb)
    combined_conf = ca * cb
    weighted_cosine = _cosine_similarity(va * combined_conf, vb * combined_conf)

    if cosine >= 0.85:
        mode = "convergent"
    elif cosine >= 0.70:
        mode = "resonant"
    else:
        mode = "divergent"

    return {
        "cosine_similarity": round(float(cosine), 4),
        "weighted_cosine":   round(float(weighted_cosine), 4),
        "divergence_score":  round(1.0 - float(cosine), 4),
        "match_mode":        mode,
        "axis_diff":         [round(float(abs(a-b)), 4) for a,b in zip(va, vb)],
        "axis_labels":       AXIS_LABELS,
    }


def _cosine_similarity(a, b):
    denom = (np.linalg.norm(a) * np.linalg.norm(b)) + 1e-9
    return float(np.clip(np.dot(a, b) / denom, 0.0, 1.0))


def _compute_coherence(vector, confidence):
    weights = confidence / (confidence.sum() + 1e-9)
    mean = float(np.dot(weights, vector))
    var  = float(np.dot(weights, (vector - mean) ** 2))
    return float(np.clip(1.0 - (np.sqrt(var) / 0.5), 0.0, 1.0))