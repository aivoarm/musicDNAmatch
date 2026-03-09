export const runtime = "edge";
import { supabase, toUUID } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { SpotifyPublicFetcher } from "@/lib/spotify";
import { computeSpotifyVector, computeGenreVector, computeLastFMVector, computeMusicBrainzVector, combineDNA, DNAVector } from "@/lib/dna";
import { MusicBrainzClient } from "@/lib/musicbrainz";
import { LastFMClient } from "@/lib/lastfm";
import { SpotifyAudioFeatures } from "@/lib/dna";

export async function POST(request: NextRequest) {
    const cookieStore = await cookies();
    const guestId = cookieStore.get("guest_id")?.value;

    if (!guestId) {
        return NextResponse.json({ error: "No profile found. Please scan your DNA first." }, { status: 401 });
    }

    console.log("Sync Artist hit for guestId:", guestId);

    const { artistId } = await request.json() as any;
    console.log("artistId:", artistId);

    if (!artistId) {
        return NextResponse.json({ error: "Missing artist ID" }, { status: 400 });
    }

    try {
        const userId = toUUID(guestId);
        console.log("userId (toUUID):", userId);

        // 1. Fetch current profile
        const { data: profile, error: profileErr } = await supabase
            .from("dna_profiles")
            .select("*")
            .eq("id", userId)
            .single();

        if (profileErr || !profile) {
            console.warn("Profile not found in Supabase for ID:", userId, profileErr);
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        // 2. Fetch artist top tracks & features
        const clientId = process.env.SPOTIFY_CLIENT_ID;
        const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            return NextResponse.json({ error: "Spotify credentials missing" }, { status: 500 });
        }

        const spotify = new SpotifyPublicFetcher(clientId, clientSecret);

        // Parallel fetch top tracks and audio features (if possible, though features needs IDs)
        const topTracksData = await spotify.getArtistTopTracks(artistId);
        if (topTracksData.error || !topTracksData.tracks?.length) {
            return NextResponse.json({ error: "Failed to fetch artist tracks" }, { status: 500 });
        }

        const topTracks = topTracksData.tracks.slice(0, 5);
        const trackIds = topTracks.map(t => t.id);
        const audioFeatures = await spotify.getAudioFeatures(trackIds);

        // 3. Merge data
        const existingTracks = Array.isArray(profile.recent_tracks) ? profile.recent_tracks : [];
        const existingFeatures = Array.isArray(profile.audio_features) ? profile.audio_features : [];
        const existingGenres = Array.isArray(profile.top_genres) ? profile.top_genres : [];

        // Filter out duplicates
        const newTracks = topTracks.filter(t => !existingTracks.some((et: any) => et.id === t.id));
        const newFeatures = (audioFeatures || []).filter((f: any) => f && !existingFeatures.some((ef: any) => ef.id === f.id));

        const combinedTracks = [...existingTracks, ...newTracks];
        const combinedFeatures = [...existingFeatures, ...newFeatures];

        // 4. Enrichment (v2.4 Pass)
        const mbClient = new MusicBrainzClient();
        const lfClient = new LastFMClient();

        // Use top track's artist name for lookup
        const artistName = topTracks[0]?.artist || "";

        const [lfmTags, mbData] = await Promise.all([
            lfClient.getArtistTags(artistName),
            mbClient.searchArtist(artistName)
        ]);

        const lastfmDNA = lfmTags.length > 0 ? computeLastFMVector(lfmTags) : null;
        const musicbrainzDNA = (mbData?.tags && mbData.tags.length > 0) ? computeMusicBrainzVector(mbData.tags, mbData.type) : null;

        // 5. Re-calculate DNA
        const genreDNA = computeGenreVector(existingGenres);
        const spotifyDNA = computeSpotifyVector(combinedFeatures, []);

        // Combine all 5 pillars
        const updatedDna = combineDNA(genreDNA, spotifyDNA, null, lastfmDNA, musicbrainzDNA);

        // 5. Update DB
        const { error: updateErr } = await supabase
            .from("dna_profiles")
            .update({
                recent_tracks: combinedTracks,
                audio_features: combinedFeatures,
                vector: updatedDna.vector,
                coherence_index: updatedDna.coherence_index,
                updated_at: new Date().toISOString()
            })
            .eq("id", userId);

        if (updateErr) throw updateErr;

        return NextResponse.json({
            success: true,
            message: "Artist synced into DNA",
            newVector: updatedDna.vector,
            addedCount: newTracks.length
        });

    } catch (e: any) {
        console.error("Sync Artist Error:", e);
        return NextResponse.json({ error: e.message || "Failed to sync artist" }, { status: 500 });
    }
}
