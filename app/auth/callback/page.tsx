"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

/**
 * /auth/callback
 * 
 * Client-side handler for Supabase Magic Link redirects.
 * Supabase redirects here with tokens in the URL hash fragment
 * (#access_token=...&refresh_token=...) or as a ?code= query param.
 * 
 * This page:
 * 1. Creates a fresh Supabase client to detect the auth session
 * 2. Links the guest DNA profile to the verified auth user
 * 3. Sets cookies and redirects to /profile
 */
export default function AuthCallback() {
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Verifying your identity...");

    useEffect(() => {
        // Create a fresh client that will pick up the hash fragment
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                auth: {
                    detectSessionInUrl: true,
                    flowType: "implicit",
                },
            }
        );

        const handleAuth = async () => {
            try {
                // Step 1: Try to get session from hash fragments
                // The Supabase client automatically parses #access_token=... from the URL
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (session?.user?.email) {
                    await linkProfile(session.user.id, session.user.email);
                    return;
                }

                // Step 2: Try ?code= exchange (PKCE flow)
                const params = new URLSearchParams(window.location.search);
                const code = params.get("code");

                if (code) {
                    setMessage("Exchanging authorization code...");
                    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

                    if (exchangeError) {
                        console.error("Code exchange error:", exchangeError);
                        throw exchangeError;
                    }

                    if (data.session?.user?.email) {
                        await linkProfile(data.session.user.id, data.session.user.email);
                        return;
                    }
                }

                // Step 3: Try ?token_hash= (legacy token verification)
                const tokenHash = params.get("token_hash");
                const type = params.get("type") || "magiclink";

                if (tokenHash) {
                    setMessage("Verifying token...");
                    const { data, error: verifyError } = await supabase.auth.verifyOtp({
                        token_hash: tokenHash,
                        type: type as any,
                    });

                    if (verifyError) {
                        console.error("Token verify error:", verifyError);
                        throw verifyError;
                    }

                    if (data.user?.email) {
                        await linkProfile(data.user.id, data.user.email);
                        return;
                    }
                }

                // Step 4: Listen for auth state change (Supabase may fire this async)
                setMessage("Waiting for session...");

                const timeout = setTimeout(() => {
                    setMessage("Link expired or invalid. Try again from the profile page.");
                    setStatus("error");
                }, 8000);

                const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
                    if (event === "SIGNED_IN" && newSession?.user?.email) {
                        clearTimeout(timeout);
                        subscription.unsubscribe();
                        await linkProfile(newSession.user.id, newSession.user.email);
                    }
                });

            } catch (err: any) {
                console.error("Auth callback error:", err);
                setMessage(err.message || "Authentication failed. The link may have expired.");
                setStatus("error");
            }
        };

        const linkProfile = async (authUserId: string, email: string) => {
            setMessage("Linking your DNA profile...");

            try {
                const res = await fetch("/api/auth/link-profile", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ authUserId, email }),
                });
                const data = await res.json();

                if (data.success && data.guestId) {
                    document.cookie = `guest_id=${data.guestId};max-age=31536000;path=/`;
                    document.cookie = `has_dna=true;max-age=31536000;path=/`;
                }

                // Always set auth_email cookie on successful verification
                document.cookie = `auth_email=${email.toLowerCase()};max-age=31536000;path=/`;

                setMessage("Identity verified! Redirecting to your profile...");
                setStatus("success");

                setTimeout(() => {
                    window.location.href = "/profile?auth=success";
                }, 1500);
            } catch (err: any) {
                console.error("Link profile error:", err);
                // Still set auth cookie and redirect — verification succeeded even if linking failed
                document.cookie = `auth_email=${email.toLowerCase()};max-age=31536000;path=/`;

                setMessage("Verified! Setting up your signal...");
                setStatus("success");

                setTimeout(() => {
                    window.location.href = "/?auth=verified&email=" + encodeURIComponent(email);
                }, 1500);
            }
        };

        // Small delay to let Supabase parse hash fragments
        setTimeout(handleAuth, 100);
    }, []);

    return (
        <div className="min-h-screen bg-[#080808] flex items-center justify-center">
            <style>{`
                *{font-family:var(--font-syne),'Syne',sans-serif}
                .mono{font-family:'DM Mono',monospace!important}
            `}</style>
            <div className="text-center max-w-md mx-auto px-6">
                <div className="mb-8">
                    {status === "loading" && (
                        <div className="h-20 w-20 rounded-[2rem] bg-[#FF0000]/10 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(255,0,0,0.1)]">
                            <Loader2 className="h-10 w-10 text-[#FF0000] animate-spin" />
                        </div>
                    )}
                    {status === "success" && (
                        <div className="h-20 w-20 rounded-[2rem] bg-green-500/10 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(34,197,94,0.1)]">
                            <CheckCircle2 className="h-10 w-10 text-green-500" />
                        </div>
                    )}
                    {status === "error" && (
                        <div className="h-20 w-20 rounded-[2rem] bg-red-500/10 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(239,68,68,0.1)]">
                            <AlertCircle className="h-10 w-10 text-red-400" />
                        </div>
                    )}
                </div>

                <h1 className="text-3xl font-black text-white italic tracking-tighter mb-3">
                    {status === "loading" && "Neural Handshake"}
                    {status === "success" && "Identity Verified"}
                    {status === "error" && "Link Failed"}
                </h1>

                <p className="mono text-[10px] text-white/60 uppercase tracking-[0.3em]">
                    {message}
                </p>

                {status === "error" && (
                    <div className="flex flex-col gap-3 mt-8 items-center">
                        <button
                            onClick={() => window.location.href = "/profile"}
                            className="bg-white/10 border border-white/20 text-white/80 px-6 py-3 rounded-xl mono text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all"
                        >
                            Go to Profile
                        </button>
                        <button
                            onClick={() => window.location.href = "/"}
                            className="text-white/40 mono text-[10px] uppercase tracking-widest hover:text-white transition-all"
                        >
                            Return Home
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
