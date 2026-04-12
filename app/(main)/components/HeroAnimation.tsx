"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { registerGSAP } from "@/lib/gsap-setup";

registerGSAP();

export function HeroAnimation({ children }: { children: React.ReactNode }) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();
    
    tl.from(".hero-element", {
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: "back.out(1.7)",
      stagger: 0.2
    });
  }, { scope: container });

  return (
    <div ref={container} className="flex flex-col items-center text-center gap-8">
      {children}
    </div>
  );
}
