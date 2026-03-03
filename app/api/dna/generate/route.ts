import { cookies } from "next/headers";
import { computeDNA } from "@/lib/dna";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { getPersonalHistory, filterMusicVideos } from "@/lib/youtube";

export async function POST() {
    const cookieStore = await cookies();
    const googleToken = cookieStore.get("google_access_token")?.value;

    if (!googleToken) {
        return NextResponse.json({ error: "Unauthorized. Please connect Google first." }, { status: 401 });
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
            // Fallback to fetch if cookie missing
            const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${googleToken}` },
            });
            const googleUser = await userRes.json();
            userId = googleUser.sub;
            userName = googleUser.name;
            userPicture = googleUser.picture;
        }

        // 1. Fetch user's YouTube activities (likes/uploads)
        const allVideos = await getPersonalHistory(googleToken, 50);

        // 2. Filter for Music category (ID 10) only
        const videos = await filterMusicVideos(allVideos);

        if (!videos || videos.length === 0) {
            return NextResponse.json({
                error: (allVideos.length > 0)
                    ? "We found YouTube activity, but none of it was recognized as 'Music'. Try liking some music videos first!"
                    : "No YouTube history detected. Like some music videos first!"
            }, { status: 400 });
        }

        // 3. Build mock TrackData based on title analysis for "DNA"
        // Since we don't have a real audio analyzer on the edge yet, 
        // we use keywords to weight the computeDNA function's inputs.
        const trackDataList = videos.map((v: any) => {
            const title = v.title.toLowerCase();
            const genres: string[] = [];

            if (title.includes("lofi") || title.includes("chill")) genres.push("ambient", "lofi", "chillout");
            if (title.includes("rock") || title.includes("metal")) genres.push("rock", "heavy metal");
            if (title.includes("pop") || title.includes("top 40")) genres.push("pop", "dance");
            if (title.includes("techno") || title.includes("house") || title.includes("bass")) genres.push("electronic", "techno", "edm");
            if (title.includes("jazz") || title.includes("soul")) genres.push("jazz", "soul");

            return {
                popularity: 80,
                duration_ms: 210000,
                release_year: 2024,
                genres,
            };
        });

        console.log("Computing 12D DNA vector from YouTube signal...");

        // 3. Compute the 12D DNA Vector
        const dna = computeDNA(trackDataList);

        // 4. Store in Supabase
        const { error: dbError } = await supabase
            .from("dna_profiles")
            .upsert({
                user_id: userId,
                sonic_embedding: dna.vector,
                metadata: {
                    display_name: userName,
                    images: [{ url: userPicture }],
                    dna_version: dna.version,
                    markers: dna.markers,
                    source: "youtube"
                },
                broadcasting: true
            }, { onConflict: "user_id" });

        if (dbError) {
            console.error("Supabase Error:", dbError.message);
        }

        return NextResponse.json({
            ...dna,
            top_genres: Array.from(new Set(trackDataList.flatMap((t: any) => t.genres))).slice(0, 10),
            recent_tracks: videos.slice(0, 5),
            display_name: userName,
        });
    } catch (error) {
        console.error("YouTube DNA Generation Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
