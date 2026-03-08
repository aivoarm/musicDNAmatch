export const runtime = "edge";
import { SpotifyPublicFetcher } from "@/lib/spotify";
import { NextResponse } from "next/server";
import { supabase, toUUID } from "@/lib/supabase";
import { cookies } from "next/headers";
import { matchScore, computeSpotifyVector } from "@/lib/dna";

export async function GET(req: Request) {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        return NextResponse.json({ error: "Credentials missing" }, { status: 500 });
    }

    try {
        const cookieStore = await cookies();
        const guestId = cookieStore.get("guest_id")?.value;
        if (!guestId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const userId = toUUID(guestId);

        // 1. Get user profile and DNA
        const { data: profile } = await supabase
            .from("dna_profiles")
            .select("*")
            .eq("user_id", userId)
            .single();

        if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

        const meta = profile.metadata || {};
        const recentTracks = meta.recent_tracks || [];
        const topGenres = meta.top_genres || [];

        let myDnaVector = profile.sonic_embedding;
        if (typeof myDnaVector === "string") {
            try { myDnaVector = myDnaVector.replace(/[\[\]]/g, '').split(',').map(Number); } catch (e) { myDnaVector = null; }
        }

        // 2. Prepare seeds
        // Use up to 3 artist IDs from recent tracks
        const seedArtistIds = Array.from(new Set(recentTracks.map((t: any) => t.artistId).filter(Boolean))).slice(0, 3) as string[];

        const fetcher = new SpotifyPublicFetcher(clientId, clientSecret);

        // 3. Get recommendations
        // Map top genres to Spotify-compatible ones
        const availableSeeds = await fetcher.getAvailableGenreSeeds();
        const spotifyGenres = (topGenres.map((g: string) => {
            const low = g.toLowerCase().replace(/ & /g, "-").replace(/\//g, "-").replace(/ /g, "-");

            // Check if it's a direct match in available seeds
            if (availableSeeds.includes(low)) return low;

            // Special mappings for our GENRE_OPTIONS
            if (low === "hiphop") return "hip-hop";
            if (low === "rnb" || low === "r-n-b") return "r-n-b";
            if (low === "indie-alt") return "indie";
            if (low === "metal-rock") return "metal";
            if (low === "folk-acoustic") return "folk";
            if (low === "ambient-drone") return "ambient";
            if (low === "world-global") return "world-music";

            // Substring matches
            if (low.includes("electronic")) return "electronic";
            if (low.includes("pop")) return "pop";

            return null;
        }).filter(Boolean) as string[]).slice(0, 2);

        // If we have no seeds, we can't get recommendations, so we'll fallback to a generic search or return empty
        if (seedArtistIds.length === 0 && spotifyGenres.length === 0) {
            return NextResponse.json({ success: true, artists: [] });
        }

        let recommendations = { tracks: [] as any[] };

        // Strategy A: Combined seeds
        console.log("Discovery Stage A: Combined Seeds", { artists: seedArtistIds, genres: spotifyGenres });
        recommendations = await fetcher.getRecommendations(seedArtistIds, spotifyGenres, [], 20);

        // Strategy B: Artist seeds only (in case genre seeds are bad)
        if ((!recommendations.tracks || recommendations.tracks.length === 0) && seedArtistIds.length > 0) {
            console.log("Discovery Stage B: Artist Seeds Only");
            recommendations = await fetcher.getRecommendations(seedArtistIds, [], [], 20);
        }

        // Strategy C: Genre seeds only (in case artist IDs are invalid/not found)
        if ((!recommendations.tracks || recommendations.tracks.length === 0) && spotifyGenres.length > 0) {
            console.log("Discovery Stage C: Genre Seeds Only");
            recommendations = await fetcher.getRecommendations([], spotifyGenres, [], 20);
        }

        // Strategy D: Direct search fallback
        if ((!recommendations.tracks || recommendations.tracks.length === 0)) {
            const query = topGenres[0] || "popular";
            console.log("Discovery Stage D: Broad Search Fallback for:", query);
            const fallbackArtists = await fetcher.searchArtists(query, 10);
            recommendations = {
                tracks: fallbackArtists.map((a: any) => ({
                    id: "fallback",
                    title: "Unknown",
                    artist: a.name,
                    artistId: a.id,
                    thumbnail: a.image,
                    url: a.url
                }))
            };
        }

        console.log(`Found ${recommendations.tracks?.length || 0} candidate tracks`);

        // 4. Extract unique artists from recommended tracks
        const recommendedArtistsMap = new Map();
        (recommendations.tracks || []).forEach((t: any) => {
            if (t.artistId && !recommendedArtistsMap.has(t.artistId)) {
                recommendedArtistsMap.set(t.artistId, {
                    id: t.artistId,
                    name: t.artist,
                    image: t.thumbnail,
                    url: t.url
                });
            }
        });

        // 4.5 Fetch Artist Details (for genres)
        const uniqueArtistIds = Array.from(recommendedArtistsMap.keys());
        const artistDetails = await fetcher.getArtists(uniqueArtistIds);
        const artistDetailsMap = new Map((artistDetails || []).map((a: any) => [a.id, a]));

        // Exclude already synced artists
        const syncedArtistIds = new Set(recentTracks.map((t: any) => t.artistId));
        const filteredArtists = Array.from(recommendedArtistsMap.values())
            .filter(a => !syncedArtistIds.has(a.id))
            .slice(0, 8); // Keep a good batch

        console.log(`Filtered to ${filteredArtists.length} unique suggested artists`);

        // 5. Enrich artists with DNA match (like search route)
        const enrichedArtists = await Promise.all(filteredArtists.map(async (artist: any) => {
            try {
                const details: any = artistDetailsMap.get(artist.id);
                const genres = details?.genres || [];

                const top = await fetcher.getArtistTopTracks(artist.id);
                const tracks = top.tracks?.slice(0, 5) || [];
                const trackIds = tracks.map(t => t.id);
                const features = await fetcher.getAudioFeatures(trackIds);

                // Use explicit artist genres to ensure high match fidelity even with 403s on features
                const artistDna = computeSpotifyVector(features, genres);

                let match = null;
                if (myDnaVector) {
                    match = matchScore({ vector: myDnaVector } as any, { vector: artistDna.vector } as any);
                }

                const colors = [
                    "from-blue-500 to-indigo-600",
                    "from-purple-500 to-pink-600",
                    "from-orange-500 to-red-600",
                    "from-amber-600 to-yellow-700",
                    "from-emerald-500 to-teal-600",
                ];
                const color = colors[artist.name.charCodeAt(0) % colors.length];

                return {
                    ...artist,
                    style: "Suggested Match",
                    bio: `Synthesized from your ${topGenres[0] || "musical"} DNA.`,
                    tags: topGenres.slice(0, 2),
                    listeners: "Neural Recommendation",
                    color,
                    match,
                    is_db: false,
                    preview: tracks.find(t => t.preview_url) || null
                };
            } catch (err) {
                console.error(`Failed to enrich artist ${artist.name}:`, err);
                return null;
            }
        }));

        const finalArtists = enrichedArtists.filter(Boolean);
        console.log(`Returning ${finalArtists.length} enriched artists`);

        // Sort by match score
        finalArtists.sort((a: any, b: any) => (b.match?.cosine_similarity || 0) - (a.match?.cosine_similarity || 0));

        return NextResponse.json({ success: true, artists: finalArtists });

    } catch (error: any) {
        console.error("Artist suggestion error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
