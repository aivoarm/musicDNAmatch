"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Waves, ArrowRight, Brain, ChevronRight, Youtube,
    Music2, HelpCircle, Plus, ExternalLink, CheckCircle2,
    Scan, Users, Play, User, Check, X,
    AlertCircle, Loader2, Search, Activity, MessageSquarePlus, Mail, Sparkles
} from "lucide-react";
import Link from "next/link";
import { AXIS_LABELS, generateInterpretation } from "@/lib/dna";
import ShareDNACard from "@/components/ShareDNACard";


// ─── Types ────────────────────────────────────────────────────────────────
type Stage = "landing" | "intro" | "welcome_name" | "welcome_story" | "sources" | "review_songs" | "genre_selection" | "analyzing" | "complete" | "email_capture";

interface Playlist {
    id: string; name: string; image?: string; track_count: number; url?: string;
}
interface YtTrack {
    id: string; url: string;
    title?: string; channel?: string; thumbnail?: string;
    status: "idle" | "loading" | "ok" | "error"; error?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────
const GENRES = [
    "Electronic", "Techno", "House", "Ambient", "Indie Rock", "Dream Pop",
    "Acid Jazz", "Minimal", "Industrial", "Synthwave", "Future Bass", "Nu-Disco",
    "Hip Hop", "R&B", "Jazz", "Classical", "Lo-Fi", "Phonk", "Metal", "Garage",
    "Pop", "Rock", "Funk", "Folk", "Country", "Blues", "Soul", "Punk", "Ska",
    "Reggae", "Disco", "Synthpop", "Grunge", "Alternative", "Experimental", "Techno-Pop",
    "Dubstep", "Trap", "Drill", "Grime", "Afrobeats", "Latin", "K-Pop", "J-Pop",
    "Folk Rock", "Hardcore", "Deep House", "Progressive", "Trance", "Gospel"
];

const TICKER = [
    "12-DIMENSIONAL VECTOR MAPPING", "EUCLIDEAN SOULMATE MATCHING",
    "SPOTIFY NEURAL SYNC", "YOUTUBE FREQUENCY EXTRACTION",
    "COHERENCE INDEX CALCULATION", "50 TRACK DEEP SCAN",
    "SPECTRAL CENTROID ANALYSIS", "REAL-TIME DNA BRIDGING"
];

// ─── DNA Helix ────────────────────────────────────────────────────────────
function DNAHelix() {
    const ref = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const c = ref.current; if (!c) return;
        const ctx = c.getContext("2d")!; let raf: number, t = 0;
        const resize = () => {
            c.width = c.offsetWidth * devicePixelRatio;
            c.height = c.offsetHeight * devicePixelRatio;
            ctx.scale(devicePixelRatio, devicePixelRatio);
        };
        resize(); window.addEventListener("resize", resize);
        const W = () => c.offsetWidth, H = () => c.offsetHeight;
        const draw = () => {
            ctx.clearRect(0, 0, W(), H()); t += 0.008;
            const cx = W() / 2, amp = W() * 0.28, steps = 80, sh = H() / steps;
            for (let s = 0; s < 2; s++) {
                const off = s === 0 ? 0 : Math.PI;
                const pts: [number, number][] = [];
                for (let i = 0; i <= steps; i++) pts.push([cx + amp * Math.sin(i * 0.18 + t + off), i * sh]);
                const g = ctx.createLinearGradient(0, 0, 0, H());
                if (s === 0) { g.addColorStop(0, "rgba(255,0,0,0)"); g.addColorStop(.3, "rgba(255,0,0,.6)"); g.addColorStop(.7, "rgba(255,80,0,.6)"); g.addColorStop(1, "rgba(255,0,0,0)"); }
                else { g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(.3, "rgba(255,255,255,.1)"); g.addColorStop(.7, "rgba(255,255,255,.1)"); g.addColorStop(1, "rgba(255,255,255,0)"); }
                ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
                for (let i = 1; i < pts.length - 1; i++) {
                    const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
                    ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
                }
                ctx.strokeStyle = g; ctx.lineWidth = s === 0 ? 2 : 1; ctx.stroke();
            }
            for (let i = 2; i <= steps - 2; i++) {
                if (i % 3 !== 0) continue;
                const y = i * sh, x0 = cx + amp * Math.sin(i * 0.18 + t), x1 = cx + amp * Math.sin(i * 0.18 + t + Math.PI);
                const b = (Math.sin(i * 0.18 + t) + 1) / 2;
                const rg = ctx.createLinearGradient(x0, y, x1, y);
                rg.addColorStop(0, `rgba(255,0,0,${.15 + b * .4})`); rg.addColorStop(.5, `rgba(255,${Math.floor(b * 120)},0,${.3 + b * .3})`); rg.addColorStop(1, `rgba(255,255,255,${.05 + b * .1})`);
                ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.strokeStyle = rg; ctx.lineWidth = 1; ctx.stroke();
                ctx.beginPath(); ctx.arc(x0, y, 2.5 + b * 1.5, 0, Math.PI * 2); ctx.fillStyle = `rgba(255,0,0,${.4 + b * .6})`; ctx.fill();
                ctx.beginPath(); ctx.arc(x1, y, 1.5 + b, 0, Math.PI * 2); ctx.fillStyle = `rgba(255,255,255,${.1 + b * .2})`; ctx.fill();
            }
            raf = requestAnimationFrame(draw);
        };
        draw();
        return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
    }, []);
    return <canvas ref={ref} className="absolute inset-0 w-full h-full" />;
}

// ─── Animated counter ─────────────────────────────────────────────────────
function Ctr({ to, dur = 2000 }: { to: number; dur?: number }) {
    const [n, setN] = useState(0);
    useEffect(() => {
        let v = 0; const step = to / (dur / 16);
        const t = setInterval(() => { v += step; if (v >= to) { setN(to); clearInterval(t); } else setN(Math.floor(v)); }, 16);
        return () => clearInterval(t);
    }, [to, dur]);
    return <>{n}</>;
}

// ─── Scrolling ticker ─────────────────────────────────────────────────────
function Ticker() {
    return (
        <div className="overflow-hidden border-y border-white/10 py-3 bg-black/40">
            <motion.div className="flex gap-12 whitespace-nowrap" animate={{ x: ["0%", "-50%"] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}>
                {[...TICKER, ...TICKER].map((s, i) => (
                    <span key={i} className="mono text-[10px] text-white/80 uppercase tracking-[0.3em] flex items-center gap-4">
                        <span className="text-[#FF0000]">◆</span>{s}
                    </span>
                ))}
            </motion.div>
        </div>
    );
}

// ─── Step progress bar ───────────────────────────────────────────────────
const STEP_LABELS = ["Sources", "Tracks", "Genres", "Analyse"];
function Stepper({ step }: { step: number }) {
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
function DnaBar({ label, value, red = true }: { label: string; value: number; red?: boolean }) {
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

// ═══════════════════════════════════════════════════════════════════════════
// CONVERSATIONAL ONBOARDING
// ═══════════════════════════════════════════════════════════════════════════

type ChatStep = "greeting" | "name_input" | "city_input" | "story_jack" | "story_jane" | "story_match" | "story_result" | "cta";

interface ConversationalOnboardingProps {
    existing: any;
    checking: boolean;
    displayName: string;
    setDisplayName: (n: string) => void;
    city: string;
    setCity: (c: string) => void;
    onResume: () => void;
    onBegin: () => void;
}

interface ChatMessage {
    id: string;
    from: "system" | "user";
    content: React.ReactNode;
    delay?: number;
}

function TypingIndicator() {
    return (
        <div className="flex items-end gap-2">
            <div className="h-8 w-8 rounded-full bg-[#FF0000]/20 border border-[#FF0000]/30 flex items-center justify-center shrink-0">
                <Waves className="h-3.5 w-3.5 text-[#FF0000]" />
            </div>
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0 }} className="h-1.5 w-1.5 rounded-full bg-white/50 inline-block" />
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }} className="h-1.5 w-1.5 rounded-full bg-white/50 inline-block" />
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }} className="h-1.5 w-1.5 rounded-full bg-white/50 inline-block" />
            </div>
        </div>
    );
}

function SystemBubble({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, delay, ease: "easeOut" }}
            className="flex items-end gap-2.5 max-w-[85%] md:max-w-[70%]"
        >
            <div className="h-8 w-8 rounded-full bg-[#FF0000]/25 border border-[#FF0000]/40 flex items-center justify-center shrink-0 mb-0.5">
                <Waves className="h-3.5 w-3.5 text-[#FF0000]" />
            </div>
            <div className="bg-white/10 border border-white/20 rounded-2xl rounded-bl-sm px-5 py-3.5 text-white text-sm leading-relaxed font-bold">
                {children}
            </div>
        </motion.div>
    );
}

function UserBubble({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, delay, ease: "easeOut" }}
            className="flex justify-end"
        >
            <div className="bg-[#FF0000] rounded-2xl rounded-br-sm px-5 py-3.5 text-white text-sm font-black max-w-[60%]">
                {children}
            </div>
        </motion.div>
    );
}

// Story card for Jack & Jane
function StoryCard({ name, color, genres, delay = 0 }: { name: string; color: string; genres: string[]; delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            className={`flex-1 min-w-[140px] rounded-2xl border p-4 ${color}`}
        >
            <div className="mono text-[9px] uppercase tracking-widest opacity-80 mb-1">Listener</div>
            <div className="font-black text-lg italic mb-3">{name}</div>
            <div className="flex flex-wrap gap-1.5">
                {genres.map(g => (
                    <span key={g} className="text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full bg-white/10 border border-white/20 text-white">{g}</span>
                ))}
            </div>
        </motion.div>
    );
}

const DEMO_VECTOR = [0.8, 0.4, 0.9, 0.3, 0.2, 0.7, 0.85, 0.6, 0.4, 0.75, 0.4, 0.9];
const DEMO_MATCH_VECTOR = [0.75, 0.35, 0.8, 0.4, 0.3, 0.6, 0.9, 0.5, 0.5, 0.65, 0.5, 0.85];

