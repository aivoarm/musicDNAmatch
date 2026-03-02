import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get("spotify_access_token")?.value;

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { bridgeId } = await request.json();

        // 1. Fetch Bridge
        const { data: bridge, error: bridgeError } = await supabase
            .from("bridges")
            .select("*")
            .eq("id", bridgeId)
            .single();

        if (bridgeError || !bridge) {
            console.error("Bridge fetch error:", bridgeError);
            throw new Error("Bridge not found");
        }

        // If already synthesized, return existing data
        if (bridge.common_ground_data?.synthesis) {
            return NextResponse.json(bridge.common_ground_data.synthesis);
        }

        // 2. Fetch both users' DNA profiles separately
        const { data: profiles } = await supabase
            .from("dna_profiles")
            .select("user_id, metadata")
            .in("user_id", [bridge.user_a, bridge.user_b]);

        const profileA = profiles?.find((p: any) => p.user_id === bridge.user_a);
        const profileB = profiles?.find((p: any) => p.user_id === bridge.user_b);

        const nameA = profileA?.metadata?.display_name || "Broadcaster A";
        const nameB = profileB?.metadata?.display_name || "Broadcaster B";
        const genresA = profileA?.metadata?.top_genres?.join(", ") || "unknown";
        const genresB = profileB?.metadata?.top_genres?.join(", ") || "unknown";

        // 3. Use Gemini to synthesize a playlist concept
        const prompt = `
You are the AI Maestro for Music DNA Match.
Synthesize a collaborative playlist for two sonic soulmates.

User A "${nameA}" listens to: ${genresA}
User B "${nameB}" listens to: ${genresB}

Their DNA vectors share a deep mathematical overlap.

Respond with ONLY a valid JSON object (no markdown, no backticks):
{
  "name": "A cryptic, premium 2-4 word playlist name",
  "description": "A 1-sentence poetic description of their sonic intersection.",
  "vibe": ["keyword1", "keyword2", "keyword3"]
}`;

        const result = await model.generateContent(prompt);
        const raw = result.response.text().trim();

        // Strip markdown code fences if present
        const cleaned = raw.replace(/^```json?\n?/, "").replace(/\n?```$/, "").trim();
        const synthesis = JSON.parse(cleaned);

        // 4. Update Bridge with synthesized data
        await supabase
            .from("bridges")
            .update({
                common_ground_data: {
                    ...bridge.common_ground_data,
                    synthesis,
                    status: "synthesized"
                }
            })
            .eq("id", bridgeId);

        return NextResponse.json(synthesis);
    } catch (error) {
        console.error("Synthesis Error:", error);
        return NextResponse.json({ error: "Failed to synthesize common ground" }, { status: 500 });
    }
}
