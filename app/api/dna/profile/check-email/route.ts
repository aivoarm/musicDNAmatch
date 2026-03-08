export const runtime = "nodejs";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { workos } from "@/lib/workos";
import { isEmailDomainValid } from "@/lib/server/dns-check";

export async function POST(req: Request) {
    try {
        const { email } = await req.json() as { email: string };

        if (!email || !email.includes("@")) {
            return NextResponse.json({ error: "Invalid email" }, { status: 400 });
        }

        // 0. Domain MX Check
        const isValid = await isEmailDomainValid(email);
        if (!isValid) {
            return NextResponse.json({ error: "Invalid domain", type: "dns" }, { status: 400 });
        }

        // Standardize the search key to match our UPPERCASE storage standard
        const searchEmail = email.trim().toUpperCase();

        // 1. Check local Supabase database first
        const { data, error } = await supabase
            .from("dna_profiles")
            .select("id, user_id, metadata, email, city, sonic_embedding, created_at")
            .eq("email", searchEmail)
            .maybeSingle();

        if (error) throw error;

        if (data) {
            const clash = {
                id: data.id,
                user_id: data.user_id,
                display_name: data.metadata?.display_name || "Signal Intelligence",
                dna: data.sonic_embedding,
                city: data.city || data.metadata?.city || "",
                email: data.email,
                created_at: data.created_at
            };
            return NextResponse.json({
                exists: true,
                taken: true,
                source: "database",
                profile: clash,
                clash
            });
        }

        // 2. If not in DB, check WorkOS
        const workosUsers = await workos.userManagement.listUsers({ email: email.trim().toLowerCase() });

        if (workosUsers.data.length > 0) {
            const wUser = workosUsers.data[0];
            const clash = {
                id: "verified-only",
                user_id: wUser.id,
                display_name: wUser.firstName ? `${wUser.firstName} ${wUser.lastName || ""}`.trim() : "Verified Member",
                dna: null,
                email: wUser.email,
                created_at: wUser.createdAt
            };
            return NextResponse.json({
                exists: true,
                taken: true,
                source: "workos",
                profile: clash,
                clash
            });
        }

        return NextResponse.json({ exists: false, taken: false });

    } catch (error: any) {
        console.error("Neural Handshake (Check Email) Error:", error);
        return NextResponse.json({ error: error.message || "Connection failed" }, { status: 500 });
    }
}