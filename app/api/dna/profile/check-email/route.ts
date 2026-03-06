import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email || !email.includes("@")) {
            return NextResponse.json({ error: "Invalid email" }, { status: 400 });
        }

        // Search for existing profile with this email
        const { data, error } = await supabase
            .from("dna_profiles")
            .select("id, user_id, metadata, email, created_at")
            .ilike("email", email.trim())
            .maybeSingle();

        if (error) throw error;

        if (data) {
            return NextResponse.json({
                exists: true,
                profile: {
                    id: data.id,
                    user_id: data.user_id,
                    display_name: data.metadata?.display_name || "Anonymous",
                    created_at: data.created_at
                }
            });
        }

        return NextResponse.json({ exists: false });

    } catch (error: any) {
        console.error("Check Email Error:", error);
        return NextResponse.json({ error: error.message || "Failed to check email" }, { status: 500 });
    }
}
