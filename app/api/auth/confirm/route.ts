import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * GET /api/auth/confirm
 * 
 * This is the redirect URL from Supabase Magic Link emails.
 * Supabase appends auth tokens as URL hash fragments (#access_token=...).
 * 
 * Since hash fragments aren't sent to the server, we redirect to a
 * client-side page that extracts the tokens and completes the linking.
 * 
 * Query params from Supabase:
 * - token_hash, type (for PKCE flow)
 * - OR hash fragment: #access_token=...&refresh_token=...
 */
export async function GET(req: Request) {
    const url = new URL(req.url);
    const tokenHash = url.searchParams.get("token_hash");
    const type = url.searchParams.get("type") || "magiclink";

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    if (tokenHash) {
        // PKCE flow: verify the token server-side
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        const { data, error } = await supabaseAdmin.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as any,
        });

        if (error || !data.user) {
            console.error("Magic Link Verify Error:", error);
            return NextResponse.redirect(
                `${siteUrl}/?auth_error=Link+expired+or+invalid`
            );
        }

        const authUserId = data.user.id;
        const authEmail = data.user.email;

        // Link: find an existing dna_profile with this email and attach auth_user_id
        if (authEmail) {
            const { data: existingProfile } = await supabaseAdmin
                .from("dna_profiles")
                .select("id, user_id")
                .ilike("email", authEmail)
                .maybeSingle();

            if (existingProfile) {
                // Link the profile to the authenticated user
                await supabaseAdmin
                    .from("dna_profiles")
                    .update({ auth_user_id: authUserId })
                    .eq("id", existingProfile.id);

                // Set cookies so the frontend knows who this user is
                const response = NextResponse.redirect(
                    `${siteUrl}/profile?auth=success`
                );

                response.cookies.set("guest_id", existingProfile.user_id, {
                    maxAge: 60 * 60 * 24 * 365,
                    path: "/",
                    httpOnly: false,
                    sameSite: "lax",
                });
                response.cookies.set("has_dna", "true", {
                    maxAge: 60 * 60 * 24 * 365,
                    path: "/",
                });
                response.cookies.set("auth_email", authEmail.toLowerCase(), {
                    maxAge: 60 * 60 * 24 * 365,
                    path: "/",
                    httpOnly: false,
                    sameSite: "lax",
                });

                return response;
            }
        }

        // No existing profile with that email — just redirect to home
        // The user can create a new DNA profile from there
        const response = NextResponse.redirect(
            `${siteUrl}/?auth=verified&email=${encodeURIComponent(authEmail || "")}`
        );

        if (authEmail) {
            response.cookies.set("auth_email", authEmail.toLowerCase(), {
                maxAge: 60 * 60 * 24 * 365,
                path: "/",
                httpOnly: false,
                sameSite: "lax",
            });
        }

        return response;
    }

    // Fallback: redirect to a client-side handler for hash fragments 
    return NextResponse.redirect(`${siteUrl}/auth/callback${url.search}`);
}
