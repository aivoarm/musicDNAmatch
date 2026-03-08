
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
    preview_url?: string;
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

    async searchArtists(query: string, limit: number = 5, offset: number = 0) {
        const token = await this.getAccessToken();
        const headers = { "Authorization": `Bearer ${token}` };
        const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=${limit}&offset=${offset}`;

        try {
            const res = await fetch(url, { headers });
            if (!res.ok) throw new Error("Artist search failed");
            const data = await res.json();

            return data.artists?.items?.map((a: any) => ({
                id: a.id,
                name: a.name,
                image: a.images?.[0]?.url || "",
                genres: a.genres || [],
                popularity: a.popularity || 0,
                url: a.external_urls?.spotify || ""
            })) || [];
        } catch (e: any) {
            console.error("Spotify searchArtists error:", e);
            return [];
        }
    }

    async getArtistTopTracks(artistId: string) {
        const token = await this.getAccessToken();
        const headers = { "Authorization": `Bearer ${token}` };
        // Spotify requires a market parameter for top tracks, typically "US" or from user.
        const url = `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`;

        try {
            const res = await fetch(url, { headers });
            if (!res.ok) throw new Error("Failed to fetch artist top tracks");
            const data = await res.json();

            const tracks: SpotifyTrack[] = (data.tracks || []).map((t: any) => ({
                id: t.id,
                title: t.name,
                artist: t.artists[0]?.name || "Unknown Artist",
                artistId: t.artists[0]?.id || "",
                thumbnail: t.album?.images[0]?.url || "",
                url: t.external_urls?.spotify || "",
                preview_url: t.preview_url
            }));

            return { tracks };
        } catch (e: any) {
            console.error("Spotify getArtistTopTracks error:", e);
            return { error: e.message, tracks: [] };
        }
    }
    async getAudioFeatures(trackIds: string[]) {
        if (!trackIds.length) return [];
        const token = await this.getAccessToken();
        const headers = { "Authorization": `Bearer ${token}` };
        // Max 100 IDs per request
        const ids = trackIds.slice(0, 100).join(",");
        const url = `https://api.spotify.com/v1/audio-features?ids=${ids}`;

        try {
            const res = await fetch(url, { headers });
            if (!res.ok) {
                // Spotify deprecated this endpoint for general public access in Nov 2024
                // Status 403 or 410 might occur for certain apps.
                if (res.status === 403 || res.status === 410 || res.status === 401) {
                    console.warn(`Spotify audio-features restricted/deprecated (${res.status}). Falling back to genre-based DNA.`);
                    return [];
                }
                const body = await res.text();
                console.error(`Spotify audio-features API error: ${res.status} ${res.statusText}`, body);
                throw new Error(`Audio features fetch failed: ${res.status}`);
            }
            const data = await res.json();
            return data.audio_features || [];
        } catch (e) {
            // Silently fail to allow DNA computation fallback to rely on genres
            return [];
        }
    }

    async getAvailableGenreSeeds() {
        const token = await this.getAccessToken();
        const headers = { "Authorization": `Bearer ${token}` };
        const url = "https://api.spotify.com/v1/recommendations/available-genre-seeds";

        try {
            const res = await fetch(url, { headers });
            if (!res.ok) return [];
            const data = await res.json();
            return data.genres || [];
        } catch (e) {
            return [];
        }
    }

    async getRecommendations(seedArtistIds: string[], seedGenres: string[], seedTrackIds: string[], limit: number = 10) {
        const token = await this.getAccessToken();
        const headers = { "Authorization": `Bearer ${token}` };

        const params = new URLSearchParams();
        if (seedArtistIds.length) params.append("seed_artists", seedArtistIds.slice(0, 5).join(","));
        if (seedGenres.length) params.append("seed_genres", seedGenres.slice(0, 5).join(","));
        if (seedTrackIds.length) params.append("seed_tracks", seedTrackIds.slice(0, 5).join(","));
        params.append("limit", limit.toString());

        const url = `https://api.spotify.com/v1/recommendations?${params.toString()}`;

        try {
            const res = await fetch(url, { headers });
            if (!res.ok) {
                const body = await res.text();
                console.error(`Spotify recommendations API error: ${res.status} ${res.statusText}`, body);

                // If 404, it's likely an invalid seed.
                if (res.status === 404 || res.status === 400) {
                    console.warn("Invalid seeds detected for Spotify recommendations. Attempting fallback...");
                }
                return { tracks: [] };
            }
            const data = await res.json();
            const tracks: SpotifyTrack[] = (data.tracks || []).map((t: any) => ({
                id: t.id,
                title: t.name,
                artist: t.artists[0]?.name || "Unknown",
                artistId: t.artists[0]?.id || "",
                thumbnail: t.album?.images[0]?.url || "",
                url: t.external_urls?.spotify || "",
                preview_url: t.preview_url
            }));
            return { tracks };
        } catch (e) {
            console.error("getRecommendations error:", e);
            return { tracks: [] };
        }
    }

    async getArtists(artistIds: string[]) {
        if (!artistIds.length) return [];
        const token = await this.getAccessToken();
        const headers = { "Authorization": `Bearer ${token}` };
        const ids = artistIds.slice(0, 50).join(",");
        const url = `https://api.spotify.com/v1/artists?ids=${ids}`;

        try {
            const res = await fetch(url, { headers });
            if (!res.ok) return [];
            const data = await res.json();
            return data.artists || [];
        } catch (e) {
            return [];
        }
    }
}
