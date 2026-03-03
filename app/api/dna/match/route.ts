import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createHash } from "crypto";

function toUUID(str: string): string {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(str)) return str;
    const hash = createHash('sha256').update(str).digest('hex');
    return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

export async function GET() {
    const cookieStore = await cookies();
    const googleToken = cookieStore.get("google_access_token")?.value;
    const guestId = cookieStore.get("guest_id")?.value;

    try {
        let rawUserId = "";

        if (googleToken) {
            const cachedUser = cookieStore.get("google_user")?.value;
            if (cachedUser) {
                rawUserId = JSON.parse(cachedUser).sub;
            } else {
                const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                    headers: { Authorization: `Bearer ${googleToken}` },
                });
                if (userRes.ok) {
                    const googleUser = await userRes.json();
                    rawUserId = googleUser.sub;
                }
            }
        } else if (guestId) {
            rawUserId = guestId;
        }

        // If still no user ID, return public feed
        if (!rawUserId) {
            const { data: publicProfiles } = await supabase.from("dna_profiles").select("*").limit(10);
            return NextResponse.json((publicProfiles || []).map(m => ({ ...m, similarity: 0.75 })));
        }

        const userId = toUUID(rawUserId);

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
        const { data: matches, error: matchError } = await supabase.rpc('match_sonic_soulmates', {
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
