"use client";
import React from "react";
import { motion } from "framer-motion";
import { Music2, Youtube, ArrowRight, AlertCircle } from "lucide-react";
import { Stepper } from "./HomeUI";
import { decodeHtml } from "@/lib/utils";

interface GenreSelectionProps {
    genres: string[];
    setGenres: React.Dispatch<React.SetStateAction<string[]>>;
    matchedGenres: string[];
    availableGenres: string[];
    fetchedSources: any;
    onNext: () => void;
    onBack: () => void;
}

export default function StageGenreSelection({ 
    genres, setGenres, matchedGenres, availableGenres, fetchedSources, onNext, onBack 
}: GenreSelectionProps) {
    return (
        <motion.div key="gs" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Stepper step={2} />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-6">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic mb-1">Sonic <span className="text-[#FF0000]">Library</span></h2>
                        <p className="mono text-[10px] text-white/55 uppercase tracking-[0.4em]">Select genres — 40% of your DNA weight</p>
                    </div>
                    <div className="glass p-7 rounded-[2.5rem] border border-white/14">
                        <div className="flex flex-wrap gap-2.5">
                            {availableGenres.map(g => {
                                const on = genres.includes(g);
                                const matched = matchedGenres.includes(g);
                                return (
                                    <button key={g} onClick={() => setGenres(p => p.includes(g) ? p.filter(x => x !== g) : [...p, g])}
                                        className={`rounded-full border font-black uppercase text-[10px] py-2.5 px-5 tracking-widest transition-all duration-150 relative ${on ? "bg-[#FF0000] text-white border-[#FF0000] shadow-[0_0_18px_rgba(255,0,0,0.35)]" : "bg-white/10 border-white/20 text-white/80 hover:border-[#FF0000]/60 hover:text-white"}`}>
                                        {g}
                                        {matched && !on && (
                                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FF0000] rounded-full border-2 border-[#121212]" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {((fetchedSources?.spotifyTracks?.length ?? 0) > 0 || (fetchedSources?.youtubeTracks?.length ?? 0) > 0) && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="mono text-[10px] text-white/40 uppercase tracking-[0.3em]">Extracted Signals (Top Tracks)</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {fetchedSources?.spotifyTracks?.slice(0, 4).map((t: any, i: number) => (
                                    <div key={`sp-${i}`} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 border-l-[#1DB954] border-l-2">
                                        <Music2 className="h-4 w-4 text-[#1DB954] shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] text-white font-black truncate">{t.title}</p>
                                            <p className="text-[9px] text-white/40 mono truncate uppercase">{t.artist}</p>
                                        </div>
                                    </div>
                                ))}
                                {fetchedSources?.youtubeTracks?.slice(0, 4).map((t: any, i: number) => (
                                    <div key={`yt-${i}`} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 border-l-[#FF0000] border-l-2">
                                        <Youtube className="h-4 w-4 text-[#FF0000] shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] text-white font-black truncate">{decodeHtml(t.title)}</p>
                                            <p className="text-[9px] text-white/40 mono truncate uppercase">{t.artist}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-4 sticky top-24">
                    <div className="glass p-7 rounded-[2rem] border border-[#FF0000]/20 bg-[#FF0000]/5 flex flex-col gap-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-[0.3em] text-[#FF0000]">Genre Selection</span>
                            <span className="mono text-[10px] text-white/60">{genres.length} selected</span>
                        </div>
                        <p className="text-[10px] text-white/60 leading-relaxed font-bold">
                            Your self-selected genres provide the "ground truth" for our vector mapping, mixed with audio feature analysis.
                        </p>
                        {((fetchedSources?.spotifyTracks?.length ?? 0) === 0 && (fetchedSources?.youtubeTracks?.length ?? 0) === 0) && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex gap-2 items-start">
                                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                <p className="text-[9px] text-red-400 font-bold uppercase tracking-wider leading-relaxed">
                                    At least one Spotify playlist or YouTube track is required to compute your unique DNA.
                                </p>
                            </div>
                        )}
                        <button 
                            disabled={genres.length === 0 || ((fetchedSources?.spotifyTracks?.length ?? 0) === 0 && (fetchedSources?.youtubeTracks?.length ?? 0) === 0)}
                            onClick={onNext} 
                            className="w-full bg-[#FF0000] text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-500 transition-all text-[11px] uppercase tracking-widest shadow-[0_0_20px_rgba(255,0,0,0.2)] disabled:opacity-30 disabled:cursor-not-allowed">
                            Analyze Frequency <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={onBack} className="mono text-[10px] text-white/45 hover:text-white transition-all uppercase tracking-widest mt-1">
                            ← Back to Tracks
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
