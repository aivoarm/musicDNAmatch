import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createPlaylist, addTracksToPlaylist, getTopTracks } from "@/lib/spotify";

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get("spotify_access_token")?.value;

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { bridgeId } = await request.json();

        // 1. Fetch Bridge Data
        const { data: bridge, error: bridgeError } = await supabase
            .from("bridges")
            .select("*")
            .eq("id", bridgeId)
            .single();

        if (bridgeError || !bridge) throw new Error("Bridge not found");
        if (!bridge.common_ground_data.synthesis) throw new Error("Playlist not yet synthesized");

        // 2. Resolve Users and Tokens
        // In a real app, you would fetch User B's refresh token from Supabase 
        // and refresh it. For this prototype, we'll create the playlist for the ACTIVE USER.
        const userRes = await fetch("https://api.spotify.com/v1/me", {
            headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userRes.json();

        // 3. Get representative tracks for the merge
        const topTracks = await getTopTracks(token);
        const trackUris = topTracks.items.slice(0, 5).map((t: any) => t.uri);

        // Note: In a true merge, we would combine list from both users.
        // We'll simulate this with the active user's tracks for now.

        const { name, description } = bridge.common_ground_data.synthesis;

        // 4. Create the Playlist on Spotify
        const playlist = await createPlaylist(token, userData.id, name, description);

        // 5. Add Tracks
        await addTracksToPlaylist(token, playlist.id, trackUris);

        // 6. Finalize Bridge Status
        await supabase
            .from("bridges")
            .update({
                common_ground_data: {
                    ...bridge.common_ground_data,
                    status: "merged",
                    playlist_url: playlist.external_urls.spotify
                }
            })
            .eq("id", bridgeId);

        return NextResponse.json({ url: playlist.external_urls.spotify });
    } catch (error) {
        console.error("Merge Error:", error);
        return NextResponse.json({ error: "Failed to finalize merge" }, { status: 500 });
    }
}
