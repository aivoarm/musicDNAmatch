export const runtime = "edge";
import { supabase, toUUID } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
    computeGenreVector,
    computeSpotifyVector,
    computeYouTubeVector,
    computeLastFMVector,
    computeMusicBrainzVector,
    combineDNA,
    AXIS_LABELS,
    generateInterpretation
} from "@/lib/dna";
import { isEmailDomainValid } from "@/lib/server/dns-check";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { MusicBrainzClient } from "@/lib/musicbrainz";
import { LastFMClient } from "@/lib/lastfm";

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
 * Computes DNA vector = 40% genre + 20% Spotify + 20% YouTube + 20% Last.fm
 * Saves to dna_profiles table
 * Returns: { profileId, vector, coherence_index, confidence, axes, metadata }
 */
export async function POST(req: Request) {
    try {
        const body = await req.json() as any;
        const {
            genres = [],
            audioFeatures = [],
            youtubeVideos = [],
            displayName,
            email,
            spotifyTracks = [],
            youtubeTracks = [],
            artistGenres = [],
            dry_run = false,
            city,
        } = body;

        // ── Validate email domain via DNS MX check (only on actual save, not dry_run) ─────
        if (email && typeof email === 'string' && email.trim() !== "" && !dry_run) {
            const isValid = await isEmailDomainValid(email.trim());
            if (!isValid) {
                return NextResponse.json({ error: 'Email domain is not valid' }, { status: 400 });
            }
        }

        // ── Identify user ──────────────────────────────
        const cookieStore = await cookies();
        let rawUserId = cookieStore.get("guest_id")?.value || crypto.randomUUID();
        let finalDisplayName = displayName;
        if ((!finalDisplayName || finalDisplayName === "Anonymous Signal") && email && typeof email === "string" && email.includes("@")) {
            finalDisplayName = email.split("@")[0].toUpperCase() + "-SIGNAL";
        } else if (!finalDisplayName) {
            finalDisplayName = "Anonymous Signal";
        }

        const userId = toUUID(rawUserId);

        // ── Check for WorkOS session ───────────────────
        const { user: workosUser } = await withAuth();
        const authUserId = workosUser?.id || null;

        // ── Compute Core Vectors ───────────────────────
        const genreDNA = computeGenreVector(genres);
        const hasSpots = audioFeatures.length > 0 || artistGenres.length > 0;
        const spotifyDNA = hasSpots ? computeSpotifyVector(audioFeatures, artistGenres) : null;
        const youtubeDNA = youtubeVideos.length > 0 ? computeYouTubeVector(youtubeVideos) : null;

        // ── Enrich with Last.fm & MusicBrainz (v2.4 Full Pass) ─────
        const mbClient = new MusicBrainzClient();
        const lfClient = new LastFMClient();

        // Unique artists from all sources
        const uniqueArtists = new Set<string>();
        spotifyTracks.slice(0, 10).forEach((t: any) => {
            const a = typeof t.artist === 'string' ? t.artist : (t.artists?.[0]?.name || t.artists?.[0] || "");
            if (a) uniqueArtists.add(a);
        });
        youtubeTracks.slice(0, 10).forEach((t: any) => {
            if (t.artist) uniqueArtists.add(t.artist);
        });

        const artistsToScan = Array.from(uniqueArtists).slice(0, 5); // Limit to top 5 to avoid timeouts/rate-limits

        let allLfmTags: { name: string, count: number }[] = [];
        let allMbTags: { name: string, count: number }[] = [];
        let mbArtistType: string | undefined;

        await Promise.all(artistsToScan.map(async (name) => {
            const [lfmTags, mbData] = await Promise.all([
                lfClient.getArtistTags(name),
                mbClient.searchArtist(name)
            ]);
            if (lfmTags) allLfmTags.push(...lfmTags);
            if (mbData?.tags) allMbTags.push(...mbData.tags);
            if (mbData?.type && !mbArtistType) mbArtistType = mbData.type;
        }));

        const lastfmDNA = allLfmTags.length > 0 ? computeLastFMVector(allLfmTags) : null;
        const musicbrainzDNA = allMbTags.length > 0 ? computeMusicBrainzVector(allMbTags, mbArtistType) : null;

        const finalDNA = combineDNA(genreDNA, spotifyDNA, youtubeDNA, lastfmDNA, musicbrainzDNA);

        // ── Build descriptive summary (no AI) ──────────
        const topAxes = finalDNA.vector
            .map((v, i) => ({ label: AXIS_LABELS[i], value: v }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 3);

        const lowestAxis = finalDNA.vector
            .map((v, i) => ({ label: AXIS_LABELS[i], value: v }))
            .sort((a, b) => a.value - b.value)[0];

        const lCount = allLfmTags.length;
        const mCount = allMbTags.length;
        const narrative = [
            `Your Musical DNA reveals a unique sonic fingerprint with a coherence index of ${(finalDNA.coherence_index * 100).toFixed(1)}%.`,
            `Your strongest dimensions are ${topAxes.map(a => a.label.replace(/_/g, " ")).join(", ")}.`,
            `Your discovery frontier lies in ${lowestAxis.label.replace(/_/g, " ")} — exploring this axis could unlock new sonic territories.`,
            `Based on ${genres.length} genre selections, ${audioFeatures.length} Spotify tracks, ${youtubeVideos.length} YouTube signals, ${lCount} Last.fm tags, and ${mCount} MusicBrainz entries.`,
        ].join(" ");

        // ── Save to Supabase ───────────────────────────
        const metadata = {
            display_name: finalDisplayName,
            email: (email && typeof email === 'string' && email.trim() !== "") ? email.trim().toLowerCase() : null,
            city: (city && typeof city === 'string' && city.trim() !== "") ? city.trim() : null,
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
            suggested_genres: [] as string[], // Will be filled below
            updated_at: new Date().toISOString(),
        };

        // ── Interpretation & Suggestions ──────────────
        const allTags = [...allLfmTags, ...allMbTags].map(t => t.name);
        const interpretation = generateInterpretation(finalDNA.vector, allTags);
        metadata.suggested_genres = interpretation.genreMatches;

        if (dry_run) {
            return NextResponse.json({
                success: true,
                vector: finalDNA.vector,
                confidence: finalDNA.confidence,
                coherence_index: finalDNA.coherence_index,
                axes: [...AXIS_LABELS],
                narrative,
                metadata,
                suggested_genres: interpretation.genreMatches,
                characteristics: interpretation.characteristics
            });
        }

        const { data: existing } = await supabase.from('dna_profiles').select('email, city, auth_user_id').eq('user_id', userId).maybeSingle();
        let uppercasedEmail = (email && typeof email === 'string' && email.trim() !== "") ? email.trim().toUpperCase() : existing?.email;
        let uppercasedCity = (city && typeof city === 'string' && city.trim() !== "") ? city.trim().toUpperCase() : existing?.city;

        // Strip email and city from metadata for the new schema
        const { email: _, city: __, ...cleanMetadata } = {
            ...metadata,
            email: uppercasedEmail,
            city: uppercasedCity
        };

        const { data: profile, error } = await supabase
            .from("dna_profiles")
            .upsert({
                user_id: userId,
                sonic_embedding: finalDNA.vector,
                metadata: cleanMetadata,
                email: uppercasedEmail,
                city: uppercasedCity,
                broadcasting: !!(authUserId || existing?.auth_user_id),
                auth_user_id: authUserId || existing?.auth_user_id // Use session ID or preserve existing
            }, { onConflict: "user_id" })
            .select()
            .single();

        if (error) throw error;

        // Background cleanup: Delete unsecured guest profiles older than 24h
        // This is fire-and-forget to avoid slowing down the current user's request
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        supabase.from("dna_profiles")
            .delete()
            .lt("created_at", twentyFourHoursAgo)
            .is("email", null) // Profile hasn't been secured with an email
            .then(({ error }) => { if (error) console.error("Cleanup error:", error); });

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
            created_at: profile.created_at,
        });

        response.cookies.set("guest_id", rawUserId, {
            maxAge: 60 * 60 * 24 * 365,
            path: "/",
        });

        response.cookies.set("has_dna", "true", {
            maxAge: 60 * 60 * 24 * 365,
            path: "/",
        });

        response.cookies.set("profile_id", profile.id, {
            maxAge: 60 * 60 * 24 * 365,
            path: "/",
        });

        return response;

    } catch (error: any) {
        console.error("DNA Generate Error:", error);
        return NextResponse.json({ error: error.message || "Failed to generate DNA" }, { status: 500 });
    }
}
