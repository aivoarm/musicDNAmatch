"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Search, Loader2, CheckCircle2, 
    ArrowRight, Mail, Zap, Star,
    Fingerprint, Activity
} from "lucide-react";

export default function ArtistOnboarding() {
    const [step, setStep] = useState(1);
    const [searching, setSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedArtist, setSelectedArtist] = useState<any>(null);
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const searchTimeout = useRef<any>(null);

    const handleSearch = async (query: string) => {
        if (!query || query.length < 2) {
            setSearchResults([]);
            return;
        }
        
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        
        setSearching(true);
        searchTimeout.current = setTimeout(async () => {
            try {
                const res = await fetch(`/api/spotify/search-artist?q=${encodeURIComponent(query)}`);
                const data = await res.json() as any;
                setSearchResults(data.artists || []);
            } catch (e) {
                console.error("Search failed:", e);
            } finally {
                setSearching(false);
            }
        }, 500);
    };

    const handleSubmit = async () => {
        if (!email || !selectedArtist) return;
        
        setLoading(true);
        try {
            const res = await fetch("/api/artists", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: selectedArtist.name,
                    spotify_url: selectedArtist.url,
                    image_url: selectedArtist.image,
                    verification_email: email,
                    style: selectedArtist.genres?.[0] || "Artist"
                })
            });
            
            if (res.ok) {
                setSubmitted(true);
            }
        } catch (e) {
            console.error("Submission failed:", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-[#080808] text-white flex flex-col items-center justify-center px-6 overflow-hidden">
            <style>{`
                * { font-family: var(--font-syne), 'Syne', sans-serif; }
                .mono { font-family: 'DM Mono', monospace !important; }
                .glass { background: rgba(10, 10, 10, 0.7); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
                .sb::-webkit-scrollbar { width: 4px; }
                .sb::-webkit-scrollbar-thumb { background: rgba(255, 0, 0, 0.3); border-radius: 10px; }
            `}</style>

            {/* Background Effects */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 h-[600px] w-[600px] blur-[200px] rounded-full bg-[#FF0000]/10 animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 h-[600px] w-[600px] blur-[200px] rounded-full bg-blue-600/5" />
            </div>

            <div className="max-w-xl w-full relative z-10">
                <AnimatePresence mode="wait">
                    {!submitted ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass border border-white/10 rounded-[3rem] p-8 md:p-16 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Activity className="h-24 w-24" />
                            </div>

                            <div className="mb-12">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-[#FF0000] p-1.5 rounded-lg">
                                        <Star className="h-4 w-4 text-white fill-white" />
                                    </div>
                                    <span className="mono text-[9px] text-[#FF0000] uppercase tracking-[0.4em] font-black">Join The Tribe Protocol</span>
                                </div>
                                <h1 className="text-xl md:text-3xl font-black uppercase tracking-tighter italic leading-[0.9] mb-4">
                                    Artist <br /><span className="text-[#FF0000]">Verification</span>
                                </h1>
                                <p className="text-white/40 text-[10px] md:text-[12px] font-medium italic">
                                    Identify your official sonic signature to synchronize with your global tribe.
                                </p>
                            </div>

                            {step === 1 ? (
                                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                    <div className="relative mb-8">
                                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                                        <input 
                                            type="text"
                                            placeholder="SEARCH ARTIST..."
                                            className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 pl-14 pr-6 text-white font-black italic uppercase tracking-wider text-[10px] focus:outline-none focus:border-[#FF0000]/30 transition-all"
                                            onChange={(e) => handleSearch(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-3 max-h-[300px] overflow-y-auto sb pr-4">
                                        {searching ? (
                                            <div className="py-12 flex justify-center"><Loader2 className="h-8 w-8 text-[#FF0000] animate-spin" /></div>
                                        ) : searchResults.map((a: any) => (
                                            <button 
                                                key={a.id}
                                                onClick={() => {
                                                    setSelectedArtist(a);
                                                    setStep(2);
                                                }}
                                                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-[#FF0000]/50 transition-all text-left group"
                                            >
                                                <img src={a.image} className="h-14 w-14 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all" />
                                                <div className="flex-1">
                                                    <p className="font-black italic uppercase text-xs tracking-widest">{a.name}</p>
                                                    <p className="mono text-[8px] text-white/30 uppercase mt-1">{a.genres?.[0] || 'Official Signal'}</p>
                                                </div>
                                                <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-[#FF0000] group-hover:translate-x-1 transition-all" />
                                            </button>
                                        ))}
                                        {searchResults.length === 0 && !searching && (
                                            <div className="py-12 text-center mono text-[10px] text-white/20 uppercase tracking-widest">
                                                Awaiting Frequency Input...
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                    <button 
                                        onClick={() => setStep(1)}
                                        className="inline-flex items-center gap-2 mono text-[8px] text-white/30 uppercase tracking-widest mb-8 hover:text-white transition-colors"
                                    >
                                        <ArrowRight className="h-3 w-3 rotate-180" /> Change Artist Profile
                                    </button>

                                    <div className="flex items-center gap-4 p-6 rounded-[2rem] bg-white/5 border border-white/10 mb-10">
                                        <img src={selectedArtist.image} className="h-16 w-16 rounded-2xl object-cover" />
                                        <div>
                                            <p className="font-black italic uppercase tracking-widest text-[#FF0000]">{selectedArtist.name}</p>
                                            <p className="mono text-[8px] text-white/30 uppercase mt-1">Ready for verification</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="mono text-[8px] uppercase tracking-widest text-white/30 mb-2 block font-black">Official Verification Email</label>
                                            <div className="relative">
                                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                                                <input 
                                                    type="email"
                                                    placeholder="NAME@MANAGEMENT.COM"
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-8 text-white font-black italic uppercase tracking-widest text-xs focus:outline-none focus:border-blue-500/50 transition-all"
                                                    onChange={(e) => setEmail(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <button 
                                            onClick={handleSubmit}
                                            disabled={loading || !email}
                                            className="w-full bg-white text-black font-black py-6 rounded-[2rem] uppercase tracking-[0.2em] text-[12px] hover:scale-102 active:scale-98 transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>SUBMIT SIGNAL <Zap className="h-4 w-4 fill-black" /></>}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass border border-[#FF0000]/20 bg-[#FF0000]/5 rounded-[4rem] p-16 text-center relative overflow-hidden"
                        >
                            <div className="h-28 w-28 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-12 border border-green-500/20">
                                <CheckCircle2 className="h-14 w-14 text-green-500" />
                            </div>
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-6">Signal <span className="text-green-500">Logged</span></h3>
                            <p className="text-white/40 text-[11px] font-medium italic leading-relaxed mb-12 max-w-sm mx-auto">
                                Your official frequency is now in the queue. You will receive a verification link once our protocol validates your identity.
                            </p>
                            <button 
                                onClick={() => {
                                    setSubmitted(false);
                                    setStep(1);
                                    setSelectedArtist(null);
                                    setEmail("");
                                }}
                                className="bg-white/5 border border-white/10 text-white font-black py-4 px-12 rounded-2xl uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
                            >
                                Register Another Frequency
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer Label */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none opacity-20">
                <p className="mono text-[8px] uppercase tracking-[2em] text-white whitespace-nowrap">
                    Tribe Artist Onboarding Protocol v2.1 // <a href="https://armanayva.com" target="_blank" rel="noopener noreferrer" className="pointer-events-auto hover:text-[#FF0000] transition-colors">armanayva.com</a>
                </p>
            </div>
        </div>
    );
}
