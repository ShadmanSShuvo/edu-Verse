import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, BookOpen, LayoutDashboard, ArrowRight } from "lucide-react";
import { getSession } from "@/lib/session";
import { getPendingPaymentByTranId } from "@/db/orders";
import { Footer } from "@/components/footer";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const metadata: Metadata = {
  title: "Payment Successful | EduVerse",
  description: "Your payment was successful. You are now enrolled in the course.",
};

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ tran_id?: string }>;
}) {
  const { tran_id } = await searchParams;
  const session = await getSession();

  // Try to fetch course names for a personalised message
  let coursesInfo: { course_ids: number[] } | null = null;
  if (tran_id) {
    try {
      coursesInfo = await getPendingPaymentByTranId(tran_id);
    } catch {
      // Non-critical — still show the success page
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">


      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-16">
        <ScrollReveal className="w-full max-w-md">
          {/* Card */}
          <div className="relative overflow-hidden rounded-3xl border border-emerald-100 dark:border-emerald-500/20 bg-white dark:bg-slate-900/80 p-8 shadow-2xl backdrop-blur-md">
            {/* Background glow */}
            <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-green-400/10 blur-3xl" />

            {/* Icon */}
            <div className="relative mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-500/30">
                <CheckCircle className="h-10 w-10 text-white" strokeWidth={2.5} />
              </div>
              {/* Ring animation */}
              <div className="absolute inset-0 m-auto h-20 w-20 animate-ping rounded-full bg-emerald-400/20" />
            </div>

            {/* Heading */}
            <div className="relative text-center">
              <h1 className="mb-2 text-2xl font-extrabold text-gray-900 dark:text-white">
                Payment Successful! 🎉
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your enrollment has been confirmed. Welcome to EduVerse!
              </p>

              {tran_id && (
                <p className="mt-3 rounded-lg bg-gray-50 dark:bg-white/5 px-3 py-2 text-xs font-mono text-gray-400 dark:text-gray-500">
                  Transaction: {tran_id}
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="relative my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-100 dark:bg-white/10" />
              <span className="text-xs font-medium text-gray-400">What&apos;s next?</span>
              <div className="h-px flex-1 bg-gray-100 dark:bg-white/10" />
            </div>

            {/* CTA buttons */}
            <div className="relative flex flex-col gap-3">
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <LayoutDashboard className="h-4 w-4" />
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/courses"
                className="flex items-center justify-center gap-2 rounded-xl border border-border/50 bg-gray-50 dark:bg-white/5 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <BookOpen className="h-4 w-4" />
                Browse More Courses
              </Link>
            </div>

            {/* Info strip */}
            <div className="relative mt-6 rounded-xl border border-blue-100 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 p-4 text-xs text-blue-700 dark:text-blue-300">
              <p className="font-semibold">A confirmation email will be sent to:</p>
              <p className="mt-0.5 font-mono">{session?.email ?? "your registered email"}</p>
            </div>
          </div>
        </ScrollReveal>
      </div>

      <ScrollReveal delay={0.1}>
        <Footer />
      </ScrollReveal>
    </div>
  );
}
