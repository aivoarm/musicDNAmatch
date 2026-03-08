"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Eye, Database, Share2, UserCheck, User, Users } from "lucide-react";

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-20 px-6 sm:px-10 max-w-4xl mx-auto">
            <Link
                href="/"
                className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground hover:text-white transition-colors mb-10 group"
            >
                <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                Back to Pulse
            </Link>

            <header className="mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF0000]/10 border border-[#FF0000]/20 text-[#FF0000] text-[10px] font-black uppercase tracking-widest mb-6">
                    <ShieldCheck className="h-3 w-3" /> Secure Node Protocol
                </div>
                <h1 className="text-5xl sm:text-6xl font-black tracking-tighter mb-4">
                    Privacy <span className="text-[#FF0000] italic">Policy</span>
                </h1>
                <p className="text-white/40 font-mono text-sm uppercase tracking-widest">Version 1.0.2 / Last Updated: March 2, 2026</p>
            </header>

            <div className="space-y-12 leading-relaxed text-white/70">
                <section className="glass rounded-[2rem] p-8 border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                        <Lock className="h-20 w-20" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                        <Eye className="h-5 w-5 text-[#FF0000]" /> 1. Data Intelligence Collection
                    </h2>
                    <p className="mb-4">
                        MusicDNA ("the Application") analyzes your musical tastes to construct your unique signature. We collect the following specific information:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><span className="text-white font-medium">Public Information:</span> We only process public information, specifically public Spotify playlists and public YouTube videos you provide.</li>
                        <li><span className="text-white font-medium">Profile Data:</span> Your name and email address are collected securely and stored only to allow you to revisit your profile and to suggest potential matches with other people.</li>
                        <li><span className="text-white font-medium">Communications:</span> We will ask for your explicit consent before sending any newsletters or promotional materials.</li>
                    </ul>
                </section>

                <section className="space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <Database className="h-5 w-5 text-[#FF0000]" /> 2. Computational Usage
                    </h2>
                    <p>
                        Your data is processed locally and via our secure backend to:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                            <p className="text-xs font-black uppercase tracking-widest mb-2 text-[#FF0000]">DNA Generation</p>
                            <p className="text-sm">Synthesizing raw YouTube signals into spectral resonance and temporal density metrics.</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                            <p className="text-xs font-black uppercase tracking-widest mb-2 text-[#FF0000]">Signal Matching</p>
                            <p className="text-sm">Comparing your DNA vector with other active nodes to identify high-fidelity connections.</p>
                        </div>
                    </div>
                </section>

                <section className="space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <Share2 className="h-5 w-5 text-[#FF0000]" /> 3. Data Transmission & Sharing
                    </h2>
                    <p>
                        MusicDNA does not sell your data to third-party advertisers. Data is exclusively stored in our encrypted Supabase database instances. Your musical identity is only revealed to other users when:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>You explicitly "Broadast" your signal to the global match pool.</li>
                        <li>You enter a collaborative "Green Room" bridge with another node.</li>
                    </ul>
                </section>

                <section className="glass rounded-[2rem] p-8 border-white/5 bg-[#FF0000]/5">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                        <UserCheck className="h-5 w-5 text-[#FF0000]" /> 4. Node Control & Deletion
                    </h2>
                    <p className="mb-6">
                        You maintain absolute control over your musical identity. At any time, you can terminate your session:
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <div className="px-6 py-4 rounded-xl bg-black border border-white/10 flex-1 min-w-[200px]">
                            <p className="text-xs font-bold uppercase mb-1">Signed Out</p>
                            <p className="text-sm opacity-50">Nukes all session cookies immediately.</p>
                        </div>
                        <div className="px-6 py-4 rounded-xl bg-black border border-white/10 flex-1 min-w-[200px]">
                            <p className="text-xs font-bold uppercase mb-1">Request Deletion</p>
                            <p className="text-sm opacity-50">Contact us at privacy@armanayva.com to completely erase your DNA vector and profile data from our servers.</p>
                        </div>
                    </div>
                </section>

                <footer className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <span className="font-mono text-[10px] text-white/50 tracking-widest">© 2026 rights reserved by <a href="https://armanayva.com" target="_blank" className="hover:text-white transition-colors">armanayva.com</a></span>
                    <div className="flex gap-6">
                        <Link href="/about" className="font-mono text-[10px] text-white/45 hover:text-white/70 uppercase tracking-widest transition-colors">About</Link>
                        <Link href="/profile" className="font-mono text-[10px] text-white/55 hover:text-white/60 uppercase tracking-widest transition-colors flex items-center gap-1.5"><User className="h-3 w-3" />Profile</Link>
                        <Link href="/soulmates" onClick={() => {
                            fetch('/api/dna/intent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ intent: 'find_soulmates' }) }).catch(console.error);
                        }} className="font-mono text-[10px] text-white/55 hover:text-white/60 uppercase tracking-widest transition-colors flex items-center gap-1.5"><Users className="h-3 w-3" />Find Soulmates</Link>
                        <Link href="/privacy" className="font-mono text-[10px] text-white/45 hover:text-white/70 uppercase tracking-widest transition-colors">Privacy</Link>
                    </div>
                </footer>
            </div>

            {/* Background elements */}
            <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden opacity-30">
                <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-[#FF0000]/10 blur-[150px] rounded-full animate-pulse-glow" />
                <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-primary/10 blur-[130px] rounded-full" />
            </div>
        </div>
    );
}
