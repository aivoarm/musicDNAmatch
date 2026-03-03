"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Waves, User, Users, Search, Brain } from "lucide-react";

export default function Navbar() {
    const pathname = usePathname();
    const [hasDna, setHasDna] = useState(false);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        (async () => {
            try {
                const r = await fetch("/api/dna/profile/me");
                const d = await r.json();
                setHasDna(d.found);
            } catch { }
            finally { setLoading(false); }
        })();
    }, [pathname]);


    // Hide Navbar on home if not scanned yet? No, keep it for brand.
    // But we might want it to be translucent.

    return (
        <nav className="fixed top-0 left-0 right-0 z-[100] h-16 border-b border-white/10 bg-[#080808]/80 backdrop-blur-xl transition-all">
            <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
                {/* Brand */}
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="h-7 w-7 rounded-sm bg-[#FF0000] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Waves className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-black text-white text-base uppercase tracking-tighter italic">
                        musicDNA<span className="text-[#FF0000]">match</span>
                    </span>
                </Link>

                {/* Links */}
                <div className="flex items-center gap-4 sm:gap-6">
                    <AnimatePresence>
                        {hasDna && (
                            <>
                                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                                    <Link href="/soulmates" className={`mono text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-colors ${pathname === "/soulmates" ? "text-[#FF0000]" : "text-white/60 hover:text-white"}`}>
                                        <Users className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">Soulmates</span>
                                    </Link>
                                </motion.div>
                                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                                    <Link href="/profile" className={`mono text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-colors ${pathname === "/profile" ? "text-[#FF0000]" : "text-white/60 hover:text-white"}`}>
                                        <User className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">Profile</span>
                                    </Link>
                                </motion.div>
                            </>
                        )}
                        {!loading && !hasDna && pathname !== "/" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <Link href="/" className="mono text-[10px] uppercase tracking-widest text-[#FF0000] border border-[#FF0000]/30 px-3 py-1.5 rounded-lg hover:bg-[#FF0000]/10 transition-all">
                                    Start Discovery
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </nav>
    );
}
