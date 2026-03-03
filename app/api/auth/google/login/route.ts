import { NextResponse } from "next/server";

export async function GET() {
    const client_id = process.env.GOOGLE_CLIENT_ID;
    const site_url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const redirect_uri = process.env.GOOGLE_REDIRECT_URI || `${site_url}/api/auth/callback/google`;

    if (!client_id) {
        return NextResponse.json({ error: "GOOGLE_CLIENT_ID missing in .env" }, { status: 500 });
    }

    // scopes:
    // https://www.googleapis.com/auth/youtube.readonly -> to fetch videos/activities
    // openid profile email -> for user info
    const scope = "https://www.googleapis.com/auth/youtube.readonly openid profile email";
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;

    return NextResponse.redirect(googleAuthUrl);
}
