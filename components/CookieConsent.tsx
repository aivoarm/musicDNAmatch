"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";

export default function CookieConsent() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Check if user already accepted cookies
        const accepted = localStorage.getItem("cookie_consent");
        if (!accepted) {
            // Small delay so it doesn't flash on load
            const timer = setTimeout(() => setVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("cookie_consent", "accepted");
        setVisible(false);
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6"
                >
                    <div className="max-w-3xl mx-auto"
                        style={{
                            background: "rgba(10, 10, 10, 0.85)",
                            backdropFilter: "blur(24px)",
                            WebkitBackdropFilter: "blur(24px)",
                            borderRadius: "1.25rem",
                            border: "1px solid rgba(255, 255, 255, 0.12)",
                            boxShadow: "0 -8px 40px rgba(0, 0, 0, 0.5)",
                        }}
                    >
                        <div className="flex items-center gap-4 p-5 md:p-6">
                            {/* Cookie icon */}
                            <div className="h-10 w-10 rounded-xl bg-[#FF0000]/10 border border-[#FF0000]/20 flex items-center justify-center shrink-0">
                                <Cookie className="h-5 w-5 text-[#FF0000]" />
                            </div>

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                                <p className="text-white/90 text-xs font-bold leading-relaxed">
                                    We use cookies to keep your session alive and your DNA profile intact.{" "}
                                    <span className="text-white/50">
                                        No tracking, no ads — just essential cookies for your experience.
                                    </span>
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={handleAccept}
                                    className="bg-[#FF0000] text-white font-black text-[9px] uppercase tracking-widest px-5 py-2.5 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,0,0,0.25)]"
                                >
                                    Accept
                                </button>
                                <button
                                    onClick={handleAccept}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                    aria-label="Close"
                                >
                                    <X className="h-3.5 w-3.5 text-white/40" />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
