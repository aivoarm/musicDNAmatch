"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Waves, User, Users, Play, Activity, ChevronRight, Check } from "lucide-react";
import Link from "next/link";

type ChatStep = "greeting" | "story_jack" | "story_jane" | "story_match" | "story_result" | "cta";

interface HomeOnboardingProps {
    existing: any;
    checking: boolean;
    displayName: string;
    city: string;
    onResume: () => void;
    onBegin: () => void;
}

function TypingIndicator() {
    return (
        <div className="flex items-end gap-2">
            <div className="h-8 w-8 rounded-full bg-[#FF0000]/20 border border-[#FF0000]/30 flex items-center justify-center shrink-0">
                <Waves className="h-3.5 w-3.5 text-[#FF0000]" />
            </div>
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0 }} className="h-1.5 w-1.5 rounded-full bg-white/50 inline-block" />
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }} className="h-1.5 w-1.5 rounded-full bg-white/50 inline-block" />
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }} className="h-1.5 w-1.5 rounded-full bg-white/50 inline-block" />
            </div>
        </div>
    );
}

function SystemBubble({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, delay, ease: "easeOut" }}
            className="flex items-end gap-2.5 max-w-[85%] md:max-w-[70%]"
        >
            <div className="h-8 w-8 rounded-full bg-[#FF0000]/25 border border-[#FF0000]/40 flex items-center justify-center shrink-0 mb-0.5">
                <Waves className="h-3.5 w-3.5 text-[#FF0000]" />
            </div>
            <div className="bg-white/10 border border-white/20 rounded-2xl rounded-bl-sm px-5 py-3.5 text-white text-sm leading-relaxed font-bold">
                {children}
            </div>
        </motion.div>
    );
}

export default function HomeOnboarding({ existing, checking, displayName, city, onResume, onBegin }: HomeOnboardingProps) {
    const [step, setStep] = useState<ChatStep>("greeting");
    const [typing, setTyping] = useState(false);
    const [visibleMessages, setVisibleMessages] = useState(1);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 100);
    }, [visibleMessages, step, typing]);

    const revealWithDelay = (afterMs: number, then: () => void) => {
        setTyping(true);
        setTimeout(() => { setTyping(false); then(); }, afterMs);
    };

    useEffect(() => {
        if (existing) {
            setStep("cta");
            setVisibleMessages(5);
            return;
        }

        revealWithDelay(1200, () => {
            setStep("cta");
            setVisibleMessages(1);
        });
    }, [existing]);

    return (
        <motion.div
            key="conv"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen w-full flex flex-col"
        >
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/3 h-[500px] w-[500px] blur-[180px] rounded-full bg-[#FF0000]/7" />
                <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] blur-[160px] rounded-full bg-orange-900/6" />
            </div>

            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#080808]/80 backdrop-blur-xl">
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-[#FF0000] flex items-center justify-center">
                        <Waves className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="font-black text-white text-sm uppercase tracking-widest">musicDNA<span className="text-[#FF0000]">match</span></span>
                </div>
                <div className="flex gap-5 items-center">
                    <Link href="/profile" className="mono text-[10px] text-white/30 hover:text-white transition-colors uppercase tracking-[0.2em] hidden md:flex items-center gap-1.5"><User className="h-3 w-3" />Profile</Link>
                    <Link href="/soulmates" className="mono text-[10px] text-white/30 hover:text-white transition-colors uppercase tracking-[0.2em] hidden md:flex items-center gap-1.5"><Users className="h-3 w-3" />Soulmates</Link>
                </div>
            </div>

            <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 pt-24 pb-8">
                {step === "greeting" && (
                    <div className="flex flex-col gap-4 flex-1">
                        <SystemBubble delay={0.1}>
                            Hey there 👋 Welcome to <span className="text-white font-black">musicDNAmatch</span>.
                        </SystemBubble>
                    </div>
                )}

                {(step === "story_jack" || step === "story_jane" || step === "story_match" || step === "story_result" || step === "cta") && (
                    <div className="flex flex-col gap-4 flex-1">
                        {visibleMessages >= 1 && (
                            <SystemBubble delay={0}>
                                {displayName
                                    ? <>Hey <span className="text-white font-black">{displayName}</span> 🎵 Let's map your DNA.</>
                                    : <>Ready to map your unique sound? 🎵 let's go.</>}
                            </SystemBubble>
                        )}

                        {step === "cta" && visibleMessages >= 1 && (
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                className="mt-4 space-y-3"
                            >
                                <SystemBubble delay={0.2}>
                                    <span className="text-white font-black">Your story is waiting to be written.</span> Who shares your sound?
                                </SystemBubble>

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="ml-10 flex flex-col gap-3"
                                >
                                    <div className="bg-white/8 border border-white/20 rounded-2xl p-4 space-y-3">
                                        <div className="mono text-[9px] text-[#FF0000] uppercase tracking-widest font-black">How it works</div>
                                        {[
                                            ["🎵", "Connect Spotify or YouTube"],
                                            ["🧬", "Generate your 12D Musical DNA"],
                                            ["🔍", "Match with sonic soulmates worldwide"],
                                        ].map(([icon, text]) => (
                                            <div key={text} className="flex items-center gap-3 text-sm text-white/90 font-bold">
                                                <span className="text-base">{icon}</span>{text}
                                            </div>
                                        ))}
                                    </div>

                                    {existing && !checking ? (
                                        <button
                                            onClick={onResume}
                                            className="relative w-full flex items-center justify-center gap-3 bg-[#FF0000] text-white font-black text-sm uppercase tracking-widest py-5 rounded-2xl hover:bg-red-500 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_40px_rgba(255,0,0,0.4)] overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full shimmer pointer-events-none" />
                                            <Activity className="h-4 w-4" />
                                            See My Matches, {displayName || "you"}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={onBegin}
                                            className="relative w-full flex items-center justify-center gap-3 bg-[#FF0000] text-white font-black text-sm uppercase tracking-widest py-5 rounded-2xl hover:bg-red-500 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_40px_rgba(255,0,0,0.4)] overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full shimmer pointer-events-none" />
                                            <Play className="h-6 w-6 fill-white" />
                                            Start My Journey!
                                        </button>
                                    )}

                                    {existing && !checking && (
                                        <button onClick={onBegin} className="flex items-center justify-center gap-2 border border-white/20 bg-white/5 text-white/80 hover:text-white hover:border-white/40 font-black text-xs uppercase tracking-widest py-4 rounded-2xl transition-all">
                                            <Play className="h-3 w-3" />Start New Analysis
                                        </button>
                                    )}


                                </motion.div>
                            </motion.div>
                        )}
                    </div>
                )}
                <div ref={bottomRef} className="h-4" />
            </div>
            {typing && (
                <div className="max-w-2xl mx-auto w-full px-4 mb-4">
                    <TypingIndicator />
                </div>
            )}
        </motion.div>
    );
}
