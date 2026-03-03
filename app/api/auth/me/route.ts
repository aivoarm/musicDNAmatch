import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const cookieStore = await cookies();
    const googleToken = cookieStore.get("google_access_token")?.value;
    const googleUser = cookieStore.get("google_user")?.value;

    if (!googleToken) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 1. Try to return user info from the session cookie (more efficient + avoids network issues)
    if (googleUser) {
        try {
            const user = JSON.parse(googleUser);
            return NextResponse.json({
                display_name: user.name,
                email: user.email,
                images: [{ url: user.picture }],
                id: user.sub,
            });
        } catch (err) {
            console.error("Cookie Parse Error:", err);
        }
    }

    // 2. Fallback to fetching user info from Google's endpoint if cookie is missing/corrupt
    try {
        const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${googleToken}` },
        });

        if (!res.ok) {
            return NextResponse.json({ error: "Failed to fetch Google profile" }, { status: res.status });
        }

        const user = await res.json();

        return NextResponse.json({
            display_name: user.name,
            email: user.email,
            images: [{ url: user.picture }],
            id: user.sub,
        });
    } catch (err) {
        console.error("Google Profile Fetch Error (Fallback):", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
