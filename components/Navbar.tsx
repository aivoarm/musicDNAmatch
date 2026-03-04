"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Waves, User, Users, Search, Info, Menu, X } from "lucide-react";

export default function Navbar() {
    const pathname = usePathname();
    const [hasDna, setHasDna] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);


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

    const navLinks = [
        { href: "/", label: "Discovery", icon: Search, show: true },
        { href: "/soulmates", label: "Soulmates", icon: Users, show: hasDna },
        { href: "/profile", label: "Profile", icon: User, show: hasDna },
        { href: "/about", label: "About", icon: Info, show: true },
    ];

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

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-6">
                    {navLinks.filter(link => link.show).map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => {
                                if (link.label === "Soulmates") {
                                    fetch('/api/dna/intent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ intent: 'find_soulmates' }) }).catch(console.error);
                                }
                            }}
                            className={`mono text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-colors ${pathname === link.href ? "text-[#FF0000]" : "text-white/60 hover:text-white"}`}
                        >
                            <link.icon className="h-3.5 w-3.5" />
                            <span>{link.label}</span>
                        </Link>
                    ))}
                </div>

                {/* Mobile Menu Toggle */}
                <div className="flex md:hidden items-center gap-4">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="text-white/60 hover:text-white transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-16 left-0 right-0 bg-[#080808] border-b border-white/10 p-6 flex flex-col gap-6 md:hidden z-[90] shadow-2xl"
                    >
                        {navLinks.filter(link => link.show).map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    if (link.label === "Soulmates") {
                                        fetch('/api/dna/intent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ intent: 'find_soulmates' }) }).catch(console.error);
                                    }
                                }}
                                className={`mono text-xs uppercase tracking-widest flex items-center gap-3 transition-colors ${pathname === link.href ? "text-[#FF0000]" : "text-white/60 hover:text-white"}`}
                            >
                                <link.icon className="h-4 w-4" />
                                <span>{link.label}</span>
                            </Link>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
