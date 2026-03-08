export const runtime = "edge";
import { SpotifyPublicFetcher } from "@/lib/spotify";
import { NextResponse } from "next/server";
import { supabase, toUUID } from "@/lib/supabase";
import { cookies } from "next/headers";
import { matchScore } from "@/lib/dna";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!query) {
        return NextResponse.json({ success: false, error: "Missing query" });
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        return NextResponse.json({ error: "Credentials missing" }, { status: 500 });
    }

    try {
        const fetcher = new SpotifyPublicFetcher(clientId, clientSecret);

        // 1. Search local DB first
        const { data: dbMatches } = await supabase
            .from("artists")
            .select(`
                *,
                dna_profiles!inner(sonic_embedding)
            `)
            .eq("verified", true)
            .ilike("name", `%${query}%`)
            .limit(3);

        const spotifyResults = await fetcher.searchArtists(query, limit, offset);

        // Get user DNA to calculate match if possible
        const cookieStore = await cookies();
        const guestId = cookieStore.get("guest_id")?.value;
        let myDnaVector = null;

        if (guestId) {
            const { data: myProfile } = await supabase
                .from("dna_profiles")
                .select("sonic_embedding")
                .eq("user_id", toUUID(guestId))
                .single();

            if (myProfile?.sonic_embedding) {
                let vector = myProfile.sonic_embedding;
                if (typeof vector === "string") {
                    try { vector = vector.replace(/[\[\]]/g, '').split(',').map(Number); } catch (e) { vector = null; }
                }
                if (Array.isArray(vector) && vector.length === 12) {
                    myDnaVector = vector;
                }
            }
        }

        const colors = [
            "from-blue-500 to-indigo-600",
            "from-purple-500 to-pink-600",
            "from-orange-500 to-red-600",
            "from-amber-600 to-yellow-700",
            "from-emerald-500 to-teal-600",
            "from-[#FF0000] to-orange-600",
        ];

        // Format DB matches
        const dbEnriched = (dbMatches || []).map((artist: any) => {
            const dnaMeta = Array.isArray(artist.dna_profiles) ? artist.dna_profiles[0] : artist.dna_profiles;
            let match = null;
            if (myDnaVector && dnaMeta?.sonic_embedding) {
                let v = dnaMeta.sonic_embedding;
                if (typeof v === 'string') try { v = v.replace(/[\[\]]/g, '').split(',').map(Number); } catch (e) { }
                if (Array.isArray(v) && v.length === 12) {
                    match = matchScore({ vector: myDnaVector } as any, { vector: v } as any);
                }
            }
            return {
                id: artist.id,
                name: artist.name,
                style: artist.style || "Tribe Member",
                bio: artist.bio,
                tags: artist.tags || [],
                listeners: "Verified Member",
                color: "from-[#FF0000] to-black",
                match,
                spotify_url: artist.spotify_url,
                image: artist.image_url,
                preview: artist.preview_url ? { preview_url: artist.preview_url } : null,
                is_db: true
            };
        });

        // 2. Scan Spotify artists deeply
        const artistsWithTracks = await Promise.all(spotifyResults.map(async (artist: any) => {
            const top = await fetcher.getArtistTopTracks(artist.id);
            return { ...artist, topTracks: top.tracks?.slice(0, 5) || [] };
        }));

        const allTrackIds = artistsWithTracks.flatMap((a: any) => a.topTracks.map((t: any) => t.id));
        const features = await fetcher.getAudioFeatures(allTrackIds);
        const featuresMap = new Map((features || []).filter((f: any) => f).map((f: any) => [f.id, f]));

        const { computeSpotifyVector } = await import("@/lib/dna");

        const spotifyEnriched = artistsWithTracks.map((artist: any) => {
            const artistFeatures = artist.topTracks.map((t: any) => featuresMap.get(t.id)).filter(Boolean);
            const artistDna = computeSpotifyVector(artistFeatures, artist.genres);

            let match = null;
            if (myDnaVector) {
                match = matchScore({ vector: myDnaVector } as any, { vector: artistDna.vector } as any);
            }

            const charCode = artist.name.charCodeAt(0) || 0;
            const color = colors[charCode % colors.length];

            return {
                id: artist.id,
                name: artist.name,
                style: artist.genres?.[0] || "Artist Signal",
                bio: `Popularity Index: ${artist.popularity}%`,
                tags: artist.genres || [],
                listeners: "Spotify Verified",
                color,
                match,
                spotify_url: artist.url,
                image: artist.image,
                is_db: false,
                preview: artist.topTracks.find((t: any) => t.preview_url) || null
            };
        });

        return NextResponse.json({ success: true, artists: [...dbEnriched, ...spotifyEnriched] });

    } catch (error: any) {
        console.error("Artist search error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
