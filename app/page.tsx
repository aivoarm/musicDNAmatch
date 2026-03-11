"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Waves, ArrowRight, Brain, ChevronRight, Youtube,
    Music2, HelpCircle, Plus, ExternalLink, CheckCircle2,
    Scan, Users, Play, User, Check, X,
    AlertCircle, Loader2, Search, Activity, MessageSquarePlus, Mail, Sparkles, Fingerprint
} from "lucide-react";
import ShareDNACard from "@/components/ShareDNACard";
import OnboardingModal from "@/components/OnboardingModal";
import DNAHelix from "@/components/DNAHelix";
import Ticker from "@/components/Ticker";
import { RadarChart, DualRadarChart } from "@/components/RadarCharts";
import HomeLanding from "@/components/HomeLanding";
import StageGenreSelection from "@/components/StageGenreSelection";
import StageAnalyzing from "@/components/StageAnalyzing";
import StageComplete from "@/components/StageComplete";
import StageEmailCapture from "@/components/StageEmailCapture";
import StageSources from "@/components/StageSources";
import { Ctr, Stepper, DnaBar } from "@/components/HomeUI";
import { decodeHtml } from "@/lib/utils";
import { AXIS_LABELS, generateInterpretation } from "@/lib/dna";



// ─── Types ────────────────────────────────────────────────────────────────
type Stage = "landing" | "sources" | "genre_selection" | "analyzing" | "complete" | "email_capture";

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
    "Hip Hop", "Rap", "R&B", "Jazz", "Classical", "Lo-Fi", "Phonk", "Metal", "Garage",
    "Pop", "Rock", "Funk", "Folk", "Country", "Blues", "Soul", "Punk", "Ska",
    "Reggae", "Disco", "Synthpop", "Grunge", "Alternative", "Experimental", "Techno-Pop",
    "Dubstep", "Trap", "Drill", "Grime", "Afrobeats", "Latin", "K-Pop", "J-Pop",
    "Folk Rock", "Hardcore", "Deep House", "Progressive", "Trance", "Gospel",
    "Film Score", "Reggaeton", "Arabic", "Indian"
];

const TICKER = [
    "12-DIMENSIONAL VECTOR MAPPING", "EUCLIDEAN SOULMATE MATCHING",
    "SPOTIFY NEURAL SYNC", "YOUTUBE FREQUENCY EXTRACTION",
    "COHERENCE INDEX CALCULATION", "50 TRACK DEEP SCAN",
    "SPECTRAL CENTROID ANALYSIS", "REAL-TIME DNA BRIDGING"
];

// ─── DNA Helix ────────────────────────────────────────────────────────────
// (Internal components moved to @/components/*)

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════
export default function Home() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#080808] flex items-center justify-center"><Loader2 className="h-8 w-8 text-[#FF0000] animate-spin" /></div>}>
            <HomeContent />
        </Suspense>
    );
}

const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
}

