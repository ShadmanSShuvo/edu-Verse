import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/footer";
import {
  BookOpen,
  Brain,
  Trophy,
  Users,
  Star,
  ArrowRight,
  Sparkles,
  Clock,
  BarChart3,
  Globe,
  Shield,
  ChevronRight,
  GraduationCap,
  Zap,
  CheckCircle,
} from "lucide-react";
import { Suspense } from "react";
import { HeroAuthButtons, CTAAuthButton } from "@/components/auth-buttons";
import { getCoursesWithDetails } from "@/db/courses";
import { getAllDashboardStats } from "@/db/dashboard";
import { getReviews } from "@/db/review";
import { HeroAnimation } from "./components/HeroAnimation";
import { AnimatedHeroStat } from "./components/AnimatedHeroStat";
import { HeroReveal } from "@/components/ui/hero-reveal";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

// ── Feature cards data ──────────────────────────────────────────────────────
const features = [
  {
    icon: <Brain className="h-6 w-6" />,
    title: "AI-Powered Learning",
    description:
      "Get personalised content recommendations and AI-generated study materials tailored to your pace and goals.",
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
    text: "text-violet-600",
    href: "/features#ai",
  },
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: "Rich Course Library",
    description:
      "Access hundreds of expertly crafted courses across technology, design, business, and more.",
    gradient: "from-blue-500 to-cyan-600",
    bg: "bg-blue-50",
    text: "text-blue-600",
    href: "/features#library",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Progress Tracking",
    description:
      "Monitor your growth with detailed analytics, completion streaks, and milestone achievements.",
    gradient: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    href: "/features#tracking",
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Learn Anywhere",
    description:
      "Fully responsive platform — study on your phone, tablet, or desktop whenever inspiration strikes.",
    gradient: "from-orange-500 to-amber-600",
    bg: "bg-orange-50",
    text: "text-orange-600",
    href: "/features#anywhere",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Verified Certificates",
    description:
      "Earn industry-recognised certificates that showcase your skills to employers worldwide.",
    gradient: "from-rose-500 to-pink-600",
    bg: "bg-rose-50",
    text: "text-rose-600",
    href: "/features#certificates",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Live Sessions",
    description:
      "Join interactive live classes, Q&A sessions, and workshops with top instructors in real time.",
    gradient: "from-yellow-500 to-orange-500",
    bg: "bg-yellow-50",
    text: "text-yellow-600",
    href: "/features#live",
  },
];

// ── Course static metadata for decoration ───────────────────────────────────
const COURSE_META: Record<string, any> = {
  "Full-Stack Web Development": {
    category: "Computer Science",
    rating: 4.9,
    students: "12.4k",
    duration: "48h",
    level: "Beginner",
    badge: "Bestseller",
    badgeColor: "bg-amber-100 text-amber-700",
    accent: "from-blue-500 to-indigo-600",
  },
  "Machine Learning with Python": {
    category: "Data Science",
    rating: 4.8,
    students: "9.7k",
    duration: "36h",
    level: "Intermediate",
    badge: "Hot",
    badgeColor: "bg-rose-100 text-rose-700",
    accent: "from-violet-500 to-purple-600",
  },
  "UI/UX Design Masterclass": {
    category: "Design",
    rating: 4.9,
    students: "7.2k",
    duration: "28h",
    level: "All Levels",
    badge: "New",
    badgeColor: "bg-emerald-100 text-emerald-700",
    accent: "from-pink-500 to-rose-600",
  },
};

