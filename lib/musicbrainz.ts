/**
 * musicDNAmatch — MusicBrainz API Client
 * Optimized for Edge Runtime.
 */

export interface MusicBrainzArtist {
    id: string;
    name: string;
    type?: string;
    country?: string;
    tags?: { name: string; count: number }[];
}

export class MusicBrainzClient {
    private baseUrl = "https://musicbrainz.org/ws/2";
    private userAgent = "MusicDNAmatch/1.0.0 ( artist-dna-sync@musicdnamatch.com )";

    private async fetchMB(endpoint: string, params: Record<string, string>): Promise<any> {
        const query = new URLSearchParams({ ...params, fmt: "json" }).toString();
        const url = `${this.baseUrl}${endpoint}?${query}`;

        const res = await fetch(url, {
            headers: {
                "User-Agent": this.userAgent,
                "Accept": "application/json"
            }
        });

        if (!res.ok) {
            if (res.status === 503) {
                // Rate limited - MusicBrainz is strict (1 req/sec)
                console.warn("MusicBrainz: Rate limited. Retrying in 1s...");
                await new Promise(r => setTimeout(r, 1000));
                return this.fetchMB(endpoint, params);
            }
            throw new Error(`MusicBrainz API error: ${res.status}`);
        }

        return res.json();
    }

    /**
     * Search for an artist by name.
     */
    async searchArtist(name: string): Promise<MusicBrainzArtist | null> {
        try {
            const data = await this.fetchMB("/artist", { query: `artist:"${name}"`, limit: "1" });
            const artist = data.artists?.[0];
            if (!artist) return null;

            return {
                id: artist.id,
                name: artist.name,
                type: artist.type,
                country: artist.country,
                tags: artist.tags?.map((t: any) => ({ name: t.name, count: t.count })) || []
            };
        } catch (error) {
            console.error("MusicBrainz Search Error:", error);
            return null;
        }
    }

    /**
     * Get detailed metadata for an artist using MBID.
     */
    async getArtistDetails(mbid: string): Promise<MusicBrainzArtist | null> {
        try {
            const data = await this.fetchMB(`/artist/${mbid}`, { inc: "tags+genres+aliases" });
            if (!data) return null;

            return {
                id: data.id,
                name: data.name,
                type: data.type,
                country: data.country,
                tags: data.tags?.map((t: any) => ({ name: t.name, count: t.count })) || []
            };
        } catch (error) {
            console.error("MusicBrainz Details Error:", error);
            return null;
        }
    }
}
