"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Sparkles, Activity, Copy, Check, Dna, Send } from "lucide-react";
import { useRouter } from "next/navigation";

interface BridgeInfo {
    bridgeId: string;
    createdAt: string;
    me: { userId: string; email: string | null; name: string | null };
    partner: { userId: string; email: string | null; name: string | null };
}

export default function TempRoomPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: bridgeId } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [bridge, setBridge] = useState<BridgeInfo | null>(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!bridgeId) return;

        const fetchBridge = async () => {
            try {
                const res = await fetch(`/api/bridge/info?bridgeId=${bridgeId}`);
                if (!res.ok) {
                    setError(res.status === 401 ? "Please log in to view this bridge." : "Bridge not found.");
                    setLoading(false);
                    return;
                }
                const data = await res.json();
                setBridge(data);
            } catch {
                setError("Failed to load bridge data.");
            } finally {
                setLoading(false);
            }
        };

        fetchBridge();
    }, [bridgeId]);

    const emailSubject = "🎵 Music DNA Match — Let's Collaborate!";
    const emailBody = `Hey${bridge?.partner?.name ? ` ${bridge.partner.name}` : ""}!

We matched on Music DNA Match (dna.armanayva.com)! Looks like our music tastes have some serious overlap.

Let's connect and collaborate on a shared playlist — I think we could put together something great.

Check out the match here: https://dna.armanayva.com/temp-room/${bridgeId}

Talk soon!${bridge?.me?.name ? `\n${bridge.me.name}` : ""}`;

    const mailtoLink = `mailto:${bridge?.partner?.email || ""}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(emailBody);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Activity className="h-10 w-10 animate-spin text-[#FF0000] opacity-30" />
            </div>
        );
    }

    if (error || !bridge) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="glass rounded-3xl p-10 text-center max-w-md">
                    <Dna className="h-12 w-12 text-[#FF0000]/40 mx-auto mb-4" />
                    <h2 className="text-xl font-black text-white mb-2 uppercase tracking-tight">{error || "Something went wrong"}</h2>
                    <button onClick={() => router.push("/match")} className="mt-4 text-xs font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                        ← Back to Matches
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 px-4 sm:px-8 pb-20 max-w-3xl mx-auto flex flex-col">
            {/* Header */}
            <header className="mb-10">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase text-white/60 hover:text-white transition-colors mb-4 tracking-widest">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to matches
                </button>
                <div className="flex items-center gap-2 mb-3">
                    <span className="bg-[#FF0000]/20 text-[#FF0000] text-[10px] font-black px-2.5 py-0.5 rounded-full ring-1 ring-[#FF0000]/30 uppercase tracking-widest">DNA Bridge</span>
                    <span className="text-white/60 text-[10px] font-mono">RX-{bridgeId.slice(0, 6)}</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">
                    Connect with your <span className="text-[#FF0000] italic">Match</span>
                </h1>
            </header>

            {/* Email Exchange Card */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass rounded-[2rem] p-6 md:p-10 relative overflow-hidden"
            >
                {/* Background decoration */}
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#FF0000]/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#FF0000]/5 rounded-full blur-3xl pointer-events-none" />

                {/* Participants */}
                <div className="relative z-10 mb-8">
                    <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FF0000] mb-6 flex items-center gap-2">
                        <Sparkles className="h-4 w-4" /> Matched Signals
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <ParticipantCard label="You" name={bridge.me.name} email={bridge.me.email} />
                        <ParticipantCard label="Your Match" name={bridge.partner.name} email={bridge.partner.email} />
                    </div>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-6" />

                {/* Email Preview */}
                <div className="relative z-10 mb-8">
                    <div className="text-[11px] font-black uppercase tracking-[0.2em] text-white/70 mb-4 flex items-center gap-2">
                        <Mail className="h-4 w-4" /> Draft Message Preview
                    </div>

                    <div className="bg-black/40 rounded-2xl p-5 md:p-6 border border-white/5 space-y-3">
                        <div className="flex items-center gap-2 text-[11px] text-white/60 font-mono">
                            <span className="text-white/50">To:</span>
                            <span className="text-white/90">{bridge.partner.email || "—"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-white/60 font-mono">
                            <span className="text-white/50">Subject:</span>
                            <span className="text-white/90">{emailSubject}</span>
                        </div>
                        <div className="w-full h-px bg-white/5" />
                        <pre className="text-sm text-white/80 font-sans whitespace-pre-wrap leading-relaxed">{emailBody}</pre>
                    </div>

                    {/* Copy button */}
                    <button
                        onClick={handleCopy}
                        className="mt-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors"
                    >
                        {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? "Copied to clipboard" : "Copy message"}
                    </button>
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                >
                    {bridge.partner.email ? (
                        <a
                            href={mailtoLink}
                            className="w-full bg-[#FF0000] p-5 rounded-[1.5rem] font-black text-white uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_10px_40px_rgba(255,0,0,0.4)] no-underline"
                        >
                            <Send className="h-5 w-5" />
                            Draft Email to Your Match
                        </a>
                    ) : (
                        <div className="w-full bg-white/5 p-5 rounded-[1.5rem] font-black text-white/50 uppercase tracking-widest text-xs flex items-center justify-center gap-3 border border-white/10">
                            <Mail className="h-5 w-5" />
                            No email available yet
                        </div>
                    )}
                </motion.div>
            </motion.section>

            {/* Footer note */}
            <p className="text-center text-[11px] text-white/50 font-bold uppercase tracking-widest mt-8">
                Bridge established via <a href="https://dna.armanayva.com" className="text-[#FF0000]/50 hover:text-[#FF0000] transition-colors">dna.armanayva.com</a>
            </p>
        </div>
    );
}

function ParticipantCard({ label, name, email }: { label: string; name: string | null; email: string | null }) {
    return (
        <div className="bg-white/[0.07] border border-white/10 rounded-2xl p-5 space-y-2 hover:bg-white/10 transition-colors">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FF0000]">{label}</div>
            <div className="text-sm md:text-base font-black text-white truncate">{name || "Anonymous"}</div>
            <div className="flex items-center gap-2 text-xs text-white/70 font-mono truncate">
                <Mail className="h-3.5 w-3.5 flex-shrink-0 text-white/40" />
                {email || "Not provided"}
            </div>
        </div>
    );
}
