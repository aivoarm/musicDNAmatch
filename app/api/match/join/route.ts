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
        // Fetch user info from Google for the ID
        const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${googleToken}` },
        });

        if (!userRes.ok) return NextResponse.json({ error: "Google session expired" }, { status: 401 });

        const googleUser = await userRes.json();
        const userId = googleUser.sub;
        // 1. Parse request body
        const { targetId, email } = await request.json();

        if (!targetId || !email) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 2. Upsert match interest record
        const { error: matchError } = await supabase
            .from("match_interests")
            .upsert({
                user_id: userId, // Google ID
                target_id: targetId,
                email: email
            }, {
                onConflict: 'user_id,target_id'
            });

        if (matchError) throw matchError;

        return NextResponse.json({ success: true, message: "Interest registered" });
    } catch (error) {
        console.error("Match Interest Error:", error);
        return NextResponse.json({ error: "Failed to create connection request" }, { status: 500 });
    }
}
