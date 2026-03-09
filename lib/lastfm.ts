/**
 * musicDNAmatch — Last.fm API Client
 * Optimized for Edge Runtime.
 */

export interface LastFMTag {
    name: string;
    count: number;
}

export class LastFMClient {
    private apiKey = process.env.LASTFM_API_KEY;
    private baseUrl = "https://ws.audioscrobbler.com/2.0/";

    private async fetchLF(params: Record<string, string>): Promise<any> {
        if (!this.apiKey) {
            console.warn("Last.fm API Key is missing.");
            return null;
        }

        const query = new URLSearchParams({
            ...params,
            api_key: this.apiKey,
            format: "json"
        }).toString();

        const url = `${this.baseUrl}?${query}`;
        const res = await fetch(url);

        if (!res.ok) {
            console.error(`Last.fm API error: ${res.status}`);
            return null;
        }

        return res.json();
    }

    /**
     * Get top tags for an artist.
     */
    async getArtistTags(artist: string): Promise<LastFMTag[]> {
        const data = await this.fetchLF({
            method: "artist.getTopTags",
            artist: artist,
            autocorrect: "1"
        });

        if (!data?.toptags?.tag) return [];

        return data.toptags.tag.map((t: any) => ({
            name: t.name,
            count: parseInt(t.count) || 0
        }));
    }

    /**
     * Get top tags for a track.
     */
    async getTrackTags(artist: string, track: string): Promise<LastFMTag[]> {
        const data = await this.fetchLF({
            method: "track.getTopTags",
            artist: artist,
            track: track,
            autocorrect: "1"
        });

        if (!data?.toptags?.tag) return [];

        return data.toptags.tag.map((t: any) => ({
            name: t.name,
            count: parseInt(t.count) || 0
        }));
    }
}
