import { NextResponse } from "next/server";
import { SpotifyPublicFetcher } from "@/lib/spotify";

export async function POST(req: Request) {
    const { spotify_user_id, playlist_id, limit = 5, offset = 0 } = await req.json();

    if (!spotify_user_id) {
        return NextResponse.json({ error: "No Spotify ID provided" }, { status: 400 });
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        return NextResponse.json({ error: "Admin credentials missing on server" }, { status: 500 });
    }

    try {
        const fetcher = new SpotifyPublicFetcher(clientId, clientSecret);
        const data = await fetcher.getUserPublicData(spotify_user_id, playlist_id, limit, offset);

        if ("error" in data) {
            return NextResponse.json({ error: data.error }, { status: 400 });
        }

        return NextResponse.json({
            spotify_user_id,
            ...data,
            count: (data.playlists?.length || data.tracks?.length || 0)
        });
    } catch (err: any) {
        console.error("Spotify Scan Error:", err);
        return NextResponse.json({ error: "Internal scan failure: " + err.message }, { status: 500 });
    }
}
