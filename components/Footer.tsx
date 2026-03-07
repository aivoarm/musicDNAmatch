import Link from "next/link";
import { Waves } from "lucide-react";

export default function Footer() {
    return (
        <footer className="border-t border-white/5 bg-[#080808] relative z-20">
            <div className="max-w-7xl mx-auto px-6 py-12 md:py-8 flex flex-col md:flex-row items-center justify-between gap-6">

                {/* Brand / Logo */}
                <div className="flex items-center gap-2 group opacity-50 hover:opacity-100 transition-opacity">
                    <div className="h-5 w-5 rounded-sm bg-[#FF0000]/20 border border-[#FF0000]/50 flex items-center justify-center">
                        <Waves className="h-3 w-3 text-[#FF0000]" />
                    </div>
                    <span className="font-black text-white text-xs uppercase tracking-widest italic">
                        musicDNA<span className="text-[#FF0000] opacity-80">match</span>
                    </span>
                </div>

                {/* Links */}
                <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                    <Link href="/about" className="mono text-[10px] uppercase tracking-widest text-white/50 hover:text-white transition-colors">
                        About
                    </Link>
                    <Link href="/privacy" className="mono text-[10px] uppercase tracking-widest text-white/50 hover:text-white transition-colors">
                        Privacy
                    </Link>
                    <Link href="/terms" className="mono text-[10px] uppercase tracking-widest text-white/50 hover:text-white transition-colors">
                        Terms
                    </Link>
                </div>

                {/* Copyright info */}
                <div className="mono text-[9px] uppercase tracking-[0.2em] text-white/30 text-center md:text-right">
                    © {new Date().getFullYear()} DNA Protocol
                </div>

            </div>
        </footer>
    );
}
