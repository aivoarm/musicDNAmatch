import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Find Your Musical Soulmates",
    description: "Discover listeners whose 12-dimensional Musical DNA aligns with yours via cosine similarity matching.",
    openGraph: {
        title: "Musical Soulmates | musicDNAmatch",
        description: "Find your sonic soulmates through DNA vector matching.",
    },
};

export default function MatchLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
