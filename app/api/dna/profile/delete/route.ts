export const runtime = "nodejs";
import { supabaseAdmin, toUUID } from "@/lib/supabase";
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

        let profile: any = null;

        // Search by guestId primarily
        if (guestId) {
            const userId = toUUID(guestId);
            const { data } = await supabaseAdmin
                .from("dna_profiles")
                .select("auth_user_id, email, user_id")
                .eq("user_id", userId)
                .maybeSingle();
            profile = data;
        }

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        const actualGuestId = profile.user_id;

        // 1. Delete match interests (both directions) using admin client
        await supabaseAdmin.from("match_interests").delete().or(`user_id.eq.${actualGuestId},target_id.eq.${actualGuestId}`);

        // 2. Find and delete bridges (bridge_messages CASCADE by DB)
        await supabaseAdmin.from("bridges").delete().or(`user_a.eq.${actualGuestId},user_b.eq.${actualGuestId}`);

        // 3. Delete DNA profile
        const { error: deleteError } = await supabaseAdmin
            .from("dna_profiles")
            .delete()
            .eq("user_id", actualGuestId);

        if (deleteError) throw deleteError;

        // 4. Delete from WorkOS if linked and NOT admin
        const adminEmail = "AAYVAZY@GMAIL.COM";
        const emailToMatch = profile.email?.trim().toUpperCase();

        // Use the WorkOS ID from the profile record
        const workosIdToDelete = profile.auth_user_id;

        if (emailToMatch !== adminEmail) {
            if (workosIdToDelete) {
                try {
                    await workos.userManagement.deleteUser(workosIdToDelete);
                    console.log(`WorkOS user ${workosIdToDelete} deleted.`);
                } catch (workosErr: any) {
                    console.error("Failed to delete WorkOS user:", workosErr);
                }
            }

            if (emailToMatch) {
                try {
                    const { data: users } = await workos.userManagement.listUsers({ email: profile.email });
                    for (const u of (users || [])) {
                        if (u.id !== workosIdToDelete) {
                            await workos.userManagement.deleteUser(u.id);
                            console.log(`WorkOS user ${u.id} deleted via email search (${profile.email}).`);
                        }
                    }
                } catch (err) {
                    console.error("Email-based WorkOS deletion failed", err);
                }
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
