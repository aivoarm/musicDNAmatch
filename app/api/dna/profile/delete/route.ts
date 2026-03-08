export const runtime = "nodejs"; // Changed to nodejs for WorkOS SDK compatibility
import { supabase, toUUID } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { workos } from "@/lib/workos";

export async function POST() {
    try {
        const cookieStore = await cookies();
        const guestId = cookieStore.get("guest_id")?.value;

        if (!guestId) {
            return NextResponse.json({ error: "No session found" }, { status: 401 });
        }

        const userId = toUUID(guestId);

        // 0. Get auth info before deletion
        const { data: profile } = await supabase
            .from("dna_profiles")
            .select("auth_user_id, email")
            .eq("user_id", userId)
            .maybeSingle();

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

        // 4. Delete from WorkOS if linked and NOT admin
        const adminEmail = "AAYVAZY@GMAIL.COM";
        if (profile?.auth_user_id && profile.email?.toUpperCase() !== adminEmail) {
            try {
                await workos.userManagement.deleteUser(profile.auth_user_id);
                console.log(`WorkOS user ${profile.auth_user_id} deleted.`);
            } catch (workosErr) {
                console.error("Failed to delete WorkOS user:", workosErr);
                // We don't throw here to ensure local state is cleared anyway
            }
        }

        // 5. Clear cookies
        const response = NextResponse.json({ success: true });
        response.cookies.delete("guest_id");
        response.cookies.delete("has_dna");
        response.cookies.delete("profile_id");
        response.cookies.delete("auth_email");

        return response;
    } catch (error: any) {
        console.error("Delete Profile Error:", error);
        return NextResponse.json({ error: error.message || "Failed to delete profile" }, { status: 500 });
    }
}
