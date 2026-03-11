"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Music2,
    HelpCircle,
    Loader2,
    AlertCircle,
    Monitor,
    Smartphone,
    ExternalLink,
    ArrowRight
} from "lucide-react";

interface StageSourceSpotifyProps {
    spotifyUrl: string;
    setSpotifyUrl: (v: string) => void;
    scanning: boolean;
    scanErr: string | null;
    spotifyHelpOpen: boolean;
    setSpotifyHelpOpen: (v: boolean) => void;
    playlists: any[];
    plTotal: number;
    loadingMore: boolean;
    scanSpotify: (offset: number) => void;
    selPlaylists: any[];
    setSelPlaylists: React.Dispatch<React.SetStateAction<any[]>>;
    onNext: () => void;
}

export function StageSourceSpotify({
    spotifyUrl,
    setSpotifyUrl,
    scanning,
    scanErr,
    spotifyHelpOpen,
    setSpotifyHelpOpen,
    playlists,
    plTotal,
    loadingMore,
    scanSpotify,
    selPlaylists,
    setSelPlaylists,
    onNext
}: StageSourceSpotifyProps) {
    return (
        <div className="glass p-4 sm:p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#1DB954]/10 border border-[#1DB954]/20 flex items-center justify-center shrink-0">
                        <Music2 className="h-5 w-5 text-[#1DB954]" />
                    </div>
                    <h2 className="text-xl font-black tracking-tight">Spotify</h2>
                    <a
                        href="https://open.spotify.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white/5 hover:bg-[#1DB954]/20 border border-white/10 hover:border-[#1DB954]/40 rounded-lg transition-all text-white/30 hover:text-[#1DB954]"
                        title="Open Spotify"
                    >
                        <ExternalLink size={14} />
                    </a>
                </div>
                <button
                    onClick={() => setSpotifyHelpOpen(!spotifyHelpOpen)}
                    className={`p-2.5 rounded-xl transition-all active:scale-95 ${spotifyHelpOpen ? "bg-[#1DB954] text-black shadow-lg shadow-[#1DB954]/20" : "bg-white/5 text-white/50 hover:text-white hover:bg-white/10 border border-white/5"}`}
                >
                    <HelpCircle size={18} />
                </button>
            </div>

            <AnimatePresence>
                {spotifyHelpOpen && (
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
                                        <Monitor className="h-3 w-3 text-[#1DB954]" />
                                        <span className="text-white font-black uppercase text-[10px] tracking-wider">Desktop</span>
                                    </div>
                                    <ol className="space-y-2">
                                        {["Go to Profile", "Click '...'", "Share → Link"].map((s, i) => (
                                            <li key={i} className="text-[11px] text-white/60 flex gap-2">
                                                <span className="text-[#1DB954] font-bold">{i + 1}.</span> {s}
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Smartphone className="h-3 w-3 text-[#1DB954]" />
                                        <span className="text-white font-black uppercase text-[10px] tracking-wider">Mobile</span>
                                    </div>
                                    <ol className="space-y-2">
                                        {["Library Tab", "Profile Icon", "Share Link"].map((s, i) => (
                                            <li key={i} className="text-[11px] text-white/60 flex gap-2">
                                                <span className="text-[#1DB954] font-bold">{i + 1}.</span> {s}
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-4">
                <div className="flex items-center bg-black/40 border border-white/10 rounded-2xl p-1.5 focus-within:border-[#1DB954]/50 focus-within:ring-1 focus-within:ring-[#1DB954]/20 transition-all">
                    <input
                        value={spotifyUrl}
                        onChange={(e) => setSpotifyUrl(e.target.value)}
                        placeholder="Paste Spotify playlist or profile link"
                        className="flex-1 bg-transparent px-3 py-2 text-[16px] sm:text-sm text-white placeholder:text-white/30 focus:outline-none min-w-0"
                    />
                    <button
                        onClick={() => scanSpotify(0)}
                        disabled={scanning || !spotifyUrl.includes("spotify")}
                        className="h-10 sm:h-11 px-4 sm:px-6 mr-0.5 bg-[#1DB954] hover:bg-[#1ed760] disabled:bg-white/10 disabled:text-white/30 rounded-xl text-black font-black transition-all flex items-center justify-center min-w-[90px] active:scale-95 text-sm"
                    >
                        {scanning ? <Loader2 className="animate-spin w-4 h-4" /> : "Scan"}
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    {playlists.length === 0 ? (
                        !scanning && (
                            <button
                                onClick={onNext}
                                className="flex-1 py-4 px-6 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all text-xs font-bold uppercase tracking-widest active:scale-[0.98]"
                            >
                                I don't have public Spotify playlists
                            </button>
                        )
                    ) : (
                        <button
                            onClick={onNext}
                            className="flex-1 py-4 px-6 bg-[#1DB954]/10 border border-[#1DB954]/30 rounded-2xl text-[#1DB954] hover:bg-[#1DB954]/20 transition-all text-xs font-black uppercase tracking-[0.2em] active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            Continue to Step 2 <ArrowRight size={14} />
                        </button>
                    )}
                </div>
            </div>

            {scanErr && (
                <p className="text-red-400 text-sm flex gap-2 items-center bg-red-400/10 p-3 rounded-xl border border-red-400/20">
                    <AlertCircle size={16} className="shrink-0" />
                    {scanErr}
                </p>
            )}

            {playlists.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {playlists.map((p) => {
                        const selected = selPlaylists.some((x) => x.id === p.id);
                        return (
                            <button
                                key={p.id}
                                onClick={() =>
                                    setSelPlaylists((prev) =>
                                        selected ? prev.filter((x) => x.id !== p.id) : [...prev, p]
                                    )
                                }
                                className={`p-3 rounded-2xl border text-left transition-all active:scale-95 flex flex-col ${selected
                                    ? "border-[#1DB954] bg-[#1DB954]/10 shadow-[0_0_15px_rgba(29,185,84,0.15)]"
                                    : "border-white/10 bg-white/5 hover:bg-white/10"
                                    }`}
                            >
                                {p.image ? (
                                    <img src={p.image} className="w-full aspect-square object-cover rounded-xl mb-3 shadow-md" alt={p.name} />
                                ) : (
                                    <div className="w-full aspect-square bg-black/40 rounded-xl mb-3 flex items-center justify-center">
                                        <Music2 className="text-white/20 w-8 h-8" />
                                    </div>
                                )}
                                <p className="text-xs font-bold text-white/90 truncate w-full">{p.name}</p>
                                <p className="text-[10px] text-white/40 mt-0.5">{p.track_count} tracks</p>
                            </button>
                        );
                    })}
                </div>
            )}

            {playlists.length > 0 && playlists.length < plTotal && (
                <div className="flex justify-center pt-2">
                    <button
                        onClick={() => scanSpotify(playlists.length)}
                        disabled={loadingMore}
                        className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loadingMore ? (
                            <>
                                <Loader2 className="h-3 w-3 animate-spin" /> Load More
                            </>
                        ) : (
                            "Load More"
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
