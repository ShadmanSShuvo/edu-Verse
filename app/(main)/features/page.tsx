import { Footer } from "@/components/footer";
import {
  Brain,
  BookOpen,
  BarChart3,
  Globe,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Trophy,
  Users
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { HeroReveal } from "@/components/ui/hero-reveal";

export default function FeaturesPage() {
  const featureDetails = [
    {
      id: "ai",
      title: "AI-Powered Learning",
      description: "Our proprietary AI models analyze your learning patterns to create a truly personalized experience.",
      longDescription: "EduVerse's AI doesn't just suggest courses; it understands how you learn. Whether you prefer visual aids, practical exercises, or theoretical depth, our engine adapts content in real-time. It identifies your knowledge gaps and generates custom study materials to help you bridge them faster than ever before.",
      Icon: Brain,
      iconColor: "text-violet-500",
      image: "/features/ai-learning.png", // We can generate these later or use placeholders for now
      points: [
        "Personalized path recommendation engine",
        "AI-generated flashcards and summaries",
        "Smart quiz generator based on your notes",
        "24/7 AI tutor for instant clarifications"
      ],
      gradient: "from-violet-500/10 to-purple-500/10",
      accent: "text-violet-600"
    },
    {
      id: "library",
      title: "Rich Course Library",
      description: "Access curated content from industry leaders across all major professional domains.",
      longDescription: "With over 500+ courses spanning Computer Science, Design, Business, and beyond, our library is built for the modern workforce. We partner with top-tier instructors and companies to ensure every course is up-to-date and practically applicable.",
      Icon: BookOpen,
      iconColor: "text-blue-500",
      image: "/features/library.png",
      points: [
        "Interactive coding environments",
        "High-definition video lessons",
        "Downloadable resources and project files",
        "Project-based learning curriculum"
      ],
      gradient: "from-blue-500/10 to-cyan-500/10",
      accent: "text-blue-600"
    },
    {
      id: "tracking",
      title: "Advanced Progress Tracking",
      description: "Visualize your journey with precision analytics and milestone tracking.",
      longDescription: "Stop guessing your progress. Our dashboard provides granular insights into your learning velocity, retention rates, and skill mastery. Set goals, track streaks, and see exactly where you stand in your professional development journey.",
      Icon: BarChart3,
      iconColor: "text-emerald-500",
      image: "/features/tracking.png",
      points: [
        "Visual skill-mapping graphs",
        "Weekly performance reports",
        "Gamified milestone achievements",
        "Learning streak incentives"
      ],
      gradient: "from-emerald-500/10 to-teal-500/10",
      accent: "text-emerald-600"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">

      <HeroReveal>
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32">
          <div className="absolute inset-x-0 top-0 -z-10 h-[500px] bg-gradient-to-b from-violet-100/50 to-transparent dark:from-violet-900/10" />

          <div className="mx-auto max-w-7xl px-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-sm font-medium text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300 mb-8">
              <Sparkles className="h-4 w-4" />
              Discover the Future of Learning
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl mb-6">
              Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600">Master Higher Skills</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-400">
              EduVerse is more than just a course platform. It's a comprehensive ecosystem designed to accelerate your growth through AI, community, and expert mentorship.
            </p>
          </div>
        </section>
      </HeroReveal>

      {/* Detailed Features */}
      <ScrollReveal delay={0.1}>
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="flex flex-col gap-32">
            {featureDetails.map((feature, index) => (
              <div
                key={feature.id}
                id={feature.id}
                className={`flex flex-col gap-12 lg:flex-row lg:items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
              >
                <div className="flex-1">
                  <div className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-sm ring-1 ring-inset ring-slate-200/50 dark:ring-white/10`}>
                    <feature.Icon className={`h-10 w-10 ${feature.iconColor}`} />
                  </div>
                  <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white">{feature.title}</h2>
                  <p className="mb-6 text-lg leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                    {feature.description}
                  </p>
                  <p className="mb-8 text-slate-600 dark:text-slate-400">
                    {feature.longDescription}
                  </p>

                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {feature.points.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${feature.accent}`} />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex-1 relative">
                  <div className={`aspect-square sm:aspect-video lg:aspect-square rounded-3xl bg-gradient-to-br ${feature.gradient} border border-slate-200 dark:border-white/5 flex items-center justify-center overflow-hidden shadow-2xl transition-transform hover:scale-[1.02]`}>
                    {/* Decorative element since we don't have actual images yet */}
                    <div className="p-8 text-center flex flex-col items-center gap-4">
                      <span className={`text-6xl filter blur-[1px] opacity-20 transform scale-150`}><feature.Icon className={feature.iconColor} /></span>
                      <div className="bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-xl p-6 border border-white/20">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-widest text-xs mb-2">Platform Core</p>
                        <p className="text-2xl font-bold dark:text-white uppercase tracking-tighter">{feature.title}</p>
                      </div>
                    </div>
                  </div>
                  {/* Background glow */}
                  <div className={`absolute -inset-4 -z-10 rounded-[40px] bg-gradient-to-br ${feature.gradient} opacity-50 blur-2xl`} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* Grid of Secondary Features */}
      <ScrollReveal delay={0.1}>
        <section className="bg-slate-900 py-24 text-white">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold sm:text-4xl mb-4">But that's not all</h2>
              <p className="text-slate-400">The platform comes packed with tools to ensure you never stop growing.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div id="anywhere" className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <Globe className="h-8 w-8 text-orange-400 mb-6" />
                <h3 className="text-xl font-semibold mb-3">Learn Anywhere</h3>
                <p className="text-slate-400 text-sm">Sync your progress across all devices. Our native apps and responsive web platform ensure you can study comfortably from the commute or the couch.</p>
              </div>
              <div id="certificates" className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <Shield className="h-8 w-8 text-rose-400 mb-6" />
                <h3 className="text-xl font-semibold mb-3">Verified Certificates</h3>
                <p className="text-slate-400 text-sm">Every completed course milestones earns you a blockchain-verified certificate. Display your skills proudly to employers with verifiable proof of mastery.</p>
              </div>
              <div id="live" className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <Zap className="h-8 w-8 text-yellow-400 mb-6" />
                <h3 className="text-xl font-semibold mb-3">Live Sessions</h3>
                <p className="text-slate-400 text-sm">Connect with instructors and peers in real-time. Join weekly live workshops, office hours, and collaborative coding sessions to get your questions answered.</p>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>
      {/* Final CTA */}
      <ScrollReveal delay={0.1}>
        <section className="py-24 px-6 text-center">
          <div className="mx-auto max-w-3xl rounded-3xl bg-gradient-to-r from-violet-600 to-blue-600 p-12 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-6">Experience the difference ourselves</h2>
              <p className="mb-10 text-white/80 text-lg">Join 200,000+ others who have already chosen the smarter way to learn.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup" className="bg-white text-violet-600 px-8 py-3 rounded-xl font-bold hover:bg-slate-100 transition-colors">Get Started Free</Link>
                <Link href="/courses" className="bg-violet-700/50 backdrop-blur-sm border border-white/20 text-white px-8 py-3 rounded-xl font-bold hover:bg-violet-700/60 transition-colors">Explore Courses</Link>
              </div>
            </div>
            {/* Background elements */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />
          </div>
        </section>
      </ScrollReveal>
      {/* Footer */}
      <ScrollReveal delay={0.1}>
        <Footer />
      </ScrollReveal>
    </div>
  );
}
