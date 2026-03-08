"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Zap, CheckCircle2, Activity, Fingerprint, ArrowRight, Share2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface UnifiedArtistCardProps {
    artist: any;
    index: number;
    hasDna: boolean;
    onSynced?: () => void;
    forceEmbed?: boolean;
}

export default function UnifiedArtistCard({ artist, index, hasDna, onSynced, forceEmbed = false }: UnifiedArtistCardProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const [showEmbed, setShowEmbed] = useState(forceEmbed);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined" && artist.preview?.preview_url) {
            audioRef.current = new Audio(artist.preview.preview_url);
            audioRef.current.volume = 0.5;
            audioRef.current.onended = () => setIsPlaying(false);
        }
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
            }
        };
    }, [artist.preview?.preview_url]);

    const togglePlayback = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!audioRef.current || !artist.preview?.preview_url) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().catch(() => { });
            setIsPlaying(true);
        }
    };

    const router = useRouter();

    // Extract Spotify ID for embed
    const spotifyId = artist.is_db
        ? artist.spotify_url?.split('/').pop()?.split('?')[0]
        : artist.id;

    const handleSync = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isSyncing || isDone) return;
        setIsSyncing(true);

        if (spotifyId) {
            router.push(`/?sync_artist=${spotifyId}`);
        } else {
            setIsSyncing(false);
        }
    };

    // Ensure we have a valid external URL
    const fullSpotifyUrl = artist.spotify_url?.startsWith('http')
        ? artist.spotify_url
        : `https://open.spotify.com/artist/${spotifyId}`;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: index * 0.1 }}
            className="group relative w-full min-h-[420px] rounded-[3.5rem] overflow-hidden border border-white/10 glass hover:border-[#FF0000]/40 transition-all duration-500 flex flex-col md:flex-row shadow-2xl"
        >
            {/* Background Glow */}
            <div className={`absolute -top-32 -right-32 h-64 w-64 blur-[120px] opacity-20 transition-opacity bg-gradient-to-br ${artist.color} pointer-events-none`} />

            {/* Visual Section (Left/Top) */}
            <div className="relative w-full md:w-[320px] h-[320px] md:h-auto shrink-0 overflow-hidden bg-[#0A0A0A]">
                <AnimatePresence mode="wait">
                    {!showEmbed ? (
                        <motion.div
                            key="visual"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0"
                        >
                            {artist.image ? (
                                <img src={artist.image} className="h-full w-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-110 transition-all duration-1000" />
                            ) : (
                                <div className={`h-full w-full bg-gradient-to-br ${artist.color} opacity-40`} />
                            )}

                            {/* Neural Visualizer Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                            <div className="absolute inset-0 flex items-center justify-center">
                                <button
                                    onClick={togglePlayback}
                                    className="h-24 w-24 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all group/play z-30"
                                >
                                    {isPlaying ? <Pause className="h-8 w-8 fill-current" /> : <Play className="h-8 w-8 ml-1 fill-current" />}
                                    {isPlaying && (
                                        <motion.div
                                            initial={{ scale: 1, opacity: 0.5 }}
                                            animate={{ scale: 1.8, opacity: 0 }}
                                            transition={{ repeat: Infinity, duration: 1 }}
                                            className="absolute inset-0 bg-white rounded-full -z-10"
                                        />
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="embed"
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="absolute inset-0 bg-black"
                        >
                            <iframe
                                src={`https://open.spotify.com/embed/artist/${spotifyId}?utm_source=generator&theme=0`}
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                loading="lazy"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tribe Badge */}
                {artist.is_db && (
                    <div className="absolute top-6 left-6 z-40 bg-[#FF0000] text-white font-black text-[8px] px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-xl">
                        <Fingerprint className="h-3 w-3" /> NEURAL SIGNAL
                    </div>
                )}
            </div>

            {/* Content Section (Right/Bottom) */}
            <div className="flex-1 p-8 md:p-12 flex flex-col justify-between relative z-20">
                <div>
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <span className="mono text-[10px] uppercase tracking-[0.4em] text-[#FF0000] font-black block mb-2">{artist.is_db ? "Active Identity" : "Simulated Match"}</span>
                            <h4 className="text-4xl md:text-5xl font-black uppercase italic text-white leading-none tracking-tighter mb-4">
                                {artist.name}
                            </h4>
                        </div>
                        {hasDna && artist.match && (
                            <div className="text-right">
                                <div className="text-4xl font-black italic text-white leading-none">
                                    {(artist.match.cosine_similarity * 100).toFixed(0)}%
                                </div>
                                <div className="mono text-[8px] uppercase tracking-widest text-[#FF0000] mt-1 font-black">Resonance</div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-3 mb-8">
                        <span className="bg-white/10 text-white/60 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10 italic">
                            {artist.style || "Hybrid Frequency"}
                        </span>
                        {(artist.tags || []).slice(0, 3).map((tag: string) => (
                            <span key={tag} className="text-[10px] mono uppercase text-white/30 px-3 py-1 rounded-lg border border-white/5">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <p className="text-white/60 text-sm md:text-base font-medium italic leading-relaxed mb-8 max-w-lg">
                        {artist.bio || `Analyzing neural patterns for ${artist.name}. This signal represents a high-fidelity match within your unique 12-dimensional sonic vector.`}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <button
                        onClick={handleSync}
                        disabled={isSyncing || isDone}
                        className={`flex-1 w-full h-16 rounded-2xl flex items-center justify-center gap-4 font-black text-xs uppercase tracking-[0.2em] transition-all ${isDone
                            ? "bg-green-500/20 text-green-400 border border-green-500/20"
                            : "bg-[#FF0000] text-white hover:scale-[1.02] active:scale-95 shadow-[0_20px_40px_rgba(255,0,0,0.2)]"
                            } disabled:opacity-80`}
                    >
                        {isSyncing ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : isDone ? (
                            <><CheckCircle2 className="h-5 w-5" /> SYNCHRONIZED</>
                        ) : (
                            <><Zap className="h-5 w-5 fill-current" /> {hasDna ? "Sync into DNA" : "Calc via Resonance"}</>
                        )}
                    </button>

                    {!forceEmbed && (
                        <button
                            onClick={() => {
                                if (!showEmbed) {
                                    if (isPlaying) audioRef.current?.pause();
                                    setIsPlaying(false);
                                }
                                setShowEmbed(!showEmbed);
                            }}
                            className="flex-1 w-full h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-3 hover:bg-white/10 hover:border-white/20 transition-all font-black text-[10px] uppercase tracking-widest text-white/60 hover:text-white"
                        >
                            {showEmbed ? <><Activity className="h-4 w-4" /> Neural View</> : <><Play className="h-4 w-4" /> Official Profile</>}
                        </button>
                    )}

                    <div className="flex gap-2">
                        <a
                            href={fullSpotifyUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all group/link shrink-0"
                        >
                            <ArrowRight className="h-6 w-6 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </a>
                        <button className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all group/link shrink-0">
                            <Share2 className="h-6 w-6 text-white/40 group-hover:text-white transition-all" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
