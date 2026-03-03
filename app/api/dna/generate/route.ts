import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createHash, randomUUID } from "crypto";
import {
    computeGenreVector,
    computeSpotifyVector,
    computeYouTubeVector,
    combineDNA,
    AXIS_LABELS,
} from "@/lib/dna";

function toUUID(str: string): string {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(str)) return str;
    const hash = createHash("sha256").update(str).digest("hex");
    return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

/**
 * POST /api/dna/generate
 * Body: {
 *   genres: string[],
 *   audioFeatures?: SpotifyAudioFeatures[],
 *   youtubeVideos?: { categoryId, title }[],
 *   displayName?: string,
 *   spotifyTracks?: any[],
 *   youtubeTracks?: any[],
 * }
 * 
 * Computes DNA vector = 50% genre + 25% Spotify + 25% YouTube
 * Saves to dna_profiles table
 * Returns: { profileId, vector, coherence_index, confidence, axes, metadata }
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            genres = [],
            audioFeatures = [],
            youtubeVideos = [],
            displayName,
            email,
            spotifyTracks = [],
            youtubeTracks = [],
        } = body;

        // ── Identify user ──────────────────────────────
        const cookieStore = await cookies();
        let rawUserId = cookieStore.get("guest_id")?.value || randomUUID();
        let finalDisplayName = displayName || "Anonymous Signal";

        const userId = toUUID(rawUserId);


        // ── Compute DNA ────────────────────────────────
        const genreDNA = computeGenreVector(genres);
        const spotifyDNA = audioFeatures.length > 0 ? computeSpotifyVector(audioFeatures) : null;
        const youtubeDNA = youtubeVideos.length > 0 ? computeYouTubeVector(youtubeVideos) : null;
        const finalDNA = combineDNA(genreDNA, spotifyDNA, youtubeDNA);

        // ── Build descriptive summary (no AI) ──────────
        const topAxes = finalDNA.vector
            .map((v, i) => ({ label: AXIS_LABELS[i], value: v }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 3);

        const lowestAxis = finalDNA.vector
            .map((v, i) => ({ label: AXIS_LABELS[i], value: v }))
            .sort((a, b) => a.value - b.value)[0];

        const narrative = [
            `Your Musical DNA reveals a unique sonic fingerprint with a coherence index of ${(finalDNA.coherence_index * 100).toFixed(1)}%.`,
            `Your strongest dimensions are ${topAxes.map(a => a.label.replace(/_/g, " ")).join(", ")}.`,
            `Your discovery frontier lies in ${lowestAxis.label.replace(/_/g, " ")} — exploring this axis could unlock new sonic territories.`,
            `Based on ${genres.length} genre preferences, ${audioFeatures.length} Spotify tracks, and ${youtubeVideos.length} YouTube songs.`,
        ].join(" ");

        // ── Save to Supabase ───────────────────────────
        const metadata = {
            display_name: finalDisplayName,
            email,
            top_genres: genres,
            recent_tracks: [
                ...spotifyTracks.slice(0, 15),

                ...youtubeTracks.map((t: any) => ({ id: t.id, title: t.title, artist: t.artist, thumbnail: t.thumbnail, url: t.url }))

            ],
            youtube_tracks: youtubeTracks.slice(0, 5),
            confidence: finalDNA.confidence,
            coherence_index: finalDNA.coherence_index,
            schema_version: finalDNA.schema_version,
            source: finalDNA.source,
            source_signals: finalDNA.metadata,
            narrative,
            updated_at: new Date().toISOString(),
        };



        const { data: profile, error } = await supabase
            .from("dna_profiles")
            .upsert({
                user_id: userId,
                sonic_embedding: finalDNA.vector,
                metadata,
                broadcasting: true,
            }, { onConflict: "user_id" })
            .select()
            .single();

        if (error) throw error;

        const response = NextResponse.json({
            success: true,
            profileId: profile.id,
            userId,
            vector: finalDNA.vector,
            confidence: finalDNA.confidence,
            coherence_index: finalDNA.coherence_index,
            axes: [...AXIS_LABELS],
            narrative,
            metadata,
        });

        response.cookies.set("guest_id", rawUserId, {
            maxAge: 60 * 60 * 24 * 365,
            path: "/",
        });

        return response;

    } catch (error: any) {
        console.error("DNA Generate Error:", error);
        return NextResponse.json({ error: error.message || "Failed to generate DNA" }, { status: 500 });
    }
}
