import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function Loading() {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center">
            <LoadingSpinner size="xl" />
            <p className="mt-4 text-emerald-800 font-semibold animate-pulse">Memuat...</p>
        </div>
    );
}
