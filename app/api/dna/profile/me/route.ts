import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { AXIS_LABELS } from "@/lib/dna";

function toUUID(str: string): string {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(str)) return str;
    const hash = createHash('sha256').update(str).digest('hex');
    return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

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
            .select("id, sonic_embedding, metadata")
            .eq("user_id", userId)
            .single();

        if (error || !profile) {
            return NextResponse.json({ found: false });
        }

        const meta = profile.metadata || {};
        let vector = profile.sonic_embedding;
        if (typeof vector === "string") {
            try {
                vector = JSON.parse(vector.replace(/[\[\]]/g, (m) => m === '[' ? '[' : ']').replace(/,/g, ','));
                // Actually easier:
                vector = vector.replace(/[\[\]]/g, '').split(',').map(Number);
            } catch (e) {
                vector = Array(12).fill(0.5);
            }
        }

        return NextResponse.json({
            found: true,
            profileId: profile.id,
            userId,
            dna: {
                vector: Array.isArray(vector) ? vector : Array(12).fill(0.5),

                confidence: meta.confidence || [],
                coherence_index: meta.coherence_index ?? 0,
                display_name: meta.display_name,
                top_genres: meta.top_genres || [],
                recent_tracks: meta.recent_tracks || [],
                youtube_tracks: meta.youtube_tracks || [],
                narrative: meta.narrative || "",
                source_signals: meta.source_signals || {},
                schema_version: meta.schema_version ?? 1,
                updated_at: meta.updated_at,
                axes: [...AXIS_LABELS],
            }
        });
    } catch (error) {
        console.error("Profile Fetch Error:", error);
        return NextResponse.json({ found: false }, { status: 500 });
    }
}
