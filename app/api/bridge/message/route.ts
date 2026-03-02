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
        const { bridgeId, content } = await request.json();

        // 1. Get current user's Spotify ID
        const userRes = await fetch("https://api.spotify.com/v1/me", {
            headers: { Authorization: `Bearer ${token}` },
        });
        const senderData = await userRes.json();

        // 2. Insert message
        const { data: message, error } = await supabase
            .from("bridge_messages")
            .insert({
                bridge_id: bridgeId,
                sender_id: senderData.id,
                content: content
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(message);
    } catch (error) {
        console.error("Message Error:", error);
        return NextResponse.json({ error: "Failed to transmit message" }, { status: 500 });
    }
}