function HomeContent() {
    const [stage, setStage] = useState<Stage>("landing");
    const [genres, setGenres] = useState<string[]>([]);
    const [matchedGenres, setMatchedGenres] = useState<string[]>([]);
    const [existing, setExisting] = useState<any>(null);
    const [checking, setChecking] = useState(true);

    // Spotify
    const [spotifyUrl, setSpotifyUrl] = useState("");
    const [scanning, setScanning] = useState(false);
    const [scanErr, setScanErr] = useState<string | null>(null);
    const [spotifyHelpOpen, setSpotifyHelpOpen] = useState(false);
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
    const [fetchedSources, setFetchedSources] = useState<{
        spotifyTracks?: any[];
        audioFeatures?: any[];
        artistGenres?: string[];
        youtubeVideos?: any[];
        youtubeTracks?: any[];
    } | null>(null);
    const [clash, setClash] = useState<any>(null);
    const [checkingEmail, setCheckingEmail] = useState(false);
    const [emailVerifySent, setEmailVerifySent] = useState(false);
    const [emailVerifyError, setEmailVerifyError] = useState<string | null>(null);

    const [showOnboarding, setShowOnboarding] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const searchParams = useSearchParams();


    // ── Email Verify (WorkOS Magic Auth) ────────────────────────────────
    const handleEmailVerify = async (forceConfirm = false) => {
        if (!email.trim() || !email.includes("@")) return;
        setCheckingEmail(true);
        setEmailVerifyError(null);

        try {
            if (!forceConfirm) {
                // Check for email clash first
                const checkRes = await fetch("/api/dna/profile/check-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                });
                const checkData = await checkRes.json() as any;

                if (checkData.exists) {
                    setClash(checkData.profile);
                    setCheckingEmail(false);
                    return;
                }
            }

            // Save DNA now WITH the email — verification will confirm it momentarily
            // If user abandons, /api/dna/generate already handles >24h cleanup
            const payload = {
                genres,
                displayName,
                email,  // ← include email now, link-profile will also stamp it after WorkOS confirms
                city,
                audioFeatures: fetchedSources?.audioFeatures || [],
                youtubeVideos: fetchedSources?.youtubeVideos || [],
                artistGenres: fetchedSources?.artistGenres || [],
                spotifyTracks: fetchedSources?.spotifyTracks || [],
                youtubeTracks: fetchedSources?.youtubeTracks || [],
                dry_run: false,
            };

            const genRes = await fetch("/api/dna/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!genRes.ok) {
                const errData = await genRes.json() as any;
                setEmailVerifyError(errData.error || "Failed to generate DNA");
                setCheckingEmail(false);
                return;
            }

            // Redirect to WorkOS
            window.location.href = `/login?email=${encodeURIComponent(email)}`;
        } catch (e: any) {
            setEmailVerifyError(e.message || "Network error");
        } finally {
            setCheckingEmail(false);
        }
    };

    // ── Init ──────────────────────────────────────────────────────────────



    const refreshProfile = useCallback(async () => {
        try {
            const r = await fetch("/api/dna/profile/me");
            const d = await r.json() as any;
            if (d.found && d.dna) {
                setExisting(d.dna);
                if (d.dna.display_name) setDisplayName(d.dna.display_name);
                if (d.dna.email) setEmail(d.dna.email);
                if (d.dna.city) setCity(d.dna.city);
            }
        } catch (e) {
            console.error("Failed to refresh profile", e);
        } finally {
            setChecking(false);
        }
    }, []);

    useEffect(() => {
        refreshProfile();

        // Check WorkOS Auth
        fetch("/api/auth/me").then(r => r.json()).then((d: any) => {
            if (d.user) setIsAuthenticated(true);
        }).catch(() => { });


        const saved = getCookie("last_spotify_url");
        if (saved) setSpotifyUrl(decodeURIComponent(saved));

        const savedName = getCookie("display_name");
        if (savedName) setDisplayName(decodeURIComponent(savedName));

        const savedCity = getCookie("city");
        if (savedCity) setCity(decodeURIComponent(savedCity));
    }, [refreshProfile]);

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

    // ── Onboarding Trigger ──
    useEffect(() => {
        if (stage === "complete" && dna && !isAuthenticated) {
            const timer = setTimeout(() => {
                setShowOnboarding(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [stage, dna, isAuthenticated]);


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
        setSpotifyHelpOpen(false);
        if (!id) { setScanErr("Enter a valid Spotify profile URL."); return; }
        if (offset === 0) { setScanning(true); setPlaylists([]); setScanErr(null); }
        else setLoadingMore(true);
        try {
            const r = await fetch("/api/spotify/scan", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ spotify_user_id: id, offset, limit: 6 })
            });
            const d = await r.json() as any;
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
        window.location.href = "/profile";
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
                const d = await res.json() as any;
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
            const errData = await genRes.json() as any;
            alert(errData.error || "Failed to secure your signal");
            return;
        }

        await fetch('/api/dna/intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ intent: 'find_soulmates' })
        }).catch(console.error);

        // ALWAYS redirect to /login to ensure WorkOS identity linkage
        window.location.href = `/login?email=${encodeURIComponent(email)}`;
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
            const d = await r.json() as any;
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
            const d = await r.json() as any;
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
            const similar = await r.json() as any;

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
        setStage("analyzing"); 
        setProgress(0);
        setGenres([]); 
        setMatchedGenres([]);

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
                const d = await r.json() as any;
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
                const d = await r.json() as any;
                youtubeVideos = d.videos || [];
            } catch { }
        }
        setProgress(90);

        const ytFormattedTracks = ytOkTracks.map(t => ({ id: t.id, title: t.title, artist: t.channel, thumbnail: t.thumbnail, url: t.url }));

        // Merge with existing sources (if any)
        setFetchedSources((prev) => {
            const currentSpotifyTracks = prev?.spotifyTracks || [];
            const currentAudioFeatures = prev?.audioFeatures || [];
            const currentArtistGenres = prev?.artistGenres || [];
            const currentYoutubeTracks = prev?.youtubeTracks || [];
            const currentYoutubeVideos = prev?.youtubeVideos || [];

            // Combine Spotify tracks without duplicates
            const newSpotifyTracks = spotifyTracks.filter((t: any) => !currentSpotifyTracks.some((et: any) => et.id === t.id));
            const combinedSpotifyTracks = [...currentSpotifyTracks, ...newSpotifyTracks];

            // Combine audio features without duplicates
            const newFeatures = (audioFeatures || []).filter((f: any) => !currentAudioFeatures.some((ef: any) => ef.id === f.id));
            const combinedFeatures = [...currentAudioFeatures, ...newFeatures];

            // Combine genres
            const combinedGenres = Array.from(new Set([...currentArtistGenres, ...(artistGenres || [])]));

            // Combine YouTube tracks without duplicates
            const newYoutubeTracks = ytFormattedTracks.filter((t: any) => !currentYoutubeTracks.some((et: any) => et.url === t.url));
            const combinedYoutubeTracks = [...currentYoutubeTracks, ...newYoutubeTracks];

            // Combine YouTube videos without duplicates
            const newYoutubeVideos = (youtubeVideos || []).filter((v: any) => !currentYoutubeVideos.some((ev: any) => ev.id === v.id));
            const combinedYoutubeVideos = [...currentYoutubeVideos, ...newYoutubeVideos];

            return {
                spotifyTracks: combinedSpotifyTracks,
                audioFeatures: combinedFeatures,
                artistGenres: combinedGenres,
                youtubeVideos: combinedYoutubeVideos,
                youtubeTracks: combinedYoutubeTracks
            };
        });

        const totalFound = spotifyTracks.length + ytFormattedTracks.length;

        // Step 3: Fast dry_run DNA to get suggested genres based on the signals
        if (totalFound > 0) {
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
                const d = await r.json() as any;
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
                        setMatchedGenres(preselected);
                    }
                }
            } catch { }
        }

        // Step 4: Go to next stage
        setStage("genre_selection");
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
                    artistGenres,
                    dry_run: true
                })
            });
            const d = await r.json() as any;
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
        // We set a temporary 'saving' state if we want, or just wait for they to click 'Secure Signal'
    };

    const ytOk = ytTracks.filter(t => t.status === "ok");
    const hasYt = ytOk.length > 0;


    const handleOnboardingSuccess = (profile: any) => {
        setShowOnboarding(false);
        setExisting(profile);
        if (profile.metadata?.display_name) setDisplayName(profile.metadata.display_name);
        if (profile.email) setEmail(profile.email);
        if (profile.city) setCity(profile.city);
    };

    const handleOnboardingSkip = () => {
        setShowOnboarding(false);
    };

    // ─────────────────────────────────────────────────────────────────────
    return (
        <div className="relative min-h-screen bg-[#080808] overflow-x-hidden safe-bottom md:pb-0">
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
                    <HomeLanding
                        onChoice={() => setStage("sources")}
                        onArtist={() => { window.location.href = "/artists" }}
                        existing={existing}
                        refreshProfile={refreshProfile}
                    />
                )}


                {/* ═══════════════════════════════════════════════════════ */}
                {/* CONVERSATIONAL ONBOARDING                               */}
                {/* ═══════════════════════════════════════════════════════ */}

                {/* ═══════════════════════════════════════════════════════ */}
                {/* INNER STAGES                                            */}
                {/* ═══════════════════════════════════════════════════════ */}
                {stage !== "landing" && (
                    <motion.div key="inner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full min-h-screen">


                        <div className="max-w-5xl mx-auto px-4 md:px-8 pt-[5rem] lg:pt-28 pb-40 w-full">
                            <AnimatePresence mode="wait">


                                {stage === "genre_selection" && (
                                    <StageGenreSelection
                                        genres={genres}
                                        setGenres={setGenres}
                                        matchedGenres={matchedGenres}
                                        availableGenres={GENRES}
                                        fetchedSources={fetchedSources}
                                        onNext={runAnalysis}
                                        onBack={() => setStage("sources")}
                                    />
                                )}

                                {stage === "sources" && (
                                    <StageSources
                                        spotifyUrl={spotifyUrl}
                                        setSpotifyUrl={setSpotifyUrl}
                                        scanning={scanning}
                                        scanErr={scanErr}
                                        spotifyHelpOpen={spotifyHelpOpen}
                                        setSpotifyHelpOpen={setSpotifyHelpOpen}
                                        playlists={playlists}
                                        plTotal={plTotal}
                                        loadingMore={loadingMore}
                                        scanSpotify={scanSpotify}
                                        selPlaylists={selPlaylists}
                                        setSelPlaylists={setSelPlaylists}
                                        ytQuery={ytQuery}
                                        setYtQuery={setYtQuery}
                                        ytSearching={ytSearching}
                                        ytResults={ytResults}
                                        ytShowSearch={ytShowSearch}
                                        setYtShowSearch={setYtShowSearch}
                                        searchYt={searchYt}
                                        addYtSearchResult={addYtSearchResult}
                                        magicFillSlots={magicFillSlots}
                                        ytTracks={ytTracks}
                                        setYtTracks={setYtTracks}
                                        fetchSourcesAndPreselect={fetchSourcesAndPreselect}
                                        hasYt={hasYt}
                                        onBack={() => setStage("landing")}
                                    />
                                )}


                                {stage === "analyzing" && (
                                    <StageAnalyzing
                                        progress={progress}
                                        selPlaylists={selPlaylists}
                                        ytOk={ytOk}
                                    />
                                )}

                                {stage === "complete" && dna && (
                                    <StageComplete
                                        dna={dna}
                                        email={email}
                                        genres={genres}
                                        isAuthenticated={isAuthenticated}
                                        setShowOnboarding={setShowOnboarding}
                                        onRestart={() => { setStage("landing"); setSelPlaylists([]); setYtTracks(emptyYt()); }}
                                    />
                                )}


                                {stage === "email_capture" && (
                                    <StageEmailCapture
                                        email={email}
                                        setEmail={setEmail}
                                        handleEmailVerify={handleEmailVerify}
                                        checkingEmail={checkingEmail}
                                        emailVerifyError={emailVerifyError}
                                        clash={clash}
                                        handleFinalSubmit={handleFinalSubmit}
                                        handleResumeExisting={handleResumeExisting}
                                        setClash={setClash}
                                        onRestore={() => { setClash(null); setEmailVerifySent(false); setStage("complete") }}
                                    />
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

            <OnboardingModal
                isOpen={showOnboarding}
                dnaResult={{
                    genres,
                    displayName,
                    email,
                    city,
                    audioFeatures: fetchedSources?.audioFeatures || [],
                    youtubeVideos: fetchedSources?.youtubeVideos || [],
                    artistGenres: fetchedSources?.artistGenres || [],
                    spotifyTracks: fetchedSources?.spotifyTracks || [],
                    youtubeTracks: fetchedSources?.youtubeTracks || [],
                }}
                guestId={getCookie("guest_id") || ""}
                onSuccess={handleOnboardingSuccess}
                onSkip={handleOnboardingSkip}
            />

        </div>
    );
}