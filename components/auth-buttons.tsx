import Link from "next/link";
import { getSession } from "@/lib/session";
import { ArrowRight, Play } from "lucide-react";

export async function HeroAuthButtons() {
  const session = await getSession();
  
  if (session) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <Link
        href="/signup"
        className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-violet-200 dark:shadow-none transition-all hover:shadow-xl hover:shadow-violet-300 dark:hover:bg-violet-500 hover:-translate-y-0.5 active:translate-y-0"
      >
        Start Learning for Free
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
      <Link
        href="/courses"
        className="group inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-7 py-3.5 text-base font-semibold text-gray-700 dark:text-gray-200 shadow-sm transition-all hover:border-gray-300 dark:hover:border-slate-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
      >
        <Play className="h-4 w-4 fill-gray-700 dark:fill-gray-200" />
        Explore All Courses
      </Link>
    </div>
  );
}

export async function CTAAuthButton() {
  const session = await getSession();

  if (session) return null;

  return (
    <Link
      href="/signup"
      className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-violet-700 shadow-xl transition-all hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0"
    >
      Create Free Account
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}
