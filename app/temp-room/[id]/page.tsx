"use client";

import { useState, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Check, Music4, Activity, ExternalLink, Sparkles, ArrowLeft, Mail, ShieldCheck, Zap, Orbit, Play } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function TempRoomPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: bridgeId } = use(params);
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState(172800);
    const [loading, setLoading] = useState(true);
    const [synthesis, setSynthesis] = useState<any>(null);
    const [consents, setConsents] = useState<Record<string, boolean>>({});
    const [revealedEmails, setRevealedEmails] = useState<Record<string, string> | null>(null);
    const [playlistUrl, setPlaylistUrl] = useState<string | null>(null);
    const [merging, setMerging] = useState(false);
    const [consenting, setConsenting] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!bridgeId) return;

        const setupBridge = async () => {
            // 0. Get current user
            const { data: { user } } = await supabase.auth.getUser(); // Try standard auth first
            if (!user) {
                // Fallback to cookie check if using custom OAuth flow
                const googleToken = document.cookie.split('; ').find(row => row.startsWith('google_access_token='));
                if (googleToken) {
                    const res = await fetch("/api/auth/me");
                    if (res.ok) {
                        const data = await res.json();
                        setCurrentUserId(data.user.sub);
                    }
                }
            } else {
                setCurrentUserId(user.id);
            }

            // 1. Fetch initial state
            const { data: bridge } = await supabase
                .from("bridges")
                .select("*")
                .eq("id", bridgeId)
                .single();

            if (!bridge) {
                setLoading(false);
                return;
            }

            if (bridge.common_ground_data?.synthesis) {
                setSynthesis(bridge.common_ground_data.synthesis);
            } else {
                const res = await fetch("/api/bridge/synthesize", {
                    method: "POST",
                    body: JSON.stringify({ bridgeId }),
                    headers: { "Content-Type": "application/json" }
                });
                if (res.ok) setSynthesis(await res.json());
            }

            setConsents(bridge.common_ground_data?.consents || {});
            setRevealedEmails(bridge.common_ground_data?.revealed_emails || null);
            if (bridge.common_ground_data?.status === "merged") {
                setPlaylistUrl(bridge.common_ground_data.playlist_url);
            }

            setLoading(false);

            // 2. Subscribe to updates
            const channel = supabase
                .channel(`bridge:${bridgeId}`)
                .on(
                    "postgres_changes",
                    {
                        event: "UPDATE",
                        schema: "public",
                        table: "bridges",
                        filter: `id=eq.${bridgeId}`,
                    },
                    (payload: any) => {
                        const newData = payload.new.common_ground_data;
                        if (newData?.consents) setConsents(newData.consents);
                        if (newData?.revealed_emails) setRevealedEmails(newData.revealed_emails);
                        if (newData?.status === "merged") setPlaylistUrl(newData.playlist_url);
                        if (newData?.synthesis) setSynthesis(newData.synthesis);
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };

        setupBridge();
    }, [bridgeId]);

    const handleConsent = async () => {
        if (!currentUserId || consenting) return;
        setConsenting(true);
        const nextState = !consents[currentUserId];
        try {
            const res = await fetch("/api/bridge/consent", {
                method: "POST",
                body: JSON.stringify({ bridgeId, consent: nextState }),
                headers: { "Content-Type": "application/json" }
            });
            if (res.ok) {
                const data = await res.json();
                setConsents(data.consents);
                if (data.revealed_emails) setRevealedEmails(data.revealed_emails);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setConsenting(false);
        }
    };

    const startMerge = async () => {
        setMerging(true);
        try {
            const res = await fetch("/api/bridge/merge", {
                method: "POST",
                body: JSON.stringify({ bridgeId }),
                headers: { "Content-Type": "application/json" }
            });
            if (res.ok) {
                const data = await res.json();
                setPlaylistUrl(data.url);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setMerging(false);
        }
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const consentedCount = Object.values(consents).filter(v => v === true).length;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Activity className="h-10 w-10 animate-spin text-primary opacity-20" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 px-4 sm:px-10 pb-20 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
            {/* Left: Intersection Map & Protocol */}
            <div className="flex-1 space-y-6 md:space-y-8">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase text-white/30 hover:text-white transition-colors mb-3 tracking-widest">
                            <ArrowLeft className="h-3.5 w-3.5" /> Back to matches
                        </button>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-[#FF0000]/20 text-[#FF0000] text-[10px] font-black px-2 py-0.5 rounded-full ring-1 ring-[#FF0000]/30 uppercase tracking-widest">Intersection Protocol</span>
                            <span className="text-white/40 text-[10px] font-mono">RX-{bridgeId.slice(0, 4)}</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black mb-2 text-white uppercase tracking-tighter">The <span className="text-[#FF0000] italic">Midpoint</span> Bridge</h1>
                        <p className="text-white/40 text-xs md:text-sm flex items-center gap-2 font-medium">
                            <Timer className="h-4 w-4 text-[#FF0000]" />
                            Bridge Collapses in <span className="text-white font-mono">{formatTime(timeLeft)}</span>
                        </p>
                    </div>
                </header>

                <section className="glass rounded-[2rem] p-6 md:p-10 flex flex-col relative overflow-hidden h-full min-h-[400px]">
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                        <Orbit className="h-40 w-40 animate-spin-slow" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-[#FF0000] font-black uppercase text-[10px] md:text-xs tracking-[0.2em] mb-8">
                            <Zap className="h-4 w-4" /> Signal Collision Logic
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div className="space-y-6">
                                <h2 className="text-xl md:text-2xl font-black text-white leading-tight uppercase">
                                    Your musical identities have merged into a <span className="text-[#FF0000]">singular vibe</span>.
                                </h2>
                                <p className="text-xs md:text-sm text-white/50 leading-relaxed font-medium">
                                    Instead of standard communication, the protocol has calculated the exact mathematical center of your discovery profiles.
                                </p>

                                <div className="space-y-3 pt-4">
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-3 w-3 rounded-full ${consents[currentUserId || ''] ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-white/20'}`} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Your Signal Consent</span>
                                        </div>
                                        <button
                                            onClick={handleConsent}
                                            disabled={consenting}
                                            className={`text-[9px] font-black uppercase px-4 py-2 rounded-full border transition-all ${consents[currentUserId || ''] ? 'border-green-500/50 bg-green-500/10 text-green-500' : 'border-white/20 hover:border-white/40 text-white/40 hover:text-white'}`}
                                        >
                                            {consents[currentUserId || ''] ? 'Authorized' : 'Authorize Reveal'}
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 opacity-80">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-3 w-3 rounded-full ${Object.keys(consents).length > 1 && Object.entries(consents).find(([id, v]) => id !== currentUserId)?.[1] ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-white/20'}`} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Neural Counterparty Status</span>
                                        </div>
                                        <span className="text-[9px] font-black uppercase text-white/40">
                                            {Object.keys(consents).length > 1 && Object.entries(consents).find(([id, v]) => id !== currentUserId)?.[1] ? 'CONSENT RECEIVED' : 'AWAITING SCAN'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Midpoint visualization */}
                            <div className="relative aspect-square flex items-center justify-center">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#FF0000]/10 to-transparent blur-3xl rounded-full" />
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="w-full h-full border-2 border-dashed border-white/10 rounded-full flex items-center justify-center"
                                >
                                    <div className="w-[70%] h-[70%] border border-white/10 rounded-full flex items-center justify-center p-4">
                                        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent absolute" style={{ transform: 'rotate(45deg)' }} />
                                        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent absolute" style={{ transform: 'rotate(-45deg)' }} />
                                    </div>
                                </motion.div>

                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute h-16 w-16 bg-[#FF0000] rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(255,0,0,0.6)] ring-4 ring-black"
                                >
                                    <Zap className="h-8 w-8 text-white fill-white" />
                                </motion.div>

                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Discovery Alpha</div>
                                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Frequency Omega</div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Right: Synthesis Results & Contact */}
            <div className="w-full lg:w-[400px] space-y-6">
                <div className="glass rounded-[3rem] p-6 md:p-8 border-white/5 overflow-hidden relative min-h-[500px] flex flex-col">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                        <Music4 className="h-40 w-40" />
                    </div>

                    {!synthesis ? (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                            <Sparkles className="h-12 w-12 text-[#FF0000] animate-pulse" />
                            <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">Orchestrating Common Ground...</p>
                        </div>
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col relative z-20">
                            <div className="mb-8">
                                <h3 className="text-2xl font-black mb-2 italic uppercase tracking-tighter text-white">
                                    {synthesis.name}
                                </h3>
                                <p className="text-[10px] md:text-xs text-white/40 mb-6 leading-relaxed font-bold uppercase tracking-wide">
                                    "{synthesis.description}"
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    {synthesis.vibe?.map((v: string) => (
                                        <span key={v} className="text-[9px] font-black uppercase bg-[#FF0000]/10 text-[#FF0000] px-3 py-1.5 rounded-full border border-[#FF0000]/20 tracking-wider transition-all hover:bg-[#FF0000]/20">{v}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2 mb-8 flex-1">
                                <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-4">Signal Intersection Breakdown</div>
                                {synthesis.tracks?.map((track: any, idx: number) => (
                                    <TrackItem key={idx} title={track.title} artist={track.artist} duration={track.duration} />
                                ))}
                            </div>

                            {/* Contact Reveal Area */}
                            <div className="bg-black/40 rounded-3xl p-6 border border-white/5 mb-6">
                                {revealedEmails ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-green-500 font-black uppercase text-[10px] tracking-widest">
                                            <ShieldCheck className="h-4 w-4" /> Signal Authenticated
                                        </div>
                                        {Object.entries(revealedEmails).map(([uid, email]) => (
                                            <div key={uid} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group">
                                                <div className="flex items-center gap-3">
                                                    <Mail className="h-4 w-4 text-white/40" />
                                                    <span className="text-xs font-bold text-white/80">{email}</span>
                                                </div>
                                                <ExternalLink className="h-3 w-3 text-white/20 group-hover:text-white transition-colors cursor-pointer" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-center py-4">
                                        <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center mb-3">
                                            <ShieldCheck className="h-5 w-5 text-white/20" />
                                        </div>
                                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-relaxed">
                                            {consentedCount === 1 ? "Awaiting mutual sync..." : "Dual-Key authorization required to reveal contact signals."}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-auto">
                                {!playlistUrl ? (
                                    <button
                                        onClick={startMerge}
                                        disabled={merging}
                                        className="w-full bg-[#FF0000] p-5 rounded-[1.5rem] font-black text-white uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all enabled:hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-[0_10px_40px_rgba(255,0,0,0.4)]"
                                    >
                                        {merging ? <Activity className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5 fill-white" />}
                                        Initialize Shared Signal
                                    </button>
                                ) : (
                                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                        <a
                                            href={playlistUrl || "#"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full bg-green-500 p-5 rounded-[1.5rem] font-black text-black text-center flex items-center justify-center gap-2 text-xs uppercase tracking-widest shadow-[0_10px_40px_rgba(34,197,94,0.4)]"
                                        >
                                            <Check className="h-5 w-5" />
                                            Open Discovery Bridge
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}

function TrackItem({ title, artist, duration }: { title: string, artist: string, duration: string }) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all cursor-pointer">
            <div className="h-9 w-9 bg-black/40 rounded-lg flex items-center justify-center text-[#FF0000]">
                <Play className="h-4 w-4 fill-[#FF0000]" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-[11px] font-black truncate pr-2 uppercase text-white/90">{title}</div>
                <div className="text-[9px] text-white/30 font-bold uppercase tracking-widest">{artist}</div>
            </div>
            <div className="text-[10px] font-mono text-white/20">{duration}</div>
        </div>
    );
}
