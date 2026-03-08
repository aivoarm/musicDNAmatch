export const runtime = "edge";
import { supabase, toUUID } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const cookieStore = await cookies();
    const guestId = cookieStore.get("guest_id")?.value;

    if (!guestId) {
        return NextResponse.json({ signals: [] });
    }

    try {
        const userId = toUUID(guestId);

        // Fetch interests where this user is the TARGET
        const { data: signals, error: matchError } = await supabase
            .from("match_interests")
            .select("id, user_id, created_at")
            .eq("target_id", userId)
            .order("created_at", { ascending: false });

        if (matchError) throw matchError;

        if (!signals || signals.length === 0) {
            return NextResponse.json({ signals: [] });
        }

        // Fetch sender names for these signals
        const senderIds = signals.map(s => s.user_id);
        const { data: profiles, error: profileError } = await supabase
            .from("dna_profiles")
            .select("user_id, metadata")
            .in("user_id", senderIds);

        const profileMap = (profiles || []).reduce((acc: any, p) => {
            acc[p.user_id] = p.metadata?.display_name || "Anonymous";
            return acc;
        }, {});

        return NextResponse.json({
            signals: signals.map(s => ({
                id: s.id,
                senderId: s.user_id,
                senderName: profileMap[s.user_id] || "Anonymous Signal",
                createdAt: s.created_at
            }))
        });
    } catch (error) {
        console.error("Notifications Error:", error);
        return NextResponse.json({ signals: [] });
    }
}
