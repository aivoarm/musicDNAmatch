"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

/**
 * /auth/complete
 * 
 * After WorkOS AuthKit verifies the user (Magic Auth), this page:
 * 1. Retrieves the authenticated user's email
 * 2. Links their guest DNA profile to the verified email
 * 3. Sets cookies and redirects to /profile
 */
export default function AuthCompletePage() {
    const { user, loading } = useAuth();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Verifying your identity...");

    useEffect(() => {
        if (loading) return;

        if (!user?.email) {
            setMessage("No authenticated session found.");
            setStatus("error");
            return;
        }

        const linkProfile = async () => {
            setMessage("Linking your DNA profile...");

            try {
                // Robust cookie extraction
                const cookies = document.cookie.split('; ').reduce((acc: any, curr) => {
                    const [key, value] = curr.split('=');
                    acc[key] = value;
                    return acc;
                }, {});

                const guestId = cookies['guest_id'];

                // 1. Standardize to UPPERCASE to match DNA engine and DB triggers
                const storageEmail = user.email!.trim().toUpperCase();

                console.log("link-profile request:", { authUserId: user.id, email: storageEmail, guestId });

                const res = await fetch("/api/auth/link-profile", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        authUserId: user.id,
                        email: storageEmail,
                        guestId: guestId,
                    }),
                });

                const data = await res.json() as any;

                console.log("link-profile response:", { status: res.status, ok: res.ok, data });

                if (!res.ok) throw new Error(data.error || "Failed to link identity");

                if (data.success) {
                    // Only update guest_id cookie if the server returned one
                    if (data.guestId) {
                        document.cookie = `guest_id=${data.guestId};max-age=31536000;path=/;SameSite=Lax`;
                        document.cookie = `has_dna=true;max-age=31536000;path=/;SameSite=Lax`;
                    }

                    // Always store normalized email for UI persistence
                    document.cookie = `auth_email=${storageEmail};max-age=31536000;path=/;SameSite=Lax`;

                    setMessage("Identity verified! Redirecting...");
                    setStatus("success");

                    setTimeout(() => {
                        window.location.href = "/profile?auth=success";
                    }, 1000);

                    return;
                }

                throw new Error(data.error || "Link failed — no success from server");

            } catch (err: any) {
                console.error("Link profile error:", err);
                setMessage(`Link Error: ${err.message}`);
                setStatus("error");
            }
        };

        linkProfile();
    }, [user, loading]);

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