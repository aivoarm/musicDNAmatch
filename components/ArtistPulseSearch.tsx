"use client";

import { useState } from "react";
import { Search, Activity, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import UnifiedArtistCard from "./UnifiedArtistCard";

export default function ArtistPulseSearch({ myDna, onDnaUpdate }: { myDna?: any, onDnaUpdate?: () => void }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasTyped, setHasTyped] = useState(false);

    const handleSearch = async (val: string) => {
        setQuery(val);
        if (val.length < 2) {
            setResults([]);
            return;
        }
        setHasTyped(true);
        setLoading(true);
        try {
            const res = await fetch(`/api/artists/search?q=${encodeURIComponent(val)}`);
            const data = await res.json();
            if (data.success) {
                setResults(data.artists || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto mt-20 px-4">
            <div className="relative group/search">
                <div className="absolute inset-0 bg-[#FF0000]/5 blur-3xl group-hover/search:bg-[#FF0000]/10 transition-all rounded-full pointer-events-none" />
                <div className="relative flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-[2.5rem] focus-within:border-[#FF0000]/40 transition-all backdrop-blur-xl shadow-2xl">
                    <div className="h-14 w-14 rounded-3xl bg-white/5 flex items-center justify-center shrink-0">
                        <Search className="h-6 w-6 text-white/40" />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Discover artists & sync with your DNA..."
                        className="flex-1 bg-transparent py-4 text-2xl font-bold text-white placeholder:text-white/10 outline-none italic uppercase tracking-tighter"
                    />
                    {loading && (
                        <div className="mr-6">
                            <Loader2 className="h-6 w-6 text-[#FF0000] animate-spin" />
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-16 flex flex-col gap-12 max-w-4xl mx-auto">
                <AnimatePresence mode="popLayout">
                    {results.map((artist, i) => (
                        <UnifiedArtistCard
                            key={artist.id}
                            artist={artist}
                            index={i}
                            hasDna={!!myDna}
                            onSynced={onDnaUpdate}
                        />
                    ))}
                </AnimatePresence>

                {hasTyped && query.length >= 2 && !loading && results.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-full py-32 text-center"
                    >
                        <div className="h-24 w-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-8 border border-white/5">
                            <Activity className="h-10 w-10 text-white/10" />
                        </div>
                        <p className="mono text-white/30 uppercase text-[12px] tracking-[0.5em] italic leading-loose">
                            Zero Neural Fragments for <br />
                            <span className="text-white font-black text-lg not-italic mt-4 block">"{query}"</span>
                        </p>
                    </motion.div>
                )}
            </div>

            {!hasTyped && (
                <div className="mt-12 text-center opacity-20 hover:opacity-40 transition-opacity">
                    <p className="mono text-[9px] uppercase tracking-[0.4em]">Integrated Pulse Protocol v1.5 // Multi-Source Artist Discovery</p>
                </div>
            )}
        </div>
    );
}
