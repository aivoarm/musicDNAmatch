import { cookies } from "next/headers";
import { computeDNA } from "@/lib/dna";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST() {
    const cookieStore = await cookies();
    const token = cookieStore.get("spotify_access_token")?.value;

    console.log("DNA Generate Request Received. Token present:", !!token);
    if (!token) {
        console.log("All Cookies:", cookieStore.getAll().map(c => c.name));
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // 1. Fetch user's top tracks - try all time ranges
        let topTracks: any = null;
        for (const range of ["short_term", "medium_term", "long_term"]) {
            const res = await fetch(
                `https://api.spotify.com/v1/me/top/tracks?limit=20&time_range=${range}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const text = await res.text();
            let data: any;
            try { data = JSON.parse(text); } catch {
                console.error(`Top Tracks [${range}]: Non-JSON:`, text.slice(0, 80));
                continue;
            }
            if (data.error?.status === 401) {
                return NextResponse.json({ error: "Token expired", redirect: "/api/auth/spotify/login" }, { status: 401 });
            }
            console.log(`Top Tracks [${range}]:`, data.error ? `ERROR ${data.error.status}` : `${data.items?.length || 0} tracks`);
            if (!data.error && data.items && data.items.length > 0) {
                topTracks = data;
                break;
            }
        }

        if (!topTracks || !topTracks.items || topTracks.items.length === 0) {
            // Fallback: recently played tracks
            console.log("Top tracks empty. Trying recently-played fallback...");
            const recentRes = await fetch(
                "https://api.spotify.com/v1/me/player/recently-played?limit=50",
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const recentText = await recentRes.text();
            let recentData: any;
            try { recentData = JSON.parse(recentText); } catch { recentData = {}; }

            if (recentData.items && recentData.items.length > 0) {
                // recently-played wraps tracks in { track: {...}, played_at: "..." }
                const dedupedTracks = new Map();
                for (const item of recentData.items) {
                    if (item.track && !dedupedTracks.has(item.track.id)) {
                        dedupedTracks.set(item.track.id, item.track);
                    }
                }
                topTracks = { items: Array.from(dedupedTracks.values()) };
                console.log("Recently-played fallback:", topTracks.items.length, "unique tracks");
            } else {
                return NextResponse.json({
                    error: "No listening history found. Make sure you're signed into the right Spotify account (you need to have listened to some music recently)."
                }, { status: 400 });
            }
        }

        // 2. Collect unique artist IDs from top tracks
        const artistIds = Array.from(new Set(
            topTracks.items.flatMap((t: any) => t.artists.map((a: any) => a.id))
        )).slice(0, 50) as string[];

        console.log("Fetching genres for", artistIds.length, "artists...");

        // 3. Batch-fetch artist info to get genres
        const artistRes = await fetch(
            `https://api.spotify.com/v1/artists?ids=${artistIds.join(",")}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const artistData = await artistRes.json();

        if (!artistData.artists) {
            console.error("Artist fetch failed:", artistData);
            return NextResponse.json({ error: "Failed to load artist data." }, { status: 500 });
        }

        // 4. Build TrackData objects for DNA computation
        const genresByArtistId = new Map<string, string[]>();
        for (const artist of artistData.artists) {
            genresByArtistId.set(artist.id, artist.genres || []);
        }

        const trackDataList = topTracks.items.map((track: any) => {
            const artistGenres = track.artists.flatMap((a: any) => genresByArtistId.get(a.id) || []);
            const releaseYear = parseInt((track.album.release_date || "2000").split("-")[0]);
            return {
                popularity: track.popularity,
                duration_ms: track.duration_ms,
                release_year: releaseYear,
                genres: artistGenres,
            };
        });

        console.log("Track data ready. Computing 12D DNA vector...");

        // 5. Compute the 12D DNA Vector
        const dna = computeDNA(trackDataList);

        // 6. Compute top genres and format recent tracks for display
        const topGenres = Array.from(new Set(
            trackDataList.flatMap((t: any) => t.genres)
        )).slice(0, 10) as string[];

        const recentTracks = topTracks.items.slice(0, 5).map((t: any) => ({
            id: t.id,
            name: t.name,
            artist: t.artists.map((a: any) => a.name).join(", "),
            album: t.album.name,
            image: t.album.images?.[1]?.url || t.album.images?.[0]?.url,
            duration_ms: t.duration_ms,
            url: t.external_urls?.spotify,
        }));

        // 7. Get User Profile from Spotify
        const userResponse = await fetch("https://api.spotify.com/v1/me", {
            headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userResponse.json();

        // 8. Store in Supabase
        const { error: dbError } = await supabase
            .from("dna_profiles")
            .upsert({
                user_id: userData.id,
                sonic_embedding: dna.vector,
                metadata: {
                    display_name: userData.display_name,
                    images: userData.images,
                    dna_version: dna.version,
                    markers: dna.markers,
                    top_genres: topGenres,
                },
                broadcasting: true
            }, { onConflict: "user_id" });

        if (dbError) {
            console.error("Supabase Error:", dbError.message);
        }

        console.log("DNA Generation complete:", dna.vector.map((v: number) => v.toFixed(2)).join(", "));
        return NextResponse.json({
            ...dna,
            top_genres: topGenres,
            recent_tracks: recentTracks,
            display_name: userData.display_name,
        });
    } catch (error) {
        console.error("DNA Generation Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
