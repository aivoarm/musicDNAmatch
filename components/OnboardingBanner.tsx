"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, X } from "lucide-react";

interface OnboardingBannerProps {
    onActivate: () => void;
    onDismiss: () => void;
    visible: boolean;
}

export default function OnboardingBanner({ onActivate, onDismiss, visible }: OnboardingBannerProps) {
    if (!visible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                className="fixed top-14 md:top-16 inset-x-0 z-[90] bg-[#FF0000] text-white shadow-[0_4px_30px_rgba(255,0,0,0.3)]"
            >
                <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 shrink-0 rounded-xl bg-black/20 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-white animate-pulse" />
                        </div>
                        <div className="flex flex-col">
                            <h5 className="text-[11px] font-black uppercase tracking-tighter italic leading-none mb-1">Secure Your Signal</h5>
                            <p className="text-[9px] font-bold text-white/80 uppercase tracking-widest leading-none">
                                Identity verification required • <span className="text-white">Find Soulmates</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 border-l border-white/20 pl-4">
                        <button
                            onClick={onActivate}
                            className="bg-white text-[#FF0000] px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
                        >
                            SECURE DNA
                        </button>
                        <button
                            onClick={onDismiss}
                            className="p-2 hover:bg-black/10 rounded-full transition-colors opacity-60"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
