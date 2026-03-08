export const runtime = "edge";
import { NextResponse } from "next/server";
import { SpotifyPublicFetcher } from "@/lib/spotify";

/**
 * POST /api/spotify/scan
 * Body: { spotify_user_id, playlist_ids?: string[], playlist_id?: string, track_ids?: string[], artist_genres?: string[], limit?, offset? }
 * 
 * New: accepts playlist_ids (array, max 5) to scan multiple playlists.
 * Also accepts direct track_ids for syncing specific tracks.
 */
export async function POST(req: Request) {
    const body = await req.json() as any;
    const { spotify_user_id, playlist_ids, playlist_id, track_ids, artist_genres, limit = 5, offset = 0 } = body;

    if (!spotify_user_id && !playlist_ids?.length && !track_ids?.length) {
        return NextResponse.json({ error: "No Spotify ID, playlist IDs, or track IDs provided" }, { status: 400 });
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        return NextResponse.json({ error: "Admin credentials missing on server" }, { status: 500 });
    }

    try {
        const fetcher = new SpotifyPublicFetcher(clientId, clientSecret);

        // ── Direct track scan mode ────────────────────
        if (track_ids && Array.isArray(track_ids) && track_ids.length > 0) {
            const audioFeatures = await fetchAudioFeatures(track_ids, clientId, clientSecret);
            const resolvedArtistGenres = artist_genres || [];

            return NextResponse.json({
                tracks: [], // Caller might already have these
                audioFeatures,
                artistGenres: resolvedArtistGenres,
                count: track_ids.length,
            });
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
                    const { access_token } = await tokenRes.json() as any;
                    const plRes = await fetch(`https://api.spotify.com/v1/playlists/${pId}`, {
                        headers: { Authorization: `Bearer ${access_token}` }
                    });
                    if (plRes.ok) {
                        const plData = await plRes.json() as any;
                        if (plData.owner?.id) resolvedSpotifyId = plData.owner.id;
                    }
                }
            } catch (e) {
                console.error("Failed to parse playlist owner ID", e);
            }
        }

        // ── Multi-playlist scan mode ────────────────────
        if (playlist_ids && Array.isArray(playlist_ids) && playlist_ids.length > 0) {
            const ids = playlist_ids.slice(0, 5); // max 5
            const allTracks: any[] = [];

            for (const pid of ids) {
                const data = await fetcher.getUserPublicData(resolvedSpotifyId || "none", pid);
                if ("tracks" in data && data.tracks) {
                    allTracks.push(...data.tracks.slice(0, 20)); // max 20 per playlist
                }
            }

            // Deduplicate by track ID
            const seen = new Set<string>();
            const uniqueTracks = allTracks.filter(t => {
                if (!t.id || seen.has(t.id)) return false;
                seen.add(t.id);
                return true;
            }).slice(0, 100); // max 100 total

            // Fetch audio features for all tracks
            const audioFeatures = await fetchAudioFeatures(uniqueTracks.map(t => t.id), clientId, clientSecret);

            // Collect Artist textual genres if artistIds are present
            const artistIdsToFetch = Array.from(new Set(uniqueTracks.map(t => t.artistId).filter(Boolean))) as string[];
            const artistGenres = await fetchArtistGenres(artistIdsToFetch.slice(0, 50), clientId, clientSecret);

            return NextResponse.json({
                tracks: uniqueTracks,
                audioFeatures,
                artistGenres,
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
    const { access_token } = await tokenRes.json() as any;

    // Batch in groups of 100 (Spotify limit)
    const features: any[] = [];
    for (let i = 0; i < trackIds.length; i += 100) {
        const batch = trackIds.slice(i, i + 100);
        const res = await fetch(
            `https://api.spotify.com/v1/audio-features?ids=${batch.join(",")}`,
            { headers: { Authorization: `Bearer ${access_token}` } }
        );
        if (res.ok) {
            const data = await res.json() as any;
            features.push(...(data.audio_features || []).filter(Boolean));
        }
    }

    return features;
}

/**
 * Fetches textual Genre tags from Spotify Artists to directly map them.
 */
async function fetchArtistGenres(artistIds: string[], clientId: string, clientSecret: string) {
    if (artistIds.length === 0) return [];

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
    const { access_token } = await tokenRes.json() as any;

    const allGenres = new Set<string>();
    for (let i = 0; i < artistIds.length; i += 50) {
        const batch = artistIds.slice(i, i + 50);
        const res = await fetch(
            `https://api.spotify.com/v1/artists?ids=${batch.join(",")}`,
            { headers: { Authorization: `Bearer ${access_token}` } }
        );
        if (res.ok) {
            const data = await res.json() as any;
            for (const artist of data.artists || []) {
                if (artist && artist.genres) {
                    for (const genre of artist.genres) {
                        allGenres.add(genre);
                    }
                }
            }
        }
    }

    return Array.from(allGenres);
}
