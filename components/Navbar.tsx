"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Radio, User, LogOut } from "lucide-react";

export default function Navbar() {
    const pathname = usePathname();
    const [user, setUser] = useState<{ name: string; image: string } | null>(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        // Session polling disabled for frictionless discovery
        setChecking(false);
    }, [pathname]);

    const handleLogout = async () => {
        try {
            const res = await fetch("/api/auth/logout", { method: "POST" });
            if (res.ok) {
                window.location.href = "/";
            }
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    const navLinks = [
        { href: "/broadcast", label: "Broadcast" },
        { href: "/match", label: "Match" },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6 sm:px-10 border-b border-white/5 backdrop-blur-xl bg-black/40">
            {/* Brand */}
            <Link href="/" className="flex items-center gap-2.5 font-black text-lg tracking-tighter mr-8">
                <div className="h-7 w-7 rounded-lg bg-[#FF0000] flex items-center justify-center">
                    <Radio className="h-4 w-4 text-white" />
                </div>
                <span>Music<span className="text-[#FF0000]">DNA</span></span>
            </Link>

            {/* Navbar links removed to focus on home journey */}

            {/* Right side */}
            <div className="ml-auto flex items-center gap-3">
                {!checking && user && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-3"
                    >
                        <div className="text-right hidden sm:block">
                            <div className="text-xs font-bold leading-none">{user.name}</div>
                            <div className="text-[10px] text-[#FF0000] font-mono mt-0.5">● BROADCASTING</div>
                        </div>
                        {user.image ? (
                            <img
                                src={user.image}
                                alt={user.name}
                                className="h-8 w-8 rounded-full ring-2 ring-[#FF0000]/40 object-cover"
                            />
                        ) : (
                            <div className="h-8 w-8 rounded-full bg-[#FF0000]/20 ring-2 ring-[#FF0000]/40 flex items-center justify-center">
                                <User className="h-4 w-4 text-[#FF0000]" />
                            </div>
                        )}
                        <button
                            onClick={handleLogout}
                            className="h-8 w-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 text-white/50 hover:text-[#FF0000] transition-all"
                            title="Sign Out"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </motion.div>
                )}
            </div>
        </nav>
    );
}
