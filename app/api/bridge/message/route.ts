import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import crypto from 'node:crypto';

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const googleToken = cookieStore.get("google_access_token")?.value;

    if (!googleToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { bridgeId, content } = await request.json();
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

        // 2. Insert message
        const { data: message, error } = await supabase
            .from("bridge_messages")
            .insert({
                id: crypto.randomUUID(),
                bridge_id: bridgeId,
                sender_id: userId,
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