// ── Testimonials data ────────────────────────────────────────────────────────
const testimonials = [
  {
    id: "t1",
    name: "Aisha Tariq",
    role: "Software Engineer at Google",
    content:
      "EduVerse completely transformed my career. The AI-powered study paths kept me on track, and within 6 months I landed my dream job.",
    avatar: "AT",
    avatarBg: "bg-violet-100 text-violet-700",
    stars: 5,
  },
  {
    id: "t2",
    name: "Rahul Mehta",
    role: "Data Scientist at Meta",
    content:
      "The course quality is exceptional. Every concept is explained clearly, and the projects make you feel ready for real-world challenges.",
    avatar: "RM",
    avatarBg: "bg-blue-100 text-blue-700",
    stars: 5,
  },
  {
    id: "t3",
    name: "Sofia Lopes",
    role: "UX Lead at Shopify",
    content:
      "I've tried many platforms, but EduVerse's community and live sessions make it a league of its own. Highly recommended!",
    avatar: "SL",
    avatarBg: "bg-emerald-100 text-emerald-700",
    stars: 5,
  },
];


/** Safe fallback shape when dashboard stats are unavailable */
const STATS_FALLBACK = {
  course_count: 0,
  student_count: 0,
  module_count: 0,
  exam_count: 0,
  material_count: 0,
  total_attempts: 0,
  avg_student_score: null as number | null,
  avg_rating: null as number | null,
};

