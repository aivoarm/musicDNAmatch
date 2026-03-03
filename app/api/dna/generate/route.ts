import { cookies } from "next/headers";
import { computeDNA } from "@/lib/dna";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { getPersonalHistory, filterMusicVideos } from "@/lib/youtube";

export async function POST() {
    const cookieStore = await cookies();
    const googleToken = cookieStore.get("google_access_token")?.value;

    // ALLOW ACCESS WITHOUT TOKEN - FALLBACK TO SAMPLE DNA
    if (!googleToken) {
        console.log("No auth token. Generating baseline DNA sample.");
        // Generate a baseline sample DNA if no history is available
        const sampleTracks = [
            { genres: ["spectral", "ambient"], popularity: 50, duration_ms: 240000, release_year: 2024 },
            { genres: ["rhythm", "density"], popularity: 80, duration_ms: 180000, release_year: 2023 }
        ];
        const dna = computeDNA(sampleTracks);

        return NextResponse.json({
            ...dna,
            top_genres: ["Spectral Synthesis", "Public Signature", "Baseline"],
            recent_tracks: [],
            display_name: "Anonymous Signal",
        });
    }

    try {
        let userId = "";
        let userName = "Anonymous";
        let userPicture = "";

        const cachedUser = cookieStore.get("google_user")?.value;
        if (cachedUser) {
            const user = JSON.parse(cachedUser);
            userId = user.sub;
            userName = user.name;
            userPicture = user.picture;
        } else {
            const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${googleToken}` },
            });
            const googleUser = await userRes.json();
            userId = googleUser.sub;
            userName = googleUser.name;
            userPicture = googleUser.picture;
        }

        const allVideos = await getPersonalHistory(googleToken, 50);
        const videos = await filterMusicVideos(allVideos);

        if (!videos || videos.length === 0) {
            return NextResponse.json({
                error: "No YouTube history detected. Baseline signal generated.",
                ...computeDNA([])
            }, { status: 200 }); // Graceful fallback
        }

        const trackDataList = videos.map((v: any) => {
            const title = v.title.toLowerCase();
            const genres: string[] = [];
            if (title.includes("lofi") || title.includes("chill")) genres.push("ambient", "lofi");
            if (title.includes("rock")) genres.push("rock");
            if (title.includes("pop")) genres.push("pop");
            if (title.includes("techno") || title.includes("house")) genres.push("electronic");

            return { popularity: 80, duration_ms: 210000, release_year: 2024, genres };
        });

        const dna = computeDNA(trackDataList);

        // Optional DB update if we have a user
        if (userId) {
            await supabase.from("dna_profiles").upsert({
                user_id: userId,
                sonic_embedding: dna.vector,
                metadata: {
                    display_name: userName,
                    images: [{ url: userPicture }],
                    dna_version: dna.version,
                    source: "youtube"
                },
                broadcasting: true
            }, { onConflict: "user_id" });
        }

        return NextResponse.json({
            ...dna,
            top_genres: Array.from(new Set(trackDataList.flatMap((t: any) => t.genres))).slice(0, 10),
            recent_tracks: videos.slice(0, 5),
            display_name: userName,
        });
    } catch (error) {
        console.error("DNA Generation Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
