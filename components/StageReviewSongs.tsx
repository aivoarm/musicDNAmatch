"use client";
import React from "react";
import { motion } from "framer-motion";
import { Music2, Youtube, AlertCircle, ArrowRight } from "lucide-react";
import { Stepper } from "./HomeUI";
import { decodeHtml } from "@/lib/utils";

interface ReviewSongsProps {
    fetchedSources: any;
    onNext: () => void;
    onBack: () => void;
}

export default function StageReviewSongs({ fetchedSources, onNext, onBack }: ReviewSongsProps) {
    const total = (fetchedSources?.spotifyTracks?.length ?? 0) + (fetchedSources?.youtubeTracks?.length ?? 0);

    return (
        <motion.div key="rs" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Stepper step={1} />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-6">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic mb-1">Found <span className="text-[#FF0000]">Tracks</span></h2>
                        <p className="mono text-[10px] text-white/55 uppercase tracking-[0.4em]">Review the tracks extracted from your sources</p>
                    </div>
                    <div className="glass p-7 rounded-[2.5rem] border border-white/14">
                        <div className="space-y-3 max-h-[50vh] overflow-y-auto sb pr-2">
                            {fetchedSources?.spotifyTracks?.map((t: any, i: number) => (
                                <div key={`sp-${i}`} className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5">
                                    {t.thumbnail ? <img src={t.thumbnail} className="w-10 h-10 object-cover rounded-lg" /> : <div className="w-10 h-10 bg-[#1DB954]/20 rounded-lg flex items-center justify-center"><Music2 className="w-4 h-4 text-[#1DB954]" /></div>}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-xs font-bold truncate mb-0.5">{t.title}</p>
                                        <p className="text-white/40 mono text-[9px] truncate">{t.artist}</p>
                                    </div>
                                    <div className="w-6 h-6 rounded-full bg-[#1DB954]/20 flex items-center justify-center shrink-0">
                                        <Music2 className="w-3 h-3 text-[#1DB954]" />
                                    </div>
                                </div>
                            ))}
                            {fetchedSources?.youtubeTracks?.map((t: any, i: number) => (
                                <div key={`yt-${i}`} className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5">
                                    {t.thumbnail ? <img src={t.thumbnail} className="w-10 h-10 object-cover rounded-lg" /> : <div className="w-10 h-10 bg-[#FF0000]/20 rounded-lg flex items-center justify-center"><Youtube className="w-4 h-4 text-[#FF0000]" /></div>}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-xs font-bold truncate mb-0.5">{decodeHtml(t.title)}</p>
                                        <p className="text-white/40 mono text-[9px] truncate">{t.artist}</p>
                                    </div>
                                    <div className="w-6 h-6 rounded-full bg-[#FF0000]/20 flex items-center justify-center shrink-0">
                                        <Youtube className="w-3 h-3 text-[#FF0000]" />
                                    </div>
                                </div>
                            ))}
                            {total === 0 && (
                                <div className="text-center py-10">
                                    <AlertCircle className="w-8 h-8 text-white/20 mx-auto mb-3" />
                                    <p className="text-white/40 mono text-[10px] uppercase">No tracks could be found from your sources</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-4 sticky top-24">
                    <div className="glass p-7 rounded-[2rem] border border-[#FF0000]/20 bg-[#FF0000]/5 flex flex-col gap-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-[0.3em] text-[#FF0000]">Extracted Tracks</span>
                            <span className="mono text-[10px] text-white/60">{total} total</span>
                        </div>
                        <p className="text-[10px] text-white/60 leading-relaxed font-bold">
                            These are the tracks we found from your connected sources. We will prioritize these to compute your DNA.
                        </p>
                        <button onClick={onNext} className="w-full bg-[#FF0000] text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-500 transition-all text-[11px] uppercase tracking-widest shadow-[0_0_20px_rgba(255,0,0,0.2)]">
                            Confirm Genres <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={onBack} className="mono text-[10px] text-white/45 hover:text-white transition-all uppercase tracking-widest mt-1">
                            ← Back to Sources
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
