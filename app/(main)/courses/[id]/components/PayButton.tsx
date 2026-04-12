"use client";

/**
 * PayButton — client component used inside the server-rendered EnrollCard.
 * Handles:
 *   1. Calling POST /api/payment/initiate
 *   2. Redirecting the browser to the SSLCommerz gateway
 *   3. Loading and error states
 */

import { useState } from "react";
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react";

interface PayButtonProps {
  courseId: number;
  price: number;
}

export function PayButton({ courseId, price }: PayButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseIds: [courseId] }),
      });

      const data = await res.json();

      if (!res.ok || !data.gatewayUrl) {
        setError(data.error ?? "Failed to initiate payment. Please try again.");
        return;
      }

      // Redirect the browser to the SSLCommerz payment gateway
      window.location.href = data.gatewayUrl;
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-3 flex flex-col gap-2">
      <button
        onClick={handlePay}
        disabled={loading}
        className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 py-3 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
      >
        {/* Shimmer effect */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 translate-x-[-100%] skew-x-[-20deg] bg-white/10 transition-transform duration-700 group-hover:translate-x-[200%]"
        />

        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Redirecting to payment…
          </>
        ) : (
          <>
            <ShieldCheck className="h-4 w-4" />
            Pay ৳{price.toFixed(2)} &amp; Enroll
          </>
        )}
      </button>

      {/* Trusted payment badge */}
      <p className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground/70">
        <ShieldCheck className="h-3 w-3 text-emerald-500" />
        Secured by SSLCommerz · BDT
      </p>

      {/* Inline error */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-300/40 bg-red-50 dark:bg-red-500/10 p-2.5 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
