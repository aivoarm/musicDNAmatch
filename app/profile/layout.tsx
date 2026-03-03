import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Your Musical DNA Profile",
    description: "View your 12-dimensional Musical DNA fingerprint — radar chart, axis breakdown, coherence index, and source tracks.",
    openGraph: {
        title: "My Musical DNA Profile | musicDNAmatch",
        description: "View my unique 12-dimensional sonic fingerprint.",
    },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
