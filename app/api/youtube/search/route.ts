export const runtime = "edge";
import { searchYouTube } from "@/lib/youtube";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
        return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
    }

    try {
        const results = await searchYouTube(query);
        return NextResponse.json(results);
    } catch (error) {
        console.error("YouTube Search Route Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
