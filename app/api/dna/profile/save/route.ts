import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { randomUUID, createHash } from "crypto";

// Helper to convert any string to a valid UUID format
function toUUID(str: string): string {
    // If it already looks like a UUID, return it
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(str)) return str;

    // Otherwise, hash it to a 16-byte buffer and format as UUID
    const hash = createHash('sha256').update(str).digest('hex');
    return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { vector, metadata, display_name } = body;

        const cookieStore = await cookies();
        const googleToken = cookieStore.get("google_access_token")?.value;
        const cachedUser = cookieStore.get("google_user")?.value;

        let rawUserId = "";
        let finalDisplayName = display_name || "Anonymous Signal";

        if (googleToken) {
            if (cachedUser) {
                const user = JSON.parse(cachedUser);
                rawUserId = user.sub;
                if (!display_name) finalDisplayName = user.name;
            } else {
                const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                    headers: { Authorization: `Bearer ${googleToken}` },
                });
                if (userRes.ok) {
                    const googleUser = await userRes.json();
                    rawUserId = googleUser.sub;
                    if (!display_name) finalDisplayName = googleUser.name;
                }
            }
        }

        // Identify or Create Guest ID
        if (!rawUserId) {
            rawUserId = cookieStore.get("guest_id")?.value || randomUUID();
        }

        const userId = toUUID(rawUserId);

        const profileData = {
            user_id: userId,
            sonic_embedding: vector,
            metadata: {
                ...metadata,
                display_name: finalDisplayName,
                updated_at: new Date().toISOString()
            },
            broadcasting: true
        };

        const { data, error } = await supabase
            .from("dna_profiles")
            .upsert(profileData, { onConflict: "user_id" })
            .select()
            .single();

        if (error) {
            console.error("Supabase Error:", error);
            throw error;
        }

        const response = NextResponse.json({ success: true, profile: data });

        if (!googleToken) {
            response.cookies.set("guest_id", rawUserId, {
                maxAge: 60 * 60 * 24 * 365,
                path: '/'
            });
        }

        return response;
    } catch (error: any) {
        console.error("Profile Save Error:", error);
        return NextResponse.json({
            error: error.message || "Failed to save profile"
        }, { status: 500 });
    }
}
