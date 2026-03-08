export const runtime = "edge";
import { supabase, toUUID } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const cookieStore = await cookies();
    const guestId = cookieStore.get("guest_id")?.value;

    if (!guestId) {
        return NextResponse.json({ error: "No guest session" }, { status: 401 });
    }

    const userId = toUUID(guestId);

    try {
        const { data: profile } = await supabase
            .from("dna_profiles")
            .select("metadata, email")
            .eq("user_id", userId)
            .single();

        if (!profile) {
            return NextResponse.json({ id: userId, display_name: "Anonymous Signal" });
        }

        const meta = profile.metadata || {};
        const finalEmail = profile.email || meta.email || null;
        let finalDisplayName = meta.display_name || "Anonymous Signal";

        if (finalDisplayName === "Anonymous Signal" && finalEmail) {
            finalDisplayName = finalEmail.split('@')[0].toUpperCase();
        }

        return NextResponse.json({
            id: userId,
            display_name: finalDisplayName,
            email: finalEmail,
        });
    } catch (err) {
        console.error("Auth Me Error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

