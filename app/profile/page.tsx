"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Waves, Users, ArrowRight, Brain, User, CheckCircle2,
    ChevronRight, Activity, ExternalLink, Play, RefreshCw,
    Mail, X, MapPin
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AXIS_LABELS, generateInterpretation } from "@/lib/dna";
import ShareDNACard from "@/components/ShareDNACard";


function AxisBar({ label, value, idx }: { label: string; value: number; idx: number }) {
    const pct = Math.min(100, Math.max(0, (value ?? 0) * 100));
    const isRed = idx % 2 === 0;
    return (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04 }}>
            <div className="flex items-center justify-between mb-1.5">
                <span className="mono text-[9px] uppercase tracking-[0.4em] text-white/95 font-black">{label.replace(/_/g, " ")}</span>
                <span className="mono text-[10px] text-white/80 font-black">{pct.toFixed(0)}%</span>
            </div>
            <div className="h-2.5 bg-white/12 rounded-full overflow-hidden border border-white/10">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.04, ease: "easeOut" }}
                    className={`h-full rounded-full ${isRed
                        ? "bg-gradient-to-r from-[#FF0000] to-[#FF4444]"
                        : "bg-gradient-to-r from-orange-500 to-yellow-500"}`}
                />
            </div>
        </motion.div>
    );
}

