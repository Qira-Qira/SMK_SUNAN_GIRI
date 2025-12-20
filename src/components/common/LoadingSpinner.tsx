'use client';

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function LoadingSpinner({ className = '', size = 'md' }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    };

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <div className="relative flex items-center justify-center">
                {/* Outer Ring */}
                <div className={`absolute inset-0 rounded-full border-4 border-emerald-100 ${sizeClasses[size]}`}></div>

                {/* Spinning Ring */}
                <div className={`rounded-full border-4 border-emerald-500 border-t-transparent animate-spin ${sizeClasses[size]}`}></div>

                {/* Inner Pulse */}
                <div className={`absolute rounded-full bg-lime-400 animate-pulse ${size === 'sm' ? 'w-1.5 h-1.5' :
                        size === 'md' ? 'w-3 h-3' :
                            size === 'lg' ? 'w-5 h-5' : 'w-7 h-7'
                    }`}></div>
            </div>
        </div>
    );
}
