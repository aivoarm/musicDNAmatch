import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Music DNA Match | Vibe Broadcasting",
    description: "Community-driven, AI-orchestrated music discovery platform.",
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