// Simple radar chart using SVG
function RadarChart({ vector }: { vector: number[] }) {
    const size = 280;
    const cx = size / 2;
    const cy = size / 2;
    const maxR = size / 2 - 30;
    const n = vector.length;

    const getPoint = (idx: number, val: number) => {
        const angle = (Math.PI * 2 * idx) / n - Math.PI / 2;
        return {
            x: cx + Math.cos(angle) * val * maxR,
            y: cy + Math.sin(angle) * val * maxR,
        };
    };

    const gridLevels = [0.25, 0.5, 0.75, 1.0];
    const points = (Array.isArray(vector) ? vector : []).map((v, i) => getPoint(i, Number(v) || 0));
    const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";


    return (
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[280px] mx-auto">
            {/* Grid */}
            {gridLevels.map(level => {
                const pts = Array.from({ length: n }, (_, i) => getPoint(i, level));
                const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
                return <path key={level} d={d} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />;
            })}
            {/* Axis lines */}
            {Array.from({ length: n }, (_, i) => {
                const p = getPoint(i, 1);
                return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />;
            })}
            {/* Data */}
            <path d={pathD} fill="rgba(255,0,0,0.12)" stroke="#FF0000" strokeWidth="2" />
            {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="3" fill="#FF0000" />
            ))}
            {/* Labels */}
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

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [email, setEmail] = useState("");
    const [city, setCity] = useState("");
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        (async () => {
            try {
                const r = await fetch("/api/dna/profile/me");
                const d = await r.json();
                if (d.found) {
                    setProfile(d.dna);
                    if (d.dna.email) setEmail(d.dna.email);
                    if (d.dna.city) setCity(d.dna.city);
                } else {
                    router.replace("/");
                }
            } catch { }
            finally { setLoading(false); }
        })();
    }, [router]);

    const handleEmailSubmit = async (e: React.FormEvent, forceOverwrite = false) => {
        e?.preventDefault?.();
        if (!email || !email.includes("@")) return;

        setSaving(true);
        try {
            const res = await fetch("/api/dna/profile/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    displayName: profile.display_name,
                    email: email,
                    city: city,
                    genres: profile.top_genres,
                    bio: profile.narrative,
                    broadcasting: true,
                    forceOverwrite,
                })
            });
            const data = await res.json();

            if (data.clash) {
                // Another profile already uses this email — ask user to confirm
                const existingName = data.clash.display_name || "another user";
                const confirmed = confirm(
                    `The email "${email}" is already linked to "${existingName}".\n\nDo you want to overwrite that profile and claim this email for your current DNA?`
                );
                if (confirmed) {
                    // Re-submit with forceOverwrite
                    await handleEmailSubmit(null as any, true);
                }
                return;
            }

            if (data.success) {
                setProfile({ ...profile, email: email, city: city });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("ARE YOU SURE? This will permanently delete your DNA profile, matches, and all sonic data. This action CANNOT be undone.")) return;

        setDeleting(true);
        try {
            const res = await fetch("/api/dna/profile/delete", { method: "POST" });
            if (res.ok) {
                window.location.href = "/";
            }
        } catch (err) {
            console.error(err);
        } finally {
            setDeleting(false);
        }
    };



    return (
        <div className="relative min-h-screen bg-[#080808] overflow-x-hidden">
            <style>{`
                
                *{font-family:var(--font-syne),'Syne',sans-serif}
                .mono{font-family:'DM Mono',monospace!important}
                .glass{background:rgba(10,10,10,.75);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px)}
                .sb::-webkit-scrollbar{width:4px}
                .sb::-webkit-scrollbar-thumb{background:rgba(255,0,0,.2);border-radius:4px}
            `}</style>



            <div className="max-w-5xl mx-auto px-4 md:px-8 pt-24 pb-20 w-full">
                {loading ? (
                    <div className="glass rounded-[3rem] p-20 flex flex-col items-center justify-center">
                        <Activity className="h-12 w-12 text-[#FF0000] animate-spin mb-4" />
                        <p className="mono text-[10px] text-white/60 uppercase tracking-widest">Loading your Musical DNA…</p>
                    </div>
                ) : !profile ? null : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {/* Secure DNA Prompt - Only if no email */}
                        {!profile.email && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass rounded-[2rem] p-8 border border-[#FF0000]/30 bg-gradient-to-r from-[#FF0000]/10 to-transparent relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-5"><Mail className="h-24 w-24 text-[#FF0000]" /></div>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2">Secure Your <span className="text-[#FF0000]">Sonic Legacy</span></h3>
                                    <p className="text-white/70 text-xs font-bold mb-6 max-w-md">Your DNA is currently anonymous. Enter your email and city to save your profile permanently and connect with your matches.</p>

                                    <form onSubmit={handleEmailSubmit} className="space-y-3">
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="ENTER YOUR EMAIL"
                                                required
                                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white uppercase tracking-widest focus:outline-none focus:border-[#FF0000]/50 transition-all placeholder:text-white/20"
                                            />
                                            <div className="relative flex-1">
                                                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
                                                <input
                                                    type="text"
                                                    value={city}
                                                    onChange={(e) => setCity(e.target.value)}
                                                    placeholder="YOUR CITY"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-xs font-bold text-white uppercase tracking-widest focus:outline-none focus:border-[#FF0000]/50 transition-all placeholder:text-white/20"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            disabled={saving}
                                            className="bg-white text-black font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            {saving ? "SECURE SIGNAL..." : "SECURE DNA"}
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        )}

                        {/* Identity Banner */}
                        <div className="flex flex-col md:flex-row items-center gap-6 p-8 glass rounded-[3rem] border border-white/12 bg-gradient-to-br from-white/[0.03] to-transparent">
                            <div className="h-24 w-24 rounded-full border-2 border-[#FF0000]/40 overflow-hidden bg-white/5 flex items-center justify-center shadow-[0_0_30px_rgba(255,0,0,0.15)] shrink-0">
                                {profile.metadata?.user_image ? (
                                    <img src={profile.metadata.user_image} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <User className="h-12 w-12 text-white/20" />
                                )}
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <span className="mono text-[9px] text-[#FF0000] uppercase tracking-[0.5em] font-black mb-2 block">Digital Identity</span>
                                <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter mb-2">{profile.display_name}</h1>

                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-white/85 mono text-[9px] uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5"><Activity className="h-3 w-3 text-[#FF0000]" /> Signal Active</span>
                                    <span className="flex items-center gap-1.5"><Waves className="h-3 w-3" /> 12 Dimensions</span>
                                    <span className="flex items-center gap-1.5 text-white/60">Established {new Date(profile.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-1 glass px-6 py-4 rounded-3xl border border-[#FF0000]/25">
                                <span className="mono text-[9px] text-white/60 uppercase tracking-widest">Coherence</span>
                                <span className="text-3xl font-black text-[#FF0000] italic">{((profile.coherence_index ?? 0) * 100).toFixed(1)}%</span>
                            </div>
                        </div>

                        {/* Neural Feedback Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="glass rounded-[2rem] p-7 border border-white/20">
                                <p className="mono text-[9px] text-white/70 uppercase tracking-[0.2em] mb-4">Seed Identity — Your Selection</p>
                                <div className="flex flex-wrap gap-2">
                                    {(profile.top_genres || []).map((g: string, i: number) => (
                                        <span key={g + i} className="bg-white/10 border border-white/25 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest">{g}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="glass rounded-[2rem] p-7 border border-[#FF0000]/30 bg-[#FF0000]/5">
                                <p className="mono text-[9px] text-[#FF0000] uppercase tracking-[0.2em] mb-4">Neural Highlights — Extracted Dimensions</p>
                                <div className="flex flex-wrap gap-2">
                                    {profile.axes?.map((label: string, i: number) => ({ label, value: profile.vector?.[i] || 0 }))
                                        .sort((a: any, b: any) => b.value - a.value)
                                        .slice(0, 3)
                                        .map((axis: any) => (
                                            <span key={axis.label} className="bg-[#FF0000]/15 border border-[#FF0000]/40 text-[#FF0000] px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(255,0,0,0.2)]">
                                                {axis.label.replace(/_/g, " ")}
                                            </span>
                                        ))}
                                </div>
                            </div>
                        </div>


                        {/* Analysis Grid */}


                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                            {/* Radar Chart */}
                            <div className="lg:col-span-12 glass rounded-[2.5rem] p-8 border border-white/20">
                                <p className="mono text-[10px] text-white/80 uppercase tracking-[0.4em] mb-6 text-center">12-Axis Radar</p>
                                <RadarChart vector={profile.vector || Array(12).fill(0.5)} />
                                <div className="mt-6 flex flex-wrap justify-center gap-2">
                                    {(profile.top_genres || []).slice(0, 6).map((g: string, i: number) => (
                                        <span key={g + i} className={`rounded-full font-black uppercase tracking-widest ${i < 2 ? "bg-[#FF0000] text-white text-[10px] py-1.5 px-4" : "bg-white/12 border border-white/25 text-white/85 text-[9px] py-1 px-3"}`}>{g}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Axis Breakdown */}
                            <div className="lg:col-span-12 glass rounded-[2.5rem] p-8 border border-white/20">
                                <p className="mono text-[10px] text-white/80 uppercase tracking-[0.4em] mb-6">Axis Breakdown — 12 Dimensions</p>
                                <div className="space-y-4 max-h-[480px] overflow-y-auto sb pr-2">
                                    {AXIS_LABELS.map((axis, i) => (
                                        <AxisBar key={axis} label={axis} value={profile.vector?.[i] ?? 0} idx={i} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Narrative */}
                        {profile.narrative && (
                            <div className="glass rounded-[2.5rem] p-8 md:p-10 border border-white/25">
                                <p className="mono text-[10px] text-[#FF0000] uppercase tracking-[0.4em] mb-5 font-black flex items-center gap-2"><Brain className="h-3.5 w-3.5" />Your Sound Profile</p>
                                <p className="text-white leading-relaxed text-sm font-bold">{profile.narrative}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <Link href="/soulmates"
                                onClick={() => {
                                    fetch('/api/dna/intent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ intent: 'find_soulmates' }) }).catch(console.error);
                                }}
                                className="relative flex items-center justify-center gap-3 bg-[#FF0000] text-white font-black text-[11px] uppercase tracking-widest py-5 rounded-2xl hover:bg-red-500 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_36px_rgba(255,0,0,0.28)] overflow-hidden">
                                <Users className="h-4 w-4" />Find Soulmates<ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                            <Link href="/"
                                className="flex items-center justify-center gap-3 border border-white/25 bg-white/10 text-white/85 hover:text-white hover:border-white/40 font-black text-[11px] uppercase tracking-widest py-5 rounded-2xl transition-all">
                                <RefreshCw className="h-4 w-4" />Regenerate DNA
                            </Link>
                            <ShareDNACard profile={profile} />
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex items-center justify-center gap-3 border border-red-500/30 bg-red-500/5 text-red-500/80 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/50 font-black text-[11px] uppercase tracking-widest py-5 rounded-2xl transition-all disabled:opacity-50"
                            >
                                <X className="h-4 w-4" />{deleting ? "Deleting..." : "Delete Profile"}
                            </button>
                        </div>

                        {/* Layman Interpretation */}
                        <div className="glass rounded-[2.5rem] p-8 md:p-12 border border-[#FF0000]/20 bg-[#FF0000]/2 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-10 opacity-[0.05] pointer-events-none">
                                <Brain className="h-40 w-40 text-[#FF0000]" />
                            </div>
                            <div className="relative z-10">
                                <p className="mono text-[10px] text-[#FF0000] uppercase tracking-[0.4em] mb-8 font-black flex items-center gap-2">
                                    🎯 Overall Profile Alignment
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div>
                                        <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-6 opacity-60">This radar suggests someone who likes:</h3>
                                        <ul className="space-y-4">
                                            {generateInterpretation(profile.vector || []).characteristics.map((c, i) => (
                                                <li key={i} className="flex items-center gap-4 text-white/80 text-sm font-bold italic tracking-tight transition-all hover:translate-x-1">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-[#FF0000]/80 shadow-[0_0_8px_rgba(255,0,0,0.5)]" />
                                                    {c}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-6 opacity-60">That combination strongly aligns with:</h3>
                                        <div className="flex flex-wrap gap-2.5">
                                            {generateInterpretation(profile.vector || []).genreMatches.map((g, i) => (
                                                <span key={i} className="bg-white/10 border border-white/25 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] shadow-lg">
                                                    {g}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tracks */}
                        {profile.recent_tracks?.length > 0 && (
                            <div className="glass rounded-[2.5rem] p-7 border border-white/12">
                                <p className="mono text-[10px] text-white/55 uppercase tracking-[0.4em] mb-5">
                                    Source Signals (<a href="https://spotify.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#1DB954] transition-colors">Spotify</a> / <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF0000] transition-colors">YouTube</a>) — {profile.recent_tracks.length} tracks
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {profile.recent_tracks.map((tr: any, i: number) => (
                                        <a key={(tr.id || i) + i} href={tr.url || "#"} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/10 border border-white/25 hover:bg-white/15 hover:border-[#FF0000]/50 transition-all group">
                                            <div className="h-10 w-10 rounded-xl overflow-hidden bg-white/15 shrink-0">
                                                {tr.thumbnail ? <img src={tr.thumbnail} alt="" className="h-full w-full object-cover grayscale opacity-75 group-hover:grayscale-0 group-hover:opacity-100 transition-all" /> : <User className="h-5 w-5 opacity-40 m-auto mt-2.5" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black truncate text-white/95 group-hover:text-white transition-colors">{tr.title || "Unknown"}</p>
                                                <p className="mono text-[9px] text-white/85 truncate">{tr.artist || tr.channel || ""}</p>
                                            </div>
                                            <ExternalLink className="h-3 w-3 text-white/40 group-hover:text-[#FF0000] transition-all shrink-0" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            {/* BG */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] blur-[160px] rounded-full bg-[#FF0000]/7" />
                <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] blur-[160px] rounded-full bg-orange-900/7" />
            </div>
        </div>
    );
}
