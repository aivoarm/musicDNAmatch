"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Waves, Users, ArrowLeft, ArrowRight, Brain, Mail, CheckCircle2,
    Activity, X, ChevronRight, Share2, MessageSquarePlus,
    Scan, Filter, User, RotateCcw, MapPin, Loader2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AXIS_LABELS } from "@/lib/dna";

type MatchMode = "all" | "convergent" | "resonant" | "divergent" | "sent";

function computeDisplaySimilarity(sim: number): number {
    if (sim >= 0.9999) return 1.0;
    // Map vector cosine similarity (which densely clusters >0.90) into a wider, more realistic UX scale.
    // Math.pow(sim, 6) scales 0.99 -> ~94%, 0.96 -> ~78%, 0.92 -> ~60%.
    return Math.max(0, Math.min(0.99, Math.pow(sim, 6)));
}

function classifyMatch(sim: number): "convergent" | "resonant" | "divergent" {
    const displaySim = computeDisplaySimilarity(sim);
    if (displaySim >= 0.85) return "convergent";
    if (displaySim >= 0.70) return "resonant";
    return "divergent";
}

const MODE_COLORS = {
    convergent: { bg: "bg-green-500/12", border: "border-green-500/25", text: "text-green-400", badge: "bg-green-500" },
    resonant: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", badge: "bg-amber-500" },
    divergent: { bg: "bg-red-500/8", border: "border-red-500/15", text: "text-red-400", badge: "bg-red-500/60" },
};

