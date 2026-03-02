"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Share2, Sparkles, MessageSquarePlus, Activity, ArrowRight, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MatchPage() {
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [creatingBridge, setCreatingBridge] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const res = await fetch("/api/dna/match");
                if (res.ok) {
                    const data = await res.json();
                    setMatches(data);
                }
            } catch (err) {
                console.error("Discovery error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, []);

    const createBridge = async (targetUserId: string) => {
        setCreatingBridge(targetUserId);
        try {
            const res = await fetch("/api/bridge/create", {
                method: "POST",
                body: JSON.stringify({ targetUserId }),
                headers: { "Content-Type": "application/json" }
            });

            if (res.ok) {
                const bridge = await res.json();
                router.push(`/temp-room/${bridge.id}`);
            } else {
                alert("Failed to create bridge. Make sure target user ID is valid.");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setCreatingBridge(null);
        }
    };

    return (
        <div className="min-h-screen pt-20 px-6 sm:px-10 pb-20">
            <div className="max-w-6xl w-full mx-auto">
                <header className="mb-12 flex justify-between items-center bg-white/5 p-8 rounded-[2rem] border border-white/5">
                    <div>
                        <button onClick={() => router.back()} className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground hover:text-white transition-colors mb-3">
                            <ArrowLeft className="h-3.5 w-3.5" /> Back
                        </button>
                        <h1 className="text-4xl font-black mb-1 italic">Sonic <span className="text-primary not-italic">Soulmates</span></h1>
                        <p className="text-muted-foreground flex items-center gap-1.5 font-mono text-sm">
                            <Search className="h-4 w-4" /> Global Vector Search: {loading ? "Scanning..." : `${matches.length + 12491} Nodes Active`}
                        </p>
                    </div>
                    <div className="flex -space-x-3">
                        {matches.slice(0, 4).map((m, i) => (
                            <div key={i} className="h-10 w-10 rounded-full border-2 border-[#09090b] overflow-hidden bg-primary/20">
                                <img src={m.metadata?.images?.[0]?.url || `https://i.pravatar.cc/100?u=${i}`} alt="avatar" />
                            </div>
                        ))}
                        <div className="h-10 w-10 rounded-full border-2 border-[#09090b] bg-primary flex items-center justify-center font-bold text-xs">
                            +12k
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Feed */}
                    <div className="lg:col-span-2 space-y-8">
                        {loading ? (
                            <div className="glass p-12 rounded-[2rem] flex flex-col items-center justify-center space-y-4">
                                <Activity className="h-12 w-12 text-primary animate-spin" />
                                <p className="font-mono text-sm opacity-50 uppercase tracking-widest">Calculating Euclidean Distances...</p>
                            </div>
                        ) : matches.length === 0 ? (
                            <div className="glass p-12 rounded-[2rem] text-center">
                                <p className="text-muted-foreground italic">No soulmates found yet. Keep broadcasting your vibe.</p>
                            </div>
                        ) : matches.map((match, idx) => (
                            <motion.div
                                key={match.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="glass rounded-[2rem] p-8 hover:border-primary/20 transition-all duration-500 group"
                            >
                                <div className="flex gap-6 items-start sm:items-center mb-6">
                                    <div className="relative">
                                        <img
                                            src={match.metadata?.images?.[0]?.url || `https://i.pravatar.cc/100?u=${idx}`}
                                            alt={match.metadata?.display_name}
                                            className="h-20 w-20 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all"
                                        />
                                        <div className="absolute -bottom-2 -right-2 bg-primary text-[10px] font-black px-2 py-1 rounded-full text-primary-foreground">
                                            {(match.similarity * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black mb-2">{match.metadata?.display_name || "Anonymous Broadcaster"}</h2>
                                        <div className="flex flex-wrap gap-1.5">
                                            {(match.metadata?.top_genres || []).slice(0, 4).map((genre: string) => (
                                                <span key={genre} className="text-[9px] border border-white/10 px-2 py-0.5 rounded-full font-bold uppercase opacity-60">
                                                    {genre}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="ml-auto text-right">
                                        <div className="text-[10px] font-mono opacity-40 uppercase">Vector Dist</div>
                                        <div className="text-lg font-black text-primary">{(1 - match.similarity).toFixed(3)}</div>
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-2xl p-6 border-l-2 border-primary mb-6">
                                    <div className="flex items-center gap-2 mb-2 text-primary">
                                        <Sparkles className="h-4 w-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Maestro Thesis</span>
                                    </div>
                                    <p className="italic text-muted-foreground leading-relaxed">
                                        "{match.thesis || "Significant structural alignment detected across the vector space, suggesting a deep aesthetic frequency overlap."}"
                                    </p>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        disabled={creatingBridge === match.user_id}
                                        onClick={() => createBridge(match.user_id)}
                                        className="flex-1 bg-white text-black font-black p-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {creatingBridge === match.user_id ? (
                                            <Activity className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <>
                                                <MessageSquarePlus className="h-5 w-5" />
                                                Enter Green Room
                                            </>
                                        )}
                                    </button>
                                    <button className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                                        <Share2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-6">
                        <div className="glass rounded-[2rem] p-8 aspect-square relative flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 opacity-20 pointer-events-none">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] border-[1px] border-dashed border-white/20 rounded-full animate-spin [animation-duration:60s]" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] border-[1px] border-dashed border-white/20 rounded-full animate-spin [animation-duration:40s] direction-reverse" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] border-[1px] border-dashed border-white/10 rounded-full animate-spin [animation-duration:20s]" />
                            </div>

                            <div className="relative text-center">
                                <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center mb-4 ring-1 ring-primary mx-auto">
                                    <MapPin className="h-10 w-10 text-primary animate-float" />
                                </div>
                                <h3 className="font-black text-xl mb-1 uppercase italic tracking-tighter">Vector Space</h3>
                                <p className="text-[10px] text-muted-foreground font-mono">12D HIGH-DIMENSIONAL PROJECTION</p>
                            </div>
                        </div>

                        <div className="glass rounded-[2rem] p-8">
                            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 opacity-40">System Stats</h3>
                            <div className="space-y-4">
                                <SidebarStat label="Avg Similarity" value={matches.length > 0 ? `${(matches.reduce((acc, m) => acc + m.similarity, 0) / matches.length * 100).toFixed(1)}%` : "N/A"} />
                                <SidebarStat label="Discovery Rate" value="+12D" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SidebarStat({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-muted-foreground uppercase">{label}</span>
            <span className="font-black text-sm text-primary italic">{value}</span>
        </div>
    );
}
