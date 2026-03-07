import { searchYouTube } from "@/lib/youtube";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title");
    const channel = searchParams.get("channel");

    if (!title || !channel) {
        return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    try {
        // Heuristic: telling YouTube to search for a mix of similar artists
        const query = `${channel} and similar artists playlist`;
        const results = await searchYouTube(query, 25);

        const uniqueChannels = new Set<string>();
        uniqueChannels.add(channel.toLowerCase()); // Try to avoid the exact same channel/artist

        const filtered = [];
        for (const r of results) {
            const cLower = r.channelTitle.toLowerCase();
            // Filter out exact same artist, VEVO variants, or generic compilation channels
            if (!uniqueChannels.has(cLower) &&
                !cLower.includes(channel.toLowerCase()) &&
                !cLower.includes("topic") &&
                !cLower.includes("various artists")) {
                uniqueChannels.add(cLower);
                filtered.push(r);
            }
            if (filtered.length >= 4) break;
        }

        // If strict filtering didn't yield enough, relax the rules
        if (filtered.length < 4) {
            for (const r of results) {
                if (!filtered.find(f => f.id === r.id) && r.channelTitle.toLowerCase() !== channel.toLowerCase()) {
                    filtered.push(r);
                }
                if (filtered.length >= 4) break;
            }
        }

        return NextResponse.json(filtered.slice(0, 4));
    } catch (error) {
        console.error("Similar search error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
