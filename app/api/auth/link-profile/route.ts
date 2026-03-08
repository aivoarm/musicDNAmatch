import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * POST /api/auth/link-profile
 * 
 * Links a guest DNA profile to a verified auth user.
 * Called after successful WorkOS AuthKit verification.
 * 
 * Body: { authUserId: string, email: string }
 * Returns: { success: boolean, guestId?: string }
 */
export async function POST(req: Request) {
    try {
        const { authUserId, email, guestId } = await req.json();

        if (!authUserId || !email) {
            return NextResponse.json(
                { error: "authUserId and email are required" },
                { status: 400 }
            );
        }

        const cleanEmail = email.trim().toLowerCase();

        // 1. Try to find existing profile by email
        const { data: profileByEmail } = await supabase
            .from("dna_profiles")
            .select("id, user_id, auth_user_id, email")
            .ilike("email", cleanEmail)
            .maybeSingle();

        if (profileByEmail) {
            // Link the auth user to this profile if not already linked
            if (!profileByEmail.auth_user_id) {
                await supabase
                    .from("dna_profiles")
                    .update({ auth_user_id: authUserId })
                    .eq("id", profileByEmail.id);
            }

            return NextResponse.json({
                success: true,
                guestId: profileByEmail.user_id,
                linked: true,
            });
        }

        // 2. No profile by email — try finding by guestId (new verification flow)
        if (guestId) {
            const { data: profileByGuest } = await supabase
                .from("dna_profiles")
                .select("id, user_id, auth_user_id, email")
                .eq("user_id", guestId)
                .maybeSingle();

            if (profileByGuest) {
                // Link this anonymous profile to the verified email and auth_user_id
                await supabase
                    .from("dna_profiles")
                    .update({
                        email: cleanEmail,
                        auth_user_id: authUserId
                    })
                    .eq("id", profileByGuest.id);

                return NextResponse.json({
                    success: true,
                    guestId: profileByGuest.user_id,
                    linked: true,
                });
            }
        }

        // 3. Still no profile found — user needs to create one OR they verified an email that has no profile yet
        return NextResponse.json({
            success: true,
            guestId: guestId || null,
            linked: false,
        });
    } catch (error: any) {
        console.error("Link Profile Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to link profile" },
            { status: 500 }
        );
    }
}
