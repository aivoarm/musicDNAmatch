"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

/**
 * /auth/callback
 * 
 * Client-side handler for Supabase auth redirects when tokens
 * arrive as URL hash fragments (#access_token=...).
 * Extracts the session, links the profile, and redirects.
 */
export default function AuthCallback() {
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Verifying your identity...");

    useEffect(() => {
        const handleAuth = async () => {
            try {
                // Supabase client automatically picks up hash fragments
                const { data: { session }, error } = await supabaseBrowser.auth.getSession();

                if (error || !session) {
                    // Try exchanging code if present in URL
                    const params = new URLSearchParams(window.location.search);
                    const code = params.get("code");

                    if (code) {
                        const { error: exchangeError } = await supabaseBrowser.auth.exchangeCodeForSession(code);
                        if (exchangeError) {
                            throw exchangeError;
                        }
                        // Re-fetch session after exchange
                        const { data: { session: newSession } } = await supabaseBrowser.auth.getSession();
                        if (newSession?.user?.email) {
                            await linkProfile(newSession.user.id, newSession.user.email);
                            return;
                        }
                    }

                    setMessage("Link expired or invalid. Try again from the profile page.");
                    setStatus("error");
                    return;
                }

                if (session.user?.email) {
                    await linkProfile(session.user.id, session.user.email);
                }
            } catch (err: any) {
                console.error("Auth callback error:", err);
                setMessage(err.message || "Authentication failed");
                setStatus("error");
            }
        };

        const linkProfile = async (authUserId: string, email: string) => {
            try {
                // Call our API to link the guest profile to the auth user
                const res = await fetch("/api/auth/link-profile", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ authUserId, email }),
                });
                const data = await res.json();

                if (data.success && data.guestId) {
                    // Set the guest_id cookie to match the linked profile
                    document.cookie = `guest_id=${data.guestId};max-age=31536000;path=/`;
                    document.cookie = `has_dna=true;max-age=31536000;path=/`;
                    document.cookie = `auth_email=${email.toLowerCase()};max-age=31536000;path=/`;
                }

                setMessage("Identity verified! Redirecting to your profile...");
                setStatus("success");

                setTimeout(() => {
                    window.location.href = "/profile?auth=success";
                }, 1500);
            } catch (err: any) {
                console.error("Link profile error:", err);
                // Still redirect — the profile might not exist yet
                setMessage("Verified! Setting up your signal...");
                setStatus("success");
                document.cookie = `auth_email=${email.toLowerCase()};max-age=31536000;path=/`;

                setTimeout(() => {
                    window.location.href = "/?auth=verified&email=" + encodeURIComponent(email);
                }, 1500);
            }
        };

        handleAuth();
    }, []);

    return (
        <div className="min-h-screen bg-[#080808] flex items-center justify-center">
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
                    <button
                        onClick={() => window.location.href = "/"}
                        className="mt-8 bg-white/10 border border-white/20 text-white/80 px-6 py-3 rounded-xl mono text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all"
                    >
                        Return Home
                    </button>
                )}
            </div>
        </div>
    );
}
