export const runtime = "edge";
import { supabase, toUUID } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { matchScore } from "@/lib/dna";


// Fetch all artists with their sonic embeddings, then sort by match score if caller has DNA
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q") || "";
        const genre = searchParams.get("genre") || "";
        const limit = parseInt(searchParams.get("limit") || "10");
        const offset = parseInt(searchParams.get("offset") || "0");

        const registeredOnly = searchParams.get("registered") === "true";

        let dbQuery = supabase
            .from("artists")
            .select('*');

        if (registeredOnly) dbQuery = dbQuery.not("user_id", "is", null);

        if (query) dbQuery = dbQuery.ilike("name", `%${query}%`);
        if (genre) {
            // Filter by style OR check if genre exists in tags or genres JSONB arrays
            dbQuery = dbQuery.or(`style.ilike.%${genre}%,tags.cs.["${genre}"],genres.cs.["${genre}"]`);
        }

        const { data: artists, error } = await dbQuery;

        if (error) {
            console.error("Fetch artists error detailed:", error);
            return NextResponse.json({ success: false, error: error.message, artists: [] });
        }

        // Try to get user's DNA if they are logged in
        const cookieStore = await cookies();
        const guestId = cookieStore.get("guest_id")?.value;
        let myDnaVector = null;

        if (guestId) {
            const userId = toUUID(guestId);
            const { data: myProfile } = await supabase
                .from("dna_profiles")
                .select("sonic_embedding")
                .eq("user_id", userId)
                .single();
            if (myProfile?.sonic_embedding) {
                let vector = myProfile.sonic_embedding;
                if (typeof vector === 'string') {
                    try { vector = vector.replace(/[\[\]]/g, '').split(',').map(Number); } catch (e) { }
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

        // Format real artists
        const dbArtistsEnriched = (artists || []).map((artist: any) => {
            const dnaMeta = Array.isArray(artist.dna_profiles) ? artist.dna_profiles[0] : artist.dna_profiles;

            let match = null;
            if (myDnaVector && dnaMeta?.sonic_embedding) {
                let vector = dnaMeta.sonic_embedding;
                if (typeof vector === 'string') {
                    try { vector = vector.replace(/[\[\]]/g, '').split(',').map(Number); } catch (e) { }
                }
                if (Array.isArray(vector) && vector.length === 12) {
                    match = matchScore({ vector: myDnaVector } as any, { vector } as any);
                }
            }

            const charCode = artist.name.charCodeAt(0) || 0;
            const color = colors[charCode % colors.length];

            // Robust parsing for tags/genres if they come in as JSON strings
            let tags = artist.tags || [];
            if (typeof tags === 'string') try { tags = JSON.parse(tags); } catch (e) { }

            let genres = artist.genres || [];
            if (typeof genres === 'string') try { genres = JSON.parse(genres); } catch (e) { }

            return {
                id: artist.id,
                user_id: artist.user_id,
                name: artist.name,
                style: artist.style || "Experimental Signal",
                bio: artist.bio,
                tags: Array.isArray(tags) ? tags : [],
                genres: Array.isArray(genres) ? genres : [],
                spotify_url: artist.spotify_url,
                youtube_url: artist.youtube_url,
                image: artist.image_url,
                preview: artist.preview_url ? { preview_url: artist.preview_url } : null,
                verified: artist.verified,
                is_db: true,
                listeners: artist.verified ? "Verified Signal" : "Authenticating...",
                color,
                match,
                sonic_embedding: dnaMeta?.sonic_embedding || null
            };
        });

        // Sort by match if available
        if (myDnaVector) {
            dbArtistsEnriched.sort((a, b) => (b.match?.cosine_similarity || 0) - (a.match?.cosine_similarity || 0));
        }

        const paginatedArtists = dbArtistsEnriched.slice(offset, offset + limit);
        const hasMore = dbArtistsEnriched.length > offset + limit;

        return NextResponse.json({
            success: true,
            artists: paginatedArtists,
            total: dbArtistsEnriched.length,
            hasMore
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create an artist profile for the current user
export async function POST(req: Request) {
    try {
        const body = await req.json() as any;
        const cookieStore = await cookies();
        const guestId = cookieStore.get("guest_id")?.value;
        if (!guestId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const userId = toUUID(guestId);

        // Make sure user has a DNA profile first
        const { data: myProfile } = await supabase.from("dna_profiles").select("id").eq("user_id", userId).single();
        if (!myProfile) return NextResponse.json({ error: "Must generate DNA first" }, { status: 400 });

        const { data: artist, error } = await supabase
            .from("artists")
            .upsert({
                user_id: userId,
                name: body.name,
                style: body.style,
                bio: body.bio,
                tags: body.tags || [],
                spotify_url: body.spotify_url,
                youtube_url: body.youtube_url,
                image_url: body.image_url,
                preview_url: body.preview_url,
                verification_email: body.verification_email
            }, { onConflict: "user_id" })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, artist });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
