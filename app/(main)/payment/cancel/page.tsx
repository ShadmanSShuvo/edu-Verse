import { Metadata } from "next";
import Link from "next/link";
import { MinusCircle, ArrowLeft, BookOpen } from "lucide-react";
import { Footer } from "@/components/footer";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const metadata: Metadata = {
  title: "Payment Cancelled | EduVerse",
  description: "You cancelled the payment. No charges were made.",
};

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">


      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-16">
        <ScrollReveal className="w-full max-w-md">
          {/* Card */}
          <div className="relative overflow-hidden rounded-3xl border border-amber-100 dark:border-amber-500/20 bg-white dark:bg-slate-900/80 p-8 shadow-2xl backdrop-blur-md">
            {/* Background glow */}
            <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />

            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
                <MinusCircle className="h-10 w-10 text-white" strokeWidth={2.5} />
              </div>
            </div>

            {/* Heading */}
            <div className="text-center">
              <h1 className="mb-2 text-2xl font-extrabold text-gray-900 dark:text-white">
                Payment Cancelled
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You cancelled the payment. No charges have been made to your account.
              </p>
            </div>

            {/* Divider */}
            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-100 dark:bg-white/10" />
              <span className="text-xs font-medium text-gray-400">Ready to try again?</span>
              <div className="h-px flex-1 bg-gray-100 dark:bg-white/10" />
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-3">
              <Link
                href="/courses"
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <BookOpen className="h-4 w-4" />
                Browse Courses
              </Link>

              <Link
                href="/"
                className="flex items-center justify-center gap-2 rounded-xl border border-border/50 bg-gray-50 dark:bg-white/5 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
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
