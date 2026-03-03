export interface YouTubeVideo {
    id: string;
    title: string;
    thumbnail: string;
    channelTitle: string;
    publishedAt: string;
}

const API_KEY = process.env.YOUTUBE_API_KEY;

export async function searchYouTube(query: string, maxResults = 5): Promise<YouTubeVideo[]> {
    if (!API_KEY) {
        console.warn("YOUTUBE_API_KEY is not defined. Returning empty results.");
        return [];
    }

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.error) {
            console.error("YouTube API Error:", data.error);
            return [];
        }

        const rawResults = (data.items || []).map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
        })).filter((v: any) => !!v.id);

        // De-duplicate
        const unique = Array.from(new Map<string, YouTubeVideo>(rawResults.map((v: any) => [v.id, v])).values());

        // Filter strictly for music category
        return await filterMusicVideos(unique);
    } catch (err) {
        console.error("Failed to search YouTube:", err);
        return [];
    }
}

export async function getVideoDetails(videoId: string) {
    if (!API_KEY) return null;

    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        return data.items?.[0] || null;
    } catch (err) {
        console.error("Failed to get video details:", err);
        return null;
    }
}

export async function getTrendingMusic(maxResults = 10): Promise<YouTubeVideo[]> {
    if (!API_KEY) return [];

    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&videoCategoryId=10&maxResults=${maxResults}&key=${API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        const rawResults = (data.items || []).map((item: any) => ({
            id: item.id,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
        })).filter((v: any) => !!v.id);

        // De-duplicate
        return Array.from(new Map<string, YouTubeVideo>(rawResults.map((v: any) => [v.id, v])).values());
    } catch (err) {
        console.error("Failed to get trending music:", err);
        return [];
    }
}

export async function getPersonalHistory(accessToken: string, maxResults = 10): Promise<YouTubeVideo[]> {
    if (!accessToken) return [];

    // Fetch more internally so we have enough left after filtering for music
    const internalLimit = Math.max(maxResults * 3, 50);
    const url = `https://www.googleapis.com/youtube/v3/activities?part=snippet,contentDetails&mine=true&maxResults=${internalLimit}`;

    try {
        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();

        if (data.error) {
            console.error("YouTube User API error:", data.error);
            return [];
        }

        const items = (data.items || []).filter((item: any) =>
            item.snippet.type === "upload" || item.snippet.type === "like" || item.snippet.type === "playlistItem"
        );

        const rawResults = items.map((item: any) => {
            let videoId = "";
            if (item.contentDetails?.upload?.videoId) videoId = item.contentDetails.upload.videoId;
            else if (item.contentDetails?.like?.resourceId?.videoId) videoId = item.contentDetails.like.resourceId.videoId;
            else if (item.contentDetails?.playlistItem?.resourceId?.videoId) videoId = item.contentDetails.playlistItem.resourceId.videoId;

            return {
                id: videoId,
                title: item.snippet.title,
                thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
                channelTitle: item.snippet.channelTitle,
                publishedAt: item.snippet.publishedAt,
            };
        }).filter((v: any) => !!v.id);

        // De-duplicate
        const unique = Array.from(new Map<string, YouTubeVideo>(rawResults.map((v: any) => [v.id, v])).values());

        // Filter strictly for music category and return requested count
        const musicVideos = await filterMusicVideos(unique);
        return musicVideos.slice(0, maxResults);
    } catch (err) {
        console.error("Failed to get personal activities:", err);
        return [];
    }
}

export async function filterMusicVideos(videos: YouTubeVideo[]): Promise<YouTubeVideo[]> {
    if (!API_KEY || videos.length === 0) return videos;

    // Split into chunks of 50 (API limit)
    const filteredResults: YouTubeVideo[] = [];
    const chunkSize = 50;

    for (let i = 0; i < videos.length; i += chunkSize) {
        const chunk = videos.slice(i, i + chunkSize);
        const videoIds = chunk.map(v => v.id).join(',');
        const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoIds}&key=${API_KEY}`;

        try {
            const res = await fetch(url);
            const data = await res.json();

            if (data.error) {
                console.error("YouTube Category API error:", data.error);
                continue;
            }

            const musicVideoIds = new Set(
                (data.items || [])
                    .filter((item: any) => item.snippet.categoryId === "10")
                    .map((item: any) => item.id)
            );

            filteredResults.push(...chunk.filter(v => musicVideoIds.has(v.id)));
        } catch (err) {
            console.error("Failed to filter music chunk:", err);
        }
    }

    return filteredResults;
}
