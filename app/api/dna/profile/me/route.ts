import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createHash } from "crypto";

function toUUID(str: string): string {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(str)) return str;
    const hash = createHash('sha256').update(str).digest('hex');
    return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

export async function GET() {
    const cookieStore = await cookies();
    const googleToken = cookieStore.get("google_access_token")?.value;
    const guestId = cookieStore.get("guest_id")?.value;

    try {
        let rawUserId = "";

        if (googleToken) {
            const cachedUser = cookieStore.get("google_user")?.value;
            if (cachedUser) {
                rawUserId = JSON.parse(cachedUser).sub;
            } else {
                const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                    headers: { Authorization: `Bearer ${googleToken}` },
                });
                if (userRes.ok) {
                    const googleUser = await userRes.json();
                    rawUserId = googleUser.sub;
                }
            }
        } else if (guestId) {
            rawUserId = guestId;
        }

        if (!rawUserId) {
            return NextResponse.json({ found: false });
        }

        const userId = toUUID(rawUserId);

        const { data: profile, error } = await supabase
            .from("dna_profiles")
            .select("sonic_embedding, metadata")
            .eq("user_id", userId)
            .single();

        if (error || !profile) {
            return NextResponse.json({ found: false });
        }

        return NextResponse.json({
            found: true,
            dna: {
                vector: profile.sonic_embedding,
                display_name: profile.metadata.display_name,
                top_genres: profile.metadata.top_genres,
                recent_tracks: profile.metadata.recent_tracks || [],
                verbium: profile.metadata.verbium,
                updated_at: profile.metadata.updated_at,
                scanned_playlist_id: profile.metadata.scanned_playlist_id || null,
                scanned_playlist_ids: profile.metadata.scanned_playlist_ids || []
            }
        });
    } catch (error) {
        console.error("Profile Fetch Error:", error);
        return NextResponse.json({ found: false }, { status: 500 });
    }
}
