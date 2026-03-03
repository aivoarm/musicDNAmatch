"""
musicDNAmatch — Improved DNA Engine
====================================
Improvements over original:
  1.  Full 12-dim vector — no more placeholder 0.5 values
  2.  Per-axis z-score normalization (population stats)
  3.  Cosine similarity replacing Euclidean distance
  4.  Recency decay weighting for multi-track aggregation
  5.  Confidence-weighted axes
  6.  DNA schema versioning
  7.  Coherence Index with a defined, interpretable formula
  8.  Graceful fallbacks (no silent crashes)
"""

import librosa
import numpy as np
from dataclasses import dataclass, field
from typing import Optional
import warnings

# ─────────────────────────────────────────────
# DNA Version — bump this when algorithm changes
# ─────────────────────────────────────────────
DNA_SCHEMA_VERSION = 2

# ─────────────────────────────────────────────
# Population stats for z-score normalization
# (Replace with real DB-computed values at scale)
# Axes: centroid, bandwidth, rolloff,
#       tempo, pulse, beat_stability,
#       harmonicity, flatness, rms,
#       mfcc_d0, mfcc_d1, mfcc_d2
# ─────────────────────────────────────────────
AXIS_MEANS = np.array([
    2500.0, 1500.0, 4000.0,   # Spectral
    120.0,  0.5,    0.7,       # Rhythmic
    0.5,    0.01,   0.05,      # Psychoacoustic
    0.0,    0.0,    0.0,       # Structural (MFCC deltas — centred by nature)
], dtype=float)

AXIS_STDS = np.array([
    1200.0, 700.0,  2000.0,   # Spectral
    40.0,   0.25,   0.2,      # Rhythmic
    0.3,    0.008,  0.03,     # Psychoacoustic
    5.0,    3.0,    3.0,      # Structural
], dtype=float)

# Axis labels (for readability / debugging)
AXIS_LABELS = [
    "spectral_centroid", "spectral_bandwidth", "spectral_rolloff",
    "tempo",             "pulse_saliency",     "beat_stability",
    "harmonicity",       "spectral_flatness",  "rms_energy",
    "mfcc_delta_0",      "mfcc_delta_1",       "mfcc_delta_2",
]


# ─────────────────────────────────────────────
# Data structures
# ─────────────────────────────────────────────

@dataclass
class DNAVector:
    """
    A versioned, confidence-annotated 12-dimensional sonic fingerprint.
    """
    vector: list[float]                          # 12 normalized values
    confidence: list[float]                      # per-axis confidence [0–1]
    coherence_index: float                       # 0–1, internal consistency
    schema_version: int = DNA_SCHEMA_VERSION
    source: str = "unknown"                      # "spotify" | "youtube" | "file"
    metadata: dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        return {
            "vector": self.vector,
            "confidence": self.confidence,
            "coherence_index": self.coherence_index,
            "schema_version": self.schema_version,
            "source": self.source,
            "metadata": self.metadata,
        }


# ─────────────────────────────────────────────
# Core extraction
# ─────────────────────────────────────────────

