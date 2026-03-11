"use client";

import React, { useState } from "react";
import {
    Youtube,
    Loader2,
    Play,
    X,
    ExternalLink,
    HelpCircle,
    Monitor,
    Smartphone,
    ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { decodeHtml } from "@/lib/utils";

interface StageSourceYoutubeProps {
    ytQuery: string;
    setYtQuery: (v: string) => void;
    ytSearching: boolean;
    ytResults: any[];
    ytShowSearch: boolean;
    setYtShowSearch: (v: boolean) => void;
    searchYt: (q: string) => void;
    magicFillSlots: (v: any, e: any) => void;
    ytTracks: any[];
    setYtTracks: React.Dispatch<React.SetStateAction<any[]>>;
    onNext: () => void; // Added onNext to match Spotify
}

export function StageSourceYoutube({
    ytQuery,
    setYtQuery,
    ytSearching,
    ytResults,
    ytShowSearch,
    setYtShowSearch,
    searchYt,
    magicFillSlots,
    ytTracks,
    setYtTracks,
    onNext
}: StageSourceYoutubeProps) {
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [ytHelpOpen, setYtHelpOpen] = useState(false);

    const extractVideoId = (url: string) => {
        if (!url) return null;
        const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
        return match ? match[1] : null;
    };

    // Check if user has added at least one YouTube track
    const hasSelectedTracks = ytTracks.some((t) => t.status !== "idle" && t.url);

    return (
        <div className="glass p-4 sm:p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#FF0000]/10 border border-[#FF0000]/20 flex items-center justify-center shrink-0">
                        <Youtube className="h-5 w-5 text-[#FF0000]" />
                    </div>
                    <h2 className="text-xl font-black tracking-tight">YouTube</h2>
                    <a
                        href="https://www.youtube.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white/5 hover:bg-[#FF0000]/20 border border-white/10 hover:border-[#FF0000]/40 rounded-lg transition-all text-white/30 hover:text-[#FF0000]"
                        title="Open YouTube"
                    >
                        <ExternalLink size={14} />
                    </a>
                </div>
                <button
                    onClick={() => setYtHelpOpen(!ytHelpOpen)}
                    className={`p-2.5 rounded-xl transition-all active:scale-95 ${ytHelpOpen ? "bg-[#FF0000] text-white shadow-lg shadow-[#FF0000]/20" : "bg-white/5 text-white/50 hover:text-white hover:bg-white/10 border border-white/5"}`}
                >
                    <HelpCircle size={18} />
                </button>
            </div>

            <AnimatePresence>
                {ytHelpOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-black/30 border border-white/5 rounded-2xl p-4 sm:p-5 space-y-4 mb-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Monitor className="h-3 w-3 text-[#FF0000]" />
                                        <span className="text-white font-black uppercase text-[10px] tracking-wider">Search Tips</span>
                                    </div>
                                    <ul className="space-y-2">
                                        {["Type Artist + Song Name", "Look for Official Audio", "Check song duration"].map((s, i) => (
                                            <li key={i} className="text-[11px] text-white/60 flex gap-2">
                                                <span className="text-[#FF0000] font-bold">•</span> {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Smartphone className="h-3 w-3 text-[#FF0000]" />
                                        <span className="text-white font-black uppercase text-[10px] tracking-wider">Sharing</span>
                                    </div>
                                    <ul className="space-y-2">
                                        {["Tap 'Share'", "Copy Link", "Paste in search box"].map((s, i) => (
                                            <li key={i} className="text-[11px] text-white/60 flex gap-2">
                                                <span className="text-[#FF0000] font-bold">•</span> {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-4">
                <div className="flex items-center bg-black/40 border border-white/10 rounded-2xl p-1.5 focus-within:border-[#FF0000]/50 focus-within:ring-1 focus-within:ring-[#FF0000]/20 transition-all">
                    <input
                        value={ytQuery}
                        onChange={(e) => setYtQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && searchYt(ytQuery)}
                        placeholder="Search for a song..."
                        className="flex-1 bg-transparent px-3 py-2 text-[16px] sm:text-sm text-white placeholder:text-white/30 focus:outline-none min-w-0"
                    />
                    <button
                        onClick={() => searchYt(ytQuery)}
                        disabled={!ytQuery || ytSearching}
                        className="h-10 sm:h-11 px-4 sm:px-6 mr-0.5 bg-[#FF0000] hover:bg-[#ff3333] disabled:bg-white/10 disabled:text-white/30 rounded-xl text-white font-black transition-all flex items-center justify-center min-w-[90px] active:scale-95 text-sm"
                    >
                        {ytSearching ? <Loader2 className="animate-spin w-4 h-4" /> : "Search"}
                    </button>
                </div>

                {/* Big Action Button matched to Spotify logic */}
                {!hasSelectedTracks ? (
                    !ytSearching && (
                        <button
                            onClick={onNext}
                            className="w-full py-4 px-6 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all text-xs font-bold uppercase tracking-widest active:scale-[0.98]"
                        >
                            I don't have YouTube tracks
                        </button>
                    )
                ) : (
                    <button
                        onClick={onNext}
                        className="w-full py-4 px-6 bg-[#FF0000]/10 border border-[#FF0000]/30 rounded-2xl text-[#FF0000] hover:bg-[#FF0000]/20 transition-all text-xs font-black uppercase tracking-[0.2em] active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        Continue to Step 2 <ArrowRight size={14} />
                    </button>
                )}
            </div>

            {/* Selected Tracks Horizontal List */}
            <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                {ytTracks.map((tr, idx) => {
                    const videoId = tr.url ? extractVideoId(tr.url) : null;
                    const isPlaying = playingId === tr.id || (videoId && playingId === videoId);
                    const isEmpty = tr.status === "idle" || !tr.url;

                    return (
                        <div
                            key={idx}
                            className={`w-[240px] sm:w-64 shrink-0 snap-center rounded-2xl overflow-hidden flex flex-col transition-all ${isEmpty
                                ? "border-2 border-dashed border-white/10 bg-white/5 opacity-60"
                                : "border border-white/10 bg-white/5"
                                }`}
                        >
                            <div className="relative aspect-video bg-black/40">
                                {isEmpty ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20">
                                        <Youtube className="w-8 h-8 mb-2 opacity-50" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Empty Slot</span>
                                    </div>
                                ) : isPlaying && videoId ? (
                                    <iframe
                                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                                        className="absolute inset-0 w-full h-full"
                                        allow="autoplay; encrypted-media"
                                        allowFullScreen
                                    />
                                ) : (
                                    <>
                                        <img
                                            src={tr.thumbnail}
                                            className="w-full h-full object-cover opacity-80"
                                            alt={tr.title}
                                        />
                                        <button
                                            onClick={() => setPlayingId(videoId || tr.id)}
                                            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors group"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-[#FF0000]/90 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                <Play size={20} className="fill-white ml-1" />
                                            </div>
                                        </button>
                                    </>
                                )}

                                {isPlaying && !isEmpty && (
                                    <button
                                        onClick={() => setPlayingId(null)}
                                        className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-md rounded-full text-white/70 hover:text-white transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>

                            <div className="p-3 sm:p-4 flex-1 flex flex-col bg-gradient-to-t from-black/20 to-transparent">
                                <p className={`text-[11px] font-black truncate mb-1 uppercase tracking-wider ${isEmpty ? "text-white/30" : "text-white/90"}`}>
                                    {isEmpty ? `Slot ${idx + 1}` : decodeHtml(tr.title)}
                                </p>
                                <div className="mt-auto flex items-center justify-between gap-3">
                                    <p className="text-[9px] mono text-white/40 truncate uppercase tracking-widest">
                                        {isEmpty ? "Awaiting Track" : tr.channel}
                                    </p>
                                    {!isEmpty && (
                                        <button
                                            onClick={() => {
                                                if (isPlaying) setPlayingId(null);
                                                setYtTracks((t) =>
                                                    t.map((x, i) =>
                                                        i === idx ? { id: `yt-${idx}`, url: "", status: "idle" } : x
                                                    )
                                                );
                                            }}
                                            className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {ytResults.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {ytResults.map((v) => {
                        const added = ytTracks.some((t) => t.url?.includes(v.id));

                        return (
                            <button
                                key={v.id}
                                onClick={(e) => !added && magicFillSlots(v, e)}
                                className={`p-3 rounded-2xl border text-left transition-all active:scale-95 flex flex-col group ${added
                                    ? "border-[#FF0000] bg-[#FF0000]/10 shadow-[0_0_15px_rgba(255,0,0,0.1)]"
                                    : "border-white/10 bg-white/5 hover:bg-white/10"
                                    }`}
                            >
                                <div className="relative w-full aspect-square mb-3 overflow-hidden rounded-xl bg-black/40">
                                    <img
                                        src={v.thumbnail}
                                        className={`w-full h-full object-cover transition-transform duration-500 ${added ? 'scale-110 opacity-40' : 'group-hover:scale-110'}`}
                                        alt={v.title}
                                    />
                                    {added && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="px-3 py-1 bg-[#FF0000]/20 backdrop-blur-md border border-[#FF0000]/50 rounded-full">
                                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Added</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <p className={`text-xs font-bold leading-tight truncate w-full ${added ? 'text-white/40' : 'text-white/90'}`}>
                                    {decodeHtml(v.title)}
                                </p>
                                <p className="text-[10px] text-white/30 mt-1 truncate w-full">
                                    {v.channelTitle}
                                </p>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}