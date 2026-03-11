"use client";
import React from "react";
import { motion } from "framer-motion";
import { Search, Loader2, ArrowRight, AlertCircle } from "lucide-react";

interface EmailCaptureProps {
    email: string;
    setEmail: React.Dispatch<React.SetStateAction<string>>;
    handleEmailVerify: (isWorkosLogin?: boolean) => void;
    checkingEmail: boolean;
    emailVerifyError: string | null;
    clash: any;
    handleFinalSubmit: (overwrite: boolean) => void;
    handleResumeExisting: () => void;
    setClash: React.Dispatch<React.SetStateAction<any>>;
    onRestore: () => void;
}

export default function StageEmailCapture({
    email, setEmail, handleEmailVerify, checkingEmail, emailVerifyError, clash,
    handleFinalSubmit, handleResumeExisting, setClash, onRestore
}: EmailCaptureProps) {
    return (
        <motion.div key="ec" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            className="text-center max-w-lg mx-auto pb-20">

            {!clash ? (
                <>
                    <div className="h-20 w-20 rounded-[2rem] bg-[#FF0000]/10 flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(255,0,0,0.1)]">
                        <Search className="h-10 w-10 text-[#FF0000]" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter mb-4">Secure your Signal</h2>
                    <p className="text-white/80 mono text-[9px] uppercase tracking-[0.4em] mb-12">
                        Verify your email to permanently link your DNA and find soulmates.
                    </p>

                    <div className="flex flex-col gap-4">
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleEmailVerify()}
                            placeholder="your@email.com"
                            autoFocus
                            className="w-full bg-white/10 border border-white/25 rounded-2xl py-6 px-8 focus:outline-none focus:border-[#FF0000]/60 transition-all text-center text-2xl font-bold text-white placeholder:text-white/40"
                        />
                        {emailVerifyError && (
                            <p className="text-red-400 mono text-[10px] uppercase tracking-widest">{emailVerifyError}</p>
                        )}
                        <button
                            onClick={() => handleEmailVerify()}
                            disabled={checkingEmail || !email.trim() || !email.includes("@")}
                            className="w-full sm:w-auto px-16 flex items-center justify-center gap-3 bg-[#FF0000] text-white py-6 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:scale-100 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(255,0,0,0.3)] mt-2"
                        >
                            {checkingEmail ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify & Secure"} <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </>
            ) : (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass p-10 rounded-[3rem] border border-[#FF0000]/30 bg-[#FF0000]/5 backdrop-blur-3xl shadow-[0_0_120px_rgba(255,0,0,0.2)]">
                    <div className="h-20 w-20 rounded-full bg-[#FF0000]/20 flex items-center justify-center mx-auto mb-8">
                        <AlertCircle className="h-10 w-10 text-[#FF0000]" />
                    </div>
                    <h3 className="text-3xl font-black text-white italic mb-3">
                        {clash.source === "workos" ? "Account Found" : "Found your match!"}
                    </h3>
                    <p className="text-white/80 text-sm mb-10 leading-relaxed font-bold">
                        {clash.source === "workos" ? (
                            <>The email <span className="font-bold text-[#FF0000]">{email}</span> is already registered with WorkOS. Proceed to login & link your DNA?</>
                        ) : (
                            <>Found your existing DNA profile linked to <span className="font-bold text-[#FF0000]">{email}</span>. Would you like to log in to it, or overwrite it with this new analysis?</>
                        )}
                    </p>

                    <div className="flex flex-col gap-3">
                        {clash.source === "workos" ? (
                            <button
                                onClick={() => handleEmailVerify(true)}
                                className="w-full bg-[#FF0000] text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_40px_rgba(255,0,0,0.3)]"
                            >
                                Proceed to Login
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => handleFinalSubmit(true)}
                                    className="w-full bg-[#FF0000] text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_40px_rgba(255,0,0,0.3)]"
                                >
                                    Yes, Overwrite
                                </button>
                                <button
                                    onClick={handleResumeExisting}
                                    className="w-full bg-white text-black py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Login to Profile
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => { setClash(null); setEmail(""); }}
                            className="w-full bg-white/5 border border-white/10 text-white/50 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all hover:text-white"
                        >
                            Cancel
                        </button>
                    </div>
                </motion.div>
            )}

            <div className="flex justify-center mt-12">
                <button onClick={onRestore} className="mono text-[10px] text-white/80 hover:text-white transition-all uppercase tracking-[0.3em]">← Restore View</button>
            </div>
        </motion.div>
    );
}
