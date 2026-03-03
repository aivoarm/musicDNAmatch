import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const googleToken = cookieStore.get("google_access_token")?.value;

    if (!googleToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { bridgeId } = await request.json();

        // 1. Get bridge details and profiles
        const { data: bridge, error: bridgeError } = await supabase
            .from("bridges")
            .select(`
                *,
                user_a_profile:dna_profiles!bridges_user_a_fkey(sonic_embedding, metadata),
                user_b_profile:dna_profiles!bridges_user_b_fkey(sonic_embedding, metadata)
            `)
            .eq("id", bridgeId)
            .single();

        if (bridgeError || !bridge) return NextResponse.json({ error: "Bridge not found" }, { status: 404 });

        const profileA = bridge.user_a_profile as any;
        const profileB = bridge.user_b_profile as any;

        if (!profileA || !profileB) return NextResponse.json({ error: "Profiles missing" }, { status: 400 });

        // 2. Calculate Midpoint Vector (Systematic Intersection)
        // sonic_embedding is likely stored as a string "[0.1, 0.2, ...]" or an array
        const parseVector = (v: any) => typeof v === 'string' ? JSON.parse(v) : v;
        const vecA = parseVector(profileA.sonic_embedding);
        const vecB = parseVector(profileB.sonic_embedding);

        const midpoint = vecA.map((val: number, i: number) => (val + vecB[i]) / 2);

        // 3. Define the vibe based on the vectors
        // Just as a placeholder for now, we can use a basic "Discovery" concept
        const synthesis = {
            name: `${profileA.metadata.display_name.split(' ')[0]} x ${profileB.metadata.display_name.split(' ')[0]} Fusion`,
            description: "A calculated intersection of two distinct sonic signals. This frequency bridge represents the geometric center of your shared musical discovery signatures.",
            midpoint,
            vibe: ["Spectral Fusion", "Transient Balance", "Geometric Sync"],
            tracks: [
                { title: "Frequency Intersection", artist: "Discovery Signal 01", duration: "4:12" },
                { title: "Euclidean Connection", artist: "Discovery Signal 02", duration: "3:45" },
                { title: "Midpoint Resonance", artist: "Discovery Signal 03", duration: "5:01" }
            ]
        };

        // 4. Update the bridge
        const updatedData = {
            ...bridge.common_ground_data,
            synthesis,
            status: "synthesized"
        };

        await supabase
            .from("bridges")
            .update({ common_ground_data: updatedData })
            .eq("id", bridgeId);

        return NextResponse.json(synthesis);
    } catch (error) {
        console.error("Synthesis Error:", error);
        return NextResponse.json({ error: "Focus error" }, { status: 500 });
    }
}
