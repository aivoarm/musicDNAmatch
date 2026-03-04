"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Waves, ArrowRight, Brain, ChevronRight, Youtube,
    Music2, HelpCircle, Plus, ExternalLink, CheckCircle2,
    Scan, Users, Play, User, Check, X,
    AlertCircle, Loader2, Search
} from "lucide-react";
import Link from "next/link";
import { AXIS_LABELS, generateInterpretation } from "@/lib/dna";


// ─── Types ────────────────────────────────────────────────────────────────
type Stage = "intro" | "genre_selection" | "spotify_input" | "playlist_selection" | "youtube_input" | "identity" | "analyzing" | "complete";

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
                    <span key={i} className="mono text-[10px] text-white/50 uppercase tracking-[0.3em] flex items-center gap-4">
                        <span className="text-[#FF0000]">◆</span>{s}
                    </span>
                ))}
            </motion.div>
        </div>
    );
}

// ─── Step progress bar ───────────────────────────────────────────────────
const STEP_LABELS = ["Genres", "Sources", "Analyse"];
function Stepper({ step }: { step: number }) {
    return (
        <div className="flex items-center gap-1 mb-10">
            {STEP_LABELS.map((l, i) => (
                <div key={l} className="flex items-center gap-1">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full mono text-[10px] uppercase tracking-widest font-black transition-all duration-300
                        ${i < step ? "text-[#FF0000]/50" : i === step ? "bg-[#FF0000]/15 text-[#FF0000] border border-[#FF0000]/30" : "text-white/45"}`}>
                        {i < step ? <Check className="h-3 w-3" /> : <span>{i + 1}</span>}{l}
                    </div>
                    {i < STEP_LABELS.length - 1 && <div className="w-5 h-px bg-white/10" />}
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
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 group-hover/f:text-white transition-colors">{label}</span>
                <span className="mono text-sm text-[#FF0000] font-black">{value.toFixed(3)}</span>
            </div>
            <div className="h-3.5 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/15 group-hover/f:border-[#FF0000]/25 transition-all">
                <motion.div initial={{ width: 0 }} animate={{ width: `${value * 100}%` }} transition={{ duration: 1.1, ease: "easeOut" }}
                    className={`h-full rounded-full ${red ? "bg-[#FF0000] shadow-[0_0_16px_rgba(255,0,0,0.6)]" : "bg-white/50"}`} />
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════
export default function Home() {
    const [stage, setStage] = useState<Stage>("intro");
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
    const [progress, setProgress] = useState(0);


    const [dna, setDna] = useState<any>(null);

    // ── Init ──────────────────────────────────────────────────────────────
    useEffect(() => {
        (async () => {
            try {
                const r = await fetch("/api/dna/profile/me");
                const d = await r.json();
                if (d.found) {
                    setExisting(d.dna);
                    if (d.dna.top_genres) setGenres(d.dna.top_genres);
                    const ids: string[] = d.dna.scanned_playlist_ids || [];
                    if (d.dna.scanned_playlist_id && !ids.includes(d.dna.scanned_playlist_id)) ids.push(d.dna.scanned_playlist_id);
                    setScannedIds(ids);
                }
            } catch { } finally { setChecking(false); }
        })();
        const saved = document.cookie.split("; ").find(r => r.startsWith("last_spotify_url="))?.split("=")[1];
        if (saved) setSpotifyUrl(decodeURIComponent(saved));
    }, []);

    // Auto-scan when entering spotify_input with a saved URL
    useEffect(() => {
        if (autoScanned || stage !== "spotify_input" || !spotifyUrl.trim()) return;
        setAutoScanned(true); scanSpotify(0);
    }, [stage, spotifyUrl]);



    // ── Spotify ───────────────────────────────────────────────────────────
    const extractId = (raw: string) => {
        let s = raw.trim();
        if (s.includes("spotify.com/user/")) s = s.split("spotify.com/user/")[1].split("?")[0].split("/")[0];
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
            setStage("playlist_selection");
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

    // YouTube search
    const searchYt = useCallback(async (query: string) => {
        if (!query.trim()) { setYtResults([]); return; }
        setYtSearching(true);
        try {
            const r = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`);
            const d = await r.json();
            setYtResults(Array.isArray(d) ? d : []);
        } catch { setYtResults([]); }
        finally { setYtSearching(false); }
    }, []);

    const addYtSearchResult = useCallback((video: any) => {
        // Find first empty slot
        setYtTracks(prev => {
            const idx = prev.findIndex(t => !t.url || t.status === "idle");
            if (idx === -1) return prev; // all slots full
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

    // ── Run analysis ──────────────────────────────────────────────────────
    const runAnalysis = async () => {
        setStage("analyzing"); setProgress(0);

        let audioFeatures: any[] = [];
        let spotifyTracks: any[] = [];
        let youtubeVideos: any[] = [];
        const sid = extractId(spotifyUrl);

        // Step 1: Scan Spotify playlists (multi-playlist mode)
        if (selPlaylists.length > 0) {
            setProgress(10);
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
            } catch { }
        }
        setProgress(35);

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
        setProgress(55);

        // Step 3: Generate DNA via the engine
        try {
            const r = await fetch("/api/dna/generate", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    genres,
                    displayName,
                    email,


                    audioFeatures,
                    youtubeVideos,
                    spotifyTracks,
                    youtubeTracks: ytOkTracks.map(t => ({ id: t.id, title: t.title, artist: t.channel, thumbnail: t.thumbnail, url: t.url })),
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
                {/* HOMEPAGE                                                */}
                {/* ═══════════════════════════════════════════════════════ */}
                {stage === "intro" && (
                    <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">


                        {/* Hero */}
                        <section className="relative min-h-screen flex items-center pt-16">
                            <div className="absolute right-0 top-0 bottom-0 w-full md:w-[55%] opacity-60 pointer-events-none"><DNAHelix /></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full blur-[160px] bg-[#FF0000]/8 pointer-events-none" />
                            <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 w-full py-24">
                                <div className="max-w-[640px]">
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 }} className="flex items-center gap-3 mb-8">
                                        <div className="h-px w-8 bg-[#FF0000]" /><span className="mono text-[10px] text-[#FF0000] uppercase tracking-[0.4em]">Sonic Structural Mapping Protocol</span>
                                    </motion.div>
                                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2 }} className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.92] tracking-tight mb-6 text-white">
                                        Your music<br />has a<br /><span className="text-[#FF0000] italic">fingerprint.</span>
                                    </motion.h1>
                                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .3 }} className="text-white/50 text-base md:text-lg leading-relaxed mb-10 max-w-[480px] font-medium">
                                        We analyse your Spotify playlists and YouTube songs to build a <span className="text-white">12-dimensional Musical DNA vector</span> — then match you with listeners who hear the world the same way.
                                    </motion.p>
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .4 }} className="flex flex-col sm:flex-row gap-4">
                                        <button onClick={() => setStage("genre_selection")} className="relative flex items-center justify-center gap-3 bg-[#FF0000] text-white font-black text-sm uppercase tracking-widest px-8 py-4 rounded-2xl hover:bg-red-500 transition-all hover:scale-[1.03] active:scale-95 shadow-[0_0_40px_rgba(255,0,0,0.35)] overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full shimmer pointer-events-none" />
                                            <Play className="h-4 w-4 fill-white" />Start DNA Discovery
                                        </button>
                                        {existing && !checking && (
                                            <button onClick={() => { setDna(existing); setStage("complete"); }} className="flex items-center justify-center gap-3 border border-white/10 bg-white/4 text-white/60 hover:text-white hover:border-white/25 font-black text-xs uppercase tracking-widest px-8 py-4 rounded-2xl transition-all">
                                                <CheckCircle2 className="h-4 w-4 text-[#FF0000]" />Resume Previous Signal
                                            </button>
                                        )}
                                    </motion.div>
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .7 }} className="flex items-center gap-8 mt-14 pt-8 border-t border-white/10">
                                        {[["12", "DNA Dimensions"], ["55", "Max Tracks"], ["∞", "Possible Soulmates"]].map(([v, l], i) => (
                                            <div key={l} className={i > 0 ? "flex items-center gap-8" : ""}>
                                                {i > 0 && <div className="w-px h-8 bg-white/10" />}
                                                <div><div className={`mono text-2xl font-black ${i === 2 ? "text-[#FF0000]" : "text-white"}`}>{v === "∞" ? "∞" : <Ctr to={parseInt(v)} />}</div><div className="mono text-[9px] text-white/55 uppercase tracking-widest">{l}</div></div>
                                            </div>
                                        ))}
                                    </motion.div>
                                </div>
                            </div>
                        </section>
                        <Ticker />
                        <footer className="border-t border-white/10 px-6 py-8">
                            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                                <span className="mono text-[10px] text-white/50 tracking-widest">© 2026 Arman Ayva. <a href="https://www.armanayva.com" target="_blank" className="hover:text-white transition-colors">www.armanayva.com</a></span>
                                <div className="flex gap-6">
                                    <Link href="/about" className="mono text-[10px] text-white/45 hover:text-white/70 uppercase tracking-widest transition-colors">About</Link>
                                    <Link href="/profile" className="mono text-[10px] text-white/55 hover:text-white/60 uppercase tracking-widest transition-colors flex items-center gap-1.5"><User className="h-3 w-3" />Profile</Link>
                                    <Link href="/match" className="mono text-[10px] text-white/55 hover:text-white/60 uppercase tracking-widest transition-colors flex items-center gap-1.5"><Users className="h-3 w-3" />Find Soulmates</Link>
                                    <Link href="/privacy" className="mono text-[10px] text-white/45 hover:text-white/70 uppercase tracking-widest transition-colors">Privacy</Link>
                                </div>
                            </div>
                        </footer>
                        <div className="fixed inset-0 -z-10 pointer-events-none">
                            <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] blur-[180px] rounded-full bg-[#FF0000]/6" />
                            <div className="absolute bottom-1/3 right-1/4 h-[400px] w-[400px] blur-[160px] rounded-full bg-orange-900/8" />
                        </div>
                    </motion.div>
                )}

                {/* ═══════════════════════════════════════════════════════ */}
                {/* INNER STAGES                                            */}
                {/* ═══════════════════════════════════════════════════════ */}
                {stage !== "intro" && (
                    <motion.div key="inner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full min-h-screen">


                        <div className="max-w-5xl mx-auto px-4 md:px-8 pt-24 pb-40 w-full">
                            <AnimatePresence mode="wait">

                                {/* ── GENRE SELECTION ── */}
                                {stage === "genre_selection" && (
                                    <motion.div key="gs" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                        <Stepper step={0} />
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
                                                                    className={`rounded-full border font-black uppercase text-[10px] py-2.5 px-5 tracking-widest transition-all duration-150 ${on ? "bg-[#FF0000] text-white border-[#FF0000] shadow-[0_0_18px_rgba(255,0,0,0.35)]" : "bg-white/5 border-white/10 text-white/50 hover:border-[#FF0000]/40 hover:text-white/80"}`}>
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
                                                        <button onClick={() => setStage("spotify_input")} disabled={genres.length === 0}
                                                            className="w-full flex items-center justify-center gap-3 bg-[#FF0000] text-white py-5 rounded-xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(255,0,0,0.2)] disabled:opacity-40 disabled:scale-100 overflow-hidden relative">
                                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full shimmer pointer-events-none" />
                                                            Confirm & Continue <ArrowRight className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={() => setStage("intro")} className="w-full mono text-[10px] text-white/55 hover:text-white transition-all text-center py-2 uppercase tracking-widest">← Home</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* ── SPOTIFY INPUT ── */}
                                {stage === "spotify_input" && (
                                    <motion.div key="si" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto">
                                        <Stepper step={1} />
                                        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-1">
                                            Connect <span className="text-[#1DB954]">Spotify</span>
                                        </h2>
                                        <p className="mono text-[10px] text-white/55 uppercase tracking-[0.4em] mb-10">Paste your public Spotify profile URL to scan your playlists</p>

                                        {/* URL input */}
                                        <div className="glass rounded-[2rem] border border-white/14 p-7 mb-5">
                                            <div className="flex flex-col sm:flex-row gap-2 p-2 bg-white/5 border border-white/12 rounded-2xl focus-within:border-[#1DB954]/40 transition-all mb-3">
                                                <input type="text" value={spotifyUrl}
                                                    onChange={e => { setSpotifyUrl(e.target.value); setScanErr(null); }}
                                                    onKeyDown={e => e.key === "Enter" && scanSpotify(0)}
                                                    placeholder="https://open.spotify.com/user/…"
                                                    className="flex-1 bg-transparent py-3.5 px-5 focus:outline-none mono text-sm text-white placeholder:text-white/35" />
                                                <button onClick={() => scanSpotify(0)} disabled={scanning || !spotifyUrl.trim()}
                                                    className="bg-[#1DB954] text-white font-black px-8 py-3.5 rounded-xl hover:bg-[#1ed760] transition-all text-xs uppercase tracking-widest flex items-center gap-2 disabled:opacity-40">
                                                    {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scan className="h-4 w-4" />}
                                                    {scanning ? "Scanning…" : "Scan"}
                                                </button>
                                            </div>
                                            <AnimatePresence>
                                                {scanErr && (
                                                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                                        className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                                                        <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                                                        <p className="mono text-[11px] text-red-400 uppercase tracking-wide">{scanErr}</p>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* How-to */}
                                        <div className="glass rounded-[2rem] border border-white/14 p-7 mb-7">
                                            <div className="flex items-center justify-between mb-5">
                                                <span className="flex items-center gap-2 mono text-[10px] text-[#1DB954] uppercase tracking-widest"><HelpCircle className="h-3.5 w-3.5" />How to get your URL</span>
                                                <a href="https://open.spotify.com" target="_blank" rel="noopener noreferrer" className="mono text-[9px] text-white/55 hover:text-white transition-all uppercase tracking-widest flex items-center gap-1.5 bg-white/5 px-4 py-2 rounded-full border border-white/14">
                                                    Open Spotify <ExternalLink className="h-3 w-3" />
                                                </a>
                                            </div>
                                            <div className="space-y-4 border-t border-white/10 pt-5">
                                                {[["1", "Click your", "Profile Name", "in Spotify"], ["2", "Click", "⋯ (more options)", "or right-click your name"], ["3", "Choose", "Copy link to profile", "under Share"]].map(([n, a, b, c]) => (
                                                    <div key={n} className="flex items-start gap-4">
                                                        <span className="h-6 w-6 rounded-full bg-[#1DB954]/12 border border-[#1DB954]/25 flex items-center justify-center mono text-[10px] text-[#1DB954] font-black shrink-0">{n}</span>
                                                        <p className="text-sm text-white/45 font-medium leading-snug">{a} <span className="text-white font-black">{b}</span> {c}</p>
                                                    </div>
                                                ))}
                                                <p className="mono text-[9px] text-[#1DB954]/50 italic pl-10">* Make sure your playlists are set to public</p>
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <div className="flex items-center gap-4 my-6">
                                            <div className="flex-1 h-px bg-white/8" /><span className="mono text-[10px] text-white/50 uppercase tracking-[0.3em]">or</span><div className="flex-1 h-px bg-white/8" />
                                        </div>

                                        {/* Skip to YouTube */}
                                        <button onClick={() => { setYtMode("only"); setStage("youtube_input"); }}
                                            className="w-full flex items-center justify-between p-5 rounded-2xl border border-white/14 bg-white/3 hover:bg-[#FF0000]/5 hover:border-[#FF0000]/25 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center group-hover:bg-[#FF0000]/12 group-hover:border-[#FF0000]/25 transition-all">
                                                    <Youtube className="h-5 w-5 text-white/65 group-hover:text-[#FF0000] transition-colors" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-black text-white/60 text-sm uppercase tracking-tight group-hover:text-white transition-colors">I don't have Spotify</p>
                                                    <p className="mono text-[9px] text-white/50 uppercase tracking-widest mt-0.5">Use YouTube links instead</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-white/45 group-hover:text-white/50 group-hover:translate-x-1 transition-all" />
                                        </button>

                                        <button onClick={() => setStage("genre_selection")} className="w-full mono text-[10px] text-white/50 hover:text-white transition-all text-center py-3 uppercase tracking-widest mt-6">← Back to genres</button>
                                    </motion.div>
                                )}

                                {/* ── PLAYLIST SELECTION ── */}
                                {stage === "playlist_selection" && (
                                    <motion.div key="ps" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                        <Stepper step={1} />
                                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                                            <div>
                                                <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-1">
                                                    Select <span className="text-[#1DB954]">Playlists</span>
                                                </h2>
                                                <p className="mono text-[10px] text-white/55 uppercase tracking-[0.4em]">Up to 5 playlists · 10 tracks each</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <motion.span key={selPlaylists.length}
                                                    initial={{ scale: .9 }} animate={{ scale: 1 }}
                                                    className={`mono text-[10px] px-4 py-2 rounded-full border font-black uppercase tracking-widest transition-all ${selPlaylists.length > 0 ? "border-[#1DB954]/40 text-[#1DB954] bg-[#1DB954]/8" : "border-white/10 text-white/55"}`}>
                                                    {selPlaylists.length}/5 selected
                                                </motion.span>
                                                <button onClick={() => scanSpotify(0)} className="mono text-[9px] text-white/55 hover:text-white transition-all flex items-center gap-1.5 px-3 py-2 rounded-full border border-white/14 hover:border-white/18">
                                                    <Scan className="h-3 w-3" />Re-scan
                                                </button>
                                            </div>
                                        </div>

                                        {/* Playlist grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                            {playlists.filter(pl => !scannedIds.includes(pl.id)).map((pl, i) => {
                                                const sel = !!selPlaylists.find(p => p.id === pl.id);
                                                const maxed = !sel && selPlaylists.length >= 5;
                                                return (
                                                    <motion.button key={pl.id + i}
                                                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i % 6) * .04 }}
                                                        onClick={() => !maxed && togglePlaylist(pl)}
                                                        className={`relative text-left rounded-[1.75rem] border p-5 transition-all overflow-hidden group
                                                            ${sel ? "border-[#1DB954]/50 bg-[#1DB954]/7 shadow-[0_0_24px_rgba(29,185,84,0.1)]"
                                                                : maxed ? "border-white/10 bg-white/2 opacity-35 cursor-not-allowed"
                                                                    : "border-white/14 bg-white/3 hover:border-[#1DB954]/25 hover:bg-[#1DB954]/4 cursor-pointer"}`}
                                                    >
                                                        {/* Check circle */}
                                                        <div className={`absolute top-4 right-4 h-6 w-6 rounded-full border flex items-center justify-center transition-all
                                                            ${sel ? "border-[#1DB954] bg-[#1DB954]" : "border-white/15 group-hover:border-[#1DB954]/35"}`}>
                                                            {sel && <Check className="h-3.5 w-3.5 text-white" />}
                                                        </div>

                                                        {/* Cover art */}
                                                        <div className={`h-[72px] w-[72px] rounded-2xl overflow-hidden bg-white/8 mb-4 ring-1 transition-all ${sel ? "ring-[#1DB954]/35" : "ring-white/8 group-hover:ring-[#1DB954]/15"}`}>
                                                            {pl.image
                                                                ? <img src={pl.image} alt={pl.name} className={`h-full w-full object-cover transition-all ${sel ? "opacity-100 grayscale-0" : "grayscale opacity-45 group-hover:opacity-70 group-hover:grayscale-0"}`} />
                                                                : <div className="h-full w-full flex items-center justify-center"><Music2 className="h-7 w-7 opacity-30" /></div>}
                                                        </div>

                                                        <h3 className={`font-black text-sm capitalize leading-tight mb-1 pr-8 transition-colors ${sel ? "text-white" : "text-white/60 group-hover:text-white/90"}`}>
                                                            {pl.name.toLowerCase()}
                                                        </h3>
                                                        <div className="flex items-center justify-between">
                                                            <p className="mono text-[9px] text-white/55 uppercase tracking-widest">{pl.track_count} tracks</p>
                                                            {pl.url && <a href={pl.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-white/70 hover:text-white transition-colors"><ExternalLink className="h-3 w-3" /></a>}
                                                        </div>
                                                    </motion.button>
                                                );
                                            })}
                                        </div>

                                        {/* Load more */}
                                        {playlists.length < plTotal && (
                                            <div className="flex justify-center mb-8">
                                                <button onClick={() => scanSpotify(plOffset + 6)} disabled={loadingMore}
                                                    className="flex items-center gap-2 bg-white/5 border border-white/10 px-8 py-3 rounded-full hover:bg-white/8 transition-all mono text-[10px] text-white/70 hover:text-white uppercase tracking-widest disabled:opacity-40">
                                                    {loadingMore ? <Loader2 className="h-3.5 w-3.5 animate-spin text-[#1DB954]" /> : <Plus className="h-3.5 w-3.5 text-[#1DB954]" />}
                                                    Load more
                                                </button>
                                            </div>
                                        )}

                                        {/* ── Sticky bottom action bar ── */}
                                        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#080808]/96 backdrop-blur-xl border-t border-white/14">
                                            <div className="max-w-5xl mx-auto px-4 py-4">
                                                {/* Selected playlist pills */}
                                                {selPlaylists.length > 0 && (
                                                    <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 sb">
                                                        <span className="mono text-[9px] text-white/50 uppercase tracking-widest shrink-0">Selected:</span>
                                                        {selPlaylists.map(pl => (
                                                            <div key={pl.id} className="flex items-center gap-1.5 bg-[#1DB954]/12 border border-[#1DB954]/25 px-3 py-1.5 rounded-full shrink-0">
                                                                {pl.image && <img src={pl.image} alt="" className="h-4 w-4 rounded object-cover" />}
                                                                <span className="font-black text-[10px] text-[#1DB954] uppercase truncate max-w-[90px]">{pl.name}</span>
                                                                <button onClick={() => togglePlaylist(pl)} className="text-[#1DB954]/50 hover:text-[#1DB954] transition-colors"><X className="h-3 w-3" /></button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Buttons */}
                                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                                                    {/* No Spotify fallback */}
                                                    <button onClick={() => { setYtMode("only"); setStage("youtube_input"); }}
                                                        className="sm:mr-auto flex items-center justify-center gap-2 border border-white/10 bg-white/3 text-white/65 hover:text-white/70 hover:border-white/20 font-black text-[10px] uppercase tracking-widest px-5 py-3 rounded-xl transition-all">
                                                        <Youtube className="h-3.5 w-3.5" />YouTube only
                                                    </button>

                                                    {/* Add YouTube */}
                                                    <button onClick={() => { if (selPlaylists.length > 0) { setYtMode("addon"); setStage("youtube_input"); } }}
                                                        disabled={selPlaylists.length === 0}
                                                        className="flex items-center justify-center gap-2 border border-white/15 bg-white/5 text-white/60 hover:text-white hover:border-white/28 font-black text-[11px] uppercase tracking-wider px-5 py-3.5 rounded-xl transition-all disabled:opacity-25 disabled:cursor-not-allowed">
                                                        <Youtube className="h-3.5 w-3.5" />+ Add YouTube
                                                    </button>

                                                    {/* Extract DNA */}
                                                    <button onClick={runAnalysis} disabled={selPlaylists.length === 0}
                                                        className="relative flex items-center justify-center gap-2 bg-[#FF0000] text-white font-black text-[11px] uppercase tracking-wider px-7 py-3.5 rounded-xl hover:bg-red-500 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_28px_rgba(255,0,0,0.28)] disabled:opacity-25 disabled:scale-100 disabled:cursor-not-allowed overflow-hidden">
                                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/18 to-transparent -translate-x-full shimmer pointer-events-none" />
                                                        Extract DNA<ArrowRight className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <button onClick={() => setStage("spotify_input")} className="mono text-[10px] text-white/45 hover:text-white transition-all uppercase tracking-widest py-2">← Back to URL input</button>
                                    </motion.div>
                                )}

                                {/* ── YOUTUBE INPUT ── */}
                                {stage === "youtube_input" && (
                                    <motion.div key="yi" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto">
                                        <Stepper step={1} />

                                        {/* Context banner for addon mode */}
                                        <AnimatePresence>
                                            {ytMode === "addon" && selPlaylists.length > 0 && (
                                                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                                    className="flex items-center gap-4 bg-[#1DB954]/7 border border-[#1DB954]/22 rounded-2xl px-5 py-4 mb-8">
                                                    <CheckCircle2 className="h-5 w-5 text-[#1DB954] shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-black text-[#1DB954] text-sm uppercase tracking-tight">
                                                            {selPlaylists.length} Spotify playlist{selPlaylists.length !== 1 ? "s" : ""} ready
                                                        </p>
                                                        <p className="mono text-[9px] text-white/55 uppercase tracking-widest mt-0.5 truncate">
                                                            {selPlaylists.map(p => p.name).join(" · ")}
                                                        </p>
                                                    </div>
                                                    <button onClick={() => setStage("playlist_selection")}
                                                        className="mono text-[9px] text-white/55 hover:text-white transition-all uppercase tracking-widest border border-white/10 px-3 py-1.5 rounded-full hover:border-white/25 shrink-0">
                                                        Change
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Heading */}
                                        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-1">
                                            {ytMode === "only" ? <>YouTube <span className="text-[#FF0000]">Songs</span></> : <>Add <span className="text-[#FF0000]">YouTube</span></>}
                                        </h2>
                                        <p className="mono text-[10px] text-white/55 uppercase tracking-[0.4em] mb-8">
                                            {ytMode === "only"
                                                ? "Search or paste up to 5 YouTube links · these form your full DNA signal"
                                                : "Search or paste up to 5 YouTube links to supplement your Spotify data"}
                                        </p>

                                        {/* ── YouTube Search Bar ── */}
                                        <div ref={ytSearchRef} className="relative mb-6">
                                            <div className="glass rounded-2xl border border-white/10 focus-within:border-[#FF0000]/40 transition-all">
                                                <div className="flex items-center gap-3 px-4 py-1">
                                                    <Search className="h-4 w-4 text-white/55 shrink-0" />
                                                    <input type="text" value={ytQuery}
                                                        onChange={e => { setYtQuery(e.target.value); setYtShowSearch(true); }}
                                                        onKeyDown={e => { if (e.key === "Enter") searchYt(ytQuery); }}
                                                        onFocus={() => setYtShowSearch(true)}
                                                        placeholder="Search YouTube for a song…"
                                                        className="flex-1 bg-transparent mono text-sm text-white placeholder:text-white/35 focus:outline-none py-3" />
                                                    <button onClick={() => searchYt(ytQuery)} disabled={ytSearching || !ytQuery.trim()}
                                                        className="bg-[#FF0000] text-white font-black px-5 py-2 rounded-xl hover:bg-red-500 transition-all text-[10px] uppercase tracking-widest flex items-center gap-1.5 disabled:opacity-30">
                                                        {ytSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                                                        Search
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Search Results Dropdown */}
                                            <AnimatePresence>
                                                {ytShowSearch && ytResults.length > 0 && (
                                                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                                                        className="absolute top-full left-0 right-0 z-50 mt-2 glass rounded-2xl border border-white/12 shadow-2xl shadow-black/50 overflow-hidden max-h-[360px] overflow-y-auto sb">
                                                        {ytResults.map((v: any) => {
                                                            const alreadyAdded = ytTracks.some(t => t.url.includes(v.id) && t.status === "ok");
                                                            return (
                                                                <button key={v.id} onClick={() => !alreadyAdded && addYtSearchResult(v)} disabled={alreadyAdded}
                                                                    className={`w-full flex items-center gap-3 p-3 border-b border-white/10 last:border-0 transition-all text-left
                                                                        ${alreadyAdded ? "opacity-30 cursor-not-allowed" : "hover:bg-white/6 cursor-pointer"}`}>
                                                                    <div className="h-12 w-18 rounded-lg overflow-hidden shrink-0 bg-white/5">
                                                                        {v.thumbnail && <img src={v.thumbnail} alt="" className="h-full w-full object-cover" />}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-xs font-black text-white truncate" dangerouslySetInnerHTML={{ __html: v.title || "" }} />
                                                                        <p className="mono text-[9px] text-white/60 uppercase truncate mt-0.5">{v.channelTitle}</p>
                                                                    </div>
                                                                    {alreadyAdded
                                                                        ? <CheckCircle2 className="h-4 w-4 text-[#FF0000] shrink-0" />
                                                                        : <Plus className="h-4 w-4 text-white/55 group-hover:text-[#FF0000] shrink-0" />}
                                                                </button>
                                                            );
                                                        })}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* ── Divider ── */}
                                        <div className="flex items-center gap-3 mb-5">
                                            <div className="h-px flex-1 bg-white/8" />
                                            <span className="mono text-[9px] text-white/45 uppercase tracking-widest">or paste links directly</span>
                                            <div className="h-px flex-1 bg-white/8" />
                                        </div>

                                        {/* Input rows */}
                                        <div className="space-y-2.5 mb-7">
                                            {ytTracks.map((tr, idx) => (
                                                <div key={tr.id} className={`glass rounded-2xl border overflow-hidden transition-all
                                                    ${tr.status === "ok" ? "border-[#FF0000]/25" : tr.status === "error" ? "border-red-500/20" : "border-white/14 hover:border-white/14"}`}>
                                                    <div className="flex items-center gap-3 p-3 pl-4">
                                                        {/* Icon */}
                                                        <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 transition-all
                                                            ${tr.status === "ok" ? "bg-[#FF0000]/15 border border-[#FF0000]/25"
                                                                : tr.status === "error" ? "bg-red-500/10 border border-red-500/18"
                                                                    : tr.status === "loading" ? "bg-white/8 border border-white/10"
                                                                        : "bg-white/5 border border-white/14"}`}>
                                                            {tr.status === "loading" ? <Loader2 className="h-3.5 w-3.5 text-white/60 animate-spin" />
                                                                : tr.status === "ok" ? <Youtube className="h-3.5 w-3.5 text-[#FF0000]" />
                                                                    : tr.status === "error" ? <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                                                                        : <span className="mono text-[9px] text-white/50 font-black">{idx + 1}</span>}
                                                        </div>
                                                        <input type="text" value={tr.url}
                                                            onChange={e => setYtTracks(t => t.map((x, i) => i === idx ? { ...x, url: e.target.value, status: "idle", title: undefined, channel: undefined } : x))}
                                                            onBlur={e => resolveYt(idx, e.target.value)}
                                                            onKeyDown={e => e.key === "Enter" && resolveYt(idx, tr.url)}
                                                            placeholder={`YouTube link ${idx + 1}…`}
                                                            className="flex-1 bg-transparent mono text-xs text-white placeholder:text-white/70 focus:outline-none py-2" />
                                                        {tr.url && (
                                                            <button onClick={() => resolveYt(idx, "")} className="text-white/45 hover:text-white/50 transition-colors p-1.5 shrink-0">
                                                                <X className="h-3.5 w-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    {/* Preview */}
                                                    <AnimatePresence>
                                                        {tr.status === "ok" && tr.title && (
                                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                                                className="flex items-center gap-3 px-4 pb-3 border-t border-white/10">
                                                                {tr.thumbnail && <img src={tr.thumbnail} alt="" className="h-10 w-16 rounded-lg object-cover opacity-65 shrink-0" />}
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="text-xs font-black text-white truncate" dangerouslySetInnerHTML={{ __html: tr.title || "" }} />
                                                                    <p className="mono text-[9px] text-white/55 uppercase truncate">{tr.channel}</p>
                                                                </div>
                                                                <CheckCircle2 className="h-4 w-4 text-[#FF0000] shrink-0" />
                                                            </motion.div>
                                                        )}
                                                        {tr.status === "error" && (
                                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                                                className="px-4 pb-3 border-t border-red-500/10">
                                                                <p className="mono text-[9px] text-red-400/70 uppercase">{tr.error || "Couldn't load video"}</p>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Valid count indicator */}
                                        <AnimatePresence>
                                            {hasYt && (
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 mb-6">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-[#FF0000] shadow-[0_0_8px_rgba(255,0,0,0.8)]" />
                                                    <span className="mono text-[10px] text-white/65 uppercase tracking-widest">{ytOk.length} valid track{ytOk.length !== 1 ? "s" : ""} loaded</span>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* CTAs */}
                                        <div className="space-y-3">
                                            {/* Main extract */}
                                            <button onClick={() => setStage("identity")}
                                                disabled={ytMode === "only" ? !hasYt : (selPlaylists.length === 0 && !hasYt)}
                                                className="w-full relative flex items-center justify-center gap-3 bg-[#FF0000] text-white font-black text-sm uppercase tracking-widest py-5 rounded-2xl hover:bg-red-500 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_36px_rgba(255,0,0,0.28)] disabled:opacity-40 disabled:scale-100 overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/18 to-transparent -translate-x-full shimmer pointer-events-none" />
                                                <ChevronRight className="h-5 w-5 fill-white" />
                                                {ytMode === "addon"
                                                    ? `Next: Profile Name`
                                                    : `Next: Profile Name`}
                                            </button>


                                            {/* Addon: skip YouTube */}
                                            {ytMode === "addon" && (
                                                <button onClick={() => setStage("identity")} disabled={selPlaylists.length === 0}
                                                    className="w-full flex items-center justify-center gap-2 border border-white/10 bg-white/3 text-white/70 hover:text-white hover:border-white/20 font-black text-xs uppercase tracking-widest py-4 rounded-2xl transition-all disabled:opacity-30">
                                                    Skip YouTube & Continue <ArrowRight className="h-3.5 w-3.5" />
                                                </button>
                                            )}


                                            <button onClick={() => setStage(ytMode === "addon" ? "playlist_selection" : "spotify_input")}
                                                className="w-full mono text-[10px] text-white/45 hover:text-white transition-all text-center py-2.5 uppercase tracking-widest">
                                                ← Back
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* ── IDENTITY ── */}
                                {stage === "identity" && (
                                    <motion.div key="id" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-xl mx-auto text-center">
                                        <div className="h-16 w-16 bg-[#FF0000] rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-[0_10px_30px_rgba(255,0,0,0.3)]">
                                            <User className="h-8 w-8 text-white" />
                                        </div>
                                        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">Signal Profile</h2>
                                        <p className="mono text-[10px] text-white/55 uppercase tracking-[0.4em] mb-10">How should your sonic fingerprint be identified?</p>

                                        <div className="glass p-8 rounded-[2.5rem] border border-white/14 mb-8">
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="mono text-[9px] text-[#FF0000] uppercase tracking-widest font-black block mb-3 text-left ml-4">Profile Name</label>
                                                    <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                                                        placeholder="e.g. Sonic Voyager"
                                                        className="w-full bg-white/5 border border-white/12 rounded-2xl py-4 px-6 focus:outline-none focus:border-[#FF0000]/40 transition-all text-lg font-black italic tracking-tight text-white placeholder:text-white/20" />
                                                </div>
                                                <div>
                                                    <label className="mono text-[9px] text-[#FF0000] uppercase tracking-widest font-black block mb-3 text-left ml-4">Email Address (Optional)</label>
                                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                                        onKeyDown={e => e.key === "Enter" && displayName.trim() && runAnalysis()}
                                                        placeholder="your@email.com"
                                                        className="w-full bg-white/5 border border-white/12 rounded-2xl py-4 px-6 focus:outline-none focus:border-[#FF0000]/40 transition-all text-lg font-black italic tracking-tight text-white placeholder:text-white/20" />
                                                </div>
                                                <p className="mono text-[9px] text-white/45 uppercase leading-relaxed px-4 text-left">
                                                    Your email helps us reconnect you with matches and save your progress.
                                                </p>
                                            </div>
                                        </div>


                                        <div className="space-y-4">
                                            <button onClick={runAnalysis} disabled={!displayName.trim()}
                                                className="w-full relative flex items-center justify-center gap-3 bg-[#FF0000] text-white font-black text-sm uppercase tracking-widest py-5 rounded-2xl hover:bg-red-500 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_40px_rgba(255,0,0,0.3)] overflow-hidden disabled:opacity-40">
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full shimmer pointer-events-none" />
                                                Launch DNA Extraction <ArrowRight className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => setStage("youtube_input")} className="w-full mono text-[10px] text-white/45 hover:text-white transition-all text-center py-2 uppercase tracking-widest">← Back</button>
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
                                            {selPlaylists.length > 0 && `${selPlaylists.length} playlist${selPlaylists.length !== 1 ? "s" : ""}`}
                                            {selPlaylists.length > 0 && ytOk.length > 0 && " + "}
                                            {ytOk.length > 0 && `${ytOk.length} YouTube track${ytOk.length !== 1 ? "s" : ""}`}
                                            {" "}across 12 sonic dimensions
                                        </p>
                                        <div className="space-y-3 text-left max-w-[260px] mx-auto">
                                            {[
                                                { l: "Genre vector computed", d: progress > 10 },
                                                { l: "Spotify features extracted", d: progress > 40, skip: selPlaylists.length === 0 },
                                                { l: "YouTube signals processed", d: progress > 65, skip: ytOk.length === 0 },
                                                { l: "Combining signals", d: progress > 80 },
                                                { l: "Generating narrative", d: progress >= 100 },
                                            ].map(({ l, d, skip }) => skip ? null : (
                                                <div key={l} className={`flex items-center gap-3 transition-all duration-500 ${d ? "opacity-100" : "opacity-40"}`}>
                                                    <div className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${d ? "border-[#FF0000] bg-[#FF0000]/15" : "border-white/15"}`}>
                                                        {d && <Check className="h-2.5 w-2.5 text-[#FF0000]" />}
                                                    </div>
                                                    <span className="mono text-[9px] text-white/50 uppercase tracking-widest">{l}</span>
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

                                            {/* Stats + CTA */}
                                            <div className="space-y-4">
                                                <div className="glass rounded-[2.5rem] p-8 border border-[#FF0000]/20 bg-[#FF0000]/4">
                                                    <div className="flex items-center justify-between mb-5">
                                                        <span className="mono text-[10px] text-[#FF0000] uppercase tracking-widest font-black flex items-center gap-2"><Brain className="h-4 w-4" />Neural Match</span>
                                                        <span className="mono text-[9px] text-white/50">12,492 nodes</span>
                                                    </div>
                                                    <div className="flex items-end justify-between border-b border-white/14 pb-5 mb-5">
                                                        <h4 className="text-xl font-black text-white italic truncate pr-4">{dna.display_name}</h4>
                                                        <div className="text-right shrink-0">
                                                            <p className="mono text-3xl font-black text-[#FF0000]">{((dna.coherence_index ?? 0.8) * 100).toFixed(1)}%</p>
                                                            <p className="mono text-[9px] text-white/60 uppercase tracking-widest">Coherence</p>
                                                        </div>
                                                    </div>

                                                    {/* Evolution Feedback */}
                                                    <div className="space-y-6 mb-7">
                                                        <div>
                                                            <p className="mono text-[9px] text-white/40 uppercase tracking-[0.2em] mb-3">Seed Identity — Your Selection</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {(dna.top_genres || []).map((g: string, i: number) => (
                                                                    <span key={g + i} className="bg-white/5 border border-white/10 text-white/60 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{g}</span>
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
                                                <Link href={{ pathname: "/match", query: { genres: genres.join(",") } }}
                                                    className="relative flex items-center justify-between bg-[#FF0000] p-6 rounded-[2rem] font-black text-white uppercase tracking-[0.2em] text-lg hover:scale-[1.01] active:scale-95 transition-all shadow-[0_14px_50px_rgba(255,0,0,0.4)] overflow-hidden group">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full shimmer pointer-events-none" />
                                                    <span className="flex items-center gap-3 relative z-10"><Users className="h-6 w-6 fill-white" />Find Soulmates</span>
                                                    <ChevronRight className="h-7 w-7 group-hover:translate-x-2 transition-transform relative z-10" />
                                                </Link>
                                                <Link href="/profile"
                                                    className="flex items-center justify-center gap-3 border border-white/10 bg-white/4 text-white/70 hover:text-white hover:border-white/25 font-black text-[11px] uppercase tracking-widest py-5 rounded-2xl transition-all">
                                                    <User className="h-4 w-4" />View Full Profile
                                                </Link>
                                                <button onClick={() => { setStage("intro"); setSelPlaylists([]); setYtTracks(emptyYt()); }} className="w-full mono text-[10px] text-white/45 hover:text-[#FF0000] transition-all uppercase tracking-widest py-2 text-center">↺ Start new scan</button>

                                            </div>
                                        </div>


                                        {/* Narrative */}
                                        {dna.narrative && (
                                            <div className="glass rounded-[2.5rem] p-8 md:p-10 border border-white/14">
                                                <p className="mono text-[10px] text-[#FF0000] uppercase tracking-[0.4em] mb-5 font-black flex items-center gap-2"><Brain className="h-3.5 w-3.5" />Your Sound Profile</p>
                                                <p className="text-white/70 leading-relaxed text-sm font-medium">{dna.narrative}</p>
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
                                                <p className="mono text-[10px] text-white/55 uppercase tracking-[0.4em] mb-5">Captured Signals — {dna.recent_tracks.length} tracks</p>
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