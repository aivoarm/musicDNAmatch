"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Radio, User } from "lucide-react";

export default function Navbar() {
    const pathname = usePathname();
    const [user, setUser] = useState<{ name: string; image: string } | null>(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const res = await fetch("/api/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    setUser({ name: data.display_name, image: data.images?.[0]?.url || "" });
                } else {
                    setUser(null);
                }
            } catch {
                setUser(null);
            }
            setChecking(false);
        };
        checkUser();
    }, [pathname]);

    const navLinks = [
        { href: "/broadcast", label: "Broadcast" },
        { href: "/match", label: "Match" },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6 sm:px-10 border-b border-white/5 backdrop-blur-xl bg-black/40">
            {/* Brand */}
            <Link href="/" className="flex items-center gap-2.5 font-black text-lg tracking-tighter mr-8">
                <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
                    <Radio className="h-4 w-4 text-primary-foreground" />
                </div>
                <span>Music<span className="text-primary">DNA</span></span>
            </Link>

            {/* Nav links */}
            <div className="hidden sm:flex items-center gap-1">
                {navLinks.map(link => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`text-sm px-4 py-1.5 rounded-full font-medium transition-all ${pathname === link.href
                                ? "bg-white/10 text-white"
                                : "text-white/50 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        {link.label}
                    </Link>
                ))}
            </div>

            {/* Right side */}
            <div className="ml-auto flex items-center gap-3">
                {!checking && (
                    user ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-3"
                        >
                            <div className="text-right hidden sm:block">
                                <div className="text-xs font-bold leading-none">{user.name}</div>
                                <div className="text-[10px] text-green-400 font-mono mt-0.5">● BROADCASTING</div>
                            </div>
                            {user.image ? (
                                <img
                                    src={user.image}
                                    alt={user.name}
                                    className="h-8 w-8 rounded-full ring-2 ring-primary/40 object-cover"
                                />
                            ) : (
                                <div className="h-8 w-8 rounded-full bg-primary/20 ring-2 ring-primary/40 flex items-center justify-center">
                                    <User className="h-4 w-4 text-primary" />
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.a
                            href="/api/auth/spotify/login"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-2 bg-[#1DB954] text-black font-black text-sm px-4 py-2 rounded-full hover:bg-[#1ed760] hover:scale-105 active:scale-95 transition-all"
                        >
                            {/* Spotify logo */}
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                            </svg>
                            Sign in with Spotify
                        </motion.a>
                    )
                )}
            </div>
        </nav>
    );
}