def extract_dna_vector(
    audio_path: str,
    source: str = "file",
    metadata: Optional[dict] = None,
) -> DNAVector:
    """
    Extracts a fully-computed 12-dimensional DNA vector from an audio file.

    Dimensions:
      0–2  : Spectral  (Centroid, Bandwidth, Rolloff)
      3–5  : Rhythmic  (Tempo, Pulse Saliency, Beat Stability)
      6–8  : Psychoacoustic (Harmonicity via HNNT, Flatness, RMS)
      9–11 : Structural (MFCC mean deltas for coefficients 0, 1, 2)
    """
    try:
        y, sr = librosa.load(audio_path, sr=None, mono=True)
    except Exception as e:
        raise ValueError(f"Could not load audio file '{audio_path}': {e}")

    confidence = np.ones(12, dtype=float)  # start fully confident

    # ── 1. Spectral ──────────────────────────────────────────────────────────
    spec_centroid = float(np.mean(librosa.feature.spectral_centroid(y=y, sr=sr)))
    spec_bw       = float(np.mean(librosa.feature.spectral_bandwidth(y=y, sr=sr)))
    spec_rolloff  = float(np.mean(librosa.feature.spectral_rolloff(y=y, sr=sr)))

    # ── 2. Rhythmic ───────────────────────────────────────────────────────────
    tempo_arr, beats = librosa.beat.beat_track(y=y, sr=sr)
    tempo = float(np.squeeze(tempo_arr))

    # Pulse Saliency via PLP (Predominant Local Pulse)
    try:
        plp = librosa.beat.plp(y=y, sr=sr)
        pulse_saliency = float(np.mean(plp))
    except Exception:
        pulse_saliency = 0.5
        confidence[4] = 0.3   # lower confidence — fallback used

    # Beat Stability: std of inter-beat intervals (lower std = more stable)
    if len(beats) > 2:
        ibi         = np.diff(librosa.frames_to_time(beats, sr=sr))
        beat_cv     = float(np.std(ibi) / (np.mean(ibi) + 1e-6))   # coeff of variation
        beat_stability = float(np.clip(1.0 - beat_cv, 0.0, 1.0))   # invert: 1 = stable
    else:
        beat_stability = 0.5
        confidence[5] = 0.2   # very few beats detected

    # ── 3. Psychoacoustic ────────────────────────────────────────────────────
    # Harmonicity via Harmonic-to-Noise Ratio proxy
    try:
        y_harmonic, _ = librosa.effects.hpss(y)
        harmonicity   = float(
            np.mean(np.abs(y_harmonic)) / (np.mean(np.abs(y)) + 1e-6)
        )
        harmonicity   = float(np.clip(harmonicity, 0.0, 1.0))
    except Exception:
        harmonicity   = 0.5
        confidence[6] = 0.3

    flatness = float(np.mean(librosa.feature.spectral_flatness(y=y)))
    rms      = float(np.mean(librosa.feature.rms(y=y)))

    # ── 4. Structural — MFCC mean deltas ─────────────────────────────────────
    mfcc        = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    mfcc_delta  = librosa.feature.delta(mfcc)
    mfcc_d0     = float(np.mean(mfcc_delta[0]))
    mfcc_d1     = float(np.mean(mfcc_delta[1]))
    mfcc_d2     = float(np.mean(mfcc_delta[2]))

    # ── Assemble raw vector ───────────────────────────────────────────────────
    raw = np.array([
        spec_centroid, spec_bw, spec_rolloff,
        tempo, pulse_saliency, beat_stability,
        harmonicity, flatness, rms,
        mfcc_d0, mfcc_d1, mfcc_d2,
    ], dtype=float)

    # ── Normalize via z-score then sigmoid-squash to (~0, 1) ─────────────────
    normalized = _normalize(raw)

    # ── Coherence Index ───────────────────────────────────────────────────────
    coherence = _compute_coherence(normalized, confidence)

    return DNAVector(
        vector=normalized.tolist(),
        confidence=confidence.tolist(),
        coherence_index=coherence,
        source=source,
        metadata=metadata or {},
    )


# ─────────────────────────────────────────────
# Multi-track aggregation with recency decay
# ─────────────────────────────────────────────

def aggregate_tracks(
    track_vectors: list[DNAVector],
    recency_weights: Optional[list[float]] = None,
) -> DNAVector:
    """
    Combines multiple per-track DNA vectors into a single profile DNA.

    recency_weights: list of floats (same length as track_vectors), where
                     higher = more recent. If None, uniform weights are used.
                     Tip: pass [decay**i for i in range(n)] with decay=0.9.
    """
    if not track_vectors:
        raise ValueError("track_vectors must be non-empty.")

    n = len(track_vectors)

    # Build recency weights
    if recency_weights is None:
        recency_weights = [1.0] * n
    rw = np.array(recency_weights, dtype=float)
    rw /= rw.sum()   # normalize to sum=1

    vectors     = np.array([tv.vector     for tv in track_vectors])   # (n, 12)
    confidences = np.array([tv.confidence for tv in track_vectors])   # (n, 12)

    # Weighted mean — per axis, weight by recency × per-axis confidence
    axis_weights = confidences * rw[:, np.newaxis]                    # (n, 12)
    axis_weights /= (axis_weights.sum(axis=0, keepdims=True) + 1e-9)

    agg_vector     = (vectors * axis_weights).sum(axis=0)
    agg_confidence = np.clip(confidences.mean(axis=0) * np.sqrt(n / 10), 0, 1)
    coherence      = _compute_coherence(agg_vector, agg_confidence)

    return DNAVector(
        vector=agg_vector.tolist(),
        confidence=agg_confidence.tolist(),
        coherence_index=coherence,
        source=track_vectors[0].source,
        metadata={"track_count": n},
    )


# ─────────────────────────────────────────────
# Matching
# ─────────────────────────────────────────────

