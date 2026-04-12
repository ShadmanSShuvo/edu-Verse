/**
 * Centralized GSAP Animation Configuration
 * 
 * This file defines all standardized animation patterns, timings, and easing values
 * used throughout the eduVerse application. Enforces consistency across all pages.
 * 
 * Usage:
 *   import { AnimationPatterns } from "@/lib/animation-patterns";
 *   gsap.to(element, {
 *     ...AnimationPatterns.fadeIn,
 *     scrollTrigger: {
 *       trigger: element,
 *       ...AnimationPatterns.scrollTrigger.default
 *     }
 *   });
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ─────────────────────────────────────────────────────────────────────────────
// DURATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const AnimationDurations = {
  // Entrance animations
  heroEntrance: 0.7,      // Hero section elements
  scrollReveal: 0.8,      // Scroll-triggered reveals
  cardEnter: 1.6,         // Individual card reveals

  // Interaction animations
  hoverShort: 0.3,        // Quick interactions
  hoverMedium: 0.4,       // Standard hover effects
  hoverLong: 0.6,         // Complex interactions

  // Data animations
  counter: 2.0,           // Number counters
  svgStroke: 1.5,         // SVG animations
  
  // Special
  pageTransition: 0.35,   // Page enter/exit transitions
};

// ─────────────────────────────────────────────────────────────────────────────
// EASING PRESETS
// ─────────────────────────────────────────────────────────────────────────────

export const AnimationEasing = {
  // Entrance easing (slow out, bouncy feel)
  entrance: "back.out(1.7)",
  
  // Interaction easing (smooth, natural)
  interaction: "power2.out",
  interactionInOut: "power2.inOut",
  
  // Counter animations
  counter: "power2.out",
  
  // SVG animations
  svgDraw: "power2.inOut",
};

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL TRIGGER CONFIGURATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const ScrollTriggerConfig = {
  // Default: Trigger when element is 95% visible
  default: {
    start: "top 95%",
    once: true,
  },

  // For grid items: Trigger earlier for better stagger effect
  grid: {
    start: "top 85%",
    once: true,
  },

  // For hero sections: Trigger slightly later for smoother entrance
  hero: {
    start: "top 100%",
    once: true,
  },

  // For counters: Trigger when fully visible
  counter: {
    start: "top 90%",
    once: true,
  },

  // Toggle only on scroll in (for module cards)
  moduleCard: {
    start: "top 85%",
    toggleActions: "play none none none",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// STAGGER CONFIGURATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const StaggerConfig = {
  // Hero elements
  hero: 0.12,

  // Grid/list items
  gridSmall: 0.08,      // Tighter stagger for dense grids
  gridMedium: 0.12,     // Standard stagger
  gridLarge: 0.15,      // Looser stagger for fewer items

  // Cards
  card: 0.12,
};

// ─────────────────────────────────────────────────────────────────────────────
// PRESET ANIMATION PATTERNS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fade in with scale (scroll-triggered card entrance)
 * Used for module cards, course cards on scroll
 */
export const ScrollCardEntrance = {
  from: {
    opacity: 0,
    scale: 0.95,
  },
  to: {
    opacity: 1,
    scale: 1,
    duration: AnimationDurations.cardEnter,
    ease: AnimationEasing.interaction,
  },
};

/**
 * Hover scale + shadow elevation
 * Used for interactive card hover effects
 */
export const HoverCardElevation = {
  duration: AnimationDurations.hoverMedium,
  ease: AnimationEasing.interaction,
  scale: 1.02,
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
};

/**
 * Hover scale reset
 * Counterpart to HoverCardElevation
 */
export const HoverCardReset = {
  duration: AnimationDurations.hoverMedium,
  ease: AnimationEasing.interaction,
  scale: 1,
  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
};

/**
 * Y-translate slide in with fade (overlay/panel entrance)
 * Used for dropdown menus, modal overlays
 */
export const OverlaySlideIn = {
  duration: AnimationDurations.hoverMedium,
  ease: AnimationEasing.interaction,
  y: 0,
  opacity: 1,
};

/**
 * Y-translate slide out with fade
 * Counterpart to OverlaySlideIn
 */
export const OverlaySlideOut = {
  duration: AnimationDurations.hoverShort,
  ease: AnimationEasing.interactionInOut,
  y: "50%",
  opacity: 0,
};

/**
 * Hero element stagger animation (Y-translate + fade)
 * Used for hero sections with multiple elements
 */
export const HeroStaggerAnimation = {
  from: {
    y: 40,
    opacity: 0,
  },
  to: {
    y: 0,
    opacity: 1,
    duration: AnimationDurations.heroEntrance,
    ease: AnimationEasing.entrance,
    stagger: StaggerConfig.hero,
    clearProps: "transform",
  },
};

/**
 * Number counter animation with scroll trigger
 * Used for statistics, progress counters
 */
export const CounterAnimation = {
  duration: AnimationDurations.counter,
  ease: AnimationEasing.counter,
};

/**
 * SVG stroke animation
 * Used for animated logos, icons
 */
export const SVGStrokeAnimation = {
  duration: AnimationDurations.svgStroke,
  ease: AnimationEasing.svgDraw,
  strokeDashoffset: 0,
};

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATION SETS (for complex sequences)
// ─────────────────────────────────────────────────────────────────────────────

export const AnimationSets = {
  /**
   * Scroll-triggered card reveal with stagger
   * Parameters: cards, staggerDelay
   */
  scrollCardGrid: {
    from: { opacity: 0, scale: 0.95 },
    to: {
      opacity: 1,
      scale: 1,
      duration: AnimationDurations.cardEnter,
      ease: AnimationEasing.interaction,
      stagger: StaggerConfig.gridMedium,
    },
    scrollTrigger: ScrollTriggerConfig.grid,
  },

  /**
   * Direction-based scroll reveal (used by ScrollReveal component)
   */
  directionalReveal: (direction: "top" | "bottom" | "left" | "right", delay = 0) => {
    let x = 0;
    let y = 0;
    
    switch (direction) {
      case "top": y = -50; break;
      case "bottom": y = 50; break;
      case "left": x = -50; break;
      case "right": x = 50; break;
    }

    return {
      from: { autoAlpha: 0, x, y },
      to: {
        autoAlpha: 1,
        x: 0,
        y: 0,
        duration: AnimationDurations.scrollReveal,
        delay,
        ease: AnimationEasing.entrance,
        scrollTrigger: ScrollTriggerConfig.default,
      },
    };
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a scroll reveal config with custom start point
 * Useful for elements at different scroll positions
 */
export const createScrollTrigger = (start: string, once = true) => ({
  start,
  once,
});

/**
 * Create a staggered animation config
 * Useful for grid/list animations with custom stagger values
 */
export const createStaggerAnimation = (
  baseConfig: any,
  staggerDelay: number,
  count: number
) => ({
  ...baseConfig,
  stagger: staggerDelay,
});

/**
 * Verify GSAP is ready (useful for debugging)
 */
export const isGSAPReady = () => {
  if (typeof window === "undefined") return false;
  return gsap && ScrollTrigger;
};
