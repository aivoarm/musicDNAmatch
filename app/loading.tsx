export default function Loading() {
    return (
        <div className="relative min-h-screen bg-[#080808] flex items-center justify-center">
            <div className="text-center">
                <div className="relative h-20 w-20 mx-auto mb-8">
                    <div className="absolute inset-0 rounded-full border-4 border-[#FF0000]/10" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-[#FF0000] border-transparent animate-spin" />
                    <div className="absolute inset-3 rounded-full border-2 border-r-[#FF0000]/35 border-transparent animate-spin [animation-direction:reverse] [animation-duration:1.5s]" />
                </div>
                <p className="font-mono text-[10px] text-white/50 uppercase tracking-[0.4em]">Loading Signal…</p>
            </div>
        </div>
    );
}
