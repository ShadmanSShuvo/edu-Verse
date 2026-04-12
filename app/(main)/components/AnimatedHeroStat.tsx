"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

export function AnimatedHeroStat({ value, label, icon }: { value: string, label: string, icon: React.ReactNode }) {
    const valueRef = useRef<HTMLSpanElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!valueRef.current) return;

        const text = String(value);

        // Extract the first number in the string (handles "12.4K+", "94%", "4.9/5", "42", etc.)
        const numMatch = text.match(/([\d]+(?:\.[\d]+)?)/);
        if (!numMatch) {
            // No number found — just display as-is
            valueRef.current.innerText = text;
            return;
        }

        const numValue = parseFloat(numMatch[1]);
        const isDecimal = numValue !== Math.floor(numValue);

        if (!isNaN(numValue) && numValue > 0) {
            const obj = { val: 0 };

            gsap.to(obj, {
                val: numValue,
                duration: 2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 95%",
                    once: true,
                },
                onUpdate: () => {
                    if (valueRef.current) {
                        // During animation, show the animated number with the same suffix
                        const animated = isDecimal ? obj.val.toFixed(1) : Math.round(obj.val);
                        // Replace the first number in the string with the animated value
                        valueRef.current.innerText = text.replace(numMatch[1], String(animated));
                    }
                },
                onComplete: () => {
                    // Always land on the exact original string
                    if (valueRef.current) valueRef.current.innerText = text;
                },
            });
        } else {
            valueRef.current.innerText = text;
        }
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="flex flex-col items-center gap-1 text-center">
            <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400">
                {icon}
            </div>
            <span ref={valueRef} className="text-3xl font-extrabold text-gray-900 dark:text-white">
                {value === "—" ? "—" : "0"}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
        </div>
    );
}
