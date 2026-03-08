export const runtime = "edge";
import { supabase, toUUID } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isEmailDomainValid } from "@/lib/server/dns-check";

export async function POST(req: Request) {
    try {
        const body = await req.json() as any;
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

        // DNS MX record check for email validity
        if (cleanEmail) {
            const isValid = await isEmailDomainValid(cleanEmail);
            if (!isValid) {
                return NextResponse.json({ error: "Email domain is not valid" }, { status: 400 });
            }
        }

        // Check if another profile already has this email
        if (cleanEmail && !forceOverwrite) {
            const { data: clashProfiles } = await supabase
                .from("dna_profiles")
                .select("user_id, metadata, email, city, created_at")
                .ilike("email", cleanEmail)
                .neq("user_id", userId)
                .limit(1);

            if (clashProfiles && clashProfiles.length > 0) {
                const clash = clashProfiles[0];
                return NextResponse.json({
                    success: false,
                    clash: {
                        user_id: clash.user_id,
                        display_name: clash.metadata?.display_name || "Anonymous Signal",
                        email: clash.email,
                        city: clash.city,
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
                .ilike("email", cleanEmail)
                .neq("user_id", userId);
        }

        // Fetch existing columns to preserve fields not being updated
        const { data: existing } = await supabase
            .from("dna_profiles")
            .select("metadata, email, city, broadcasting")
            .eq("user_id", userId)
            .single();

        const existingMeta = existing?.metadata || {};

        // Update profile in dna_profiles
        const uppercasedEmail = (email && typeof email === 'string' && email.trim() !== "")
            ? email.trim().toUpperCase()
            : existing?.email;
        const uppercasedCity = (city && typeof city === 'string' && city.trim() !== "")
            ? city.trim().toUpperCase()
            : existing?.city;

        // If name is "Anonymous Signal" but we have an email, derive name from email
        let finalDisplayName = displayName || existingMeta.display_name;
        if ((!finalDisplayName || finalDisplayName === "Anonymous Signal") && uppercasedEmail) {
            finalDisplayName = uppercasedEmail.split("@")[0].toUpperCase();
        }

        // Prepare new metadata by removing email and city
        const { email: _, city: __, ...newMetadata } = {
            ...existingMeta,
            display_name: finalDisplayName,
            top_genres: genres,
            narrative: bio,
        };

        const { error } = await supabase
            .from("dna_profiles")
            .update({
                email: uppercasedEmail,
                city: uppercasedCity,
                metadata: newMetadata,
                broadcasting: (broadcasting !== undefined) ? (broadcasting && !!uppercasedEmail) : (!!uppercasedEmail || (existing as any)?.broadcasting)
            })
            .eq("user_id", userId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Profile Save Error:", error);
        return NextResponse.json({ error: error.message || "Failed to save profile" }, { status: 500 });
    }
}
