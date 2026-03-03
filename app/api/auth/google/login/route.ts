import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
    const client_id = process.env.GOOGLE_CLIENT_ID;
    const site_url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const redirect_uri = process.env.GOOGLE_REDIRECT_URI || `${site_url}/api/auth/callback/google`;

    if (!client_id) {
        return NextResponse.json({ error: "GOOGLE_CLIENT_ID missing in .env" }, { status: 500 });
    }

    // CSRF Protection: Generate and store state
    const state = crypto.randomBytes(32).toString("hex");
    const cookieStore = await cookies();
    cookieStore.set("google_oauth_state", state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 10, // 10 minutes
        path: "/",
        sameSite: "lax"
    });

    const scope = "https://www.googleapis.com/auth/youtube.readonly openid profile email";
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent&state=${state}`;

    return NextResponse.redirect(googleAuthUrl);
}
