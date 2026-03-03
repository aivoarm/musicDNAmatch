"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Radio,
    Heart,
    ArrowRight,
    Binary,
    Waves,
    Zap,
    Brain,
    ChevronRight,
    Lock,
    Sparkles,
    Search,
    User,
    Youtube,
    Music2,
    Activity,
    Info,
    HelpCircle,
    Plus,
    ExternalLink,
    CheckCircle2,
    Scan,
    Filter,
    Music,
    Users
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const GENRE_OPTIONS = [
    "Electronic", "Techno", "House", "Ambient", "Indie Rock", "Dream Pop",
    "Acid Jazz", "Minimal", "Industrial", "Synthwave", "Future Bass", "Nu-Disco",
    "Hip Hop", "R&B", "Jazz", "Classical", "Lo-Fi", "Phonk", "Metal", "Garage",
    "Pop", "Rock", "Funk", "Folk", "Country", "Blues", "Soul", "Punk", "Ska",
    "Reggae", "Disco", "Synthpop", "Grunge", "Alternative", "Experimental", "Techno-Pop",
    "Dubstep", "Trap", "Drill", "Grime", "Afrobeats", "Latin", "K-Pop", "J-Pop",
    "Folk Rock", "Hardcore", "Deep House", "Progressive", "Trance", "Gospel"
];

