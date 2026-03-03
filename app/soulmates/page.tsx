"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Waves, Users, ArrowLeft, Brain, Mail, CheckCircle2,
    Activity, X, ChevronRight, Share2, MessageSquarePlus,
    Scan, Filter, User
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type MatchMode = "all" | "convergent" | "resonant" | "divergent";

function classifyMatch(sim: number): "convergent" | "resonant" | "divergent" {
    if (sim >= 0.85) return "convergent";
    if (sim >= 0.70) return "resonant";
    return "divergent";
}

const MODE_COLORS = {
    convergent: { bg: "bg-green-500/12", border: "border-green-500/25", text: "text-green-400", badge: "bg-green-500" },
    resonant: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", badge: "bg-amber-500" },
    divergent: { bg: "bg-red-500/8", border: "border-red-500/15", text: "text-red-400", badge: "bg-red-500/60" },
};

export default function SoulmatesPage() {
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<MatchMode>("all");
    const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [userDna, setUserDna] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        (async () => {
            try {
                const [profileRes, matchRes] = await Promise.all([
                    fetch("/api/dna/profile/me"),
                    fetch("/api/dna/match"),
                ]);
                if (profileRes.ok) {
                    const pd = await profileRes.json();
                    if (pd.found) {
                        setUserDna(pd.dna);
                        if (pd.dna.email) setEmail(pd.dna.email);
                    }
                }

                if (matchRes.ok) {
                    const md = await matchRes.json();
                    setMatches(Array.isArray(md) ? md : []);
                }
            } catch { }
            finally { setLoading(false); }
        })();
    }, []);

    const handleInterest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMatch) return;
        setSubmitting(true);
        try {
            const r = await fetch("/api/match/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetId: selectedMatch.user_id, email }),
            });
            const d = await r.json();
            if (r.ok) {
                setSuccess(true);
                if (d.isMutual && d.bridgeId) {
                    // Update match in list
                    setMatches(prev => prev.map(m =>
                        m.user_id === selectedMatch.user_id
                            ? { ...m, is_mutual: true, bridge_id: d.bridgeId, has_signal: true }
                            : m
                    ));
                } else {
                    setMatches(prev => prev.map(m =>
                        m.user_id === selectedMatch.user_id ? { ...m, has_signal: true } : m
                    ));
                }
                setTimeout(() => { setSuccess(false); setSelectedMatch(null); setEmail(""); }, 3000);
            }
        } catch { }
        finally { setSubmitting(false); }
    };

    const filtered = matches.filter(m => {
        if (filter === "all") return true;
        return classifyMatch(m.similarity) === filter;
    });

    return (
        <div className="relative min-h-screen bg-[#080808] overflow-x-hidden">
            <style>{`
                
                *{font-family:var(--font-syne),'Syne',sans-serif}
                .mono{font-family:'DM Mono',monospace!important}
                .glass{background:rgba(10,10,10,.75);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px)}
                .sb::-webkit-scrollbar{width:4px}
                .sb::-webkit-scrollbar-thumb{background:rgba(255,0,0,.2);border-radius:4px}
            `}</style>



            <div className="max-w-6xl mx-auto px-4 md:px-8 pt-24 pb-20 w-full">
                {/* Header */}
                <div className="glass rounded-[2.5rem] p-8 md:p-10 border border-white/14 mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5"><Brain className="h-32 w-32" /></div>
                    <div className="relative z-10">
                        <button onClick={() => router.back()} className="flex items-center gap-2 mono text-[10px] text-white/60 hover:text-[#FF0000] transition-colors uppercase tracking-widest mb-4">
                            <ArrowLeft className="h-3.5 w-3.5" />Return
                        </button>
                        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic mb-2">
                            Musical <span className="text-[#FF0000]">Soulmates</span>
                        </h1>
                        <p className="mono text-[10px] text-white/55 uppercase tracking-[0.4em]">
                            Users whose DNA most closely aligns with yours
                        </p>
                    </div>
                </div>

                {/* Filter bar */}
                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
                    <Filter className="h-3.5 w-3.5 text-white/50 shrink-0" />
                    {(["all", "convergent", "resonant", "divergent"] as MatchMode[]).map(mode => (
                        <button key={mode} onClick={() => setFilter(mode)}
                            className={`mono text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full border transition-all shrink-0
                                ${filter === mode
                                    ? "bg-[#FF0000] border-[#FF0000] text-white"
                                    : "bg-white/4 border-white/14 text-white/65 hover:text-white hover:border-white/20"}`}>
                            {mode === "all" ? `All (${matches.length})` : `${mode} (${matches.filter(m => classifyMatch(m.similarity) === mode).length})`}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Match feed */}
                    <div className="lg:col-span-2 space-y-4">
                        {loading ? (
                            <div className="glass rounded-[2.5rem] p-16 flex flex-col items-center justify-center">
                                <Activity className="h-10 w-10 text-[#FF0000] animate-spin mb-4" />
                                <p className="mono text-[10px] text-white/60 uppercase tracking-widest">Calculating Cosine Distances…</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="glass rounded-[2.5rem] p-16 text-center">
                                <Users className="h-12 w-12 text-white/10 mx-auto mb-4" />
                                <p className="text-white/70 font-medium mb-6">
                                    {matches.length === 0 ? "No soulmates found yet. Generate your DNA first!" : "No matches in this category."}
                                </p>
                                {matches.length === 0 && (
                                    <Link href="/" className="inline-flex items-center gap-2 bg-[#FF0000] text-white font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-xl">
                                        Start DNA Discovery
                                    </Link>
                                )}
                            </div>
                        ) : (
                            filtered.map((match, idx) => {
                                const mode = classifyMatch(match.similarity);
                                const mc = MODE_COLORS[mode];
                                return (
                                    <motion.div key={match.id || idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.04 }}
                                        className={`glass rounded-[2rem] p-6 md:p-8 border transition-all relative overflow-hidden group
                                            ${match.is_mutual ? "ring-1 ring-green-500/30 border-green-500/15" : "border-white/14 hover:border-[#FF0000]/25"}`}>
                                        <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                                            {/* Avatar + score */}
                                            <div className="relative shrink-0">
                                                <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl overflow-hidden bg-white/8 ring-1 ring-white/10 group-hover:ring-[#FF0000]/30 transition-all">
                                                    {match.metadata?.images?.[0]?.url
                                                        ? <img src={match.metadata.images[0].url} alt="" className="h-full w-full object-cover" />
                                                        : <div className="h-full w-full flex items-center justify-center text-white/45 font-black text-2xl">
                                                            {(match.metadata?.display_name || "?")[0]?.toUpperCase()}
                                                        </div>}
                                                </div>
                                                <div className={`absolute -bottom-1.5 -right-1.5 ${mc.badge} text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg`}>
                                                    {(match.similarity * 100).toFixed(1)}%
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <h3 className="text-xl md:text-2xl font-black text-white italic tracking-tighter truncate">
                                                        {match.metadata?.display_name || "Anonymous Signal"}
                                                    </h3>
                                                    {match.is_mutual && (
                                                        <span className="text-[8px] font-black bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20 uppercase tracking-widest shrink-0">Mutual</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${mc.bg} ${mc.border} border ${mc.text}`}>
                                                        {mode}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5 mb-4">
                                                    {(match.metadata?.top_genres || []).slice(0, 4).map((g: string) => (
                                                        <span key={g} className="text-[8px] bg-white/5 border border-white/14 px-2.5 py-1 rounded-lg font-black uppercase tracking-widest text-white/50">{g}</span>
                                                    ))}
                                                </div>
                                                <div className="flex gap-2">
                                                    {match.is_mutual ? (
                                                        <Link href={`/temp-room/${match.bridge_id}`}
                                                            className="flex items-center gap-2 bg-green-500 text-black font-black py-2.5 px-5 rounded-xl text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all">
                                                            <Scan className="h-3.5 w-3.5" />Open Bridge
                                                        </Link>
                                                    ) : (
                                                        <button onClick={() => !match.has_signal && setSelectedMatch(match)}
                                                            disabled={match.has_signal}
                                                            className={`flex items-center gap-2 font-black py-2.5 px-5 rounded-xl text-[10px] uppercase tracking-widest transition-all
                                                                ${match.has_signal ? "bg-white/6 text-white/60 cursor-not-allowed" : "bg-white text-black hover:scale-[1.02] active:scale-95"}`}>
                                                            {match.has_signal
                                                                ? <><Activity className="h-3.5 w-3.5 text-white/50" />Signal Sent</>
                                                                : <><MessageSquarePlus className="h-3.5 w-3.5" />Express Interest</>}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-5">
                        {/* Active bridges */}
                        <div className="glass rounded-[2rem] p-7 border border-white/14">
                            <h3 className="mono text-[10px] text-[#FF0000] uppercase tracking-widest font-black mb-5 flex items-center gap-2">
                                <Users className="h-3.5 w-3.5" />Active Bridges
                            </h3>
                            {matches.filter(m => m.is_mutual).length === 0 ? (
                                <div className="p-6 text-center border border-dashed border-white/14 rounded-2xl">
                                    <p className="mono text-[9px] text-white/50 uppercase tracking-widest">No mutual connections yet</p>
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    {matches.filter(m => m.is_mutual).map((m, i) => (
                                        <Link key={m.id || i} href={`/temp-room/${m.bridge_id}`}
                                            className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/4 border border-white/10 hover:bg-white/8 hover:border-green-500/20 transition-all group">
                                            <div className="h-9 w-9 rounded-xl bg-green-500/15 flex items-center justify-center shrink-0 text-green-400 font-black text-sm">
                                                {(m.metadata?.display_name || "?")[0]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black text-white truncate">{m.metadata?.display_name || "Signal"}</p>
                                                <p className="mono text-[8px] text-white/55 uppercase tracking-widest">Bridge Active</p>
                                            </div>
                                            <ChevronRight className="h-3.5 w-3.5 text-white/45 group-hover:text-white transition-colors" />
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* My DNA card */}
                        {userDna && (
                            <div className="glass rounded-[2rem] p-7 border border-[#FF0000]/15 bg-[#FF0000]/3">
                                <h3 className="mono text-[10px] text-[#FF0000] uppercase tracking-widest font-black mb-4 flex items-center gap-2">
                                    <Brain className="h-3.5 w-3.5" />My Signal
                                </h3>
                                <div className="flex items-end justify-between border-b border-white/14 pb-4 mb-4">
                                    <h4 className="text-lg font-black text-white italic truncate pr-3">{userDna.display_name}</h4>
                                    <div className="text-right shrink-0">
                                        <p className="mono text-2xl font-black text-[#FF0000]">{((userDna.coherence_index ?? 0) * 100).toFixed(1)}%</p>
                                        <p className="mono text-[8px] text-white/55 uppercase tracking-widest">Coherence</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {(userDna.top_genres || []).slice(0, 4).map((g: string) => (
                                        <span key={g} className="text-[8px] bg-[#FF0000]/15 border border-[#FF0000]/20 text-[#FF0000] px-2.5 py-1 rounded-lg font-black uppercase tracking-widest">{g}</span>
                                    ))}
                                </div>
                                <Link href="/profile" className="flex items-center justify-center gap-2 mt-5 border border-white/10 text-white/50 hover:text-white hover:border-white/20 font-black text-[9px] uppercase tracking-widest py-3 rounded-xl transition-all">
                                    View Full Profile <ChevronRight className="h-3 w-3" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Email modal */}
            <AnimatePresence>
                {selectedMatch && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedMatch(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="glass w-full max-w-md rounded-[2.5rem] p-8 md:p-10 relative z-10">
                            <button onClick={() => setSelectedMatch(null)} className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"><X className="h-4 w-4" /></button>

                            {success ? (
                                <div className="text-center py-8">
                                    <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-5" />
                                    <h2 className="text-xl font-black text-white italic mb-2">Interest Registered!</h2>
                                    <p className="text-white/70 text-sm">
                                        We'll notify you at <span className="text-white font-bold">{email}</span> when the connection becomes mutual.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="h-12 w-12 rounded-xl bg-white/8 flex items-center justify-center text-white/60 font-black text-lg">
                                            {(selectedMatch.metadata?.display_name || "?")[0]}
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-black text-white italic">Express Interest</h2>
                                            <p className="mono text-[9px] text-white/60 uppercase tracking-widest">Target: {selectedMatch.metadata?.display_name}</p>
                                        </div>
                                    </div>
                                    <form onSubmit={handleInterest} className="space-y-5">
                                        <div>
                                            <label className="mono text-[9px] text-[#FF0000] uppercase tracking-widest font-black block mb-2 ml-1">Your Email</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/45" />
                                                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                                    placeholder="you@example.com"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-11 pr-4 focus:outline-none focus:border-[#FF0000]/40 transition-all mono text-sm text-white placeholder:text-white/35" />
                                            </div>
                                        </div>
                                        <p className="mono text-[9px] text-white/55 leading-relaxed">
                                            Your email will only be shared if the interest is mutual. A DNA Bridge will be created automatically upon mutual connection.
                                        </p>
                                        <button type="submit" disabled={submitting}
                                            className="w-full bg-[#FF0000] text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-500 transition-all text-sm uppercase tracking-widest disabled:opacity-50">
                                            {submitting ? <Activity className="h-4 w-4 animate-spin" /> : <>Express Interest <ChevronRight className="h-4 w-4" /></>}
                                        </button>
                                    </form>
                                </>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* BG */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] blur-[160px] rounded-full bg-[#FF0000]/7" />
                <div className="absolute bottom-1/3 right-1/4 h-[400px] w-[400px] blur-[160px] rounded-full bg-orange-900/7" />
            </div>
        </div>
    );
}
