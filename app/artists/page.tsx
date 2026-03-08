"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music2, ArrowLeft, Star, Sparkles, Waves, Users, Zap, Brain, Fingerprint, Activity, Radio, Share2, ArrowRight, Search, Loader2, Mail, CheckCircle2, Plus, Play, Pause } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { matchScore, AXIS_LABELS } from "@/lib/dna";

import UnifiedArtistCard from "@/components/UnifiedArtistCard";

// Main Component
export default function MusicalTribe() {
    const [myDna, setMyDna] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [matches, setMatches] = useState<any[]>([]);
    const [showArtistModal, setShowArtistModal] = useState(false);
    const [registrationStep, setRegistrationStep] = useState<"search" | "select" | "email" | "success">("search");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchingSpotify, setSearchingSpotify] = useState(false);
    const [searchOffset, setSearchOffset] = useState(0);
    const [loadingMoreArtists, setLoadingMoreArtists] = useState(false);
    const [selectedArtist, setSelectedArtist] = useState<any>(null);
    const [contactEmail, setContactEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [tribeOffset, setTribeOffset] = useState(0);
    const [hasMoreTribe, setHasMoreTribe] = useState(false);
    const [loadingTribe, setLoadingTribe] = useState(false);
    const [fans, setFans] = useState<any[]>([]);
    const [loadingFans, setLoadingFans] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchProfile();

        const listener = () => fetchProfile();
        window.addEventListener("profile-updated", listener);
        return () => window.removeEventListener("profile-updated", listener);
    }, []);

    useEffect(() => {
        fetchTribe(0);
        fetchFans();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/dna/profile/me");
            const data = await res.json() as any;
            if (data.found) setMyDna(data.dna);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchTribe = async (offset = 0) => {
        setLoadingTribe(true);
        try {
            const res = await fetch(`/api/artists?registered=true&offset=${offset}&limit=5`);
            const data = await res.json() as any;
            if (data.success) {
                if (offset === 0) setMatches(data.artists || []);
                else setMatches(prev => [...prev, ...(data.artists || [])]);
                setHasMoreTribe(data.hasMore);
                setTribeOffset(offset);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingTribe(false);
        }
    };

    const fetchFans = async () => {
        setLoadingFans(true);
        try {
            const res = await fetch("/api/dna/community");
            const data = await res.json() as any;
            if (data.success) {
                setFans(data.profiles || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingFans(false);
        }
    };

    const searchSpotifyArtists = async (offset = 0) => {
        if (!searchQuery.trim()) return;
        if (offset === 0) {
            setSearchingSpotify(true);
            setSearchResults([]);
            setSearchOffset(0);
        } else {
            setLoadingMoreArtists(true);
        }

        try {
            const res = await fetch(`/api/artists/search?q=${encodeURIComponent(searchQuery)}&offset=${offset}&limit=6`);
            const data = await res.json() as any;
            if (data.success) {
                if (offset === 0) {
                    setSearchResults(data.artists || []);
                    setRegistrationStep("select");
                } else {
                    setSearchResults(prev => [...prev, ...(data.artists || [])]);
                }
                setSearchOffset(offset);
            }
        } catch (e) {
            console.error("Search failed", e);
        } finally {
            setSearchingSpotify(false);
            setLoadingMoreArtists(false);
        }
    };

    const handleArtistSelect = (artist: any) => {
        setSelectedArtist(artist);
        setRegistrationStep("email");
    };

    const handleVerificationSubmit = async () => {
        if (!contactEmail.trim()) return;
        setSubmitting(true);
        try {
            const res = await fetch("/api/artists", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: selectedArtist.name,
                    style: selectedArtist.style,
                    bio: selectedArtist.bio,
                    tags: selectedArtist.tags,
                    spotify_url: selectedArtist.spotify_url,
                    image_url: selectedArtist.image,
                    preview_url: selectedArtist.preview?.preview_url,
                    verification_email: contactEmail
                })
            });
            const data = await res.json() as any;
            if (data.success) {
                setRegistrationStep("success");
            } else {
                alert(data.error || "Failed to submit verification");
            }
        } catch (e) {
            console.error("Verification submit failed", e);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#080808] flex items-center justify-center font-black italic text-4xl text-white/20 animate-pulse uppercase tracking-tighter">
                Synchronizing Tribe...
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-[#080808] text-white pt-24 pb-20 px-6 overflow-hidden">
            <style>{`
                * { font-family: var(--font-syne), 'Syne', sans-serif; }
                .mono { font-family: 'DM Mono', monospace !important; }
                .glass { background: rgba(10, 10, 10, 0.7); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
                .sb::-webkit-scrollbar { width: 4px; }
                .sb::-webkit-scrollbar-thumb { background: rgba(255, 0, 0, 0.3); border-radius: 10px; }
            `}</style>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
                    <div>
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 mb-4">
                            <div className="bg-[#FF0000] p-1.5 rounded-lg">
                                <Star className="h-4 w-4 text-white fill-white" />
                            </div>
                            <span className="mono text-[9px] text-[#FF0000] uppercase tracking-[0.4em] font-black">Official Artist Sanctuary</span>
                        </motion.div>
                        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-[0.8]">
                            The <span className="text-[#FF0000]">Syndicate</span>
                        </motion.h1>
                        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-white/60 text-lg mt-6 max-w-xl font-medium italic">
                            Verified creators defining the sonic pulse of the protocol. Explore the architects behind the frequency.
                        </motion.p>
                    </div>

                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="flex gap-4">
                        <button onClick={() => setShowArtistModal(true)} className="group relative bg-[#FF0000] text-white font-black py-6 px-10 rounded-3xl uppercase tracking-widest text-[10px] italic flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,0,0,0.3)]">
                            <Plus className="h-5 w-5" /> Join The SYNDICATE
                        </button>
                    </motion.div>
                </div>

                {!myDna ? (
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="glass border border-white/10 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden mb-20">
                        <div className="absolute top-0 right-0 p-10 opacity-5">
                            <Users className="h-64 w-64" />
                        </div>
                        <div className="relative z-10 max-w-lg mx-auto">
                            <Brain className="h-20 w-20 text-[#FF0000] mx-auto mb-8 animate-bounce" />
                            <h2 className="text-4xl font-black uppercase italic mb-6 text-white">Neural Uplink Offline</h2>
                            <p className="text-white/60 text-lg mb-10 font-medium italic">Identification required. Connect your musical DNA to access the inner santuary of the syndicate.</p>
                            <Link href="/" className="inline-flex items-center gap-3 bg-[#FF0000] text-white font-black py-6 px-12 rounded-[2rem] text-xs uppercase tracking-widest hover:scale-105 transition-all">
                                <Zap className="h-5 w-5 fill-white" /> Establish Connection
                            </Link>
                        </div>
                    </motion.div>
                ) : (
                    <div className="space-y-32">
                        {/* Registered Artists List */}
                        <section>
                            <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-6">
                                <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Synchronized <span className="text-[#FF0000]">Creators</span></h2>
                                <div className="mono text-[10px] text-white/40 uppercase tracking-widest flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" /> Global Verification Protocol Active
                                </div>
                            </div>

                            <div className="flex flex-col gap-12 max-w-4xl">
                                {loadingTribe ? (
                                    <div className="py-20 flex flex-col items-center justify-center">
                                        <Loader2 className="h-10 w-10 text-[#FF0000] animate-spin mb-4" />
                                        <p className="mono text-[10px] text-white/30 uppercase tracking-[0.5em]">Synchronizing Official Profiles...</p>
                                    </div>
                                ) : matches.length > 0 ? (
                                    <>
                                        {matches.map((artist, idx) => (
                                            <UnifiedArtistCard key={artist.id} artist={artist} index={idx} hasDna={true} forceEmbed={true} hideSync={true} />
                                        ))}

                                        {hasMoreTribe && (
                                            <button
                                                onClick={() => fetchTribe(tribeOffset + 5)}
                                                className="w-full h-24 rounded-[2rem] border border-white/10 bg-white/5 flex items-center justify-center gap-4 hover:border-[#FF0000]/30 transition-all group"
                                            >
                                                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-[#FF0000] transition-colors">
                                                    <Plus className="h-5 w-5" />
                                                </div>
                                                <span className="text-white font-black italic uppercase tracking-[0.2em] text-[12px]">View More Architects</span>
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <div className="p-24 text-center glass border border-white/10 rounded-[3rem]">
                                        <p className="text-white/40 font-black uppercase tracking-[0.5em] text-[12px]">The Syndicate is currently assembling...</p>
                                        <button onClick={() => setShowArtistModal(true)} className="mt-8 text-[#FF0000] font-black italic uppercase text-xs hover:underline underline-offset-8">Be the first to register →</button>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Cluster of Fans */}
                        <section className="relative">
                            <div className="absolute -top-20 -right-20 pointer-events-none opacity-5">
                                <Users className="h-96 w-96 text-blue-500" />
                            </div>

                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 px-4">
                                <div className="max-w-xl">
                                    <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white leading-none">Sonic <span className="text-blue-500">Pulse</span></h2>
                                    <p className="text-white/40 text-sm font-medium italic mt-4">The collective subconscious. A cluster of unique frequencies harmonizing within the syndicate ecosystem.</p>
                                </div>
                                <div className="mono text-[10px] text-blue-500/60 uppercase tracking-widest font-black border border-blue-500/20 px-6 py-3 rounded-full bg-blue-500/5">
                                    240 Neural Identities Active
                                </div>
                            </div>

                            <div className="glass rounded-[4rem] border border-white/10 p-12 md:p-20 relative overflow-hidden">
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6 md:gap-10">
                                    {(fans.length > 0 ? fans : [...Array(24)]).map((fan, i) => (
                                        <motion.div
                                            key={fan?.id || i}
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.02, type: "spring", stiffness: 100 }}
                                            className="group relative"
                                        >
                                            <div className="aspect-square rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-500/50 group-hover:scale-110 cursor-pointer">
                                                <div className="h-full w-full bg-gradient-to-tr from-white/5 to-white/10 group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all flex items-center justify-center overflow-hidden">
                                                    {fan?.metadata?.user_image ? (
                                                        <img src={fan.metadata.user_image} className="h-full w-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                                                    ) : (
                                                        <Fingerprint className="h-8 w-8 text-white/10 group-hover:text-blue-400 group-hover:animate-pulse transition-all" />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black text-white px-3 py-1.5 rounded-lg mono text-[8px] uppercase tracking-widest border border-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-2xl">
                                                {fan?.display_name || `NEURAL_SIGNAL_${i}`} • {((fan?.coherence_index || 0.8) * 100).toFixed(0)}%
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Particle Effects Overlay */}
                                <div className="absolute inset-0 pointer-events-none">
                                    <div className="absolute top-1/4 left-1/2 h-1 w-1 bg-blue-500 rounded-full animate-ping opacity-20" />
                                    <div className="absolute bottom-1/3 left-1/4 h-1 w-1 bg-purple-500 rounded-full animate-ping opacity-20" style={{ animationDelay: '1s' }} />
                                    <div className="absolute top-1/2 right-1/4 h-1 w-1 bg-blue-400 rounded-full animate-ping opacity-20" style={{ animationDelay: '2s' }} />
                                </div>
                            </div>

                            <div className="mt-12 text-center">
                                <Link href="/soulmates" className="mono text-[10px] text-white/30 uppercase tracking-[0.5em] hover:text-white transition-all">
                                    Dive into the collective collective frequency →
                                </Link>
                            </div>
                        </section>
                    </div>
                )}

                {/* Tribe Community CTA */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="mt-20 p-12 md:p-20 border border-[#FF0000]/20 bg-[#FF0000]/5 rounded-[4rem] flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#FF0000]/10 via-transparent to-transparent pointer-events-none" />
                    <div className="max-w-xl relative z-10">
                        <span className="mono text-[10px] text-[#FF0000] font-black uppercase tracking-[0.4em] mb-4 block">Crowdsourcing The Sound</span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic mb-6 leading-[0.9]">Build Your Own <br /><span className="text-[#FF0000]">Sonic Colony</span></h2>
                        <p className="text-white/60 text-lg font-medium italic mb-8">
                            Are you an artist looking to find your core audience? Our neural matching protocol helps you identify the listeners who are biologically tuned to your frequency.
                        </p>
                    </div>
                    <button onClick={() => setShowArtistModal(true)} className="relative z-10 bg-white text-black font-black py-6 px-12 rounded-[2.5rem] uppercase tracking-[0.2em] text-[12px] group hover:scale-105 active:scale-95 transition-all shadow-2xl">
                        <span className="flex items-center gap-2">Apply for Verification <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></span>
                    </button>
                    <div className="absolute -bottom-10 -right-10 opacity-10 pointer-events-none">
                        <Waves className="h-96 w-96 animate-pulse" />
                    </div>
                </motion.div>
            </div>

            {/* Background Effects */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 h-[600px] w-[600px] blur-[200px] rounded-full bg-blue-600/5 animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 h-[600px] w-[600px] blur-[200px] rounded-full bg-[#FF0000]/5" />
            </div>

            {/* Footer Label */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none opacity-20">
                <p className="mono text-[8px] uppercase tracking-[2em] text-white whitespace-nowrap">Tribe Neural Synchronization Protocol v1.4 // Aesthetic Resonance Verified</p>
            </div>

            {/* Artist Modal */}
            <AnimatePresence>
                {showArtistModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 text-center">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowArtistModal(false)} className="absolute inset-0 bg-[#000]/80 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative z-[210] glass border border-white/20 rounded-[3.5rem] p-10 md:p-14 max-w-2xl w-full shadow-2xl overflow-hidden text-center">
                            <AnimatePresence mode="wait">
                                {registrationStep === "search" && (
                                    <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <div className="h-20 w-20 rounded-3xl bg-[#FF0000] flex items-center justify-center mx-auto mb-8 shadow-lg shadow-[#FF0000]/20"><Search className="h-10 w-10 text-white" /></div>
                                        <h2 className="text-4xl font-black uppercase italic mb-4">Identify Signal</h2>
                                        <p className="text-white/60 mb-10 font-medium italic whitespace-normal">Enter your artist name as it appears on Spotify to begin the verification protocol.</p>
                                        <input autoFocus type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && searchSpotifyArtists()} placeholder="Artist Name..." className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-xl font-black italic uppercase text-white mb-8 outline-none" />
                                        <div className="flex gap-4">
                                            <button onClick={() => setShowArtistModal(false)} className="flex-1 bg-white/5 text-white/40 font-black py-5 rounded-2xl text-[10px] uppercase border border-white/10">Cancel</button>
                                            <button onClick={() => searchSpotifyArtists(0)} disabled={searchingSpotify || !searchQuery.trim()} className="flex-2 bg-[#FF0000] text-white font-black py-5 px-10 rounded-2xl text-[10px] uppercase shadow-lg shadow-[#FF0000]/20 hover:scale-105 transition-all">
                                                {searchingSpotify ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Search Profiles"}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                                {registrationStep === "select" && (
                                    <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <h2 className="text-3xl font-black uppercase italic mb-6">Select Your <span className="text-[#FF0000]">Profile</span></h2>
                                        <div className="max-h-[40vh] overflow-y-auto mb-10 pr-2 sb space-y-3">
                                            {searchResults.map((artist) => (
                                                <button key={artist.id} onClick={() => handleArtistSelect(artist)} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#FF0000]/50 hover:bg-white/10 transition-all text-left group">
                                                    {artist.image ? <img src={artist.image} className="h-14 w-14 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all" /> : <div className="h-14 w-14 bg-white/10 flex items-center justify-center"><Users className="h-6 w-6 text-white/20" /></div>}
                                                    <div className="flex-1 min-w-0"><p className="font-black text-white italic uppercase truncate">{artist.name}</p><p className="mono text-[9px] text-white/40 uppercase tracking-widest truncate">{artist.style}</p></div>
                                                    <ArrowRight className="h-4 w-4 text-[#FF0000] opacity-0 group-hover:opacity-100 transition-all" />
                                                </button>
                                            ))}
                                            {searchResults.length > 0 && searchResults.length % 6 === 0 && (
                                                <button onClick={() => searchSpotifyArtists(searchOffset + 6)} disabled={loadingMoreArtists} className="w-full p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all flex items-center justify-center gap-2 mono text-[9px] uppercase tracking-widest text-[#FF0000] font-black">{loadingMoreArtists ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} LOAD MORE</button>
                                            )}
                                        </div>
                                        <button onClick={() => setRegistrationStep("search")} className="mono text-[9px] uppercase tracking-[0.3em] text-white/30 hover:text-white transition-all underline underline-offset-4">← Return to search</button>
                                    </motion.div>
                                )}
                                {registrationStep === "email" && (
                                    <motion.div key="email" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <div className="h-20 w-20 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-8"><Mail className="h-10 w-10 text-blue-400" /></div>
                                        <h2 className="text-4xl font-black uppercase italic mb-4 text-white">Verification <span className="text-blue-400">Queue</span></h2>
                                        <p className="text-white/60 mb-10 font-medium italic whitespace-normal">Establishing uplink for <span className="text-white font-black">{selectedArtist.name}</span>. Enter your professional email for identity confirmation.</p>
                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center space-y-6">
                                            <div className="relative">
                                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-blue-400 opacity-50" />
                                                <input
                                                    autoFocus
                                                    type="email"
                                                    value={contactEmail}
                                                    onChange={(e) => setContactEmail(e.target.value)}
                                                    onKeyDown={(e) => e.key === "Enter" && handleVerificationSubmit()}
                                                    placeholder="artist@label.com"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-6 pl-16 pr-6 text-xl font-black italic text-white outline-none focus:border-blue-400/50 transition-all uppercase placeholder:text-white/20"
                                                />
                                            </div>
                                            <div className="flex gap-4">
                                                <button onClick={() => setRegistrationStep("select")} className="flex-1 bg-white/5 text-white/40 font-black py-5 rounded-2xl text-[10px] uppercase border border-white/10">Go Back</button>
                                                <button
                                                    onClick={() => window.location.href = `/login?email=${encodeURIComponent(contactEmail)}`}
                                                    disabled={submitting || !contactEmail.includes("@")}
                                                    className="flex-2 bg-blue-600 text-white font-black py-5 px-10 rounded-2xl text-[10px] uppercase shadow-lg shadow-blue-600/20 hover:scale-105 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Mail className="h-4 w-4" /> Verify Identity
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                                {registrationStep === "success" && (
                                    <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <div className="h-24 w-24 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-10"><CheckCircle2 className="h-12 w-12 text-green-400" /></div>
                                        <h2 className="text-5xl font-black uppercase italic mb-6">Uplink <span className="text-green-400">Locked</span></h2>
                                        <p className="text-white/80 text-lg mb-12 italic font-medium leading-relaxed whitespace-normal">Your request for <span className="text-white font-black">{selectedArtist.name}</span> has been broadcasted. Our team will verify your signal within 48 hours.</p>
                                        <button onClick={() => { setShowArtistModal(false); setRegistrationStep("search"); setSelectedArtist(null); setSearchQuery(""); setContactEmail(""); }} className="w-full bg-white text-black font-black py-6 rounded-3xl text-xs uppercase shadow-xl hover:scale-[1.02] transition-all">Return To Tribe</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

