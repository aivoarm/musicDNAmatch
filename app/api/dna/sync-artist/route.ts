import { supabase, toUUID } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { SpotifyPublicFetcher } from "@/lib/spotify";
import {
    computeSpotifyVector,
    combineDNA,
    DNA_SCHEMA_VERSION,
    calculateCoherence,
    AXIS_LABELS,
    generateInterpretation
} from "@/lib/dna";

export async function POST(req: Request) {
    try {
        const { artist } = await req.json();
        if (!artist) return NextResponse.json({ error: "Missing artist" }, { status: 400 });

        const cookieStore = await cookies();
        let rawUserId = cookieStore.get("guest_id")?.value;
        const hasDna = cookieStore.get("has_dna")?.value === "true";

        if (!rawUserId) {
            rawUserId = randomUUID();
        }
        const userId = toUUID(rawUserId);

        // 1. Get Artist DNA
        let artistVector: number[] | null = null;
        let artistTags: string[] = artist.tags || [];

        if (artist.is_db) {
            // Fetch from DB
            const { data: dbArtist } = await supabase
                .from("artists")
                .select("dna_profiles(sonic_embedding)")
                .eq("id", artist.id)
                .single();

            const dnaMeta = Array.isArray(dbArtist?.dna_profiles) ? dbArtist.dna_profiles[0] : dbArtist?.dna_profiles;
            if (dnaMeta?.sonic_embedding) {
                artistVector = typeof dnaMeta.sonic_embedding === 'string'
                    ? dnaMeta.sonic_embedding.replace(/[\[\]]/g, '').split(',').map(Number)
                    : dnaMeta.sonic_embedding;
            }
        }

        if (!artistVector) {
            // Recalculate from Spotify
            const clientId = process.env.SPOTIFY_CLIENT_ID;
            const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
            if (clientId && clientSecret) {
                const fetcher = new SpotifyPublicFetcher(clientId, clientSecret);
                const top = await fetcher.getArtistTopTracks(artist.id);
                const trackIds = top.tracks.map(t => t.id);
                const features = await fetcher.getAudioFeatures(trackIds);
                const dna = computeSpotifyVector(features, artist.tags);
                artistVector = dna.vector;
            }
        }

        if (!artistVector) {
            return NextResponse.json({ error: "Could not resolve artist DNA" }, { status: 500 });
        }

        // 2. Load Current Profile
        const { data: currentProfile } = await supabase
            .from("dna_profiles")
            .select("*")
            .eq("user_id", userId)
            .single();

        let finalVector = artistVector;
        let finalMetadata: any = {
            display_name: "Anonymous Signal",
            top_genres: artistTags.slice(0, 5),
            recent_tracks: [],
            confidence: Array(12).fill(0.8),
            coherence_index: 0.8,
            schema_version: DNA_SCHEMA_VERSION,
            source: "discovery_sync",
            source_signals: { sync_artist: artist.name },
            updated_at: new Date().toISOString(),
        };

        if (currentProfile) {
            // Blend with existing DNA (Simple moving average)
            const currentVector = typeof currentProfile.sonic_embedding === 'string'
                ? currentProfile.sonic_embedding.replace(/[\[\]]/g, '').split(',').map(Number)
                : currentProfile.sonic_embedding;

            if (Array.isArray(currentVector) && currentVector.length === 12) {
                finalVector = currentVector.map((v, i) => (v * 0.7) + (artistVector![i] * 0.3));
            }

            const currentMeta = currentProfile.metadata || {};
            const narrative = `Blended with discovered signal: ${artist.name}. ` + (currentMeta.narrative || "");

            finalMetadata = {
                ...currentMeta,
                top_genres: Array.from(new Set([...(currentMeta.top_genres || []), ...artistTags])).slice(0, 10),
                narrative,
                updated_at: new Date().toISOString(),
                source_signals: {
                    ...(currentMeta.source_signals || {}),
                    last_sync: artist.name
                }
            };
        } else {
            const interpretation = generateInterpretation(artistVector);
            finalMetadata.narrative = `Initial neural state discovered via signal: ${artist.name}. Key characteristics: ${interpretation.characteristics.join(", ")}.`;
        }

        // 3. Upsert
        const { data: profile, error } = await supabase
            .from("dna_profiles")
            .upsert({
                user_id: userId,
                sonic_embedding: finalVector,
                metadata: finalMetadata,
                broadcasting: !!currentProfile?.email,
            }, { onConflict: "user_id" })
            .select()
            .single();

        if (error) throw error;

        const response = NextResponse.json({
            success: true,
            profileId: profile.id,
            vector: finalVector
        });

        // Ensure cookies
        response.cookies.set("guest_id", rawUserId, { maxAge: 60 * 60 * 24 * 365, path: "/" });
        response.cookies.set("has_dna", "true", { maxAge: 60 * 60 * 24 * 365, path: "/" });

        return response;

    } catch (error: any) {
        console.error("Sync Artist Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
