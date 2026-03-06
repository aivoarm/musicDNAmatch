import { supabase, toUUID } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { intent } = body;

        const cookieStore = await cookies();
        const googleToken = cookieStore.get("google_access_token")?.value;
        const cachedUser = cookieStore.get("google_user")?.value;

        let rawUserId = "";

        if (googleToken) {
            if (cachedUser) {
                const user = JSON.parse(cachedUser);
                rawUserId = user.sub;
            } else {
                const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                    headers: { Authorization: `Bearer ${googleToken}` },
                });
                if (userRes.ok) {
                    const googleUser = await userRes.json();
                    rawUserId = googleUser.sub;
                }
            }
        }

        if (!rawUserId) {
            rawUserId = cookieStore.get("guest_id")?.value || "";
        }

        if (!rawUserId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = toUUID(rawUserId);

        // Fetch user profile first to get existing metadata
        const { data: profile, error } = await supabase
            .from("dna_profiles")
            .select("metadata")
            .eq("user_id", userId)
            .single();

        if (error || !profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        const newMetadata = {
            ...profile.metadata,
            intent,
            intent_timestamp: new Date().toISOString()
        };

        const { error: updateError } = await supabase
            .from("dna_profiles")
            .update({ metadata: newMetadata })
            .eq("user_id", userId);

        if (updateError) throw updateError;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Save Intent Error:", error);
        return NextResponse.json({
            error: error.message || "Failed to save intent"
        }, { status: 500 });
    }
}
