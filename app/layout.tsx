import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Music DNA | Vibe Broadcasting",
    description: "AI-orchestrated musical geometry from your YouTube signal.",
    icons: {
        icon: "/icon",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className={outfit.className}>
                <div className="relative min-h-screen">
                    <Navbar />
                    <main>{children}</main>
                </div>
            </body>
        </html>
    );
}
