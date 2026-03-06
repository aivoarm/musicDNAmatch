"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Waves, User, Users, Search, Info, Menu, X, Bell } from "lucide-react";

export default function Navbar() {
    const pathname = usePathname();
    const [hasDna, setHasDna] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchProfileData = async () => {
        try {
            const r = await fetch("/api/dna/profile/me");
            const d = await r.json();
            setHasDna(d.found);
            if (d.found) {
                // If we found DNA, also check for notifications
                const nr = await fetch("/api/match/notifications");
                const nd = await nr.json();
                setNotifications(nd.signals || []);
                setUnreadCount((nd.signals || []).length);
            }
        } catch { }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchProfileData();
        // Set up a small interval for "notifications"
        const interval = setInterval(() => {
            if (hasDna) {
                fetch("/api/match/notifications")
                    .then(r => r.json())
                    .then(nd => {
                        setNotifications(nd.signals || []);
                        setUnreadCount((nd.signals || []).length);
                    }).catch(() => { });
            }
        }, 30000); // 30 sec poll
        return () => clearInterval(interval);
    }, [pathname, hasDna]);

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
                            className={`mono text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-colors ${pathname === link.href ? "text-[#FF0000]" : "text-white/90 hover:text-white"}`}
                        >
                            <link.icon className="h-3.5 w-3.5" />
                            <span>{link.label}</span>
                        </Link>
                    ))}

                    {/* Notification Bell */}
                    {hasDna && (
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowNotifications(!showNotifications);
                                    if (!showNotifications) setUnreadCount(0);
                                }}
                                className={`flex items-center gap-1.5 mono text-[10px] uppercase tracking-widest transition-colors ${showNotifications ? "text-[#FF0000]" : "text-white/90 hover:text-white"}`}
                            >
                                <div className="relative">
                                    <Bell className="h-3.5 w-3.5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-[#FF0000] rounded-full animate-pulse" />
                                    )}
                                </div>
                                <span className="hidden lg:inline">Signals</span>
                            </button>

                            {/* Dropdown UI */}
                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-10 right-0 w-64 bg-[#0A0A0A] border border-white/25 rounded-2xl p-3 shadow-2xl backdrop-blur-3xl z-[110]"
                                    >
                                        <div className="flex items-center justify-between mb-3 px-1">
                                            <span className="mono text-[8px] uppercase tracking-widest text-white/70">Incoming DNA Signals</span>
                                            <span className="text-[8px] font-black bg-[#FF0000]/20 text-[#FF0000] px-1.5 py-0.5 rounded-full">{notifications.length}</span>
                                        </div>
                                        <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 custom-sb">
                                            {notifications.length === 0 ? (
                                                <div className="py-8 text-center bg-white/3 rounded-xl border border-white/5">
                                                    <p className="mono text-[8px] text-white/30 uppercase tracking-[0.2em]">Silence is golden...</p>
                                                </div>
                                            ) : (
                                                notifications.map((sig, i) => (
                                                    <div key={sig.id || i} className="p-3 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl transition-all group">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <p className="text-[10px] font-black text-white italic truncate">{sig.senderName}</p>
                                                                <p className="mono text-[7px] text-white/60 uppercase mt-0.5">Expressed Interest</p>
                                                            </div>
                                                            <Link href="/soulmates" onClick={() => setShowNotifications(false)} className="text-[#FF0000] hover:scale-110 transition-transform">
                                                                <Users className="h-3 w-3" />
                                                            </Link>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <Link
                                            href="/soulmates"
                                            onClick={() => setShowNotifications(false)}
                                            className="mt-3 block text-center py-2 bg-white/10 hover:bg-[#FF0000]/20 text-white/70 hover:text-[#FF0000] mono text-[8px] uppercase tracking-widest rounded-lg transition-all"
                                        >
                                            View Soulmates Feed
                                        </Link>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <div className="flex md:hidden items-center gap-4">
                    {/* Mobile Notification Indication */}
                    {hasDna && unreadCount > 0 && !isMenuOpen && (
                        <Link href="/soulmates" className="relative h-6 w-6 flex items-center justify-center text-[#FF0000]">
                            <Bell className="h-4 w-4" />
                            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-[#FF0000] rounded-full" />
                        </Link>
                    )}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="text-white/90 hover:text-white transition-colors"
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
                        className="absolute top-16 left-0 right-0 bg-[#080808] border-b border-white/25 p-6 flex flex-col gap-6 md:hidden z-[90] shadow-2xl"
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
                                className={`mono text-xs uppercase tracking-widest flex items-center gap-3 transition-colors ${pathname === link.href ? "text-[#FF0000]" : "text-white/90 hover:text-white"}`}
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
