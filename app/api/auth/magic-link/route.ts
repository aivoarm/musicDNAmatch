import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isEmailDomainValid } from "@/lib/server/dns-check";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * POST /api/auth/magic-link
 * 
 * Sends a passwordless Magic Link (OTP) to the given email.
 * The link redirects to /api/auth/confirm which handles the session
 * and links the guest_id profile to the authenticated user.
 * 
 * Body: { email: string }
 */
export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email || typeof email !== "string" || !email.includes("@")) {
            return NextResponse.json(
                { error: "Valid email is required" },
                { status: 400 }
            );
        }

        const cleanEmail = email.trim().toLowerCase();

        // Validate email domain via DNS MX records
        const isValid = await isEmailDomainValid(cleanEmail);
        if (!isValid) {
            return NextResponse.json(
                { error: "Email domain is not valid. Please check for typos." },
                { status: 400 }
            );
        }

        // Use service role to send OTP (bypasses any auth restrictions)
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

        const { error } = await supabaseAdmin.auth.signInWithOtp({
            email: cleanEmail,
            options: {
                emailRedirectTo: `${siteUrl}/auth/callback`,
                shouldCreateUser: true,
            },
        });

        if (error) {
            console.error("Magic Link OTP Error:", error);
            return NextResponse.json(
                { error: error.message || "Failed to send magic link" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Magic link sent. Check your inbox.",
        });
    } catch (error: any) {
        console.error("Magic Link Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
