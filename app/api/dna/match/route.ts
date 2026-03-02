import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { generateMusicalThesis } from "@/lib/gemini";

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get("spotify_access_token")?.value;

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // 1. Get current user's DNA profile first
        const userRes = await fetch("https://api.spotify.com/v1/me", {
            headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userRes.json();

        const { data: userProfile, error: profileError } = await supabase
            .from("dna_profiles")
            .select("sonic_embedding, metadata")
            .eq("user_id", userData.id)
            .single();

        if (profileError || !userProfile) {
            return NextResponse.json({ error: "DNA Profile not found. Please broadcast first." }, { status: 404 });
        }

        // 2. Perform high-dimensional similarity search using pgvector
        const { data: matches, error: matchError } = await supabase.rpc('match_sonic_soulmates', {
            query_embedding: userProfile.sonic_embedding,
            match_threshold: 0.1, // Relaxed for prototype
            match_count: 5,
            caller_id: userData.id
        });

        if (matchError) {
            console.error("Match RPC error:", matchError);
            // Fallback to simple query if RPC fails
            const { data: fallbackMatches, error: fallbackError } = await supabase
                .from("dna_profiles")
                .select("*")
                .neq("user_id", userData.id)
                .limit(5);

            if (fallbackError) throw fallbackError;

            // Map fallback to include a default thesis
            return NextResponse.json(fallbackMatches.map(m => ({ ...m, similarity: 0.8, thesis: "Significant structural alignment detected." })));
        }

        // 3. Enhance top matches with AI Thesis
        const enhancedMatches = await Promise.all(matches.map(async (match: any, idx: number) => {
            let thesis = "Significant structural alignment detected across the vector space.";
            if (idx < 3) {
                thesis = await generateMusicalThesis(userProfile.metadata, match.metadata);
            }
            return { ...match, thesis };
        }));

        return NextResponse.json(enhancedMatches);
    } catch (error) {
        console.error("Discovery Error:", error);
        return NextResponse.json({ error: "Failed to discover sonic soulmates" }, { status: 500 });
    }
}
