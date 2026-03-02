"use client";

import { useState, useEffect, useRef, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, MessageSquare, Play, Merge, Check, Info, Music4, Activity, ExternalLink, Sparkles, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function TempRoomPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: bridgeId } = use(params);
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState(172800);
    const [confirmed, setConfirmed] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(true);
    const [synthesis, setSynthesis] = useState<any>(null);
    const [playlistUrl, setPlaylistUrl] = useState<string | null>(null);
    const [merging, setMerging] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!bridgeId) return;

        const setupBridge = async () => {
            // 1. Fetch initial state
            const { data: bridge } = await supabase
                .from("bridges")
                .select("*")
                .eq("id", bridgeId)
                .single();

            if (bridge?.common_ground_data?.synthesis) {
                setSynthesis(bridge.common_ground_data.synthesis);
            } else {
                // Trigger synthesis if not present
                const res = await fetch("/api/bridge/synthesize", {
                    method: "POST",
                    body: JSON.stringify({ bridgeId }),
                    headers: { "Content-Type": "application/json" }
                });
                if (res.ok) setSynthesis(await res.json());
            }

            if (bridge?.common_ground_data?.status === "merged") {
                setConfirmed(true);
                setPlaylistUrl(bridge.common_ground_data.playlist_url);
            }

            const { data: initialMessages } = await supabase
                .from("bridge_messages")
                .select("*")
                .eq("bridge_id", bridgeId)
                .order("created_at", { ascending: true });

            if (initialMessages) setMessages(initialMessages);
            setLoading(false);

            // 2. Subscribe to new messages
            const channel = supabase
                .channel(`bridge:${bridgeId}`)
                .on(
                    "postgres_changes",
                    {
                        event: "INSERT",
                        schema: "public",
                        table: "bridge_messages",
                        filter: `bridge_id=eq.${bridgeId}`,
                    },
                    (payload) => {
                        setMessages((prev) => [...prev, payload.new]);
                    }
                )
                .on(
                    "postgres_changes",
                    {
                        event: "UPDATE",
                        schema: "public",
                        table: "bridges",
                        filter: `id=eq.${bridgeId}`,
                    },
                    (payload: any) => {
                        if (payload.new.common_ground_data?.status === "merged") {
                            setConfirmed(true);
                            setPlaylistUrl(payload.new.common_ground_data.playlist_url);
                        }
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };

        setupBridge();
    }, [bridgeId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async () => {
        if (!inputValue.trim()) return;
        const content = inputValue;
        setInputValue("");
        try {
            await fetch("/api/bridge/message", {
                method: "POST",
                body: JSON.stringify({ bridgeId, content }),
                headers: { "Content-Type": "application/json" }
            });
        } catch (err) { console.error(err); }
    };

    const startMerge = async () => {
        setMerging(true);
        try {
            const res = await fetch("/api/bridge/merge", {
                method: "POST",
                body: JSON.stringify({ bridgeId }),
                headers: { "Content-Type": "application/json" }
            });
            if (res.ok) {
                const data = await res.json();
                setPlaylistUrl(data.url);
                setConfirmed(true);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setMerging(false);
        }
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen pt-20 px-6 sm:px-10 pb-20 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
            {/* Left: Room Context & Chat */}
            <div className="flex-1 space-y-8">
                <header className="flex justify-between items-start">
                    <div>
                        <button onClick={() => router.back()} className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground hover:text-white transition-colors mb-3">
                            <ArrowLeft className="h-3.5 w-3.5" /> Back to Matches
                        </button>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-primary/20 text-primary text-[10px] font-black px-2 py-0.5 rounded-full ring-1 ring-primary/30 uppercase tracking-widest">Active Bridge</span>
                            <span className="text-white/40 text-[10px] font-mono">RX-{bridgeId.slice(0, 4)}</span>
                        </div>
                        <h1 className="text-4xl font-black mb-2">The <span className="text-primary italic">Green</span> Room</h1>
                        <p className="text-muted-foreground flex items-center gap-2">
                            <Timer className="h-4 w-4 text-primary" />
                            Room Expires in <span className="text-white font-mono">{formatTime(timeLeft)}</span>
                        </p>
                    </div>
                </header>

                <section className="glass rounded-[2rem] p-8 h-[500px] flex flex-col">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                        <h3 className="font-bold flex items-center gap-2 uppercase tracking-tighter text-xs opacity-50">
                            <MessageSquare className="h-4 w-4" /> Collaborative Bridge Chat
                        </h3>
                        <span className="text-[10px] font-mono text-green-500 animate-pulse uppercase tracking-widest">Secured Node</span>
                    </div>

                    <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 pr-4 mb-6 scrollbar-hide">
                        <ChatMessage sender="System" text="Welcome to your collaborative Green Room. Your Musical DNA shows significant overlap." isSystem />

                        {messages.map((msg) => (
                            <ChatMessage
                                key={msg.id}
                                text={msg.content}
                                isOwn={false} // Would need sender comparison in real app
                            />
                        ))}

                        {loading && <Activity className="h-6 w-6 animate-spin mx-auto opacity-20" />}
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Transmit message..."
                            className="w-full h-14 bg-white/5 rounded-2xl border border-white/5 px-6 focus:outline-none focus:border-primary/40 transition-all font-medium"
                        />
                        <button
                            onClick={sendMessage}
                            className="absolute right-3 top-2 bottom-2 bg-primary px-4 rounded-xl text-primary-foreground font-bold text-sm"
                        >
                            Send
                        </button>
                    </div>
                </section>
            </div>

            {/* Right: Playlist Preview & Merge */}
            <div className="w-full lg:w-[400px] space-y-6">
                <div className="glass rounded-[3rem] p-8 border-primary/10 glow-primary/10 overflow-hidden relative min-h-[500px] flex flex-col">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <Music4 className="h-32 w-32" />
                    </div>

                    {!synthesis ? (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                            <Sparkles className="h-12 w-12 text-primary animate-pulse" />
                            <p className="font-mono text-[10px] uppercase opacity-40">Orchestrating Common Ground...</p>
                        </div>
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">
                            <h3 className="text-xl font-black mb-2 italic uppercase tracking-tighter">
                                {synthesis.name}
                            </h3>
                            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                                "{synthesis.description}"
                            </p>

                            <div className="flex flex-wrap gap-2 mb-8">
                                {synthesis.vibe?.map((v: string) => (
                                    <span key={v} className="text-[9px] font-bold uppercase bg-white/5 px-2 py-1 rounded-md opacity-50 border border-white/5">{v}</span>
                                ))}
                            </div>

                            <div className="space-y-4 mb-8">
                                <TrackItem title="Spectral Intersection" artist="AI MAESTRO" duration="PROCESSED" />
                            </div>

                            <div className="mt-auto">
                                {!confirmed ? (
                                    <button
                                        onClick={startMerge}
                                        disabled={merging}
                                        className="w-full bg-primary p-6 rounded-[1.5rem] font-bold text-primary-foreground glow-primary flex items-center justify-center gap-3 transition-all enabled:hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                                    >
                                        {merging ? <Activity className="h-5 w-5 animate-spin" /> : <Merge className="h-5 w-5" />}
                                        Confirm & Merge Playlist
                                    </button>
                                ) : (
                                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                        <a
                                            href={playlistUrl || "#"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full bg-green-500 p-6 rounded-[1.5rem] font-black text-black text-center flex items-center justify-center gap-2 animate-glow-green"
                                        >
                                            <Check className="h-5 w-5" />
                                            OPEN ON SPOTIFY
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                        <p className="text-[10px] text-center mt-4 text-green-500 font-bold uppercase tracking-widest">Shared DNA Successfully Merged</p>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ChatMessage({ sender = "Soulmate", text, isSystem = false, isOwn = false }: { sender?: string, text: string, isSystem?: boolean, isOwn?: boolean }) {
    return (
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
            <div className={`text-[10px] font-bold uppercase mb-1 flex items-center gap-1.5 ${isSystem ? 'text-primary' : 'opacity-40'}`}>
                {isSystem ? "SYSTEM" : isOwn ? "YOU" : "SOULMATE"}
            </div>
            <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed ${isSystem ? 'bg-primary/5 border border-primary/20 italic' :
                isOwn ? 'bg-primary text-primary-foreground font-medium rounded-tr-none' :
                    'bg-white/5 border border-white/5 rounded-tl-none'
                }`}>
                {text}
            </div>
        </div>
    );
}

function TrackItem({ title, artist, duration }: { title: string, artist: string, duration: string }) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all cursor-pointer">
            <div className="h-10 w-10 bg-black/40 rounded-lg flex items-center justify-center text-primary">
                <Play className="h-4 w-4 fill-primary" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate pr-2">{title}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{artist}</div>
            </div>
            <div className="text-[10px] font-mono opacity-40">{duration}</div>
        </div>
    );
}
