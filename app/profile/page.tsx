"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Waves, Users, ArrowRight, Brain, User, CheckCircle2,
    ChevronRight, Activity, ExternalLink, Play, RefreshCw,
    Mail, X, MapPin, Loader2, Sparkles, Search
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AXIS_LABELS, generateInterpretation } from "@/lib/dna";
import ShareDNACard from "@/components/ShareDNACard";
import UnifiedArtistCard from "@/components/UnifiedArtistCard";


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
    const [verifyPopup, setVerifyPopup] = useState(false);
    const [verifyError, setVerifyError] = useState<string | null>(null);
    const [tribeMatches, setTribeMatches] = useState<any[]>([]);
    const [loadingTribe, setLoadingTribe] = useState(false);
    const [localSearchQuery, setLocalSearchQuery] = useState("");
    const [genreFilter, setGenreFilter] = useState("");
    const [tribeOffset, setTribeOffset] = useState(0);
    const [hasMoreTribe, setHasMoreTribe] = useState(false);
    const router = useRouter();

    useEffect(() => {
        (async () => {
            try {
                const r = await fetch("/api/dna/profile/me");
                const d = await r.json() as any;
                if (d.found) {
                    setProfile(d.dna);
                    if (d.dna.email) setEmail(d.dna.email);
                    if (d.dna.city) setCity(d.dna.city);

                    // Show verification popup for existing users without verified email
                    // Check if auth_email cookie exists (means they've verified via magic link)
                    const authEmail = document.cookie.split(";").find(c => c.trim().startsWith("auth_email="));
                    if (d.dna.email && !authEmail) {
                        setVerifyPopup(true);
                    }
                } else {
                    router.replace("/");
                }
            } catch { }
            finally { setLoading(false); }
        })();

        const listener = () => {
            // Re-fetch profile data
            fetch("/api/dna/profile/me")
                .then(r => r.json() as any)
                .then(d => {
                    if (d.found) setProfile(d.dna);
                })
                .catch(console.error);
        };
        window.addEventListener("profile-updated", listener);
        return () => window.removeEventListener("profile-updated", listener);
    }, [router]);

    useEffect(() => {
        if (profile) {
            const timer = setTimeout(() => {
                fetchTribe(0);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [profile, localSearchQuery, genreFilter]);

    const fetchTribe = async (offset = 0) => {
        setLoadingTribe(true);
        try {
            const res = await fetch(`/api/artists?q=${encodeURIComponent(localSearchQuery)}&genre=${encodeURIComponent(genreFilter)}&offset=${offset}&limit=5`);
            const data = await res.json() as any;
            if (data.success) {
                if (offset === 0) setTribeMatches(data.artists || []);
                else setTribeMatches(prev => [...prev, ...(data.artists || [])]);
                setHasMoreTribe(data.hasMore);
                setTribeOffset(offset);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingTribe(false);
        }
    };

    // Send magic link for email verification (WorkOS)
    const handleSendVerification = async () => {
        const targetEmail = email.trim();
        if (!targetEmail || !targetEmail.includes("@")) return;

        setSaving(true);
        setVerifyError(null);

        try {
            // Redirect to WorkOS hosted Magic Auth with email hint
            window.location.href = `/login?email=${encodeURIComponent(targetEmail)}`;
        } catch (err: any) {
            setVerifyError(err.message || "Network error");
            setSaving(false);
        }
    };

    // Legacy email submit — now routes through magic link
    const handleEmailSubmit = async (e: React.FormEvent, forceOverwrite = false) => {
        e?.preventDefault?.();
        if (!email || !email.includes("@")) return;

        // Check for clash first
        if (!forceOverwrite) {
            setSaving(true);
            try {
                const checkRes = await fetch("/api/dna/profile/check-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                });
                const checkData = await checkRes.json() as any;

                if (checkData.exists && checkData.profile?.user_id !== profile?.user_id) {
                    const existingName = checkData.profile.display_name || "another user";
                    const confirmed = confirm(
                        `The email "${email}" is already linked to "${existingName}".\n\nDo you want to overwrite that profile and claim this email for your current DNA?`
                    );
                    if (confirmed) {
                        // Force overwrite: save email directly then send verification
                        await fetch("/api/dna/profile/save", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                displayName: profile.display_name,
                                email,
                                city,
                                genres: profile.top_genres,
                                bio: profile.narrative,
                                broadcasting: true,
                                forceOverwrite: true,
                            }),
                        });
                        setProfile({ ...profile, email, city });
                    }
                    setSaving(false);
                    return;
                }
            } catch (err) {
                console.error(err);
            }
            setSaving(false);
        }

        // Send magic link for verification
        await handleSendVerification();
    };

    const handleDelete = async (regenerate: boolean = false) => {
        const msg = regenerate
            ? "ARE YOU SURE? This will permanently delete your current DNA profile and matches, allowing you to start a fresh scan. This CANNOT be undone."
            : "ARE YOU SURE? This will permanently delete your DNA profile, matches, and all sonic data. This action CANNOT be undone.";

        if (!confirm(msg)) return;

        setDeleting(true);
        try {
            const res = await fetch("/api/dna/profile/delete", { method: "POST" });
            if (res.ok) {
                window.location.href = regenerate ? "/?scan=true" : "/";
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
                                    {/* ── Email Entry ── */}
                                    <>
                                        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2">Secure Your <span className="text-[#FF0000]">Sonic Legacy</span></h3>
                                        <p className="text-white/70 text-xs font-bold mb-6 max-w-md">Your DNA is currently anonymous. Enter your email to receive a verification link and save your profile permanently.</p>

                                        <div className="flex flex-col gap-4">
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#FF0000] opacity-50 group-focus-within:opacity-100 transition-opacity" />
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="VERIFY YOUR EMAIL"
                                                    required
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-xs font-black text-white uppercase tracking-widest focus:outline-none focus:border-[#FF0000]/50 transition-all placeholder:text-white/20"
                                                />
                                            </div>
                                            {verifyError && (
                                                <p className="text-red-400 mono text-[9px] uppercase tracking-widest bg-red-400/10 p-2 rounded-lg">{verifyError}</p>
                                            )}
                                            <button
                                                onClick={handleEmailSubmit}
                                                disabled={saving || !email.includes("@")}
                                                className="w-full bg-white text-black font-black text-[10px] uppercase tracking-widest px-8 py-4 rounded-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 shadow-[0_10px_30px_rgba(255,255,255,0.05)]"
                                            >
                                                {saving ? <Activity className="h-4 w-4 animate-spin" /> : <><Mail className="h-4 w-4" /> Verify Identity</>}
                                            </button>
                                        </div>
                                    </>
                                </div>
                            </motion.div>
                        )}

                        {/* ── Email Verification Popup for existing users ── */}
                        {verifyPopup && profile.email && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md p-6"
                            >
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="glass rounded-[2.5rem] p-10 border border-blue-500/30 bg-blue-500/5 max-w-md w-full text-center shadow-[0_0_100px_rgba(59,130,246,0.15)]"
                                >
                                    {/* ── Confirm Prompt ── */}
                                    <>
                                        <div className="h-16 w-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                                            <Mail className="h-8 w-8 text-blue-400" />
                                        </div>
                                        <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-3">Confirm Your Email</h3>
                                        <p className="text-white/60 text-xs mb-2">Your profile is linked to</p>
                                        <p className="text-blue-400 font-black text-sm mb-6">{profile.email}</p>
                                        <p className="text-white/50 text-xs mb-8 leading-relaxed">
                                            For your security, we'll send a verification link to confirm ownership of this email address.
                                        </p>
                                        {verifyError && (
                                            <p className="text-red-400 mono text-[9px] uppercase tracking-widest mb-4">{verifyError}</p>
                                        )}
                                        <div className="flex flex-col gap-3">
                                            <button
                                                onClick={handleSendVerification}
                                                disabled={saving}
                                                className="w-full bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
                                            >
                                                {saving ? "SENDING..." : "SEND VERIFICATION LINK"}
                                            </button>
                                            <button
                                                onClick={() => setVerifyPopup(false)}
                                                className="w-full text-white/40 font-black text-[10px] uppercase tracking-widest py-2 hover:text-white transition-all"
                                            >
                                                MAYBE LATER
                                            </button>
                                        </div>
                                    </>
                                </motion.div>
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

                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-white/85 mono text-[9px] uppercase tracking-widest mt-3">
                                    {(profile.city || profile.metadata?.city) && (
                                        <span className="flex items-center gap-1.5 text-[#FF0000] font-black"><MapPin className="h-3 w-3" /> {(profile.city || profile.metadata?.city).toUpperCase()}</span>
                                    )}
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
                            <button onClick={() => handleDelete(true)}
                                disabled={deleting}
                                className="flex items-center justify-center gap-3 border border-white/25 bg-white/10 text-white/85 hover:text-white hover:border-white/40 font-black text-[11px] uppercase tracking-widest py-5 rounded-2xl transition-all disabled:opacity-50">
                                <RefreshCw className="h-4 w-4" />{deleting ? "Resetting..." : "Regenerate DNA"}
                            </button>
                            <ShareDNACard profile={profile} />
                            <button
                                onClick={() => handleDelete(false)}
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

                        {/* Community Discovery */}
                        <div className="space-y-8 mt-12 pb-10">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
                                <div>
                                    <h3 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
                                        <Users className="h-6 w-6 text-[#FF0000]" />
                                        Musical <span className="text-[#FF0000]">Tribe</span>
                                    </h3>
                                    <p className="mono text-[9px] text-white/50 uppercase tracking-[0.2em]">Synchronized signals from the community</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {["", "Electronic", "Jazz", "Hip-Hop", "Experimental"].map((g) => (
                                        <button
                                            key={g}
                                            onClick={() => setGenreFilter(g)}
                                            className={`px-4 py-2 rounded-xl border mono text-[8px] uppercase tracking-widest transition-all ${genreFilter === g
                                                ? "bg-[#FF0000] border-[#FF0000] text-white"
                                                : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                                                }`}
                                        >
                                            {g || "All"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Search Local */}
                            <div className="relative group px-1">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-[#FF0000] transition-colors" />
                                <input
                                    type="text"
                                    value={localSearchQuery}
                                    onChange={(e) => setLocalSearchQuery(e.target.value)}
                                    placeholder="SEARCH TRIBE MEMBERS..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-sm font-bold italic uppercase text-white outline-none focus:border-[#FF0000]/40 transition-all placeholder:text-white/10"
                                />
                                {loadingTribe && <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-[#FF0000] animate-spin" />}
                            </div>

                            <div className="flex flex-col gap-8">
                                {tribeMatches.length > 0 ? (
                                    <>
                                        {tribeMatches.map((artist, idx) => (
                                            <UnifiedArtistCard
                                                key={artist.id}
                                                artist={artist}
                                                index={idx}
                                                hasDna={true}
                                                forceEmbed={true}
                                                hideSync={true}
                                                hideLabel={true}
                                            />
                                        ))}

                                        {hasMoreTribe && (
                                            <button
                                                onClick={() => fetchTribe(tribeOffset + 5)}
                                                disabled={loadingTribe}
                                                className="w-full py-6 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center gap-3 hover:border-[#FF0000]/30 transition-all group"
                                            >
                                                {loadingTribe ? <Loader2 className="h-4 w-4 animate-spin text-[#FF0000]" /> : <Activity className="h-4 w-4 text-[#FF0000]" />}
                                                <span className="text-white/60 font-black italic uppercase tracking-[0.2em] text-[10px]">
                                                    Load More Signals
                                                </span>
                                            </button>
                                        )}
                                    </>
                                ) : !loadingTribe && (
                                    <div className="py-20 text-center glass rounded-3xl border border-white/5">
                                        <p className="mono text-[10px] text-white/20 uppercase tracking-[0.4em]">No matching signals in your frequency</p>
                                    </div>
                                )}
                            </div>
                        </div>
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
