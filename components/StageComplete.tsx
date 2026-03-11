"use client";
import React from "react";
import { motion } from "framer-motion";
import { Fingerprint, ArrowRight, Users, User, Brain, Music2, ExternalLink, ChevronRight } from "lucide-react";
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
        <motion.div key="co" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 md:space-y-6 w-full pb-16 md:pb-20 px-2 sm:px-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
                {/* RIGHT COLUMN: STATS & CTAS */}
                <div className="space-y-4 md:space-y-5 flex flex-col">
                    {/* ENHANCED SHARE CTA */}
                    <div className="p-[2px] rounded-3xl bg-gradient-to-br from-[#FF0000] via-[#FF0000]/20 to-[#FF0000] shadow-[0_0_30px_rgba(255,0,0,0.2)]">
                        <div className="bg-black rounded-[calc(1.5rem-1px)] overflow-hidden">
                            <ShareDNACard profile={dna} />
                        </div>
                    </div>

                    <div className="glass rounded-3xl md:rounded-[2.5rem] p-5 md:p-8 border border-[#FF0000]/20 bg-[#FF0000]/5 flex flex-col">
                        <div className="flex items-center justify-between mb-4 md:mb-5">
                            <span className="mono text-[9px] md:text-[10px] text-[#FF0000] uppercase tracking-widest font-black flex items-center gap-1.5 md:gap-2">
                                <Fingerprint className="h-3 w-3 md:h-4 md:w-4" />Neural Fingerprint
                            </span>
                            <span className="mono text-[8px] md:text-[9px] text-white/50">12,492 nodes</span>
                        </div>

                        {/* Fixed Text Truncation Here */}
                        <div className="flex items-end justify-between border-b border-white/20 pb-4 md:pb-5 mb-4 md:mb-5 gap-3">
                            <div className="flex flex-col min-w-0 flex-1">
                                <p className="mono text-[8px] md:text-[9px] text-white/40 uppercase tracking-widest mb-1 md:mb-1.5">Authenticated As</p>
                                <h4 className="text-lg md:text-xl font-black text-white italic truncate">{dna.display_name}</h4>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="mono text-2xl md:text-3xl font-black text-[#FF0000] leading-none mb-1">{((dna.coherence_index ?? 0.8) * 100).toFixed(1)}%</p>
                                <p className="mono text-[8px] md:text-[9px] text-white/80 uppercase tracking-widest">Coherence</p>
                            </div>
                        </div>

                        <div className="space-y-5 md:space-y-6 mb-5 md:mb-7">
                            <div>
                                <p className="mono text-[8px] md:text-[9px] text-white/60 uppercase tracking-[0.2em] mb-2.5 md:mb-3">Seed Identity</p>
                                <div className="flex flex-wrap gap-1.5 md:gap-2">
                                    {(dna.top_genres || []).map((g: string, i: number) => (
                                        <span key={g + i} className="bg-white/10 border border-white/20 text-white/90 px-2.5 py-1 md:px-3 md:py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest">{g}</span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="mono text-[8px] md:text-[9px] text-[#FF0000]/80 uppercase tracking-[0.2em] mb-2.5 md:mb-3">Dominant Dimensions</p>
                                <div className="flex flex-wrap gap-1.5 md:gap-2">
                                    {(dna.axes || AXIS_LABELS).map((label: string, i: number) => ({ label, value: dna.vector?.[i] || 0 }))
                                        .sort((a: any, b: any) => b.value - a.value)
                                        .slice(0, 3)
                                        .map((axis: any, i: number) => (
                                            <span key={axis.label} className="bg-[#FF0000]/10 border border-[#FF0000]/20 text-[#FF0000] px-2.5 py-1 md:px-3 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(255,0,0,0.15)]">
                                                {axis.label.replace(/_/g, " ")}
                                            </span>
                                        ))}
                                </div>
                            </div>
                        </div>

                        {/* Moved this block out to align with standard metrics */}
                        <div className="grid grid-cols-2 gap-2 md:gap-3 mt-auto">
                            {[["Vector Dist", "0.198"], ["Dimensions", "12D"]].map(([k, v]) => (
                                <div key={k} className="bg-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/10">
                                    <p className="mono text-[8px] md:text-[9px] text-white/60 uppercase tracking-widest mb-1 md:mb-1.5">{k}</p>
                                    <p className="mono text-lg md:text-xl font-black text-white">{v}</p>
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
                        className="relative flex items-center justify-between w-full bg-[#FF0000] p-5 md:p-6 rounded-2xl md:rounded-[2rem] font-black text-white uppercase tracking-[0.15em] md:tracking-[0.2em] text-base md:text-lg hover:scale-[1.01] active:scale-95 transition-all shadow-[0_10px_40px_rgba(255,0,0,0.4)] overflow-hidden group mt-2"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full shimmer pointer-events-none" />
                        <span className="flex items-center gap-2.5 md:gap-3 relative z-10"><Users className="h-5 w-5 md:h-6 md:w-6 fill-white" />Find Soulmates</span>
                        <ChevronRight className="h-5 w-5 md:h-7 md:w-7 group-hover:translate-x-2 transition-transform relative z-10" />
                    </button>

                    <div className="grid grid-cols-2 gap-3 md:gap-4 mt-2">
                        <Link href="/profile"
                            className="relative w-full overflow-hidden flex items-center justify-center gap-2 border border-[#FF0000]/20 bg-black/40 text-white hover:border-[#FF0000]/40 font-black text-[9px] md:text-xs uppercase tracking-[0.1em] md:tracking-[0.2em] py-4 md:py-5 rounded-xl md:rounded-2xl hover:scale-[1.01] active:scale-95 transition-all group">
                            <User className="h-4 w-4 md:h-5 md:w-5 text-white/70 group-hover:text-white transition-colors relative z-10" />
                            <span className="relative z-10 text-center">Full Profile</span>
                        </Link>

                        <button onClick={onRestart} className="relative w-full overflow-hidden flex items-center justify-center gap-2 border border-white/10 bg-black/40 text-white/70 hover:text-white hover:border-white/30 font-black text-[9px] md:text-xs uppercase tracking-[0.1em] md:tracking-[0.2em] py-4 md:py-5 rounded-xl md:rounded-2xl hover:scale-[1.01] active:scale-95 transition-all">
                            <span className="text-lg leading-none mt-[-2px]">↺</span>
                            <span className="text-center">New Scan</span>
                        </button>
                    </div>
                </div>

                {/* LEFT COLUMN: DNA BARS */}
                <div className="space-y-4 md:space-y-5">

                    <div className="glass rounded-3xl md:rounded-[2.5rem] p-5 md:p-10 border border-white/10 flex flex-col">
                        <p className="mono text-[9px] md:text-[10px] text-white/60 uppercase tracking-widest mb-5 md:mb-7">Structural Map Vector — 12 Dimensions</p>
                        <div className="space-y-3 md:space-y-4 max-h-[350px] md:max-h-[420px] overflow-y-auto sb pr-1 md:pr-2 flex-1">
                            {(dna.axes || AXIS_LABELS).map((axis: string, i: number) => (
                                <DnaBar key={axis} label={axis.replace(/_/g, " ")} value={dna.vector?.[i] ?? 0} red={i % 2 === 0} />
                            ))}
                        </div>
                    </div>
                </div>

            </div>


            {dna.narrative && (
                <div className="glass rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 border border-white/20">
                    <p className="mono text-[9px] md:text-[10px] text-[#FF0000] uppercase tracking-[0.3em] md:tracking-[0.4em] mb-4 md:mb-5 font-black flex items-center gap-2"><Brain className="h-3.5 w-3.5" />Your Personalized Narrative</p>
                    <p className="text-white/90 font-medium leading-relaxed text-xs md:text-sm">{dna.narrative}</p>
                </div>
            )}

            <div className="glass rounded-3xl md:rounded-[2.5rem] p-6 md:p-12 border border-[#FF0000]/20 bg-[#FF0000]/5 overflow-hidden relative">
                <div className="absolute top-[-10%] right-[-5%] p-10 opacity-[0.03] md:opacity-[0.05] pointer-events-none">
                    <Brain className="h-40 w-40 md:h-56 md:w-56 text-[#FF0000]" />
                </div>
                <div className="relative z-10">
                    <p className="mono text-[9px] md:text-[10px] text-[#FF0000] uppercase tracking-[0.3em] md:tracking-[0.4em] mb-6 md:mb-8 font-black flex items-center gap-2">
                        🎯 Profile Interpretation
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                        <div>
                            <h3 className="text-white font-black text-[10px] md:text-xs uppercase tracking-[0.15em] md:tracking-[0.2em] mb-4 md:mb-6 opacity-60">This radar suggests someone who likes:</h3>
                            <ul className="space-y-3 md:space-y-4">
                                {generateInterpretation(dna.vector).characteristics.map((c: string, i: number) => (
                                    <li key={i} className="flex items-start md:items-center gap-3 md:gap-4 text-white/80 text-xs md:text-sm font-bold italic tracking-tight transition-all hover:translate-x-1">
                                        <div className="h-1.5 w-1.5 rounded-full bg-[#FF0000]/80 shadow-[0_0_8px_rgba(255,0,0,0.5)] mt-1.5 md:mt-0 shrink-0" />
                                        <span>{c}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-white font-black text-[10px] md:text-xs uppercase tracking-[0.15em] md:tracking-[0.2em] mb-4 md:mb-6 opacity-60">That combination strongly aligns with:</h3>
                            <div className="flex flex-wrap gap-2 md:gap-2.5">
                                {generateInterpretation(dna.vector).genreMatches.map((g: string, i: number) => (
                                    <span key={i} className="bg-white/5 border border-white/10 text-white/90 px-3 py-1.5 md:px-5 md:py-2.5 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] shadow-lg">
                                        {g}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {dna.recent_tracks?.length > 0 && (
                <div className="glass rounded-3xl md:rounded-[2.5rem] p-5 md:p-7 border border-white/10">
                    <p className="mono text-[9px] md:text-[10px] text-white/50 uppercase tracking-[0.2em] md:tracking-[0.4em] mb-4 md:mb-5 truncate">
                        Captured Signals (<a href="https://spotify.com" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-[#1DB954] transition-colors">Spotify</a> / <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-[#FF0000] transition-colors">YouTube</a>) — {dna.recent_tracks.length} tracks
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                        {dna.recent_tracks.map((tr: any, i: number) => (
                            <a key={tr.id + i} href={tr.url || "#"} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 md:p-3.5 rounded-xl md:rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-[#FF0000]/30 transition-all group">
                                <div className="h-10 w-10 md:h-11 md:w-11 rounded-lg md:rounded-xl overflow-hidden bg-white/5 shrink-0 flex items-center justify-center">
                                    {tr.thumbnail ? <img src={tr.thumbnail} alt="" className="h-full w-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all" /> : <Music2 className="h-4 w-4 md:h-5 md:w-5 opacity-30" />}
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <p className="text-[11px] md:text-xs font-black truncate text-white/80 group-hover:text-white transition-colors">
                                        {decodeHtml(tr.title || "Unknown")}
                                    </p>
                                    <p className="mono text-[8px] md:text-[9px] text-white/40 uppercase truncate mt-0.5">{tr.artist || tr.channelTitle}</p>
                                </div>
                                <ExternalLink className="h-3 w-3 md:h-3.5 md:w-3.5 text-white/20 group-hover:text-[#FF0000] transition-all shrink-0" />
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}