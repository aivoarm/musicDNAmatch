"use client";
import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, Play, Activity, Mail, Sparkles, Star, UserCheck, Users, Brain } from "lucide-react";
import DNAHelix from "./DNAHelix";
import Ticker from "./Ticker";
import { RadarChart, DualRadarChart } from "./RadarCharts";

const DEMO_VECTOR = [0.8, 0.4, 0.9, 0.3, 0.2, 0.7, 0.85, 0.6, 0.4, 0.75, 0.4, 0.9];
const DEMO_MATCH_VECTOR = [0.75, 0.35, 0.8, 0.4, 0.3, 0.6, 0.9, 0.5, 0.5, 0.65, 0.5, 0.85];

interface LandingProps {
    onChoice: () => void;
    onArtist: () => void;
    existing?: any;
    refreshProfile: () => void;
}

export default function HomeLanding({ onChoice, onArtist, existing, refreshProfile }: LandingProps) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative w-full flex flex-col select-none overflow-x-hidden">
            {/* Visual Focal Point */}
            <div className="fixed inset-x-0 top-0 h-[60vh] md:h-[70vh] pointer-events-none opacity-40 overflow-hidden -z-20">
                <DNAHelix />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#080808]/50 to-[#080808]" />
            </div>

            {/* Ambient Background */}
            <div className="fixed inset-0 -z-30 bg-[#080808]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] md:h-[1000px] md:w-[1000px] blur-[150px] md:blur-[220px] rounded-full bg-[#FF0000]/5" />
            </div>

            {/* HERO SECTION */}
            <div className="min-h-[100svh] flex flex-col items-center justify-center p-4 md:p-6 text-center relative z-10 pt-16">
                <div className="max-w-4xl w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-8 md:mb-12"
                    >
                        <div className="flex flex-col items-center gap-4 mb-6 md:mb-8">
                            <img src="/icon.png" alt="MusicDNA Logo" className="h-16 w-16 md:h-24 md:w-24 mx-auto drop-shadow-[0_0_15px_rgba(255,0,0,0.5)]" />
                            <div className="flex items-center gap-2 bg-[#FF0000] text-white px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(255,0,0,0.3)]">
                                <div className="w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center">
                                    <Sparkles className="h-2 w-2 text-[#FF0000] fill-[#FF0000]" />
                                </div>
                                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">Artist Ecosystem</span>
                            </div>
                        </div>
                        <span className="mono text-[9px] md:text-[10px] text-[#FF0000] uppercase tracking-[0.3em] md:tracking-[0.5em] font-black mb-4 md:mb-6 block drop-shadow-sm">Signal Discovery Protocol</span>
                        <h1 className="text-5xl sm:text-6xl md:text-[6.8rem] font-black uppercase tracking-tighter italic mb-6 md:mb-8 leading-[0.9] text-white">
                            MUSIC<span className="text-[#FF0000]">DNA</span><br />
                            MATCH
                        </h1>
                        <p className="text-white/90 text-base sm:text-lg md:text-2xl font-bold tracking-tight max-w-2xl mx-auto italic leading-snug mb-6 md:mb-4 px-2">
                            Connect <span className="text-[#FF0000] underline decoration-white/20 underline-offset-4 md:underline-offset-8">Artists and Fans</span> through 12-dimensional <span className="text-white">Acoustic DNA</span> profiling.
                        </p>
                        <p className="mono text-[9px] md:text-[10px] text-white/50 uppercase tracking-[0.2em] md:tracking-[0.3em] font-medium px-4">
                            AI-Driven <span className="text-white/80">Spotify & YouTube analysis</span>
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4"
                    >
                        <button
                            onClick={existing ? () => { window.location.href = "/profile" } : onChoice}
                            className="w-full sm:w-auto overflow-hidden group relative bg-[#FF0000] text-white font-black py-4 px-8 md:py-6 md:px-12 rounded-full md:rounded-[2rem] text-xs md:text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(255,0,0,0.3)]"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500 hidden md:block" />
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <Play className="h-4 w-4 fill-white" />
                                {existing ? "My Profile" : "Calculate my DNA"}
                            </span>
                        </button>

                        <button
                            onClick={() => {
                                const el = document.getElementById("demo-radar");
                                if (el) el.scrollIntoView({ behavior: "smooth" });
                                else onChoice();
                            }}
                            className="w-full sm:w-auto overflow-hidden group relative bg-white/5 text-white/70 hover:text-white border border-white/10 hover:border-white/20 font-black py-4 px-8 md:py-6 md:px-12 rounded-full md:rounded-[2rem] text-xs md:text-sm uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                See How It Works
                            </span>
                            <ChevronRight className="h-4 w-4 md:h-5 md:w-5 relative z-10 md:group-hover:translate-y-1 transition-transform rotate-90" />
                        </button>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-50"
                >
                    <ChevronRight className="h-6 w-6 md:h-8 md:w-8 rotate-90 text-white" />
                </motion.div>
            </div>

            {/* DEMO SECTION: DNA RADAR */}
            <div id="demo-radar" className="py-16 md:py-24 px-4 sm:px-6 md:px-12 flex flex-col items-center justify-center min-h-[90svh] relative z-10 bg-[#080808]/80 backdrop-blur-xl border-t border-white/5 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
                <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="order-2 md:order-1 glass rounded-3xl md:rounded-[3rem] p-6 md:p-10 border border-white/10 shadow-2xl flex items-center justify-center w-full aspect-square md:aspect-auto">
                        <RadarChart vector={DEMO_VECTOR} />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="order-1 md:order-2 text-left">
                        <span className="mono text-[9px] md:text-[10px] text-[#FF0000] uppercase tracking-[0.3em] md:tracking-[0.5em] font-black mb-3 block">Neural Extraction</span>
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic mb-4 md:mb-6 text-white leading-tight">
                            Map Your <br />Sonic <span className="text-[#FF0000]">DNA</span>
                        </h2>
                        <p className="text-white/70 text-base md:text-lg font-bold leading-relaxed mb-6 md:mb-8">
                            We analyze your listening history across 12 unique dimensions—from Acousticness to Coherence, building a complex geometry of your exact musical taste.
                        </p>
                        <ul className="space-y-3 md:space-y-4 text-left">
                            {[
                                "Connect Spotify or YouTube profile",
                                "Bypass algorithmic noise and bias",
                                "Deep-scan historical listening data",
                                "Extract raw acoustic features (Tempo, Valence)",
                                "Generate your exact 12D vector map",
                                "Discover verified artists in your frequency"
                            ].map((text, i) => (
                                <li key={i} className="flex items-center gap-3 md:gap-4 text-white/90 text-[11px] md:text-xs lg:text-sm font-bold uppercase tracking-wider md:tracking-widest">
                                    <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-[#FF0000] shadow-[0_0_10px_rgba(255,0,0,0.8)] shrink-0" />
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>

            {/* DEMO SECTION: MATCHING */}
            <div className="py-16 md:py-24 px-4 sm:px-6 md:px-12 flex flex-col items-center justify-center min-h-[90svh] relative z-10 bg-[#050505]/95 border-t border-white/5 shadow-inner">
                <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-left">
                        <span className="mono text-[9px] md:text-[10px] text-[#3B82F6] uppercase tracking-[0.3em] md:tracking-[0.5em] font-black mb-3 block">Euclidean Match</span>
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic mb-4 md:mb-6 text-white leading-tight">
                            Discover <br /><span className="text-[#3B82F6]">Soulmates</span>
                        </h2>
                        <p className="text-white/70 text-base md:text-lg font-bold leading-relaxed mb-6">
                            We compute the mathematical distance between two DNA vectors to find true sonic resonance, going way beyond simple genre matching.
                        </p>
                        <div className="bg-white/5 border border-white/10 p-5 md:p-6 rounded-2xl flex flex-col items-start gap-2 md:gap-3">
                            <span className="mono text-[9px] md:text-[10px] text-white/50 uppercase tracking-[0.1em] md:tracking-[0.2em]">Signal Overlap</span>
                            <div className="flex items-end gap-2 md:gap-3 w-full">
                                <Activity className="h-6 w-6 md:h-8 md:w-8 text-[#3B82F6] mb-1" />
                                <span className="text-4xl md:text-5xl font-black italic text-white leading-none">92<span className="text-xl md:text-2xl">%</span></span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 md:gap-2 mt-2">
                                {["Resonance", "Coherence", "Shared Dims"].map((t, i) => (
                                    <span key={i} className="text-[8px] md:text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30">{t}</span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass rounded-3xl md:rounded-[3rem] p-6 md:p-10 border border-white/10 shadow-[0_0_80px_rgba(59,130,246,0.1)] flex items-center justify-center relative w-full aspect-square md:aspect-auto">
                        <DualRadarChart v1={DEMO_VECTOR} v2={DEMO_MATCH_VECTOR} c1="#FF0000" c2="#3B82F6" />
                    </motion.div>
                </div>
            </div>

            {/* SOULMATES PREVIEW */}
            <div className="py-16 md:py-24 px-4 sm:px-6 md:px-12 flex flex-col items-center justify-center min-h-[90svh] relative z-20 bg-black">
                <div className="max-w-4xl w-full">
                    <div className="glass p-6 md:p-8 rounded-3xl border border-white/10 mb-8 md:mb-12 relative overflow-hidden group text-center md:text-left">
                        <div className="absolute top-0 right-0 p-4 md:p-8 opacity-10 group-hover:opacity-30 transition-opacity hidden md:block">
                            <Brain size={80} className="text-white" />
                        </div>
                        <div className="flex flex-col gap-2 md:gap-4 relative z-10">
                            <h2 className="text-4xl sm:text-5xl md:text-[4rem] font-black uppercase tracking-tighter italic leading-none text-white">
                                MUSICAL <br className="md:hidden" /><span className="text-[#FF0000]">SOULMATES</span>
                            </h2>
                            <p className="mono text-[8px] md:text-[10px] text-white/50 uppercase tracking-[0.2em] md:tracking-[0.4em] mt-2 md:mt-0">DNA ALIGNMENT PREVIEW</p>
                        </div>
                    </div>

                    <div className="space-y-3 md:space-y-4">
                        {/* Mockup Profile: Artist */}
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-white/5 hover:border-[#FF0000]/20 transition-all group">
                            <div className="flex flex-row items-center gap-3 md:gap-4">
                                <div className="h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-[#FF0000] to-[#800000] flex items-center justify-center text-lg md:text-xl font-black text-white shadow-xl shadow-red-900/20 shrink-0">A</div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="flex items-center gap-2 md:gap-3 mb-1.5 flex-wrap">
                                        <h3 className="text-lg md:text-xl font-black text-white tracking-tight italic truncate">Arman Ayva</h3>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <div className="bg-[#FF0000] text-white flex items-center gap-1 px-1.5 py-0.5 rounded shadow-lg shadow-red-900/40">
                                                <Star size={8} className="fill-white" />
                                                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest">Artist</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-wrap hidden sm:flex">
                                        <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm bg-white/5 text-white/40 border border-white/10">Convergent</span>
                                        <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm bg-white/5 text-white/40 border border-white/10">Rock</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end shrink-0">
                                    <p className="text-xl md:text-2xl font-black italic text-white flex items-baseline gap-1">92<span className="text-[10px] md:text-xs text-white/40 font-black tracking-widest uppercase">sim</span></p>
                                    <div className="mt-1 md:mt-2 h-8 md:h-10 px-3 md:px-6 bg-[#1DB954] text-black font-black uppercase text-[9px] md:text-[10px] tracking-widest rounded-lg md:rounded-xl flex items-center gap-1.5 shadow-lg shadow-[#1DB954]/20 cursor-pointer">
                                        <UserCheck size={12} className="md:w-[14px] md:h-[14px]" /> <span className="hidden md:inline">Bridge</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Mockup Profile: Fan */}
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="glass p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-white/5 hover:border-white/20 transition-all opacity-70">
                            <div className="flex flex-row items-center gap-3 md:gap-4">
                                <div className="h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-lg md:text-xl font-black text-white/40 shrink-0">J</div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <h3 className="text-lg md:text-xl font-black text-white/80 tracking-tight italic truncate">Jackson</h3>
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-wrap hidden sm:flex">
                                        <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm bg-[#FF0000]/10 text-[#FF0000] border border-[#FF0000]/20">Resonant</span>
                                        <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm bg-white/5 text-white/40 border border-white/10">Pop</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end shrink-0">
                                    <p className="text-xl md:text-2xl font-black italic text-white/80 flex items-baseline gap-1">71<span className="text-[10px] md:text-xs text-white/40 font-black tracking-widest uppercase">sim</span></p>
                                    <div className="mt-1 md:mt-2 h-8 md:h-10 px-3 md:px-6 bg-white/20 md:bg-white text-white md:text-black font-black uppercase text-[9px] md:text-[10px] tracking-widest rounded-lg md:rounded-xl flex items-center gap-1.5 cursor-pointer hover:bg-white hover:text-black transition-colors">
                                        <Mail size={12} className="md:w-[14px] md:h-[14px]" /> <span className="hidden md:inline">Connect</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* DEMO SECTION: COLLABORATION */}
            <div className="py-16 md:py-24 px-4 sm:px-6 md:px-12 flex flex-col items-center justify-center min-h-[90svh] relative z-10 bg-[#080808]/80 backdrop-blur-xl border-t border-white/5 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
                <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
                    {/* Reordered for mobile - image/graphic often works better below text on narrow screens, but kept your structural order if preferred. */}
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="order-2 md:order-1 glass rounded-3xl md:rounded-[3rem] p-5 md:p-10 border border-white/10 shadow-[0_0_80px_rgba(255,165,0,0.05)] flex flex-col gap-4 relative">
                        <div className="flex items-center gap-3 border-b border-white/10 pb-3 md:pb-4 mb-1">
                            <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                                <Mail className="h-3.5 w-3.5 md:h-4 md:w-4 text-orange-500" />
                            </div>
                            <span className="text-white font-black italic uppercase tracking-widest text-base md:text-lg">Secure Intro</span>
                        </div>

                        <div className="bg-white/5 rounded-xl md:rounded-2xl p-4 md:p-5 border border-white/10">
                            <div className="flex items-center gap-3 mb-3 md:mb-4">
                                <div className="h-8 w-8 md:h-10 md:w-10 rounded-full border-2 border-[#080808] bg-[#3B82F6] flex items-center justify-center text-[8px] md:text-[10px] font-black text-white shrink-0">MCH</div>
                                <div className="min-w-0">
                                    <p className="text-[10px] md:text-xs font-black text-white uppercase tracking-widest truncate">Incoming Transmission</p>
                                    <p className="mono text-[8px] md:text-[9px] text-white/50 truncate">Via MusicDNA Secure Email</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs md:text-sm text-white/90 font-bold leading-relaxed">"We have a 92% match on the Euclidean DNA vector. Noticed we both heavily resonate with deep progressive house and melodic techno. Would love to share playlists!"</p>
                            </div>
                        </div>

                        <div className="mt-2 bg-orange-500/10 border border-orange-500/30 p-3 md:p-4 rounded-xl flex items-center gap-3 hover:bg-orange-500/20 transition-colors cursor-pointer">
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] md:text-xs font-black text-white uppercase tracking-widest truncate">Accept Connection</p>
                                <p className="mono text-[8px] md:text-[9px] text-white/50 truncate">Share email contact details</p>
                            </div>
                            <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-orange-500 shrink-0" />
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="order-1 md:order-2 text-left">
                        <span className="mono text-[9px] md:text-[10px] text-orange-500 uppercase tracking-[0.3em] md:tracking-[0.5em] font-black mb-3 block">Secure Handshake</span>
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic mb-4 md:mb-6 text-white leading-tight">
                            Connect <br /><span className="text-orange-500">Safely</span>
                        </h2>
                        <p className="text-white/70 text-base md:text-lg font-bold leading-relaxed mb-6">
                            Finding a match is just the beginning. We facilitate secure double-opt-in email introductions.
                        </p>
                        <ul className="space-y-3 md:space-y-4 text-left">
                            {[
                                "Double opt-in privacy",
                                "Secure email introductions",
                                "Protect your identity",
                            ].map((text, i) => (
                                <li key={i} className="flex items-center gap-3 md:gap-4 text-white/90 text-xs md:text-sm font-bold uppercase tracking-wider md:tracking-widest">
                                    <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(255,165,0,0.8)] shrink-0" />
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>

            {/* SEO FEATURE GRID / PROTOCOL CAPABILITIES */}
            <div className="py-16 md:py-24 px-4 sm:px-6 md:px-12 bg-[#050505] border-t border-white/5 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-10 md:mb-16">
                        <span className="mono text-[9px] md:text-[10px] text-[#FF0000] uppercase tracking-[0.3em] md:tracking-[0.5em] font-black mb-3 block text-center">System Capabilities</span>
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic text-white text-center">
                            PROTOCOL <span className="text-[#FF0000]">FEATURES</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {[
                            { title: "Spotify Integration", desc: "Sync and analyze public Spotify playlists to extract deep audio features and artist metadata." },
                            { title: "YouTube Analysis", desc: "Scan YouTube music videos and tracks to compute acoustic signals from visual and audio data." },
                            { title: "12D Vector Mapping", desc: "Generate a precise 12-dimensional coordinate of your musical taste based on AI-driven feature extraction." },
                            { title: "Soulmate Matching", desc: "Find users with congruent DNA using Euclidean distance algorithms for true sonic resonance." },
                            { title: "Artist Ecosystem", desc: "Verified artists can connect directly with their most resonant fans based on objective DNA alignment." },
                            { title: "Privacy First", desc: "Secure double-opt-in email introductions. You control who sees your profile and how you connect." }
                        ].map((feat, i) => (
                            <div key={i} className="glass p-6 md:p-8 rounded-2xl md:rounded-3xl border border-white/5 hover:border-white/10 transition-all">
                                <h3 className="text-white font-black uppercase tracking-widest text-xs md:text-sm mb-2 md:mb-3 italic">{feat.title}</h3>
                                <p className="text-white/50 text-[11px] md:text-xs leading-relaxed font-medium">{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CALL TO ACTION */}
            <div className="py-24 md:py-32 px-4 sm:px-6 flex flex-col items-center text-center relative z-10 border-t border-white/10 bg-[#000000] pb-32">
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[400px] w-[400px] md:h-[600px] md:w-[600px] blur-[100px] md:blur-[150px] rounded-full bg-[#FF0000]/10" />
                </div>
                <div className="relative z-10 max-w-2xl w-full flex flex-col items-center">
                    <img src="/icon.png" alt="MusicDNA Logo" className="h-12 w-12 md:h-16 md:w-16 mb-6 md:mb-8 opacity-80" />
                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic mb-4 md:mb-8 text-white leading-tight">
                        Ready to reveal your <br className="hidden md:block" />Musical Taste?
                    </h2>
                    <p className="text-white/60 text-base md:text-lg font-bold mb-8 md:mb-12 max-w-md">
                        Start scanning your library. Generate your acoustic DNA. Share your vector globally.
                    </p>

                    <button
                        onClick={existing ? () => { window.location.href = "/profile" } : onChoice}
                        className="w-full sm:w-auto overflow-hidden group relative bg-[#FF0000] text-white font-black py-4 px-8 md:py-6 md:px-16 rounded-full md:rounded-[2rem] text-sm md:text-base uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(255,0,0,0.4)] md:shadow-[0_0_50px_rgba(255,0,0,0.5)]"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500 hidden md:block" />
                        <span className="relative z-10 flex items-center justify-center gap-2 md:gap-3">
                            <Play className="h-4 w-4 md:h-5 md:w-5 fill-white" />
                            Calculate my DNA
                        </span>
                    </button>



                </div>

                {/* Ticker at the bottom */}
                <div className="absolute bottom-0 left-0 right-0 py-6 md:py-8">
                    <Ticker />
                </div>
            </div>
        </motion.div>
    );
}