export const runtime = "edge";
import { supabase, toUUID } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AXIS_LABELS, calculateCoherence } from "@/lib/dna";

export async function GET() {
    const cookieStore = await cookies();
    const guestId = cookieStore.get("guest_id")?.value;
    const authEmail = cookieStore.get("auth_email")?.value;

    try {
        let profile = null;
        let userId = guestId ? toUUID(guestId) : null;

        if (guestId) {
            const { data } = await supabase
                .from("dna_profiles")
                .select("*, artists(*)")
                .eq("user_id", userId)
                .maybeSingle();
            profile = data;
        }

        // If not found by guestId, try by auth_email cookie if available
        if (!profile && authEmail) {
            const { data } = await supabase
                .from("dna_profiles")
                .select("id, sonic_embedding, metadata, email, city, created_at, user_id, auth_user_id")
                .ilike("email", authEmail.trim().toUpperCase())
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
            profile = data;
            if (profile) {
                userId = profile.user_id;
            }
        }

        if (!profile) {
            return NextResponse.json({ found: false });
        }

        // Check if user is a verified artist by email
        let isArtist = false;
        if (profile.email) {
            const { data: artistCheck } = await supabase
                .from("artists")
                .select("id, verified")
                .ilike("verification_email", profile.email.trim())
                .eq("verified", true)
                .maybeSingle();
            if (artistCheck) isArtist = true;
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
            display_name: (meta.display_name && meta.display_name !== "Anonymous Signal") ? meta.display_name : (profile.email ? profile.email.split('@')[0].toUpperCase() : "Anonymous Signal"),
            top_genres: meta.top_genres || [],
            recent_tracks: meta.recent_tracks || [],
            youtube_tracks: meta.youtube_tracks || [],
            narrative: meta.narrative || "",
            email: profile.email || meta.email || null,
            city: profile.city || meta.city || null,
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
            isArtist,
            dna: dnaObject
        });

        if (userId) {
            response.cookies.set("guest_id", userId, { maxAge: 60 * 60 * 24 * 365, path: "/" });
        }
        response.cookies.set("has_dna", "true", { maxAge: 60 * 60 * 24 * 365, path: "/" });
        return response;

    } catch (error) {
        console.error("Profile Fetch Error:", error);
        return NextResponse.json({ found: false }, { status: 500 });
    }
}
