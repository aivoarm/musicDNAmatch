"use client";

import { motion } from "framer-motion";
import { Radio, Heart, Activity, Music2, Search, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 },
    };

    return (
        <div className="flex flex-col items-center justify-center px-4 py-20 lg:py-40">
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="max-w-4xl text-center flex flex-col items-center"
            >
                <motion.div
                    variants={item}
                    className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary shadow-glow-primary"
                >
                    <Radio className="h-4 w-4 animate-pulse" />
                    <span>Vibe Broadcasting Active</span>
                </motion.div>

                <motion.h1
                    variants={item}
                    className="text-5xl md:text-8xl font-black tracking-tight mb-6 bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent"
                >
                    Music DNA <br /> <span className="text-primary italic">Match</span>
                </motion.h1>

                <motion.p
                    variants={item}
                    className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl balance"
                >
                    Shift from passive listening to active mathematical discovery.
                    Create your <span className="text-white font-semibold">Musical DNA Profile</span> and find your sonic soulmates.
                </motion.p>

                <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 mb-20">
                    <Link
                        href="/broadcast"
                        className="group relative flex items-center justify-center gap-2 bg-primary px-8 py-4 rounded-full font-bold text-primary-foreground transition-all hover:scale-105 active:scale-95 glow-primary"
                    >
                        Start Broadcasting
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link
                        href="/match"
                        className="glass flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold border-white/10 hover:bg-white/5 transition-all"
                    >
                        Match Vectors
                    </Link>
                </motion.div>

                <motion.div
                    variants={item}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-20"
                >
                    <FeatureCard
                        icon={<Activity className="h-8 w-8 text-primary" />}
                        title="Audio Analysis"
                        description="Spectral centroid, transient density, and harmonicity vectors derived from high-dim signal extraction."
                    />
                    <FeatureCard
                        icon={<Music2 className="h-8 w-8 text-primary" />}
                        title="Structural Geometry"
                        description="Measuring polyrhythmic complexity and intervalic tension for deeper structural matching."
                    />
                    <FeatureCard
                        icon={<Heart className="h-8 w-8 text-primary" />}
                        title="Sonic Soulmates"
                        description="Connect with users whose musical DNA overlaps within the high-dimensional Euclidean space."
                    />
                </motion.div>
            </motion.div>

            {/* Decorative Elements */}
            <div className="fixed top-1/4 left-1/4 -z-10 h-64 w-64 bg-primary/20 blur-[120px] rounded-full animate-float" />
            <div className="fixed bottom-1/4 right-1/4 -z-10 h-96 w-96 bg-secondary/10 blur-[150px] rounded-full animate-pulse-glow" />
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="glass p-8 rounded-3xl text-left border-white/5 hover:border-white/10 transition-colors group">
            <div className="mb-4 inline-flex p-3 rounded-2xl bg-white/5 group-hover:bg-primary/10 transition-colors">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>
    );
}
