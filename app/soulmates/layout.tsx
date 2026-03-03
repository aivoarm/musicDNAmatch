import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Find Your Musical Soulmates",
    description: "Discover listeners whose Musical DNA aligns with yours — convergent, resonant, and divergent sonic connections.",
    openGraph: {
        title: "Find Musical Soulmates | musicDNAmatch",
        description: "Connect with listeners who hear the world the same way.",
    },
};

export default function SoulmatesLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
