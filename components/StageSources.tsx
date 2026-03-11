"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowRight
} from "lucide-react";

import { Stepper } from "./HomeUI";
import { StageSourceSpotify } from "./StageSourceSpotify";
import { StageSourceYoutube } from "./StageSourceYoutube";

interface SourcesProps {
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
    ytQuery: string;
    setYtQuery: (v: string) => void;
    ytSearching: boolean;
    ytResults: any[];
    ytShowSearch: boolean;
    setYtShowSearch: (v: boolean) => void;
    searchYt: (q: string) => void;
    addYtSearchResult: (v: any) => void;
    magicFillSlots: (v: any, e: any) => void;
    ytTracks: any[];
    setYtTracks: React.Dispatch<React.SetStateAction<any[]>>;
    fetchSourcesAndPreselect: () => void;
    hasYt: boolean;
    onBack: () => void;
}

export default function StageSources({
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
    ytQuery,
    setYtQuery,
    ytSearching,
    ytResults,
    ytShowSearch,
    setYtShowSearch,
    searchYt,
    addYtSearchResult,
    magicFillSlots,
    ytTracks,
    setYtTracks,
    fetchSourcesAndPreselect,
    hasYt,
    onBack
}: SourcesProps) {
    const [tab, setTab] = useState<"spotify" | "youtube">("spotify");

    const isSpotifySub = tab === "spotify";

    const handleNext = () => {
        if (isSpotifySub) {
            setTab("youtube");
        } else {
            fetchSourcesAndPreselect();
        }
    };

    const handleBack = () => {
        if (!isSpotifySub) {
            setTab("spotify");
        } else {
            onBack();
        }
    };


    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 w-full max-w-5xl mx-auto"
        >
            {/* Sticky header - Optimized for mobile tap targets */}
            <div className="sticky top-0 z-[60] bg-[#080808]/90 backdrop-blur-xl border-b border-white/5 mb-4 px-4 py-3 -mx-4 md:-mx-8 md:px-8">
                <div className="flex items-center justify-between gap-3 max-w-5xl mx-auto">
                    {/* Full Stepper */}
                    <div className="hidden md:block shrink-0">
                        <Stepper step={0} />
                    </div>

                    {/* Compact step indicator for mobile */}
                    <div className="flex md:hidden items-center gap-1.5 shrink-0">
                        {["Sources", "Tracks", "Genres", "Analyse"].map((label, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[9px] font-black border ${i === 0
                                    ? "bg-red-600 border-red-600 text-white"
                                    : "border-white/20 text-white/30"
                                    }`}>
                                    {i + 1}
                                </div>
                                {i < 3 && <div className="w-3 h-px bg-white/15" />}
                            </div>
                        ))}
                    </div>


                </div>
            </div>


            {/* Sub-Stage Indicator (Minimal) */}
            <div className="flex items-center justify-center gap-12 mb-8">
                <div className={`flex flex-col items-center gap-2 transition-opacity ${tab === 'spotify' ? 'opacity-100' : 'opacity-30'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${tab === 'spotify' ? 'bg-[#1DB954]' : 'bg-white/20'}`} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Step 1: Spotify</span>
                </div>
                <div className={`flex flex-col items-center gap-2 transition-opacity ${tab === 'youtube' ? 'opacity-100' : 'opacity-30'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${tab === 'youtube' ? 'bg-[#FF0000]' : 'bg-white/20'}`} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Step 2: YouTube</span>
                </div>
            </div>


            {/* Panel Content with Smooth Transitions */}
            <div className="relative min-h-[400px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={tab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="w-full"
                    >
                        {/* SPOTIFY PANEL */}
                        {tab === "spotify" && (
                            <StageSourceSpotify 
                                spotifyUrl={spotifyUrl}
                                setSpotifyUrl={setSpotifyUrl}
                                scanning={scanning}
                                scanErr={scanErr}
                                spotifyHelpOpen={spotifyHelpOpen}
                                setSpotifyHelpOpen={setSpotifyHelpOpen}
                                playlists={playlists}
                                plTotal={plTotal}
                                loadingMore={loadingMore}
                                scanSpotify={scanSpotify}
                                selPlaylists={selPlaylists}
                                setSelPlaylists={setSelPlaylists}
                                onNext={() => setTab("youtube")}
                            />
                        )}

                        {/* YOUTUBE PANEL */}
                        {tab === "youtube" && (
                            <StageSourceYoutube 
                                ytQuery={ytQuery}
                                setYtQuery={setYtQuery}
                                ytSearching={ytSearching}
                                ytResults={ytResults}
                                ytShowSearch={ytShowSearch}
                                setYtShowSearch={setYtShowSearch}
                                searchYt={searchYt}
                                magicFillSlots={magicFillSlots}
                                ytTracks={ytTracks}
                                setYtTracks={setYtTracks}
                                onNext={handleNext}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom Sticky Actions - Positioned above mobile bottom menu */}
            <div className="fixed bottom-16 left-0 right-0 z-[60] bg-[#080808]/80 backdrop-blur-xl border-t border-white/5 px-4 py-4 md:static md:bg-transparent md:backdrop-blur-none md:border-none md:px-0 md:pb-8">
                <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
                    <button
                        onClick={handleBack}
                        className="h-12 md:h-11 px-6 md:px-4 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all text-xs font-bold uppercase tracking-wider bg-white/5 whitespace-nowrap active:scale-95"
                    >
                        Back
                    </button>
                    <button
                        onClick={handleNext}
                        className={`h-12 md:h-11 flex-1 md:flex-none px-5 md:px-8 rounded-xl text-white font-black flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02] active:scale-95 text-xs uppercase tracking-wider whitespace-nowrap ${
                            isSpotifySub 
                            ? "bg-white/10 border border-white/10 hover:bg-white/20 shadow-none" 
                            : "bg-red-600 shadow-red-900/40 transition-all"
                        }`}
                    >
                        <span>
                            {isSpotifySub ? "Next: Add Tracks" : "Finish: Review Tracks"}
                        </span>
                        <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}