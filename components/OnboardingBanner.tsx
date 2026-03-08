"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ArrowRight, X } from "lucide-react";

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
                className="fixed top-0 inset-x-0 z-[60] bg-purple-900/95 backdrop-blur-xl border-b border-purple-500/40 text-white shadow-2xl"
            >
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center animate-pulse">
                            <AlertTriangle className="h-4 w-4 text-purple-300" />
                        </div>
                        <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-purple-100 italic">
                            Your Musical DNA expires in <span className="text-white">24 hours</span> — secure it now to find soulmates.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <button
                            onClick={onActivate}
                            className="bg-white text-purple-900 px-4 md:px-6 py-2 rounded-full font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-purple-900/40"
                        >
                            Activate Profile <ArrowRight className="h-3 w-3" />
                        </button>
                        <button
                            onClick={onDismiss}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors opacity-60 hover:opacity-100"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
