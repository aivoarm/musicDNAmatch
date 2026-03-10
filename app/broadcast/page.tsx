"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Radio,
    Scan,
    Activity,
    Zap,
    CheckCircle2,
    ChevronRight,
    Wind,
    ArrowLeft,
    Music2,
    ExternalLink,
    Binary,
    Plus,
    Info,
    HelpCircle,
    Brain,
    Sparkles
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { decodeHtml } from "@/lib/utils";


function BroadcastContent() {
    const [analyzing, setAnalyzing] = useState(false);
    const [complete, setComplete] = useState(false);
    const [progress, setProgress] = useState(0);
    const [dnaData, setDnaData] = useState<any>(null);
    const [spotifyUserId, setSpotifyUserId] = useState("https://open.spotify.com/user/22tdlrfq3bpsmxhixeyg3t62q");
    const searchParams = useSearchParams();
    const [scanningSpotify, setScanningSpotify] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showHelp, setShowHelp] = useState(false);

    // stage: 'initial' | 'playlist_selection' | 'analyzing' | 'complete'
    const [stage, setStage] = useState<'initial' | 'playlist_selection' | 'analyzing' | 'complete'>('initial');
    const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);

    const [playlists, setPlaylists] = useState<any[]>([]);
    const [playlistOffset, setPlaylistOffset] = useState(0);
    const [playlistTotal, setPlaylistTotal] = useState(0);

    const router = useRouter();

    useEffect(() => {
        const id = searchParams.get("spotify_id");
        if (id && stage === 'initial' && !scanningSpotify && !analyzing) {
            setSpotifyUserId(id);
            handleSpotifyScanById(id);
        }
    }, [searchParams]);

    const generateVerbium = (vector: number[], genres: string[]) => {
        const spectral = vector[0];
        const transient = vector[1];
        const harmonicity = vector[2];

        let tone = "";
        if (spectral > 0.7) tone = "high-frequency spectral focus with sharp acoustic definition";
        else if (spectral < 0.3) tone = "deep low-end resonance with heavy sub-harmonic weight";
        else tone = "balanced spectral distribution across the mid-range spectrum";

        let rhythmic = "";
        if (transient > 0.7) rhythmic = "aggressive transient density suggesting high-energy rhythmic complexity";
        else if (transient < 0.3) rhythmic = "smooth temporal gradients with minimal percussive friction";
        else rhythmic = "moderate rhythmic tension with characteristic backbeat stability";

        let structure = "";
        if (harmonicity > 0.6) structure = "high harmonic coherence and tonal stability";
        else structure = "rich atonal textures and dissonant spectral layering";

        return `Your profile exhibits a ${tone}. This is coupled with ${rhythmic}. The structural map indicates ${structure}, primarily manifesting through ${genres.join(", ")} signals.`;
    };

    const handleSpotifyScanById = async (id: string, offset = 0) => {
        if (offset === 0) {
            setScanningSpotify(true);
            setPlaylists([]);
        } else {
            setLoadingMore(true);
        }

        setErrorMessage(null);
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
            const data = await res.json() as any;
            if (!res.ok) {
                setErrorMessage(data.error || "Failed to scan Spotify profile.");
                if (offset === 0) setStage('initial');
                return;
            }

            if (offset === 0 && (!data.playlists || data.playlists.length === 0)) {
                setErrorMessage("No public playlists found for this user. Ensure playlists are shared on your public profile.");
                setStage('initial');
                return;
            }

            setPlaylists(prev => [...prev, ...(data.playlists || [])]);
            setPlaylistTotal(data.total || 0);
            setPlaylistOffset(offset);

            setDnaData({ display_name: `Signal: ${id}` });
            setStage('playlist_selection');
        } catch (err: any) {
            setErrorMessage("System error during Spotify scan.");
            if (offset === 0) setStage('initial');
        } finally {
            setScanningSpotify(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        handleSpotifyScanById(spotifyUserId, playlistOffset + 5);
    };

    const handleSelectPlaylist = async (playlist: any) => {
        setSelectedPlaylist(playlist);
        setStage('analyzing');
        setAnalyzing(true);
        setProgress(0);

        // Stage 2: Lazy load tracks for THIS specific playlist
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
            const data = await res.json() as any;
            tracks = data.tracks || [];
        } catch (err) {
            console.error("Lazy load failed:", err);
        }

        // Generate DNA via the real engine instead of Math.random()
        try {
            const r = await fetch("/api/dna/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    genres: ["Electronic"], // Default base
                    displayName: playlist.name,
                    spotifyTracks: tracks,
                })
            });
            const d = await r.json() as any;
            if (d.success) {
                const vector = d.vector;
                const top_genres = d.metadata?.top_genres || [playlist.name.split(' ')[0]];

                // Finalize results
                setDnaData((prev: any) => ({
                    ...prev,
                    display_name: `${playlist.name} Signal`,
                    vector,
                    top_genres,
                    recent_tracks: tracks.slice(0, 10),
                    verbium: generateVerbium(vector, top_genres),
                    coherence_index: d.coherence_index
                }));
            }
        } catch (err) {
            console.error("Structural extraction failed:", err);
        }


        setComplete(true);
        setAnalyzing(false);
        setStage('complete');
    };

    const startAnalysis = async () => {
        setAnalyzing(true);
        setStage('analyzing');
        setProgress(5);
        setComplete(false);
        setErrorMessage(null);

        try {
            await new Promise(r => setTimeout(r, 800));
            setProgress(20);

            const res = await fetch("/api/dna/generate", { method: "POST" });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({})) as any;
                setErrorMessage(errData.error || `Server error (${res.status})`);
                setAnalyzing(false);
                setStage('initial');
                setProgress(0);
                return;
            }

            const data = await res.json() as any;

            for (let i = 21; i <= 100; i++) {
                setProgress(i);
                await new Promise(r => setTimeout(r, 10));
            }

            setDnaData({
                ...data,
                verbium: generateVerbium(data.vector, data.top_genres)
            });
            setComplete(true);
            setAnalyzing(false);
            setStage('complete');
        } catch (err: any) {
            setErrorMessage(err.message || "Unknown error occurred.");
            setAnalyzing(false);
            setStage('initial');
            setProgress(0);
        }
    };

    const handleSpotifyScan = async () => {
        if (!spotifyUserId) return;

        let id = spotifyUserId.trim();
        if (id.includes("spotify.com/user/")) {
            const parts = id.split("spotify.com/user/");
            if (parts.length > 1) {
                id = parts[1].split("?")[0].split("/")[0];
            }
        } else if (id.startsWith("@")) {
            id = id.substring(1);
        }

        await handleSpotifyScanById(id);
    };

    return (
        <div className="min-h-screen pt-20 px-6 sm:px-10 pb-20 flex flex-col items-center">
            <div className="max-w-5xl w-full">
                <header className="mb-12 flex justify-between items-end">
                    <div>
                        <button onClick={() => router.back()} className="flex items-center gap-2 text-xs font-bold uppercase text-white/60 hover:text-white transition-colors mb-3">
                            <ArrowLeft className="h-3.5 w-3.5" /> Back
                        </button>
                        <h1 className="text-4xl font-black mb-2 text-white">Vibe <span className="text-primary italic">Broadcast</span></h1>
                        <p className="text-white/80 font-medium">Synchronizing local audio buffers with universal DNA markers.</p>
                    </div>
                    <div className="hidden sm:block text-right">
                        <div className="text-xs font-mono opacity-50 uppercase tracking-widest mb-1">Station ID</div>
                        <div className="text-sm font-mono text-primary font-bold">DNA-V2.1-RX-ACTIVE</div>
                    </div>
                </header>

                {errorMessage && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className="mb-8 glass rounded-2xl p-5 border border-red-500/30 bg-red-500/5 flex items-start gap-4">
                        <div className="text-red-400 font-mono text-xs mt-0.5">⚠ FAULT</div>
                        <div className="flex-1 text-sm text-red-100 font-bold">{errorMessage}</div>
                        <button onClick={() => { setErrorMessage(null); setStage('initial'); }}
                            className="text-xs font-bold uppercase text-primary hover:underline">Reset</button>
                    </motion.div>
                )}

                <AnimatePresence mode="wait">
                    {/* STAGE: INITIAL */}
                    {stage === 'initial' && (
                        <motion.div key="initial" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            className="glass rounded-[2.5rem] p-12 text-center border-white/10 bg-gradient-to-br from-white/5 to-transparent">
                            <div className="mb-10 p-8 rounded-full bg-primary/10 w-fit mx-auto ring-1 ring-primary/20 relative">
                                <Radio className="h-16 w-16 text-primary animate-pulse" />
                            </div>
                            <h2 className="text-4xl font-black mb-4 text-white">Initialize Signal</h2>
                            <p className="text-lg text-white/70 mb-12 max-w-lg mx-auto leading-relaxed">
                                Connect your foundations or systematically scan public registries to establish your sonic vector.
                            </p>

                            <div className="flex flex-col gap-8 max-w-sm mx-auto w-full">
                                <button onClick={startAnalysis}
                                    className="bg-white text-black font-black px-12 py-5 rounded-3xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 text-lg shadow-xl shadow-white/5">
                                    <Activity className="h-6 w-6" />
                                    Sync History
                                </button>

                                <div className="relative py-4">
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                        <div className="w-full border-t border-white/20"></div>
                                    </div>
                                    <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.4em]">
                                        <span className="bg-black px-6 text-white/50">SCAN PUBLIC DNA</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex gap-2 p-2 bg-white/5 border border-white/20 rounded-2xl focus-within:ring-2 focus-within:ring-green-500/30 transition-all">
                                        <input
                                            type="text"
                                            value={spotifyUserId}
                                            onChange={(e) => setSpotifyUserId(e.target.value)}
                                            placeholder="Paste Spotify Profile Link..."
                                            className="flex-1 bg-transparent py-4 px-6 focus:outline-none font-mono text-xs text-white placeholder:text-white/30"
                                        />
                                        <button onClick={handleSpotifyScan} disabled={scanningSpotify}
                                            className="bg-[#1DB954] text-white font-black px-8 py-4 rounded-xl hover:bg-[#1ed760] transition-all hover:scale-[1.02] active:scale-95 text-xs uppercase tracking-widest disabled:opacity-50">
                                            {scanningSpotify ? <Activity className="h-4 w-4 animate-spin" /> : "SCAN"}
                                        </button>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <p className="text-[10px] text-white/40 uppercase tracking-widest italic pt-2">
                                            Example: https://open.spotify.com/user/22tdlrfq3bpsmxhixeyg3t62q
                                        </p>
                                        <button
                                            onClick={() => setShowHelp(!showHelp)}
                                            className="text-[9px] font-black uppercase tracking-[0.2em] text-primary hover:text-white transition-colors flex items-center gap-1.5"
                                        >
                                            <HelpCircle className="h-3 w-3" />
                                            How to find your Spotify URL?
                                        </button>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {showHelp && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="text-left text-[11px] text-white/60 bg-white/5 p-6 rounded-2xl border border-white/10 space-y-3 leading-relaxed">
                                                <p><span className="text-white font-bold">1.</span> Open Spotify Desktop or Web App.</p>
                                                <p><span className="text-white font-bold">2.</span> Profile → Click on your name.</p>
                                                <p><span className="text-white font-bold">3.</span> Click the three dots <span className="text-white font-bold">(...)</span> below your name.</p>
                                                <p><span className="text-white font-bold">4.</span> Share → Copy link to profile.</p>
                                                <p className="text-[9px] text-primary/80 mt-2 italic">* Note: Playlists must be set to "Public" for detection.</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}

                    {/* STAGE: PLAYLIST SELECTION */}
                    {stage === 'playlist_selection' && (
                        <motion.div key="selection" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                            className="space-y-8 w-full">
                            <div className="text-center max-w-2xl mx-auto mb-12">
                                <h2 className="text-3xl font-black mb-4 text-white">Select Source Signal</h2>
                                <p className="text-white/60 italic leading-relaxed">
                                    "Showing detected public signals for <span className="text-white font-bold underline decoration-primary/50">{spotifyUserId}</span>. Choose one for structural extraction."
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
                                {playlists.map((pl: any, i: number) => (
                                    <motion.button
                                        key={pl.id + i}
                                        onClick={() => handleSelectPlaylist(pl)}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: (i % 5) * 0.05 }}
                                        className="group relative flex items-center p-6 rounded-[2rem] glass border-white/10 hover:border-green-500/50 hover:bg-green-500/5 transition-all text-left gap-6"
                                    >
                                        <div className="h-24 w-24 rounded-2xl overflow-hidden bg-white/5 relative shrink-0 ring-1 ring-white/10 group-hover:ring-green-500/20">
                                            {pl.image ? (
                                                <img src={pl.image} alt={pl.name} className="h-full w-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center">
                                                    <Music2 className="h-8 w-8 opacity-10" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 pr-4">
                                            <h3 className="text-lg font-bold truncate mb-1 capitalize text-white group-hover:text-green-400 transition-colors">{pl.name.toLowerCase()}</h3>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest font-bold">{pl.track_count} Signals</span>
                                                <div className="h-1 w-1 rounded-full bg-white/20" />
                                                <span className="text-[10px] font-black uppercase text-green-500/80 transition-all">Extract DNA</span>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-white/20 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
                                    </motion.button>
                                ))}
                            </div>

                            {playlists.length < playlistTotal && (
                                <div className="flex justify-center mt-12 mb-20">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={loadingMore}
                                        className="group flex items-center gap-3 bg-white/5 border border-white/20 px-10 py-4 rounded-2xl hover:bg-white/10 hover:border-white/40 transition-all disabled:opacity-50"
                                    >
                                        {loadingMore ? (
                                            <Activity className="h-4 w-4 animate-spin text-primary" />
                                        ) : (
                                            <>
                                                <Plus className="h-4 w-4 text-primary group-hover:rotate-90 transition-transform" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Load More Signals</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            <div className="flex justify-center mt-12">
                                <button onClick={() => setStage('initial')} className="text-xs font-bold uppercase tracking-[0.3em] text-white/50 hover:text-white transition-all">
                                    ← Back to Scanner
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STAGE: ANALYZING */}
                    {stage === 'analyzing' && (
                        <motion.div key="analyzing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
                            className="glass rounded-[3rem] p-16 text-center max-w-2xl mx-auto border-primary/20 bg-primary/5">
                            <div className="relative h-48 w-48 mx-auto mb-12">
                                <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
                                <motion.div
                                    className="absolute inset-0 rounded-full border-4 border-t-primary border-r-primary/0 border-b-primary/0 border-l-primary/0"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                />
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-black text-primary mb-1">{progress}%</span>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Vectorizing</span>
                                </div>
                            </div>

                            <h2 className="text-2xl font-black mb-4 text-white">Extracting DNA</h2>
                            <p className="text-white/70 italic max-w-sm mx-auto mb-8 leading-relaxed">
                                "Mapping {selectedPlaylist?.name || "signal"} to 12-dimensional Euclidean space. Quantizing spectral weights."
                            </p>

                            <div className="space-y-3 font-mono text-[9px] uppercase tracking-widest text-primary/80">
                                <div className="flex justify-between items-center px-4">
                                    <span className="font-bold">Spectral Centroid</span>
                                    <span className="text-white">{progress > 20 ? "LOCKED" : "STABILIZING..."}</span>
                                </div>
                                <div className="flex justify-between items-center px-4">
                                    <span className="font-bold">Transient density</span>
                                    <span className="text-white">{progress > 50 ? "LOCKED" : "STABILIZING..."}</span>
                                </div>
                                <div className="flex justify-between items-center px-4 opacity-40">
                                    <span className="font-bold">Psychoacoustic Tension</span>
                                    <span className="text-white">{progress > 90 ? "LOCKED" : "ESTIMATING"}</span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STAGE: COMPLETE */}
                    {stage === 'complete' && dnaData && (
                        <motion.div key="complete" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                            className="space-y-8 w-full">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                                {/* Left: DNA Visualization */}
                                <div className="glass rounded-[2.5rem] p-10 overflow-hidden relative border-white/10">
                                    <div className="flex justify-between items-center mb-8">
                                        <span className="font-mono text-xs uppercase text-white/60 font-black tracking-widest">DNA Vector Out</span>
                                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                    </div>

                                    <div className="space-y-8">
                                        <DNAField label="Spectral Centroid" value={dnaData.vector[0]} />
                                        <DNAField label="Transient Density" value={dnaData.vector[1]} color="secondary" />
                                        <DNAField label="Harmonicity" value={dnaData.vector[2]} />
                                        <DNAField label="Temporal Polarity" value={dnaData.vector[5]} color="secondary" />
                                    </div>

                                    <div className="mt-12 h-48 flex flex-col items-center justify-center text-primary relative">
                                        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
                                        <CheckCircle2 className="h-24 w-24 mb-6 relative" />
                                        <span className="text-xl font-black tracking-[0.3em] uppercase relative text-white">Sync Verified</span>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-xs font-mono text-white/40 uppercase tracking-widest">{dnaData.display_name}</span>
                                            {selectedPlaylist?.url && (
                                                <a href={selectedPlaylist.url} target="_blank" rel="noopener noreferrer" className="p-1 hover:text-white transition-colors">
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Metadata */}
                                <div className="space-y-6">
                                    {/* Textual Verbium Section */}
                                    <div className="glass rounded-[2rem] p-8 border-primary/20 bg-primary/5">
                                        <h3 className="font-bold flex items-center gap-2 mb-4 uppercase tracking-widest text-xs text-primary">
                                            <Brain className="h-4 w-4" /> Neural Analysis Summary
                                        </h3>
                                        <p className="text-sm leading-relaxed text-white font-medium italic">
                                            "{dnaData.verbium}"
                                        </p>
                                    </div>

                                    <div className="glass rounded-[2rem] p-8 border-white/10">
                                        <h3 className="font-bold flex items-center gap-2 mb-6 uppercase tracking-widest text-xs text-white/60 font-black">
                                            <Music2 className="h-4 w-4" /> Structural Components
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {dnaData.top_genres.map((genre: string, i: number) => (
                                                <span key={genre} className={`text-[10px] font-black px-4 py-2 rounded-full border uppercase tracking-widest shadow-sm ${i === 0 ? "bg-primary text-black border-primary" : "bg-white/10 border-white/20 text-white"
                                                    }`}>
                                                    {genre}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="glass rounded-[2rem] p-8 border-white/10">
                                        <h3 className="font-bold flex items-center gap-2 mb-6 uppercase tracking-widest text-xs text-white/60 font-black">
                                            <Binary className="h-4 w-4" /> Vector Quantization (VQ)
                                        </h3>
                                        <div className="bg-black/60 rounded-2xl p-6 font-mono text-[11px] text-primary leading-relaxed overflow-x-auto border border-white/5 shadow-inner">
                                            <pre className="font-bold">{JSON.stringify({
                                                spectral: dnaData.vector.slice(0, 3).map((v: number) => Number(v.toFixed(3))),
                                                rhythmic: dnaData.vector.slice(4, 6).map((v: number) => Number(v.toFixed(3))),
                                                psychoacoustic: dnaData.vector.slice(7, 9).map((v: number) => Number(v.toFixed(3)))
                                            }, null, 2)}</pre>
                                        </div>
                                    </div>

                                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                                        <Link href="/soulmates" prefetch={false}
                                            className="flex w-full items-center justify-between bg-primary p-6 md:p-8 rounded-2xl md:rounded-3xl font-black text-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all glow-primary group">
                                            <span className="text-sm md:text-base">Find Soulmates</span>
                                            <ChevronRight className="h-5 w-5 md:h-6 md:w-6 transition-transform group-hover:translate-x-2" />
                                        </Link>
                                    </motion.div>
                                </div>
                            </div>

                            {/* Recent tracks used for analysis */}
                            {dnaData.recent_tracks?.length > 0 && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                    className="glass rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border-white/10">
                                    <h3 className="font-bold flex items-center gap-2 mb-6 md:mb-8 uppercase tracking-widest text-[10px] md:text-xs text-white/60 font-black">
                                        <Activity className="h-4 w-4" /> Captured Audio Signals
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {dnaData.recent_tracks.map((track: any, i: number) => (
                                            <motion.a
                                                key={track.id}
                                                href={track.url || "#"}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.05 * i }}
                                                className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/50 transition-all group"
                                            >
                                                <div className="relative shrink-0 h-14 w-14 rounded-xl overflow-hidden bg-white/10 ring-1 ring-white/10 group-hover:ring-primary/40">
                                                    {track.thumbnail ? (
                                                        <img src={track.thumbnail} alt={track.title} className="h-full w-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center">
                                                            <Music2 className="h-6 w-6 opacity-20" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <div className="text-sm font-bold truncate mb-0.5 group-hover:text-primary transition-colors text-white">
                                                        {decodeHtml(track.title)}
                                                    </div>
                                                    <div className="text-[10px] text-white/40 font-mono uppercase truncate tracking-wider font-black">{track.artist || track.channelTitle}</div>
                                                </div>

                                                <ExternalLink className="h-4 w-4 text-white/20 group-hover:text-primary transition-colors" />
                                            </motion.a>
                                        ))}
                                    </div>

                                    <div className="mt-10 pt-10 border-t border-white/10 text-center">
                                        <button onClick={() => setStage('initial')} className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 hover:text-white transition-all">
                                            Initiate New Broadcast Scan
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function BroadcastPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Activity className="h-12 w-12 text-primary animate-spin" />
            </div>
        }>
            <BroadcastContent />
        </Suspense>
    );
}


function DNAField({ label, value, color = "primary" }: { label: string, value: number, color?: "primary" | "secondary" }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">{label}</span>
                <span className="font-mono text-sm text-primary font-black tracking-widest">{value.toFixed(3)}</span>
            </div>
            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/20 shadow-inner">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value * 100}%` }}
                    className={`h-full rounded-full ${color === "primary" ? "bg-primary glow-primary" : "bg-white/60 shadow-[0_0_10px_rgba(255,255,255,0.2)]"}`}
                />
            </div>
        </div>
    );
}
