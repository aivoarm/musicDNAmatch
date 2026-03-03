"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Share2, MessageSquarePlus, Activity, ArrowLeft, Mail, CheckCircle2, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MatchPage() {
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

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
                                <div className="flex gap-6 items-start sm:items-center">
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
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-black mb-2">{match.metadata?.display_name || "Anonymous Broadcaster"}</h2>
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {(match.metadata?.top_genres || []).slice(0, 4).map((genre: string) => (
                                                <span key={genre} className="text-[9px] border border-white/10 px-2 py-0.5 rounded-full font-bold uppercase opacity-60">
                                                    {genre}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => setSelectedMatch(match)}
                                                className="flex-1 bg-white text-black font-black py-3 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all text-sm"
                                            >
                                                <MessageSquarePlus className="h-4 w-4" />
                                                Create Contact Group
                                            </button>
                                            <button className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                                                <Share2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <div className="text-[10px] font-mono opacity-40 uppercase">Vector Dist</div>
                                        <div className="text-lg font-black text-primary">{(1 - match.similarity).toFixed(3)}</div>
                                    </div>
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
                                <p className="text-[10px] text-muted-foreground font-mono">12D PROJECTION</p>
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
