export const runtime = "edge";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Fetch up to 20 active DNA profiles to represent the "community" or "fans"
        const { data: profiles, error } = await supabase
            .from("dna_profiles")
            .select("id, display_name, metadata, top_genres, created_at, coherence_index")
            .order("created_at", { ascending: false })
            .limit(24);

        if (error) throw error;

        return NextResponse.json({ success: true, profiles });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
