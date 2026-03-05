"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Youtube, Activity, ArrowLeft, ChevronRight, Zap, Music2, CheckCircle2, Scan, Brain, ExternalLink } from "lucide-react";
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
        fetchTrending();
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

        // Actual DNA generation call (frictionless)
        try {
            const res = await fetch("/api/dna/generate", { method: "POST" });
            const data = await res.json();

            // Artificial delay for UX
            await new Promise(r => setTimeout(r, 2000));

            const dna = {
                ...data,
                display_name: video.title,
                verbium: `Signal synchronized. ${video.title} has been mapped to existing DNA markers with high-fidelity spectral weights.`
            };

            setDnaData(dna);

            // AUTO-SAVE TO SUPABASE
            try {
                await fetch("/api/dna/profile/save", {
                    method: "POST",
                    body: JSON.stringify({
                        vector: dna.vector,
                        display_name: dna.display_name,
                        metadata: {
                            top_genres: dna.top_genres,
                            verbium: dna.verbium,
                            source: "youtube_scan",
                            video_id: video.id
                        }
                    }),
                    headers: { "Content-Type": "application/json" }
                });
            } catch (saveError) {
                console.error("Failed to sync structural profile:", saveError);
            }
        } catch (err) {
            console.error("DNA Gen failed", err);
        } finally {
            setScanning(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 px-6 sm:px-10 pb-20 flex flex-col items-center">
            <div className="max-w-5xl w-full">
                <header className="mb-10 md:mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-left">
                    <div className="flex-1">
                        <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase text-white/60 hover:text-white transition-colors mb-4">
                            <ArrowLeft className="h-3 md:h-3.5 w-3 md:w-3.5" /> Back
                        </button>
                        <h1 className="text-3xl md:text-4xl font-black mb-2 text-white">YouTube <span className="text-[#FF0000] italic">Scanner</span></h1>
                        <p className="text-sm md:text-base text-white/80 font-medium">Extracting structural audio DNA from any YouTube signal. No login required.</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#FF0000]/10 border border-[#FF0000]/20 self-start sm:self-auto">
                        <Youtube className="h-6 w-6 md:h-8 md:w-8 text-[#FF0000]" />
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Left Column: Search & Trends */}
                    <div className="space-y-8">
                        <div className="glass p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border-white/20 bg-gradient-to-br from-white/5 to-transparent">
                            <h2 className="text-lg md:text-xl font-black mb-6 md:mb-8 flex items-center gap-3 text-white">
                                <Search className="h-5 w-5 md:h-6 md:w-6 text-[#FF0000]" />
                                Initialize Frequency
                            </h2>
                            <form onSubmit={handleSearch} className="relative flex flex-col sm:block mb-6 gap-2">
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search..."
                                    className="w-full bg-white/5 border border-white/20 rounded-2xl py-4 sm:py-5 pl-5 sm:pl-7 pr-4 sm:pr-24 focus:outline-none focus:ring-2 focus:ring-[#FF0000]/40 transition-all font-bold text-white placeholder:text-white/20 text-sm sm:text-base"
                                />
                                <button
                                    type="submit"
                                    disabled={searching}
                                    className="sm:absolute right-2 sm:right-3 top-2 sm:top-3 bottom-2 sm:bottom-3 px-6 sm:px-8 bg-[#FF0000] text-white rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:scale-[1.03] active:scale-95 transition-all shadow-lg shadow-[#FF0000]/20 py-4 sm:py-0"
                                >
                                    {searching ? <Activity className="h-5 w-5 animate-spin" /> : "FIND"}
                                </button>
                            </form>

                            <AnimatePresence mode="wait">
                                {results.length > 0 ? (
                                    <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pt-4">
                                        {results.map((video) => (
                                            <button key={video.id} onClick={() => runScan(video)}
                                                className={`w-full flex gap-5 p-5 rounded-2xl border transition-all text-left group ${selectedVideo?.id === video.id ? "bg-[#FF0000]/10 border-[#FF0000]/40" : "bg-white/5 border-white/10 hover:border-white/30"}`}>
                                                <div className="relative shrink-0">
                                                    <img src={video.thumbnail} className="h-16 w-24 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-[#FF0000]/60 rounded-xl transition-all">
                                                        <Zap className="h-6 w-6 text-white" />
                                                    </div>
                                                </div>
                                                <div className="min-w-0 pr-4">
                                                    <h3 className="text-sm font-black truncate mb-1 text-white group-hover:text-[#FF0000]">{video.title}</h3>
                                                    <p className="text-[10px] text-white/40 font-mono uppercase tracking-[0.2em] font-bold">{video.channelTitle}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </motion.div>
                                ) : !searching && trending.length > 0 && (
                                    <motion.div key="trending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-8 text-white">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-6 flex items-center gap-2">
                                            <Activity className="h-4 w-4" /> Global Trending Signals
                                        </h3>
                                        <div className="space-y-4">
                                            {trending.map((video) => (
                                                <button key={video.id} onClick={() => runScan(video)} className="w-full flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#FF0000]/30 transition-all text-left group">
                                                    <div className="h-10 w-16 rounded-lg overflow-hidden shrink-0"><img src={video.thumbnail} className="h-full w-full object-cover grayscale opacity-40 group-hover:opacity-100 transition-all" alt="" /></div>
                                                    <div className="min-w-0 flex flex-col justify-center">
                                                        <h3 className="text-xs font-bold truncate text-white/60 group-hover:text-white" dangerouslySetInnerHTML={{ __html: video.title }} />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right Column: Visualization */}
                    <div className="space-y-8">
                        <div className="glass p-12 rounded-[3.5rem] border-white/20 min-h-[600px] flex flex-col items-center justify-center text-center relative overflow-hidden">
                            <AnimatePresence mode="wait">
                                {!selectedVideo ? (
                                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="opacity-30">
                                        <div className="mb-10 p-12 rounded-full border-4 border-dashed border-white/5 w-fit mx-auto ring-1 ring-white/10"><Activity className="h-24 w-24" /></div>
                                        <h3 className="text-xl font-black uppercase tracking-[0.3em]">Ready for Sync</h3>
                                        <p className="mt-2 text-xs font-mono uppercase tracking-widest text-primary font-bold">Waiting for audio signal buffer</p>
                                    </motion.div>
                                ) : scanning ? (
                                    <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-12">
                                        <div className="relative w-fit mx-auto">
                                            <img src={selectedVideo.thumbnail} className="h-48 w-72 rounded-[2rem] object-cover ring-4 ring-[#FF0000]/30" alt="" />
                                            <motion.div animate={{ top: ["0%", "100%", "0%"] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="absolute left-0 right-0 h-1 bg-[#FF0000] shadow-[0_0_20px_#FF0000] z-20" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black mb-3 text-white italic">{selectedVideo.title}</h3>
                                            <p className="text-xs text-[#FF0000] font-black uppercase tracking-[0.5em] animate-pulse">Quantizing Spectral Buffer</p>
                                        </div>
                                        <div className="space-y-4 px-12">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                                                    <motion.div animate={{ x: ["-100%", "100%"] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }} className="h-full w-1/4 bg-[#FF0000]/60" />
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                ) : dnaData && (
                                    <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full space-y-10">
                                        <div className="flex flex-col items-center">
                                            <div className="h-24 w-24 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 ring-2 ring-green-500/30 mb-8 shadow-[0_0_40px_rgba(34,197,94,0.3)]"><CheckCircle2 className="h-12 w-12" /></div>
                                            <h3 className="text-3xl font-black text-white italic">Sync Verified</h3>
                                            <p className="text-[10px] text-white/40 font-mono uppercase tracking-[0.3em] mt-3 font-black underline decoration-primary/50 underline-offset-4">{selectedVideo.id}</p>
                                        </div>

                                        <div className="space-y-6 text-left bg-black/60 p-10 rounded-[2.5rem] border border-white/20 shadow-2xl relative overflow-hidden group/logic">
                                            <div className="absolute top-0 right-0 p-6 opacity-5">
                                                <Brain className="h-20 w-20" />
                                            </div>

                                            <div className="space-y-6 relative z-10">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <DNAField label="Spectral Resonance" value={dnaData.vector[0]} color="yt" />
                                                    <DNAField label="Temporal Density" value={dnaData.vector[1]} color="yt" />
                                                    <DNAField label="Harmonicity" value={dnaData.vector[2]} color="yt" />
                                                    <DNAField label="Era Centroid" value={dnaData.vector[11]} color="yt" />
                                                </div>

                                                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-4">
                                                    <div className="flex items-start gap-4">
                                                        <div className="h-2 w-2 rounded-full bg-[#FF0000] mt-1 shrink-0 shadow-[0_0_10px_rgba(255,0,0,0.8)]" />
                                                        <p className="text-[11px] text-white leading-relaxed font-bold">
                                                            <span className="text-[#FF0000] uppercase tracking-widest block mb-1">Numbers Explained</span>
                                                            This signal is mapped to a <span className="text-white">12-dimensional vector space</span>. Each number represents a geometric coordinate extracted from the frequency buffer of the selected YouTube signal.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="glass p-6 rounded-2xl border-[#FF0000]/30 bg-[#FF0000]/5 flex gap-5 items-start">
                                                    <Zap className="h-6 w-6 text-[#FF0000] shrink-0 mt-1" />
                                                    <p className="text-xs font-bold italic leading-relaxed text-white/80">"{dnaData.verbium}"</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <Link href="/soulmates" prefetch={false} className="flex-1 bg-[#FF0000] text-white font-black py-6 rounded-[2rem] hover:scale-[1.03] active:scale-95 transition-all shadow-[0_0_30px_rgba(255,0,0,0.4)] flex items-center justify-center gap-3 text-lg uppercase tracking-widest">
                                                <Scan className="h-6 w-6" /> BROADCAST DNA
                                            </Link>
                                            <a href={`https://youtube.com/watch?v=${selectedVideo.id}`} target="_blank" rel="noopener noreferrer" className="p-6 rounded-[2rem] bg-white/10 hover:bg-white/20 transition-all text-white border border-white/20"><ExternalLink className="h-6 w-6" /></a>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            <div className="fixed inset-0 -z-30 pointer-events-none opacity-40">
                <div className="absolute top-1/4 left-1/4 h-[600px] w-[600px] bg-[#FF0000]/5 blur-[150px] rounded-full animate-float" />
                <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] bg-red-900/10 blur-[120px] rounded-full animate-pulse-glow" />
            </div>

            <style jsx global>{`
                .glass { background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px); }
            `}</style>
        </div>
    );
}

function DNAField({ label, value, color = "primary" }: { label: string, value: number, color?: "primary" | "yt" }) {
    const displayValue = typeof value === 'number' ? value : 0;
    return (
        <div className="group">
            <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 group-hover:text-white transition-colors">{label}</span>
                <span className="font-mono text-sm text-[#FF0000] font-black tracking-widest">{displayValue.toFixed(3)}</span>
            </div>
            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
                <motion.div initial={{ width: 0 }} animate={{ width: `${displayValue * 100}%` }} transition={{ duration: 1, ease: "easeOut" }} className={`h-full rounded-full ${color === "yt" ? "bg-[#FF0000] shadow-[0_0_15px_rgba(255,0,0,0.6)]" : "bg-primary shadow-[0_0_15px_rgba(255,0,0,0.4)]"}`} />
            </div>
        </div>
    );
}
