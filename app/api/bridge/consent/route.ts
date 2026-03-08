export const runtime = "edge";
import { supabase, toUUID } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const googleToken = cookieStore.get("google_access_token")?.value;
    const guestId = cookieStore.get("guest_id")?.value;

    let userId = "";

    try {
        const { bridgeId, consent } = await request.json() as any;

        if (googleToken) {
            const cachedUser = cookieStore.get("google_user")?.value;
            if (cachedUser) {
                userId = toUUID(JSON.parse(cachedUser).sub);
            } else {
                const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                    headers: { Authorization: `Bearer ${googleToken}` },
                });
                if (userRes.ok) {
                    const googleUser = await userRes.json() as any;
                    userId = toUUID(googleUser.sub);
                }
            }
        }

        if (!userId && guestId) {
            userId = toUUID(guestId);
        }

        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // 1. Get bridge details
        const { data: bridge, error: bridgeError } = await supabase
            .from("bridges")
            .select("*")
            .eq("id", bridgeId)
            .single();

        if (bridgeError || !bridge) return NextResponse.json({ error: "Bridge not found" }, { status: 404 });

        // 2. Update consent in common_ground_data
        const currentData = bridge.common_ground_data || {};
        const consents = currentData.consents || {};
        consents[userId] = consent;

        const updatedData = {
            ...currentData,
            consents
        };

        const { error: updateError } = await supabase
            .from("bridges")
            .update({ common_ground_data: updatedData })
            .eq("id", bridgeId);

        if (updateError) throw updateError;

        // 3. Fetch emails if both consented
        let emails = null;
        const participantIds = [bridge.user_a, bridge.user_b];
        const consentedCount = Object.values(consents).filter(v => v === true).length;

        if (consentedCount === 2) {
            // Both users consented, fetch their registered emails from match_interests
            const { data: interests } = await supabase
                .from("match_interests")
                .select("user_id, email")
                .in("user_id", participantIds)
                .or(`target_id.eq.${bridge.user_a},target_id.eq.${bridge.user_b}`);

            // Map emails
            if (interests) {
                emails = {};
                interests.forEach((item: any) => {
                    emails[item.user_id] = item.email;
                });

                // If emails are missing from interests (e.g. if one user hasn't registered interest yet but is in the bridge)
                // We update common_ground_data to reveal them
                await supabase
                    .from("bridges")
                    .update({
                        common_ground_data: {
                            ...updatedData,
                            revealed_emails: emails,
                            status: "revealed"
                        }
                    })
                    .eq("id", bridgeId);
            }
        }

        return NextResponse.json({ success: true, consents, revealed_emails: emails });
    } catch (error) {
        console.error("Consent Error:", error);
        return NextResponse.json({ error: "Failed to update consent" }, { status: 500 });
    }
}
