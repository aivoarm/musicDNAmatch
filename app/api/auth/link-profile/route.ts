import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * POST /api/auth/link-profile
 * 
 * Links a guest DNA profile to a verified Supabase Auth user.
 * Called after successful magic link verification on the client side.
 * 
 * Body: { authUserId: string, email: string }
 * Returns: { success: boolean, guestId?: string }
 */
export async function POST(req: Request) {
    try {
        const { authUserId, email } = await req.json();

        if (!authUserId || !email) {
            return NextResponse.json(
                { error: "authUserId and email are required" },
                { status: 400 }
            );
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        // Find existing profile by email
        const { data: profile } = await supabaseAdmin
            .from("dna_profiles")
            .select("id, user_id, auth_user_id")
            .ilike("email", email.trim())
            .maybeSingle();

        if (profile) {
            // Link the auth user to this profile
            if (!profile.auth_user_id) {
                await supabaseAdmin
                    .from("dna_profiles")
                    .update({ auth_user_id: authUserId })
                    .eq("id", profile.id);
            }

            return NextResponse.json({
                success: true,
                guestId: profile.user_id,
                linked: true,
            });
        }

        // No profile found — user needs to create one
        return NextResponse.json({
            success: true,
            guestId: null,
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
