from http.server import BaseHTTPRequestHandler
import json
import librosa
import numpy as np
import requests
import io

class handler(BaseHTTPRequestHandler):
    """
    Vercel Serverless Function Handler
    """
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        payload = json.loads(post_data)
        
        audio_url = payload.get('audio_url')
        
        if not audio_url:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b"No audio_url provided")
            return
            
        try:
            # Download audio to memory (for serverless simplicity)
            r = requests.get(audio_url)
            audio_io = io.BytesIO(r.content)
            
            # Load with librosa
            y, sr = librosa.load(audio_io)
            
            # 1. Extraction: Spectral Centroid, Bandwidth, Rolloff
            spec_centroid = np.mean(librosa.feature.spectral_centroid(y=y, sr=sr))
            spec_bw = np.mean(librosa.feature.spectral_bandwidth(y=y, sr=sr))
            spec_rolloff = np.mean(librosa.feature.spectral_rolloff(y=y, sr=sr))
            
            # 2. Rhythmic: Tempo, Pulse Saliency
            tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
            pulse = np.mean(librosa.pulse.plp(y=y, sr=sr))
            
            # 3. Psychoacoustic: Flatness, RMS, Zero Crossing Rate
            flatness = np.mean(librosa.feature.spectral_flatness(y=y))
            rms = np.mean(librosa.feature.rms(y=y))
            zcr = np.mean(librosa.feature.zero_crossing_rate(y=y))
            
            # Normalize and generate 12D Vector
            # [Cen, BW, Roll, Tempo, Pulse, Stab, Flat, RMS, ZCR, M1, M2, M3]
            dna_vector = [
                float(spec_centroid / 5000), float(spec_bw / 3000), float(spec_rolloff / 8000),
                float(tempo / 200), float(pulse), 0.5, 
                float(flatness), float(rms * 10), float(zcr),
                0.5, 0.5, 0.5 
            ]
            dna_vector = np.clip(dna_vector, 0, 1).tolist()
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            response = {
                "dna_version": "2.0",
                "vectors": {
                    "spectral": [dna_vector[0], dna_vector[1], dna_vector[2]],
                    "rhythmic": [dna_vector[3], dna_vector[4]],
                    "psychoacoustic": [dna_vector[6], dna_vector[7]]
                },
                "markers": {
                    "tension_index": dna_vector[8],
                    "pulse_stability": "mid",
                    "timbral_weight": "spectral-high"
                },
                "sonic_embedding": dna_vector
            }
            
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(str(e).encode())
            
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/plain')
        self.end_headers()
        self.wfile.write(b"Music DNA Analysis Engine v2.0 (Active)")
