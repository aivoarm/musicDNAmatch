"use client";

import { motion } from "framer-motion";
import { Music2, ArrowLeft, Star, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ArtistsComingSoon() {
    const router = useRouter();

    return (
        <div className="relative min-h-screen bg-[#080808] text-white flex flex-col items-center justify-center p-6 overflow-hidden">
            <style>{`
                * { font-family: var(--font-syne), 'Syne', sans-serif; }
                .mono { font-family: 'DM Mono', monospace !important; }
                .glass { background: rgba(10, 10, 10, 0.75); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
            `}</style>

            {/* SEO Metadata (Mental check: Needs to be handled by app/layout or a separate Head for client pages) */}

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 glass rounded-[3rem] p-12 md:p-20 border border-white/20 max-w-2xl w-full text-center shadow-2xl"
            >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#FF0000] p-6 rounded-3xl shadow-[0_0_50px_rgba(255,0,0,0.3)]">
                    <Music2 className="h-12 w-12 text-white" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <span className="mono text-[10px] text-[#FF0000] uppercase tracking-[0.5em] font-black mb-6 block">Artist Ecosystem</span>
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic mb-8 leading-none">
                        Coming <span className="text-[#FF0000]">Soon</span>
                    </h1>

                    <p className="text-white/80 text-lg font-medium leading-relaxed mb-12 max-w-lg mx-auto italic">
                        We're building specialized tools for artists to analyze their listeners' DNA, find collaborative soulmates, and understand their resonance in the signal.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-center gap-3">
                            <Star className="h-6 w-6 text-amber-500" />
                            <p className="mono text-[9px] uppercase tracking-widest font-bold">Listener Deep-Dive</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-center gap-3">
                            <Sparkles className="h-6 w-6 text-blue-400" />
                            <p className="mono text-[9px] uppercase tracking-widest font-bold">Resonance Analytics</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/" className="bg-white text-black font-black py-4 px-10 rounded-2xl text-[12px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
                            <ArrowLeft className="h-4 w-4" /> Back to Signal
                        </Link>
                        <button className="bg-[#FF0000] text-white font-black py-4 px-10 rounded-2xl text-[12px] uppercase tracking-widest hover:bg-black border border-transparent hover:border-white/20 transition-all opacity-50 cursor-not-allowed">
                            Get Early Access
                        </button>
                    </div>
                </motion.div>
            </motion.div>

            {/* Background Effects */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] blur-[200px] rounded-full bg-[#FF0000]/10" />
                <div className="absolute -bottom-20 -right-20 h-96 w-96 blur-[150px] rounded-full bg-orange-600/10" />
            </div>
        </div>
    );
}
