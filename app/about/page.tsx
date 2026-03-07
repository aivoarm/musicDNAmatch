"use client";

import Link from "next/link";
import { ArrowLeft, Brain, Code2, Music2, Sparkles, Users, Activity, BarChart, Network, User } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-20 px-6 sm:px-10 max-w-4xl mx-auto">
            <Link
                href="/"
                className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground hover:text-white transition-colors mb-10 group"
            >
                <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                Back to Discovery
            </Link>

            <header className="mb-16 relative">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF0000]/10 border border-[#FF0000]/20 text-[#FF0000] text-[10px] font-black uppercase tracking-widest mb-6 relative z-10">
                    <Sparkles className="h-3 w-3" /> Project Vision & Science
                </div>
                <h1 className="text-5xl sm:text-7xl font-black tracking-tighter mb-6 relative z-10">
                    The <span className="text-[#FF0000] italic">Science</span> of Sound.
                </h1>
                <p className="text-xl sm:text-2xl text-white/85 font-semibold leading-relaxed max-w-2xl relative z-10">
                    We believe that the music we listen to isn't just a preference—it's a direct reflection of how our brains process emotion, rhythm, and life itself.
                </p>

                {/* Decorative background element */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-[#FF0000]/20 blur-[120px] rounded-full -z-0 pointer-events-none" />
            </header>

            <div className="space-y-16 leading-relaxed text-white/85 relative z-10">
                {/* Vision Section */}
                <section className="glass rounded-[2rem] p-8 sm:p-12 border border-white/10 bg-black/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                        <Users className="h-40 w-40" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 flex items-center gap-3 tracking-tight">
                        <Users className="h-6 w-6 text-[#FF0000]" /> 1. The Vision: Musical Soulmates
                    </h2>
                    <div className="space-y-4 text-base sm:text-lg">
                        <p>
                            Music has always been the ultimate unifier. Before language, there was rhythm. The frequencies we gravitate towards govern our physiological state and emotional baselines.
                        </p>
                        <p>
                            Our core thesis is simple: <strong className="text-white">People whose brains crave the same sonic architectures are fundamentally compatible.</strong> Whether for deep friendships, romantic relationships, or creative collaborations, shared musical DNA is one of the strongest predictors of resonance between two human beings.
                        </p>
                        <p>
                            MusicDNAmatch wasn't built to just analyze data; it was built to bridge the gap between isolated listeners, using quantitative measurements of art to bring people together.
                        </p>
                    </div>
                </section>

                {/* Science Section */}
                <section className="space-y-8">
                    <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3 tracking-tight">
                        <Activity className="h-6 w-6 text-[#FF0000]" /> 2. The 12-Dimensional Vector Space
                    </h2>
                    <p className="text-base sm:text-lg">
                        We map human musical taste into a mathematical space consisting of 12 distinct axes. When you provide public Spotify playlists and YouTube videos, our engine extracts the core metadata, genres, and audio features (such as acousticness, valence, danceability, tempo, and energy) of up to 50 tracks.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                        {/* Box 1 */}
                        <div className="glass p-8 rounded-3xl border border-white/20 bg-black/60 shadow-2xl">
                            <h3 className="text-[#FF0000] text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                <BarChart className="h-5 w-5" /> Feature Extraction
                            </h3>
                            <p className="text-base text-white/90 leading-relaxed font-medium">
                                Each track is broken down into numerical values representing its mood, pacing, and instrumentation. We aggregate these features to find the mean frequencies and distributions of your listening habits.
                            </p>
                        </div>
                        {/* Box 2 */}
                        <div className="glass p-8 rounded-3xl border border-white/20 bg-black/60 shadow-2xl">
                            <h3 className="text-[#FF0000] text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Network className="h-5 w-5" /> Semantic Genre Analysis
                            </h3>
                            <p className="text-base text-white/90 leading-relaxed font-medium">
                                We utilize natural language processing (NLP) to cluster the countless specific sub-genres associated with your tracks into broader, comparable categories across our global pool.
                            </p>
                        </div>
                    </div>

                    <p className="text-base sm:text-lg mt-6">
                        These inputs are then combined with your explicit genre selections to calculate a single, unified 12D array: your <strong className="text-white">Musical DNA Vector</strong>.
                    </p>
                </section>

                {/* Algorithm Section */}
                <section className="glass rounded-[2rem] p-8 sm:p-12 border border-white/10 bg-gradient-to-br from-[#FF0000]/15 to-black/40 relative overflow-hidden">
                    <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 flex items-center gap-3 tracking-tight">
                        <Code2 className="h-6 w-6 text-[#FF0000]" /> 3. Hybrid Neural Matching
                    </h2>
                    <div className="space-y-4 text-base sm:text-lg">
                        <p>
                            Once your node is established in the matrix, finding your "soulmates" becomes a geometry problem. We query the database for other active nodes and compute the <strong className="text-white">Cosine Similarity</strong> and <strong className="text-white">Euclidean Distance</strong> between your 12-dimensional vector and theirs.
                        </p>
                        <p>
                            Because the dimensions are normalized (ranging from 0.0 to 1.0), distance represents true structural discordance.
                        </p>
                        <p>
                            Beyond vector similarity, our engine performs a second pass to identify <strong className="text-white">Direct Overlaps</strong> — finding specific shared tracks and common artists in your listening histories to reveal immediate conversational starting points.
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4 text-sm sm:text-base mt-4 font-mono">
                            <li><span className="text-white">90%+ Similarity:</span> Deep Neural Resonance (True Soulmates)</li>
                            <li><span className="text-white">75%-89% Similarity:</span> Harmonic Alignment (Great Collaborators)</li>
                            <li><span className="text-white">&lt;70% Similarity:</span> Sonic Divergence (Opposite Tastes)</li>
                        </ul>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="space-y-8 mt-16 pt-16 border-t border-white/5">
                    <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3 tracking-tight">
                        <Brain className="h-6 w-6 text-[#FF0000]" /> Frequently Asked Questions
                    </h2>

                    <div className="space-y-6">
                        <div className="glass p-8 rounded-[2rem] border border-white/20 bg-black/60 shadow-xl">
                            <h3 className="text-xl font-black text-white mb-3">What is the "Coherence" percentage?</h3>
                            <p className="text-base text-white/90 leading-relaxed font-medium">
                                Coherence is a mathematical measurement of how consistent or "focused" your musical taste is across our 12 DNA dimensions. We calculate the Weighted Variance of your track data. <br /><br />
                                A <strong>High Coherence</strong> (e.g., 85%+) means you have a highly specialized sound profile with sharp preferences (you strongly love specific traits and strongly dislike others). A <strong>Low Coherence</strong> means your tastes are eclectic and spread out across many different styles.
                            </p>
                        </div>
                        <div className="glass p-8 rounded-[2rem] border border-white/20 bg-black/60 shadow-xl">
                            <h3 className="text-xl font-black text-white mb-3">How exactly does matching work?</h3>
                            <p className="text-base text-white/90 leading-relaxed font-medium">
                                Every profile in our database is assigned a 12-dimensional array. When you click "Find Soulmates", our engine runs a Cosine Similarity Search inside the database using pgvector. It compares your 12 points against everyone else's 12 points to find the profiles geographically closest to you in that mathematical multi-dimensional space.
                            </p>
                        </div>
                        <div className="glass p-8 rounded-[2rem] border border-white/20 bg-black/60 shadow-xl">
                            <h3 className="text-xl font-black text-white mb-3">What are the 12 Dimensions?</h3>
                            <p className="text-base text-white/90 leading-relaxed font-medium">
                                We don't just use "Rock" or "Pop" to match you. We use 12 distinct auditory axes ranging from <strong>Spectral Energy</strong> (intense soundscapes) and <strong>Rhythmic Drive</strong> (groove-forward music) to <strong>Melodic Warmth</strong> and <strong>Experimental Index</strong>. These dimensions capture exactly <em>why</em> you like the music you do.
                            </p>
                        </div>
                        <div className="glass p-8 rounded-[2rem] border border-white/20 bg-black/60 shadow-xl">
                            <h3 className="text-xl font-black text-white mb-3">What is "Direct Overlap Matching"?</h3>
                            <p className="text-base text-white/90 leading-relaxed font-medium">
                                While vector matching handles "vibes," direct overlap matching handles "facts." After we find someone with a similar DNA signature, we cross-reference your normalized track titles and artist names. This highlights specific common ground, like when two soulmates both have the same rare Tame Impala b-side or share a specific niche Jazz artist in their top 50 tracks.
                            </p>
                        </div>
                    </div>
                </section>

                <footer className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <span className="font-mono text-[10px] text-white/50 tracking-widest">© 2026 Arman Ayva. <a href="https://www.armanayva.com" target="_blank" className="hover:text-white transition-colors">www.armanayva.com</a></span>
                    <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                        <Link href="/about" className="font-mono text-[10px] text-white/45 hover:text-white/70 uppercase tracking-widest transition-colors">About</Link>
                        <Link href="/profile" className="font-mono text-[10px] text-white/55 hover:text-white/60 uppercase tracking-widest transition-colors flex items-center gap-1.5"><User className="h-3 w-3" />Profile</Link>
                        <Link href="/soulmates" onClick={() => {
                            fetch('/api/dna/intent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ intent: 'find_soulmates' }) }).catch(console.error);
                        }} className="font-mono text-[10px] text-white/55 hover:text-white/60 uppercase tracking-widest transition-colors flex items-center gap-1.5"><Users className="h-3 w-3" />Find Soulmates</Link>
                        <Link href="/privacy" className="font-mono text-[10px] text-white/45 hover:text-white/70 uppercase tracking-widest transition-colors">Privacy</Link>
                    </div>
                </footer>
            </div>

            {/* Ambient Backgrounds */}
            <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden opacity-30">
                <div className="absolute top-[30%] right-[10%] w-[600px] h-[600px] bg-[#FF0000]/5 blur-[150px] rounded-full animate-float" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#FF0000]/10 blur-[150px] rounded-full animate-pulse-glow" />
            </div>
        </div>
    );
}
