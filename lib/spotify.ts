
export interface SpotifyPlaylist {
    id: string;
    name: string;
    image: string;
    track_count: number;
    url: string;
}

export interface SpotifyTrack {
    id: string;
    title: string;
    artist: string;
    artistId?: string;
    thumbnail: string;
    url: string;
}

export class SpotifyPublicFetcher {
    private clientId: string;
    private clientSecret: string;
    private accessToken: string | null = null;

    constructor(clientId: string, clientSecret: string) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    private async getAccessToken(): Promise<string> {
        if (this.accessToken) return this.accessToken;

        const authStr = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
        const res = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Authorization": `Basic ${authStr}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: "grant_type=client_credentials"
        });

        if (!res.ok) {
            const errBody = await res.text();
            throw new Error(`Failed to get Spotify token: ${res.status} ${res.statusText} - ${errBody}`);
        }

        const data = await res.json();
        this.accessToken = data.access_token;
        return this.accessToken!;
    }

    async getUserPublicData(spotifyUserId: string, playlistIdToFetch?: string, limit: number = 5, offset: number = 0) {
        const token = await this.getAccessToken();
        const headers = { "Authorization": `Bearer ${token}` };

        // ANALYSIS STAGE: Fetch specific playlist tracks
        if (playlistIdToFetch && playlistIdToFetch !== "None") {
            const url = `https://api.spotify.com/v1/playlists/${playlistIdToFetch}/tracks?limit=50`;
            try {
                const res = await fetch(url, { headers });
                if (!res.ok) {
                    const errBody = await res.text();
                    throw new Error(`Spotify Playlist tracks fetch failed: ${res.status} - ${errBody}`);
                }
                const data = await res.json();
                const items = data.items || [];
                const tracks: SpotifyTrack[] = items
                    .filter((item: any) => item.track)
                    .map((item: any) => ({
                        id: item.track.id,
                        title: item.track.name,
                        artist: item.track.artists[0]?.name || "Unknown Artist",
                        artistId: item.track.artists[0]?.id || "",
                        thumbnail: item.track.album?.images[0]?.url || "",
                        url: item.track.external_urls?.spotify || ""
                    }));
                return { tracks };
            } catch (e: any) {
                return { error: e.message };
            }
        }

        // DISCOVERY STAGE: Fetch playlists
        // 1. Direct ID Access
        const directUrl = `https://api.spotify.com/v1/users/${spotifyUserId}/playlists?limit=${limit}&offset=${offset}`;
        let res = await fetch(directUrl, { headers });
        let playlistsRaw = [];
        let total = 0;

        if (res.status === 200) {
            const data = await res.json();
            playlistsRaw = data.items || [];
            total = data.total || 0;
        } else {
            // 2. Targeted Search Access
            const searchQuery = `owner:${spotifyUserId}`;
            const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=playlist&limit=${limit}&offset=${offset}`;
            res = await fetch(searchUrl, { headers });
            let data = await res.json();
            playlistsRaw = data.playlists?.items || [];
            total = data.playlists?.total || 0;

            // 3. Last Resort
            if (playlistsRaw.length === 0) {
                const fallbackUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(spotifyUserId)}&type=playlist&limit=${limit}&offset=${offset}`;
                res = await fetch(fallbackUrl, { headers });
                data = await res.json();
                playlistsRaw = data.playlists?.items || [];
                total = data.playlists?.total || 0;
            }
        }

        const playlists: SpotifyPlaylist[] = playlistsRaw
            .filter((pl: any) => pl)
            .map((pl: any) => ({
                id: pl.id,
                name: pl.name,
                image: pl.images?.[0]?.url || "",
                track_count: pl.tracks?.total || 0,
                url: pl.external_urls?.spotify || ""
            }));

        return {
            playlists,
            total,
            offset,
            limit
        };
    }
}
