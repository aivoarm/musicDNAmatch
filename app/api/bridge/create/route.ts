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

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const googleToken = cookieStore.get("google_access_token")?.value;
    const guestId = cookieStore.get("guest_id")?.value;

    let userId = "";

    try {
        const { targetUserId } = await request.json();

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

        // 2. Create the bridge in Supabase
        const { data: bridge, error: bridgeError } = await supabase
            .from("bridges")
            .insert({
                user_a: userId,
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
