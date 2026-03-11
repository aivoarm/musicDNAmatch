"use client";
import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface AnalyzingProps {
    progress: number;
    selPlaylists: any[];
    ytOk: any[];
}

export default function StageAnalyzing({ progress, selPlaylists, ytOk }: AnalyzingProps) {
    return (
        <motion.div key="an" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="text-center max-w-lg mx-auto py-10 md:py-20">
            <div className="relative h-44 w-44 mx-auto mb-10">
                <div className="absolute inset-0 rounded-full border-4 border-[#FF0000]/10" />
                <motion.div className="absolute inset-0 rounded-full border-4 border-t-[#FF0000] border-transparent" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                <motion.div className="absolute inset-4 rounded-full border-2 border-r-[#FF0000]/35 border-transparent" animate={{ rotate: -360 }} transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-[#FF0000] italic">{progress}%</span>
                    <span className="mono text-[9px] text-white/55 uppercase tracking-[0.3em] mt-1">QUANTIZING</span>
                </div>
            </div>
            <h2 className="text-3xl font-black text-white italic mb-3">Mapping your DNA</h2>
            <p className="text-white/65 font-medium max-w-xs mx-auto leading-relaxed text-sm mb-10">
                {selPlaylists.length > 0 && <a href="https://spotify.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#1DB954] transition-all underline decoration-[#1DB954]/30 underline-offset-4">{selPlaylists.length} playlist{selPlaylists.length !== 1 ? "s" : ""}</a>}
                {selPlaylists.length > 0 && ytOk.length > 0 && " + "}
                {ytOk.length > 0 && <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF0000] transition-all underline decoration-[#FF0000]/30 underline-offset-4">{ytOk.length} YouTube track{ytOk.length !== 1 ? "s" : ""}</a>}
                {" "}across 12 sonic dimensions
            </p>
            <div className="space-y-3 text-left max-w-[260px] mx-auto">
                {[
                    { l: "Genre vector computed", d: progress > 10, k: "genre" },
                    { l: <><a href="https://spotify.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#1DB954] transition-colors">Spotify</a> features extracted</>, d: progress > 40, skip: selPlaylists.length === 0, k: "spotify" },
                    { l: <><a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF0000] transition-colors">YouTube</a> signals processed</>, d: progress > 65, skip: ytOk.length === 0, k: "youtube" },
                    { l: "Combining signals", d: progress > 80, k: "combine" },
                    { l: "Generating narrative", d: progress >= 100, k: "narrative" },
                ].map(({ l, d, skip, k }) => skip ? null : (
                    <div key={k} className={`flex items-center gap-3 transition-all duration-500 ${d ? "opacity-100" : "opacity-40"}`}>
                        <div className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${d ? "border-[#FF0000] bg-[#FF0000]/25" : "border-white/30"}`}>
                            {d && <Check className="h-2.5 w-2.5 text-[#FF0000]" />}
                        </div>
                        <span className="mono text-[9px] text-white/80 uppercase tracking-widest">{l}</span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
