"use client";

import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Share2, Download, X, Twitter, Facebook, Linkedin,
    MessageCircle, Copy, Check, Camera, ExternalLink
} from "lucide-react";
import html2canvas from "html2canvas-pro";
import { AXIS_LABELS } from "@/lib/dna";

const HASHTAG = "#myMusicalDNA";
const SHARE_TEXT = `Check out my Musical DNA! 🧬🎵 ${HASHTAG}`;

// Mini radar for the share card
function MiniRadar({ vector }: { vector: number[] }) {
    const size = 200;
    const cx = size / 2;
    const cy = size / 2;
    const maxR = size / 2 - 20;
    const n = vector.length;

    const getPoint = (idx: number, val: number) => {
        const angle = (Math.PI * 2 * idx) / n - Math.PI / 2;
        return {
            x: cx + Math.cos(angle) * val * maxR,
            y: cy + Math.sin(angle) * val * maxR,
        };
    };

    const gridLevels = [0.25, 0.5, 0.75, 1.0];
    const points = (Array.isArray(vector) ? vector : []).map((v, i) => getPoint(i, Number(v) || 0));
    const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

    return (
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
            {gridLevels.map(level => {
                const pts = Array.from({ length: n }, (_, i) => getPoint(i, level));
                const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
                return <path key={level} d={d} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />;
            })}
            {Array.from({ length: n }, (_, i) => {
                const p = getPoint(i, 1);
                return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />;
            })}
            <path d={pathD} fill="rgba(255,0,0,0.15)" stroke="#FF0000" strokeWidth="2" />
            {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="3" fill="#FF0000" />
            ))}
            {Array.from({ length: n }, (_, i) => {
                const p = getPoint(i, 1.22);
                const label = AXIS_LABELS[i]?.replace(/_/g, " ") || "";
                const short = label.split(" ").map(w => w.charAt(0).toUpperCase()).join("");
                return (
                    <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central"
                        fill="rgba(255,255,255,0.5)" fontWeight="900" style={{ fontSize: "7px", letterSpacing: "0.1em" }}>
                        {short}
                    </text>
                );
            })}
        </svg>
    );
}

interface ShareDNACardProps {
    profile: any;
    siteUrl?: string;
}

