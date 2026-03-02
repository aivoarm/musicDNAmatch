export const SPOTIFY_SCOPES = [
    "user-read-private",
    "user-read-email",
    "user-top-read",
    "user-read-recently-played",
    "playlist-modify-public",
    "playlist-modify-private",
].join(" ");

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;

export const getAuthUrl = () => {
    const params = new URLSearchParams({
        client_id: client_id!,
        response_type: "code",
        redirect_uri: redirect_uri!,
        scope: SPOTIFY_SCOPES,
        show_dialog: "true",
    });
    return `https://accounts.spotify.com/authorize?${params.toString()}`;
};

export const getTokens = async (code: string) => {
    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${btoa(`${client_id}:${client_secret}`)}`,
        },
        body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: redirect_uri!,
        }),
    });

    return response.json();
};

export const getTopTracks = async (access_token: string) => {
    const response = await fetch("https://api.spotify.com/v1/me/top/tracks?limit=20&time_range=medium_term", {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });

    return response.json();
};

export const getAudioFeatures = async (access_token: string, trackIds: string[]) => {
    const response = await fetch(`https://api.spotify.com/v1/audio-features?ids=${trackIds.join(",")}`, {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });

    return response.json();
};

export const createPlaylist = async (access_token: string, userId: string, name: string, description: string) => {
    const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name,
            description,
            public: false,
        }),
    });

    return response.json();
};

export const addTracksToPlaylist = async (access_token: string, playlistId: string, trackUris: string[]) => {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            uris: trackUris,
        }),
    });

    return response.json();
};
