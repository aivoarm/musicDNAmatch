import { supabase, toUUID } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const cookieStore = await cookies();
    const guestId = cookieStore.get("guest_id")?.value;
    const authEmail = cookieStore.get("auth_email")?.value;

    // 1. If we have an authenticated email, use it to find the identity
    if (authEmail) {
        try {
            const { data: profile } = await supabase
                .from("dna_profiles")
                .select("metadata, email, user_id")
                .ilike("email", authEmail.trim().toUpperCase())
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (profile) {
                const meta = profile.metadata || {};
                const finalEmail = profile.email || meta.email || authEmail;
                let finalDisplayName = meta.display_name || finalEmail.split('@')[0].toUpperCase();

                return NextResponse.json({
                    id: profile.user_id,
                    display_name: finalDisplayName,
                    email: finalEmail,
                    authenticated: true
                });
            } else {
                // If logged in but no profile yet
                return NextResponse.json({
                    id: "authenticated",
                    display_name: authEmail.split('@')[0].toUpperCase(),
                    email: authEmail,
                    authenticated: true
                });
            }
        } catch (err) {
            console.error("Auth Me Email Fallback Error:", err);
        }
    }

    // 2. Fallback to guest session if no WorkOS user
    if (!guestId) {
        return NextResponse.json({ error: "No session found" }, { status: 401 });
    }

    const userId = toUUID(guestId);

    try {
        const { data: profile } = await supabase
            .from("dna_profiles")
            .select("metadata, email")
            .eq("user_id", userId)
            .single();

        if (!profile) {
            return NextResponse.json({ id: userId, display_name: "Anonymous Signal" });
        }

        const meta = profile.metadata || {};
        const finalEmail = profile.email || meta.email || null;
        let finalDisplayName = meta.display_name || "Anonymous Signal";

        if (finalDisplayName === "Anonymous Signal" && finalEmail) {
            finalDisplayName = finalEmail.split('@')[0].toUpperCase();
        }

        return NextResponse.json({
            id: userId,
            display_name: finalDisplayName,
            email: finalEmail,
        });
    } catch (err) {
        console.error("Auth Me Error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