export default function ShareDNACard({ profile, siteUrl }: ShareDNACardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [showModal, setShowModal] = useState(false);
    const [capturing, setCapturing] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [showCard, setShowCard] = useState(false);

    const shareUrl = siteUrl || "https://musicdnamatch.com/profile";

    const captureCard = useCallback(async () => {
        if (!cardRef.current) return null;

        setCapturing(true);
        try {
            // Make the card visible for capture
            setShowCard(true);

            // Wait for the render to complete
            await new Promise(r => setTimeout(r, 200));

            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: null,
                scale: 2,
                useCORS: true,
                logging: false,
                width: 600,
                height: 800,
            });

            const dataUrl = canvas.toDataURL("image/png");
            setCapturedImage(dataUrl);
            setShowCard(false);
            return dataUrl;
        } catch (err) {
            console.error("Capture error:", err);
            setShowCard(false);
            return null;
        } finally {
            setCapturing(false);
        }
    }, []);

    const handleOpenShare = async () => {
        setShowModal(true);
        await captureCard();
    };

    const handleDownload = () => {
        if (!capturedImage) return;
        const link = document.createElement("a");
        link.download = `my-musical-dna-${profile.display_name?.replace(/\s+/g, "-").toLowerCase() || "profile"}.png`;
        link.href = capturedImage;
        link.click();
    };

    const handleNativeShare = async () => {
        if (!capturedImage) return;

        try {
            const response = await fetch(capturedImage);
            const blob = await response.blob();
            const file = new File([blob], "my-musical-dna.png", { type: "image/png" });

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: "My Musical DNA",
                    text: SHARE_TEXT,
                    url: shareUrl,
                    files: [file],
                });
            } else {
                // Fall back to sharing without image
                await navigator.share({
                    title: "My Musical DNA",
                    text: SHARE_TEXT,
                    url: shareUrl,
                });
            }
        } catch (err) {
            if ((err as Error).name !== "AbortError") {
                console.error("Share failed:", err);
            }
        }
    };

    const shareToTwitter = () => {
        const text = encodeURIComponent(`${SHARE_TEXT}\n\n${shareUrl}`);
        window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
    };

    const shareToFacebook = () => {
        const url = encodeURIComponent(shareUrl);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encodeURIComponent(SHARE_TEXT)}`, "_blank");
    };

    const shareToLinkedIn = () => {
        const url = encodeURIComponent(shareUrl);
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
    };

    const shareToWhatsApp = () => {
        const text = encodeURIComponent(`${SHARE_TEXT}\n${shareUrl}`);
        window.open(`https://wa.me/?text=${text}`, "_blank");
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`${SHARE_TEXT}\n${shareUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Top 3 axes
    const topAxes = profile.axes
        ?.map((label: string, i: number) => ({ label, value: profile.vector?.[i] || 0 }))
        .sort((a: any, b: any) => b.value - a.value)
        .slice(0, 3) || [];

    const coherence = ((profile.coherence_index ?? 0) * 100).toFixed(1);

    return (
        <>
            {/* Trigger button */}
            <button
                onClick={handleOpenShare}
                className="relative w-full overflow-hidden flex items-center justify-center gap-3 border border-[#FF0000]/30 bg-black text-white hover:border-[#FF0000]/60 font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl hover:scale-[1.01] active:scale-95 transition-all group shadow-[0_0_20px_rgba(255,0,0,0.15)] hover:shadow-[0_0_40px_rgba(255,0,0,0.3)]"
            >
                {/* Subtle animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#FF0000]/20 via-purple-600/10 to-[#FF0000]/20 opacity-40 group-hover:opacity-80 transition-opacity duration-500" />
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full shimmer pointer-events-none" />

                <Camera className="h-5 w-5 text-[#FF0000] group-hover:scale-110 transition-transform relative z-10" />
                <span className="relative z-10">Capture & Share DNA</span>
            </button>

            {/* Hidden card for capture */}
            <div
                style={{
                    position: "fixed",
                    left: showCard ? "0" : "-9999px",
                    top: "0",
                    zIndex: showCard ? 0 : -1,
                    opacity: showCard ? 1 : 0,
                    pointerEvents: "none",
                }}
            >
                <div
                    ref={cardRef}
                    style={{
                        width: 600,
                        height: 800,
                        background: "linear-gradient(160deg, #0a0a0a 0%, #141414 40%, #1a0505 70%, #0a0a0a 100%)",
                        fontFamily: "'Syne', 'Inter', system-ui, sans-serif",
                        position: "relative",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {/* Decorative bg elements */}
                    <div style={{
                        position: "absolute", top: -80, right: -80,
                        width: 300, height: 300, borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(255,0,0,0.12) 0%, transparent 70%)",
                    }} />
                    <div style={{
                        position: "absolute", bottom: -60, left: -60,
                        width: 250, height: 250, borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(255,100,0,0.08) 0%, transparent 70%)",
                    }} />

                    {/* Top banner */}
                    <div style={{
                        padding: "32px 36px 0",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                        <div>
                            <div style={{
                                fontSize: 10, fontWeight: 900, color: "#FF0000",
                                letterSpacing: "0.35em", textTransform: "uppercase",
                                fontFamily: "'DM Mono', monospace",
                            }}>
                                Musical DNA Analysis
                            </div>
                            <div style={{
                                fontSize: 36, fontWeight: 900, color: "#fff",
                                letterSpacing: "-0.04em", fontStyle: "italic",
                                textTransform: "uppercase", lineHeight: 1.1, marginTop: 6,
                            }}>
                                {profile.display_name || "Anonymous"}
                            </div>
                        </div>
                        <div style={{
                            width: 60, height: 60, borderRadius: 18,
                            overflow: "hidden", border: "2px solid rgba(255,0,0,0.4)",
                            flexShrink: 0,
                            background: "rgba(255,255,255,0.05)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            {profile.metadata?.user_image ? (
                                <img
                                    src={profile.metadata.user_image}
                                    alt=""
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    crossOrigin="anonymous"
                                />
                            ) : (
                                <div style={{ fontSize: 28, fontWeight: 900, color: "rgba(255,255,255,0.3)" }}>
                                    {(profile.display_name || "?")[0]?.toUpperCase()}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Coherence badge */}
                    <div style={{ padding: "16px 36px 0", display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <div style={{
                            background: "rgba(255,0,0,0.15)", border: "1px solid rgba(255,0,0,0.3)",
                            borderRadius: 12, padding: "8px 16px",
                            display: "flex", alignItems: "center", gap: 8,
                        }}>
                            <span style={{
                                fontSize: 9, fontWeight: 900, color: "#FF0000",
                                letterSpacing: "0.3em", textTransform: "uppercase",
                                fontFamily: "'DM Mono', monospace",
                            }}>Coherence</span>
                            <span style={{ fontSize: 20, fontWeight: 900, color: "#FF0000" }}>
                                {coherence}%
                            </span>
                        </div>
                        <div style={{
                            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: 12, padding: "8px 16px",
                            display: "flex", alignItems: "center", gap: 8,
                        }}>
                            <span style={{
                                fontSize: 9, fontWeight: 900, color: "rgba(255,255,255,0.5)",
                                letterSpacing: "0.3em", textTransform: "uppercase",
                                fontFamily: "'DM Mono', monospace",
                            }}>12 Dimensions</span>
                        </div>
                    </div>

                    {/* Radar + Top traits */}
                    <div style={{
                        padding: "20px 36px",
                        display: "flex", alignItems: "center", gap: 16, flex: 1,
                    }}>
                        <div style={{ flexShrink: 0 }}>
                            <MiniRadar vector={profile.vector || Array(12).fill(0.5)} />
                        </div>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                            <div style={{
                                fontSize: 9, fontWeight: 900, color: "rgba(255,255,255,0.4)",
                                letterSpacing: "0.35em", textTransform: "uppercase",
                                fontFamily: "'DM Mono', monospace", marginBottom: 4,
                            }}>
                                Dominant Traits
                            </div>
                            {topAxes.map((axis: any, i: number) => (
                                <div key={axis.label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span style={{
                                            fontSize: 10, fontWeight: 900, color: "rgba(255,255,255,0.7)",
                                            letterSpacing: "0.2em", textTransform: "uppercase",
                                            fontFamily: "'DM Mono', monospace",
                                        }}>
                                            {axis.label.replace(/_/g, " ")}
                                        </span>
                                        <span style={{
                                            fontSize: 11, fontWeight: 900, color: "#FF0000",
                                            fontFamily: "'DM Mono', monospace",
                                        }}>
                                            {(axis.value * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    <div style={{
                                        height: 6, background: "rgba(255,255,255,0.08)",
                                        borderRadius: 6, overflow: "hidden",
                                    }}>
                                        <div style={{
                                            height: "100%",
                                            width: `${axis.value * 100}%`,
                                            borderRadius: 6,
                                            background: i === 0
                                                ? "linear-gradient(90deg, #FF0000, #FF4444)"
                                                : i === 1
                                                    ? "linear-gradient(90deg, #FF6600, #FFAA00)"
                                                    : "linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.5))",
                                        }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Genres */}
                    <div style={{ padding: "0 36px 20px" }}>
                        <div style={{
                            fontSize: 9, fontWeight: 900, color: "rgba(255,255,255,0.4)",
                            letterSpacing: "0.35em", textTransform: "uppercase",
                            fontFamily: "'DM Mono', monospace", marginBottom: 10,
                        }}>
                            Sonic Fingerprint
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {(profile.top_genres || []).slice(0, 6).map((g: string, i: number) => (
                                <span key={g + i} style={{
                                    fontSize: 10, fontWeight: 900, textTransform: "uppercase",
                                    letterSpacing: "0.15em",
                                    padding: "8px 14px", borderRadius: 12,
                                    ...(i < 2
                                        ? { background: "#FF0000", color: "#fff" }
                                        : { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)" }
                                    ),
                                }}>
                                    {g}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{
                        padding: "20px 36px 28px",
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        marginTop: "auto",
                    }}>
                        <div>
                            <div style={{
                                fontSize: 14, fontWeight: 900, color: "#fff",
                                letterSpacing: "-0.02em", fontStyle: "italic",
                            }}>
                                MusicDNA<span style={{ color: "#FF0000" }}>Match</span>
                            </div>
                            <div style={{
                                fontSize: 9, color: "rgba(255,255,255,0.35)",
                                fontFamily: "'DM Mono', monospace",
                                fontWeight: 700,
                                letterSpacing: "0.2em",
                                textTransform: "uppercase",
                                marginTop: 2,
                            }}>
                                musicdnamatch.com
                            </div>
                        </div>
                        <div style={{
                            fontSize: 13, fontWeight: 900, color: "#FF0000",
                            letterSpacing: "0.02em",
                            fontStyle: "italic",
                        }}>
                            {HASHTAG}
                        </div>
                    </div>
                </div>
            </div>

            {/* Share Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setShowModal(false); setCapturedImage(null); }}
                            className="absolute inset-0 bg-black/85 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative z-10 w-full max-w-lg"
                        >
                            <div className="glass rounded-[2.5rem] border border-white/15 overflow-hidden">
                                {/* Modal Header */}
                                <div className="p-6 md:p-8 pb-0 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-black text-white italic tracking-tighter">
                                            Share Your <span className="text-[#FF0000]">DNA</span>
                                        </h2>
                                        <p className="mono text-[9px] text-white/50 uppercase tracking-widest font-bold mt-1">
                                            Download or share to social media
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => { setShowModal(false); setCapturedImage(null); }}
                                        className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                                    >
                                        <X className="h-4 w-4 text-white" />
                                    </button>
                                </div>

                                {/* Preview */}
                                <div className="p-6 md:p-8">
                                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/50 mb-6">
                                        {capturing ? (
                                            <div className="flex flex-col items-center justify-center py-20">
                                                <div className="h-8 w-8 border-2 border-[#FF0000] border-t-transparent rounded-full animate-spin mb-4" />
                                                <p className="mono text-[10px] text-white/50 uppercase tracking-widest font-bold">
                                                    Generating DNA Card…
                                                </p>
                                            </div>
                                        ) : capturedImage ? (
                                            <img
                                                src={capturedImage}
                                                alt="Your Musical DNA Card"
                                                className="w-full h-auto"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-20">
                                                <Camera className="h-8 w-8 text-white/20 mb-3" />
                                                <p className="mono text-[10px] text-white/40 uppercase tracking-widest font-bold">
                                                    Preparing preview…
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Download button */}
                                    <button
                                        onClick={handleDownload}
                                        disabled={!capturedImage}
                                        className="w-full flex items-center justify-center gap-3 bg-white text-black font-black text-[11px] uppercase tracking-widest py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed mb-6 shadow-lg"
                                    >
                                        <Download className="h-4 w-4" />
                                        Download Image
                                    </button>

                                    {/* Social media buttons */}
                                    <div className="space-y-3">
                                        <p className="mono text-[9px] text-white/40 uppercase tracking-widest font-bold">
                                            Share to Social Media
                                        </p>

                                        <div className="grid grid-cols-2 gap-2.5">
                                            {/* X/Twitter */}
                                            <button
                                                onClick={shareToTwitter}
                                                className="flex items-center justify-center gap-2.5 bg-white/8 border border-white/15 hover:bg-white/15 hover:border-white/30 text-white font-black text-[10px] uppercase tracking-widest py-3.5 rounded-xl transition-all group"
                                            >
                                                <svg className="h-4 w-4 fill-current group-hover:text-white transition-colors" viewBox="0 0 24 24">
                                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                                </svg>
                                                Post on X
                                            </button>

                                            {/* Facebook */}
                                            <button
                                                onClick={shareToFacebook}
                                                className="flex items-center justify-center gap-2.5 bg-[#1877F2]/10 border border-[#1877F2]/20 hover:bg-[#1877F2]/20 hover:border-[#1877F2]/40 text-[#1877F2] font-black text-[10px] uppercase tracking-widest py-3.5 rounded-xl transition-all"
                                            >
                                                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                                </svg>
                                                Facebook
                                            </button>

                                            {/* WhatsApp */}
                                            <button
                                                onClick={shareToWhatsApp}
                                                className="flex items-center justify-center gap-2.5 bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/20 hover:border-[#25D366]/40 text-[#25D366] font-black text-[10px] uppercase tracking-widest py-3.5 rounded-xl transition-all"
                                            >
                                                <MessageCircle className="h-4 w-4" />
                                                WhatsApp
                                            </button>

                                            {/* LinkedIn */}
                                            <button
                                                onClick={shareToLinkedIn}
                                                className="flex items-center justify-center gap-2.5 bg-[#0A66C2]/10 border border-[#0A66C2]/20 hover:bg-[#0A66C2]/20 hover:border-[#0A66C2]/40 text-[#0A66C2] font-black text-[10px] uppercase tracking-widest py-3.5 rounded-xl transition-all"
                                            >
                                                <Linkedin className="h-4 w-4" />
                                                LinkedIn
                                            </button>
                                        </div>

                                        {/* Native Share (mobile) */}
                                        {typeof navigator !== "undefined" && "share" in navigator && (
                                            <button
                                                onClick={handleNativeShare}
                                                disabled={!capturedImage}
                                                className="w-full flex items-center justify-center gap-3 bg-[#FF0000] text-white font-black text-[10px] uppercase tracking-widest py-4 rounded-xl hover:bg-red-500 transition-all disabled:opacity-30 mt-1"
                                            >
                                                <Share2 className="h-4 w-4" />
                                                Share via Device
                                            </button>
                                        )}

                                        {/* Copy link */}
                                        <button
                                            onClick={handleCopyLink}
                                            className="w-full flex items-center justify-center gap-3 border border-white/15 bg-white/5 text-white/70 hover:text-white hover:border-white/30 font-black text-[10px] uppercase tracking-widest py-3.5 rounded-xl transition-all"
                                        >
                                            {copied
                                                ? <><Check className="h-3.5 w-3.5 text-green-400" />Link Copied!</>
                                                : <><Copy className="h-3.5 w-3.5" />Copy Share Link</>
                                            }
                                        </button>
                                    </div>
                                </div>

                                {/* Hashtag footer */}
                                <div className="px-6 md:px-8 pb-6 md:pb-8 pt-2 border-t border-white/5">
                                    <p className="text-center">
                                        <span className="mono text-[9px] text-white/30 uppercase tracking-widest font-bold">
                                            Download the image & upload it with your post →{" "}
                                        </span>
                                        <span className="text-[#FF0000] font-black text-sm italic">
                                            {HASHTAG}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
