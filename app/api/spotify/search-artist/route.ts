export const runtime = "edge";
import { SpotifyPublicFetcher } from "@/lib/spotify";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
        return NextResponse.json({ artists: [] });
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        return NextResponse.json({ error: "Credentials missing" }, { status: 500 });
    }

    const fetcher = new SpotifyPublicFetcher(clientId, clientSecret);
    const artists = await fetcher.searchArtists(query, 10);

    return NextResponse.json({ success: true, artists });
}
