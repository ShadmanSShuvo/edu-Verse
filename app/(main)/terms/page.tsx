import { Footer } from "@/components/footer";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { HeroReveal } from "@/components/ui/hero-reveal";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100">

      <main className="mx-auto max-w-4xl px-6 py-24 sm:py-32">
        <HeroReveal>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-8">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </HeroReveal>

        <div className="prose dark:prose-invert max-w-none">
          <div className="space-y-12 text-gray-600 dark:text-gray-400">
            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">1. Terms</h2>
                <p>
                  By accessing the website at EduVerse, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">2. Use License</h2>
                <p>
                  Permission is granted to temporarily download one copy of the materials (information or software) on EduVerse's website for personal, non-commercial transitory viewing only.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">3. Disclaimer</h2>
                <p>
                  The materials on EduVerse's website are provided on an 'as is' basis. EduVerse makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">4. Limitations</h2>
                <p>
                  In no event shall EduVerse or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on EduVerse's website.
                </p>
              </section>
            </ScrollReveal>
          </div>
        </div>
      </main>
      <ScrollReveal delay={0.1}>
        <Footer />
      </ScrollReveal>
    </div>
  );
}
