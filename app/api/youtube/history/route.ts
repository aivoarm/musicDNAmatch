export const runtime = "edge";
import { getPersonalHistory } from "@/lib/youtube";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get("google_access_token")?.value;

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const history = await getPersonalHistory(token, 10);
        return NextResponse.json(history);
    } catch (error) {
        console.error("YouTube History API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
