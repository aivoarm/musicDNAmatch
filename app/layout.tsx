import type { Metadata, Viewport } from "next";
import { Syne, DM_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import { AuthKitProvider } from "@workos-inc/authkit-nextjs/components";


const syne = Syne({
    subsets: ["latin"],
    variable: "--font-syne",
    display: "swap",
});

const dmMono = DM_Mono({
    subsets: ["latin"],
    weight: ["300", "400", "500"],
    variable: "--font-mono",
    display: "swap",
});

export const metadata: Metadata = {
    title: {
        default: "musicDNAmatch — Discover Your Musical DNA",
        template: "%s | musicDNAmatch",
    },
    description:
        "Analyse your Spotify playlists and YouTube songs to build a 12-dimensional Musical DNA fingerprint. Find listeners who hear the world the same way.",
    keywords: [
        "music DNA", "musical fingerprint", "Spotify analysis", "music taste",
        "soulmate matching", "sonic profile", "music personality",
    ],
    authors: [{ name: "musicDNAmatch" }],
    creator: "musicDNAmatch",
    openGraph: {
        type: "website",
        siteName: "musicDNAmatch",
        title: "musicDNAmatch — Discover Your Musical DNA",
        description:
            "Build your 12-dimensional Musical DNA fingerprint and find your sonic soulmates.",
        images: ["/icon.png"],
    },
    twitter: {
        card: "summary_large_image",
        title: "musicDNAmatch",
        description: "Discover your Musical DNA and find your sonic soulmates.",
        images: ["/icon.png"],
    },
    robots: { index: true, follow: true },
    icons: { icon: "/icon" },
};

export const viewport: Viewport = {
    themeColor: "#080808",
    width: "device-width",
    initialScale: 1,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`dark ${syne.variable} ${dmMono.variable}`}>
            <body className="bg-[#080808] text-white antialiased min-h-screen overflow-x-hidden">
                <AuthKitProvider>
                    <Navbar />
                    {children}
                    <Footer />
                    <CookieConsent />
                </AuthKitProvider>
            </body>

        </html>
    );
}
