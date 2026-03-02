import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get("spotify_access_token")?.value;

    if (!token) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        const res = await fetch("https://api.spotify.com/v1/me", {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            return NextResponse.json({ error: "Token invalid" }, { status: 401 });
        }

        const data = await res.json();
        return NextResponse.json({
            display_name: data.display_name,
            images: data.images,
            id: data.id,
        });
    } catch {
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }
}
