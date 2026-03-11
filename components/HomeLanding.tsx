"use client";
import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, Play, Activity, Mail } from "lucide-react";
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
            <div className="fixed inset-x-0 top-0 h-[70vh] pointer-events-none opacity-40 overflow-hidden -z-20">
                <DNAHelix />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#080808]/50 to-[#080808]" />
            </div>

            {/* Ambient Background */}
            <div className="fixed inset-0 -z-30 bg-[#080808]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[1000px] w-[1000px] blur-[220px] rounded-full bg-[#FF0000]/5" />
            </div>

            {/* HERO SECTION */}
            <div className="min-h-[100svh] flex flex-col items-center justify-center p-6 text-center relative z-10">
                <div className="max-w-4xl w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-12"
                    >
                        <img src="/icon.png" alt="MusicDNA Logo" className="h-24 w-24 mx-auto mb-8 drop-shadow-[0_0_20px_rgba(255,0,0,0.5)]" />
                        <span className="mono text-[10px] text-[#FF0000] uppercase tracking-[0.5em] font-black mb-6 block drop-shadow-sm">Signal Discovery Protocol</span>
                        <h1 className="text-[10vw] md:text-[6.8rem] font-black uppercase tracking-tighter italic mb-8 leading-[0.85] text-white">
                            MUSIC<span className="text-[#FF0000]">DNA</span><br />
                            MATCH
                        </h1>
                        <p className="text-white/90 text-xl md:text-2xl font-bold tracking-tight max-w-2xl mx-auto italic leading-tight mb-4">
                            Discover your 12-dimensional musical fingerprint and find your sonic soulmates.
                        </p>
                        <p className="mono text-[10px] text-white/50 uppercase tracking-[0.3em] font-medium">
                            Analyzed at the speed of sound via Neural Scanning.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-5 justify-center items-center"
                    >
                        <button
                            onClick={() => {
                                const el = document.getElementById("demo-radar");
                                if (el) el.scrollIntoView({ behavior: "smooth" });
                                else onChoice();
                            }}
                            className="w-full sm:w-auto overflow-hidden group relative bg-white text-black font-black py-6 px-12 rounded-[2rem] text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 shadow-2xl"
                        >
                            <div className="absolute inset-0 bg-[#FF0000]/10 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                See How It Works
                            </span>
                            <ChevronRight className="h-5 w-5 relative z-10 group-hover:translate-y-1 transition-transform rotate-90" />
                        </button>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-50"
                >
                    <ChevronRight className="h-8 w-8 rotate-90 text-white" />
                </motion.div>
            </div>

            {/* DEMO SECTION: DNA RADAR */}
            <div id="demo-radar" className="py-24 px-6 md:px-12 flex flex-col items-center justify-center min-h-[90svh] relative z-10 bg-[#080808]/80 backdrop-blur-xl border-t border-white/5 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
                <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-2 md:order-1 glass rounded-[3rem] p-10 border border-white/10 shadow-2xl flex items-center justify-center">
                        <RadarChart vector={DEMO_VECTOR} />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-1 md:order-2 text-center md:text-left">
                        <span className="mono text-[10px] text-[#FF0000] uppercase tracking-[0.5em] font-black mb-4 block">Neural Extraction</span>
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic mb-6 text-white">
                            Map Your <br />Sonic <span className="text-[#FF0000]">DNA</span>
                        </h2>
                        <p className="text-white/70 text-lg font-bold leading-relaxed mb-8">
                            We don't just look at Top 40 genres. We analyze your listening history across 12 unique dimensions—from Acousticness to Coherence, building a complex geometry of your exact musical taste.
                        </p>
                        <ul className="space-y-4 text-left inline-block md:block mb-8">
                            {[
                                "Connect Spotify, YouTube or Last.fm",
                                "Deep scan of top tracks & tags",
                                "Extract underlying audio features",
                                "Generate your 12D vector map",
                            ].map((text, i) => (
                                <li key={i} className="flex items-center gap-4 text-white/90 text-sm font-bold uppercase tracking-widest">
                                    <div className="h-2 w-2 rounded-full bg-[#FF0000] shadow-[0_0_10px_rgba(255,0,0,0.8)]" />
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>

            {/* DEMO SECTION: MATCHING */}
            <div className="py-24 px-6 md:px-12 flex flex-col items-center justify-center min-h-[90svh] relative z-10 bg-[#050505]/95 border-t border-white/5 shadow-inner">
                <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="text-center md:text-left">
                        <span className="mono text-[10px] text-[#3B82F6] uppercase tracking-[0.5em] font-black mb-4 block">Euclidean Match Protocol</span>
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic mb-6 text-white">
                            Discover <br /><span className="text-[#3B82F6]">Soulmates</span>
                        </h2>
                        <p className="text-white/70 text-lg font-bold leading-relaxed mb-6">
                            Finding someone with the exact same taste isn't just about matching genres. We compute the mathematical distance between two DNA vectors to find true sonic resonance.
                        </p>
                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-start gap-3">
                            <span className="mono text-[10px] text-white/50 uppercase tracking-[0.2em]">Signal Overlap Detected</span>
                            <div className="flex items-end gap-3 w-full">
                                <Activity className="h-8 w-8 text-[#3B82F6] mb-1" />
                                <span className="text-5xl font-black italic text-white leading-none">92<span className="text-2xl">%</span></span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {["Convergent Resonance", "High Coherence", "Shared Dimensions"].map((t, i) => (
                                    <span key={i} className="text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-sm bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30">{t}</span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass rounded-[3rem] p-10 border border-white/10 shadow-[0_0_80px_rgba(59,130,246,0.1)] flex items-center justify-center relative">
                        <DualRadarChart v1={DEMO_VECTOR} v2={DEMO_MATCH_VECTOR} c1="#FF0000" c2="#3B82F6" />
                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-[#FF0000]" />
                                <span className="mono text-[10px] text-white/80 font-black uppercase tracking-widest">You</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-[#3B82F6]" />
                                <span className="mono text-[10px] text-white/80 font-black uppercase tracking-widest">Soulmate</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* DEMO SECTION: COLLABORATION */}
            <div className="py-24 px-6 md:px-12 flex flex-col items-center justify-center min-h-[90svh] relative z-10 bg-[#080808]/80 backdrop-blur-xl border-t border-white/5 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
                <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-2 md:order-1 glass rounded-[3rem] p-8 md:p-10 border border-white/10 shadow-[0_0_80px_rgba(255,165,0,0.05)] flex flex-col gap-5 relative">
                        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-2">
                            <div className="h-8 w-8 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                                <Mail className="h-4 w-4 text-orange-500" />
                            </div>
                            <span className="text-white font-black italic uppercase tracking-widest text-lg">Secure Intro</span>
                        </div>

                        <div className="bg-white/5 rounded-2xl p-5 border border-white/10 mt-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-full border-2 border-[#080808] bg-[#3B82F6] flex items-center justify-center text-[10px] font-black text-white">MCH</div>
                                <div>
                                    <p className="text-xs font-black text-white uppercase tracking-widest">Incoming Transmission</p>
                                    <p className="mono text-[9px] text-white/50">Via MusicDNA Secure Email</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <p className="text-sm text-white/90 font-bold leading-relaxed">"We have a 92% match on the Euclidean DNA vector. Noticed we both heavily resonate with deep progressive house and melodic techno. Would love to share playlists!"</p>
                            </div>
                        </div>

                        <div className="mt-4 bg-orange-500/10 border border-orange-500/30 p-4 rounded-xl flex items-center gap-4 hover:bg-orange-500/20 transition-colors cursor-pointer">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-black text-white uppercase tracking-widest">Accept Connection</p>
                                <p className="mono text-[9px] text-white/50">Share email contact details</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-orange-500" />
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-1 md:order-2 text-center md:text-left">
                        <span className="mono text-[10px] text-orange-500 uppercase tracking-[0.5em] font-black mb-4 block">Secure Handshake</span>
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic mb-6 text-white">
                            Connect <br /><span className="text-orange-500">Safely</span>
                        </h2>
                        <p className="text-white/70 text-lg font-bold leading-relaxed mb-6">
                            Finding a match is just the beginning. We facilitate secure double-opt-in email introductions so you can connect with your musical soulmates on your own terms.
                        </p>
                        <ul className="space-y-4 text-left inline-block md:block">
                            {[
                                "Double opt-in privacy",
                                "Secure email introductions",
                                "Protect your identity",
                                "Connect meaningfully",
                            ].map((text, i) => (
                                <li key={i} className="flex items-center gap-4 text-white/90 text-sm font-bold uppercase tracking-widest">
                                    <div className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(255,165,0,0.8)] shrink-0" />
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>

            {/* CALL TO ACTION */}
            <div className="py-32 px-6 flex flex-col items-center text-center relative z-10 border-t border-white/10 bg-[#000000]">
                <div className="absolute inset-0 z-0">
                    <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[600px] w-[600px] blur-[150px] rounded-full bg-[#FF0000]/10" />
                </div>
                <div className="relative z-10 max-w-2xl w-full">
                    <img src="/icon.png" alt="MusicDNA Logo" className="h-16 w-16 mx-auto mb-8 opacity-80" />
                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic mb-8 text-white">
                        What to reveal your <br />Musical Taste ?
                    </h2>
                    <p className="text-white/60 text-lg font-bold mb-12">
                        Start scanning your library. Generate your acoustic DNA. Share your vector globally.
                    </p>

                    <button
                        onClick={existing ? () => { window.location.href = "/profile" } : onChoice}
                        className="w-full sm:w-auto overflow-hidden group relative bg-[#FF0000] text-white font-black py-6 px-16 rounded-[2rem] text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 shadow-[0_0_50px_rgba(255,0,0,0.5)] mx-auto"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                        <span className="relative z-10 flex items-center justify-center gap-3">
                            <Play className="h-4 w-4 fill-white" />
                            Calculate my DNA
                        </span>
                    </button>

                    <button
                        onClick={onArtist}
                        className="mt-8 group text-white/40 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all inline-flex items-center gap-2"
                    >
                        <Activity className="h-3 w-3" /> or connect as an artist
                    </button>

                </div>

                {/* Ticker at the bottom */}
                <div className="absolute bottom-0 left-0 right-0 py-8">
                    <Ticker />
                </div>
            </div>
        </motion.div>
    );
}
