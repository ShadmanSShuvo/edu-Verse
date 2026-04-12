"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { registerGSAP } from "@/lib/gsap-setup";

registerGSAP();

export function AnimatedStatCard({
    icon,
    label,
    value,
    sub,
    color,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    sub?: string;
    color: string;
}) {
    const cardRef = useRef<HTMLDivElement>(null);
    const valueRef = useRef<HTMLSpanElement>(null);

    useGSAP(() => {
        // Only attempt to animate if the value is a number or numeric string (like "85%")
        let numValue = 0;
        let suffix = "";
        
        if (typeof value === "number") {
            numValue = value;
        } else if (typeof value === "string") {
            const parsed = parseFloat(value);
            if (!isNaN(parsed)) {
                numValue = parsed;
                suffix = value.replace(/[0-9.]/g, ''); // keep any non-numeric chars like '%'
            }
        }

        if (numValue > 0 && valueRef.current) {
            const obj = { val: 0 };
            gsap.to(obj, {
                val: numValue,
                duration: 2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: cardRef.current,
                    start: "top 90%",
                    once: true
                },
                onUpdate: () => {
                    if (valueRef.current) {
                        // format to 1 decimal place if it was a float originally, else int
                        const formatted = Number.isInteger(numValue) 
                            ? Math.round(obj.val) 
                            : obj.val.toFixed(1);
                        valueRef.current.innerText = formatted + suffix;
                    }
                }
            });
        }
    }, { scope: cardRef });

    return (
        <div ref={cardRef} className="group relative overflow-hidden rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
            <div className={`absolute right-0 top-0 h-24 w-24 translate-x-12 -translate-y-12 rounded-full opacity-10 transition-transform group-hover:scale-150 ${color}`} />
            <div className="relative p-6">
                <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-opacity-10 text-opacity-100 ${color}`}>
                    {icon}
                </div>
                <div className="flex flex-col">
                    <span ref={valueRef} className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {value === "—" ? "—" : "0"}
                    </span>
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">
                        {label}
                    </span>
                    {sub && (
                        <span className={`mt-3 self-start rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-opacity-10 border border-opacity-20 ${color}`}>
                            {sub}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
