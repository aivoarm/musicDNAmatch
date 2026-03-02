"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Scan, Activity, Zap, CheckCircle2, ChevronRight, Wind, ArrowLeft, Music2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BroadcastPage() {
    const [analyzing, setAnalyzing] = useState(false);
    const [complete, setComplete] = useState(false);
    const [progress, setProgress] = useState(0);
    const [dnaData, setDnaData] = useState<any>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const router = useRouter();

    const startAnalysis = async () => {
        setAnalyzing(true);
        setProgress(5);
        setComplete(false);
        setErrorMessage(null);

        try {
            await new Promise(r => setTimeout(r, 800));
            setProgress(20);

            const res = await fetch("/api/dna/generate", { method: "POST" });

            if (res.status === 401) {
                window.location.href = "/api/auth/spotify/login";
                return;
            }

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                if (errData.redirect) { window.location.href = errData.redirect; return; }
                setErrorMessage(errData.error || `Server error (${res.status})`);
                setAnalyzing(false);
                setProgress(0);
                return;
            }

            const data = await res.json();

            for (let i = 21; i <= 100; i++) {
                setProgress(i);
                await new Promise(r => setTimeout(r, 10));
            }

            setDnaData(data);
            setComplete(true);
            setAnalyzing(false);
        } catch (err: any) {
            setErrorMessage(err.message || "Unknown error occurred.");
            setAnalyzing(false);
            setProgress(0);
        }
    };

    const formatDuration = (ms: number) => {
        const m = Math.floor(ms / 60000);
        const s = Math.floor((ms % 60000) / 1000);
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    return (
        <div className="min-h-screen pt-20 px-6 sm:px-10 pb-20 flex flex-col items-center">
            <div className="max-w-5xl w-full">
                <header className="mb-12 flex justify-between items-end">
                    <div>
                        <button onClick={() => router.back()} className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground hover:text-white transition-colors mb-3">
                            <ArrowLeft className="h-3.5 w-3.5" /> Back
                        </button>
                        <h1 className="text-4xl font-black mb-2">Vibe <span className="text-primary italic">Broadcast</span></h1>
                        <p className="text-muted-foreground">Synchronizing local audio buffers with universal DNA markers.</p>
                    </div>
                    <div className="hidden sm:block text-right">
                        <div className="text-xs font-mono opacity-50 uppercase tracking-widest mb-1">Station ID</div>
                        <div className="text-sm font-mono text-primary">DNA-V2.0-TX-4491</div>
                    </div>
                </header>

                {errorMessage && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className="mb-6 glass rounded-2xl p-5 border border-red-500/30 bg-red-500/5 flex items-start gap-4">
                        <div className="text-red-400 font-mono text-xs mt-0.5">⚠ ERROR</div>
                        <div className="flex-1"><p className="text-red-300 text-sm font-medium">{errorMessage}</p></div>
                        <button onClick={() => { setErrorMessage(null); startAnalysis(); }}
                            className="text-xs font-bold uppercase text-primary hover:underline shrink-0">Retry</button>
                    </motion.div>
                )}

                {!analyzing && !complete ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="glass rounded-[2rem] p-12 text-center">
                        <div className="mb-8 p-6 rounded-full bg-primary/10 w-fit mx-auto ring-1 ring-primary/20">
                            <Radio className="h-12 w-12 text-primary animate-pulse" />
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Ready to Broadcast?</h2>
                        <p className="text-muted-foreground mb-10 max-w-md mx-auto italic">
                            "We strip away cultural labels and focus on the underlying mathematics of sound."
                        </p>
                        <button onClick={startAnalysis}
                            className="bg-white text-black font-black px-12 py-5 rounded-2xl hover:scale-105 active:scale-95 transition-transform">
                            Analyze Musical DNA
                        </button>
                    </motion.div>
                ) : (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            {/* Left: DNA Visualization */}
                            <div className="glass rounded-[2rem] p-10 overflow-hidden relative">
                                <div className="flex justify-between items-center mb-8">
                                    <span className="font-mono text-sm uppercase opacity-40">System Log: DNA Extraction</span>
                                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                </div>

                                <div className="space-y-8">
                                    <DNAField label="Spectral Centroid" value={dnaData ? dnaData.vector[0] : (progress > 30 ? 0.82 : 0)} />
                                    <DNAField label="Transient Density" value={dnaData ? dnaData.vector[1] : (progress > 50 ? 0.15 : 0)} color="secondary" />
                                    <DNAField label="Harmonicity" value={dnaData ? dnaData.vector[2] : (progress > 70 ? 0.44 : 0)} />
                                    <DNAField label="Temporal Polarity" value={dnaData ? dnaData.vector[5] : (progress > 90 ? 0.92 : 0)} color="secondary" />
                                </div>

                                <div className="mt-12 h-40 flex items-center justify-center relative">
                                    <AnimatePresence>
                                        {!complete && (
                                            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.2, opacity: 0 }}
                                                className="absolute inset-0 flex items-center justify-center">
                                                <div className="relative">
                                                    <div className="h-24 w-24 rounded-full border-2 border-primary/20 animate-ping absolute" />
                                                    <div className="h-24 w-24 rounded-full border-2 border-primary/40 animate-pulse relative flex items-center justify-center">
                                                        <Scan className="h-8 w-8 text-primary" />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                        {complete && (
                                            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                                className="absolute inset-0 flex flex-col items-center justify-center text-primary">
                                                <CheckCircle2 className="h-20 w-20 mb-4" />
                                                <span className="font-black tracking-widest uppercase">Sync Complete</span>
                                                {dnaData?.display_name && (
                                                    <span className="text-xs font-mono opacity-50 mt-1">{dnaData.display_name}</span>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Right: Metadata */}
                            <div className="space-y-6">
                                {/* Top Genres */}
                                {dnaData?.top_genres && dnaData.top_genres.length > 0 && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        className="glass rounded-[2rem] p-8">
                                        <h3 className="font-bold flex items-center gap-2 mb-5 uppercase tracking-tighter text-sm opacity-50">
                                            <Music2 className="h-4 w-4" /> Major Genres
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {dnaData.top_genres.map((genre: string, i: number) => (
                                                <span key={genre} className={`text-xs font-bold px-3 py-1.5 rounded-full border ${i === 0 ? "bg-primary/20 border-primary/40 text-primary" :
                                                        i < 3 ? "bg-white/10 border-white/20" : "bg-white/5 border-white/10 opacity-60"
                                                    }`}>
                                                    {genre}
                                                </span>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                <div className="glass rounded-[2rem] p-8">
                                    <h3 className="font-bold flex items-center gap-2 mb-6 uppercase tracking-tighter text-sm opacity-50">
                                        <Zap className="h-4 w-4" /> Vector Quantization
                                    </h3>
                                    <p className="text-xs font-mono text-muted-foreground leading-relaxed whitespace-pre opacity-60">
                                        {dnaData
                                            ? JSON.stringify({
                                                spectral: dnaData.vector.slice(0, 3).map((v: number) => Number(v.toFixed(2))),
                                                rhythmic: dnaData.vector.slice(4, 6).map((v: number) => Number(v.toFixed(2))),
                                                psychoacoustic: dnaData.vector.slice(7, 9).map((v: number) => Number(v.toFixed(2)))
                                            }, null, 2)
                                            : `{\n  spectral: [0.82, 0.15, 0.44]\n  rhythmic: [0.20, 0.88]\n}`}
                                    </p>
                                </div>

                                {complete && (
                                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                                        <Link href="/match"
                                            className="flex w-full items-center justify-between bg-primary p-6 rounded-[1.5rem] font-bold text-primary-foreground glow-primary group">
                                            <span>Find Sonic Soulmates</span>
                                            <ChevronRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Recent History */}
                        {complete && dnaData?.recent_tracks && dnaData.recent_tracks.length > 0 && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                                className="glass rounded-[2rem] p-8">
                                <h3 className="font-bold flex items-center gap-2 mb-6 uppercase tracking-tighter text-sm opacity-50">
                                    <Music2 className="h-4 w-4" /> Recent Listening History
                                </h3>
                                <div className="space-y-3">
                                    {dnaData.recent_tracks.map((track: any, i: number) => (
                                        <motion.a
                                            key={track.id}
                                            href={track.url || "#"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 * i }}
                                            className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-primary/20 transition-all group"
                                        >
                                            <div className="relative shrink-0">
                                                {track.image ? (
                                                    <img src={track.image} alt={track.album} className="h-12 w-12 rounded-xl object-cover" />
                                                ) : (
                                                    <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center">
                                                        <Music2 className="h-5 w-5 opacity-40" />
                                                    </div>
                                                )}
                                                <div className="absolute -top-1 -left-1 h-5 w-5 rounded-full bg-black border border-white/10 flex items-center justify-center text-[9px] font-black">
                                                    {i + 1}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-bold truncate">{track.name}</div>
                                                <div className="text-[11px] text-muted-foreground truncate">{track.artist}</div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="text-[10px] font-mono opacity-40">{formatDuration(track.duration_ms)}</div>
                                                <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-40 transition-opacity ml-auto mt-1" />
                                            </div>
                                        </motion.a>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function DNAField({ label, value, color = "primary" }: { label: string, value: number, color?: "primary" | "secondary" }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
                <span className="font-mono text-xs">{value.toFixed(2)}</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value * 100}%` }}
                    className={`h-full ${color === "primary" ? "bg-primary" : "bg-white/40"}`}
                />
            </div>
        </div>
    );
}
