import { supabase, toUUID } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const cookieStore = await cookies();
    const guestId = cookieStore.get("guest_id")?.value;

    try {
        if (!guestId) {
            const { data: publicProfiles } = await supabase.from("dna_profiles").select("*").limit(10);
            return NextResponse.json((publicProfiles || []).map(m => ({ ...m, similarity: 0.75 })));
        }

        const userId = toUUID(guestId);


        // 1. Get current user's DNA profile
        const { data: userProfile, error: profileError } = await supabase
            .from("dna_profiles")
            .select("sonic_embedding")
            .eq("user_id", userId)
            .single();

        if (profileError || !userProfile) {
            const { data: publicProfiles } = await supabase.from("dna_profiles").select("*").neq("user_id", userId).limit(10);
            return NextResponse.json((publicProfiles || []).map(m => ({ ...m, similarity: 0.7 })));
        }

        // 2. Match
        const { data: matches, error: matchError } = await supabase.rpc('match_sonic_soulmates_v2', {
            query_embedding: userProfile.sonic_embedding,
            match_threshold: 0.01,
            match_count: 10,
            caller_id: userId
        });

        // 3. Fetch user's interests and active bridges to enrich the match results
        const [{ data: userInterests }, { data: userBridges }] = await Promise.all([
            supabase.from("match_interests").select("target_id").eq("user_id", userId),
            supabase.from("bridges").select("id, user_a, user_b").or(`user_a.eq.${userId},user_b.eq.${userId}`)
        ]);

        const interestIds = new Set((userInterests || []).map(i => i.target_id));
        const bridgeMap = new Map();
        (userBridges || []).forEach(b => {
            const partnerId = b.user_a === userId ? b.user_b : b.user_a;
            bridgeMap.set(partnerId, b.id);
        });

        const enrichedMatches = (matches || []).map((m: any) => ({
            ...m,
            has_signal: interestIds.has(m.user_id),
            bridge_id: bridgeMap.get(m.user_id),
            is_mutual: bridgeMap.has(m.user_id)
        }));

        return NextResponse.json(enrichedMatches);
    } catch (error) {
        console.error("Discovery Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
