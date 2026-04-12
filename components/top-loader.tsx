// "use client";

// import { useEffect, useState, useRef, useCallback } from "react";
// import { usePathname, useSearchParams } from "next/navigation";

// /**
//  * A global navigation progress bar, inspired by nprogress / nextjs-toploader.
//  * It automatically detects route changes via Next.js App Router hooks
//  * and shows a smooth animated progress bar at the very top of the page.
//  *
//  * No external dependencies required — fully self-contained.
//  */
// export function NavigationProgressBar() {
//   const pathname = usePathname();
//   const searchParams = useSearchParams();
//   const [progress, setProgress] = useState(0);
//   const [visible, setVisible] = useState(false);
//   const intervalRef = useRef<NodeJS.Timeout | null>(null);
//   const timeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const prevPathRef = useRef(pathname + searchParams.toString());

//   const cleanup = useCallback(() => {
//     if (intervalRef.current) clearInterval(intervalRef.current);
//     if (timeoutRef.current) clearTimeout(timeoutRef.current);
//     intervalRef.current = null;
//     timeoutRef.current = null;
//   }, []);

//   // Detect route changes
//   useEffect(() => {
//     const current = pathname + searchParams.toString();
//     if (current !== prevPathRef.current) {
//       // Route changed — finish the bar
//       prevPathRef.current = current;
//       cleanup();
//       setProgress(100);
//       timeoutRef.current = setTimeout(() => {
//         setVisible(false);
//         setProgress(0);
//       }, 350);
//     }
//   }, [pathname, searchParams, cleanup]);

//   // Intercept link clicks to start progress before route changes
//   useEffect(() => {
//     const handleClick = (e: MouseEvent) => {
//       const anchor = (e.target as HTMLElement).closest("a");
//       if (!anchor) return;

//       const href = anchor.getAttribute("href");
//       if (!href) return;

//       // Skip external links, anchor-only links, and download links
//       if (
//         href.startsWith("http") ||
//         href.startsWith("#") ||
//         href.startsWith("mailto:") ||
//         anchor.target === "_blank" ||
//         anchor.hasAttribute("download")
//       ) {
//         return;
//       }

//       // Skip if modifier keys are pressed (new tab/window)
//       if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

//       // Skip if navigating to the same page
//       const currentPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
//       if (href === currentPath || href === pathname) return;

//       // Start the progress bar
//       startProgress();
//     };

//     // Also intercept form submissions (server actions)
//     const handleSubmit = () => {
//       startProgress();
//     };

//     document.addEventListener("click", handleClick, { capture: true });
//     document.addEventListener("submit", handleSubmit, { capture: true });

//     return () => {
//       document.removeEventListener("click", handleClick, { capture: true });
//       document.removeEventListener("submit", handleSubmit, { capture: true });
//     };
//   }, [pathname, searchParams]);

//   const startProgress = useCallback(() => {
//     cleanup();
//     setVisible(true);
//     setProgress(0);

//     // Trickle progress — fast at first, then slows down
//     let p = 0;
//     intervalRef.current = setInterval(() => {
//       p += Math.random() * (p < 50 ? 8 : p < 80 ? 3 : 0.5);
//       if (p > 95) p = 95;
//       setProgress(p);
//     }, 150);
//   }, [cleanup]);

//   // Cleanup on unmount
//   useEffect(() => cleanup, [cleanup]);

//   if (!visible && progress === 0) return null;

//   return (
//     <div
//       className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none"
//       role="progressbar"
//       aria-valuenow={Math.round(progress)}
//     >
//       <div
//         className="h-full transition-all ease-out"
//         style={{
//           width: `${progress}%`,
//           transitionDuration: progress === 100 ? "200ms" : "300ms",
//           background: "linear-gradient(90deg, #818cf8, #6366f1, #8b5cf6)",
//           boxShadow: "0 0 10px rgba(99, 102, 241, 0.7), 0 0 5px rgba(139, 92, 246, 0.5)",
//         }}
//       />
//       {/* Pulsing glow dot at the edge */}
//       {visible && progress < 100 && (
//         <div
//           className="absolute top-0 right-0 h-[3px] w-24 opacity-80"
//           style={{
//             transform: `translateX(${progress < 95 ? 0 : -20}px)`,
//             background: "linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.6))",
//           }}
//         />
//       )}
//     </div>
//   );
// }

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Enhanced Global Navigation Progress Bar
 * Fixes "hanging" issues during Server Actions and form updates.
 */

// Global helper functions to control the loader from any component
export const startProgress = () => {
  window.dispatchEvent(new Event("app-progress-start"));
};

export const stopProgress = () => {
  window.dispatchEvent(new Event("app-progress-stop"));
};

export function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevPathRef = useRef(pathname + searchParams.toString());

  const cleanup = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    intervalRef.current = null;
    timeoutRef.current = null;
  }, []);

  const finishBar = useCallback(() => {
    cleanup();
    setProgress(100);
    timeoutRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 400);
  }, [cleanup]);

  const startBar = useCallback(() => {
    cleanup();
    setVisible(true);
    setProgress(0);

    let p = 0;
    intervalRef.current = setInterval(() => {
      p += Math.random() * (p < 50 ? 10 : p < 80 ? 2 : 0.5);
      if (p > 95) p = 95;
      setProgress(p);
    }, 100);
  }, [cleanup]);

  // 1. Detect URL Changes (Standard Navigation)
  useEffect(() => {
    const current = pathname + searchParams.toString();
    if (current !== prevPathRef.current) {
      prevPathRef.current = current;
      finishBar();
    }
  }, [pathname, searchParams, finishBar]);

  // 2. Event Listeners for Manual Control & Form Submissions
  useEffect(() => {
    const handleStart = () => startBar();
    const handleStop = () => finishBar();

    // Catch form submissions globally
    const handleSubmit = (e: MouseEvent | SubmitEvent) => {
        // Give Next.js a moment to initiate the transition
        setTimeout(() => startBar(), 10);
    };

    window.addEventListener("app-progress-start", handleStart);
    window.addEventListener("app-progress-stop", handleStop);
    window.addEventListener("submit", handleSubmit, { capture: true });

    return () => {
      window.removeEventListener("app-progress-start", handleStart);
      window.removeEventListener("app-progress-stop", handleStop);
      window.removeEventListener("submit", handleSubmit, { capture: true });
      cleanup();
    };
  }, [startBar, finishBar, cleanup]);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
    >
      <div
        className="h-full transition-all ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 100 ? "200ms" : "300ms",
          background: "linear-gradient(90deg, #818cf8, #6366f1, #8b5cf6)",
          boxShadow: "0 0 10px rgba(99, 102, 241, 0.7)",
        }}
      />
    </div>
  );
}