import Link from "next/link";
import { Waves, ArrowRight, Home } from "lucide-react";

export default function NotFound() {
    return (
        <div className="relative min-h-screen bg-[#080808] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-1/3 h-[500px] w-[500px] blur-[200px] rounded-full bg-[#FF0000]/8" />
                <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] blur-[180px] rounded-full bg-orange-900/6" />
            </div>

            <div className="relative z-10 text-center px-6 max-w-md">
                <div className="h-16 w-16 rounded-full bg-[#FF0000]/15 border border-[#FF0000]/25 flex items-center justify-center mx-auto mb-8">
                    <Waves className="h-8 w-8 text-[#FF0000]" />
                </div>
                <h1 className="text-7xl font-black text-white italic mb-2">404</h1>
                <p className="font-mono text-[10px] text-white/50 uppercase tracking-[0.4em] mb-6">Signal Lost in the Void</p>
                <p className="text-white/60 text-sm leading-relaxed mb-10">
                    This frequency doesn't exist in our sonic map. The page you're looking for may have shifted dimensions.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link href="/"
                        className="flex items-center gap-3 bg-[#FF0000] text-white font-black text-[11px] uppercase tracking-widest px-7 py-4 rounded-2xl hover:bg-red-500 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(255,0,0,0.25)]">
                        <Home className="h-4 w-4" />Back to Home
                    </Link>
                    <Link href="/match"
                        className="flex items-center gap-3 border border-white/14 bg-white/5 text-white/70 hover:text-white hover:border-white/25 font-black text-[11px] uppercase tracking-widest px-7 py-4 rounded-2xl transition-all">
                        Find Soulmates<ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
