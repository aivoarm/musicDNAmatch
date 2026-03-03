import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const cookieStore = await cookies();
    const googleToken = cookieStore.get("google_access_token")?.value;

    if (!googleToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        let userId = "";
        const cachedUser = cookieStore.get("google_user")?.value;
        if (cachedUser) {
            userId = JSON.parse(cachedUser).sub;
        } else {
            // Fallback to fetch if cookie missing
            // Fetch user info from Google for the ID
            const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${googleToken}` },
            });
            if (!userRes.ok) return NextResponse.json({ error: "Google session expired" }, { status: 401 });
            const googleUser = await userRes.json();
            userId = googleUser.sub;
        }

        // 1. Get current user's DNA profile first
        const { data: userProfile, error: profileError } = await supabase
            .from("dna_profiles")
            .select("sonic_embedding, metadata")
            .eq("user_id", userId)
            .single();

        if (profileError || !userProfile) {
            return NextResponse.json({ error: "DNA Profile not found. Please broadcast first." }, { status: 404 });
        }

        // 2. Perform high-dimensional similarity search using pgvector
        const { data: matches, error: matchError } = await supabase.rpc('match_sonic_soulmates', {
            query_embedding: userProfile.sonic_embedding,
            match_threshold: 0.1, // Relaxed for prototype
            match_count: 5,
            caller_id: userId // Google ID is the ID our DB now uses
        });

        if (matchError) {
            console.error("Match RPC error:", matchError);
            const { data: fallbackMatches, error: fallbackError } = await supabase
                .from("dna_profiles")
                .select("*")
                .neq("user_id", userId)
                .limit(5);

            if (fallbackError) throw fallbackError;
            return NextResponse.json(fallbackMatches.map(m => ({ ...m, similarity: 0.8 })));
        }

        // 3. Return matches
        return NextResponse.json(matches);
    } catch (error) {
        console.error("Discovery Error:", error);
        return NextResponse.json({ error: "Failed to discover sonic soulmates" }, { status: 500 });
    }
}
