"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Waves, Mail, User, MapPin, ArrowRight,
    Loader2, CheckCircle2, AlertCircle, X,
    Brain, ShieldCheck
} from "lucide-react";

interface OnboardingModalProps {
    isOpen: boolean;
    dnaResult: any; // Result from dry_run or state
    guestId: string;
    onSuccess: (profile: any) => void;
    onSkip: () => void;
}

export default function OnboardingModal({ isOpen, dnaResult, guestId, onSuccess, onSkip }: OnboardingModalProps) {
    const [name, setName] = useState("");
    const [city, setCity] = useState("");
    const [email, setEmail] = useState("");
    const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'valid' | 'taken' | 'invalid'>('idle');
    const [clashProfile, setClashProfile] = useState<any>(null);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Debounced email check
    useEffect(() => {
        if (!email || !email.includes("@")) {
            setEmailStatus('idle');
            return;
        }

        const timer = setTimeout(async () => {
            setEmailStatus('checking');
            try {
                const res = await fetch("/api/dna/profile/check-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: email.trim() }),
                });
                const data = await res.json() as any;

                if (data.taken) {
                    setEmailStatus('taken');
                    setClashProfile(data.clash);
                } else if (res.ok) {
                    setEmailStatus('valid');
                } else {
                    setEmailStatus('invalid');
                }
            } catch {
                setEmailStatus('idle');
            }
        }, 600);

        return () => clearTimeout(timer);
    }, [email]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (emailStatus === 'taken' || emailStatus === 'checking') return;

        setSubmitStatus('loading');
        setErrorMessage(null);

        try {
            // 1. SAVE TO SUPABASE (Full generate call)
            const payload = {
                ...dnaResult, // genes, audioFeatures, etc.
                displayName: name.trim(),
                email: email.trim(),
                city: city.trim(),
                dry_run: false
            };

            const res = await fetch("/api/dna/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json() as any;

            if (!res.ok) throw new Error(data.error || "Failed to secure profile");

            // 2. Persist pending link for callback page
            sessionStorage.setItem('dna_pending_link', JSON.stringify({
                profileId: data.profileId,
                guestId: guestId,
                email: email.trim().toUpperCase()
            }));

            setSubmitStatus('success');

            // 3. Trigger WorkOS Magic Auth
            setTimeout(() => {
                window.location.href = `/login?email=${encodeURIComponent(email.trim())}`;
            }, 1500);

        } catch (err: any) {
            console.error("Onboarding Submit Error:", err);
            setSubmitStatus('error');
            setErrorMessage(err.message || "Network error. Please try again.");
        }
    };

    const isFormValid = name.trim().length >= 2 && city.trim().length >= 2 && emailStatus === 'valid';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        onClick={onSkip}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="glass max-w-md w-full rounded-2xl p-8 md:p-10 relative z-10 border border-purple-500/20 shadow-2xl shadow-purple-900/40 bg-gray-900/95"
                    >
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="h-16 w-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 mx-auto border border-purple-500/20">
                                <Waves className="h-8 w-8 text-purple-400" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter uppercase mb-3">
                                {submitStatus === 'success' ? "Signal Secured" : "Secure your DNA"}
                            </h2>
                            <p className="text-white/60 text-[11px] font-bold leading-relaxed px-2 uppercase tracking-wider mono">
                                {submitStatus === 'success'
                                    ? "Neural handshake initiated. Check your inbox."
                                    : "Anonymous profiles are deleted after 24 hours. Secure your record to find soulmates."}
                            </p>
                        </div>

                        {submitStatus === 'success' ? (
                            <div className="text-center py-8">
                                <motion.div
                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6"
                                >
                                    <CheckCircle2 className="h-10 w-10 text-green-400" />
                                </motion.div>
                                <p className="text-white font-black text-sm uppercase tracking-widest mb-2">Redirecting to login...</p>
                                <p className="text-white/40 mono text-[9px] uppercase tracking-widest">Verifying identity via WorkOS</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Name Field */}
                                <div>
                                    <label className="mono text-[8px] text-purple-400 uppercase tracking-widest font-black block mb-2 ml-1">Display Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                                        <input
                                            type="text" required value={name} onChange={e => setName(e.target.value)}
                                            placeholder="e.g. Luna Waves"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-purple-500/40 transition-all font-bold text-sm text-white placeholder:text-white/20"
                                        />
                                    </div>
                                </div>

                                {/* City Field */}
                                <div>
                                    <label className="mono text-[8px] text-purple-400 uppercase tracking-widest font-black block mb-2 ml-1">Your City</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                                        <input
                                            type="text" required value={city} onChange={e => setCity(e.target.value)}
                                            placeholder="e.g. New York, NY"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-purple-500/40 transition-all font-bold text-sm text-white placeholder:text-white/20 uppercase"
                                        />
                                    </div>
                                </div>

                                {/* Email Field */}
                                <div>
                                    <label className="mono text-[8px] text-purple-400 uppercase tracking-widest font-black block mb-2 ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                                        <input
                                            type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            className={`w-full bg-white/5 border rounded-xl py-4 pl-12 pr-12 focus:outline-none transition-all font-bold text-sm text-white placeholder:text-white/20 ${emailStatus === 'invalid' ? 'border-red-500/50' :
                                                emailStatus === 'taken' ? 'border-amber-500/50' :
                                                    emailStatus === 'valid' ? 'border-green-500/50' : 'border-white/10'
                                                }`}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            {emailStatus === 'checking' && <Loader2 className="h-4 w-4 text-white/20 animate-spin" />}
                                            {emailStatus === 'valid' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                            {emailStatus === 'taken' && <AlertCircle className="h-4 w-4 text-amber-500" />}
                                            {emailStatus === 'invalid' && <X className="h-4 w-4 text-red-500" />}
                                        </div>
                                    </div>
                                    {emailStatus === 'taken' && (
                                        <p className="mt-2 text-[10px] text-amber-500 font-bold italic">
                                            This email belongs to an existing profile.{" "}
                                            <button
                                                type="button"
                                                onClick={() => window.location.href = `/login?email=${encodeURIComponent(email)}`}
                                                className="underline hover:text-white transition-colors"
                                            >
                                                Restore it instead →
                                            </button>
                                        </p>
                                    )}
                                </div>

                                {errorMessage && (
                                    <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-3">
                                        <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                                        <p className="text-[10px] text-red-400 font-bold italic">{errorMessage}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={!isFormValid || submitStatus === 'loading'}
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:opacity-90 active:scale-95 transition-all text-sm uppercase tracking-widest disabled:opacity-30 shadow-xl shadow-purple-900/20"
                                >
                                    {submitStatus === 'loading' ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Activate My Profile <ArrowRight className="h-5 w-5" /></>}
                                </button>

                                <button
                                    type="button"
                                    onClick={onSkip}
                                    className="w-full text-white/30 hover:text-white transition-all text-[9px] font-black uppercase tracking-[0.2em] py-2"
                                >
                                    Skip for now
                                </button>
                            </form>
                        )}

                        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-3 opacity-40">
                            <ShieldCheck className="h-3.5 w-3.5 text-white" />
                            <span className="mono text-[8px] uppercase tracking-widest text-white">Privacy Secured • Encrypted Transition</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
