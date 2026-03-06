import { supabase, toUUID } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AXIS_LABELS, calculateCoherence } from "@/lib/dna";

export async function GET() {
    const cookieStore = await cookies();
    const guestId = cookieStore.get("guest_id")?.value;

    try {
        if (!guestId) {
            return NextResponse.json({ found: false });
        }

        const userId = toUUID(guestId);


        const { data: profile, error } = await supabase
            .from("dna_profiles")
            .select("id, sonic_embedding, metadata, created_at")
            .eq("user_id", userId)
            .single();


        if (error || !profile) {
            return NextResponse.json({ found: false });
        }

        const meta = profile.metadata || {};
        let vector = profile.sonic_embedding;

        if (typeof vector === "string") {
            try {
                // Parse pgvector "[0.1, 0.2, ...]" format
                vector = vector.replace(/[\[\]]/g, '').split(',').map(Number);
            } catch (e) {
                vector = Array(12).fill(0.5);
            }
        }

        // Ensure 12 dimensions
        if (!Array.isArray(vector) || vector.length !== 12) {
            vector = Array(12).fill(0.5);
        }

        const dnaObject = {
            ...meta,
            vector,
            confidence: meta.confidence || Array(12).fill(1.0),
            coherence_index: calculateCoherence(vector, meta.confidence || []),
            display_name: meta.display_name || "Anonymous Signal",
            top_genres: meta.top_genres || [],
            recent_tracks: meta.recent_tracks || [],
            youtube_tracks: meta.youtube_tracks || [],
            narrative: meta.narrative || "",
            city: meta.city || null,
            source_signals: meta.source_signals || {},
            schema_version: meta.schema_version ?? 2,
            updated_at: meta.updated_at || profile.created_at,
            created_at: profile.created_at,
            axes: [...AXIS_LABELS],
            metadata: meta,
        };

        const response = NextResponse.json({
            found: true,
            profileId: profile.id,
            userId,
            dna: dnaObject
        });

        response.cookies.set("has_dna", "true", { maxAge: 60 * 60 * 24 * 365, path: "/" });
        return response;

    } catch (error) {
        console.error("Profile Fetch Error:", error);
        return NextResponse.json({ found: false }, { status: 500 });
    }
}
