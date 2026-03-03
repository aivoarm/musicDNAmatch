import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
        return NextResponse.redirect(new URL("/youtube?error=no_callback_code", request.url));
    }

    const client_id = process.env.GOOGLE_CLIENT_ID;
    const client_secret = process.env.GOOGLE_CLIENT_SECRET;
    const site_url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const redirect_uri = process.env.GOOGLE_REDIRECT_URI || `${site_url}/api/auth/callback/google`;

    try {
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: client_id!,
                client_secret: client_secret!,
                redirect_uri: redirect_uri!,
                grant_type: "authorization_code",
            }),
        });

        const tokens = await tokenResponse.json();

        if (tokens.error) {
            console.error("Google Token Error:", tokens.error);
            return NextResponse.redirect(new URL("/youtube?error=token_failed", request.url));
        }

        const cookieStore = await cookies();

        // Securely store the access token
        cookieStore.set("google_access_token", tokens.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: tokens.expires_in,
            path: "/",
        });

        // Store user info from id_token if present
        if (tokens.id_token) {
            try {
                const base64Url = tokens.id_token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = JSON.parse(Buffer.from(base64, 'base64').toString());

                cookieStore.set("google_user", JSON.stringify({
                    name: jsonPayload.name,
                    email: jsonPayload.email,
                    picture: jsonPayload.picture,
                    sub: jsonPayload.sub
                }), {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    maxAge: tokens.expires_in,
                    path: "/",
                });
            } catch (err) {
                console.error("ID Token Decode Error:", err);
            }
        }

        // Return to the YouTube page with auth success
        return NextResponse.redirect(new URL("/youtube?status=authenticated", request.url));
    } catch (error) {
        console.error("Auth Callback Error:", error);
        return NextResponse.redirect(new URL("/youtube?error=auth_internal_error", request.url));
    }
}
