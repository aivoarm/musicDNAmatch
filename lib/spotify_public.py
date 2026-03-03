import requests
import os
import json
import base64
import sys
from typing import List, Dict

class SpotifyPublicFetcher:
    def __init__(self, client_id: str, client_secret: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.access_token = self._get_access_token()

    def _get_access_token(self) -> str:
        """Get a Client Credentials token (No User Login Required)"""
        auth_str = f"{self.client_id}:{self.client_secret}"
        encoded_auth = base64.b64encode(auth_str.encode()).decode()
        
        response = requests.post(
            "https://accounts.spotify.com/api/token",
            headers={"Authorization": f"Basic {encoded_auth}"},
            data={"grant_type": "client_credentials"}
        )
        return response.json().get("access_token")

    def get_user_public_data(self, spotify_user_id: str, playlist_id_to_fetch: str = None, limit: int = 5, offset: int = 0) -> Dict:
        """Fetch either user's top playlists or tracks from a specific playlist"""
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        # ANALYSIS STAGE: Fetch specific playlist tracks
        if playlist_id_to_fetch:
            url = f"https://api.spotify.com/v1/playlists/{playlist_id_to_fetch}/tracks"
            try:
                res = requests.get(url, headers=headers)
                items = res.json().get("items", [])
                tracks = []
                for item in items:
                    track = item.get("track")
                    if not track: continue
                    tracks.append({
                        "id": track["id"],
                        "title": track["name"],
                        "artist": track["artists"][0]["name"],
                        "thumbnail": track["album"]["images"][0]["url"] if track["album"]["images"] else "",
                        "url": track["external_urls"]["spotify"]
                    })
                return {"tracks": tracks}
            except Exception as e:
                return {"error": str(e)}

        # DISCOVERY STAGE: Fetch playlists by ID or Handle
        # We try 3 levels of depth to find playlists owned by the user
        
        # 1. Direct ID Access (Canonical Spotify Username)
        direct_url = f"https://api.spotify.com/v1/users/{spotify_user_id}/playlists?limit={limit}&offset={offset}"
        res = requests.get(direct_url, headers=headers)
        
        if res.status_code == 200:
            res_data = res.json()
            playlists_raw = res_data.get("items", [])
            total = res_data.get("total", 0)
        else:
            # 2. Targeted Search Access (Fuzzy username / owner search)
            # This is critical for users who only know their display name or vanity handle
            search_query = f"owner:{spotify_user_id}"
            search_url = f"https://api.spotify.com/v1/search?q={search_query}&type=playlist&limit={limit}&offset={offset}"
            res = requests.get(search_url, headers=headers)
            res_data = res.json()
            playlists_raw = res_data.get("playlists", {}).get("items", [])
            total = res_data.get("playlists", {}).get("total", 0)
            
            # 3. Last Resort: Broad query if owner specific search yielded nothing
            if not playlists_raw:
                search_url = f"https://api.spotify.com/v1/search?q={spotify_user_id}&type=playlist&limit={limit}&offset={offset}"
                res = requests.get(search_url, headers=headers)
                res_data = res.json()
                playlists_raw = res_data.get("playlists", {}).get("items", [])
                total = res_data.get("playlists", {}).get("total", 0)

        playlists = []
        for pl in playlists_raw:
            if not pl: continue
            playlists.append({
                "id": pl["id"],
                "name": pl["name"],
                "image": pl["images"][0]["url"] if pl.get("images") and len(pl["images"]) > 0 else "",
                "track_count": pl["tracks"]["total"],
                "url": pl["external_urls"]["spotify"]
            })
        
        return {
            "playlists": playlists,
            "total": total,
            "offset": offset,
            "limit": limit
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No user ID provided"}))
        sys.exit(1)
        
    spotify_id = sys.argv[1].replace("@", "").strip()
    playlist_id = sys.argv[2] if len(sys.argv) > 2 and sys.argv[2] != "None" else None
    limit = int(sys.argv[3]) if len(sys.argv) > 3 else 5
    offset = int(sys.argv[4]) if len(sys.argv) > 4 else 0
    
    C_ID = os.getenv("SPOTIFY_CLIENT_ID")
    C_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
    
    if not C_ID or not C_SECRET:
        print(json.dumps({"error": "Admin credentials missing in .env"}))
        sys.exit(1)
        
    try:
        fetcher = SpotifyPublicFetcher(C_ID, C_SECRET)
        data = fetcher.get_user_public_data(spotify_id, playlist_id, limit, offset)
        print(json.dumps(data))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
