export const runtime = "edge";
import { NextResponse } from "next/server";

const API_KEY = process.env.YOUTUBE_API_KEY;

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
        return NextResponse.json({ channels: [] });
    }

    if (!API_KEY) {
        return NextResponse.json({ error: "YOUTUBE_API_KEY is not defined" }, { status: 500 });
    }

    // Search for channels specifically
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=channel&maxResults=5&key=${API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json() as any;

        if (data.error) {
            console.error("YouTube Channel Search API Error:", data.error);
            return NextResponse.json({ error: data.error.message }, { status: 500 });
        }

        const channels = (data.items || []).map((item: any) => ({
            id: item.id.channelId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
            url: `https://www.youtube.com/channel/${item.id.channelId}`
        }));

        return NextResponse.json({ success: true, channels });
    } catch (err: any) {
        console.error("Failed to search YouTube channels:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
