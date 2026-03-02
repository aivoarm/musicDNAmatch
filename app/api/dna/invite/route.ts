import { GoogleGenerativeAI } from "@google/generative-ai";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get("spotify_access_token")?.value;

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { targetUserId, thesis, similarity } = await request.json();

        // Fetch sender info from Spotify
        const userRes = await fetch("https://api.spotify.com/v1/me", {
            headers: { Authorization: `Bearer ${token}` },
        });
        const senderData = await userRes.json();

        const prompt = `
      You are the "AI Maestro" for Music DNA Match.
      A user named ${senderData.display_name} wants to invite a sonic soulmate to a collaborative "Green Room".
      
      Match Details:
      - Similarity: ${similarity}%
      - Musical Thesis: ${thesis}
      
      TASK:
      Draft a compelling, musically sophisticated invitation email.
      The tone should be "Premium, Academic yet Passionate".
      The email should invite them to join a 48-hour collaborative "Green Room" to merge their DNA into a shared playlist.
      Include a placeholder for the Green Room link: [GREEN_ROOM_LINK]
      
      Respond with ONLY the email body in Markdown format.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const emailDraft = response.text().trim();

        return NextResponse.json({
            draft: emailDraft,
            subject: `A Musical Proposition from ${senderData.display_name} (DNA Similarity: ${similarity}%)`
        });
    } catch (error) {
        console.error("Invite Drafting Error:", error);
        return NextResponse.json({ error: "Failed to draft invitation" }, { status: 500 });
    }
}
