export const runtime = "edge";
import { supabase, toUUID } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const cookieStore = await cookies();
        const guestId = cookieStore.get("guest_id")?.value;

        if (!guestId) {
            return NextResponse.json({ error: "No session found" }, { status: 401 });
        }

        const userId = toUUID(guestId);

        // 1. Delete match interests (both directions)
        await supabase.from("match_interests").delete().or(`user_id.eq.${guestId},target_id.eq.${guestId}`);

        // 2. Find and delete bridges (bridge_messages CASCADE by DB)
        // Note: Based on setup.sql, bridges uses TEXT for user_a/user_b which matches guestId string
        await supabase.from("bridges").delete().or(`user_a.eq.${guestId},user_b.eq.${guestId}`);

        // 3. Delete DNA profile
        const { error } = await supabase
            .from("dna_profiles")
            .delete()
            .eq("user_id", userId);

        if (error) throw error;

        // 4. Clear cookies
        const response = NextResponse.json({ success: true });
        response.cookies.delete("guest_id");
        response.cookies.delete("has_dna");
        response.cookies.delete("profile_id");

        return response;
    } catch (error: any) {
        console.error("Delete Profile Error:", error);
        return NextResponse.json({ error: error.message || "Failed to delete profile" }, { status: 500 });
    }
}
