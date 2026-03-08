// app/api/auth/link-profile/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

interface LinkProfileRequest {
    authUserId: string;
    email: string;
    guestId?: string;
}

export async function POST(req: Request) {
    try {
        const { authUserId, email, guestId } = await req.json() as LinkProfileRequest;

        if (!authUserId || !email) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const storageEmail = email.trim().toUpperCase();

        // 1. Check if a profile already exists for this verified email
        const { data: profileByEmail } = await supabaseAdmin
            .from("dna_profiles")
            .select("id, user_id, auth_user_id")
            .ilike("email", storageEmail)
            .maybeSingle();

        if (profileByEmail) {
            // Update existing user with new WorkOS ID and activate broadcasting
            const { data: updated, error: updateError } = await supabaseAdmin
                .from("dna_profiles")
                .update({
                    auth_user_id: authUserId,
                    email: storageEmail,
                    broadcasting: true
                })
                .eq("id", profileByEmail.id)
                .select()
                .maybeSingle();

            if (updateError) throw updateError;
            if (!updated) throw new Error("Update failed — no data returned");

            return NextResponse.json({
                success: true,
                guestId: updated.user_id,
                linked: true
            });
        }

        // 2. If no email match, link current guestId (newly verified user)
        if (guestId) {
            const { data: profileByGuest, error: guestLinkError } = await supabaseAdmin
                .from("dna_profiles")
                .update({
                    email: storageEmail,
                    auth_user_id: authUserId,
                    broadcasting: true
                })
                .eq("user_id", guestId)
                .select()
                .maybeSingle();

            if (guestLinkError) throw guestLinkError;

            if (profileByGuest) {
                return NextResponse.json({
                    success: true,
                    guestId: profileByGuest.user_id,
                    linked: true
                });
            }
        }

        return NextResponse.json({ success: true, linked: false });
    } catch (error: any) {
        console.error("Link Profile API Error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}