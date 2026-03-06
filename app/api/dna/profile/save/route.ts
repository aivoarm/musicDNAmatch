import { supabase, toUUID } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { displayName, email, genres, bio, broadcasting } = body;

        const cookieStore = await cookies();
        const guestId = cookieStore.get("guest_id")?.value;

        if (!guestId) {
            return NextResponse.json({ error: "No guest session found" }, { status: 401 });
        }

        const userId = toUUID(guestId);

        // Update profile in dna_profiles
        const { error } = await supabase
            .from("dna_profiles")
            .update({
                metadata: {
                    display_name: displayName,
                    email: email,
                    top_genres: genres,
                    narrative: bio,
                },
                broadcasting: broadcasting
            })
            .eq("user_id", userId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Profile Save Error:", error);
        return NextResponse.json({ error: error.message || "Failed to save profile" }, { status: 500 });
    }
}
