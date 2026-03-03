import Link from "next/link";
import { ArrowLeft, Scale, FileText, Globe, Zap, ShieldAlert, UserCheck } from "lucide-react";

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
                        Our Service utilizes Google OAuth to synchronize with your YouTube musical activities. You agree that:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
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

                <footer className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-white/30 uppercase tracking-[0.2em] font-black">
                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-center md:text-left">
                        <p>© 2026 ARMAN AYVA. ALL RIGHTS RESERVED.</p>
                        <a href="https://www.armanayva.com" className="hover:text-white transition-colors">WWW.ARMANAYVA.COM</a>
                    </div>
                    <div className="flex gap-8">
                        <a href="https://dna.armanayva.com/privacy" className="hover:text-white transition-colors">
                            PRIVACY POLICY
                        </a>
                        <a href="https://dna.armanayva.com/terms" className="hover:text-white transition-colors">
                            TERMS & CONDITIONS
                        </a>
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
