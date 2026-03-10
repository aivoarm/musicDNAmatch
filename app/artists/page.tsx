"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music2, ArrowLeft, Star, Sparkles, Waves, Users, Zap, Brain, Fingerprint, Activity, Radio, Share2, ArrowRight, Search, Loader2, Mail, CheckCircle2, Plus, Play, Pause, MessageSquarePlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { matchScore, AXIS_LABELS } from "@/lib/dna";

import UnifiedArtistCard from "@/components/UnifiedArtistCard";

// Main Component
export default function MusicalTribe() {
    const [myDna, setMyDna] = useState<any>(null);
    const [matches, setMatches] = useState<any[]>([]);
    const [tribeOffset, setTribeOffset] = useState(0);
    const [hasMoreTribe, setHasMoreTribe] = useState(false);
    const [loadingTribe, setLoadingTribe] = useState(false);
    const [fans, setFans] = useState<any[]>([]);
    const [loadingFans, setLoadingFans] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showArtistModal, setShowArtistModal] = useState(false);
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
                        <Link href="/profile" className="group relative bg-[#FF0000] text-white font-black py-6 px-10 rounded-3xl uppercase tracking-widest text-[10px] italic flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,0,0,0.3)]">
                            <Plus className="h-5 w-5" /> Join The SYNDICATE
                        </Link>
                    </motion.div>
                </div>

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
                                        <UnifiedArtistCard key={artist.id} artist={artist} index={idx} hasDna={!!myDna} forceEmbed={true} hideSync={true} />
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
                                    <Link href="/profile" className="mt-8 text-[#FF0000] font-black italic uppercase text-xs hover:underline underline-offset-8 inline-block">Refine your DNA to join →</Link>
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

                {/* ── FUTURE PROTOCOL SECTION ── */}
                <section className="mt-40">
                    <div className="flex flex-col items-center text-center mb-20">
                        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mb-6 border border-white/10 px-4 py-1.5 rounded-full bg-white/5">
                            <Zap className="h-3 w-3 text-[#FF0000] fill-[#FF0000]" />
                            <span className="mono text-[8px] uppercase tracking-[0.3em] text-white/60">Protocol Roadmap v2.0</span>
                        </motion.div>
                        <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white mb-6">
                            The Future of <span className="text-[#FF0000]">Tribe</span>
                        </h2>
                        <p className="max-w-2xl text-white/50 text-sm font-medium italic leading-relaxed">
                            We are architecting the next generation of artist-fan connection. Moving beyond shallow followers into deep sonic resonance.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: Brain,
                                title: "Hyper-Taste Matching",
                                desc: "Connect with high-resonance listeners based on identical 12D vectors. No social algorithms, just pure musical compatibility.",
                                status: "In Alpha",
                                color: "border-[#FF0000]/30"
                            },
                            {
                                icon: Radio,
                                title: "Incipient Genre Seeding",
                                desc: "Be the blueprint for new frequencies. The protocol identifies your sound as 'Native' to emerging genres and suggests you directly to listeners exploring those frontiers.",
                                status: "Phase 2",
                                color: "border-blue-500/30"
                            },
                            {
                                icon: MessageSquarePlus,
                                title: "Resonance Bridges",
                                desc: "Launch community rooms gated by DNA. Access is granted only to those whose sonic identity aligns with your creative frequency.",
                                status: "Coming Soon",
                                color: "border-purple-500/30"
                            }
                        ].map((feat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`glass p-10 rounded-[3rem] border ${feat.color} hover:bg-white/[0.03] transition-all group`}
                            >
                                <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                    <feat.icon className="h-7 w-7 text-white/80" />
                                </div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">{feat.title}</h3>
                                    <span className="mono text-[8px] bg-white/10 px-2 py-1 rounded-full text-white/40 uppercase tracking-widest">{feat.status}</span>
                                </div>
                                <p className="text-white/40 text-xs font-medium italic leading-relaxed">
                                    {feat.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Dashboard Teaser */}
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} className="mt-12 glass rounded-[4rem] border border-white/5 p-8 md:p-12 bg-gradient-to-tr from-white/[0.02] to-transparent">
                        <div className="flex flex-col md:flex-row items-center gap-10">
                            <div className="flex-1">
                                <h4 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-4">The Creator <span className="text-[#FF0000]">Dashboard</span></h4>
                                <p className="text-white/40 text-sm font-medium italic leading-relaxed mb-6">
                                    A real-time heatmap of your global resonance. Understand where your fans are, what they are hearing, and how your sound is evolving the collective DNA.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    {['Sonic Analytics', 'Fan Heatmaps', 'Conversion Vectors', 'Sync Opportunities'].map(tag => (
                                        <div key={tag} className="mono text-[8px] border border-white/10 px-4 py-2 rounded-full text-white/30 uppercase tracking-widest">
                                            {tag}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="w-full md:w-1/3 aspect-[4/3] rounded-[2.5rem] bg-black/40 border border-white/10 flex items-center justify-center relative overflow-hidden">
                                <Activity className="h-20 w-20 text-[#FF0000]/20 animate-pulse" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                                    <span className="mono text-[10px] text-white/20 uppercase tracking-[0.5em] font-black">Interface Mock_v0.2</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </section>

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

            {/* Artist Verification Modal (Placeholder) */}
            <AnimatePresence>
                {showArtistModal && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowArtistModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass max-w-lg w-full rounded-[3rem] p-12 md:p-16 border border-[#FF0000]/20 relative z-10 text-center shadow-2xl shadow-[#FF0000]/10"
                        >
                            <div className="h-20 w-20 rounded-2xl bg-[#FF0000]/10 flex items-center justify-center mx-auto mb-10 border border-[#FF0000]/20">
                                <Sparkles className="h-10 w-10 text-[#FF0000] animate-pulse" />
                            </div>
                            <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-6">
                                We Are Not <br /><span className="text-[#FF0000]">There Yet</span>
                            </h3>
                            <p className="text-white/60 text-sm font-medium italic leading-relaxed mb-10">
                                The Syndicate is currently an invite-only collective. Stay tuned as we build the verification bridge for independent creators.
                            </p>
                            <div className="space-y-4">
                                <p className="mono text-[10px] text-white/30 uppercase tracking-[0.4em] mb-8 font-black">
                                    Enjoy being a fan • Connect to others
                                </p>
                                <button
                                    onClick={() => setShowArtistModal(false)}
                                    className="w-full bg-white text-black font-black py-5 rounded-2xl uppercase tracking-widest text-[12px] hover:scale-105 active:scale-95 transition-all text-sm shadow-xl"
                                >
                                    Understood
                                </button>
                            </div>
                            <div className="mt-12 pt-8 border-t border-white/5 opacity-30">
                                <span className="mono text-[8px] uppercase tracking-widest">Protocol Version: SYNDICATE_ALPHA_0.1</span>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Background Effects */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 h-[600px] w-[600px] blur-[200px] rounded-full bg-blue-600/5 animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 h-[600px] w-[600px] blur-[200px] rounded-full bg-[#FF0000]/5" />
            </div>

            {/* Footer Label */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none opacity-20">
                <p className="mono text-[8px] uppercase tracking-[2em] text-white whitespace-nowrap">
                    Tribe Neural Synchronization Protocol v1.4 // <a href="https://armanayva.com" target="_blank" rel="noopener noreferrer" className="pointer-events-auto hover:text-[#FF0000] transition-colors">armanayva.com</a>
                </p>
            </div>
        </div>
    );
}

