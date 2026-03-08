export const runtime = "edge";
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
        const { bridgeId } = await request.json() as any;
        let userId = "";

        const cachedUser = cookieStore.get("google_user")?.value;
        if (cachedUser) {
            userId = JSON.parse(cachedUser).sub;
        } else {
            const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${googleToken}` },
            });
            const googleUser = await userRes.json() as any;
            userId = googleUser.sub;
        }

        // 1. Fetch Bridge Data
        const { data: bridge, error: bridgeError } = await supabase
            .from("bridges")
            .select("*")
            .eq("id", bridgeId)
            .single();

        if (bridgeError || !bridge) throw new Error("Bridge not found");

        // Finalize Bridge Status with a placeholder for now
        // YouTube API doesn't have a simple 1:1 for "Create and add tracks" without more scope (youtube.force-ssl)
        await supabase
            .from("bridges")
            .update({
                common_ground_data: {
                    ...bridge.common_ground_data,
                    status: "merged",
                    playlist_url: `https://youtube.com?dna_bridge=${bridgeId}` // Placeholder
                }
            })
            .eq("id", bridgeId);

        return NextResponse.json({ url: `https://youtube.com?dna_bridge=${bridgeId}` });
    } catch (error) {
        console.error("Merge Error:", error);
        return NextResponse.json({ error: "Failed to finalize merge" }, { status: 500 });
    }
}
