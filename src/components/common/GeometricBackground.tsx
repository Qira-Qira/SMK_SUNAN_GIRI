'use client';

export default function GeometricBackground() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-white">
            {/* Mesh Gradient 1 */}
            <div className="absolute top-0 left-[-10%] w-[500px] h-[500px] bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>

            {/* Mesh Gradient 2 */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-lime-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

            {/* Mesh Gradient 3 */}
            <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

            {/* Grid Overlay (Optional Subtle Texture) */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]"></div>
        </div>
    );
}
