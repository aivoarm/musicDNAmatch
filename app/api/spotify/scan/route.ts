import { NextResponse } from "next/server";
import { SpotifyPublicFetcher } from "@/lib/spotify";

/**
 * POST /api/spotify/scan
 * Body: { spotify_user_id, playlist_ids?: string[], playlist_id?: string, limit?, offset? }
 * 
 * New: accepts playlist_ids (array, max 5) to scan multiple playlists.
 * Fetches up to 10 tracks per playlist + audio features for all.
 * Falls back to legacy single-playlist / user-listing mode.
 */
export async function POST(req: Request) {
    const body = await req.json();
    const { spotify_user_id, playlist_ids, playlist_id, limit = 5, offset = 0 } = body;

    if (!spotify_user_id && !playlist_ids?.length) {
        return NextResponse.json({ error: "No Spotify ID or playlist IDs provided" }, { status: 400 });
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        return NextResponse.json({ error: "Admin credentials missing on server" }, { status: 500 });
    }

    let resolvedSpotifyId = spotify_user_id;

    if (spotify_user_id && spotify_user_id.startsWith("playlist:")) {
        const pId = spotify_user_id.replace("playlist:", "");
        try {
            const authStr = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
            const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
                method: "POST",
                headers: {
                    Authorization: `Basic ${authStr}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: "grant_type=client_credentials",
            });
            if (tokenRes.ok) {
                const { access_token } = await tokenRes.json();
                const plRes = await fetch(`https://api.spotify.com/v1/playlists/${pId}`, {
                    headers: { Authorization: `Bearer ${access_token}` }
                });
                if (plRes.ok) {
                    const plData = await plRes.json();
                    if (plData.owner?.id) resolvedSpotifyId = plData.owner.id;
                }
            }
        } catch (e) {
            console.error("Failed to parse playlist owner ID", e);
        }
    }

    try {
        const fetcher = new SpotifyPublicFetcher(clientId, clientSecret);

        // ── Multi-playlist scan mode ────────────────────
        if (playlist_ids && Array.isArray(playlist_ids) && playlist_ids.length > 0) {
            const ids = playlist_ids.slice(0, 5); // max 5
            const allTracks: any[] = [];

            for (const pid of ids) {
                const data = await fetcher.getUserPublicData(resolvedSpotifyId || "none", pid);
                if ("tracks" in data && data.tracks) {
                    allTracks.push(...data.tracks.slice(0, 10)); // max 10 per playlist
                }
            }

            // Deduplicate by track ID
            const seen = new Set<string>();
            const uniqueTracks = allTracks.filter(t => {
                if (!t.id || seen.has(t.id)) return false;
                seen.add(t.id);
                return true;
            }).slice(0, 50); // max 50 total

            // Fetch audio features for all tracks
            const audioFeatures = await fetchAudioFeatures(uniqueTracks.map(t => t.id), clientId, clientSecret);

            return NextResponse.json({
                tracks: uniqueTracks,
                audioFeatures,
                count: uniqueTracks.length,
            });
        }

        // ── Legacy single playlist / user listing mode ──
        const data = await fetcher.getUserPublicData(resolvedSpotifyId, playlist_id, limit, offset);

        if ("error" in data) {
            return NextResponse.json({ error: data.error }, { status: 400 });
        }

        return NextResponse.json({
            spotify_user_id: resolvedSpotifyId,
            ...data,
            count: (data.playlists?.length || data.tracks?.length || 0)
        });
    } catch (err: any) {
        console.error("Spotify Scan Error:", err);
        return NextResponse.json({ error: "Internal scan failure: " + err.message }, { status: 500 });
    }
}


/**
 * Fetches Spotify audio features for a batch of track IDs.
 * Uses client credentials flow (no user auth required).
 */
async function fetchAudioFeatures(trackIds: string[], clientId: string, clientSecret: string) {
    if (trackIds.length === 0) return [];

    // Get token
    const authStr = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            Authorization: `Basic ${authStr}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
    });

    if (!tokenRes.ok) return [];
    const { access_token } = await tokenRes.json();

    // Batch in groups of 100 (Spotify limit)
    const features: any[] = [];
    for (let i = 0; i < trackIds.length; i += 100) {
        const batch = trackIds.slice(i, i + 100);
        const res = await fetch(
            `https://api.spotify.com/v1/audio-features?ids=${batch.join(",")}`,
            { headers: { Authorization: `Bearer ${access_token}` } }
        );
        if (res.ok) {
            const data = await res.json();
            features.push(...(data.audio_features || []).filter(Boolean));
        }
    }

    return features;
}
