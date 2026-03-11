"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

// ─── Animated counter ─────────────────────────────────────────────────────
export function Ctr({ to, dur = 2000 }: { to: number; dur?: number }) {
    const [n, setN] = useState(0);
    useEffect(() => {
        let v = 0; const step = to / (dur / 16);
        const t = setInterval(() => { v += step; if (v >= to) { setN(to); clearInterval(t); } else setN(Math.floor(v)); }, 16);
        return () => clearInterval(t);
    }, [to, dur]);
    return <>{n}</>;
}

// ─── Step progress bar ───────────────────────────────────────────────────
const STEP_LABELS = ["Sources", "Tracks", "Genres", "Analyse"];
export function Stepper({ step }: { step: number }) {
    return (
        <div className="flex items-center justify-center lg:justify-start gap-1 mb-8 md:mb-10 w-full">
            {STEP_LABELS.map((l, i) => (
                <div key={l} className="flex items-center gap-1">
                    <div className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-full mono text-[9px] md:text-[10px] uppercase tracking-widest font-black transition-all duration-300
                        ${i < step ? "text-[#FF0000]/70" : i === step ? "bg-[#FF0000]/20 text-[#FF0000] border border-[#FF0000]/40" : "text-white/75"}`}>
                        {i < step ? <Check className="h-3 w-3" /> : <span>{i + 1}</span>}{l}
                    </div>
                    {i < STEP_LABELS.length - 1 && <div className="w-3 md:w-5 h-px bg-white/20" />}
                </div>
            ))}
        </div>
    );
}

// ─── DNA bar ──────────────────────────────────────────────────────────────
export function DnaBar({ label, value, red = true }: { label: string; value: number; red?: boolean }) {
    return (
        <div className="group/f">
            <div className="flex justify-between items-center mb-2.5">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80 group-hover/f:text-white transition-colors">{label}</span>
                <span className="mono text-sm text-[#FF0000] font-black">{value.toFixed(3)}</span>
            </div>
            <div className="h-3.5 w-full bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/25 group-hover/f:border-[#FF0000]/40 transition-all">
                <motion.div initial={{ width: 0 }} animate={{ width: `${value * 100}%` }} transition={{ duration: 1.1, ease: "easeOut" }}
                    className={`h-full rounded-full ${red ? "bg-[#FF0000] shadow-[0_0_16px_rgba(255,0,0,0.6)]" : "bg-white"}`} />
            </div>
        </div>
    );
}
