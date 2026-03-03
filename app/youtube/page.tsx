"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Youtube, Activity, ArrowLeft, ChevronRight, Zap, Music2, CheckCircle2, Scan } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function YouTubeAnalyzer() {
    const [query, setQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<any>(null);
    const [scanning, setScanning] = useState(false);
    const [dnaData, setDnaData] = useState<any>(null);
    const [trending, setTrending] = useState<any[]>([]);
    const [personalHistory, setPersonalHistory] = useState<any[]>([]);
    const [isGoogleAuth, setIsGoogleAuth] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const res = await fetch("/api/youtube/trending");
                if (res.ok) {
                    const data = await res.json();
                    setTrending(data);
                }
            } catch (err) {
                console.error("Failed to load trending music:", err);
            }
        };

        const checkGoogleAuth = async () => {
            try {
                const res = await fetch("/api/auth/google/me");
                if (res.ok) {
                    const { authenticated } = await res.json();
                    setIsGoogleAuth(authenticated);
                    if (authenticated) fetchPersonalHistory();
                }
            } catch (err) {
                console.error("Check Google Auth failure", err);
            }
        };

        const fetchPersonalHistory = async () => {
            setLoadingHistory(true);
            try {
                const res = await fetch("/api/youtube/history");
                if (res.ok) {
                    const data = await res.json();
                    setPersonalHistory(data);
                }
            } catch (err) {
                console.error("Failed to load personal history:", err);
            } finally {
                setLoadingHistory(false);
            }
        };

        fetchTrending();
        checkGoogleAuth();
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query) return;
        setSearching(true);
        setResults([]);
        setSelectedVideo(null);
        setDnaData(null);

        try {
            const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                setResults(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSearching(false);
        }
    };

    const runScan = async (video: any) => {
        setSelectedVideo(video);
        setScanning(true);
        setDnaData(null);

        // Simulated scanning sequence for premium UX
        await new Promise(r => setTimeout(r, 1500));

        // Mock DNA generation based on title keywords (fallback since real audio analysis needs backend processing)
        const mockVector = new Array(12).fill(0).map(() => 0.3 + Math.random() * 0.4);

        // Try to guess traits from title
        const lowerTitle = video.title.toLowerCase();
        if (lowerTitle.includes("lofi") || lowerTitle.includes("chill")) {
            mockVector[0] = 0.2; // Spectral Centroid (Low brightness)
            mockVector[7] = 0.9; // Timbral Warmth (High)
            mockVector[10] = 0.15; // Energy (Low)
        } else if (lowerTitle.includes("rock") || lowerTitle.includes("metal") || lowerTitle.includes("live")) {
            mockVector[0] = 0.85; // High brightness
            mockVector[10] = 0.95; // High energy
            mockVector[5] = 0.8; // High tension
        } else if (lowerTitle.includes("techno") || lowerTitle.includes("bass") || lowerTitle.includes("house")) {
            mockVector[1] = 0.9; // High Transient Density
            mockVector[6] = 0.85; // High Pulse Saliency
            mockVector[10] = 0.8; // High Energy
        }

        setDnaData({
            version: "2.1-YT",
            vector: mockVector,
            markers: {
                tension: mockVector[5],
                stability: mockVector[6],
                warmth: mockVector[7]
            }
        });
        setScanning(false);
    };

    return (
        <div className="min-h-screen pt-24 px-6 sm:px-10 pb-20">
            <div className="max-w-6xl mx-auto">
                <header className="mb-12 flex justify-between items-center bg-white/5 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-xl">
                    <div>
                        <button onClick={() => router.back()} className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground hover:text-white transition-colors mb-3">
                            <ArrowLeft className="h-3.5 w-3.5" /> Back
                        </button>
                        <h1 className="text-4xl font-black mb-1 flex items-center gap-3">
                            YouTube <span className="text-[#FF0000] italic">Scanner</span>
                        </h1>
                        <p className="text-muted-foreground font-mono text-sm opacity-60">
                            X-RAY SONIC ANALYSIS ENGINE V2.11
                        </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#FF0000]/10 border border-[#FF0000]/20 hidden sm:block">
                        <Youtube className="h-8 w-8 text-[#FF0000]" />
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Left Side: Search & Selection */}
                    <div className="space-y-6">
                        <div className="glass p-8 rounded-[2rem] border-white/5">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Search className="h-5 w-5 text-primary" />
                                Query Signal
                            </h2>
                            <form onSubmit={handleSearch} className="relative mb-8">
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Enter Artist, Track, or Video Title..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-6 pr-20 focus:outline-none focus:ring-2 focus:ring-[#FF0000]/50 transition-all font-medium text-lg placeholder:opacity-30"
                                />
                                <button
                                    type="submit"
                                    disabled={searching}
                                    className="absolute right-3 top-3 bottom-3 px-6 bg-[#FF0000] text-white rounded-xl font-black flex items-center justify-center hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#FF0000]/20 disabled:opacity-50"
                                >
                                    {searching ? <Activity className="h-5 w-5 animate-spin" /> : "FIND"}
                                </button>
                            </form>

                            <AnimatePresence mode="wait">
                                {results.length > 0 ? (
                                    <motion.div
                                        key="search-results"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-4"
                                    >
                                        {results.map((video) => (
                                            <button
                                                key={video.id}
                                                onClick={() => runScan(video)}
                                                className={`w-full flex gap-4 p-4 rounded-2xl border transition-all text-left group ${selectedVideo?.id === video.id
                                                    ? "bg-[#FF0000]/10 border-[#FF0000]/30"
                                                    : "bg-white/5 border-white/5 hover:border-white/10"
                                                    }`}
                                            >
                                                <div className="relative shrink-0">
                                                    <img src={video.thumbnail} className="h-16 w-24 rounded-lg object-cover grayscale group-hover:grayscale-0 transition-all shadow-sm" alt={video.title} />
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-[#FF0000]/40 rounded-lg">
                                                        <Zap className="h-5 w-5" />
                                                    </div>
                                                </div>
                                                <div className="min-w-0 pr-4">
                                                    <h3 className="text-sm font-bold truncate mb-1" dangerouslySetInnerHTML={{ __html: video.title }} />
                                                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">{video.channelTitle}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </motion.div>
                                ) : !searching && !query && (
                                    <div key="signals-suggested" className="space-y-10">
                                        {/* Personal History */}
                                        {!isGoogleAuth ? (
                                            <div className="p-8 rounded-[2rem] bg-[#FF0000]/5 border border-[#FF0000]/20 text-center">
                                                <Youtube className="h-10 w-10 text-[#FF0000] mx-auto mb-4 opacity-40" />
                                                <h3 className="font-bold text-lg mb-2">Connect YouTube Signal</h3>
                                                <p className="text-xs text-muted-foreground mb-6 max-w-[280px] mx-auto italic">
                                                    "Bridge your account to extract DNA from your activities and likes."
                                                </p>
                                                <a
                                                    href="/api/auth/google/login"
                                                    className="inline-flex items-center gap-2 bg-[#FF0000] text-white font-black text-xs px-6 py-3 rounded-full hover:scale-105 transition-all shadow-lg shadow-[#FF0000]/20"
                                                >
                                                    Authorize Librarian
                                                </a>
                                            </div>
                                        ) : personalHistory.length > 0 ? (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#FF0000] mb-4 flex items-center gap-2">
                                                    <Activity className="h-3 w-3" /> Personal Signal Matrix
                                                </h3>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {personalHistory.map((video) => (
                                                        <button
                                                            key={video.id}
                                                            onClick={() => runScan(video)}
                                                            className="flex flex-col gap-2 p-2 rounded-xl bg-white/5 border border-white/5 hover:border-[#FF0000]/30 transition-all text-left"
                                                        >
                                                            <img src={video.thumbnail} className="h-20 w-full rounded-lg object-cover grayscale opacity-80" alt="" />
                                                            <div className="min-w-0 px-1">
                                                                <h3 className="text-[9px] font-bold truncate" dangerouslySetInnerHTML={{ __html: video.title }} />
                                                                <p className="text-[7px] text-muted-foreground font-mono uppercase truncate">{video.channelTitle}</p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    animate={{ x: ["-100%", "100%"] }}
                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                    className="h-full w-1/3 bg-[#FF0000]/20"
                                                />
                                            </div>
                                        )}

                                        {/* Global Trending */}
                                        {trending.length > 0 && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                                <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-40 mb-4 flex items-center gap-2">
                                                    <Activity className="h-3 w-3" /> Global Station Buffers
                                                </h3>
                                                <div className="space-y-3">
                                                    {trending.map((video) => (
                                                        <button
                                                            key={video.id}
                                                            onClick={() => runScan(video)}
                                                            className="w-full flex gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all text-left"
                                                        >
                                                            <img src={video.thumbnail} className="h-10 w-16 rounded-lg object-cover grayscale opacity-50" alt="" />
                                                            <div className="min-w-0 pr-4 flex flex-col justify-center">
                                                                <h3 className="text-[11px] font-bold truncate max-w-[200px]" dangerouslySetInnerHTML={{ __html: video.title }} />
                                                                <p className="text-[9px] text-muted-foreground font-mono uppercase truncate">{video.channelTitle}</p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                )}
                                {!searching && query && results.length === 0 && (
                                    <div key="no-results" className="py-20 text-center opacity-30 italic">No signals detected. Refine query.</div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right Side: DNA Visualization */}
                    <div className="space-y-6">
                        <div className="glass p-10 rounded-[2.5rem] border-white/5 relative overflow-hidden min-h-[500px] flex flex-col items-center justify-center">
                            <AnimatePresence mode="wait">
                                {!selectedVideo ? (
                                    <motion.div
                                        key="idle"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center opacity-20"
                                    >
                                        <div className="mb-6 p-8 rounded-full border-2 border-dashed border-white/5 w-fit mx-auto">
                                            <Activity className="h-20 w-20" />
                                        </div>
                                        <p className="font-mono text-sm tracking-widest uppercase">Select a track to begin X-Ray</p>
                                    </motion.div>
                                ) : scanning ? (
                                    <motion.div
                                        key="scanning"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 1 }}
                                        className="w-full space-y-8"
                                    >
                                        <div className="flex flex-col items-center gap-6">
                                            <div className="relative">
                                                <img src={selectedVideo.thumbnail} className="h-40 w-60 rounded-2xl object-cover ring-2 ring-[#FF0000]/50" alt="" />
                                                <motion.div
                                                    animate={{ top: ["0%", "100%", "0%"] }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                    className="absolute left-0 right-0 h-0.5 bg-[#FF0000] shadow-[0_0_15px_#FF0000] z-10"
                                                />
                                            </div>
                                            <div className="text-center">
                                                <h3 className="font-bold text-lg mb-1 truncate max-w-sm" dangerouslySetInnerHTML={{ __html: selectedVideo.title }} />
                                                <p className="text-xs text-[#FF0000] font-mono animate-pulse uppercase tracking-widest">Scanning sonic lattice...</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4 px-10">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div
                                                        animate={{ x: ["-100%", "100%"] }}
                                                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                                        className="h-full w-1/3 bg-[#FF0000]/40"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                ) : dnaData && (
                                    <motion.div
                                        key="complete"
                                        initial={{ opacity: 0, scale: 1.05 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="w-full space-y-10"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 ring-1 ring-green-500/30">
                                                    <CheckCircle2 className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-xl leading-none">Scanning Complete</h3>
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Video ID: {selectedVideo.id}</p>
                                                </div>
                                            </div>
                                            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono opacity-50 uppercase">
                                                Ver 2.1-YT
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <DNAField label="Spectral Resonance" value={dnaData.vector[0]} color="yt" />
                                            <DNAField label="Temporal Density" value={dnaData.vector[1]} color="yt" />
                                            <DNAField label="Acoustic Warmth" value={dnaData.vector[7]} color="yt" />
                                            <DNAField label="Era Centroid" value={dnaData.vector[11]} color="yt" />
                                        </div>

                                        <div className="glass bg-white/5 rounded-2xl p-6 border-white/5 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Zap className="h-6 w-6 text-primary" />
                                                <div>
                                                    <p className="text-xs font-mono opacity-50 uppercase">Compatibility Potential</p>
                                                    <p className="font-bold text-lg">{(dnaData.vector[0] * 100).toFixed(1)}% Profile Weight</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="h-6 w-6 opacity-20 group-hover:opacity-100 transition-opacity" />
                                        </div>

                                        <Link href="/match" className="flex w-full items-center justify-center bg-white text-black font-black py-5 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all text-sm gap-2">
                                            <Scan className="h-5 w-5" />
                                            BROADCAST THIS SIGNAL
                                        </Link>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background elements */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-screen w-screen opacity-20 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] bg-[#FF0000]/10 blur-[150px] rounded-full animate-float" />
                <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] bg-primary/10 blur-[130px] rounded-full animate-pulse-glow" />
            </div>
        </div>
    );
}

function DNAField({ label, value, color = "primary" }: { label: string, value: number, color?: "primary" | "yt" }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-1.5 px-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">{label}</span>
                <span className="font-mono text-[10px] text-primary">{(value * 10).toFixed(2)}</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value * 100}%` }}
                    transition={{ duration: 1.2, ease: "anticipate" }}
                    className={`h-full ${color === "yt" ? "bg-[#FF0000]" : "bg-primary"}`}
                />
            </div>
        </div>
    );
}
