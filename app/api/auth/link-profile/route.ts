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
        const { data: byEmail } = await supabaseAdmin
            .from("dna_profiles")
            .select("id, user_id, auth_user_id, email, metadata")
            .ilike("email", storageEmail);

        // 🔍 Strategy B: Search by guest identifier (user_id field)
        const { data: byGuest } = guestId
            ? await supabaseAdmin.from("dna_profiles").select("id, user_id, auth_user_id, email, metadata").eq("user_id", guestId)
            : { data: null };

        // 🔍 Strategy C: Search by primary key (id field) 
        const { data: byId } = (guestId && guestId.length === 36)
            ? await supabaseAdmin.from("dna_profiles").select("id, user_id, auth_user_id, email, metadata").eq("id", guestId)
            : { data: null };

        // 🔍 Strategy D: Search in metadata JSONB (legacy fallback)
        const { data: byMetaLower } = await supabaseAdmin
            .from("dna_profiles")
            .select("id, user_id, auth_user_id, email, metadata")
            .contains('metadata', { email: email.trim().toLowerCase() });

        const { data: byMetaUpper } = await supabaseAdmin
            .from("dna_profiles")
            .select("id, user_id, auth_user_id, email, metadata")
            .contains('metadata', { email: email.trim().toUpperCase() });

        // 🔍 Strategy E: Search by WorkOS ID (sync if already linked)
        const { data: byAuthId } = await supabaseAdmin
            .from("dna_profiles")
            .select("id, user_id, auth_user_id, email, metadata")
            .eq("auth_user_id", authUserId);

        // 🔗 Combine all candidates
        const allMatches = [
            ...(byEmail || []),
            ...(byGuest || []),
            ...(byId || []),
            ...(byMetaLower || []),
            ...(byMetaUpper || []),
            ...(byAuthId || [])
        ].filter((v, i, a) => v && v.id && a.findIndex(t => t.id === v.id) === i);

        console.log(`Matching process found ${allMatches.length} profiles for ${storageEmail} / ${guestId}. IDs: ${allMatches.map(m => m.id).join(', ')}`);

        if (allMatches.length > 0) {
            // Update every matching record
            const updatePromises = allMatches.map(async (profile) => {
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
                    return { success: false, id: profile.id };
                }
                return { success: !!updated, guestId: updated?.user_id, metadata: updated?.metadata, id: profile.id };
            });

            const updateResults = await Promise.all(updatePromises);
            const successfulUpdates = updateResults.filter(r => r.success);

            if (successfulUpdates.length > 0) {
                const first = successfulUpdates[0] as any;
                return NextResponse.json({
                    success: true,
                    guestId: first.guestId,
                    metadata: first.metadata || allMatches.find(m => m.id === first.id)?.metadata,
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