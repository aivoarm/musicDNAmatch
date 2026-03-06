import { supabase, toUUID } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import crypto from 'node:crypto';

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const guestId = cookieStore.get("guest_id")?.value;

    let userId = "";

    try {
        if (guestId) {
            userId = toUUID(guestId);
        }

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized. Please scan your DNA first." }, { status: 401 });
        }


        // 1. Parse request body
        const { targetId, email } = await request.json();

        if (!targetId || !email) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 2. Upsert match interest record
        const { error: matchError } = await supabase
            .from("match_interests")
            .upsert({
                id: crypto.randomUUID(),
                user_id: userId,
                target_id: targetId,
                email: email
            }, {
                onConflict: 'user_id,target_id'
            });

        if (matchError) throw matchError;

        // 3. Mutual Match Detection
        const { data: reciprocalMatch } = await supabase
            .from("match_interests")
            .select("email, user_id")
            .eq("user_id", targetId)
            .eq("target_id", userId)
            .single();

        let bridgeId = null;
        if (reciprocalMatch) {
            // It's a mutual match! Automatically create bridge
            const { data: bridge, error: bridgeErr } = await supabase
                .from("bridges")
                .insert({
                    id: crypto.randomUUID(),
                    user_a: userId,
                    user_b: targetId,
                    common_ground_data: {
                        status: "mutual",
                        revealed_emails: {
                            [userId]: email,
                            [targetId]: reciprocalMatch.email
                        }
                    }
                })
                .select()
                .single();

            if (!bridgeErr && bridge) {
                bridgeId = bridge.id;
            }
        }

        return NextResponse.json({
            success: true,
            message: "Interest registered",
            isMutual: !!reciprocalMatch,
            bridgeId
        });
    } catch (error) {
        console.error("Match Interest Error:", error);
        return NextResponse.json({ error: "Failed to create connection request" }, { status: 500 });
    }
}
