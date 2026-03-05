"use client";

import Link from "next/link";
import { ArrowLeft, Scale, FileText, Globe, Zap, ShieldAlert, UserCheck, User, Users } from "lucide-react";

export default function TermsConditions() {
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
                    <Scale className="h-3 w-3" /> Universal Protocol Agreement
                </div>
                <h1 className="text-5xl sm:text-6xl font-black tracking-tighter mb-4">
                    Terms of <span className="text-[#FF0000] italic">Service</span>
                </h1>
                <p className="text-white/40 font-mono text-sm uppercase tracking-widest">Version 1.0.0 / Effective: March 2, 2026</p>
            </header>

            <div className="space-y-12 leading-relaxed text-white/70">
                <section className="glass rounded-[2rem] p-8 border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                        <FileText className="h-20 w-20" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                        <Globe className="h-5 w-5 text-[#FF0000]" /> 1. Acceptance of Protocol
                    </h2>
                    <p>
                        By accessing the MusicDNA platform ("the Service"), you agree to be bound by these Terms of Service. If you do not agree with any part of these protocols, you are prohibited from broadcasting your signal or utilizing node-matching features.
                    </p>
                </section>

                <section className="space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <Zap className="h-5 w-5 text-[#FF0000]" /> 2. Signal Integrity
                    </h2>
                    <p>
                        Our Service processes public Spotify playlists and YouTube videos to calculate your musical DNA. You agree that:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>You will only provide links to public playlists and videos you have the right to share.</li>
                        <li>You will not use automated scripts to forge musical signals.</li>
                        <li>You are responsible for maintaining the security of your node session.</li>
                        <li>The Service is provided "as is" – we compute vectors based on raw signal input.</li>
                    </ul>
                </section>

                <section className="space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <ShieldAlert className="h-5 w-5 text-[#FF0000]" /> 3. Limitation of Resonance
                    </h2>
                    <p>
                        In no event shall MusicDNA or its operators be liable for any sonic discrepancies, missed matches, or data anomalies arising from your use of the Service. We provide the computational lattice; you provide the signal.
                    </p>
                </section>

                <section className="glass rounded-[2rem] p-8 border-white/5 bg-[#FF0000]/5">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                        <UserCheck className="h-5 w-5 text-[#FF0000]" /> 4. Termination of Node
                    </h2>
                    <p className="mb-6">
                        We reserve the right to terminate or suspend access to your node immediately, without prior notice, for any conduct that we consider to be in violation of these protocols or harmful to the global signal pool.
                    </p>
                </section>

                <footer className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <span className="font-mono text-[10px] text-white/50 tracking-widest">© 2026 Arman Ayva. <a href="https://www.armanayva.com" target="_blank" className="hover:text-white transition-colors">www.armanayva.com</a></span>
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
                <div className="absolute top-[15%] right-[10%] w-[500px] h-[500px] bg-[#FF0000]/10 blur-[150px] rounded-full animate-float" />
                <div className="absolute bottom-[20%] left-[5%] w-[400px] h-[400px] bg-primary/10 blur-[130px] rounded-full" />
            </div>
        </div>
    );
}