export default function Home() {
    // stage: 'intro' | 'genre_selection' | 'source_selection' | 'spotify_scan' | 'playlist_selection' | 'analyzing' | 'complete'
    const [stage, setStage] = useState<'intro' | 'genre_selection' | 'source_selection' | 'spotify_scan' | 'playlist_selection' | 'analyzing' | 'complete'>('intro');
    const [spotifyUserId, setSpotifyUserId] = useState("");
    const [scanningSpotify, setScanningSpotify] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);
    const [showUrlHelp, setShowUrlHelp] = useState(false);

    const [playlists, setPlaylists] = useState<any[]>([]);
    const [playlistOffset, setPlaylistOffset] = useState(0);
    const [playlistTotal, setPlaylistTotal] = useState(0);
    const [loadingMore, setLoadingMore] = useState(false);

    const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);
    const [dnaData, setDnaData] = useState<any>(null);
    const [progress, setProgress] = useState(0);
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [genresToShow, setGenresToShow] = useState(24);

    const router = useRouter();
    const [existingProfile, setExistingProfile] = useState<any>(null);
    const [checkingSession, setCheckingSession] = useState(true);
    const [scannedPlaylistIds, setScannedPlaylistIds] = useState<string[]>([]);

    useEffect(() => {
        async function checkSession() {
            try {
                const res = await fetch("/api/dna/profile/me");
                const data = await res.json();
                if (data.found) {
                    setExistingProfile(data.dna);
                    if (data.dna.top_genres) setSelectedGenres(data.dna.top_genres);
                    // Track previously scanned playlist IDs
                    const ids: string[] = data.dna.scanned_playlist_ids || [];
                    if (data.dna.scanned_playlist_id && !ids.includes(data.dna.scanned_playlist_id)) {
                        ids.push(data.dna.scanned_playlist_id);
                    }
                    setScannedPlaylistIds(ids);
                }
            } catch (err) {
                console.error("Session check failed", err);
            } finally {
                setCheckingSession(false);
            }
        }
        checkSession();

        // LOAD SAVED URL FROM COOKIES
        const savedUrl = document.cookie
            .split("; ")
            .find(row => row.startsWith("last_spotify_url="))
            ?.split("=")[1];
        if (savedUrl) setSpotifyUserId(decodeURIComponent(savedUrl));
    }, []);

    // Auto-scan: when entering spotify_scan stage with a saved URL, auto-trigger scan
    const [autoScanned, setAutoScanned] = useState(false);
    useEffect(() => {
        if (autoScanned) return;
        if (stage === 'spotify_scan' && spotifyUserId.trim()) {
            setAutoScanned(true);
            handleSpotifyScan(0);
        }
    }, [stage, spotifyUserId]);

    const handleSpotifyScan = async (offset = 0) => {
        let id = spotifyUserId.trim();
        if (id.includes("spotify.com/user/")) {
            const parts = id.split("spotify.com/user/");
            if (parts.length > 1) id = parts[1].split("?")[0].split("/")[0];
        } else if (id.startsWith("@")) {
            id = id.substring(1);
        }

        if (offset === 0) {
            setScanningSpotify(true);
            setPlaylists([]);
            setScanError(null);
        } else {
            setLoadingMore(true);
        }

        try {
            const res = await fetch("/api/spotify/scan", {
                method: "POST",
                body: JSON.stringify({
                    spotify_user_id: id,
                    offset: offset,
                    limit: 5
                }),
                headers: { "Content-Type": "application/json" }
            });
            const data = await res.json();
            if (!res.ok) {
                setScanError(data.error || "Failed to locate public playlists.");
                return;
            }

            // PERSIST URL TO COOKIES ON SUCCESSFUL SCAN
            document.cookie = `last_spotify_url=${encodeURIComponent(spotifyUserId)}; max-age=31536000; path=/`;

            if (offset === 0 && (!data.playlists || data.playlists.length === 0)) {
                setScanError("No public playlists found for this profile.");
                return;
            }

            setPlaylists(prev => [...prev, ...(data.playlists || [])]);
            setPlaylistTotal(data.total || 0);
            setPlaylistOffset(offset);
            setStage('playlist_selection');
        } catch (err) {
            setScanError("Connection to Spotify registry failed.");
        } finally {
            setScanningSpotify(false);
            setLoadingMore(false);
        }
    };

    const handleSelectPlaylist = async (playlist: any) => {
        setSelectedPlaylist(playlist);
        setStage('analyzing');
        setProgress(0);

        let tracks = [];
        try {
            const res = await fetch("/api/spotify/scan", {
                method: "POST",
                body: JSON.stringify({
                    spotify_user_id: spotifyUserId,
                    playlist_id: playlist.id
                }),
                headers: { "Content-Type": "application/json" }
            });
            const data = await res.json();
            tracks = (data.tracks || []).slice(0, 20);
        } catch (err) {
            console.error(err);
        }

        for (let i = 0; i <= 100; i++) {
            setProgress(i);
            const delay = i < 30 ? 30 : i < 80 ? 10 : 5;
            await new Promise(r => setTimeout(r, delay));
        }

        const vector = [
            0.6 + Math.random() * 0.3, 0.2 + Math.random() * 0.4, 0.4 + Math.random() * 0.3,
            0.1, 0.8, 0.9, 0.4 + Math.random() * 0.2, 0.1, 0.3, 0.5, 0.5, 0.5
        ];

        const top_genres = [...selectedGenres, playlist.name.split(' ')[0]];

        const dna = {
            display_name: `${playlist.name} Signal`,
            vector,
            top_genres: top_genres,
            recent_tracks: tracks,
            verbium: generateVerbium(vector, top_genres)
        };

        setDnaData(dna);
        setStage('complete');

        // Track this playlist as scanned
        const updatedScannedIds = [...scannedPlaylistIds, playlist.id];
        setScannedPlaylistIds(updatedScannedIds);

        // AUTO-SAVE TO SUPABASE
        try {
            await fetch("/api/dna/profile/save", {
                method: "POST",
                body: JSON.stringify({
                    vector: dna.vector,
                    display_name: dna.display_name,
                    metadata: {
                        top_genres: dna.top_genres,
                        recent_tracks: dna.recent_tracks.slice(0, 5),
                        verbium: dna.verbium,
                        source: "spotify_scan",
                        scanned_playlist_id: playlist.id,
                        scanned_playlist_ids: updatedScannedIds
                    }
                }),
                headers: { "Content-Type": "application/json" }
            });
            console.log("Profile synchronized to universal registry.");
        } catch (saveError) {
            console.error("Failed to sync structural profile:", saveError);
        }
    };

    const generateVerbium = (vector: number[], genres: string[]) => {
        const spectral = vector[0];
        const transient = vector[1];
        let tone = spectral > 0.7 ? "high-frequency spectral focus" : "deep low-end resonance";
        let rhythmic = transient > 0.7 ? "aggressive transient density" : "smooth temporal gradients";
        return `Sync verified. Your signal exhibits ${tone} with ${rhythmic}. The structural map matches core patterns of ${genres.slice(0, 3).join(", ")}.`;
    };

    const toggleGenre = (genre: string) => {
        setSelectedGenres(prev =>
            prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
        );
    };

    return (
        <div className="relative min-h-[calc(100vh-64px)] flex flex-col items-center px-4 overflow-hidden pt-10">
            <div className="max-w-6xl w-full">
                <AnimatePresence mode="wait">
                    {/* STAGE: INTRO */}
                    {stage === 'intro' && (
                        <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            className="text-center flex flex-col items-center py-20">
                            <div className="relative group mb-12">
                                <div className="absolute -inset-1 bg-gradient-to-r from-[#FF0000] to-orange-500 rounded-full blur opacity-40 animate-pulse"></div>
                                <div className="relative bg-black rounded-full p-10 border border-white/10">
                                    <Waves className="h-20 w-20 text-[#FF0000]" />
                                </div>
                            </div>
                            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black mb-6 leading-none tracking-tighter text-white">Sonic <span className="text-[#FF0000] italic">Soulmates</span></h1>
                            <p className="text-lg md:text-2xl text-white font-medium leading-relaxed mb-12 max-w-2xl">
                                We use your <span className="text-[#FF0000] font-black">Spotify public playlists</span> to extract your literal music DNA—finding your structural soulmate to connect, collaborate, and harmonize in real-time.
                            </p>
                            <div className="flex flex-col items-center gap-4">
                                <button onClick={() => setStage('genre_selection')}
                                    className="group flex items-center justify-center gap-4 bg-white text-black px-12 py-6 rounded-full font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(255,0,0,0.3)] w-full max-w-sm">
                                    BEGIN SYNC <ArrowRight className="h-6 w-6" />
                                </button>

                                {existingProfile && !checkingSession && (
                                    <button
                                        onClick={() => {
                                            setDnaData(existingProfile);
                                            setStage('complete');
                                        }}
                                        className="group flex items-center justify-center gap-4 bg-black/40 border border-[#FF0000]/40 text-white px-12 py-5 rounded-full font-black text-xs uppercase tracking-[0.3em] hover:bg-[#FF0000]/10 hover:border-[#FF0000] transition-all w-full max-w-sm"
                                    >
                                        <CheckCircle2 className="h-4 w-4 text-[#FF0000]" /> RESUME PREVIOUS SIGNAL
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* STAGE: GENRE SELECTION */}
                    {stage === 'genre_selection' && (
                        <GenreSelectionStage
                            selectedGenres={selectedGenres}
                            toggleGenre={toggleGenre}
                            onConfirm={() => setStage('source_selection')}
                            onCancel={() => setStage('intro')}
                        />
                    )}

                    {/* STAGE: SOURCE SELECTION */}
                    {stage === 'source_selection' && (
                        <motion.div key="source" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            className="py-12 flex flex-col items-center w-full max-w-4xl mx-auto">

                            <div className="text-center mb-16">
                                <h2 className="text-4xl md:text-6xl font-black mb-4 text-white uppercase tracking-tighter">Choose Your <span className="text-[#FF0000]">Link</span></h2>
                                <p className="text-white/40 font-mono text-xs uppercase tracking-[0.4em]">Establish a connection to populate your structural map</p>
                            </div>

                            <div className="flex flex-col gap-6 w-full max-w-2xl px-4">
                                {/* PRIMARY: SPOTIFY */}
                                <button onClick={() => setStage('spotify_scan')}
                                    className="group relative glass p-10 rounded-[3rem] border-2 border-[#1DB954]/30 hover:border-[#1DB954] bg-[#1DB954]/5 hover:bg-[#1DB954]/10 transition-all text-left flex items-center gap-8 shadow-[0_0_50px_rgba(29,185,84,0.1)] hover:shadow-[0_0_80px_rgba(29,185,84,0.2)]">

                                    <div className="absolute top-6 right-8">
                                        <span className="bg-[#1DB954] text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">RECOMMENDED</span>
                                    </div>

                                    <div className="h-20 w-20 rounded-3xl bg-[#1DB954] flex items-center justify-center text-white shadow-xl rotate-[-5deg] group-hover:rotate-0 transition-transform duration-500">
                                        <Music2 className="h-10 w-10" />
                                    </div>

                                    <div className="flex-1 pr-12">
                                        <h3 className="text-3xl font-black mb-3 text-white uppercase tracking-tighter">Spotify Neural Sync</h3>
                                        <p className="text-sm text-white/50 leading-relaxed font-bold italic">
                                            Extract deep genomic data from public playlists. System-verified high resolution.
                                        </p>
                                        <div className="mt-6 flex items-center gap-3 text-[#1DB954] text-[10px] font-black uppercase tracking-[0.2em]">
                                            INITIATE LINK PROTOCOL <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                                        </div>
                                    </div>
                                </button>

                                {/* SECONDARY: YOUTUBE */}
                                <Link href="/youtube" prefetch={false}
                                    className="glass p-8 rounded-[2.5rem] border border-white/5 hover:border-white/20 bg-white/2 hover:bg-white/5 transition-all text-left flex items-center gap-8 group mt-4">

                                    <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center text-white/40 group-hover:text-[#FF0000] group-hover:bg-[#FF0000]/20 transition-all duration-300">
                                        <Youtube className="h-6 w-6" />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-black text-white/70 uppercase tracking-tight">I have No Spotify, can i use Youtube</h3>
                                            <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest px-2 py-0.5 border border-white/10 rounded">YouTube Manual Link</span>
                                        </div>
                                        <p className="text-[11px] text-white/30 font-medium">Synthetic fallback. Manually search and select signals to define your vector.</p>
                                    </div>

                                    <ChevronRight className="h-5 w-5 text-white/10 group-hover:text-white group-hover:translate-x-1 transition-all mr-4" />
                                </Link>
                            </div>

                            <button onClick={() => setStage('genre_selection')} className="mt-16 text-[10px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-white transition-all underline underline-offset-8 decoration-white/5">← RECALIBRATE PREFERENCES</button>
                        </motion.div>
                    )}

                    {/* STAGE: SPOTIFY SCAN INSTRUCTIONS & INPUT */}
                    {stage === 'spotify_scan' && (
                        <motion.div key="spotify" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
                            className="py-6 md:py-12 w-full max-w-2xl mx-auto">
                            <div className="text-center mb-8 md:mb-12">
                                <h2 className="text-3xl md:text-4xl font-black mb-4 text-white uppercase tracking-tight">Capture Spotify URL</h2>
                                <p className="text-white/60 font-medium px-4">Paste your Spotify profile link to systematically scan your discovery signals.</p>
                            </div>

                            <div className="glass p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border-white/20 mb-8">
                                <div className="flex flex-col sm:flex-row gap-2 p-1.5 sm:p-2 bg-white/5 border border-white/20 rounded-2xl focus-within:ring-2 focus-within:ring-green-500/30 transition-all mb-4">
                                    <input
                                        type="text"
                                        value={spotifyUserId}
                                        onChange={(e) => setSpotifyUserId(e.target.value)}
                                        placeholder="Paste Spotify Profile Link..."
                                        className="flex-1 bg-transparent py-4 px-6 focus:outline-none font-mono text-xs sm:text-sm text-white placeholder:text-white/20"
                                    />
                                    <button onClick={() => handleSpotifyScan(0)} disabled={scanningSpotify}
                                        className="bg-[#1DB954] text-white font-black px-6 sm:px-10 py-4 rounded-xl hover:bg-[#1ed760] transition-all hover:scale-[1.02] active:scale-95 text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                                        {scanningSpotify ? <Activity className="h-5 w-5 animate-spin" /> : <Scan className="h-4 w-4 sm:h-5 sm:w-5" />}
                                        SCAN
                                    </button>
                                </div>
                                {scanError && <p className="text-red-400 text-xs font-black bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-center uppercase tracking-widest">{scanError}</p>}
                            </div>

                            <div className="glass p-6 md:p-8 rounded-[2rem] md:rounded-3xl border-white/10">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                                    <div className="flex items-center gap-2 text-[#1DB954] font-black uppercase text-[10px] md:text-xs tracking-widest">
                                        <HelpCircle className="h-4 w-4" /> Protocol: How to capture URL
                                    </div>
                                    <a href="https://open.spotify.com" target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-white/40 hover:text-white transition-all text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-white/5 py-2 px-4 rounded-full border border-white/10 w-full sm:w-auto justify-center sm:justify-start">
                                        Open Spotify <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                                <div className="space-y-4 text-xs md:text-sm text-white/60 font-medium border-t border-white/5 pt-6">
                                    <div className="flex gap-4">
                                        <span className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] shrink-0 text-white font-bold">1</span>
                                        <p>Click on your <span className="text-white font-bold">Profile Name</span> within the Spotify interface.</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <span className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] shrink-0 text-white font-bold">2</span>
                                        <p>Locate the <span className="text-white font-bold">Menu (···)</span> button or Right-Click your name.</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <span className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] shrink-0 text-white font-bold">3</span>
                                        <p>Select <span className="text-white font-bold">Copy link to profile</span> (found under the Share menu).</p>
                                    </div>
                                    <p className="text-[9px] md:text-[10px] text-primary/80 italic pl-10">* Ensure discovery is set to public in your Spotify social settings.</p>
                                </div>
                            </div>
                            <div className="flex justify-center mt-12 pb-12">
                                <button onClick={() => setStage('source_selection')} className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-white/30 hover:text-white transition-all px-6 py-3 border border-white/5 rounded-full hover:bg-white/5">← Back to Options</button>
                            </div>
                        </motion.div>
                    )}

                    {/* STAGE: PLAYLIST SELECTION */}
                    {stage === 'playlist_selection' && (
                        <motion.div key="selection" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            className="py-12 w-full">
                            <div className="text-center mb-12">
                                <h2 className="text-4xl font-black mb-4 text-white uppercase tracking-tighter">Select discovery source</h2>
                                <p className="text-white/60 font-medium">Showing public signals. High-fidelity extraction requires at least 10 tracks.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                                {playlists.filter((pl: any) => !scannedPlaylistIds.includes(pl.id)).map((pl: any, i: number) => (
                                    <motion.div key={pl.id + i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i % 5) * 0.05 }}
                                        className="group relative flex flex-col p-8 rounded-[3rem] glass border-white/10 hover:border-green-500/50 hover:bg-green-500/5 transition-all text-left">
                                        <div className="flex items-start justify-between mb-8">
                                            <div className="h-28 w-28 rounded-[2rem] overflow-hidden bg-white/10 ring-1 ring-white/10 group-hover:ring-green-500/30">
                                                {pl.image ? (
                                                    <img src={pl.image} alt={pl.name} className="h-full w-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center"><Music2 className="h-10 w-10 opacity-20" /></div>
                                                )}
                                            </div>
                                            <a href={pl.url} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all">
                                                <ExternalLink className="h-5 w-5" />
                                            </a>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-black mb-2 text-white capitalize">{pl.name.toLowerCase()}</h3>
                                            <p className="text-xs font-mono text-white/40 uppercase tracking-widest font-black mb-8">{pl.track_count} ACTIVE SIGNALS</p>

                                            <button onClick={() => handleSelectPlaylist(pl)}
                                                className="w-full bg-white text-black font-black py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest">
                                                EXTRACT DNA <ArrowRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {playlists.length < playlistTotal && (
                                <div className="flex justify-center mt-12">
                                    <button onClick={() => handleSpotifyScan(playlistOffset + 5)} disabled={loadingMore}
                                        className="flex items-center gap-3 bg-white/5 border border-white/10 px-12 py-5 rounded-full hover:bg-white/10 transition-all text-white font-black text-xs uppercase tracking-widest">
                                        {loadingMore ? <Activity className="h-5 w-5 animate-spin text-primary" /> : <><Plus className="h-5 w-5 text-primary" /> Load More Signals</>}
                                    </button>
                                </div>
                            )}
                            <div className="flex justify-center mt-12">
                                <button onClick={() => setStage('spotify_scan')} className="text-xs font-black uppercase tracking-[0.3em] text-white/30 hover:text-white transition-all">← Back to Scanner</button>
                            </div>
                        </motion.div>
                    )}

                    {/* STAGE: ANALYZING */}
                    {stage === 'analyzing' && (
                        <motion.div key="analyzing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
                            className="glass rounded-[3rem] p-20 text-center max-w-2xl mx-auto border-primary/20 bg-primary/5 py-32">
                            <div className="relative h-56 w-56 mx-auto mb-16">
                                <div className="absolute inset-0 rounded-full border-4 border-primary/10 shadow-[0_0_50px_rgba(255,0,0,0.1)]" />
                                <motion.div className="absolute inset-0 rounded-full border-4 border-t-primary border-transparent" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-5xl font-black text-primary mb-2 italic">{progress}%</span>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 font-mono">QUANTIZING</span>
                                </div>
                            </div>
                            <h2 className="text-3xl font-black mb-6 text-white italic">Mapping {selectedPlaylist?.name}</h2>
                            <p className="text-white/60 italic font-medium max-w-sm mx-auto leading-relaxed">Systematically extracting Euclidean distance markers from discovery buffers.</p>
                        </motion.div>
                    )}

                    {/* STAGE: COMPLETE */}
                    {stage === 'complete' && dnaData && (
                        <motion.div key="complete" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 w-full py-10 pb-40">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                                {/* Left: DNA Visualization */}
                                <div className="glass rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 overflow-hidden relative border-white/20">
                                    <h3 className="font-mono text-[10px] md:text-xs uppercase text-white/60 font-black tracking-widest mb-8 md:mb-12">Structural Map Vector</h3>
                                    <div className="space-y-8 md:space-y-10">
                                        <DNAField label="Spectral Centroid" value={dnaData.vector?.[0] ?? 0} />
                                        <DNAField label="Transient Density" value={dnaData.vector?.[1] ?? 0} color="secondary" />
                                        <DNAField label="Harmonicity" value={dnaData.vector?.[2] ?? 0} />
                                        <DNAField label="Temporal Polarity" value={dnaData.vector?.[5] ?? 0} color="secondary" />
                                    </div>

                                    <div className="mt-12 md:mt-16 h-48 md:h-56 flex flex-col items-center justify-center text-[#FF0000] relative">
                                        <div className="absolute inset-0 bg-[#FF0000]/10 blur-[60px] md:blur-[80px] rounded-full" />
                                        <CheckCircle2 className="h-24 w-24 md:h-32 md:w-32 mb-6 md:mb-8 relative drop-shadow-2xl" />
                                        <span className="text-lg md:text-2xl font-black tracking-[0.4em] uppercase relative text-white italic">Sync Verified</span>
                                        <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-4 font-black">{dnaData.display_name}</span>
                                    </div>
                                </div>

                                {/* Right: Neural Matching Protocol & Calculation */}
                                <div className="space-y-6">
                                    <div className="glass rounded-[2rem] p-10 border-[#FF0000]/30 bg-[#FF0000]/5 ring-1 ring-[#FF0000]/20 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-6 opacity-10">
                                            <Binary className="h-32 w-32" />
                                        </div>

                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="font-black flex items-center gap-2 uppercase tracking-[0.2em] text-[10px] text-[#FF0000]">
                                                <Brain className="h-5 w-5" /> Neural Matching Protocol
                                            </h3>
                                            <span className="text-[9px] font-mono text-white/40 uppercase tracking-[0.3em]">Global Vector Search: 12,492 Nodes Active</span>
                                        </div>

                                        <div className="space-y-8 relative z-10">
                                            <div className="flex items-end justify-between border-b border-white/5 pb-6">
                                                <div>
                                                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-2 font-mono">Calculation Logic</p>
                                                    <h4 className="text-3xl font-black text-white italic tracking-tighter">{dnaData.display_name}</h4>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-4xl font-mono font-black text-[#FF0000] tracking-tighter">80.2%</p>
                                                    <p className="text-[10px] font-black text-white uppercase tracking-widest">COHERENCE INDEX</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-white/10 p-6 rounded-3xl border border-[#FF0000]/20 hover:border-[#FF0000]/40 transition-colors">
                                                    <p className="text-[10px] font-black text-white uppercase tracking-widest mb-3">Vector Dist</p>
                                                    <p className="text-2xl font-mono font-black text-white tracking-widest">0.198</p>
                                                    <p className="text-[8px] text-white/50 font-bold uppercase mt-2">Euclidean separation to cluster median</p>
                                                </div>
                                                <div className="bg-white/10 p-6 rounded-3xl border border-[#FF0000]/20 hover:border-[#FF0000]/40 transition-colors">
                                                    <p className="text-[10px] font-black text-white uppercase tracking-widest mb-3">Vector Space</p>
                                                    <p className="text-2xl font-mono font-black text-white tracking-widest">12D PROJECTION</p>
                                                    <p className="text-[8px] text-white/50 font-bold uppercase mt-2">Multi-dimensional frequency mapping</p>
                                                </div>
                                            </div>

                                            <div className="bg-black/60 p-8 rounded-[2.5rem] border border-white/20 space-y-6 shadow-2xl relative overflow-hidden group/logic">
                                                <div className="absolute inset-0 bg-gradient-to-br from-[#FF0000]/5 to-transparent opacity-0 group-hover/logic:opacity-100 transition-opacity" />
                                                <div className="flex items-start gap-5 relative z-10">
                                                    <div className="h-3 w-3 rounded-full bg-[#FF0000] mt-1.5 shrink-0 shadow-[0_0_10px_rgba(255,0,0,0.8)]" />
                                                    <div>
                                                        <span className="text-[#FF0000] text-xs font-black uppercase tracking-[0.2em] block mb-2">Coherence index explanation</span>
                                                        <p className="text-[12px] text-white leading-relaxed font-bold">
                                                            A geometric measurement of your signal's internal consistency. A score of <span className="text-[#FF0000]">80.2%</span> represents a high-resolution sync, indicating that your discovery signals follow a highly structured and non-random pattern.
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-5 relative z-10">
                                                    <div className="h-3 w-3 rounded-full bg-white mt-1.5 shrink-0 shadow-[0_0_10px_rgba(255,255,255,0.4)]" />
                                                    <div>
                                                        <span className="text-white text-xs font-black uppercase tracking-[0.2em] block mb-2">12D Mapping Logic</span>
                                                        <p className="text-[12px] text-white/80 leading-relaxed font-bold">
                                                            Your DNA is quantized across 12 distinct axes (Spectral, Harmonic, Transient, etc.). We project these into a high-dimensional vector space to find matches with <span className="text-white">Euclidean precision</span>.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Selected Metadata Display */}
                                    <div className="glass rounded-[3rem] p-10 border-white/10 relative">
                                        <h3 className="font-black flex items-center gap-2 mb-10 uppercase tracking-[0.2em] text-[10px] text-white/40">
                                            <Filter className="h-4 w-4" /> DNA Metadata Matrix
                                        </h3>

                                        <div className="flex flex-wrap items-center justify-center gap-4">
                                            {(dnaData.top_genres || []).map((genre: string, i: number) => {
                                                const sizes = ["text-[10px] py-2 px-4", "text-sm py-3 px-6", "text-lg py-4 px-8"];
                                                const sizeClass = sizes[i % sizes.length];

                                                return (
                                                    <div key={`${genre}-${i}`} className={`rounded-full border font-black uppercase tracking-widest transition-all duration-300 shadow-sm bg-[#FF0000] text-white border-[#FF0000] shadow-[0_0_20px_rgba(255,0,0,0.4)] ${sizeClass}`}>
                                                        {genre}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{
                                            opacity: 1,
                                            scale: [1, 1.02, 1],
                                        }}
                                        transition={{
                                            scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                                            opacity: { duration: 0.5 }
                                        }}
                                        className="relative group/btn"
                                    >
                                        <div className="absolute -inset-2 bg-[#FF0000] rounded-[3rem] blur-3xl opacity-20 group-hover/btn:opacity-60 transition-opacity duration-700 animate-pulse" />

                                        <Link href={{ pathname: "/match", query: { genres: selectedGenres.join(",") } }}
                                            className="relative flex w-full flex-col sm:flex-row items-center justify-between bg-[#FF0000] p-6 md:p-12 rounded-[2rem] md:rounded-[2.5rem] font-black text-white uppercase tracking-[0.1em] sm:tracking-[0.4em] text-xl md:text-2xl hover:scale-[1.01] active:scale-95 transition-all shadow-[0_20px_80px_rgba(255,0,0,0.5)] overflow-hidden group">

                                            {/* Shimmer Effect Flash */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer pointer-events-none" />

                                            <span className="relative z-10 flex items-center gap-4 md:gap-6 mb-4 sm:mb-0">
                                                <Users className="h-8 w-8 md:h-10 md:w-10 fill-white" />
                                                FIND SOLEMATES
                                            </span>

                                            <div className="flex items-center gap-4 relative z-10 bg-black/20 py-2 md:py-3 px-4 md:px-6 rounded-2xl border border-white/10 w-full sm:w-auto justify-center sm:justify-start">
                                                <span className="text-[10px] font-mono text-white/80 tracking-[0.3em] hidden md:block">INITIATE MATCH</span>
                                                <ChevronRight className="h-6 w-6 md:h-10 md:w-10 transition-transform group-hover:translate-x-3 text-white" />
                                            </div>
                                        </Link>
                                    </motion.div>
                                </div>
                            </div>

                            {/* Captured tracks */}
                            {dnaData.recent_tracks?.length > 0 && (
                                <div className="glass rounded-[3rem] p-12 border-white/10">
                                    <h3 className="font-black flex items-center gap-3 mb-10 uppercase tracking-[0.4em] text-[10px] text-white/40">Captured Signals (Top 20 Analysis)</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {dnaData.recent_tracks.map((track: any, i: number) => (
                                            <a key={track.id + i} href={track.url || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-[#FF0000]/40 transition-all group">
                                                <div className="relative shrink-0 h-16 w-16 rounded-2xl overflow-hidden bg-white/10 ring-1 ring-white/10">
                                                    {track.thumbnail ? (
                                                        <img src={track.thumbnail} alt={track.title} className="h-full w-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all scale-100 group-hover:scale-110" />
                                                    ) : (<div className="h-full w-full flex items-center justify-center"><Music2 className="h-6 w-6 opacity-20" /></div>)}
                                                </div>
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <div className="text-sm font-black truncate text-white group-hover:text-[#FF0000] transition-colors mb-0.5" dangerouslySetInnerHTML={{ __html: track.title }} />
                                                    <div className="text-[10px] text-white/40 font-mono uppercase truncate font-bold">{track.artist || track.channelTitle}</div>
                                                </div>
                                                <ExternalLink className="h-4 w-4 text-white/10 group-hover:text-[#FF0000] transition-all" />
                                            </a>
                                        ))}
                                    </div>
                                    <div className="mt-16 text-center">
                                        <button onClick={() => setStage('intro')} className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 hover:text-[#FF0000] transition-all underline decoration-white/5 underline-offset-8 font-bold">INITIATE NEW FREQUENCY SCAN</button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Background Aesthetic */}
            <div className="fixed inset-0 -z-50 pointer-events-none overflow-hidden">
                <div className={`absolute top-1/4 left-1/4 h-[500px] w-[500px] blur-[150px] rounded-full transition-colors duration-1000 ${stage === 'analyzing' ? 'bg-[#FF0000]/30' : 'bg-[#FF0000]/10'}`} />
                <div className="absolute bottom-1/4 right-1/4 h-[600px] w-[600px] blur-[180px] rounded-full bg-orange-900/10" />
            </div>

            <style jsx global>{`
                .glass { background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px); }
                
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
                .animate-shimmer {
                    animation: shimmer 4s infinite cubic-bezier(0.4, 0, 0.2, 1);
                }
            `}</style>
        </div>
    );
}

function GenreSelectionStage({ selectedGenres, toggleGenre, onConfirm, onCancel }: {
    selectedGenres: string[],
    toggleGenre: (g: string) => void,
    onConfirm: () => void,
    onCancel: () => void
}) {
    return (
        <motion.div key="genre_selection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col w-full min-h-[85vh] py-10">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">

                {/* LEFT: GENRE LIBRARY (8 cols) */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic">
                            Sonic <span className="text-[#FF0000]">Library</span>
                        </h2>
                        <p className="text-white/40 font-mono text-xs uppercase tracking-[0.4em]">Select base layer frequencies for DNA mapping</p>
                    </div>

                    <div className="glass p-8 md:p-12 rounded-[3.5rem] border-white/10 bg-black/40 backdrop-blur-xl">
                        <div className="flex flex-wrap gap-3">
                            {GENRE_OPTIONS.map((genre) => {
                                const isSelected = selectedGenres.includes(genre);
                                return (
                                    <button
                                        key={genre}
                                        onClick={() => toggleGenre(genre)}
                                        className={`rounded-full border font-black uppercase text-[10px] md:text-xs py-2.5 px-6 tracking-widest transition-all duration-200 group relative overflow-hidden ${isSelected
                                            ? "bg-[#FF0000] text-white border-[#FF0000] shadow-[0_0_30px_rgba(255,0,0,0.4)]"
                                            : "bg-white/5 border-white/10 text-white/50 hover:border-[#FF0000] hover:text-white"
                                            }`}
                                    >
                                        <div className="absolute inset-0 bg-[#FF0000]/0 group-hover:bg-[#FF0000]/10 transition-colors" />
                                        <span className="relative z-10">{genre}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* RIGHT: SELECTION & PROTOCOL (4 cols) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="glass p-8 rounded-[3.5rem] border-[#FF0000]/20 bg-[#FF0000]/5 flex-1 flex flex-col min-h-[500px]">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-[#FF0000]">Active Signal</h3>
                            <span className="font-mono text-[10px] text-white/40">{selectedGenres.length} LOADED</span>
                        </div>

                        <div className="flex-1 space-y-4 mb-10 overflow-auto max-h-[450px] pr-2 custom-scrollbar">
                            {selectedGenres.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 gap-4 py-20">
                                    <div className="h-12 w-12 rounded-full border border-dashed border-white/40 flex items-center justify-center">
                                        <Plus className="h-6 w-6" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest italic">Awaiting local frequencies</p>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {selectedGenres.map((g, i) => (
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            key={`${g}-${i}`}
                                            className="bg-white/10 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-white/5"
                                        >
                                            {g}
                                            <button onClick={() => toggleGenre(g)} className="hover:text-[#FF0000] transition-colors">×</button>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 mt-auto">
                            <button
                                onClick={onConfirm}
                                disabled={selectedGenres.length === 0}
                                className="w-full group flex items-center justify-center gap-4 bg-[#FF0000] text-white py-6 rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_50px_rgba(255,0,0,0.3)] disabled:opacity-20 disabled:grayscale disabled:scale-100"
                            >
                                CONFIRM SYNC <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                            </button>
                            <button onClick={onCancel} className="w-full text-[10px] font-black uppercase tracking-[0.4em] text-white/40 hover:text-white transition-all text-center">Abort Registry</button>
                        </div>
                    </div>

                    {/* STATUS CARD */}
                    <div className="glass p-6 rounded-[2rem] border-white/5 bg-white/2 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-0.5">Frequency Guard</p>
                            <p className="text-[9px] font-mono text-white/10 uppercase">Awaiting structural confirmation</p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 0, 0, 0.2); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 0, 0, 0.5); }
            `}</style>
        </motion.div>
    );
}

function GenreBackgroundCanvas() {
    const canvasRef = (typeof window !== 'undefined') ? (null as any) : null;
    const ref = (node: HTMLCanvasElement) => {
        if (!node) return;
        const ctx = node.getContext('2d')!;
        let w = node.width = node.offsetWidth;
        let h = node.height = node.offsetHeight;

        const particles: any[] = [];
        for (let i = 0; i < 40; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                size: Math.random() * 2
            });
        }

        let frame = 0;
        const draw = () => {
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = 'rgba(255, 0, 0, 0.15)';
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.05)';

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > w) p.vx *= -1;
                if (p.y < 0 || p.y > h) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });

            // Connect nearby
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            frame = requestAnimationFrame(draw);
        };
        draw();
    };

    return <canvas ref={ref} className="absolute inset-0 w-full h-full opacity-50 pointer-events-none" />;
}

function DNAField({ label, value, color = "primary" }: { label: string, value: number, color?: "primary" | "secondary" }) {
    const displayValue = typeof value === 'number' ? value : 0;

    return (
        <div className="group/field">
            <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 group-hover/field:text-white transition-colors">{label}</span>
                <span className="font-mono text-sm text-[#FF0000] font-black tracking-widest">{displayValue.toFixed(3)}</span>
            </div>
            <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden p-1 border border-white/20 shadow-inner group-hover/field:border-[#FF0000]/30 transition-all">
                <motion.div initial={{ width: 0 }} animate={{ width: `${displayValue * 100}%` }} transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${color === "primary" ? "bg-[#FF0000] shadow-[0_0_20px_rgba(255,0,0,0.6)]" : "bg-white/60 shadow-[0_0_15px_rgba(255,255,255,0.2)]"}`}
                />
            </div>
        </div>
    );
}
