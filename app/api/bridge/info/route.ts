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

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const bridgeId = searchParams.get("bridgeId");

    if (!bridgeId) {
        return NextResponse.json({ error: "Missing bridgeId" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const googleToken = cookieStore.get("google_access_token")?.value;
    const guestId = cookieStore.get("guest_id")?.value;

    let userId = "";

    if (googleToken) {
        const cachedUser = cookieStore.get("google_user")?.value;
        if (cachedUser) {
            userId = toUUID(JSON.parse(cachedUser).sub);
        } else {
            const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${googleToken}` },
            });
            if (userRes.ok) {
                const googleUser = await userRes.json();
                userId = toUUID(googleUser.sub);
            }
        }
    }

    if (!userId && guestId) {
        userId = toUUID(guestId);
    }

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the bridge
    const { data: bridge, error } = await supabase
        .from("bridges")
        .select("*")
        .eq("id", bridgeId)
        .single();

    if (error || !bridge) {
        return NextResponse.json({ error: "Bridge not found" }, { status: 404 });
    }

    // Verify current user is a participant
    if (bridge.user_a !== userId && bridge.user_b !== userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const partnerId = bridge.user_a === userId ? bridge.user_b : bridge.user_a;

    // Get both users' emails from match_interests
    const { data: interests } = await supabase
        .from("match_interests")
        .select("user_id, email")
        .in("user_id", [userId, partnerId]);

    const myEmail = interests?.find((i: any) => i.user_id === userId)?.email || null;
    const partnerEmail = interests?.find((i: any) => i.user_id === partnerId)?.email || null;

    // Also try dna_profiles for display names
    const { data: profiles } = await supabase
        .from("dna_profiles")
        .select("user_id, display_name")
        .in("user_id", [userId, partnerId]);

    const myName = profiles?.find((p: any) => p.user_id === userId)?.display_name || null;
    const partnerName = profiles?.find((p: any) => p.user_id === partnerId)?.display_name || null;

    return NextResponse.json({
        bridgeId: bridge.id,
        createdAt: bridge.created_at,
        me: { userId, email: myEmail, name: myName },
        partner: { userId: partnerId, email: partnerEmail, name: partnerName },
    });
}
