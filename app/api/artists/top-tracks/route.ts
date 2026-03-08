export const runtime = "edge";
import { NextResponse } from "next/server";
import { SpotifyPublicFetcher } from "@/lib/spotify";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const artistId = searchParams.get("id");

    if (!artistId) {
        return NextResponse.json({ error: "Missing artist ID" }, { status: 400 });
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        return NextResponse.json({ error: "Admin credentials missing" }, { status: 500 });
    }

    try {
        const fetcher = new SpotifyPublicFetcher(clientId, clientSecret);
        const data = await fetcher.getArtistTopTracks(artistId);

        if (data.error) {
            return NextResponse.json({ error: data.error }, { status: 500 });
        }

        // Return top 5 tracks
        return NextResponse.json({
            success: true,
            tracks: data.tracks.slice(0, 5)
        });
    } catch (e: any) {
        console.error("Top tracks error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