def match_score(dna_a: DNAVector, dna_b: DNAVector) -> dict:
    """
    Returns a similarity report between two DNA profiles.

    Uses COSINE SIMILARITY (not Euclidean) for robustness.
    Also returns a confidence-weighted score and per-axis breakdown.
    """
    _check_version_compatibility(dna_a, dna_b)

    va = np.array(dna_a.vector)
    vb = np.array(dna_b.vector)
    ca = np.array(dna_a.confidence)
    cb = np.array(dna_b.confidence)

    # Plain cosine similarity
    cosine_sim = _cosine_similarity(va, vb)

    # Confidence-weighted cosine: down-weight axes where either party is uncertain
    combined_conf = ca * cb
    va_w = va * combined_conf
    vb_w = vb * combined_conf
    weighted_cosine = _cosine_similarity(va_w, vb_w)

    # Per-axis absolute difference (for breakdown display)
    axis_diff = np.abs(va - vb).tolist()

    # Divergence score: how *complementary* the profiles are (inverse similarity)
    divergence = float(1.0 - cosine_sim)

    return {
        "cosine_similarity":          round(float(cosine_sim),      4),
        "weighted_cosine_similarity": round(float(weighted_cosine), 4),
        "divergence_score":           round(divergence,             4),
        "axis_diff":                  [round(d, 4) for d in axis_diff],
        "axis_labels":                AXIS_LABELS,
        "match_mode":                 "convergent" if cosine_sim > 0.7 else "divergent",
        "schema_versions":            (dna_a.schema_version, dna_b.schema_version),
    }


# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────

def _normalize(raw: np.ndarray) -> np.ndarray:
    """Z-score normalize then squash to (0, 1) via sigmoid."""
    z = (raw - AXIS_MEANS) / (AXIS_STDS + 1e-9)
    return 1.0 / (1.0 + np.exp(-z))   # sigmoid


def _cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Cosine similarity clamped to [0, 1]."""
    denom = (np.linalg.norm(a) * np.linalg.norm(b)) + 1e-9
    return float(np.clip(np.dot(a, b) / denom, 0.0, 1.0))


def _compute_coherence(vector: np.ndarray, confidence: np.ndarray) -> float:
    """
    Coherence Index: measures how internally consistent the DNA profile is.

    Formula:
      coherence = 1 - (weighted_std / max_possible_std)
      where weights = per-axis confidence scores.

    Range: 0 (completely scattered / incoherent) → 1 (tightly clustered / coherent)
    Interpretation: a high score means the listener has a consistent, focused taste.
    """
    weights = confidence / (confidence.sum() + 1e-9)
    weighted_mean = float(np.dot(weights, vector))
    weighted_var  = float(np.dot(weights, (vector - weighted_mean) ** 2))
    weighted_std  = float(np.sqrt(weighted_var))
    max_std = 0.5   # theoretical max std for values in [0, 1]
    coherence = float(np.clip(1.0 - (weighted_std / max_std), 0.0, 1.0))
    return round(coherence, 4)


def _check_version_compatibility(a: DNAVector, b: DNAVector) -> None:
    if a.schema_version != b.schema_version:
        warnings.warn(
            f"Schema version mismatch: {a.schema_version} vs {b.schema_version}. "
            "Re-generate one of the profiles before matching.",
            UserWarning,
            stacklevel=3,
        )


# ─────────────────────────────────────────────
# Quick demo
# ─────────────────────────────────────────────

if __name__ == "__main__":
    # Simulate two pre-computed vectors (as if from DB)
    dna_a = DNAVector(
        vector=[0.8, 0.6, 0.7, 0.5, 0.9, 0.8, 0.4, 0.3, 0.6, 0.1, 0.2, 0.3],
        confidence=[1.0]*12,
        coherence_index=0.0,
        source="spotify",
    )
    dna_b = DNAVector(
        vector=[0.75, 0.65, 0.72, 0.48, 0.88, 0.79, 0.42, 0.28, 0.61, 0.12, 0.18, 0.32],
        confidence=[0.9, 1.0, 1.0, 1.0, 0.8, 0.9, 0.7, 1.0, 1.0, 0.9, 0.9, 0.9],
        coherence_index=0.0,
        source="spotify",
    )

    # Recompute coherence
    dna_a.coherence_index = _compute_coherence(np.array(dna_a.vector), np.array(dna_a.confidence))
    dna_b.coherence_index = _compute_coherence(np.array(dna_b.vector), np.array(dna_b.confidence))

    result = match_score(dna_a, dna_b)

    print("=== Music DNA Match Report ===")
    print(f"Cosine Similarity:          {result['cosine_similarity']}")
    print(f"Weighted Cosine Similarity: {result['weighted_cosine_similarity']}")
    print(f"Divergence Score:           {result['divergence_score']}")
    print(f"Match Mode:                 {result['match_mode']}")
    print(f"Coherence A:                {dna_a.coherence_index}")
    print(f"Coherence B:                {dna_b.coherence_index}")
    print(f"\nPer-Axis Differences:")
    for label, diff in zip(result["axis_labels"], result["axis_diff"]):
        bar = "█" * int(diff * 20)
        print(f"  {label:<22} {bar:<20} {diff:.4f}")