function RadarChart({ vector, color = "#FF0000" }: { vector: number[], color?: string }) {
    const size = 280;
    const cx = size / 2;
    const cy = size / 2;
    const maxR = size / 2 - 30;
    const n = vector.length;

    const getPoint = (idx: number, val: number) => {
        const angle = (Math.PI * 2 * idx) / n - Math.PI / 2;
        const x = cx + Math.cos(angle) * val * maxR;
        const y = cy + Math.sin(angle) * val * maxR;
        return { x: Number(x.toFixed(4)), y: Number(y.toFixed(4)) };
    };

    const gridLevels = [0.25, 0.5, 0.75, 1.0];
    const points = (Array.isArray(vector) ? vector : []).map((v, i) => getPoint(i, Number(v) || 0));
    const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}` : "255,0,0";
    };

    return (
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[280px] mx-auto overflow-visible">
            {gridLevels.map(level => {
                const pts = Array.from({ length: n }, (_, i) => getPoint(i, level));
                const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
                return <path key={level} d={d} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />;
            })}
            {Array.from({ length: n }, (_, i) => {
                const p = getPoint(i, 1);
                return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />;
            })}
            <path d={pathD} fill={`rgba(${hexToRgb(color)},0.15)`} stroke={color} strokeWidth="2" />
            {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />
            ))}
            {Array.from({ length: n }, (_, i) => {
                const p = getPoint(i, 1.18);
                const label = AXIS_LABELS[i]?.replace(/_/g, " ") || "";
                const short = label.split(" ").map(w => w.charAt(0).toUpperCase()).join("");
                return (
                    <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central"
                        className="fill-white/80 font-black" style={{ fontSize: "8px", letterSpacing: "0.1em" }}>
                        {short}
                    </text>
                );
            })}
        </svg>
    );
}

function DualRadarChart({ v1, v2, c1 = "#FF0000", c2 = "#3B82F6" }: { v1: number[], v2: number[], c1?: string, c2?: string }) {
    const size = 280;
    const cx = size / 2;
    const cy = size / 2;
    const maxR = size / 2 - 30;
    const n = Math.max(v1.length, v2.length);

    const getPoint = (idx: number, val: number) => {
        const angle = (Math.PI * 2 * idx) / n - Math.PI / 2;
        const x = cx + Math.cos(angle) * val * maxR;
        const y = cy + Math.sin(angle) * val * maxR;
        return { x: Number(x.toFixed(4)), y: Number(y.toFixed(4)) };
    };

    const gridLevels = [0.25, 0.5, 0.75, 1.0];

    const pts1 = v1.map((v, i) => getPoint(i, Number(v) || 0));
    const path1 = pts1.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

    const pts2 = v2.map((v, i) => getPoint(i, Number(v) || 0));
    const path2 = pts2.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}` : "255,0,0";
    };

    return (
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[280px] mx-auto overflow-visible">
            {gridLevels.map(level => {
                const pts = Array.from({ length: n }, (_, i) => getPoint(i, level));
                const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
                return <path key={level} d={d} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />;
            })}
            {Array.from({ length: n }, (_, i) => {
                const p = getPoint(i, 1);
                return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />;
            })}

            <path d={path1} fill={`rgba(${hexToRgb(c1)},0.2)`} stroke={c1} strokeWidth="2" />
            <path d={path2} fill={`rgba(${hexToRgb(c2)},0.2)`} stroke={c2} strokeWidth="2" />

            {pts1.map((p, i) => <circle key={`c1-${i}`} cx={p.x} cy={p.y} r="2.5" fill={c1} />)}
            {pts2.map((p, i) => <circle key={`c2-${i}`} cx={p.x} cy={p.y} r="2.5" fill={c2} />)}

            {Array.from({ length: n }, (_, i) => {
                const p = getPoint(i, 1.18);
                const label = AXIS_LABELS[i]?.replace(/_/g, " ") || "";
                const short = label.split(" ").map(w => w.charAt(0).toUpperCase()).join("");
                return (
                    <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central"
                        className="fill-white/80 font-black" style={{ fontSize: "8px", letterSpacing: "0.1em" }}>
                        {short}
                    </text>
                );
            })}
        </svg>
    );
}

