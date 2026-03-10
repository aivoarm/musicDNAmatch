export const runtime = "edge";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { calculateCoherence } from "@/lib/dna";

export async function GET() {
    try {
        // Fetch up to 24 active DNA profiles to represent the "community" or "fans"
        // We select only columns known to exist in the schema
        const { data: rawProfiles, error } = await supabase
            .from("dna_profiles")
            .select("id, sonic_embedding, metadata, email, city, created_at")
            .order("created_at", { ascending: false })
            .limit(24);

        if (error) throw error;

        // Map profiles to include display_name and coherence_index derived from their data
        const profiles = (rawProfiles || []).map(p => {
            const meta = p.metadata || {};
            let vector = p.sonic_embedding;

            // Handle pgvector format if string
            if (typeof vector === "string") {
                try {
                    vector = vector.replace(/[\[\]]/g, '').split(',').map(Number);
                } catch (e) {
                    vector = Array(12).fill(0.5);
                }
            }

            if (!Array.isArray(vector) || vector.length !== 12) {
                vector = Array(12).fill(0.5);
            }

            return {
                ...p,
                display_name: meta.display_name || (p.email ? p.email.split('@')[0].toUpperCase() : "Anonymous Signal"),
                top_genres: meta.top_genres || [],
                coherence_index: meta.coherence_index || calculateCoherence(vector, meta.confidence || []),
                metadata: meta
            };
        });

        return NextResponse.json({ success: true, profiles });
    } catch (error: any) {
        console.error("Community Fetch Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
