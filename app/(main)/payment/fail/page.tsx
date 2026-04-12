import { Metadata } from "next";
import Link from "next/link";
import { XCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { Footer } from "@/components/footer";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const metadata: Metadata = {
  title: "Payment Failed | EduVerse",
  description: "Your payment could not be processed. Please try again.",
};

const reasonMessages: Record<string, string> = {
  validation_failed:
    "We could not verify your payment with SSLCommerz. No charges were made.",
  tran_id_mismatch:
    "A security check failed on the transaction ID. No charges were made.",
  missing_params:
    "The payment gateway returned incomplete information. Please try again.",
  server_error:
    "An unexpected server error occurred while processing your payment.",
};

export default async function PaymentFailPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; tran_id?: string }>;
}) {
  const { reason, tran_id } = await searchParams;
  const message = reason
    ? reasonMessages[reason] ?? "Your payment was not successful."
    : "Your payment was not successful. Please try again.";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">


      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-16">
        <ScrollReveal className="w-full max-w-md">
          {/* Card */}
          <div className="relative overflow-hidden rounded-3xl border border-red-100 dark:border-red-500/20 bg-white dark:bg-slate-900/80 p-8 shadow-2xl backdrop-blur-md">
            {/* Background glow */}
            <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-red-400/10 blur-3xl" />

            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-rose-600 shadow-lg shadow-red-500/30">
                <XCircle className="h-10 w-10 text-white" strokeWidth={2.5} />
              </div>
            </div>

            {/* Heading */}
            <div className="text-center">
              <h1 className="mb-2 text-2xl font-extrabold text-gray-900 dark:text-white">
                Payment Failed
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>

              {tran_id && (
                <p className="mt-3 rounded-lg bg-gray-50 dark:bg-white/5 px-3 py-2 text-xs font-mono text-gray-400 dark:text-gray-500">
                  Transaction: {tran_id}
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-100 dark:bg-white/10" />
              <span className="text-xs font-medium text-gray-400">What can you do?</span>
              <div className="h-px flex-1 bg-gray-100 dark:bg-white/10" />
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-3">
              <Link
                href="/courses"
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <RefreshCw className="h-4 w-4" />
                Go Back &amp; Retry
              </Link>

              <Link
                href="/"
                className="flex items-center justify-center gap-2 rounded-xl border border-border/50 bg-gray-50 dark:bg-white/5 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </div>

            {/* Note */}
            <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
              No payment has been charged to your account.
              <br />
              If you believe this is an error, please contact support.
            </p>
          </div>
        </ScrollReveal>
      </div>

      <ScrollReveal delay={0.1}>
        <Footer />
      </ScrollReveal>
    </div>
  );
}
