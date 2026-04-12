"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { registerGSAP } from "@/lib/gsap-setup";

registerGSAP();

interface HeroRevealProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Wraps hero/header sections and runs a staggered slide-up + fade-in on mount.
 * Uses GSAP's `useGSAP` for safe scoped cleanup — no SSR mismatches.
 */
export function HeroReveal({ children, className = "" }: HeroRevealProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!containerRef.current) return;

        // Animate direct children in a staggered sequence
        gsap.fromTo(
            containerRef.current.children,
            { y: 40, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.7,
                ease: "back.out(1.7)",
                stagger: 0.12,
                clearProps: "transform",
            }
        );
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className={className}>
            {children}
        </div>
    );
}
