import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const googleToken = cookieStore.get("google_access_token")?.value;

    if (!googleToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { targetUserId } = await request.json();
        let userId = "";

        const cachedUser = cookieStore.get("google_user")?.value;
        if (cachedUser) {
            userId = JSON.parse(cachedUser).sub;
        } else {
            const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${googleToken}` },
            });
            const googleUser = await userRes.json();
            userId = googleUser.sub;
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