export default async function Home() {
  // Use allSettled so a transient DB outage on one fetch degrades gracefully
  // instead of crashing the entire page with a 500.
  const [coursesResult, statsResult, reviewsResult] = await Promise.allSettled([
    getCoursesWithDetails({ limit: 3, sort: 'students' }),
    getAllDashboardStats(),
    getReviews({ limit: 3 }),
  ]);

  const allCourses = coursesResult.status === 'fulfilled' ? coursesResult.value : [];
  const statsData  = (statsResult.status  === 'fulfilled' && statsResult.value)
    ? statsResult.value
    : STATS_FALLBACK;
  const allReviews = reviewsResult.status === 'fulfilled' ? reviewsResult.value : [];

  // Map reviews to testimonials
  const realReviews = allReviews.slice(0, 3).map((r: any) => ({
    id: `review-${r.review_id}`,
    name: r.user_name,
    role: `Learner in ${r.course_title}`,
    content: r.review_text,
    avatar: r.user_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
    avatarBg: "bg-violet-100 text-violet-700",
    stars: Math.floor(Number(r.rating)),
  }));

  // Use real testimonials if available, otherwise fallback to demo
  const displayTestimonials = realReviews.length > 0 ? realReviews : testimonials;

  const liveStats = [
    {
      value: statsData.student_count >= 1000 ? `${(statsData.student_count / 1000).toFixed(1)}K+` : statsData.student_count.toString(),
      label: "Active Learners",
      icon: <Users className="h-5 w-5" />
    },
    {
      value: statsData.course_count.toString(),
      label: "Expert Courses",
      icon: <BookOpen className="h-5 w-5" />
    },
    {
      value: statsData.avg_student_score ? `${Math.min(96, Math.round(statsData.avg_student_score + 10))}%` : "94%",
      label: "Completion Rate",
      icon: <CheckCircle className="h-5 w-5" />
    },
    {
      value: statsData.avg_rating ? `${Number(statsData.avg_rating).toFixed(1)}/5` : "4.9/5",
      label: "User Rating",
      icon: <Star className="h-5 w-5" />
    },
  ];

  // Decorate DB courses with requested metadata
  const featuredCourses = allCourses.slice(0, 3).map(c => {
    const meta = COURSE_META[c.title] || {};
    // Use actual rating from DB, fallback to meta or display "New" if no ratings yet
    const actualRating = c.avg_rating ? Number(c.avg_rating) : (meta.rating || null);
    return {
      ...c,
      category: meta.category || c.subjects?.split(',')[0] || "General",
      rating: actualRating,
      students: c.student_count >= 1000 ? `${(Number(c.student_count) / 1000).toFixed(1)}k` : c.student_count.toString(),
      duration: meta.duration || "Self-paced",
      level: meta.level || "Beginner",
      badge: meta.badge,
      badgeColor: meta.badgeColor || "bg-violet-100 text-violet-700",
      accent: meta.accent || "from-violet-500 to-blue-500"
    };
  });

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100">


      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden">
        {/* Background blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-violet-100 to-blue-100 dark:from-violet-900/20 dark:to-blue-900/20 opacity-60 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-cyan-100 to-emerald-100 dark:from-cyan-900/20 dark:to-emerald-900/20 opacity-50 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <HeroReveal>
            <HeroAnimation>
              {/* Pill badge */}
              <div className="hero-element inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 dark:border-violet-500/20 dark:bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-700 dark:text-violet-300 animate-fade-in">
                <Sparkles className="h-3.5 w-3.5 fill-violet-400" />
                🚀 New: AI-Personalized Learning Paths Now Live
              </div>

              <h1 className="hero-element max-w-4xl text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl">
                Master High-Income Skills with{" "}
                <span className="bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  edu
                </span>
                <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                  Verse
                </span>
              </h1>

              <p className="hero-element max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                Join over {statsData.student_count >= 1000 ? `${(statsData.student_count / 1000).toFixed(0)}k` : statsData.student_count} career-shifters building real-world projects. Get a
                personalized AI roadmap, live expert guidance, and certificates that actually get you hired — at your own pace.
              </p>

              <div className="hero-element w-full flex justify-center">
                <Suspense fallback={<div className="h-14 w-64 bg-gray-200 dark:bg-slate-800 animate-pulse rounded-xl" />}>
                  <HeroAuthButtons />
                </Suspense>
              </div>

              {/* Social proof */}
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex -space-x-2">
                    {[
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces",
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces",
                      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop&crop=faces",
                      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=faces"
                    ].map((url, i) => (
                      <div
                        key={i}
                        className="relative h-8 w-8 rounded-full border-2 border-white dark:border-slate-950 overflow-hidden"
                      >
                        <Image
                          src={url}
                          alt="Learner"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-violet-600 text-[10px] font-bold text-white dark:border-slate-950">
                      +12k
                    </div>
                  </div>
                  <span>
                    <span className="font-semibold text-gray-700 dark:text-gray-200">Trusted by {statsData.student_count >= 1000 ? `${(statsData.student_count / 1000).toFixed(1)}k+` : statsData.student_count}+</span> ambitious learners
                  </span>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">No credit card required. Start free.</p>
              </div>
            </HeroAnimation>
          </HeroReveal>

          {/* Trusted By Section */}
          <div className="mt-20 border-y border-gray-100 dark:border-white/5 py-8">
            <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-8 px-4">
              Our learners thrive at top tech hubs
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {['Google', 'Meta', 'Amazon', 'Microsoft', 'Netflix', 'Airbnb'].map((company) => (
                <span key={company} className="text-xl font-bold text-gray-400 dark:text-gray-600 hover:text-violet-600 transition-colors cursor-default">
                  {company}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAND ───────────────────────────────────────────────────── */}
      <section className="border-y border-gray-100 dark:border-white/5 bg-gray-50/60 dark:bg-slate-900/40">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {liveStats.map((s) => (
              <AnimatedHeroStat key={s.label} value={s.value} label={s.label} icon={s.icon} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <ScrollReveal delay={0.1}>
        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="mb-14 flex flex-col items-center gap-4 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              <GraduationCap className="h-3.5 w-3.5" /> Why EduVerse
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              Everything you need to learn smarter
            </h2>
            <p className="max-w-xl text-gray-500 dark:text-gray-400">
              We built EduVerse to remove every barrier between you and mastery —
              from day one to career success.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Link
                key={f.title}
                href={f.href}
                className="group relative rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-slate-900/40 p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
              >
                <div
                  className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} text-white shadow-sm`}
                >
                  {f.icon}
                </div>
                <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{f.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">{f.description}</p>
                <div
                  className={`mt-5 inline-flex items-center gap-1 text-xs font-semibold ${f.text} opacity-0 transition-opacity group-hover:opacity-100`}
                >
                  Learn more <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* ── FEATURED COURSES ─────────────────────────────────────────────── */}
      <ScrollReveal delay={0.1}>
        <section className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900/50 py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-14 flex flex-col items-center gap-4 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <Star className="h-3.5 w-3.5 fill-emerald-600 dark:fill-emerald-400" /> Top Rated
              </span>
              <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                Featured Courses
              </h2>
              <p className="max-w-xl text-gray-500 dark:text-gray-400">
                Hand-picked by our editorial team — the courses that learners love most.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredCourses.map((c) => (
                <Link
                  key={c.course_id}
                  href={`/courses/${c.course_id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  {/* Card header accent */}
                  <div className={`h-2 w-full bg-gradient-to-r ${c.accent}`} />

                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        {c.category}
                      </span>
                      {c.badge && (
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.badgeColor} dark:bg-opacity-20`}>
                          {c.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white leading-snug group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors">
                      {c.title}
                    </h3>

                    <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{c.instructors || "EduVerse Team"}</p>

                    {/* Rating row */}
                    <div className="mb-4 flex items-center gap-2 text-sm">
                      {c.rating ? (
                        <>
                          <span className="font-bold text-amber-500 dark:text-amber-400">{c.rating}</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <Star key={n} className={`h-3.5 w-3.5 ${n <= Math.floor(Number(c.rating)) ? 'fill-amber-400 text-amber-400 dark:fill-amber-500/80 dark:text-amber-500/80' : 'text-gray-300 dark:text-gray-700'}`} />
                            ))}
                          </div>
                          <span className="text-gray-400 dark:text-gray-500">({c.students})</span>
                        </>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">
                          New Course • {c.students} {Number(c.student_count) === 1 ? 'student' : 'students'}
                        </span>
                      )}
                    </div>

                    {/* Meta row */}
                    <div className="mt-auto flex items-center gap-4 border-t border-gray-100 dark:border-slate-800 pt-4 text-xs text-gray-400 dark:text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {c.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <BarChart3 className="h-3.5 w-3.5" />
                        {c.level}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {c.students} learners
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-12 flex justify-center">
              <Link
                href="/courses"
                className="group inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-7 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-sm transition-all hover:border-violet-200 dark:hover:border-violet-500/30 hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:text-violet-700 dark:hover:text-violet-400"
              >
                Browse All Courses
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <ScrollReveal delay={0.1}>
        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="mb-14 flex flex-col items-center gap-4 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              ❤️ Loved by Learners
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              What our community says
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {displayTestimonials.map((t: any) => (
              <div
                key={t.id}
                className="flex flex-col gap-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-slate-900/40 p-6 shadow-sm transition-all hover:shadow-md"
              >
                {/* Stars */}
                <div className="flex gap-0.5">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400 dark:fill-amber-500/80 dark:text-amber-500/80" />
                  ))}
                </div>

                <p className="flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  &ldquo;{t.content}&rdquo;
                </p>

                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${t.avatarBg} dark:bg-opacity-20`}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* ── CTA BANNER ────────────────────────────────────────────────────── */}
      <ScrollReveal delay={0.1}>
      <section className="relative isolate overflow-hidden bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 py-20">
        {/* noise texture overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-20 bg-hero-page"
        />
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Ready to accelerate your career?
          </h2>
          <p className="mb-8 text-lg text-white/80">
            Start learning today — no credit card required. Your first month is
            completely free.
          </p>
          <Suspense fallback={<div className="h-14 w-48 bg-white/20 animate-pulse rounded-xl mx-auto" />}>
            <CTAAuthButton />
          </Suspense>
        </div>
      </section>
    </ScrollReveal>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */ }
  <ScrollReveal delay={0.1}>
    <Footer />
  </ScrollReveal>
    </div >
  );
}
