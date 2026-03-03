"use client";

import { useEffect } from "react";
import { Waves, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Application Error:", error);
    }, [error]);

    return (
        <div className="relative min-h-screen bg-[#080808] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-1/3 h-[500px] w-[500px] blur-[200px] rounded-full bg-red-900/10" />
            </div>

            <div className="relative z-10 text-center px-6 max-w-md">
                <div className="h-16 w-16 rounded-full bg-red-500/15 border border-red-500/25 flex items-center justify-center mx-auto mb-8 animate-pulse">
                    <Waves className="h-8 w-8 text-red-500" />
                </div>
                <h1 className="text-3xl font-black text-white italic mb-2">Signal Disruption</h1>
                <p className="font-mono text-[10px] text-white/50 uppercase tracking-[0.4em] mb-6">
                    {error.digest ? `ERR_${error.digest.slice(0, 8).toUpperCase()}` : "RUNTIME_EXCEPTION"}
                </p>
                <p className="text-white/60 text-sm leading-relaxed mb-10">
                    Something went wrong in the sonic pipeline. This has been logged. Try again or return home.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button onClick={reset}
                        className="flex items-center gap-3 bg-[#FF0000] text-white font-black text-[11px] uppercase tracking-widest px-7 py-4 rounded-2xl hover:bg-red-500 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(255,0,0,0.25)]">
                        <RefreshCw className="h-4 w-4" />Try Again
                    </button>
                    <Link href="/"
                        className="flex items-center gap-3 border border-white/14 bg-white/5 text-white/70 hover:text-white hover:border-white/25 font-black text-[11px] uppercase tracking-widest px-7 py-4 rounded-2xl transition-all">
                        <Home className="h-4 w-4" />Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
