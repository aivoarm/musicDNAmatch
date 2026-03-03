import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "DNA Bridge",
    description: "Connect and chat with your musical soulmate through a shared DNA Bridge.",
    openGraph: {
        title: "DNA Bridge | musicDNAmatch",
        description: "Your private bridge for sharing music with your sonic match.",
    },
};

export default function BridgeLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
