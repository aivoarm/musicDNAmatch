"use client";
import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Fingerprint, Mail, ArrowRight, Users, User, Brain, Music2, ExternalLink, ChevronRight } from "lucide-react";
import Link from "next/link";
import { DnaBar } from "./HomeUI";
import ShareDNACard from "./ShareDNACard";
import { generateInterpretation, AXIS_LABELS } from "@/lib/dna";
import { decodeHtml } from "@/lib/utils";

interface CompleteProps {
    dna: any;
    email: string | null;
    genres: string[];
    isAuthenticated: boolean;
    setShowOnboarding: React.Dispatch<React.SetStateAction<boolean>>;
    onRestart: () => void;
}

export default function StageComplete({ dna, email, genres, isAuthenticated, setShowOnboarding, onRestart }: CompleteProps) {
    if (!dna) return null;

    return (
        <motion.div key="co" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 w-full pb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
                <div className="space-y-4">
                    {!email && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass rounded-[2rem] p-6 border border-[#FF0000]/30 bg-[#FF0000]/5 relative overflow-hidden mb-2"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5"><Mail className="h-16 w-16 text-[#FF0000]" /></div>
                            <div className="relative z-10">
                                <h4 className="text-sm font-black text-white italic uppercase tracking-tighter mb-1">Anonymous Signal Detected</h4>
                                <p className="text-white/60 text-[10px] font-bold leading-relaxed mb-4">You are viewing a temporary profile. Secure this DNA with your email to prevent data loss and connect with matches.</p>
                                <Link href="/profile" className="inline-flex items-center gap-2 text-[#FF0000] text-[9px] font-black uppercase tracking-widest hover:translate-x-1 transition-transform">
                                    Secure DNA Now <ArrowRight className="h-3 w-3" />
                                </Link>
                            </div>
                        </motion.div>
                    )}

                    <div className="glass rounded-[2.5rem] p-8 md:p-10 border border-white/10">
                        <p className="mono text-[10px] text-white/60 uppercase tracking-widest mb-7">Structural Map Vector — 12 Dimensions</p>
                        <div className="space-y-4 max-h-[420px] overflow-y-auto sb pr-2">
                            {(dna.axes || AXIS_LABELS).map((axis: string, i: number) => (
                                <DnaBar key={axis} label={axis.replace(/_/g, " ")} value={dna.vector?.[i] ?? 0} red={i % 2 === 0} />
                            ))}
                        </div>
                        <div className="mt-9 flex flex-col items-center pt-7 border-t border-white/10">
                            <CheckCircle2 className="h-14 w-14 text-[#FF0000] mb-3 drop-shadow-lg" />
                            <span className="text-lg font-black tracking-[0.3em] uppercase text-white italic">Sync Verified</span>
                            <span className="mono text-[8px] text-white/40 uppercase tracking-widest mt-2 flex items-center gap-1.5 opacity-70"><Fingerprint className="h-2.5 w-2.5" /> Signal Identification: {dna.display_name}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <ShareDNACard profile={dna} />
                    <div className="glass rounded-[2.5rem] p-8 border border-[#FF0000]/20 bg-[#FF0000]/4">
                        <div className="flex items-center justify-between mb-5">
                            <span className="mono text-[10px] text-[#FF0000] uppercase tracking-widest font-black flex items-center gap-2"><Fingerprint className="h-4 w-4" />Neural Fingerprint</span>
                            <span className="mono text-[9px] text-white/50">12,492 nodes</span>
                        </div>
                        <div className="flex items-end justify-between border-b border-white/25 pb-5 mb-5">
                            <div className="flex flex-col">
                                <p className="mono text-[8px] text-white/40 uppercase tracking-widest mb-1.5">Authenticated As</p>
                                <h4 className="text-xl font-black text-white italic truncate pr-4">{dna.display_name}</h4>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="mono text-3xl font-black text-[#FF0000]">{((dna.coherence_index ?? 0.8) * 100).toFixed(1)}%</p>
                                <p className="mono text-[9px] text-white/80 uppercase tracking-widest">Coherence</p>
                            </div>
                        </div>

                        <div className="space-y-6 mb-7">
                            <div>
                                <p className="mono text-[9px] text-white/60 uppercase tracking-[0.2em] mb-3">Seed Identity — Your Selection</p>
                                <div className="flex flex-wrap gap-2">
                                    {(dna.top_genres || []).map((g: string, i: number) => (
                                        <span key={g + i} className="bg-white/15 border border-white/25 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{g}</span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="mono text-[9px] text-[#FF0000]/60 uppercase tracking-[0.2em] mb-3">Neural Highlights — Extracted Dimensions</p>
                                <div className="flex flex-wrap gap-2">
                                    {(dna.axes || AXIS_LABELS).map((label: string, i: number) => ({ label, value: dna.vector?.[i] || 0 }))
                                        .sort((a: any, b: any) => b.value - a.value)
                                        .slice(0, 3)
                                        .map((axis: any, i: number) => (
                                            <span key={axis.label} className="bg-[#FF0000]/10 border border-[#FF0000]/20 text-[#FF0000] px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(255,0,0,0.15)]">
                                                {axis.label.replace(/_/g, " ")}
                                            </span>
                                        ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-5">
                            {[["Vector Dist", "0.198"], ["Dimensions", "12D"]].map(([k, v]) => (
                                <div key={k} className="bg-white/7 p-4 rounded-2xl border border-white/8">
                                    <p className="mono text-[9px] text-white/60 uppercase tracking-widest mb-1.5">{k}</p>
                                    <p className="mono text-xl font-black text-white">{v}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={async () => {
                            await fetch('/api/dna/intent', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ intent: 'find_soulmates' })
                            }).catch(console.error);

                            if (!email) {
                                setShowOnboarding(true);
                            } else if (!isAuthenticated) {
                                window.location.href = `/login?email=${encodeURIComponent(email)}`;
                            } else {
                                window.location.href = "/soulmates?genres=" + encodeURIComponent(genres.join(","));
                            }
                        }}
                        className="relative flex items-center justify-between w-full bg-[#FF0000] p-6 rounded-[2rem] font-black text-white uppercase tracking-[0.2em] text-lg hover:scale-[1.01] active:scale-95 transition-all shadow-[0_14px_50px_rgba(255,0,0,0.4)] overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full shimmer pointer-events-none" />
                        <span className="flex items-center gap-3 relative z-10"><Users className="h-6 w-6 fill-white" />Find Soulmates</span>
                        <ChevronRight className="h-7 w-7 group-hover:translate-x-2 transition-transform relative z-10" />
                    </button>
                    <Link href="/profile"
                        className="relative w-full overflow-hidden flex items-center justify-center gap-3 border border-[#FF0000]/20 bg-black/40 text-white hover:border-[#FF0000]/40 font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl hover:scale-[1.01] active:scale-95 transition-all group">
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <User className="h-5 w-5 text-white/70 group-hover:text-white transition-colors relative z-10" />
                        <span className="relative z-10">View Full Profile</span>
                    </Link>
                    <button onClick={onRestart} className="w-full mono text-[10px] text-white/45 hover:text-[#FF0000] transition-all uppercase tracking-widest py-2 text-center">↺ Start new scan</button>
                </div>
            </div>

            {dna.narrative && (
                <div className="glass rounded-[2.5rem] p-8 md:p-10 border border-white/25">
                    <p className="mono text-[10px] text-[#FF0000] uppercase tracking-[0.4em] mb-5 font-black flex items-center gap-2"><Brain className="h-3.5 w-3.5" />Your Sound Profile</p>
                    <p className="text-white font-medium leading-relaxed text-sm">{dna.narrative}</p>
                </div>
            )}

            <div className="glass rounded-[2.5rem] p-8 md:p-12 border border-[#FF0000]/20 bg-[#FF0000]/2 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-10 opacity-[0.05] pointer-events-none">
                    <Brain className="h-40 w-40 text-[#FF0000]" />
                </div>
                <div className="relative z-10">
                    <p className="mono text-[10px] text-[#FF0000] uppercase tracking-[0.4em] mb-8 font-black flex items-center gap-2">
                        🎯 What This Profile Says Overall
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div>
                            <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-6 opacity-60">This radar suggests someone who likes:</h3>
                            <ul className="space-y-4">
                                {generateInterpretation(dna.vector).characteristics.map((c: string, i: number) => (
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
                                {generateInterpretation(dna.vector).genreMatches.map((g: string, i: number) => (
                                    <span key={i} className="bg-white/5 border border-white/10 text-white/90 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] shadow-lg">
                                        {g}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {dna.recent_tracks?.length > 0 && (
                <div className="glass rounded-[2.5rem] p-7 border border-white/12">
                    <p className="mono text-[10px] text-white/55 uppercase tracking-[0.4em] mb-5">
                        Captured Signals (<a href="https://spotify.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#1DB954] transition-colors">Spotify</a> / <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF0000] transition-colors">YouTube</a>) — {dna.recent_tracks.length} tracks
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {dna.recent_tracks.map((tr: any, i: number) => (
                            <a key={tr.id + i} href={tr.url || "#"} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/4 border border-white/10 hover:bg-white/7 hover:border-[#FF0000]/25 transition-all group">
                                <div className="h-11 w-11 rounded-xl overflow-hidden bg-white/8 shrink-0">
                                    {tr.thumbnail ? <img src={tr.thumbnail} alt="" className="h-full w-full object-cover grayscale opacity-55 group-hover:grayscale-0 group-hover:opacity-100 transition-all" /> : <Music2 className="h-5 w-5 opacity-30 m-auto mt-3" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black truncate text-white/70 group-hover:text-white transition-colors">
                                        {decodeHtml(tr.title || "Unknown")}
                                    </p>
                                    <p className="mono text-[9px] text-white/55 uppercase truncate">{tr.artist || tr.channelTitle}</p>
                                </div>
                                <ExternalLink className="h-3.5 w-3.5 text-white/10 group-hover:text-[#FF0000] transition-all shrink-0" />
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
