"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Share2, MessageSquarePlus, Activity, ArrowLeft, Mail, CheckCircle2, X, Brain, Binary, Filter, ChevronRight, Users, Music2, Scan, ExternalLink, User } from "lucide-react";
import { AXIS_LABELS } from "@/lib/dna";
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
    const [isVerified, setIsVerified] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                // Fetch user DNA for stats
                const profileRes = await fetch("/api/dna/profile/me");
                if (profileRes.ok) {
                    const profileData = await profileRes.json() as any;
                    setUserDna(profileData.dna);

                    // Check for verified session
                    const authEmail = document.cookie.split(";").find(c => c.trim().startsWith("auth_email="));
                    if (authEmail) {
                        setIsVerified(true);
                        setEmail(profileData.dna.email || "");
                    }
                }

                const res = await fetch("/api/dna/match");
                if (res.ok) {
                    const data = await res.json() as any;
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
                <header className="mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-center bg-black/40 backdrop-blur-3xl p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Binary className="h-40 w-40" />
                    </div>

                    <div className="relative z-10">
                        <button onClick={() => router.back()} className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase text-white/70 hover:text-[#FF0000] transition-colors mb-4 tracking-[0.3em]">
                            <ArrowLeft className="h-3.5 md:h-4 w-3.5 md:w-4" /> Return to DNA
                        </button>
                        <h1 className="text-3xl md:text-5xl font-black mb-3 italic tracking-tighter">Sonic <span className="text-[#FF0000] not-italic">Soulmates</span></h1>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                            <p className="text-[#FF0000] flex items-center gap-2 font-black text-[9px] uppercase tracking-[0.2em] sm:tracking-[0.3em] bg-[#FF0000]/10 px-3 sm:px-4 py-2 rounded-full border border-[#FF0000]/20">
                                <Activity className="h-3 md:h-4 w-3 md:w-4 animate-pulse" /> Neural Protocol Active
                            </p>
                            <span className="text-white/70 font-mono text-[8px] md:text-[9px] uppercase tracking-[0.3em] md:tracking-[0.4em]">12,492 Signal Nodes Active</span>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Discovery Feed */}
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
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 px-2 text-[10px] font-black tracking-[0.2em] text-white/70 uppercase mb-2">
                                    <Brain className="h-3.5 w-3.5" /> High Coherence Signals
                                </div>
                                {matches.map((match, idx) => (
                                    <motion.div
                                        key={match.id || idx}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className={`glass rounded-[2rem] p-6 md:p-8 transition-all duration-500 group relative overflow-hidden ${match.is_mutual ? 'ring-2 ring-green-500/50 shadow-[0_0_50px_rgba(34,197,94,0.1)]' : match.has_signal ? 'opacity-80 grayscale' : 'hover:border-[#FF0000]/30'}`}
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Brain className="h-16 w-16" />
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-6 md:gap-8 items-start sm:items-center relative z-10">
                                            <div className="relative shrink-0 mx-auto sm:mx-0">
                                                <div className={`absolute inset-0 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${match.is_mutual ? 'bg-green-500/20' : 'bg-[#FF0000]/20'}`} />
                                                <img
                                                    src={match.metadata?.images?.[0]?.url || `/avatars/${['sync', 'pulse', 'heart'][idx % 3]}.png`}
                                                    alt={match.metadata?.display_name}
                                                    className={`h-20 w-20 md:h-24 md:w-24 rounded-[1.5rem] md:rounded-3xl object-cover transition-all ring-1 ring-white/10 group-hover:ring-[#FF0000]/40 scale-100 group-hover:scale-105 ${match.is_mutual ? 'grayscale-0' : 'grayscale'}`}
                                                />
                                                <div className={`absolute -bottom-2 -right-2 text-[10px] md:text-[12px] font-black px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl text-white shadow-xl ${match.is_mutual ? 'bg-green-500' : 'bg-[#FF0000]'}`}>
                                                    {(match.similarity * 100).toFixed(1)}%
                                                </div>
                                            </div>

                                            <div className="flex-1 w-full text-center sm:text-left">
                                                <div className="mb-2 md:mb-3 flex items-center justify-center sm:justify-start gap-3">
                                                    <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter truncate text-white">{match.metadata?.display_name || "Anonymous Broadcaster"}</h2>
                                                    {match.is_mutual && <span className="text-[8px] font-black bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full border border-green-500/20 uppercase tracking-widest">Mutual Match</span>}
                                                </div>

                                                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-6">
                                                    {(match.metadata?.top_genres || []).slice(0, 3).map((genre: string) => (
                                                        <span key={genre} className="text-[8px] md:text-[9px] bg-white/5 border border-white/10 px-2 md:px-3 py-0.5 md:py-1 rounded-lg font-black uppercase tracking-widest text-white/60">
                                                            {genre}
                                                        </span>
                                                    ))}
                                                    {match.song_match_count > 0 && (
                                                        <span className="text-[8px] md:text-[9px] bg-[#FF0000]/10 border border-[#FF0000]/20 px-2 md:px-3 py-0.5 md:py-1 rounded-lg font-black uppercase tracking-widest text-[#FF0000]">
                                                            {match.song_match_count} {match.song_match_count === 1 ? 'Song' : 'Songs'} Match
                                                        </span>
                                                    )}
                                                    {match.artist_match_count > 0 && (
                                                        <span className="text-[8px] md:text-[9px] bg-blue-500/10 border border-blue-500/20 px-2 md:px-3 py-0.5 md:py-1 rounded-lg font-black uppercase tracking-widest text-blue-400">
                                                            {match.artist_match_count} {match.artist_match_count === 1 ? 'Artist' : 'Artists'} Match
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex flex-col sm:flex-row gap-3">
                                                    {match.is_mutual ? (
                                                        <Link
                                                            href={`/temp-room/${match.bridge_id}`}
                                                            className="flex-1 bg-green-500 text-black font-black py-3 md:py-4 rounded-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all text-xs md:text-sm uppercase tracking-widest shadow-lg"
                                                        >
                                                            <Scan className="h-4 w-4 md:h-5 md:w-5" />
                                                            Enter Intersection
                                                        </Link>
                                                    ) : (
                                                        <button
                                                            onClick={() => !match.has_signal && setSelectedMatch(match)}
                                                            disabled={match.has_signal}
                                                            className={`flex-1 font-black py-3 md:py-4 rounded-xl flex items-center justify-center gap-3 transition-all text-xs md:text-sm uppercase tracking-widest shadow-lg ${match.has_signal ? 'bg-white/10 text-white/70 cursor-not-allowed' : 'bg-white text-black hover:scale-[1.02] active:scale-95'}`}
                                                        >
                                                            {match.has_signal ? (
                                                                <>
                                                                    <Activity className="h-4 w-4 text-white/50" />
                                                                    Signal Pending
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <MessageSquarePlus className="h-4 w-4 md:h-5 md:w-5" />
                                                                    Create Connection
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                                    <button className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/70 hover:text-white flex justify-center items-center">
                                                        <Share2 className="h-4 w-4 md:h-5 md:w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Intersections & Signal Analysis */}
                    <div className="space-y-6">
                        <section className="glass rounded-[2rem] p-8 border-white/10 bg-white/2 backdrop-blur-2xl">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/70 mb-6 flex items-center gap-2">
                                <Users className="h-4 w-4 text-[#FF0000]" /> Active Intersections
                            </h3>

                            <div className="space-y-4">
                                {matches.filter(m => m.is_mutual).length === 0 ? (
                                    <div className="p-8 text-center bg-black/20 rounded-2xl border border-dashed border-white/10">
                                        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest leading-relaxed">No shared signals yet. Signals must cross for access.</p>
                                    </div>
                                ) : (
                                    matches.filter(m => m.is_mutual).map((m, i) => (
                                        <Link
                                            key={m.id || i}
                                            href={`/temp-room/${m.bridge_id}`}
                                            className="block p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={m.metadata?.images?.[0]?.url || "/avatars/sync.png"}
                                                    className="h-10 w-10 rounded-xl object-cover ring-1 ring-white/10"
                                                    alt="Intersection Partner"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs font-black text-white truncate group-hover:text-green-500 transition-colors uppercase tracking-tight">
                                                        {m.metadata?.display_name || "Neural Signal"}
                                                    </div>
                                                    <div className="text-[8px] font-black text-white/60 uppercase tracking-widest mt-0.5">Intersection Room Active</div>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-white/50 group-hover:text-white transition-colors" />
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </section>

                        {/* Primary Signal Explanation */}
                        <div className="glass rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border-[#FF0000]/30 bg-[#FF0000]/5 ring-1 ring-[#FF0000]/20 relative overflow-hidden">
                            <h3 className="font-black flex items-center gap-2 uppercase tracking-[0.2em] text-[9px] md:text-[10px] text-[#FF0000] mb-6 md:mb-8">
                                <Brain className="h-4 md:h-5 w-4 md:w-5" /> Active Protocol
                            </h3>

                            <div className="space-y-6 md:space-y-8 relative z-10">
                                <div className="border-b border-white/10 pb-6">
                                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-2 font-mono">My Primary Signal</p>
                                    <div className="flex items-end justify-between border-b border-white/10 pb-6 mb-6">
                                        <h4 className="text-xl md:text-2xl font-black text-white italic truncate pr-4">{userDna?.display_name || "Scanning..."}</h4>
                                        <div className="text-right shrink-0">
                                            <p className="text-2xl md:text-3xl font-mono font-black text-[#FF0000] tracking-tighter">
                                                {((userDna?.coherence_index ?? 0.8) * 100).toFixed(1)}%
                                            </p>
                                            <p className="text-[8px] md:text-[9px] font-black text-white uppercase tracking-widest">COHERENCE</p>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <p className="mono text-[8px] text-white/50 uppercase tracking-[0.2em] mb-3">Seed Identity — Selected Genres</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {(userDna?.top_genres || []).slice(0, 3).map((g: string) => (
                                                <span key={g} className="text-[8px] bg-white/5 border border-white/10 text-white/60 px-2 py-1 rounded-md font-black uppercase tracking-widest">{g}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <p className="mono text-[8px] text-[#FF0000]/60 uppercase tracking-[0.2em] mb-3">Neural Highlights — Strongest Dim</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {AXIS_LABELS.map((label, i) => ({ label, value: userDna?.vector?.[i] || 0 }))
                                                .sort((a, b) => b.value - a.value)
                                                .slice(0, 2)
                                                .map((axis) => (
                                                    <span key={axis.label} className="text-[8px] bg-[#FF0000]/10 border border-[#FF0000]/20 text-[#FF0000] px-2 py-1 rounded-md font-black uppercase tracking-widest">
                                                        {axis.label.replace(/_/g, " ")}
                                                    </span>
                                                ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-white/10 p-5 rounded-2xl border border-white/10">
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">Normalized Distance</p>
                                            <p className="text-lg font-mono font-black text-white tracking-widest">0.198</p>
                                        </div>
                                        <p className="text-[8px] text-white/60 font-bold uppercase">Optimal clustering threshold</p>
                                    </div>
                                    <div className="bg-white/10 p-5 rounded-2xl border border-white/10">
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">Vector Space</p>
                                            <p className="text-lg font-mono font-black text-white tracking-widest">12D PROJECTION</p>
                                        </div>
                                        <p className="text-[8px] text-white/60 font-bold uppercase">Quantized frequency axes</p>
                                    </div>
                                </div>

                                <div className="bg-black/60 p-6 rounded-2xl border border-white/20 space-y-4 shadow-xl">
                                    <div className="flex items-start gap-4">
                                        <div className="h-2 w-2 rounded-full bg-[#FF0000] mt-1 shrink-0" />
                                        <p className="text-[10px] text-white leading-relaxed font-bold">
                                            <span className="text-[#FF0000] uppercase tracking-widest block mb-1">Numbers Explained</span>
                                            Similarity is calculated via cosine distance in a 12-dimensional vector space. {((userDna?.coherence_index ?? 0.8) * 100).toFixed(1)}% coherence confirms your signature's structural integrity.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Aesthetic Projection */}
                        <div className="glass rounded-[2.5rem] p-8 aspect-square relative flex items-center justify-center overflow-hidden border-white/10">
                            <div className="absolute inset-0 opacity-40 pointer-events-none">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] border-[1px] border-dashed border-white/20 rounded-full animate-spin [animation-duration:60s]" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] border-[1px] border-dashed border-white/20 rounded-full animate-spin [animation-duration:40s] direction-reverse" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] border-[1px] border-dashed border-white/10 rounded-full animate-spin [animation-duration:20s]" />
                            </div>

                            <div className="relative text-center">
                                <div className="h-16 w-16 rounded-full bg-[#FF0000]/20 flex items-center justify-center mb-4 ring-1 ring-[#FF0000]/40 mx-auto">
                                    <Scan className="h-8 w-8 text-[#FF0000] animate-float" />
                                </div>
                                <h3 className="font-black text-lg mb-1 uppercase italic tracking-tighter text-white">Neural Sink</h3>
                                <p className="text-[9px] text-white/70 font-mono tracking-widest">12,492 NODES</p>
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
                                            src={selectedMatch.metadata?.images?.[0]?.url || "/avatars/pulse.png"}
                                            className="h-14 w-14 rounded-xl object-cover ring-1 ring-white/20"
                                            alt="Match avatar"
                                        />
                                        <div>
                                            <h2 className="text-xl font-black italic">Form Connection</h2>
                                            <p className="text-xs text-muted-foreground uppercase font-mono tracking-widest">Target: {selectedMatch.metadata?.display_name}</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleEmailSubmit} className="space-y-6">
                                        {!isVerified ? (
                                            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center space-y-6">
                                                <div className="relative group">
                                                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-primary opacity-50 group-focus-within:opacity-100 transition-opacity" />
                                                    <input
                                                        type="email"
                                                        value={email}
                                                        onChange={e => setEmail(e.target.value)}
                                                        placeholder="YOUR@EMAIL.COM"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-6 pl-16 pr-6 text-xl font-black italic text-white outline-none focus:border-primary/50 transition-all uppercase placeholder:text-white/20"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => window.location.href = `/login?email=${encodeURIComponent(email)}`}
                                                    className="w-full bg-white text-black font-black py-4 rounded-xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-all text-xs uppercase tracking-[0.2em]"
                                                >
                                                    <Mail className="h-4 w-4" /> Verify Identity
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Your Communications Email (Verified)</label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                                                        <input
                                                            type="email"
                                                            readOnly
                                                            value={email}
                                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-6 focus:outline-none transition-all font-medium opacity-60 cursor-not-allowed"
                                                        />
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground leading-relaxed italic">
                                                    "Your email will be revealed ONLY once both signals cross successfully."
                                                </p>
                                                <button
                                                    disabled={submitting}
                                                    type="submit"
                                                    className="w-full bg-primary text-primary-foreground font-black py-5 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_20px_40px_rgba(255,0,0,0.2)]"
                                                >
                                                    {submitting ? <Activity className="h-5 w-5 animate-spin" /> : "Deploy Signal"}
                                                </button>
                                            </>
                                        )}
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
