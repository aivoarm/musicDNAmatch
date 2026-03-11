"use client";
import React from "react";
import { motion } from "framer-motion";

const TICKER_ITEMS = [
    "12-DIMENSIONAL VECTOR MAPPING", "EUCLIDEAN SOULMATE MATCHING",
    "SPOTIFY NEURAL SYNC", "YOUTUBE FREQUENCY EXTRACTION",
    "COHERENCE INDEX CALCULATION", "50 TRACK DEEP SCAN",
    "SPECTRAL CENTROID ANALYSIS", "REAL-TIME DNA BRIDGING"
];

export default function Ticker() {
    return (
        <div className="overflow-hidden border-y border-white/10 py-3 bg-black/40">
            <motion.div className="flex gap-12 whitespace-nowrap" animate={{ x: ["0%", "-50%"] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}>
                {[...TICKER_ITEMS, ...TICKER_ITEMS].map((s, i) => (
                    <span key={i} className="mono text-[10px] text-white/80 uppercase tracking-[0.3em] flex items-center gap-4">
                        <span className="text-[#FF0000]">◆</span>{s}
                    </span>
                ))}
            </motion.div>
        </div>
    );
}
