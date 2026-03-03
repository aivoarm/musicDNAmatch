import { getTrendingMusic } from "@/lib/youtube";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const results = await getTrendingMusic(5);
        return NextResponse.json(results);
    } catch (error) {
        console.error("YouTube Trending Route Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
