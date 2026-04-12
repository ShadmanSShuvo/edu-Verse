"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { registerGSAP } from "@/lib/gsap-setup";

registerGSAP();

export function AnimatedModuleList({ children }: { children: React.ReactNode }) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const cards = gsap.utils.toArray(".module-card");
        cards.forEach((card: any) => {
            gsap.fromTo(card,
                { opacity: 0, scale: 0.95 },
                {
                    opacity: 1, 
                    scale: 1,
                    duration: 1.6,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: card,
                        start: "top 85%",
                        toggleActions: "play none none none"
                    }
                }
            );
        });
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="flex flex-col gap-3">
            {children}
        </div>
    );
}
