"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Share2, MessageSquarePlus, Activity, ArrowLeft, Mail, CheckCircle2, X, Brain, Binary, Filter, ChevronRight, Users, Music2, Scan } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MatchPage() {
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [userDna, setUserDna] = useState<any>(null);

    const router = useRouter();

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                // Fetch user DNA for stats
                const profileRes = await fetch("/api/dna/profile/me");
                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    setUserDna(profileData.profile);
                }

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

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMatch) return;
        setSubmitting(true);
        try {
            const res = await fetch("/api/match/join", {
                method: "POST",
                body: JSON.stringify({
                    targetId: selectedMatch.user_id,
                    email: email
                }),
                headers: { "Content-Type": "application/json" }
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                    setSelectedMatch(null);
                    setEmail("");
                }, 4000);
            } else {
                alert("Failed to register interest. Please try again.");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen pt-20 px-6 sm:px-10 pb-20">
            <div className="max-w-6xl w-full mx-auto">
                <header className="mb-12 flex justify-between items-center bg-black/40 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Binary className="h-40 w-40" />
                    </div>

                    <div className="relative z-10">
                        <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase text-white/40 hover:text-[#FF0000] transition-colors mb-4 tracking-[0.3em]">
                            <ArrowLeft className="h-4 w-4" /> Return to DNA
                        </button>
                        <h1 className="text-5xl font-black mb-3 italic tracking-tighter">Sonic <span className="text-[#FF0000] not-italic">Soulmates</span></h1>
                        <div className="flex items-center gap-4">
                            <p className="text-[#FF0000] flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.3em] bg-[#FF0000]/10 px-4 py-2 rounded-full border border-[#FF0000]/20">
                                <Activity className="h-4 w-4 animate-pulse" /> Neural Protocol Active
                            </p>
                            <span className="text-white/40 font-mono text-[9px] uppercase tracking-[0.4em]">12,492 Signal Nodes Active</span>
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
                                className="glass rounded-[2rem] p-8 hover:border-[#FF0000]/30 transition-all duration-500 group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Brain className="h-16 w-16" />
                                </div>

                                <div className="flex gap-8 items-start sm:items-center relative z-10">
                                    <div className="relative shrink-0">
                                        <div className="absolute inset-0 bg-[#FF0000]/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <img
                                            src={match.metadata?.images?.[0]?.url || `https://i.pravatar.cc/100?u=${idx}`}
                                            alt={match.metadata?.display_name}
                                            className="h-24 w-24 rounded-3xl object-cover grayscale group-hover:grayscale-0 transition-all ring-1 ring-white/10 group-hover:ring-[#FF0000]/40 scale-100 group-hover:scale-110"
                                        />
                                        <div className="absolute -bottom-3 -right-3 bg-[#FF0000] text-[12px] font-black px-3 py-1.5 rounded-xl text-white shadow-xl">
                                            {(match.similarity * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-3xl font-black mb-3 italic tracking-tighter group-hover:text-[#FF0000] transition-colors">{match.metadata?.display_name || "Anonymous Broadcaster"}</h2>
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {(match.metadata?.top_genres || []).slice(0, 4).map((genre: string) => (
                                                <span key={genre} className="text-[9px] bg-white/5 border border-white/10 px-3 py-1 rounded-lg font-black uppercase tracking-widest text-white/60 group-hover:text-white group-hover:border-white/20 transition-all">
                                                    {genre}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => setSelectedMatch(match)}
                                                className="flex-1 bg-white text-black font-black py-4 rounded-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-widest shadow-lg"
                                            >
                                                <MessageSquarePlus className="h-5 w-5" />
                                                Create Connection
                                            </button>
                                            <button className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-white/40 hover:text-white">
                                                <Share2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <div className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Euclidean Dist</div>
                                        <div className="text-2xl font-mono font-black text-[#FF0000] group-hover:scale-110 transition-transform origin-right">{(1 - match.similarity).toFixed(3)}</div>
                                        <div className="text-[8px] font-bold text-white/20 uppercase mt-1">Structural Gap</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-6">
                        {/* Primary Signal Explanation */}
                        <div className="glass rounded-[2.5rem] p-10 border-[#FF0000]/30 bg-[#FF0000]/5 ring-1 ring-[#FF0000]/20 relative overflow-hidden">
                            <h3 className="font-black flex items-center gap-2 uppercase tracking-[0.2em] text-[10px] text-[#FF0000] mb-8">
                                <Brain className="h-5 w-5" /> Active Protocol
                            </h3>

                            <div className="space-y-8 relative z-10">
                                <div className="border-b border-white/10 pb-6">
                                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-2 font-mono">My Primary Signal</p>
                                    <div className="flex items-end justify-between">
                                        <h4 className="text-2xl font-black text-white italic truncate pr-4">{userDna?.display_name || "Scanning..."}</h4>
                                        <div className="text-right shrink-0">
                                            <p className="text-3xl font-mono font-black text-[#FF0000] tracking-tighter">80.2%</p>
                                            <p className="text-[9px] font-black text-white uppercase tracking-widest">COHERENCE</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-white/10 p-5 rounded-2xl border border-white/10">
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">Vector Dist Target</p>
                                            <p className="text-lg font-mono font-black text-white tracking-widest">0.198</p>
                                        </div>
                                        <p className="text-[8px] text-white/30 font-bold uppercase">Optimal clustering threshold</p>
                                    </div>
                                    <div className="bg-white/10 p-5 rounded-2xl border border-white/10">
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">Vector Space</p>
                                            <p className="text-lg font-mono font-black text-white tracking-widest">12D PROJECTION</p>
                                        </div>
                                        <p className="text-[8px] text-white/30 font-bold uppercase">Quantized frequency axes</p>
                                    </div>
                                </div>

                                <div className="bg-black/60 p-6 rounded-2xl border border-white/20 space-y-4 shadow-xl">
                                    <div className="flex items-start gap-4">
                                        <div className="h-2 w-2 rounded-full bg-[#FF0000] mt-1 shrink-0" />
                                        <p className="text-[10px] text-white leading-relaxed font-bold">
                                            <span className="text-[#FF0000] uppercase tracking-widest block mb-1">Numbers Explained</span>
                                            Similarity is calculated via Euclidean distance in a 12-dimensional vector space. 80.2% coherence confirms your signature's structural integrity.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Aesthetic Projection */}
                        <div className="glass rounded-[2.5rem] p-8 aspect-square relative flex items-center justify-center overflow-hidden border-white/5">
                            <div className="absolute inset-0 opacity-20 pointer-events-none">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] border-[1px] border-dashed border-white/20 rounded-full animate-spin [animation-duration:60s]" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] border-[1px] border-dashed border-white/20 rounded-full animate-spin [animation-duration:40s] direction-reverse" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] border-[1px] border-dashed border-white/10 rounded-full animate-spin [animation-duration:20s]" />
                            </div>

                            <div className="relative text-center">
                                <div className="h-16 w-16 rounded-full bg-[#FF0000]/20 flex items-center justify-center mb-4 ring-1 ring-[#FF0000]/40 mx-auto">
                                    <Scan className="h-8 w-8 text-[#FF0000] animate-float" />
                                </div>
                                <h3 className="font-black text-lg mb-1 uppercase italic tracking-tighter text-white">Neural Sink</h3>
                                <p className="text-[9px] text-white/40 font-mono tracking-widest">12,492 NODES</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Email Modal Overlay */}
            <AnimatePresence>
                {selectedMatch && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 sm:p-10">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedMatch(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="glass w-full max-w-lg rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden"
                        >
                            <button
                                onClick={() => setSelectedMatch(null)}
                                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            {success ? (
                                <div className="text-center py-10">
                                    <div className="inline-flex h-20 w-20 rounded-full bg-green-500/20 items-center justify-center mb-6">
                                        <CheckCircle2 className="h-10 w-10 text-green-500" />
                                    </div>
                                    <h2 className="text-2xl font-black mb-2 italic">Match Group Initialized</h2>
                                    <p className="text-muted-foreground leading-relaxed">
                                        Signal received. We'll alert you at <span className="text-white font-bold">{email}</span> as soon as the connection bridge syncs.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-4 mb-8">
                                        <img
                                            src={selectedMatch.metadata?.images?.[0]?.url || ""}
                                            className="h-14 w-14 rounded-xl object-cover"
                                            alt="Match avatar"
                                        />
                                        <div>
                                            <h2 className="text-xl font-black italic">Form Connection</h2>
                                            <p className="text-xs text-muted-foreground uppercase font-mono tracking-widest">Target: {selectedMatch.metadata?.display_name}</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleEmailSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Your Communications Email</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                                                <input
                                                    type="email"
                                                    required
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="you@ecosystem.com"
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                                />
                                            </div>
                                        </div>

                                        <p className="text-xs text-muted-foreground leading-relaxed italic">
                                            "Entering your email will initialize a private contact group. Interaction protocols will be established once both vectors confirm the link."
                                        </p>

                                        <button
                                            disabled={submitting}
                                            type="submit"
                                            className="w-full bg-primary text-primary-foreground font-black py-5 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all glow-primary"
                                        >
                                            {submitting ? <Activity className="h-5 w-5 animate-spin" /> : "Deploy Signal"}
                                        </button>
                                    </form>
                                </>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
