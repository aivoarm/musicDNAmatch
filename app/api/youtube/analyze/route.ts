export const runtime = "edge";
import { NextResponse } from "next/server";

/**
 * POST /api/youtube/analyze
 * Body: { urls: string[] } — max 5 YouTube URLs
 * Returns: { videos: [{ id, title, channelTitle, categoryId, durationSeconds, tags }] }
 */
export async function POST(req: Request) {
    const { urls } = await req.json() as any;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
        return NextResponse.json({ error: "No YouTube URLs provided" }, { status: 400 });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "YouTube API key not configured" }, { status: 500 });
    }

    try {
        // Extract video IDs from URLs (max 5)
        const videoIds = urls.slice(0, 5)
            .map(extractVideoId)
            .filter(Boolean) as string[];

        if (videoIds.length === 0) {
            return NextResponse.json({ error: "No valid YouTube video IDs found" }, { status: 400 });
        }

        // Fetch video details
        const res = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoIds.join(",")}&key=${apiKey}`
        );

        if (!res.ok) {
            return NextResponse.json({ error: "YouTube API request failed" }, { status: res.status });
        }

        const data = await res.json() as any;
        const videos = (data.items || []).map((item: any) => ({
            id: item.id,
            title: item.snippet?.title || "",
            channelTitle: item.snippet?.channelTitle || "",
            categoryId: item.snippet?.categoryId || "10",
            durationSeconds: parseDuration(item.contentDetails?.duration || "PT0S"),
            tags: (item.snippet?.tags || []).slice(0, 10),
            thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || "",
        }));

        return NextResponse.json({ videos });
    } catch (err: any) {
        console.error("YouTube Analyze Error:", err);
        return NextResponse.json({ error: "Failed to analyze YouTube videos" }, { status: 500 });
    }
}


/**
 * Extract video ID from various YouTube URL formats.
 */
function extractVideoId(url: string): string | null {
    if (!url) return null;
    const trimmed = url.trim();

    // youtu.be/VIDEO_ID
    const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch) return shortMatch[1];

    // youtube.com/watch?v=VIDEO_ID
    const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (watchMatch) return watchMatch[1];

    // youtube.com/shorts/VIDEO_ID
    const shortsMatch = trimmed.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shortsMatch) return shortsMatch[1];

    // youtube.com/embed/VIDEO_ID
    const embedMatch = trimmed.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) return embedMatch[1];

    // Bare video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

    return null;
}

/**
 * Parse ISO 8601 duration (e.g. PT4M13S) to seconds.
 */
function parseDuration(iso: string): number {
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || "0");
    const minutes = parseInt(match[2] || "0");
    const seconds = parseInt(match[3] || "0");
    return hours * 3600 + minutes * 60 + seconds;
}
