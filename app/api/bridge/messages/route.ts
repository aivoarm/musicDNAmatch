export const runtime = "edge";
import { supabase, toUUID } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function getUserId(): Promise<string | null> {
    const cookieStore = await cookies();
    const googleToken = cookieStore.get("google_access_token")?.value;
    const guestId = cookieStore.get("guest_id")?.value;

    if (googleToken) {
        const cachedUser = cookieStore.get("google_user")?.value;
        if (cachedUser) return toUUID(JSON.parse(cachedUser).sub);
        const r = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${googleToken}` },
        });
        if (r.ok) {
            const u = await r.json() as any;
            return toUUID(u.sub);
        }
    }
    if (guestId) return toUUID(guestId);
    return null;
}

/**
 * GET /api/bridge/messages?bridgeId=xxx
 * Returns messages for a bridge (the caller must be a participant).
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const bridgeId = searchParams.get("bridgeId");
    if (!bridgeId) return NextResponse.json({ error: "Missing bridgeId" }, { status: 400 });

    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Verify user is participant
    const { data: bridge } = await supabase
        .from("bridges")
        .select("user_a, user_b")
        .eq("id", bridgeId)
        .single();

    if (!bridge || (bridge.user_a !== userId && bridge.user_b !== userId)) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const { data: messages, error } = await supabase
        .from("bridge_messages")
        .select("id, sender_id, content, created_at")
        .eq("bridge_id", bridgeId)
        .order("created_at", { ascending: true })
        .limit(100);

    if (error) return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    return NextResponse.json({ messages: messages || [] });
}

/**
 * POST /api/bridge/messages
 * Body: { bridgeId, content }
 * Sends a message on a bridge (the caller must be a participant).
 */
export async function POST(request: Request) {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bridgeId, content } = await request.json() as any;
    if (!bridgeId || !content?.trim()) {
        return NextResponse.json({ error: "Missing bridgeId or content" }, { status: 400 });
    }

    // Verify user is participant
    const { data: bridge } = await supabase
        .from("bridges")
        .select("user_a, user_b")
        .eq("id", bridgeId)
        .single();

    if (!bridge || (bridge.user_a !== userId && bridge.user_b !== userId)) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const { data: message, error } = await supabase
        .from("bridge_messages")
        .insert({ bridge_id: bridgeId, sender_id: userId, content: content.trim() })
        .select()
        .single();

    if (error) {
        console.error("Bridge message send error:", error);
        return NextResponse.json({ error: "Failed to send" }, { status: 500 });
    }

    return NextResponse.json(message);
}
