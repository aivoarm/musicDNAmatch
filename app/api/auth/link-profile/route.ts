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
        console.log("Link Profile Request:", { authUserId, email, guestId });

        if (!authUserId || !email) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const storageEmail = email.trim().toUpperCase();

        // 🔍 Strategy A: Search by verified email
        const { data: byEmail, error: errA } = await supabaseAdmin
            .from("dna_profiles")
            .select("id, user_id, auth_user_id, email")
            .ilike("email", storageEmail);

        if (errA) console.error("Search by email error:", errA);

        // 🔍 Strategy B: Search by guest identifier (user_id field)
        const { data: byGuest, error: errB } = guestId
            ? await supabaseAdmin.from("dna_profiles").select("id, user_id, auth_user_id, email").eq("user_id", guestId)
            : { data: null, error: null };

        if (errB) console.error("Search by user_id error:", errB);

        // 🔍 Strategy C: Search by primary key (id field) - handles cases where guestId passed was actually profileId
        const { data: byId, error: errC } = (guestId && guestId.length === 36) // UUID length
            ? await supabaseAdmin.from("dna_profiles").select("id, user_id, auth_user_id, email").eq("id", guestId)
            : { data: null, error: null };

        if (errC) console.error("Search by primary key error:", errC);

        // 🔍 Strategy D: Search in metadata JSONB (legacy fallback)
        const { data: byMetadata, error: errD } = await supabaseAdmin
            .from("dna_profiles")
            .select("id, user_id, auth_user_id, email")
            .contains('metadata', { email: email.trim().toLowerCase() });

        if (errD) console.error("Search by metadata error:", errD);

        // 🔗 Combine all candidates
        const allMatches = [
            ...(byEmail || []),
            ...(byGuest || []),
            ...(byId || []),
            ...(byMetadata || [])
        ].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

        console.log(`Matching process found ${allMatches.length} profiles for ${storageEmail} / ${guestId}. IDs: ${allMatches.map(m => m.id).join(', ')}`);

        if (allMatches.length > 0) {
            console.log(`Updating ${allMatches.length} profiles with authUserId: ${authUserId}`);
            // Update every matching record to ensure consistent state
            const updatePromises = allMatches.map(async (profile) => {
                console.log(`Updating profile ${profile.id}...`);
                const { data: updated, error: updateError } = await supabaseAdmin
                    .from("dna_profiles")
                    .update({
                        auth_user_id: authUserId,
                        email: storageEmail,
                        broadcasting: true
                    })
                    .eq("id", profile.id)
                    .select()
                    .maybeSingle();

                if (updateError) {
                    console.error(`Update failed for profile ${profile.id}:`, updateError);
                    return { success: false };
                }
                console.log(`Successfully updated profile ${profile.id}. New auth_user_id: ${updated?.auth_user_id}`);
                return { success: !!updated, guestId: updated?.user_id };
            });

            const updateResults = await Promise.all(updatePromises);
            const successfulUpdates = updateResults.filter(r => r.success);

            if (successfulUpdates.length > 0) {
                console.log(`Successfully linked ${successfulUpdates.length} row(s) to WorkOS ${authUserId}`);
                return NextResponse.json({
                    success: true,
                    guestId: successfulUpdates[0].guestId,
                    linked: true,
                    count: successfulUpdates.length
                });
            }
        }

        console.log("No profile found to link. Verified email saved to session, linkage pending.");
        return NextResponse.json({ success: true, linked: false });
    } catch (error: any) {
        console.error("Link Profile Fatal Error:", error);
        return NextResponse.json({ error: error.message || "Link failed" }, { status: 500 });
    }
}