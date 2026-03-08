"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface MinimalArtistCardProps {
    artist: any;
    index: number;
}

export default function MinimalArtistCard({ artist, index }: MinimalArtistCardProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const previewUrl = artist.preview?.preview_url || (typeof artist.preview === 'string' ? artist.preview : null) || artist.preview_url;

        if (typeof window !== "undefined" && previewUrl) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
            }
            audioRef.current = new Audio(previewUrl);
            audioRef.current.volume = 0.5;
            audioRef.current.onended = () => setIsPlaying(false);
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
            }
        };
    }, [artist.preview, artist.preview_url]);

    const togglePlayback = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        const previewUrl = artist.preview?.preview_url || (typeof artist.preview === 'string' ? artist.preview : null) || artist.preview_url;

        if (!previewUrl) {
            console.warn("No preview URL found for artist:", artist.name);
            return;
        }

        if (!audioRef.current) {
            audioRef.current = new Audio(previewUrl);
            audioRef.current.volume = 0.5;
            audioRef.current.onended = () => setIsPlaying(false);
        }

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().catch(err => {
                console.error("Playback failed:", err);
            });
            setIsPlaying(true);
        }
    };

    const hasPreview = !!(artist.preview?.preview_url || (typeof artist.preview === 'string' ? artist.preview : null) || artist.preview_url);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="group relative aspect-square rounded-3xl overflow-hidden bg-[#0A0A0A] border border-white/5 hover:border-[#FF0000]/30 transition-all duration-500"
        >
            {/* Thumbnail */}
            {artist.image ? (
                <img
                    src={artist.image}
                    className="h-full w-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-[0.4] transition-all duration-700"
                    alt={artist.name}
                />
            ) : (
                <div className={`h-full w-full bg-gradient-to-br ${artist.color || 'from-zinc-800 to-black'} opacity-40`} />
            )}

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                {hasPreview ? (
                    <button
                        onClick={togglePlayback}
                        className="h-16 w-16 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-30"
                    >
                        {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 ml-1 fill-current" />}
                    </button>
                ) : (
                    <div className="bg-black/80 px-4 py-2 rounded-full border border-white/10 z-30">
                        <span className="mono text-[8px] uppercase tracking-widest text-white/40">No Preview Available</span>
                    </div>
                )}
            </div>

            {/* Bottom Content Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                <div className="flex items-end justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <span className="mono text-[8px] uppercase tracking-[0.3em] text-[#FF0000] font-black block mb-1">
                            {artist.style || (artist.tags && artist.tags[0]) || "SUGGESTED SIGNAL"}
                        </span>
                        <h4 className="text-xl font-black uppercase italic text-white leading-tight truncate">
                            {artist.name}
                        </h4>
                    </div>

                    <a
                        href={artist.spotify_url || artist.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="h-10 w-10 rounded-xl bg-white/10 hover:bg-[#FF0000] border border-white/10 flex items-center justify-center transition-all group/link"
                    >
                        <ExternalLink className="h-4 w-4 text-white group-hover/link:scale-110" />
                    </a>
                </div>
            </div>

            {/* Progress Bar for playback */}
            {isPlaying && (
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 30, ease: "linear" }}
                    className="absolute bottom-0 left-0 right-0 h-1 bg-[#FF0000] origin-left z-40"
                />
            )}
        </motion.div>
    );
}