function DualRadarChart({ v1, v2, c1 = "#FF0000", c2 = "#3B82F6" }: { v1: number[], v2: number[], c1?: string, c2?: string }) {
    const size = 280;
    const cx = size / 2;
    const cy = size / 2;
    const maxR = size / 2 - 30;

    let parsedV1: number[] = [];
    let parsedV2: number[] = [];
    try {
        parsedV1 = Array.isArray(v1) ? v1 : (typeof v1 === 'string' ? JSON.parse(v1) : []);
        parsedV2 = Array.isArray(v2) ? v2 : (typeof v2 === 'string' ? JSON.parse(v2) : []);
    } catch { }
    const n = Math.max(parsedV1.length, parsedV2.length);

    if (n === 0) return null;

    const getPoint = (idx: number, val: number) => {
        const angle = (Math.PI * 2 * idx) / n - Math.PI / 2;
        const x = cx + Math.cos(angle) * val * maxR;
        const y = cy + Math.sin(angle) * val * maxR;
        return { x: Number(x.toFixed(4)), y: Number(y.toFixed(4)) };
    };

    const gridLevels = [0.25, 0.5, 0.75, 1.0];

    const pts1 = parsedV1.map((v, i) => getPoint(i, Number(v) || 0));
    const path1 = pts1.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

    const pts2 = parsedV2.map((v, i) => getPoint(i, Number(v) || 0));
    const path2 = pts2.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}` : "255,0,0";
    };

    return (
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[280px] mx-auto overflow-visible">
            {gridLevels.map(level => {
                const pts = Array.from({ length: n }, (_, i) => getPoint(i, level));
                const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
                return <path key={level} d={d} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />;
            })}
            {Array.from({ length: n }, (_, i) => {
                const p = getPoint(i, 1);
                return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />;
            })}

            <path d={path1} fill={`rgba(${hexToRgb(c1)},0.2)`} stroke={c1} strokeWidth="2" />
            <path d={path2} fill={`rgba(${hexToRgb(c2)},0.2)`} stroke={c2} strokeWidth="2" />

            {pts1.map((p, i) => <circle key={`c1-${i}`} cx={p.x} cy={p.y} r="2.5" fill={c1} />)}
            {pts2.map((p, i) => <circle key={`c2-${i}`} cx={p.x} cy={p.y} r="2.5" fill={c2} />)}

            {Array.from({ length: n }, (_, i) => {
                const p = getPoint(i, 1.18);
                const label = AXIS_LABELS[i]?.replace(/_/g, " ") || "";
                const short = label.split(" ").map(w => w.charAt(0).toUpperCase()).join("");
                return (
                    <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central"
                        className="fill-white/80 font-black" style={{ fontSize: "8px", letterSpacing: "0.1em" }}>
                        {short}
                    </text>
                );
            })}
        </svg>
    );
}

export default function SoulmatesPage() {
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<MatchMode>("all");
    const [cityFilter, setCityFilter] = useState<string>("all");
    const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
    const [viewedProfile, setViewedProfile] = useState<any | null>(null);
    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [userDna, setUserDna] = useState<any>(null);
    const [isVerified, setIsVerified] = useState(false);
    const [showEmailPrompt, setShowEmailPrompt] = useState(false);
    const [tempCity, setTempCity] = useState("");
    const router = useRouter();

    useEffect(() => {
        (async () => {
            try {
                const [profileRes, matchRes] = await Promise.all([
                    fetch("/api/dna/profile/me"),
                    fetch("/api/dna/match"),
                ]);

                let foundDna = false;
                if (profileRes.ok) {
                    const pd = await profileRes.json();
                    if (pd.found) {
                        foundDna = true;
                        setUserDna(pd.dna);

                        // Check for verified email cookie
                        const authEmail = document.cookie.split(";").find(c => c.trim().startsWith("auth_email="));
                        if (authEmail) {
                            setIsVerified(true);
                            if (pd.dna.email) setEmail(pd.dna.email);
                        } else {
                            if (pd.dna.email) setEmail(pd.dna.email);
                            else setShowEmailPrompt(true);
                        }

                        if (pd.dna.city) setTempCity(pd.dna.city);
                    }
                }

                if (foundDna && matchRes.ok) {
                    const md = await matchRes.json();
                    setMatches(Array.isArray(md) ? md : []);
                } else if (!foundDna) {
                    window.location.href = "/";
                }
            } catch { }
            finally { setLoading(false); }
        })();
    }, [router]);

    const handleInterest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMatch) return;

        const targetId = selectedMatch.user_id;
        setSubmitting(true);
        try {
            const r = await fetch("/api/match/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetId, email }),
            });
            const d = await r.json();
            if (r.ok) {
                setSuccess(true);
                if (d.isMutual && d.bridgeId) {
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
            } else {
                alert(d.error || "Failed to register interest");
            }
        } catch (err) {
            alert("Network error. Please try again.");
        }
        finally { setSubmitting(false); }
    };

    // Collect unique cities from all matches
    const availableCities = useMemo(() => {
        const cities = new Set<string>();
        matches.forEach(m => {
            const c = m.city || m.metadata?.city;
            if (c && typeof c === "string" && c.trim()) cities.add(c.trim());
        });
        return Array.from(cities).sort();
    }, [matches]);

    const filtered = matches.filter(m => {
        // Match mode filter
        if (filter === "sent" && !m.has_signal) return false;
        if (filter !== "all" && filter !== "sent" && classifyMatch(m.similarity) !== filter) return false;
        // City filter
        if (cityFilter !== "all") {
            const matchCity = (m.city || m.metadata?.city || "").trim().toLowerCase();
            if (matchCity !== cityFilter.toLowerCase()) return false;
        }
        return true;
    });

    const handleSecureDna = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // First save the city/meta choice
            await fetch("/api/dna/profile/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), city: tempCity.trim() }),
            });

            // Then redirect to WorkOS for verification
            window.location.href = `/login?email=${encodeURIComponent(email.trim())}`;
        } catch {
            alert("Network error. Please try again.");
            setSubmitting(false);
        }
    };

    const handleRestart = () => {
        if (!confirm("This will clear your current DNA profile. Continue?")) return;
        document.cookie = "guest_id=; Max-Age=0; path=/;";
        window.location.href = "/?restart=true";
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#080808] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 text-[#FF0000] animate-spin" />
                    <span className="mono text-[10px] text-white/40 uppercase tracking-[0.3em]">Mapping Soulmates...</span>
                </div>
            </div>
        );
    }

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
                {/* Header — tighter */}
                <div className="glass rounded-2xl p-6 md:p-7 border border-white/25 mb-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10"><Brain className="h-24 w-24" /></div>
                    <div className="relative z-10">
                        <button onClick={() => router.back()} className="flex items-center gap-2 mono text-[10px] text-white hover:text-[#FF0000] transition-colors uppercase tracking-widest mb-3 font-bold">
                            <ArrowLeft className="h-3.5 w-3.5" />Return
                        </button>
                        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter italic mb-1">
                            Musical <span className="text-[#FF0000]">Soulmates</span>
                        </h1>
                        <p className="mono text-[9px] text-white/95 uppercase tracking-[0.4em] font-medium">
                            Users whose DNA most closely aligns with yours
                        </p>
                    </div>
                </div>

                {/* Filter bar — combined mode + city */}
                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 flex-1">
                        <Filter className="h-3 w-3 text-white/60 shrink-0" />
                        {(["all", "convergent", "resonant", "divergent", "sent"] as MatchMode[]).map(mode => (
                            <button key={mode} onClick={() => setFilter(mode)}
                                className={`mono text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all shrink-0
                                    ${filter === mode
                                        ? "bg-[#FF0000] border-[#FF0000] text-white"
                                        : "bg-white/8 border-white/20 text-white/70 hover:text-white hover:border-white/40"}`}>
                                {mode === "all" ? `All (${matches.length})` :
                                    mode === "sent" ? `Sent (${matches.filter(m => m.has_signal).length})` :
                                        `${mode} (${matches.filter(m => classifyMatch(m.similarity) === mode).length})`}
                            </button>
                        ))}
                    </div>
                    {availableCities.length > 0 && (
                        <div className="flex items-center gap-1.5 shrink-0">
                            <MapPin className="h-3 w-3 text-white/60" />
                            <select
                                value={cityFilter}
                                onChange={e => setCityFilter(e.target.value)}
                                className="mono text-[8px] font-black uppercase tracking-widest bg-white/8 border border-white/20 text-white rounded-full px-3 py-1.5 focus:outline-none focus:border-[#FF0000]/50 appearance-none cursor-pointer pr-6"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='3'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center" }}
                            >
                                <option value="all" className="bg-[#111] text-white">All Cities</option>
                                {availableCities.map(c => (
                                    <option key={c} value={c} className="bg-[#111] text-white">{c}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Match feed — tighter cards */}
                    <div className="lg:col-span-2 space-y-2.5">

                        {loading ? (
                            <div className="glass rounded-2xl p-12 flex flex-col items-center justify-center">
                                <Activity className="h-8 w-8 text-[#FF0000] animate-spin mb-3" />
                                <p className="mono text-[9px] text-white/95 uppercase tracking-widest font-bold">Calculating Cosine Distances…</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="glass rounded-2xl p-12 text-center">
                                <Users className="h-10 w-10 text-white/40 mx-auto mb-3" />
                                <p className="text-white font-bold text-sm mb-4">
                                    {matches.length === 0 ? "No soulmates found yet." : "No matches in this filter."}
                                </p>
                                {matches.length === 0 && (
                                    <button onClick={() => window.location.href = "/"} className="inline-flex items-center justify-center gap-2 bg-[#FF0000] text-white font-black text-[9px] uppercase tracking-widest px-5 py-3 rounded-xl hover:scale-105 transition-transform">
                                        Start DNA Discovery
                                    </button>
                                )}
                            </div>
                        ) : (
                            filtered.map((match, idx) => {
                                const mode = classifyMatch(match.similarity);
                                const mc = MODE_COLORS[mode];
                                const coherencePct = ((match.coherence ?? 0.5) * 100).toFixed(0);
                                const matchCity = match.city || match.metadata?.city;
                                const isAnonymous = (match.metadata?.display_name || match.display_name || "Anonymous Signal") === "Anonymous Signal";
                                return (
                                    <motion.div key={match.id || idx}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className={`glass rounded-xl p-4 border transition-all relative overflow-hidden group
                                            ${match.is_mutual ? "ring-1 ring-green-500/40 border-green-500/25" : "border-white/15 hover:border-[#FF0000]/30"}`}>
                                        <div className="flex gap-3 items-center">
                                            {/* Avatar + Info wrapper */}
                                            <button onClick={() => setViewedProfile(match)} className="flex-1 min-w-0 flex gap-3 items-center text-left focus:outline-none">
                                                {/* Avatar — smaller */}
                                                <div className="relative shrink-0">
                                                    <div className="h-12 w-12 rounded-xl overflow-hidden bg-white/10 ring-1 ring-white/15 group-hover:ring-[#FF0000]/40 transition-all">
                                                        {match.metadata?.images?.[0]?.url
                                                            ? <img src={match.metadata.images[0].url} alt="" className="h-full w-full object-cover" />
                                                            : <div className="h-full w-full flex items-center justify-center text-white font-black text-lg">
                                                                {(match.metadata?.display_name || "?")[0]?.toUpperCase()}
                                                            </div>}
                                                    </div>
                                                </div>

                                                {/* Info — compact */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5 mb-0.5">
                                                        <h3 className="text-sm font-black text-white italic tracking-tighter truncate group-hover:text-[#FF0000] transition-colors">
                                                            {match.metadata?.display_name || match.display_name || "Anonymous Signal"}
                                                        </h3>
                                                        {match.is_mutual && (
                                                            <span className="text-[7px] font-black bg-green-500/15 text-green-400 px-1.5 py-0.5 rounded-full border border-green-500/20 uppercase tracking-widest shrink-0">Mutual</span>
                                                        )}
                                                        {match.incoming_signal && !match.is_mutual && (
                                                            <span className="text-[7px] font-black bg-[#FF0000]/15 text-[#FF0000] px-1.5 py-0.5 rounded-full border border-[#FF0000]/20 uppercase tracking-widest shrink-0 animate-pulse">Signal</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full ${mc.bg} ${mc.border} border ${mc.text}`}>
                                                            {mode}
                                                        </span>
                                                        {matchCity && (
                                                            <span className="text-[7px] font-bold text-white/40 flex items-center gap-0.5">
                                                                <MapPin className="h-2.5 w-2.5" />{matchCity}
                                                            </span>
                                                        )}
                                                        {(match.metadata?.top_genres || []).slice(0, 2).map((g: string, i: number) => (
                                                            <span key={g + i} className="text-[7px] bg-white/8 border border-white/15 text-white/60 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">{g}</span>
                                                        ))}
                                                        {match.song_match_count > 0 && (
                                                            <span className="text-[7px] font-black bg-[#FF0000]/10 text-[#FF0000] px-1.5 py-0.5 rounded-full border border-[#FF0000]/20 uppercase tracking-widest shrink-0">
                                                                {match.song_match_count} {match.song_match_count === 1 ? 'Song' : 'Songs'} Match
                                                            </span>
                                                        )}
                                                        {match.artist_match_count > 0 && (
                                                            <span className="text-[7px] font-black bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded-full border border-blue-500/20 uppercase tracking-widest shrink-0">
                                                                {match.artist_match_count} {match.artist_match_count === 1 ? 'Artist' : 'Artists'} Match
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>

                                            {/* Stats + Action — right side */}
                                            <div className="flex items-center gap-2.5 shrink-0">
                                                {/* Coherence + Similarity */}
                                                <div className="text-right hidden sm:block">
                                                    <div className="flex items-baseline gap-1 justify-end">
                                                        <span className={`text-base font-black ${mc.text}`}>{(computeDisplaySimilarity(match.similarity) * 100).toFixed(0)}%</span>
                                                        <span className="mono text-[7px] text-white/40 uppercase font-bold">Sim</span>
                                                    </div>
                                                    <div className="flex items-baseline gap-1 justify-end">
                                                        <span className="text-[10px] font-black text-white/50">{coherencePct}%</span>
                                                        <span className="mono text-[7px] text-white/30 uppercase font-bold">Coh</span>
                                                    </div>
                                                </div>

                                                {/* Mobile similarity badge */}
                                                <div className={`sm:hidden ${mc.badge} text-white text-[9px] font-black px-2 py-1 rounded-md`}>
                                                    {(computeDisplaySimilarity(match.similarity) * 100).toFixed(0)}%
                                                </div>

                                                {/* Action button */}
                                                {match.is_mutual ? (
                                                    <Link href={`/temp-room/${match.bridge_id}`}
                                                        className="flex items-center gap-1.5 bg-green-500 text-black font-black py-2 px-3 rounded-lg text-[8px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all">
                                                        <Scan className="h-3 w-3" />Bridge
                                                    </Link>
                                                ) : match.incoming_signal && !match.has_signal ? (
                                                    <button onClick={() => setSelectedMatch(match)}
                                                        className="flex items-center gap-1.5 bg-[#FF0000] text-white font-black py-2 px-3 rounded-lg text-[8px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all animate-pulse">
                                                        <Activity className="h-3 w-3" />Respond
                                                    </button>
                                                ) : isAnonymous ? (
                                                    <button disabled
                                                        className="flex items-center gap-1.5 bg-white/5 text-white/30 cursor-not-allowed font-black py-2 px-3 rounded-lg text-[8px] uppercase tracking-widest transition-all">
                                                        <Activity className="h-3 w-3" />Anon
                                                    </button>
                                                ) : (
                                                    <button onClick={() => !match.has_signal && setSelectedMatch(match)}
                                                        disabled={match.has_signal}
                                                        className={`flex items-center gap-1.5 font-black py-2 px-3 rounded-lg text-[8px] uppercase tracking-widest transition-all
                                                            ${match.has_signal ? "bg-white/10 text-white/40 cursor-not-allowed" : "bg-white text-black hover:scale-[1.02] active:scale-95"}`}>
                                                        {match.has_signal
                                                            ? <><Activity className="h-3 w-3" />Sent</>
                                                            : <><MessageSquarePlus className="h-3 w-3" />Connect</>}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Active bridges */}
                        <div className="glass rounded-xl p-5 border border-white/20">
                            <h3 className="mono text-[9px] text-[#FF0000] uppercase tracking-widest font-black mb-4 flex items-center gap-2">
                                <Users className="h-3 w-3" />Active Bridges
                            </h3>
                            {matches.filter(m => m.is_mutual).length === 0 ? (
                                <div className="p-4 text-center border border-dashed border-white/30 rounded-xl">
                                    <p className="mono text-[8px] text-white/60 uppercase tracking-widest font-bold">No mutual connections yet</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {matches.filter(m => m.is_mutual).map((m, i) => (
                                        <Link key={m.id || i} href={`/temp-room/${m.bridge_id}`}
                                            className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/8 border border-white/20 hover:bg-white/12 hover:border-green-500/40 transition-all group">
                                            <div className="h-7 w-7 rounded-lg bg-green-500/15 flex items-center justify-center shrink-0 text-green-400 font-black text-xs">
                                                {(m.metadata?.display_name || "?")[0]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-black text-white truncate">{m.metadata?.display_name || "Signal"}</p>
                                                <p className="mono text-[7px] text-white/50 uppercase tracking-widest font-medium">Bridge Active</p>
                                            </div>
                                            <ChevronRight className="h-3 w-3 text-white/30 group-hover:text-white transition-colors" />
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* My DNA card */}
                        {userDna && (
                            <div className="glass rounded-xl p-5 border border-[#FF0000]/15 bg-[#FF0000]/3">
                                <h3 className="mono text-[9px] text-[#FF0000] uppercase tracking-widest font-black mb-3 flex items-center gap-2">
                                    <Brain className="h-3 w-3" />My Signal
                                </h3>
                                <div className="flex items-end justify-between border-b border-white/15 pb-3 mb-3">
                                    <div className="min-w-0">
                                        <h4 className="text-sm font-black text-white italic truncate pr-2">{userDna.display_name}</h4>
                                        {userDna.city && (
                                            <span className="text-[8px] text-white/40 flex items-center gap-1 mt-0.5">
                                                <MapPin className="h-2.5 w-2.5" />{userDna.city}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="mono text-xl font-black text-[#FF0000]">{((userDna.coherence_index ?? 0) * 100).toFixed(1)}%</p>
                                        <p className="mono text-[7px] text-white/60 uppercase tracking-widest font-bold">Coherence</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {(userDna.top_genres || []).slice(0, 4).map((g: string, i: number) => (
                                        <span key={g + i} className="text-[7px] bg-white/10 border border-white/20 text-white/70 px-1.5 py-0.5 rounded font-black uppercase tracking-widest">{g}</span>
                                    ))}
                                </div>

                                <Link href="/profile" className="flex items-center justify-center gap-1.5 border border-white/20 text-white font-black text-[8px] uppercase tracking-widest py-2.5 rounded-lg transition-all hover:border-white/40 bg-white/5">
                                    View Full Profile <ChevronRight className="h-2.5 w-2.5" />
                                </Link>
                                <button onClick={handleRestart} className="relative w-full flex items-center justify-center gap-1.5 mt-2 border border-[#FF0000]/30 bg-[#FF0000]/10 text-[#FF0000] font-black text-[8px] uppercase tracking-widest py-2.5 rounded-lg transition-all hover:bg-[#FF0000]/20">
                                    <RotateCcw className="h-2.5 w-2.5" /> Start New Signal
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* View Profile Modal */}
            <AnimatePresence>
                {viewedProfile && userDna && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setViewedProfile(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="glass w-full max-w-lg rounded-2xl p-7 md:p-8 relative z-10 border border-white/20 max-h-[90vh] overflow-y-auto sb">
                            <button onClick={() => setViewedProfile(null)} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20"><X className="h-3.5 w-3.5" /></button>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center text-white/80 font-black text-2xl overflow-hidden shadow-xl border border-white/10">
                                    {viewedProfile.metadata?.images?.[0]?.url
                                        ? <img src={viewedProfile.metadata.images[0].url} alt="" className="h-full w-full object-cover" />
                                        : (viewedProfile.metadata?.display_name || viewedProfile.display_name || "?")[0]}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white italic tracking-tighter">
                                        {viewedProfile.metadata?.display_name || viewedProfile.display_name || "Anonymous Signal"}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs font-black text-[#FF0000]">{(computeDisplaySimilarity(viewedProfile.similarity) * 100).toFixed(0)}% Match</span>
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${MODE_COLORS[classifyMatch(viewedProfile.similarity)].bg} ${MODE_COLORS[classifyMatch(viewedProfile.similarity)].text}`}>
                                            {classifyMatch(viewedProfile.similarity)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6 relative">
                                <DualRadarChart
                                    v1={userDna.vector || []}
                                    v2={viewedProfile.vector || []}
                                    c1="#FF0000"
                                    c2="#3B82F6"
                                />
                                <div className="flex justify-center gap-6 mt-4 opacity-80">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-[#FF0000]"></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white">You</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-[#3B82F6]"></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Them</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="mono text-[9px] text-[#FF0000] uppercase tracking-widest font-black mb-3">Top Genres</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {(viewedProfile.metadata?.top_genres || []).map((g: string, i: number) => (
                                            <span key={g + i} className="bg-white/10 border border-white/20 text-white px-2.5 py-1 rounded font-black text-[10px] uppercase tracking-widest">{g}</span>
                                        ))}
                                    </div>
                                </div>

                                {viewedProfile.shared_artists && viewedProfile.shared_artists.length > 0 && (
                                    <div>
                                        <h3 className="mono text-[9px] text-blue-400 uppercase tracking-widest font-black mb-3">Shared Artists</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {viewedProfile.shared_artists.map((a: string, i: number) => (
                                                <span key={a + i} className="bg-blue-500/10 border border-blue-500/20 text-blue-300 px-2.5 py-1 rounded font-black text-[10px] uppercase tracking-widest">{a}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {(() => {
                                    let parsedUserVector = [];
                                    let parsedThemVector = [];
                                    try {
                                        parsedUserVector = Array.isArray(userDna?.vector) ? userDna.vector : (typeof userDna?.vector === 'string' ? JSON.parse(userDna.vector) : []);
                                        parsedThemVector = Array.isArray(viewedProfile?.vector) ? viewedProfile.vector : (typeof viewedProfile?.vector === 'string' ? JSON.parse(viewedProfile.vector) : []);
                                    } catch (e) {
                                        console.error("Vector parsing error", e);
                                    }

                                    const axisDiffs = parsedUserVector.map((v: number, i: number) => {
                                        const themV = parsedThemVector?.[i] || 0;
                                        return {
                                            label: (AXIS_LABELS[i] || "").replace(/_/g, " "),
                                            diff: Math.abs(v - themV),
                                            user: v,
                                            them: themV
                                        };
                                    });
                                    const alignments = [...axisDiffs].sort((a, b) => a.diff - b.diff).slice(0, 3);
                                    const differences = [...axisDiffs].sort((a, b) => b.diff - a.diff).slice(0, 3);

                                    return (
                                        <div className="pt-2">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <h3 className="mono text-[9px] text-green-400 uppercase tracking-widest font-black mb-3">Strongest Alignments</h3>
                                                    <div className="space-y-2">
                                                        {alignments.map((a, i) => (
                                                            <div key={i} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                                                                <div className="flex justify-between items-center mb-2">
                                                                    <span className="text-[10px] font-bold text-white uppercase tracking-wider truncate">{a.label}</span>
                                                                    <span className="text-[7px] font-black text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded shrink-0">{(100 - a.diff * 100).toFixed(0)}% Match</span>
                                                                </div>
                                                                <div className="flex flex-col gap-1.5">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className="text-[7px] text-[#FF0000] font-black w-6 text-right">YOU</span>
                                                                        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                                                            <div className="h-full bg-[#FF0000]" style={{ width: `${a.user * 100}%` }} />
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className="text-[7px] text-[#3B82F6] font-black w-6 text-right">THEM</span>
                                                                        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                                                            <div className="h-full bg-[#3B82F6]" style={{ width: `${a.them * 100}%` }} />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="mono text-[9px] text-amber-500 uppercase tracking-widest font-black mb-3">Biggest Differences</h3>
                                                    <div className="space-y-2">
                                                        {differences.map((d, i) => (
                                                            <div key={i} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                                                                <div className="flex justify-between items-center mb-2">
                                                                    <span className="text-[10px] font-bold text-white uppercase tracking-wider truncate">{d.label}</span>
                                                                    <span className="text-[7px] font-black text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded shrink-0">{(100 - d.diff * 100).toFixed(0)}% Match</span>
                                                                </div>
                                                                <div className="flex flex-col gap-1.5">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className="text-[7px] text-[#FF0000] font-black w-6 text-right">YOU</span>
                                                                        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                                                            <div className="h-full bg-[#FF0000]" style={{ width: `${d.user * 100}%` }} />
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className="text-[7px] text-[#3B82F6] font-black w-6 text-right">THEM</span>
                                                                        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                                                            <div className="h-full bg-[#3B82F6]" style={{ width: `${d.them * 100}%` }} />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Email modal */}
            <AnimatePresence>
                {selectedMatch && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedMatch(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="glass w-full max-w-md rounded-2xl p-7 md:p-8 relative z-10 border border-white/20">
                            <button onClick={() => setSelectedMatch(null)} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"><X className="h-3.5 w-3.5" /></button>

                            {success ? (
                                <div className="text-center py-6">
                                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                                    <h2 className="text-lg font-black text-white italic mb-1">Interest Registered!</h2>
                                    <p className="text-white/70 text-xs">
                                        We'll notify you at <span className="text-white font-bold">{email}</span> when mutual.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="h-10 w-10 rounded-lg bg-white/12 flex items-center justify-center text-white/80 font-black text-sm">
                                            {(selectedMatch.metadata?.display_name || selectedMatch.display_name || "?")[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h2 className="text-base font-black text-white italic truncate">Express Interest</h2>
                                            <p className="mono text-[8px] text-white/60 uppercase tracking-widest truncate font-bold">Target: {String(selectedMatch.metadata?.display_name || selectedMatch.display_name || "Anonymous").trim() || "Anonymous"}</p>
                                        </div>
                                    </div>
                                    <form onSubmit={handleInterest} className="space-y-4">
                                        {!isVerified ? (
                                            <div className="bg-[#FF0000]/5 border border-[#FF0000]/20 rounded-xl p-5 text-center">
                                                <p className="mono text-[9px] text-white/70 uppercase tracking-widest leading-relaxed mb-4">
                                                    Authentication Required to Send Signals
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => window.location.href = `/login?email=${encodeURIComponent(email)}`}
                                                    className="w-full bg-white text-black font-black py-3 rounded-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-all text-[10px] uppercase tracking-widest"
                                                >
                                                    <Mail className="h-3.5 w-3.5" /> Verify Identity
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div>
                                                    <label className="mono text-[8px] text-[#FF0000] uppercase tracking-widest font-black block mb-1.5 ml-1">Your Email (Verified)</label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/60" />
                                                        <input type="email" readOnly value={email}
                                                            className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 focus:outline-none transition-all mono text-xs text-white/60 cursor-not-allowed" />
                                                    </div>
                                                </div>
                                                <p className="mono text-[8px] text-white/50 leading-relaxed font-bold">
                                                    Your email will only be shared if the interest is mutual. A DNA Bridge will be created automatically.
                                                </p>
                                                <button type="submit" disabled={submitting}
                                                    className="w-full bg-[#FF0000] text-white font-black py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-red-500 transition-all text-xs uppercase tracking-widest disabled:opacity-50">
                                                    {submitting ? <Activity className="h-3.5 w-3.5 animate-spin" /> : <>Send Signal <ChevronRight className="h-3.5 w-3.5" /></>}
                                                </button>
                                            </>
                                        )}
                                    </form>
                                </>
                            )}
                        </motion.div>
                    </div>
                )}
                {/* DNA Security Modal - Mandatory */}
                {showEmailPrompt && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="glass w-full max-w-md rounded-3xl p-8 md:p-10 relative z-10 border border-[#FF0000]/30 shadow-[0_0_100px_rgba(255,0,0,0.15)]">

                            <div className="h-16 w-16 rounded-2xl bg-[#FF0000]/10 flex items-center justify-center mb-8 mx-auto border border-[#FF0000]/20">
                                <Waves className="h-8 w-8 text-[#FF0000]" />
                            </div>

                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-2">Secure your DNA</h2>
                                <p className="text-white/60 text-xs font-bold leading-relaxed px-4">
                                    To connect with your soulmates and prevent data loss, we need to link your profile to your details.
                                </p>
                            </div>

                            <form onSubmit={handleSecureDna} className="space-y-6">
                                <div>
                                    <label className="mono text-[8px] text-[#FF0000] uppercase tracking-widest font-black block mb-2 ml-1">Your Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                            placeholder="you@email.com"
                                            className="w-full bg-white/5 border border-white/15 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#FF0000]/60 transition-all font-bold text-sm text-white placeholder:text-white/20" />
                                    </div>
                                </div>

                                <div>
                                    <label className="mono text-[8px] text-[#FF0000] uppercase tracking-widest font-black block mb-2 ml-1">Your City (Confirm)</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                                        <input type="text" required value={tempCity} onChange={e => setTempCity(e.target.value)}
                                            placeholder="e.g. NEW YORK"
                                            className="w-full bg-white/5 border border-white/15 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#FF0000]/60 transition-all font-bold text-sm text-white placeholder:text-white/20 uppercase" />
                                    </div>
                                </div>

                                <button type="submit" disabled={submitting || !email.includes("@") || !tempCity.trim()}
                                    className="w-full bg-[#FF0000] text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-red-500 transition-all text-xs uppercase tracking-widest disabled:opacity-30 shadow-[0_20px_40px_rgba(255,0,0,0.2)] hover:scale-[1.02] active:scale-95">
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Access Soulmates <ChevronRight className="h-4 w-4" /></>}
                                </button>

                                <p className="text-[9px] text-white/30 text-center mono uppercase tracking-widest mt-4">
                                    Privacy Secured • Encrypted Network
                                </p>
                            </form>
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
