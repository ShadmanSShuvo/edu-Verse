"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Calendar, ChevronRight, PlayCircle, Eye } from "lucide-react";
import { TakaSymbol } from "@/components/taka-symbol";
import { 
  AnimationDurations, 
  AnimationEasing,
  ScrollTriggerConfig,
  HoverCardElevation,
  HoverCardReset,
  OverlaySlideIn,
  OverlaySlideOut,
} from "@/lib/animation-patterns";

// Helper components copied locally
function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function ProgressBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, Math.round(value)));
  const colorClass =
    pct >= 100
      ? "bg-emerald-500"
      : pct >= 60
      ? "bg-blue-500"
      : pct >= 30
      ? "bg-cyan-500"
      : "bg-blue-400";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs font-medium">
        <span className="text-gray-500 dark:text-gray-400">Progress</span>
        <span
          className={`font-semibold ${
            pct >= 100 ? "text-emerald-600" : "text-blue-600"
          }`}
        >
          {pct}% complete
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-slate-700/60">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function PriceBadge({ price }: { price: number }) {
  if (!price || price === 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
        Free
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
      <TakaSymbol />{price.toLocaleString()}
    </span>
  );
}

export function AnimatedEnrolledCourseCard({ enrollment }: { enrollment: any }) {
    const cardRef = useRef<HTMLElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    const { contextSafe } = useGSAP({ scope: cardRef }, []);

    // Set initial state - scroll reveal entrance
    useGSAP(() => {
        if (!cardRef.current) return;

        gsap.fromTo(
            cardRef.current,
            { opacity: 0, scale: 0.95 },
            {
                opacity: 1,
                scale: 1,
                duration: AnimationDurations.cardEnter,
                ease: AnimationEasing.interaction,
                scrollTrigger: {
                    trigger: cardRef.current,
                    start: ScrollTriggerConfig.grid.start,
                    once: true,
                },
            }
        );
    }, { scope: cardRef });

    const handleMouseEnter = contextSafe(() => {
        gsap.to(overlayRef.current, {
            ...OverlaySlideIn,
        });
        gsap.to(cardRef.current, {
            ...HoverCardElevation,
        });
    });

    const handleMouseLeave = contextSafe(() => {
        gsap.to(overlayRef.current, {
            ...OverlaySlideOut,
        });
        gsap.to(cardRef.current, {
            ...HoverCardReset,
        });
    });

    return (
        <article 
            ref={cardRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 dark:border-white/10 dark:bg-slate-900/40"
        >
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 z-10" />

            <div className="flex flex-1 flex-col p-5 relative z-0">
                {/* Header row: price badge + enrolled date */}
                <div className="mb-3 flex items-center justify-between gap-2">
                    <PriceBadge price={enrollment.price} />
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="h-3 w-3" />
                        Enrolled {formatDate(enrollment.enrolled_at)}
                    </span>
                </div>

                {/* Title */}
                <h2 className="mb-1.5 font-bold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors">
                    {enrollment.title}
                </h2>

                {/* Description */}
                {enrollment.description && (
                    <p className="mb-4 line-clamp-2 flex-1 text-sm text-gray-500 leading-relaxed">
                        {enrollment.description}
                    </p>
                )}

                {/* Progress bar */}
                <div className="mb-4">
                    <ProgressBar value={enrollment.progress} />
                </div>
            </div>

            {/* Hover overlay with options */}
            <div 
                ref={overlayRef} 
                className="absolute inset-0 bg-white/90 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center gap-3 opacity-0 translate-y-1/2 pointer-events-none group-hover:pointer-events-auto"
            >
                <Link 
                    href={`/courses/${enrollment.course_id}`}
                    className="flex w-3/4 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-gray-800 hover:scale-105"
                >
                    <Eye className="h-4 w-4" /> View Course
                </Link>
                
                <Link 
                    href={`/modules?course=${enrollment.course_id}`}
                    className="flex w-3/4 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:opacity-90 hover:scale-105"
                >
                    <PlayCircle className="h-4 w-4" /> Continue Learning
                </Link>
            </div>
        </article>
    );
}
