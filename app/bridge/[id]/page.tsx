"use client";

import { useState, useEffect, useRef, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Waves, Users, ArrowLeft, Brain, CheckCircle2,
    Activity, Send, Copy, Check, ExternalLink,
    Music2, MessageSquare, User
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface BridgeMember {
    userId: string;
    email: string | null;
    name: string | null;
}

interface BridgeMsg {
    id: string;
    sender_id: string;
    content: string;
    created_at: string;
}

export default function BridgePage({ params }: { params: Promise<{ id: string }> }) {
    const { id: bridgeId } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [me, setMe] = useState<BridgeMember | null>(null);
    const [partner, setPartner] = useState<BridgeMember | null>(null);
    const [messages, setMessages] = useState<BridgeMsg[]>([]);
    const [newMsg, setNewMsg] = useState("");
    const [sending, setSending] = useState(false);
    const [copied, setCopied] = useState(false);
    const msgEndRef = useRef<HTMLDivElement>(null);
    const pollRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch bridge info
    useEffect(() => {
        if (!bridgeId) return;
        (async () => {
            try {
                const r = await fetch(`/api/bridge/info?bridgeId=${bridgeId}`);
                if (!r.ok) {
                    setError(r.status === 401 ? "Not authorized to view this bridge." : "Bridge not found.");
                    setLoading(false);
                    return;
                }
                const d = await r.json() as any;
                setMe(d.me);
                setPartner(d.partner);
            } catch { setError("Failed to load bridge."); }
            finally { setLoading(false); }
        })();
    }, [bridgeId]);

    // Fetch messages
    const fetchMessages = async () => {
        try {
            const r = await fetch(`/api/bridge/messages?bridgeId=${bridgeId}`);
            if (r.ok) {
                const d = await r.json() as any;
                setMessages(d.messages || []);
            }
        } catch { }
    };

    useEffect(() => {
        if (!bridgeId || loading || error) return;
        fetchMessages();
        pollRef.current = setInterval(fetchMessages, 8000);
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [bridgeId, loading, error]);

    // Auto-scroll on new messages
    useEffect(() => {
        msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!newMsg.trim() || sending) return;
        setSending(true);
        try {
            await fetch("/api/bridge/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bridgeId, content: newMsg }),
            });
            setNewMsg("");
            await fetchMessages();
        } catch { }
        finally { setSending(false); }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative min-h-screen bg-[#080808] overflow-x-hidden">
            <style>{`
                
                *{font-family:var(--font-syne),'Syne',sans-serif}
                .mono{font-family:'DM Mono',monospace!important}
                .glass{background:rgba(10,10,10,.75);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px)}
                .sb::-webkit-scrollbar{width:4px}
                .sb::-webkit-scrollbar-thumb{background:rgba(255,0,0,.2);border-radius:4px}
            `}</style>



            <div className="max-w-3xl mx-auto px-4 md:px-8 pt-24 pb-20 w-full">
                {loading ? (
                    <div className="glass rounded-[3rem] p-20 flex flex-col items-center justify-center">
                        <Activity className="h-10 w-10 text-[#FF0000] animate-spin mb-4" />
                        <p className="mono text-[10px] text-white/60 uppercase tracking-widest">Loading bridge…</p>
                    </div>
                ) : error ? (
                    <div className="glass rounded-[3rem] p-20 text-center">
                        <Brain className="h-12 w-12 text-white/10 mx-auto mb-4" />
                        <p className="text-white/70 font-medium mb-6">{error}</p>
                        <button onClick={() => router.back()} className="inline-flex items-center gap-2 bg-white/10 text-white font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-white/15 transition-all">
                            <ArrowLeft className="h-3.5 w-3.5" />Go Back
                        </button>
                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                        {/* Header */}
                        <div className="glass rounded-[2.5rem] p-8 border border-green-500/15 bg-green-500/3 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-5"><Users className="h-24 w-24" /></div>
                            <div className="relative z-10">
                                <button onClick={() => router.back()} className="flex items-center gap-2 mono text-[10px] text-white/60 hover:text-green-400 transition-colors uppercase tracking-widest mb-4">
                                    <ArrowLeft className="h-3.5 w-3.5" />Return to Soulmates
                                </button>
                                <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter italic mb-3">
                                    DNA <span className="text-green-400">Bridge</span>
                                </h1>
                                <div className="flex items-center gap-5">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-lg bg-[#FF0000]/15 flex items-center justify-center text-[#FF0000] font-black text-xs">
                                            {(me?.name || "Me")[0]}
                                        </div>
                                        <span className="mono text-[10px] text-white/50 font-black uppercase">{me?.name || "You"}</span>
                                    </div>
                                    <div className="h-px flex-1 bg-gradient-to-r from-[#FF0000]/30 via-green-500/30 to-green-500/30" />
                                    <div className="flex items-center gap-2">
                                        <span className="mono text-[10px] text-white/50 font-black uppercase">{partner?.name || "Partner"}</span>
                                        <div className="h-8 w-8 rounded-lg bg-green-500/15 flex items-center justify-center text-green-400 font-black text-xs">
                                            {(partner?.name || "?")[0]}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button onClick={handleCopy}
                                className="flex items-center gap-2 border border-white/10 bg-white/4 text-white/50 hover:text-white hover:border-white/20 font-black text-[9px] uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all">
                                {copied ? <><Check className="h-3 w-3 text-green-400" />Copied</> : <><Copy className="h-3 w-3" />Share Link</>}
                            </button>
                        </div>

                        {/* Chat */}
                        <div className="glass rounded-[2.5rem] border border-white/14 overflow-hidden">
                            <div className="px-7 py-4 border-b border-white/10 flex items-center gap-2">
                                <MessageSquare className="h-3.5 w-3.5 text-[#FF0000]" />
                                <span className="mono text-[10px] text-white/60 uppercase tracking-widest font-black">Bridge Chat</span>
                                <span className="mono text-[9px] text-white/45 ml-auto">{messages.length} messages</span>
                            </div>

                            <div className="h-[420px] overflow-y-auto sb px-6 py-5 space-y-3">
                                {messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                        <Music2 className="h-10 w-10 text-white/8 mb-3" />
                                        <p className="mono text-[10px] text-white/45 uppercase tracking-widest mb-1">No messages yet</p>
                                        <p className="text-white/70 text-xs">Start a conversation about your shared musical taste!</p>
                                    </div>
                                ) : (
                                    messages.map(msg => {
                                        const isMe = msg.sender_id === me?.userId;
                                        return (
                                            <motion.div key={msg.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                                                className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                                <div className={`max-w-[75%] px-4 py-3 rounded-2xl ${isMe
                                                    ? "bg-[#FF0000]/15 border border-[#FF0000]/20 rounded-br-md"
                                                    : "bg-white/6 border border-white/14 rounded-bl-md"}`}>
                                                    <p className="text-sm text-white/80 leading-relaxed">{msg.content}</p>
                                                    <p className={`mono text-[8px] mt-1.5 uppercase tracking-widest ${isMe ? "text-[#FF0000]/40" : "text-white/50"}`}>
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                )}
                                <div ref={msgEndRef} />
                            </div>

                            {/* Input */}
                            <div className="px-5 py-4 border-t border-white/10">
                                <div className="flex items-center gap-2 p-2 bg-white/4 border border-white/14 rounded-2xl focus-within:border-[#FF0000]/30 transition-all">
                                    <input type="text" value={newMsg}
                                        onChange={e => setNewMsg(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && handleSend()}
                                        placeholder="Share a song, start a conversation…"
                                        className="flex-1 bg-transparent py-2.5 px-3 focus:outline-none mono text-sm text-white placeholder:text-white/35" />
                                    <button onClick={handleSend} disabled={!newMsg.trim() || sending}
                                        className="bg-[#FF0000] text-white p-3 rounded-xl hover:bg-red-500 transition-all disabled:opacity-30">
                                        {sending ? <Activity className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* BG */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/3 h-[500px] w-[500px] blur-[160px] rounded-full bg-green-900/8" />
                <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] blur-[160px] rounded-full bg-[#FF0000]/5" />
            </div>
        </div>
    );
}
