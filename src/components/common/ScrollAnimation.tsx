'use client';

import { useEffect, useRef, useState } from 'react';

interface ScrollAnimationProps {
    children: React.ReactNode;
    className?: string;
    animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in' | 'fade-in';
    duration?: number;
    delay?: number;
    threshold?: number;
    triggerOnce?: boolean;
}

export default function ScrollAnimation({
    children,
    className = '',
    animation = 'fade-up',
    duration = 800,
    delay = 0,
    threshold = 0.1,
    triggerOnce = true,
}: ScrollAnimationProps) {
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        if (triggerOnce && domRef.current) {
                            observer.unobserve(domRef.current);
                        }
                    } else if (!triggerOnce) {
                        setIsVisible(false);
                    }
                });
            },
            { threshold }
        );

        const currentRef = domRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [triggerOnce, threshold]);

    const getAnimationClasses = () => {
        // Base transition classes
        let classes = `transition-all ease-out`;

        // Duration
        // We'll use style for precise duration/delay, but can map some to tailwind if needed.
        // CSS variables or inline styles work best for dynamic duration/delay.

        // Transform states
        if (!isVisible) {
            switch (animation) {
                case 'fade-up':
                    return `${classes} opacity-0 translate-y-10`;
                case 'fade-down':
                    return `${classes} opacity-0 -translate-y-10`;
                case 'fade-left':
                    return `${classes} opacity-0 translate-x-10`;
                case 'fade-right':
                    return `${classes} opacity-0 -translate-x-10`;
                case 'zoom-in':
                    return `${classes} opacity-0 scale-95`;
                case 'fade-in':
                    return `${classes} opacity-0`;
                default:
                    return `${classes} opacity-0 translate-y-10`;
            }
        }

        // Visible state
        return `${classes} opacity-100 translate-y-0 translate-x-0 scale-100`;
    };

    return (
        <div
            ref={domRef}
            className={`${getAnimationClasses()} ${className}`}
            style={{
                transitionDuration: `${duration}ms`,
                transitionDelay: `${delay}ms`,
            }}
        >
            {children}
        </div>
    );
}
