"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Radio,
    Heart,
    ArrowRight,
    Binary,
    Waves,
    Zap,
    Brain,
    ChevronRight,
    Lock,
    Sparkles,
    Search,
    User,
    Youtube
} from "lucide-react";
import Link from "next/link";

export default function Home() {
    const [step, setStep] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch("/api/auth/me");
                setIsLoggedIn(res.ok);
            } catch {
                setIsLoggedIn(false);
            } finally {
                setCheckingStatus(false);
            }
        };
        checkAuth();
    }, []);

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => Math.max(0, s - 1));

    const steps = [
        // --- STEP 0: THE GENESIS ---
        {
            id: "genesis",
            title: <>Music DNA <span className="text-primary italic">Match</span></>,
            subtitle: "Shift from passive listening to active mathematical discovery.",
            content: (
                <div className="flex flex-col items-center gap-8">
                    <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl text-center leading-relaxed">
                        Standard playlists are based on names and tags.
                        <span className="text-white font-bold ml-1">Music DNA</span> is different.
                        It extracts the literal structural geometry of the music you love.
                    </p>
                    <button
                        onClick={nextStep}
                        className="group flex items-center gap-3 bg-white/5 hover:bg-white/10 px-8 py-4 rounded-full font-bold border border-white/10 transition-all"
                    >
                        How does it work?
                        <ChevronRight className="h-5 w-5 text-primary" />
                    </button>
                </div>
            )
        },
        // --- STEP 1: THE SCIENCE (VQ) ---
        {
            id: "science",
            title: "Vector Quantization",
            subtitle: "Translating vibes into 5-dimensional math.",
            content: (
                <div className="flex flex-col gap-10 w-full max-w-4xl">
                    <div className="glass p-8 md:p-12 rounded-[2.5rem] border-white/5 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Binary className="h-32 w-32 text-primary" />
                        </div>
                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 text-left">
                            <div className="space-y-6">
                                <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                                    We summarize complex audio into a single 5-digit fingerprint that captures the "soul" of your taste.
                                </p>
                                <div className="space-y-4">
                                    <div className="flex gap-4 items-center">
                                        <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center"><Waves className="h-5 w-5 text-primary" /></div>
                                        <div className="text-sm"><span className="font-bold text-white block">Spectral DNA</span> The color and warmth of the sound.</div>
                                    </div>
                                    <div className="flex gap-4 items-center">
                                        <div className="h-10 w-10 shrink-0 rounded-xl bg-orange-500/10 flex items-center justify-center"><Zap className="h-5 w-5 text-orange-500" /></div>
                                        <div className="text-sm"><span className="font-bold text-white block">Rhythmic DNA</span> The pulse and energy of the beat.</div>
                                    </div>
                                    <div className="flex gap-4 items-center">
                                        <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-500/10 flex items-center justify-center"><Brain className="h-5 w-5 text-blue-500" /></div>
                                        <div className="text-sm"><span className="font-bold text-white block">Psychoacoustic DNA</span> The neurological depth and immersion.</div>
                                    </div>
                                </div>
                            </div>
                            <div className="glass bg-black/40 border-white/5 rounded-2xl p-6 font-mono text-[13px] leading-relaxed relative flex flex-col justify-center">
                                <div className="absolute top-3 right-4 text-[10px] text-white/20 uppercase tracking-widest font-black">vector_out.json</div>
                                <pre className="text-blue-300">
                                    {`{
  "spectral": [0.5, 0.5, 0.5],
  "rhythmic": [0.85, 0.4],
  "psychoacoustic": [0.9, 0.91]
}`}
                                </pre>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center gap-4">
                        <button onClick={prevStep} className="px-6 py-3 text-sm font-medium text-white/50 hover:text-white transition-colors">Go Back</button>
                        <button
                            onClick={nextStep}
                            className="group flex items-center justify-center gap-2 bg-primary px-10 py-4 rounded-full font-bold text-primary-foreground transition-all hover:scale-105 active:scale-95 glow-primary"
                        >
                            Decode My DNA
                            <ArrowRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )
        },
        // --- STEP 2: LOGIN ---
        {
            id: "login",
            title: "Identity Verification",
            subtitle: "Connect your YouTube Library to generate your unique cloud-vector.",
            content: (
                <div className="flex flex-col items-center gap-12 mt-10">
                    <div className="relative">
                        <div className="h-40 w-40 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center animate-spin-slow">
                            <Lock className="h-12 w-12 text-white/20" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="h-10 w-10 text-[#FF0000] animate-pulse" />
                        </div>
                    </div>

                    {!checkingStatus && (
                        isLoggedIn ? (
                            <div className="flex flex-col items-center gap-6">
                                <p className="text-xl text-green-400 font-bold flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Identity Authenticated
                                </p>
                                <button
                                    onClick={nextStep}
                                    className="group flex items-center justify-center gap-2 bg-[#FF0000] px-10 py-4 rounded-full font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#FF0000]/20"
                                >
                                    Access Ecosystem
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-8 w-full max-w-md">
                                <p className="text-muted-foreground text-center text-lg leading-relaxed italic">
                                    "We analyze your listening history from YouTube Activities to extract your sonic geometry."
                                </p>
                                <div className="flex flex-col gap-4 w-full">
                                    <a
                                        href="/api/auth/google/login"
                                        className="flex items-center justify-center gap-3 bg-[#FF0000] text-white font-black py-5 rounded-full hover:bg-[#e00000] transition-all hover:scale-105 shadow-lg shadow-red-500/20"
                                    >
                                        <Youtube className="h-6 w-6" />
                                        Authorize Google
                                    </a>
                                    <button onClick={prevStep} className="text-sm text-white/40 hover:text-white transition-colors py-2">Wait, tell me more about the math</button>
                                </div>
                            </div>
                        )
                    )}
                </div>
            )
        },
        // --- STEP 3: ECOSYSTEM ---
        {
            id: "ecosystem",
            title: "The Ecosystem",
            subtitle: "Broadcast your vibe. Match with the world.",
            content: (
                <div className="flex flex-col items-center gap-12 w-full max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                        <div className="glass p-10 rounded-[2.5rem] text-left border-white/5 hover:border-white/10 transition-colors group relative overflow-hidden">
                            <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Radio className="h-40 w-40 text-primary" />
                            </div>
                            <div className="mb-6 inline-flex p-4 rounded-2xl bg-primary/10 text-primary">
                                <Radio className="h-8 w-8 animate-pulse" />
                            </div>
                            <h3 className="text-2xl font-black mb-4 flex items-center gap-2">
                                01 / BROADCAST
                            </h3>
                            <p className="text-muted-foreground leading-relaxed mb-8">
                                Upload your DNA to the global Euclidean space. This keeps your signal active for others to find, acting as a "vibe lighthouse" in the digital noise.
                            </p>
                            <Link
                                href="/broadcast"
                                className="inline-flex items-center gap-2 font-bold text-primary group-hover:gap-4 transition-all"
                            >
                                Enter Radio Room <ArrowRight className="h-5 w-5" />
                            </Link>
                        </div>

                        <div className="glass p-10 rounded-[2.5rem] text-left border-white/5 hover:border-white/10 transition-colors group relative overflow-hidden">
                            <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Search className="h-40 w-40 text-white" />
                            </div>
                            <div className="mb-6 inline-flex p-4 rounded-2xl bg-white/10 text-white">
                                <Search className="h-8 w-8" />
                            </div>
                            <h3 className="text-2xl font-black mb-4 flex items-center gap-2">
                                02 / MATCH
                            </h3>
                            <p className="text-muted-foreground leading-relaxed mb-8">
                                Perform cosine similarity searches against the global pool. Find the top 1% of users who share your specific audio geometry.
                            </p>
                            <Link
                                href="/match"
                                className="inline-flex items-center gap-2 font-bold text-white group-hover:gap-4 transition-all"
                            >
                                Deploy Matcher <ArrowRight className="h-5 w-5" />
                            </Link>
                        </div>

                        <div className="glass p-10 rounded-[2.5rem] text-left border-[#FF0000]/10 hover:border-[#FF0000]/30 transition-colors group relative overflow-hidden md:col-span-2 lg:col-span-1">
                            <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Youtube className="h-40 w-40 text-[#FF0000]" />
                            </div>
                            <div className="mb-6 inline-flex p-4 rounded-2xl bg-[#FF0000]/10 text-[#FF0000]">
                                <Youtube className="h-8 w-8" />
                            </div>
                            <h3 className="text-2xl font-black mb-4 flex items-center gap-2 text-white">
                                03 / SCAN
                            </h3>
                            <p className="text-muted-foreground leading-relaxed mb-8">
                                Cross-pollinate your DNA with external signals. Point our X-Ray engine at any YouTube video to extract and merge its sonic properties.
                            </p>
                            <Link
                                href="/youtube"
                                className="inline-flex items-center gap-2 font-bold text-[#FF0000] group-hover:gap-4 transition-all"
                            >
                                Open Scanner <ArrowRight className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    const currentStep = steps[step];

    return (
        <div className="relative min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 overflow-hidden">
            {/* Progress Bar */}
            <div className="fixed top-20 left-0 right-0 z-40 flex justify-center gap-2 px-10">
                {steps.map((_, i) => (
                    <div
                        key={i}
                        className={`h-1 rounded-full transition-all duration-500 ${i === step ? "w-12 bg-primary" : i < step ? "w-6 bg-white/40" : "w-6 bg-white/10"
                            }`}
                    />
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.6, ease: "anticipate" }}
                    className="w-full flex flex-col items-center py-20 lg:py-40"
                >
                    <motion.div className="max-w-4xl text-center flex flex-col items-center w-full">
                        <motion.h1 className="text-5xl md:text-8xl font-black tracking-tight mb-4 bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
                            {currentStep.title}
                        </motion.h1>
                        <motion.h2 className="text-xl md:text-2xl font-medium text-primary mb-16 italic tracking-wide uppercase">
                            {currentStep.subtitle}
                        </motion.h2>

                        {currentStep.content}
                    </motion.div>
                </motion.div>
            </AnimatePresence>

            {/* Background Decorative Elements */}
            <div className={`fixed top-1/4 left-1/4 -z-10 h-64 w-64 blur-[120px] rounded-full animate-float transition-colors duration-1000 ${step === 1 ? "bg-orange-500/20" : step === 2 ? "bg-blue-500/20" : "bg-primary/20"
                }`} />
            <div className={`fixed bottom-1/4 right-1/4 -z-10 h-96 w-96 blur-[150px] rounded-full animate-pulse-glow transition-colors duration-1000 ${step === 1 ? "bg-primary/20" : step === 3 ? "bg-purple-500/10" : "bg-secondary/10"
                }`} />

            <footer className="w-full max-w-7xl px-10 py-10 flex flex-col sm:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] opacity-30">
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
                    <p>© 2026 ARMAN AYVA. ALL RIGHTS RESERVED.</p>
                    <a href="https://www.armanayva.com" className="hover:text-[#FF0000] transition-colors">WWW.ARMANAYVA.COM</a>
                </div>
                <div className="flex gap-8 text-center sm:text-right">
                    <a href="https://dna.armanayva.com/privacy" className="hover:text-[#FF0000] transition-colors">
                        PRIVACY POLICY
                    </a>
                    <a href="https://dna.armanayva.com/terms" className="hover:text-[#FF0000] transition-colors font-black">
                        TERMS & CONDITIONS
                    </a>
                </div>
            </footer>

            <style jsx global>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 12s linear infinite;
                }
            `}</style>
        </div>
    );
}
