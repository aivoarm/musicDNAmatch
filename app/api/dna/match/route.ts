import { supabase, toUUID } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { calculateCoherence } from "@/lib/dna";

function extractCoherence(meta: any): number {
    const confidence = meta?.confidence || [];
    // Use vector from metadata if available, else default
    const vector = meta?.vector || meta?.sonic_embedding || [];
    if (vector.length === 12) {
        return calculateCoherence(vector, confidence);
    }
    // Fallback: estimate from confidence array average
    if (confidence.length > 0) {
        const avg = confidence.reduce((s: number, v: number) => s + v, 0) / confidence.length;
        return Math.min(1, avg);
    }
    return 0.5;
}

export async function GET() {
    const cookieStore = await cookies();
    const guestId = cookieStore.get("guest_id")?.value;

    try {
        if (!guestId) {
            const { data: publicProfiles } = await supabase.from("dna_profiles").select("*").limit(10);
            return NextResponse.json((publicProfiles || []).map(m => ({ ...m, similarity: 0.75, coherence: extractCoherence(m.metadata), city: m.metadata?.city || null })));
        }

        const userId = toUUID(guestId);


        // 1. Get current user's DNA profile
        const { data: userProfile, error: profileError } = await supabase
            .from("dna_profiles")
            .select("sonic_embedding, metadata")
            .eq("user_id", userId)
            .single();

        if (profileError || !userProfile) {
            const { data: publicProfiles } = await supabase.from("dna_profiles").select("*").neq("user_id", userId).limit(10);
            return NextResponse.json((publicProfiles || []).filter((p: any) => p.user_id !== userId).map(m => ({ ...m, similarity: 0.7, coherence: extractCoherence(m.metadata), city: m.metadata?.city || null })));
        }

        // 2. Match
        const { data: matches, error: matchError } = await supabase.rpc('match_sonic_soulmates_v2', {
            query_embedding: userProfile.sonic_embedding,
            match_threshold: 0.01,
            match_count: 10,
            caller_id: userId
        });

        // 3. Fetch user's interests, incoming signals, and active bridges to enrich results
        const [{ data: userInterests }, { data: incomingSignals }, { data: userBridges }] = await Promise.all([
            supabase.from("match_interests").select("target_id").eq("user_id", userId),
            supabase.from("match_interests").select("user_id").eq("target_id", userId),
            supabase.from("bridges").select("id, user_a, user_b").or(`user_a.eq.${userId},user_b.eq.${userId}`)
        ]);

        const interestIds = new Set((userInterests || []).map(i => i.target_id));
        const incomingSignalIds = new Set((incomingSignals || []).map(s => s.user_id));
        const bridgeMap = new Map();
        (userBridges || []).forEach(b => {
            const partnerId = b.user_a === userId ? b.user_b : b.user_a;
            bridgeMap.set(partnerId, b.id);
        });

        const myName = String(userProfile.metadata?.display_name || "Anonymous Signal").toLowerCase().trim();
        const seenNames = new Set<string>();
        // Add our own name to seen list to prevent matching with our orphan accounts, but don't filter out anonymous users
        if (myName && myName !== "anonymous signal") {
            seenNames.add(myName);
        }

        const filteredMatches = [];
        for (const m of (matches || [])) {
            const mName = String(m.metadata?.display_name || "Anonymous Signal").toLowerCase().trim();
            if (seenNames.has(mName) && mName !== "anonymous signal") continue;
            seenNames.add(mName);
            filteredMatches.push(m);
        }

        // 4. Enrich existing matches
        let enrichedMatches = filteredMatches.map((m: any) => ({
            ...m,
            has_signal: interestIds.has(m.user_id),
            incoming_signal: incomingSignalIds.has(m.user_id),
            bridge_id: bridgeMap.get(m.user_id),
            is_mutual: bridgeMap.has(m.user_id),
            coherence: extractCoherence(m.metadata),
            city: m.metadata?.city || null,
        }));

        // 5. Check if any incoming senders are missing from the top matches
        const existingIds = new Set(enrichedMatches.map((m: any) => m.user_id));
        const missingIds = Array.from(incomingSignalIds).filter(sid => !existingIds.has(sid));

        if (missingIds.length > 0) {
            const { data: missingProfiles } = await supabase
                .from("dna_profiles")
                .select("*")
                .in("user_id", missingIds);

            if (missingProfiles) {
                const manualMatches = missingProfiles.map(p => ({
                    ...p,
                    similarity: 0.65, // Default for non-top matches who sent a signal
                    has_signal: interestIds.has(p.user_id),
                    incoming_signal: true,
                    bridge_id: bridgeMap.get(p.user_id),
                    is_mutual: bridgeMap.has(p.user_id),
                    coherence: extractCoherence((p as any).metadata),
                    city: (p as any).metadata?.city || null,
                }));
                enrichedMatches = [...enrichedMatches, ...manualMatches];
            }
        }

        // 6. Sort by: 1) Incoming Signal (active) 2) Similarity (descending)
        enrichedMatches.sort((a: any, b: any) => {
            if (a.incoming_signal && !b.incoming_signal) return -1;
            if (!a.incoming_signal && b.incoming_signal) return 1;
            return (b.similarity ?? 0) - (a.similarity ?? 0);
        });

        // 6.5 Filter out the current user from appearing in their own soulmates
        enrichedMatches = enrichedMatches.filter((m: any) => m.user_id !== userId);


        return NextResponse.json(enrichedMatches);
    } catch (error) {
        console.error("Discovery Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
