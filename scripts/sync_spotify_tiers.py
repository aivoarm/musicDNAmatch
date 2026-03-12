import json
import os
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from dotenv import load_dotenv

# Load credentials from .env.local
load_dotenv('.env.local')

# --- CONFIGURATION ---
CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID')
CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET')
JSON_FILE = os.path.join(os.path.dirname(__file__), '../lib/yt-tiers.json')

# Mapping Spotify genre keywords to your JSON keys
GENRE_MAP = {
    "rap": "rap", "hip hop": "rap", "trap": "rap",
    "pop": "pop", "dance pop": "pop",
    "rock": "rock", "metal": "metal",
    "edm": "electronic", "electro": "electronic", "house": "electronic", "dance": "electronic",
    "jazz": "jazz",
    "r&b": "rnb", "urban contemporary": "rnb", "soul": "rnb",
    "latin": "latin", "reggaeton": "latin",
    "afropop": "afrobeats", "afrobeats": "afrobeats",
    "indie": "indie", "alternative": "indie",
    "funk": "funk",
    "classical": "classical",
    "ambient": "ambient",
    "kpop": "kpop", "k-pop": "kpop"
}

if not CLIENT_ID or not CLIENT_SECRET:
    print("❌ Spotify credentials not found in .env.local")
    exit(1)

auth_manager = SpotifyClientCredentials(client_id=CLIENT_ID, client_secret=CLIENT_SECRET)
sp = spotipy.Spotify(auth_manager=auth_manager)

def update_json_tiers(new_data):
    """Updates the yt-tiers.json file with new artists."""
    try:
        with open(JSON_FILE, 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"❌ JSON file not found at {JSON_FILE}")
        return

    count = 0
    added_to_tiers = {} # track by tier for summary
    
    # Normalize existing artists for lookup
    existing_by_tier = {}
    for tier, content in data['yt_tiers'].items():
        existing_by_tier[tier] = [a.lower() for a in content['gold']]

    for entry in new_data:
        artist_name = entry['artist'].lower()
        assigned_tier = None
        
        # Determine tier based on genres
        for genre in entry['genres']:
            genre_lower = genre.lower()
            for keyword, tier_key in GENRE_MAP.items():
                if keyword in genre_lower:
                    assigned_tier = tier_key
                    break
            if assigned_tier: break
        
        # If we found a matching tier, add artist to gold if not already there
        if assigned_tier and assigned_tier in data['yt_tiers']:
            if artist_name not in existing_by_tier[assigned_tier]:
                data['yt_tiers'][assigned_tier]['gold'].append(artist_name)
                existing_by_tier[assigned_tier].append(artist_name) # update cache
                count += 1
                if assigned_tier not in added_to_tiers:
                    added_to_tiers[assigned_tier] = []
                added_to_tiers[assigned_tier].append(artist_name)

    with open(JSON_FILE, 'w') as f:
        json.dump(data, f, indent=4)
        
    print(f"\n✅ Success! Added {count} new artists to {JSON_FILE}")
    if count > 0:
        for tier, artists in added_to_tiers.items():
            print(f"   [{tier}]: {len(artists)} new")
            # Limit display to 5 per tier
            for a in artists[:5]:
                print(f"     - {a}")
            if len(artists) > 5:
                print(f"     - ...and {len(artists)-5} more")

def get_dynamic_tracks():
    """Fetches top tracks from various categories."""
    final_list = []
    # Using search for playlists by genre name - more reliable across regions
    genre_queries = [
        'Pop', 'Hip Hop', 'Rock', 'R&B', 'Electronic', 'Indie', 'Latin', 'K-pop', 
        'Metal', 'Jazz', 'Classical', 'Soul', 'Ambient', 'Afrobeat', 'Funk'
    ]
    
    print(f"Searching playlists for {len(genre_queries)} genres...")
    
    for query in genre_queries:
        try:
            # 2. Search for top playlists for this genre
            search_res = sp.search(q=query, type='playlist', limit=3)
            playlists = search_res['playlists']['items']
            if not playlists: continue
            
            for playlist in playlists:
                if not playlist: continue
                # 3. Get top 20 tracks from playlist
                results = sp.playlist_tracks(playlist['id'], limit=20)
                
                track_batch = []
                artist_ids = []
                
                for item in results['items']:
                    track = item.get('track')
                    if not track: continue
                    
                    artist = track['artists'][0]
                    # Deduping artist IDs in the same batch
                    if artist['id'] not in artist_ids:
                        artist_ids.append(artist['id'])
                        track_batch.append({
                            "artist_id": artist['id'],
                            "artist_name": artist['name']
                        })
                
                # Fetch genres for artists in batch
                if artist_ids:
                    # Spotify limit is 50 per artists() call
                    for i in range(0, len(artist_ids), 50):
                        batch = artist_ids[i:i+50]
                        artists_info = sp.artists(batch)
                        
                        # Map IDs back to objects
                        info_map = {a['id']: a['genres'] for a in artists_info['artists'] if a}
                        
                        for t in track_batch:
                            final_list.append({
                                "artist": t['artist_name'],
                                "genres": info_map.get(t['artist_id'], [])
                            })
                            
            print(f"   - Processed {cat_id}")
        except Exception as e:
            # Category might not exist in all markets or other API error
            continue

    return final_list

if __name__ == "__main__":
    print("🚀 Starting Spotify Data Extraction and Tier Synchronization...")
    music_data = get_dynamic_tracks()
    if not music_data:
        print("❌ No music data found. Check your API credentials or network.")
    else:
        print(f"Found {len(music_data)} artist entries. Filtering and updating tiers...")
        update_json_tiers(music_data)
