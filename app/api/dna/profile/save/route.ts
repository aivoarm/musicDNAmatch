import { supabase, toUUID } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { displayName, email, genres, bio, broadcasting, city, forceOverwrite } = body;

        const cookieStore = await cookies();
        const guestId = cookieStore.get("guest_id")?.value;

        if (!guestId) {
            return NextResponse.json({ error: "No guest session found" }, { status: 401 });
        }

        const userId = toUUID(guestId);
        const cleanEmail = (email && typeof email === 'string' && email.trim() !== "")
            ? email.trim().toLowerCase()
            : null;

        // Check if another profile already has this email
        if (cleanEmail && !forceOverwrite) {
            const { data: clashProfiles } = await supabase
                .from("dna_profiles")
                .select("user_id, metadata, created_at")
                .filter("metadata->>email", "eq", cleanEmail)
                .neq("user_id", userId)
                .limit(1);

            if (clashProfiles && clashProfiles.length > 0) {
                const clash = clashProfiles[0];
                return NextResponse.json({
                    success: false,
                    clash: {
                        user_id: clash.user_id,
                        display_name: clash.metadata?.display_name || "Anonymous Signal",
                        email: clash.metadata?.email,
                        city: clash.metadata?.city || null,
                        created_at: clash.created_at,
                    }
                });
            }
        }

        // If forceOverwrite, remove the old profile that had this email
        if (cleanEmail && forceOverwrite) {
            await supabase
                .from("dna_profiles")
                .delete()
                .filter("metadata->>email", "eq", cleanEmail)
                .neq("user_id", userId);
        }

        // Fetch existing metadata to preserve fields not being updated
        const { data: existing } = await supabase
            .from("dna_profiles")
            .select("metadata")
            .eq("user_id", userId)
            .single();

        const existingMeta = existing?.metadata || {};

        // Update profile in dna_profiles
        const { error } = await supabase
            .from("dna_profiles")
            .update({
                metadata: {
                    ...existingMeta,
                    display_name: displayName,
                    email: cleanEmail,
                    top_genres: genres,
                    narrative: bio,
                    city: (city && typeof city === 'string' && city.trim() !== "") ? city.trim() : (existingMeta.city || null),
                },
                broadcasting: broadcasting
            })
            .eq("user_id", userId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Profile Save Error:", error);
        return NextResponse.json({ error: error.message || "Failed to save profile" }, { status: 500 });
    }
}
