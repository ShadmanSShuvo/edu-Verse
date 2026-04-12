"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { registerGSAP } from "@/lib/gsap-setup";

// Register early to ensure ScrollTrigger is ready
registerGSAP();

type Direction = "top" | "bottom" | "left" | "right";

interface ScrollRevealProps {
    children: React.ReactNode;
    delay?: number;
    direction?: Direction;
    className?: string;
}

export function ScrollReveal({ children, delay = 0, direction = "bottom", className = "" }: ScrollRevealProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!containerRef.current) return;

        // Set initial coordinates based on direction
        let x = 0;
        let y = 0;
        
        switch (direction) {
            case "top": y = -50; break;
            case "bottom": y = 50; break;
            case "left": x = -50; break;
            case "right": x = 50; break;
        }

        // Initially hide with autoAlpha which handles both opacity and visibility
        gsap.set(containerRef.current, { 
            autoAlpha: 0, 
            x, 
            y 
        });

        // Animate into view
        gsap.to(containerRef.current, {
            autoAlpha: 1,
            x: 0,
            y: 0,
            duration: 1.0,
            delay: delay,
            ease: "back.out(1.7)",
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 95%",
                once: true,
            }
        });
    }, { scope: containerRef, dependencies: [delay, direction] });

    // Refresh scroll triggers when the component mounts or dependencies change
    useEffect(() => {
        // Debounced refresh for better performance
        const timer = setTimeout(() => ScrollTrigger.refresh(), 200);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div ref={containerRef} className={className}>
            {children}
        </div>
    );
}
