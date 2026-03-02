import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get("spotify_access_token")?.value;

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { targetUserId } = await request.json();

        // 1. Get current user's Spotify ID
        const userRes = await fetch("https://api.spotify.com/v1/me", {
            headers: { Authorization: `Bearer ${token}` },
        });
        const senderData = await userRes.json();

        // 2. Create the bridge in Supabase
        const { data: bridge, error: bridgeError } = await supabase
            .from("bridges")
            .insert({
                user_a: senderData.id,
                user_b: targetUserId,
                common_ground_data: {
                    playlist_suggestion: [], // Placeholder for future synthesis
                    status: "preview"
                }
            })
            .select()
            .single();

        if (bridgeError) throw bridgeError;

        return NextResponse.json(bridge);
    } catch (error) {
        console.error("Bridge Creation Error:", error);
        return NextResponse.json({ error: "Failed to create bridge" }, { status: 500 });
    }
}