// Landing Page Component (The "First Page")
function Landing({ onStart, onArtist }: { onStart: () => void, onArtist: () => void }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative w-full flex flex-col select-none overflow-x-hidden">
            {/* Visual Focal Point */}
            <div className="fixed inset-x-0 top-0 h-[70vh] pointer-events-none opacity-40 overflow-hidden -z-20">
                <DNAHelix />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#080808]/50 to-[#080808]" />
            </div>

            {/* Ambient Background */}
            <div className="fixed inset-0 -z-30 bg-[#080808]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[1000px] w-[1000px] blur-[220px] rounded-full bg-[#FF0000]/5" />
            </div>

            {/* HERO SECTION */}
            <div className="min-h-[100svh] flex flex-col items-center justify-center p-6 text-center relative z-10">
                <div className="max-w-4xl w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-12"
                    >
                        <img src="/icon.png" alt="MusicDNA Logo" className="h-24 w-24 mx-auto mb-8 drop-shadow-[0_0_20px_rgba(255,0,0,0.5)]" />
                        <span className="mono text-[10px] text-[#FF0000] uppercase tracking-[0.5em] font-black mb-6 block drop-shadow-sm">Signal Discovery Protocol</span>
                        <h1 className="text-[10vw] md:text-[6.8rem] font-black uppercase tracking-tighter italic mb-8 leading-[0.85] text-white">
                            MUSIC<span className="text-[#FF0000]">DNA</span><br />
                            MATCH
                        </h1>
                        <p className="text-white/90 text-xl md:text-2xl font-bold tracking-tight max-w-2xl mx-auto italic leading-tight mb-4">
                            Discover your 12-dimensional musical fingerprint and find your sonic soulmates.
                        </p>
                        <p className="mono text-[10px] text-white/50 uppercase tracking-[0.3em] font-medium">
                            Analyzed at the speed of sound via Neural Scanning.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-5 justify-center items-center"
                    >
                        <button
                            onClick={() => {
                                const el = document.getElementById("demo-radar");
                                if (el) el.scrollIntoView({ behavior: "smooth" });
                                else onStart();
                            }}
                            className="w-full sm:w-auto overflow-hidden group relative bg-white text-black font-black py-6 px-12 rounded-[2rem] text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 shadow-2xl"
                        >
                            <div className="absolute inset-0 bg-[#FF0000]/10 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                See How It Works
                            </span>
                            <ChevronRight className="h-5 w-5 relative z-10 group-hover:translate-y-1 transition-transform rotate-90" />
                        </button>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-50"
                >
                    <ChevronRight className="h-8 w-8 rotate-90 text-white" />
                </motion.div>
            </div>

            {/* DEMO SECTION: DNA RADAR */}
            <div id="demo-radar" className="py-24 px-6 md:px-12 flex flex-col items-center justify-center min-h-[90svh] relative z-10 bg-[#080808]/80 backdrop-blur-xl border-t border-white/5 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
                <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-2 md:order-1 glass rounded-[3rem] p-10 border border-white/10 shadow-2xl flex items-center justify-center">
                        <RadarChart vector={DEMO_VECTOR} />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-1 md:order-2 text-center md:text-left">
                        <span className="mono text-[10px] text-[#FF0000] uppercase tracking-[0.5em] font-black mb-4 block">Neural Extraction</span>
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic mb-6 text-white">
                            Map Your <br />Sonic <span className="text-[#FF0000]">DNA</span>
                        </h2>
                        <p className="text-white/70 text-lg font-bold leading-relaxed mb-8">
                            We don't just look at Top 40 genres. We analyze your listening history across 12 unique dimensions—from Acousticness to Coherence, building a complex geometry of your exact musical taste.
                        </p>
                        <ul className="space-y-4 text-left inline-block md:block mb-8">
                            {[
                                "Connect Spotify or YouTube",
                                "Deep scan of 50 top tracks",
                                "Extract underlying audio features",
                                "Generate your 12D vector map",
                            ].map((text, i) => (
                                <li key={i} className="flex items-center gap-4 text-white/90 text-sm font-bold uppercase tracking-widest">
                                    <div className="h-2 w-2 rounded-full bg-[#FF0000] shadow-[0_0_10px_rgba(255,0,0,0.8)]" />
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>

            {/* DEMO SECTION: MATCHING */}
            <div className="py-24 px-6 md:px-12 flex flex-col items-center justify-center min-h-[90svh] relative z-10 bg-[#050505]/95 border-t border-white/5 shadow-inner">
                <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="text-center md:text-left">
                        <span className="mono text-[10px] text-[#3B82F6] uppercase tracking-[0.5em] font-black mb-4 block">Euclidean Match Protocol</span>
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic mb-6 text-white">
                            Discover <br /><span className="text-[#3B82F6]">Soulmates</span>
                        </h2>
                        <p className="text-white/70 text-lg font-bold leading-relaxed mb-6">
                            Finding someone with the exact same taste isn't just about matching genres. We compute the mathematical distance between two DNA vectors to find true sonic resonance.
                        </p>
                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-start gap-3">
                            <span className="mono text-[10px] text-white/50 uppercase tracking-[0.2em]">Signal Overlap Detected</span>
                            <div className="flex items-end gap-3 w-full">
                                <Activity className="h-8 w-8 text-[#3B82F6] mb-1" />
                                <span className="text-5xl font-black italic text-white leading-none">92<span className="text-2xl">%</span></span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {["Convergent Resonance", "High Coherence", "Shared Dimensions"].map((t, i) => (
                                    <span key={i} className="text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-sm bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30">{t}</span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass rounded-[3rem] p-10 border border-white/10 shadow-[0_0_80px_rgba(59,130,246,0.1)] flex items-center justify-center relative">
                        <DualRadarChart v1={DEMO_VECTOR} v2={DEMO_MATCH_VECTOR} c1="#FF0000" c2="#3B82F6" />
                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-[#FF0000]" />
                                <span className="mono text-[10px] text-white/80 font-black uppercase tracking-widest">You</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-[#3B82F6]" />
                                <span className="mono text-[10px] text-white/80 font-black uppercase tracking-widest">Soulmate</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* DEMO SECTION: COLLABORATION */}
            <div className="py-24 px-6 md:px-12 flex flex-col items-center justify-center min-h-[90svh] relative z-10 bg-[#080808]/80 backdrop-blur-xl border-t border-white/5 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
                <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-2 md:order-1 glass rounded-[3rem] p-8 md:p-10 border border-white/10 shadow-[0_0_80px_rgba(255,165,0,0.05)] flex flex-col gap-5 relative">
                        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-2">
                            <div className="h-8 w-8 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                                <Mail className="h-4 w-4 text-orange-500" />
                            </div>
                            <span className="text-white font-black italic uppercase tracking-widest text-lg">Secure Intro</span>
                        </div>

                        <div className="bg-white/5 rounded-2xl p-5 border border-white/10 mt-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-full border-2 border-[#080808] bg-[#3B82F6] flex items-center justify-center text-[10px] font-black text-white">MCH</div>
                                <div>
                                    <p className="text-xs font-black text-white uppercase tracking-widest">Incoming Transmission</p>
                                    <p className="mono text-[9px] text-white/50">Via MusicDNA Secure Email</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <p className="text-sm text-white/90 font-bold leading-relaxed">"We have a 92% match on the Euclidean DNA vector. Noticed we both heavily resonate with deep progressive house and melodic techno. Would love to share playlists!"</p>
                            </div>
                        </div>

                        <div className="mt-4 bg-orange-500/10 border border-orange-500/30 p-4 rounded-xl flex items-center gap-4 hover:bg-orange-500/20 transition-colors cursor-pointer">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-black text-white uppercase tracking-widest">Accept Connection</p>
                                <p className="mono text-[9px] text-white/50">Share email contact details</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-orange-500" />
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-1 md:order-2 text-center md:text-left">
                        <span className="mono text-[10px] text-orange-500 uppercase tracking-[0.5em] font-black mb-4 block">Secure Handshake</span>
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic mb-6 text-white">
                            Connect <br /><span className="text-orange-500">Safely</span>
                        </h2>
                        <p className="text-white/70 text-lg font-bold leading-relaxed mb-6">
                            Finding a match is just the beginning. We facilitate secure double-opt-in email introductions so you can connect with your musical soulmates on your own terms.
                        </p>
                        <ul className="space-y-4 text-left inline-block md:block">
                            {[
                                "Double opt-in privacy",
                                "Secure email introductions",
                                "Protect your identity",
                                "Connect meaningfully",
                            ].map((text, i) => (
                                <li key={i} className="flex items-center gap-4 text-white/90 text-sm font-bold uppercase tracking-widest">
                                    <div className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(255,165,0,0.8)] shrink-0" />
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>

            {/* CALL TO ACTION */}
            <div className="py-32 px-6 flex flex-col items-center text-center relative z-10 border-t border-white/10 bg-[#000000]">
                <div className="absolute inset-0 z-0">
                    <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[600px] w-[600px] blur-[150px] rounded-full bg-[#FF0000]/10" />
                </div>
                <div className="relative z-10 max-w-2xl w-full">
                    <Waves className="h-16 w-16 text-[#FF0000] mx-auto mb-8 opacity-80" />
                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic mb-8 text-white">
                        Ready To <br />Broadcast?
                    </h2>
                    <p className="text-white/60 text-lg font-bold mb-12">
                        Start scanning your library. Generate your acoustic DNA. Share your vector globally.
                    </p>

                    <button
                        onClick={onStart}
                        className="w-full sm:w-auto overflow-hidden group relative bg-[#FF0000] text-white font-black py-6 px-16 rounded-[2rem] text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 shadow-[0_0_50px_rgba(255,0,0,0.5)] mx-auto"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                        <span className="relative z-10 flex items-center justify-center gap-3">
                            <Play className="h-4 w-4 fill-white" /> Join The Signal
                        </span>
                    </button>

                    <button
                        onClick={onArtist}
                        className="mt-8 group text-white/40 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all inline-flex items-center gap-2"
                    >
                        <Activity className="h-3 w-3" /> or connect as an artist
                    </button>
                </div>

                {/* Ticker at the bottom */}
                <div className="absolute bottom-0 left-0 right-0 py-8">
                    <Ticker />
                </div>
            </div>
        </motion.div>
    );
}

function ConversationalOnboarding({ existing, checking, displayName, setDisplayName, city, setCity, onResume, onBegin }: ConversationalOnboardingProps) {
    const [step, setStep] = useState<ChatStep>("greeting");
    const [nameInput, setNameInput] = useState(displayName || "");
    const [cityInput, setCityInput] = useState(city || "");
    const [typing, setTyping] = useState(false);
    const [visibleMessages, setVisibleMessages] = useState(1);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const cityInputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom whenever messages change
    useEffect(() => {
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 100);
    }, [visibleMessages, step, typing]);

    // Simulate typing then reveal next message
    const revealWithDelay = (afterMs: number, then: () => void) => {
        setTyping(true);
        setTimeout(() => { setTyping(false); then(); }, afterMs);
    };

    // On mount: show greeting, then after a beat show the name prompt
    useEffect(() => {
        if (existing) {
            setStep("cta");
            setVisibleMessages(5);
            return;
        }
        revealWithDelay(900, () => setVisibleMessages(2));
    }, [existing]);

    const handleNameSubmit = () => {
        const name = nameInput.trim();
        if (!name) return;
        setDisplayName(name);
        document.cookie = `display_name=${encodeURIComponent(name)};max-age=31536000;path=/`;
        // Go to city input step
        setStep("city_input");
        setVisibleMessages(0);
        revealWithDelay(600, () => {
            setVisibleMessages(1);
            setTimeout(() => cityInputRef.current?.focus(), 200);
        });
    };

    const handleCitySubmit = () => {
        const c = cityInput.trim();
        if (!c) return;
        setCity(c);
        document.cookie = `city=${encodeURIComponent(c)};max-age=31536000;path=/`;
        setStep("cta");
        setVisibleMessages(0);
        // Cascade messages
        revealWithDelay(800, () => {
            setVisibleMessages(1);
        });
    };

    const firstName = (nameInput.trim() || displayName || "").split(" ")[0] || "you";
    const cityName = cityInput.trim() || city || "";

    return (
        <motion.div
            key="conv"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen w-full flex flex-col"
        >
            {/* Ambient background */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/3 h-[500px] w-[500px] blur-[180px] rounded-full bg-[#FF0000]/7" />
                <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] blur-[160px] rounded-full bg-orange-900/6" />
            </div>

            {/* Top brand bar */}
            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#080808]/80 backdrop-blur-xl">
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-[#FF0000] flex items-center justify-center">
                        <Waves className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="font-black text-white text-sm uppercase tracking-widest">musicDNA<span className="text-[#FF0000]">match</span></span>
                </div>
                <div className="flex gap-5 items-center">
                    <Link href="/profile" className="mono text-[10px] text-white/30 hover:text-white transition-colors uppercase tracking-[0.2em] hidden md:flex items-center gap-1.5"><User className="h-3 w-3" />Profile</Link>
                    <Link href="/soulmates" className="mono text-[10px] text-white/30 hover:text-white transition-colors uppercase tracking-[0.2em] hidden md:flex items-center gap-1.5"><Users className="h-3 w-3" />Soulmates</Link>
                </div>
            </div>

            {/* Chat window */}
            <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 pt-24 pb-8">

                {/* ── GREETING step ── */}
                {step === "greeting" && (
                    <div className="flex flex-col gap-4 flex-1">
                        <SystemBubble delay={0.1}>
                            Hey there 👋 Welcome to <span className="text-white font-black">musicDNAmatch</span>.
                        </SystemBubble>

                        {visibleMessages >= 2 && !typing && (
                            <SystemBubble delay={0}>
                                Before we map your sound — what should we call you?
                            </SystemBubble>
                        )}

                        {typing && <TypingIndicator />}

                        {visibleMessages >= 2 && !typing && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex gap-2 mt-2"
                            >
                                <input
                                    ref={inputRef}
                                    autoFocus
                                    type="text"
                                    value={nameInput}
                                    onChange={e => setNameInput(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && nameInput.trim() && handleNameSubmit()}
                                    placeholder="Your first name…"
                                    className="flex-1 bg-white/5 border border-white/12 rounded-2xl px-5 py-4 text-white font-bold text-base focus:outline-none focus:border-[#FF0000]/50 transition-all placeholder:text-white/20"
                                />
                                <button
                                    onClick={handleNameSubmit}
                                    disabled={!nameInput.trim()}
                                    className="bg-[#FF0000] text-white font-black px-6 py-4 rounded-2xl hover:bg-red-500 active:scale-95 transition-all disabled:opacity-25 flex items-center gap-2 text-sm uppercase tracking-wide shadow-[0_0_24px_rgba(255,0,0,0.3)]"
                                >
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </motion.div>
                        )}

                        {/* Resume option */}
                        {existing && !checking && visibleMessages >= 2 && !typing && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                                className="flex justify-center pt-2">
                                <button onClick={onResume} className="flex items-center gap-2 mono text-[10px] text-white/30 hover:text-white/60 transition-colors uppercase tracking-widest border border-white/8 px-5 py-2.5 rounded-full hover:border-white/15">
                                    <CheckCircle2 className="h-3 w-3 text-[#FF0000]" />Resume my previous signal
                                </button>
                            </motion.div>
                        )}
                    </div>
                )}

                {/* ── CITY INPUT step ── */}
                {step === "city_input" && (
                    <div className="flex flex-col gap-4 flex-1">
                        {/* User replied with name */}
                        <UserBubble delay={0}>{firstName}</UserBubble>

                        {typing && <TypingIndicator />}

                        {visibleMessages >= 1 && !typing && (
                            <SystemBubble delay={0}>
                                Nice, <span className="text-white font-black">{firstName}</span>! And where are you from? 🌍
                            </SystemBubble>
                        )}

                        {visibleMessages >= 1 && !typing && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex gap-2.5 items-center justify-end"
                            >
                                <input
                                    ref={cityInputRef}
                                    autoFocus
                                    type="text"
                                    value={cityInput}
                                    onChange={e => setCityInput(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && cityInput.trim() && handleCitySubmit()}
                                    placeholder="Your city…"
                                    className="flex-1 bg-white/5 border border-white/12 rounded-2xl px-5 py-4 text-white font-bold text-base focus:outline-none focus:border-[#FF0000]/50 transition-all placeholder:text-white/20"
                                />
                                <button
                                    onClick={handleCitySubmit}
                                    disabled={!cityInput.trim()}
                                    className="bg-[#FF0000] text-white font-black px-6 py-4 rounded-2xl hover:bg-red-500 active:scale-95 transition-all disabled:opacity-25 flex items-center gap-2 text-sm uppercase tracking-wide shadow-[0_0_24px_rgba(255,0,0,0.3)]"
                                >
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </motion.div>
                        )}
                    </div>
                )}

                {/* ── STORY/CTA step ── */}
                {(step === "story_jack" || step === "story_jane" || step === "story_match" || step === "story_result" || step === "cta") && (
                    <div className="flex flex-col gap-4 flex-1">
                        {/* User replied with name and city */}
                        <UserBubble delay={0}>{firstName}</UserBubble>

                        {cityName && <UserBubble delay={0.1}>{cityName}</UserBubble>}

                        {visibleMessages >= 1 && (
                            <SystemBubble delay={0}>
                                {cityName
                                    ? <>Hey <span className="text-white font-black">{firstName}</span> from <span className="text-white font-black">{cityName}</span> 🎵 Perfect, let's map your DNA.</>
                                    : <>Nice to meet you, <span className="text-white font-black">{firstName}</span> 🎵 Let's map your DNA.</>}
                            </SystemBubble>
                        )}

                        {/* ── CTA ── */}
                        {step === "cta" && visibleMessages >= 1 && (
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                className="mt-4 space-y-3"
                            >
                                <SystemBubble delay={0.2}>
                                    <span className="text-white font-black">Your story is waiting to be written, {firstName}.</span> Who shares your sound?
                                </SystemBubble>

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="ml-10 flex flex-col gap-3"
                                >
                                    {/* How it works — compact */}
                                    <div className="bg-white/8 border border-white/20 rounded-2xl p-4 space-y-3">
                                        <div className="mono text-[9px] text-[#FF0000] uppercase tracking-widest font-black">How it works</div>
                                        {[
                                            ["🎵", "Connect Spotify or YouTube"],
                                            ["🧬", "Generate your 12D Musical DNA"],
                                            ["🔍", "Match with sonic soulmates worldwide"],
                                        ].map(([icon, text]) => (
                                            <div key={text} className="flex items-center gap-3 text-sm text-white/90 font-bold">
                                                <span className="text-base">{icon}</span>{text}
                                            </div>
                                        ))}
                                    </div>

                                    {existing && !checking ? (
                                        <button
                                            onClick={onResume}
                                            className="relative w-full flex items-center justify-center gap-3 bg-[#FF0000] text-white font-black text-sm uppercase tracking-widest py-5 rounded-2xl hover:bg-red-500 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_40px_rgba(255,0,0,0.4)] overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full shimmer pointer-events-none" />
                                            <Activity className="h-4 w-4" />
                                            See My Matches, {firstName}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={onBegin}
                                            className="relative w-full flex items-center justify-center gap-3 bg-[#FF0000] text-white font-black text-sm uppercase tracking-widest py-5 rounded-2xl hover:bg-red-500 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_40px_rgba(255,0,0,0.4)] overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full shimmer pointer-events-none" />
                                            <Play className="h-4 w-4 fill-white" />
                                            Start My Journey, {firstName}
                                        </button>
                                    )}

                                    {existing && !checking && (
                                        <button onClick={onBegin} className="flex items-center justify-center gap-2 border border-white/20 bg-white/5 text-white/80 hover:text-white hover:border-white/40 font-black text-xs uppercase tracking-widest py-4 rounded-2xl transition-all">
                                            <Play className="h-3 w-3" />Start New Analysis
                                        </button>
                                    )}

                                    <p className="text-center mono text-[9px] text-white/50 uppercase tracking-widest">
                                        © 2026 Arman Ayva · <a href="https://www.armanayva.com" target="_blank" className="hover:text-white/80 transition-colors">armanayva.com</a>
                                    </p>
                                </motion.div>
                            </motion.div>
                        )}
                    </div>
                )}

                <div ref={bottomRef} className="h-4" />
            </div>
        </motion.div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════
export default function Home() {
    const [stage, setStage] = useState<Stage>("landing");
    const [genres, setGenres] = useState<string[]>([]);
    const [existing, setExisting] = useState<any>(null);
    const [checking, setChecking] = useState(true);

    // Spotify
    const [spotifyUrl, setSpotifyUrl] = useState("");
    const [scanning, setScanning] = useState(false);
    const [scanErr, setScanErr] = useState<string | null>(null);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [plTotal, setPlTotal] = useState(0);
    const [plOffset, setPlOffset] = useState(0);
    const [loadingMore, setLoadingMore] = useState(false);
    const [selPlaylists, setSelPlaylists] = useState<Playlist[]>([]);
    const [scannedIds, setScannedIds] = useState<string[]>([]);
    const [autoScanned, setAutoScanned] = useState(false);

    // YouTube
    const emptyYt = (): YtTrack[] => Array.from({ length: 5 }, (_, i) => ({ id: `yt-${i}`, url: "", status: "idle" }));
    const [ytTracks, setYtTracks] = useState<YtTrack[]>(emptyYt());
    const [ytMode, setYtMode] = useState<"only" | "addon">("only");
    const [ytQuery, setYtQuery] = useState("");
    const [ytSearching, setYtSearching] = useState(false);
    const [ytResults, setYtResults] = useState<any[]>([]);
    const [ytShowSearch, setYtShowSearch] = useState(false);
    const ytSearchRef = useRef<HTMLDivElement>(null);

    // Analysis
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [city, setCity] = useState("");
    const [progress, setProgress] = useState(0);

    const [dna, setDna] = useState<any>(null);
    const [fetchedSources, setFetchedSources] = useState<any>(null);
    const [clash, setClash] = useState<any>(null);
    const [checkingEmail, setCheckingEmail] = useState(false);

    // ── Init ──────────────────────────────────────────────────────────────
    useEffect(() => {
        (async () => {
            try {
                const r = await fetch("/api/dna/profile/me");
                const d = await r.json();
                if (d.found) {
                    setExisting(d.dna);
                    if (d.dna.display_name && d.dna.display_name !== "Anonymous Signal") {
                        setDisplayName(d.dna.display_name);
                    }
                    if (d.dna.email) {
                        setEmail(d.dna.email);
                    } else if (d.dna.metadata && d.dna.metadata.email) {
                        setEmail(d.dna.metadata.email);
                    }
                    if (d.dna.city) {
                        setCity(d.dna.city);
                    }
                    if (d.dna.top_genres) setGenres(d.dna.top_genres);
                    const ids: string[] = d.dna.scanned_playlist_ids || [];
                    if (d.dna.scanned_playlist_id && !ids.includes(d.dna.scanned_playlist_id)) ids.push(d.dna.scanned_playlist_id);
                    setScannedIds(ids);

                    // Route based on query params
                    if (window.location.search.includes("scan=true")) {
                        setStage("sources");
                    } else if (!window.location.search.includes("restart")) {
                        window.location.href = "/soulmates";
                    }
                } else if (window.location.search.includes("scan=true")) {
                    setStage("sources");
                }
            } catch { } finally { setChecking(false); }
        })();
        const saved = document.cookie.split("; ").find(r => r.startsWith("last_spotify_url="))?.split("=")[1];
        if (saved) setSpotifyUrl(decodeURIComponent(saved));
        const savedName = document.cookie.split("; ").find(r => r.startsWith("display_name="))?.split("=")[1];
        if (savedName) setDisplayName(decodeURIComponent(savedName));
        const savedCity = document.cookie.split("; ").find(r => r.startsWith("city="))?.split("=")[1];
        if (savedCity) setCity(decodeURIComponent(savedCity));
    }, []);

    // Auto-scan when entering spotify_input with a saved URL
    useEffect(() => {
        if (autoScanned || stage !== "sources" || !spotifyUrl.trim()) return;
        setAutoScanned(true); scanSpotify(0);
    }, [stage, spotifyUrl]);

    // Scroll to top on stage transition (handles AnimatePresence delays)
    useEffect(() => {
        window.scrollTo(0, 0);
        const timer = setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 350);
        return () => clearTimeout(timer);
    }, [stage]);

    // ── Spotify ───────────────────────────────────────────────────────────
    const extractId = (raw: string) => {
        let s = raw.trim();
        if (s.includes("spotify.com/user/")) s = s.split("spotify.com/user/")[1].split("?")[0].split("/")[0];
        else if (s.includes("spotify.com/playlist/")) s = "playlist:" + s.split("spotify.com/playlist/")[1].split("?")[0].split("/")[0];
        else if (s.startsWith("@")) s = s.slice(1);
        return s;
    };

    const scanSpotify = async (offset = 0) => {
        const id = extractId(spotifyUrl);
        if (!id) { setScanErr("Enter a valid Spotify profile URL."); return; }
        if (offset === 0) { setScanning(true); setPlaylists([]); setScanErr(null); }
        else setLoadingMore(true);
        try {
            const r = await fetch("/api/spotify/scan", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ spotify_user_id: id, offset, limit: 6 })
            });
            const d = await r.json();
            if (!r.ok) { setScanErr(d.error || "Failed to load playlists."); return; }
            document.cookie = `last_spotify_url=${encodeURIComponent(spotifyUrl)};max-age=31536000;path=/`;
            if (offset === 0 && !d.playlists?.length) { setScanErr("No public playlists found."); return; }
            setPlaylists(p => [...p, ...(d.playlists || [])]);
            setPlTotal(d.total || 0); setPlOffset(offset);
        } catch { setScanErr("Connection failed. Try again."); }
        finally { setScanning(false); setLoadingMore(false); }
    };

    const togglePlaylist = (pl: Playlist) => {
        setSelPlaylists(prev => {
            const has = prev.find(p => p.id === pl.id);
            if (has) return prev.filter(p => p.id !== pl.id);
            if (prev.length >= 5) return prev;
            return [...prev, pl];
        });
    };

    const handleResumeExisting = () => {
        if (!clash?.user_id) return;
        document.cookie = `guest_id=${clash.user_id};max-age=31536000;path=/`;
        window.location.href = "/soulmates";
    };

    const handleFinalSubmit = async (alreadyConfirmed = false) => {
        if (!email.trim() || !email.includes("@")) return;

        if (!alreadyConfirmed) {
            setCheckingEmail(true);
            try {
                const res = await fetch("/api/dna/profile/check-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email })
                });
                const d = await res.json();
                if (d.exists) {
                    setClash(d.profile);
                    setCheckingEmail(false);
                    return;
                }
            } catch (e) {
                console.error("Clash check failed", e);
            }
            setCheckingEmail(false);
        }

        // Adopting old ID if confirmed
        if (clash?.user_id) {
            document.cookie = `guest_id=${clash.user_id};max-age=31536000;path=/`;
        }

        const payload = {
            genres,
            displayName,
            email,
            city,
            audioFeatures: fetchedSources?.audioFeatures || [],
            youtubeVideos: fetchedSources?.youtubeVideos || [],
            artistGenres: fetchedSources?.artistGenres || [],
            spotifyTracks: fetchedSources?.spotifyTracks || [],
            youtubeTracks: fetchedSources?.youtubeTracks || [],
            dry_run: false
        };

        const genRes = await fetch('/api/dna/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!genRes.ok) {
            const errData = await genRes.json();
            alert(errData.error || "Failed to secure your signal");
            return;
        }

        await fetch('/api/dna/intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ intent: 'find_soulmates' })
        }).catch(console.error);

        window.location.href = "/soulmates?genres=" + genres.join(",");
    };

    // ── YouTube ───────────────────────────────────────────────────────────
    const resolveYt = useCallback(async (idx: number, url: string) => {
        if (!url.trim()) {
            setYtTracks(t => t.map((x, i) => i === idx ? { ...x, url: "", status: "idle", title: undefined, channel: undefined, thumbnail: undefined, error: undefined } : x));
            return;
        }
        setYtTracks(t => t.map((x, i) => i === idx ? { ...x, url, status: "loading" } : x));
        try {
            const r = await fetch("/api/youtube/analyze", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ urls: [url] })
            });
            const d = await r.json();
            const v = d.videos?.[0];
            if (v) setYtTracks(t => t.map((x, i) => i === idx ? { ...x, status: "ok", title: v.title, channel: v.channelTitle, thumbnail: v.thumbnail } : x));
            else setYtTracks(t => t.map((x, i) => i === idx ? { ...x, status: "error", error: "Couldn't load video" } : x));
        } catch {
            setYtTracks(t => t.map((x, i) => i === idx ? { ...x, status: "error", error: "Network error" } : x));
        }
    }, []);

    const searchYt = async (query: string) => {
        if (!query.trim()) { setYtResults([]); return; }

        if (query.includes("youtube.com/") || query.includes("youtu.be/")) {
            setYtTracks(prev => {
                const idx = prev.findIndex(t => !t.url || t.status === "idle");
                if (idx === -1) {
                    alert("All 5 slots are full! Please remove a track first.");
                    return prev;
                }
                setTimeout(() => resolveYt(idx, query), 0);
                return prev.map((x, i) => i === idx ? { ...x, url: query, status: "loading" } : x);
            });
            setYtQuery("");
            setYtShowSearch(false);
            return;
        }

        setYtSearching(true);
        try {
            const r = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`);
            const d = await r.json();
            setYtResults(Array.isArray(d) ? d : []);
        } catch { setYtResults([]); }
        finally { setYtSearching(false); }
    };

    const addYtSearchResult = useCallback((video: any) => {
        setYtTracks(prev => {
            const idx = prev.findIndex(t => !t.url || t.status === "idle");
            if (idx === -1) {
                alert("All 5 slots are full! Please remove a track first.");
                return prev;
            }
            const url = `https://www.youtube.com/watch?v=${video.id}`;
            return prev.map((x, i) => i === idx ? {
                ...x, url, status: "ok" as const,
                title: video.title, channel: video.channelTitle, thumbnail: video.thumbnail,
            } : x);
        });
        setYtShowSearch(false);
        setYtQuery("");
        setYtResults([]);
    }, []);

    const magicFillSlots = async (video: any, e: React.MouseEvent) => {
        e.stopPropagation();

        const prev = ytTracks;
        const idx = prev.findIndex(t => !t.url || t.status === "idle");
        if (idx === -1) {
            alert("All 5 slots are full! Please remove tracks first.");
            return;
        }

        // Count how many we need
        let needed = 0;
        prev.forEach((t, i) => {
            if (i !== idx && (!t.url || t.status === "idle" || t.status === "error")) {
                needed++;
            }
        });

        setYtTracks(current => {
            const url = `https://www.youtube.com/watch?v=${video.id}`;
            const next = current.map((x, i) => i === idx ? {
                ...x, url, status: "ok" as const,
                title: video.title, channel: video.channelTitle, thumbnail: video.thumbnail,
            } : x);

            if (needed > 0) {
                next.forEach((t, i) => {
                    if (i !== idx && (!t.url || t.status === "idle" || t.status === "error")) {
                        next[i] = { ...next[i], status: 'loading', url: 'finding similar...' };
                    }
                });
            }
            return next;
        });

        if (needed === 0) {
            setYtShowSearch(false);
            setYtQuery("");
            setYtResults([]);
            return;
        }

        try {
            const r = await fetch(`/api/youtube/similar?title=${encodeURIComponent(video.title)}&channel=${encodeURIComponent(video.channelTitle)}`);
            const similar = await r.json();

            setYtTracks(prev => {
                const next = [...prev];
                let simIdx = 0;
                for (let i = 0; i < 5; i++) {
                    if (next[i].status === 'loading' && next[i].url === 'finding similar...') {
                        if (simIdx < similar.length) {
                            const s = similar[simIdx++];
                            next[i] = {
                                id: s.id,
                                url: `https://www.youtube.com/watch?v=${s.id}`,
                                title: s.title,
                                channel: s.channelTitle,
                                thumbnail: s.thumbnail,
                                status: 'ok'
                            };
                        } else {
                            next[i] = { id: "", url: "", status: "idle" };
                        }
                    }
                }
                return next;
            });
        } catch {
            setYtTracks(prev => prev.map(t => (t.status === 'loading' && t.url === 'finding similar...') ? { id: "", url: "", status: "idle", title: undefined, channel: undefined, thumbnail: undefined } : t));
        }

        setYtShowSearch(false);
        setYtQuery("");
        setYtResults([]);
    };

    // Close search dropdown on click outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ytSearchRef.current && !ytSearchRef.current.contains(e.target as Node)) {
                setYtShowSearch(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // ── Fetch metadata from sources ───────────────────────────────────────
    const fetchSourcesAndPreselect = async () => {
        setStage("analyzing"); setProgress(0);

        let audioFeatures: any[] = [];
        let artistGenres: string[] = [];
        let spotifyTracks: any[] = [];
        let youtubeVideos: any[] = [];
        const sid = extractId(spotifyUrl);

        // Step 1: Scan Spotify playlists (multi-playlist mode)
        if (selPlaylists.length > 0) {
            setProgress(30);
            try {
                const r = await fetch("/api/spotify/scan", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        spotify_user_id: sid,
                        playlist_ids: selPlaylists.map(p => p.id),
                    })
                });
                const d = await r.json();
                spotifyTracks = d.tracks || [];
                audioFeatures = d.audioFeatures || [];
                artistGenres = d.artistGenres || [];
            } catch { }
        }
        setProgress(60);

        // Step 2: Process YouTube tracks
        const ytOkTracks = ytTracks.filter(t => t.status === "ok");
        if (ytOkTracks.length > 0) {
            try {
                const r = await fetch("/api/youtube/analyze", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ urls: ytOkTracks.map(t => t.url) })
                });
                const d = await r.json();
                youtubeVideos = d.videos || [];
            } catch { }
        }
        setProgress(90);

        const ytFormattedTracks = ytOkTracks.map(t => ({ id: t.id, title: t.title, artist: t.channel, thumbnail: t.thumbnail, url: t.url }));
        setFetchedSources({ audioFeatures, artistGenres, spotifyTracks, youtubeVideos, youtubeTracks: ytFormattedTracks });

        // Step 3: Fast dry_run DNA to get suggested genres based on the signals
        try {
            const r = await fetch("/api/dna/generate", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    genres: [],
                    displayName,
                    email,
                    city,
                    audioFeatures,
                    youtubeVideos,
                    spotifyTracks,
                    youtubeTracks: ytFormattedTracks,
                    artistGenres,
                    dry_run: true
                })
            });
            const d = await r.json();
            if (d.success && d.suggested_genres) {
                // Add suggested ones if they exist in GENRES list
                const preselected: string[] = [];
                for (const sg of d.suggested_genres) {
                    const match = GENRES.find(g => {
                        const s1 = g.toLowerCase().replace(/[^a-z0-9]/g, "");
                        const s2 = sg.toLowerCase().replace(/[^a-z0-9]/g, "");
                        if (s1 === s2) return true;
                        if (s2 === "indie" && s1 === "indierock") return true;
                        if (s2 === "rnb" && s1 === "rb") return true; // to catch any odd maps
                        return false;
                    });
                    if (match && !preselected.includes(match)) preselected.push(match);
                }
                if (preselected.length > 0) {
                    setGenres(preselected);
                }
            }
        } catch { }

        // Go to review songs
        setStage("review_songs");
        setProgress(0);
    };

    // ── Run final analysis & save to database ─────────────────────────────
    const runAnalysis = async () => {
        setStage("analyzing"); setProgress(0);

        let audioFeatures = fetchedSources?.audioFeatures || [];
        let spotifyTracks = fetchedSources?.spotifyTracks || [];
        let artistGenres = fetchedSources?.artistGenres || [];
        let youtubeVideos = fetchedSources?.youtubeVideos || [];
        let youtubeTracks = fetchedSources?.youtubeTracks || [];
        setProgress(50);

        // Step 3: Generate and save final DNA
        try {
            const r = await fetch("/api/dna/generate", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    genres,
                    displayName,
                    email: email?.trim() || null,
                    city: city?.trim() || null,
                    audioFeatures,
                    youtubeVideos,
                    spotifyTracks,
                    youtubeTracks,
                    artistGenres,
                    dry_run: false
                })
            });
            const d = await r.json();
            setProgress(90);

            if (d.success) {
                setDna({
                    vector: d.vector,
                    confidence: d.confidence,
                    coherence_index: d.coherence_index,
                    axes: d.axes,
                    narrative: d.narrative,
                    created_at: d.created_at,
                    ...d.metadata,
                });
            }
            else {
                // Fallback: still show something
                setDna({
                    vector: Array(12).fill(0.5),
                    top_genres: genres,
                    recent_tracks: spotifyTracks.slice(0, 10),
                    display_name: "Signal",
                });
            }
        } catch {
            setDna({
                vector: Array(12).fill(0.5),
                top_genres: genres,
                recent_tracks: spotifyTracks.slice(0, 10),
                display_name: "Signal",
            });
        }

        // Progress animation finish
        for (let i = 90; i <= 100; i++) {
            setProgress(i);
            await new Promise(r => setTimeout(r, 15));
        }

        const newIds = [...scannedIds, ...selPlaylists.map(p => p.id)];
        setScannedIds(newIds);
        setStage("complete");
    };

    const ytOk = ytTracks.filter(t => t.status === "ok");
    const hasYt = ytOk.length > 0;

    // ─────────────────────────────────────────────────────────────────────
    return (
        <div className="relative min-h-screen bg-[#080808] overflow-x-hidden">
            <style>{`
                
                *{font-family:var(--font-syne),'Syne',sans-serif}
                .mono{font-family:'DM Mono',monospace!important}
                .glass{background:rgba(10,10,10,.75);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px)}
                @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}
                .shimmer{animation:shimmer 4s infinite cubic-bezier(.4,0,.2,1)}
                .sb::-webkit-scrollbar{width:4px}
                .sb::-webkit-scrollbar-thumb{background:rgba(255,0,0,.2);border-radius:4px}
                body::after{content:'';position:fixed;inset:0;z-index:9998;pointer-events:none;
                    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.04'/%3E%3C/svg%3E");opacity:.5}
            `}</style>

            <AnimatePresence mode="wait">

                {/* ═══════════════════════════════════════════════════════ */}
                {/* LANDING PAGE                                            */}
                {/* ═══════════════════════════════════════════════════════ */}
                {stage === "landing" && (
                    <Landing
                        onStart={() => setStage("intro")}
                        onArtist={() => window.location.href = "/artists"}
                    />
                )}

                {/* ═══════════════════════════════════════════════════════ */}
                {/* CONVERSATIONAL ONBOARDING                               */}
                {/* ═══════════════════════════════════════════════════════ */}
                {(stage === "intro" || stage === "welcome_name" || stage === "welcome_story") && (
                    <ConversationalOnboarding
                        existing={existing}
                        checking={checking}
                        displayName={displayName}
                        setDisplayName={setDisplayName}
                        city={city}
                        setCity={setCity}
                        onResume={() => { setDna(existing); setStage("complete"); }}
                        onBegin={() => setStage("sources")}
                    />
                )}

                {/* ═══════════════════════════════════════════════════════ */}
                {/* INNER STAGES                                            */}
                {/* ═══════════════════════════════════════════════════════ */}
                {stage !== "intro" && stage !== "welcome_name" && stage !== "welcome_story" && stage !== "landing" && (
                    <motion.div key="inner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full min-h-screen">


                        <div className="max-w-5xl mx-auto px-4 md:px-8 pt-[5rem] lg:pt-28 pb-40 w-full">
                            <AnimatePresence mode="wait">

                                {/* ── REVIEW SONGS ── */}
                                {stage === "review_songs" && (
                                    <motion.div key="rs" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                        <Stepper step={1} />
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                            <div className="lg:col-span-8 space-y-6">
                                                <div>
                                                    <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic mb-1">Found <span className="text-[#FF0000]">Tracks</span></h2>
                                                    <p className="mono text-[10px] text-white/55 uppercase tracking-[0.4em]">Review the tracks extracted from your sources</p>
                                                </div>
                                                <div className="glass p-7 rounded-[2.5rem] border border-white/14">
                                                    <div className="space-y-3 max-h-[50vh] overflow-y-auto sb pr-2">
                                                        {fetchedSources?.spotifyTracks?.map((t: any, i: number) => (
                                                            <div key={`sp-${i}`} className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5">
                                                                {t.thumbnail ? <img src={t.thumbnail} className="w-10 h-10 object-cover rounded-lg" /> : <div className="w-10 h-10 bg-[#1DB954]/20 rounded-lg flex items-center justify-center"><Music2 className="w-4 h-4 text-[#1DB954]" /></div>}
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-white text-xs font-bold truncate mb-0.5">{t.title}</p>
                                                                    <p className="text-white/40 mono text-[9px] truncate">{t.artist}</p>
                                                                </div>
                                                                <div className="w-6 h-6 rounded-full bg-[#1DB954]/20 flex items-center justify-center shrink-0">
                                                                    <Music2 className="w-3 h-3 text-[#1DB954]" />
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {fetchedSources?.youtubeTracks?.map((t: any, i: number) => (
                                                            <div key={`yt-${i}`} className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5">
                                                                {t.thumbnail ? <img src={t.thumbnail} className="w-10 h-10 object-cover rounded-lg" /> : <div className="w-10 h-10 bg-[#FF0000]/20 rounded-lg flex items-center justify-center"><Youtube className="w-4 h-4 text-[#FF0000]" /></div>}
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-white text-xs font-bold truncate mb-0.5" dangerouslySetInnerHTML={{ __html: t.title }}></p>
                                                                    <p className="text-white/40 mono text-[9px] truncate">{t.artist}</p>
                                                                </div>
                                                                <div className="w-6 h-6 rounded-full bg-[#FF0000]/20 flex items-center justify-center shrink-0">
                                                                    <Youtube className="w-3 h-3 text-[#FF0000]" />
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {(!fetchedSources?.spotifyTracks?.length && !fetchedSources?.youtubeTracks?.length) && (
                                                            <div className="text-center py-10">
                                                                <AlertCircle className="w-8 h-8 text-white/20 mx-auto mb-3" />
                                                                <p className="text-white/40 mono text-[10px] uppercase">No tracks could be found from your sources</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="lg:col-span-4 sticky top-24">
                                                <div className="glass p-7 rounded-[2rem] border border-[#FF0000]/20 bg-[#FF0000]/5 flex flex-col gap-5">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-black uppercase tracking-[0.3em] text-[#FF0000]">Extracted Tracks</span>
                                                        <span className="mono text-[10px] text-white/60">{(fetchedSources?.spotifyTracks?.length || 0) + (fetchedSources?.youtubeTracks?.length || 0)} total</span>
                                                    </div>
                                                    <p className="text-[10px] text-white/60 leading-relaxed font-bold">
                                                        These are the tracks we found from your connected sources. We will prioritize these to compute your DNA.
                                                    </p>
                                                    <button onClick={() => { setStage("genre_selection"); setProgress(0); }} className="w-full bg-[#FF0000] text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-500 transition-all text-[11px] uppercase tracking-widest shadow-[0_0_20px_rgba(255,0,0,0.2)]">
                                                        Confirm Genres <ArrowRight className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button onClick={() => setStage("sources")} className="mono text-[10px] text-white/45 hover:text-white transition-all uppercase tracking-widest mt-1">
                                                        ← Back to Sources
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* ── GENRE SELECTION ── */}
                                {stage === "genre_selection" && (
                                    <motion.div key="gs" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                        <Stepper step={2} />
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                            <div className="lg:col-span-8 space-y-6">
                                                <div>
                                                    <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic mb-1">Sonic <span className="text-[#FF0000]">Library</span></h2>
                                                    <p className="mono text-[10px] text-white/55 uppercase tracking-[0.4em]">Select genres — 50% of your DNA weight</p>
                                                </div>
                                                <div className="glass p-7 rounded-[2.5rem] border border-white/14">
                                                    <div className="flex flex-wrap gap-2.5">
                                                        {GENRES.map(g => {
                                                            const on = genres.includes(g);
                                                            return (
                                                                <button key={g} onClick={() => setGenres(p => p.includes(g) ? p.filter(x => x !== g) : [...p, g])}
                                                                    className={`rounded-full border font-black uppercase text-[10px] py-2.5 px-5 tracking-widest transition-all duration-150 ${on ? "bg-[#FF0000] text-white border-[#FF0000] shadow-[0_0_18px_rgba(255,0,0,0.35)]" : "bg-white/10 border-white/20 text-white/80 hover:border-[#FF0000]/60 hover:text-white"}`}>
                                                                    {g}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="lg:col-span-4 sticky top-24">
                                                <div className="glass p-7 rounded-[2rem] border border-[#FF0000]/20 bg-[#FF0000]/5 flex flex-col gap-5">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-black uppercase tracking-[0.3em] text-[#FF0000]">Active Signal</span>
                                                        <span className="mono text-[10px] text-white/60">{genres.length} loaded</span>
                                                    </div>
                                                    <div className="min-h-[100px] flex flex-wrap gap-2 content-start sb overflow-auto max-h-48">
                                                        {genres.length === 0
                                                            ? <div className="w-full flex items-center justify-center py-6 opacity-40"><p className="mono text-[10px] uppercase tracking-widest">Select genres →</p></div>
                                                            : genres.map((g, i) => (
                                                                <motion.span key={g + i} initial={{ scale: .8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                                                    className="bg-white/10 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide flex items-center gap-1.5 border border-white/14">
                                                                    {g}<button onClick={() => setGenres(p => p.filter(x => x !== g))} className="hover:text-[#FF0000] transition-colors leading-none">×</button>
                                                                </motion.span>
                                                            ))

                                                        }
                                                    </div>
                                                    <div className="space-y-2.5 pt-2 border-t border-white/14">
                                                        <button onClick={runAnalysis} disabled={genres.length === 0}
                                                            className="w-full flex items-center justify-center gap-3 bg-[#FF0000] text-white py-5 rounded-xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(255,0,0,0.2)] disabled:opacity-40 disabled:scale-100 overflow-hidden relative">
                                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full shimmer pointer-events-none" />
                                                            Confirm & Continue <ArrowRight className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={() => setStage("intro")} className="w-full mono text-[10px] text-white/80 hover:text-white transition-all text-center py-2 uppercase tracking-widest">← Home</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* ── SOURCES ── */}
                                {stage === "sources" && (
                                    <motion.div key="srcs" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-4xl mx-auto">
                                        <Stepper step={0} />
                                        <div className="text-center mb-6 md:mb-10">
                                            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2 md:mb-4">
                                                Music <span className="text-[#1DB954]">Spotify</span> & <span className="text-[#FF0000]">YouTube</span>
                                            </h2>
                                            <p className="mono text-[10px] text-white/55 uppercase tracking-[0.4em]">Provide your musical footprint from either or both sources.</p>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                            {/* SPOTIFY CARD */}
                                            <div className="glass p-8 rounded-[2rem] border border-white/14 flex flex-col">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="h-10 w-10 rounded-full bg-[#1DB954]/20 flex items-center justify-center">
                                                        <Music2 className="h-5 w-5 text-[#1DB954]" />
                                                    </div>
                                                    <a href="https://spotify.com" target="_blank" rel="noopener noreferrer" className="text-2xl font-black text-white hover:text-[#1DB954] transition-colors">Spotify</a>
                                                </div>

                                                <div className="flex flex-col gap-2 p-2 bg-white/10 border border-white/25 rounded-2xl focus-within:border-[#1DB954]/60 transition-all mb-4">
                                                    <input type="text" value={spotifyUrl} onChange={e => { setSpotifyUrl(e.target.value); setScanErr(null); }} onKeyDown={e => e.key === "Enter" && scanSpotify(0)} placeholder="Paste your Profile OR any Playlist URL..." className="bg-transparent py-3 px-4 focus:outline-none mono text-xs text-white placeholder:text-white/60 w-full" />
                                                    <button onClick={() => scanSpotify(0)} disabled={scanning || !spotifyUrl.trim()} className="bg-[#1DB954] text-white font-black px-6 py-3 rounded-xl hover:bg-[#1ed760] transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-40 shrink-0">
                                                        {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scan className="h-4 w-4" />} Scan
                                                    </button>
                                                </div>
                                                {scanErr && <p className="mono text-[10px] text-red-400 mb-4">{scanErr}</p>}

                                                <details className="mb-6 bg-white/4 border border-white/10 rounded-xl p-4 text-sm text-white/70 open:bg-white/5 transition-colors group">
                                                    <summary className="cursor-pointer font-bold select-none text-white/60 group-open:text-white flex items-center justify-between text-xs uppercase tracking-widest mono">
                                                        <span className="flex items-center gap-2"><HelpCircle className="h-4 w-4 text-[#1DB954]" /> Where is my Spotify URL?</span>
                                                        <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                                                    </summary>
                                                    <div className="mt-5 space-y-5 text-sm font-medium leading-relaxed pb-1">
                                                        <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                                                            <span className="text-white font-black block mb-2 uppercase text-xs tracking-wider">🖥️ Desktop (Web/App)</span>
                                                            <span className="text-white/50 block mb-3 text-xs">The easiest path — just right-click your profile:</span>
                                                            <ol className="list-decimal pl-5 space-y-1 text-white/80">
                                                                <li>Go to Spotify and sign in</li>
                                                                <li>Click your profile name (top-right corner)</li>
                                                                <li>Click <span className="text-white font-bold">"..."</span> → <span className="text-white font-bold">Share</span> → <span className="text-[#1DB954] font-bold">Copy link to profile</span></li>
                                                                <li className="text-white/40 mt-2 list-none text-xs italic bg-white/5 p-2 rounded -ml-5">URL looks like: open.spotify.com/user/31abc123xyz</li>
                                                            </ol>
                                                        </div>
                                                        <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                                                            <span className="text-white font-black block mb-2 uppercase text-xs tracking-wider">📱 Mobile (iPhone/Android)</span>
                                                            <span className="text-[#FF0000]/80 block mb-3 text-xs font-bold bg-[#FF0000]/10 p-2 rounded">Important: You can't copy the profile URL from within the Home screen directly — you have to go through Your Library.</span>
                                                            <ol className="list-decimal pl-5 space-y-1 text-white/80">
                                                                <li>Open Spotify → tap <span className="text-white font-bold">Your Library</span> (bottom)</li>
                                                                <li>Tap your profile picture/icon at the top</li>
                                                                <li>Tap the <span className="text-white font-bold">"⋯"</span> (three dots) menu</li>
                                                                <li>Tap <span className="text-white font-bold">Share</span> → <span className="text-[#1DB954] font-bold">Copy link</span></li>
                                                            </ol>
                                                            <span className="text-white/50 block mt-4 mb-2 text-xs">Alternatively:</span>
                                                            <ol className="list-decimal pl-5 space-y-1 text-white/80 opacity-75">
                                                                <li>Open Spotify app → tap <span className="text-white font-bold">Home</span></li>
                                                                <li>Tap your profile picture (top-left)</li>
                                                                <li>Tap <span className="text-white font-bold">"View Profile"</span></li>
                                                                <li>Tap <span className="text-white font-bold">"⋯"</span> → <span className="text-white font-bold">Share</span> → <span className="text-[#1DB954] font-bold">Copy link</span></li>
                                                            </ol>
                                                        </div>
                                                    </div>
                                                </details>

                                                {playlists.length > 0 && (
                                                    <div className="flex-1 min-h-[250px] flex flex-col mt-2">
                                                        <div className="flex justify-between items-center mb-3">
                                                            <span className="mono text-[10px] text-white/60 uppercase">Select Playlists</span>
                                                            <span className="mono text-[10px] text-[#1DB954]">{selPlaylists.length}/5</span>
                                                        </div>
                                                        <div className="flex-1 overflow-y-auto max-h-64 space-y-2 pr-2 sb">
                                                            {playlists.filter(pl => !scannedIds.includes(pl.id)).map(pl => {
                                                                const sel = !!selPlaylists.find(p => p.id === pl.id);
                                                                const maxed = !sel && selPlaylists.length >= 5;
                                                                return (
                                                                    <button key={pl.id} onClick={() => !maxed && togglePlaylist(pl)} className={`w-full text-left p-3 rounded-xl border flex items-center gap-3 transition-all ${sel ? "bg-[#1DB954]/20 border-[#1DB954]/50" : maxed ? "opacity-30 border-white/10" : "bg-white/5 border-white/10 hover:border-[#1DB954]/30"}`}>
                                                                        {pl.image ? <img src={pl.image} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" /> : <div className="w-10 h-10 rounded-lg bg-white/10 flex-shrink-0" />}
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-white font-bold text-sm truncate">{pl.name}</p>
                                                                            <p className="text-white/50 mono text-[9px]">{pl.track_count} tracks</p>
                                                                        </div>
                                                                        {sel && <CheckCircle2 className="h-4 w-4 text-[#1DB954]" />}
                                                                    </button>
                                                                )
                                                            })}
                                                            {plTotal > playlists.length && (
                                                                <button onClick={() => scanSpotify(plOffset + 6)} disabled={loadingMore} className="w-full p-3 text-[#1DB954] font-black text-[10px] uppercase tracking-widest border border-[#1DB954]/20 rounded-xl hover:bg-[#1DB954]/10 transition-colors mt-2 disabled:opacity-50 flex items-center justify-center gap-2 block bg-white/5">
                                                                    {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
                                                                    {loadingMore ? "Fetching..." : "Load More Playlists"}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* YOUTUBE CARD */}
                                            <div className="glass p-8 rounded-[2rem] border border-white/14 flex flex-col">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="h-10 w-10 rounded-full bg-[#FF0000]/20 flex items-center justify-center">
                                                        <Youtube className="h-5 w-5 text-[#FF0000]" />
                                                    </div>
                                                    <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-2xl font-black text-white hover:text-[#FF0000] transition-colors">YouTube</a>
                                                </div>

                                                <div className="relative mb-4">
                                                    <div className="flex items-center gap-2 p-2 bg-white/5 border border-white/12 rounded-2xl">
                                                        <input type="text" value={ytQuery} onChange={e => { setYtQuery(e.target.value); setYtShowSearch(true) }} onKeyDown={e => e.key === "Enter" && searchYt(ytQuery)} placeholder="Search for a song..." className="flex-1 bg-transparent py-2.5 px-4 focus:outline-none mono text-xs text-white placeholder:text-white/35 min-w-0" />
                                                        <button onClick={() => searchYt(ytQuery)} disabled={ytSearching || !ytQuery.trim()} className="bg-[#FF0000] text-white px-4 py-2.5 rounded-xl font-black text-[10px] uppercase">Search</button>
                                                    </div>
                                                    <AnimatePresence>
                                                        {ytShowSearch && (ytSearching || ytResults.length > 0) && (
                                                            <motion.div className="absolute top-full left-0 right-0 mt-2 bg-[#111] border border-white/10 rounded-xl max-h-64 overflow-y-auto z-50 p-2 shadow-2xl backdrop-blur-xl">
                                                                {ytSearching ? (
                                                                    <div className="flex flex-col items-center justify-center py-10 gap-3">
                                                                        <Loader2 className="h-6 w-6 text-[#FF0000] animate-spin" />
                                                                        <span className="mono text-[9px] text-white/40 uppercase tracking-widest">Searching Pulse</span>
                                                                    </div>
                                                                ) : (
                                                                    ytResults.map(v => {
                                                                        const alreadyAdded = ytTracks.some(t => t.url.includes(v.id) && t.status === "ok");
                                                                        return (
                                                                            <div key={v.id} className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl border-b border-white/5 hover:bg-white/5 transition-colors group ${alreadyAdded ? 'opacity-30' : ''}`}>
                                                                                <button onClick={() => !alreadyAdded && addYtSearchResult(v)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                                                                                    <img src={v.thumbnail} className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <p className="text-white text-[11px] font-bold truncate mb-1" dangerouslySetInnerHTML={{ __html: v.title }}></p>
                                                                                        <p className="text-white/40 mono text-[9px] truncate">{v.channelTitle}</p>
                                                                                    </div>
                                                                                </button>
                                                                                {!alreadyAdded && (
                                                                                    <button onClick={(e) => magicFillSlots(v, e)} className="shrink-0 flex items-center gap-1.5 bg-[#FF0000]/20 text-[#FF0000] px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-[#FF0000] hover:text-white transition-all">
                                                                                        <Sparkles className="h-3 w-3" /> Magic Fill 5
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        )
                                                                    })
                                                                )}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>

                                                <div className="space-y-2 mt-4">
                                                    {ytTracks.map((tr, idx) => (
                                                        <div key={tr.id || idx} className={`flex gap-3 items-center p-3 rounded-xl border transition-all ${tr.status !== "idle" ? "bg-white/5 border-white/10" : "bg-white/2 border-white/5 border-dashed"}`}>
                                                            {tr.status === "ok" || tr.thumbnail ? (
                                                                <img src={tr.thumbnail} className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                                                            ) : (
                                                                <div className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-lg flex-shrink-0">
                                                                    <Youtube className="w-5 h-5 text-white/20" />
                                                                </div>
                                                            )}

                                                            <div className="flex-1 min-w-0">
                                                                {tr.status === "loading" ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <Loader2 className="w-4 h-4 animate-spin text-white/50" />
                                                                        <span className="text-[10px] text-white/50 uppercase tracking-widest">Resolving Link...</span>
                                                                    </div>
                                                                ) : tr.status === "ok" ? (
                                                                    <>
                                                                        <p className="text-white text-xs font-bold truncate mb-0.5" dangerouslySetInnerHTML={{ __html: tr.title || "Unknown" }}></p>
                                                                        <p className="text-white/40 mono text-[9px] truncate">{tr.channel || "YouTube"}</p>
                                                                    </>
                                                                ) : tr.status === "error" ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                                                        <span className="text-[10px] text-red-400 uppercase tracking-widest">{tr.error || "Failed to load"}</span>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <p className="text-white/30 text-[11px] font-bold mb-0.5 uppercase tracking-widest">Slot {idx + 1}</p>
                                                                        <p className="text-white/20 mono text-[9px] italic">Search or paste URL above</p>
                                                                    </>
                                                                )}
                                                            </div>

                                                            {tr.status !== "idle" && (
                                                                <button onClick={() => setYtTracks(t => t.map((x, i) => i === idx ? { ...x, url: "", status: "idle", title: undefined, channel: undefined, thumbnail: undefined, error: undefined } : x))} className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors group" title="Remove Track">
                                                                    <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-4 bg-white/5 p-4 rounded-xl border border-white/5">
                                                    <p className="text-[10px] text-white/45 leading-relaxed font-medium">
                                                        💡 <strong className="text-white/70">Tip:</strong> Search for 5 distinct tracks that represent your sound securely, or paste valid YouTube video URLs.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-center">
                                            <button onClick={fetchSourcesAndPreselect} disabled={selPlaylists.length === 0 && !hasYt} className="w-full sm:w-auto relative flex items-center justify-center gap-3 bg-[#FF0000] text-white font-black text-[13px] uppercase tracking-wider px-12 py-5 rounded-2xl hover:bg-red-500 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_35px_rgba(255,0,0,0.3)] disabled:opacity-30 disabled:scale-100 disabled:cursor-not-allowed">
                                                Next: Review Tracks <ArrowRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="flex justify-center mt-6">
                                            <button onClick={() => setStage("welcome_name")} className="mono text-[10px] text-white/45 hover:text-white transition-all uppercase tracking-widest">← Back</button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* ── ANALYZING ── */}
                                {stage === "analyzing" && (
                                    <motion.div key="an" initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                        className="glass rounded-[3rem] p-12 md:p-20 text-center max-w-xl mx-auto border border-[#FF0000]/18 bg-[#FF0000]/4">
                                        <div className="relative h-44 w-44 mx-auto mb-10">
                                            <div className="absolute inset-0 rounded-full border-4 border-[#FF0000]/10" />
                                            <motion.div className="absolute inset-0 rounded-full border-4 border-t-[#FF0000] border-transparent" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                                            <motion.div className="absolute inset-4 rounded-full border-2 border-r-[#FF0000]/35 border-transparent" animate={{ rotate: -360 }} transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }} />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-4xl font-black text-[#FF0000] italic">{progress}%</span>
                                                <span className="mono text-[9px] text-white/55 uppercase tracking-[0.3em] mt-1">QUANTIZING</span>
                                            </div>
                                        </div>
                                        <h2 className="text-3xl font-black text-white italic mb-3">Mapping your DNA</h2>
                                        <p className="text-white/65 font-medium max-w-xs mx-auto leading-relaxed text-sm mb-10">
                                            {selPlaylists.length > 0 && <a href="https://spotify.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#1DB954] transition-all underline decoration-[#1DB954]/30 underline-offset-4">{selPlaylists.length} playlist{selPlaylists.length !== 1 ? "s" : ""}</a>}
                                            {selPlaylists.length > 0 && ytOk.length > 0 && " + "}
                                            {ytOk.length > 0 && <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF0000] transition-all underline decoration-[#FF0000]/30 underline-offset-4">{ytOk.length} YouTube track{ytOk.length !== 1 ? "s" : ""}</a>}
                                            {" "}across 12 sonic dimensions
                                        </p>
                                        <div className="space-y-3 text-left max-w-[260px] mx-auto">
                                            {[
                                                { l: "Genre vector computed", d: progress > 10 },
                                                { l: <><a href="https://spotify.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#1DB954] transition-colors">Spotify</a> features extracted</>, d: progress > 40, skip: selPlaylists.length === 0 },
                                                { l: <><a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF0000] transition-colors">YouTube</a> signals processed</>, d: progress > 65, skip: ytOk.length === 0 },
                                                { l: "Combining signals", d: progress > 80 },
                                                { l: "Generating narrative", d: progress >= 100 },
                                            ].map(({ l, d, skip }) => skip ? null : (
                                                <div key={typeof l === 'string' ? l : 'source-' + d} className={`flex items-center gap-3 transition-all duration-500 ${d ? "opacity-100" : "opacity-40"}`}>
                                                    <div className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${d ? "border-[#FF0000] bg-[#FF0000]/25" : "border-white/30"}`}>
                                                        {d && <Check className="h-2.5 w-2.5 text-[#FF0000]" />}
                                                    </div>
                                                    <span className="mono text-[9px] text-white/80 uppercase tracking-widest">{l}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* ── COMPLETE ── */}
                                {stage === "complete" && dna && (
                                    <motion.div key="co" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 w-full pb-16">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
                                            {/* Vector map */}
                                            <div className="space-y-4">
                                                {!email && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="glass rounded-[2rem] p-6 border border-[#FF0000]/30 bg-[#FF0000]/5 relative overflow-hidden mb-2"
                                                    >
                                                        <div className="absolute top-0 right-0 p-4 opacity-5"><Mail className="h-16 w-16 text-[#FF0000]" /></div>
                                                        <div className="relative z-10">
                                                            <h4 className="text-sm font-black text-white italic uppercase tracking-tighter mb-1">Anonymous Signal Detected</h4>
                                                            <p className="text-white/60 text-[10px] font-bold leading-relaxed mb-4">You are viewing a temporary profile. Secure this DNA with your email to prevent data loss and connect with matches.</p>
                                                            <Link href="/profile" className="inline-flex items-center gap-2 text-[#FF0000] text-[9px] font-black uppercase tracking-widest hover:translate-x-1 transition-transform">
                                                                Secure DNA Now <ArrowRight className="h-3 w-3" />
                                                            </Link>
                                                        </div>
                                                    </motion.div>
                                                )}

                                                <div className="glass rounded-[2.5rem] p-8 md:p-10 border border-white/10">
                                                    <p className="mono text-[10px] text-white/60 uppercase tracking-widest mb-7">Structural Map Vector — 12 Dimensions</p>
                                                    <div className="space-y-4 max-h-[420px] overflow-y-auto sb pr-2">
                                                        {(dna.axes || ["spectral_energy", "harmonic_depth", "rhythmic_drive", "melodic_warmth", "structural_complexity", "sonic_texture", "tempo_variance", "tonal_brightness", "dynamic_range", "genre_fusion", "experimental_index", "emotional_density"]).map((axis: string, i: number) => (
                                                            <DnaBar key={axis} label={axis.replace(/_/g, " ")} value={dna.vector?.[i] ?? 0} red={i % 2 === 0} />
                                                        ))}
                                                    </div>
                                                    <div className="mt-9 flex flex-col items-center pt-7 border-t border-white/10">
                                                        <CheckCircle2 className="h-14 w-14 text-[#FF0000] mb-3 drop-shadow-lg" />
                                                        <span className="text-lg font-black tracking-[0.3em] uppercase text-white italic">Sync Verified</span>
                                                        <span className="mono text-[9px] text-white/55 uppercase tracking-widest mt-1.5">{dna.display_name}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Stats + CTA */}
                                            <div className="space-y-4">
                                                <div className="glass rounded-[2.5rem] p-8 border border-[#FF0000]/20 bg-[#FF0000]/4">
                                                    <div className="flex items-center justify-between mb-5">
                                                        <span className="mono text-[10px] text-[#FF0000] uppercase tracking-widest font-black flex items-center gap-2"><Brain className="h-4 w-4" />Neural Match</span>
                                                        <span className="mono text-[9px] text-white/50">12,492 nodes</span>
                                                    </div>
                                                    <div className="flex items-end justify-between border-b border-white/25 pb-5 mb-5">
                                                        <h4 className="text-xl font-black text-white italic truncate pr-4">{dna.display_name}</h4>
                                                        <div className="text-right shrink-0">
                                                            <p className="mono text-3xl font-black text-[#FF0000]">{((dna.coherence_index ?? 0.8) * 100).toFixed(1)}%</p>
                                                            <p className="mono text-[9px] text-white/80 uppercase tracking-widest">Coherence</p>
                                                        </div>
                                                    </div>

                                                    {/* Evolution Feedback */}
                                                    <div className="space-y-6 mb-7">
                                                        <div>
                                                            <p className="mono text-[9px] text-white/60 uppercase tracking-[0.2em] mb-3">Seed Identity — Your Selection</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {(dna.top_genres || []).map((g: string, i: number) => (
                                                                    <span key={g + i} className="bg-white/15 border border-white/25 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{g}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="mono text-[9px] text-[#FF0000]/60 uppercase tracking-[0.2em] mb-3">Neural Highlights — Extracted Dimensions</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {AXIS_LABELS.map((label, i) => ({ label, value: dna.vector?.[i] || 0 }))
                                                                    .sort((a, b) => b.value - a.value)
                                                                    .slice(0, 3)
                                                                    .map((axis, i) => (
                                                                        <span key={axis.label} className="bg-[#FF0000]/10 border border-[#FF0000]/20 text-[#FF0000] px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(255,0,0,0.15)]">
                                                                            {axis.label.replace(/_/g, " ")}
                                                                        </span>
                                                                    ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3 mb-5">
                                                        {[["Vector Dist", "0.198"], ["Dimensions", "12D"]].map(([k, v]) => (
                                                            <div key={k} className="bg-white/7 p-4 rounded-2xl border border-white/8">
                                                                <p className="mono text-[9px] text-white/60 uppercase tracking-widest mb-1.5">{k}</p>
                                                                <p className="mono text-xl font-black text-white">{v}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        fetch('/api/dna/intent', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ intent: 'find_soulmates' })
                                                        }).catch(console.error);
                                                        window.location.href = "/soulmates?genres=" + genres.join(",");
                                                    }}
                                                    className="relative flex items-center justify-between w-full bg-[#FF0000] p-6 rounded-[2rem] font-black text-white uppercase tracking-[0.2em] text-lg hover:scale-[1.01] active:scale-95 transition-all shadow-[0_14px_50px_rgba(255,0,0,0.4)] overflow-hidden group">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full shimmer pointer-events-none" />
                                                    <span className="flex items-center gap-3 relative z-10"><Users className="h-6 w-6 fill-white" />Find Soulmates</span>
                                                    <ChevronRight className="h-7 w-7 group-hover:translate-x-2 transition-transform relative z-10" />
                                                </button>
                                                <Link href="/profile"
                                                    className="relative w-full overflow-hidden flex items-center justify-center gap-3 border border-[#FF0000]/20 bg-black/40 text-white hover:border-[#FF0000]/40 font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl hover:scale-[1.01] active:scale-95 transition-all group">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                    <User className="h-5 w-5 text-white/70 group-hover:text-white transition-colors relative z-10" />
                                                    <span className="relative z-10">View Full Profile</span>
                                                </Link>
                                                <ShareDNACard profile={dna} />
                                                <button onClick={() => { setStage("intro"); setSelPlaylists([]); setYtTracks(emptyYt()); }} className="w-full mono text-[10px] text-white/45 hover:text-[#FF0000] transition-all uppercase tracking-widest py-2 text-center">↺ Start new scan</button>

                                            </div>
                                        </div>


                                        {/* Narrative */}
                                        {dna.narrative && (
                                            <div className="glass rounded-[2.5rem] p-8 md:p-10 border border-white/25">
                                                <p className="mono text-[10px] text-[#FF0000] uppercase tracking-[0.4em] mb-5 font-black flex items-center gap-2"><Brain className="h-3.5 w-3.5" />Your Sound Profile</p>
                                                <p className="text-white font-medium leading-relaxed text-sm">{dna.narrative}</p>
                                            </div>
                                        )}

                                        {/* Layman Interpretation */}
                                        <div className="glass rounded-[2.5rem] p-8 md:p-12 border border-[#FF0000]/20 bg-[#FF0000]/2 overflow-hidden relative">
                                            <div className="absolute top-0 right-0 p-10 opacity-[0.05] pointer-events-none">
                                                <Brain className="h-40 w-40 text-[#FF0000]" />
                                            </div>
                                            <div className="relative z-10">
                                                <p className="mono text-[10px] text-[#FF0000] uppercase tracking-[0.4em] mb-8 font-black flex items-center gap-2">
                                                    🎯 What This Profile Says Overall
                                                </p>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                                    <div>
                                                        <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-6 opacity-60">This radar suggests someone who likes:</h3>
                                                        <ul className="space-y-4">
                                                            {generateInterpretation(dna.vector).characteristics.map((c: string, i: number) => (
                                                                <li key={i} className="flex items-center gap-4 text-white/80 text-sm font-bold italic tracking-tight transition-all hover:translate-x-1">
                                                                    <div className="h-1.5 w-1.5 rounded-full bg-[#FF0000]/80 shadow-[0_0_8px_rgba(255,0,0,0.5)]" />
                                                                    {c}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    <div>
                                                        <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-6 opacity-60">That combination strongly aligns with:</h3>
                                                        <div className="flex flex-wrap gap-2.5">
                                                            {generateInterpretation(dna.vector).genreMatches.map((g: string, i: number) => (
                                                                <span key={i} className="bg-white/5 border border-white/10 text-white/90 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] shadow-lg">
                                                                    {g}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Captured tracks */}
                                        {dna.recent_tracks?.length > 0 && (
                                            <div className="glass rounded-[2.5rem] p-7 border border-white/12">
                                                <p className="mono text-[10px] text-white/55 uppercase tracking-[0.4em] mb-5">
                                                    Captured Signals (<a href="https://spotify.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#1DB954] transition-colors">Spotify</a> / <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF0000] transition-colors">YouTube</a>) — {dna.recent_tracks.length} tracks
                                                </p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {dna.recent_tracks.map((tr: any, i: number) => (
                                                        <a key={tr.id + i} href={tr.url || "#"} target="_blank" rel="noopener noreferrer"
                                                            className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/4 border border-white/10 hover:bg-white/7 hover:border-[#FF0000]/25 transition-all group">
                                                            <div className="h-11 w-11 rounded-xl overflow-hidden bg-white/8 shrink-0">
                                                                {tr.thumbnail ? <img src={tr.thumbnail} alt="" className="h-full w-full object-cover grayscale opacity-55 group-hover:grayscale-0 group-hover:opacity-100 transition-all" /> : <Music2 className="h-5 w-5 opacity-30 m-auto mt-3" />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-black truncate text-white/70 group-hover:text-white transition-colors" dangerouslySetInnerHTML={{ __html: tr.title || "Unknown" }} />
                                                                <p className="mono text-[9px] text-white/55 uppercase truncate">{tr.artist || tr.channelTitle}</p>
                                                            </div>
                                                            <ExternalLink className="h-3.5 w-3.5 text-white/10 group-hover:text-[#FF0000] transition-all shrink-0" />
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}


                                {/* ── EMAIL CAPTURE ── */}
                                {stage === "email_capture" && (
                                    <motion.div key="ec" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                                        className="text-center max-w-lg mx-auto pb-20">

                                        {!clash ? (
                                            <>
                                                <div className="h-20 w-20 rounded-[2rem] bg-[#FF0000]/10 flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(255,0,0,0.1)]">
                                                    <Search className="h-10 w-10 text-[#FF0000]" />
                                                </div>
                                                <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter mb-4">Secure your Signal</h2>
                                                <p className="text-white/80 mono text-[9px] uppercase tracking-[0.4em] mb-12">
                                                    Link your DNA to find soulmates in the network.
                                                </p>

                                                <div className="flex flex-col gap-4">
                                                    <input
                                                        type="email"
                                                        value={email}
                                                        onChange={e => setEmail(e.target.value)}
                                                        onKeyDown={e => e.key === "Enter" && handleFinalSubmit()}
                                                        placeholder="your@email.com"
                                                        autoFocus
                                                        className="w-full bg-white/10 border border-white/25 rounded-2xl py-6 px-8 focus:outline-none focus:border-[#FF0000]/60 transition-all text-center text-2xl font-bold text-white placeholder:text-white/40"
                                                    />
                                                    <button
                                                        onClick={() => handleFinalSubmit()}
                                                        disabled={checkingEmail || !email.trim() || !email.includes("@")}
                                                        className="w-full sm:w-auto px-16 flex items-center justify-center gap-3 bg-[#FF0000] text-white py-6 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:scale-100 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(255,0,0,0.3)] mt-2"
                                                    >
                                                        {checkingEmail ? <Loader2 className="h-5 w-5 animate-spin" /> : "Find Connections"} <ArrowRight className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass p-10 rounded-[3rem] border border-[#FF0000]/30 bg-[#FF0000]/5 backdrop-blur-3xl shadow-[0_0_120px_rgba(255,0,0,0.2)]">
                                                <div className="h-20 w-20 rounded-full bg-[#FF0000]/20 flex items-center justify-center mx-auto mb-8">
                                                    <AlertCircle className="h-10 w-10 text-[#FF0000]" />
                                                </div>
                                                <h3 className="text-3xl font-black text-white italic mb-3">Found your match!</h3>
                                                <p className="text-white/80 text-sm mb-10 leading-relaxed font-bold">
                                                    The email <span className="font-bold text-[#FF0000]">{email}</span> is already tied to <span className="text-white font-bold">{clash.display_name}</span>.<br /><br />
                                                    Overwrite that DNA profile with your new analysis?
                                                </p>

                                                <div className="flex flex-col gap-3">
                                                    <button
                                                        onClick={() => handleFinalSubmit(true)}
                                                        className="w-full bg-[#FF0000] text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_40px_rgba(255,0,0,0.3)]"
                                                    >
                                                        Yes, Overwrite
                                                    </button>
                                                    <button
                                                        onClick={handleResumeExisting}
                                                        className="w-full bg-white text-black py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all"
                                                    >
                                                        Resume Existing Signal
                                                    </button>
                                                    <button
                                                        onClick={() => { setClash(null); setEmail(""); }}
                                                        className="w-full bg-white/5 border border-white/10 text-white/50 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all hover:text-white"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}

                                        <div className="flex justify-center mt-12">
                                            <button onClick={() => { setClash(null); setStage("complete") }} className="mono text-[10px] text-white/80 hover:text-white transition-all uppercase tracking-[0.3em]">← Restore View</button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* BG glow */}
                        <div className="fixed inset-0 -z-10 pointer-events-none">
                            <div className={`absolute top-1/4 left-1/4 h-[500px] w-[500px] blur-[160px] rounded-full transition-colors duration-1000 ${stage === "analyzing" ? "bg-[#FF0000]/22" : "bg-[#FF0000]/7"}`} />
                            <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] blur-[160px] rounded-full bg-orange-900/7" />
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}