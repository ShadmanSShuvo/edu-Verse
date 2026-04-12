import { Footer } from "@/components/footer";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { HeroReveal } from "@/components/ui/hero-reveal";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100">

      <main className="mx-auto max-w-4xl px-6 py-24 sm:py-32">
        <HeroReveal>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-8">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </HeroReveal>

        <div className="prose dark:prose-invert max-w-none">
          <div className="space-y-12 text-gray-600 dark:text-gray-400">
            <ScrollReveal delay={0.1}>
              <p>
                Your privacy is important to us. It is EduVerse's policy to respect your privacy regarding any information we may collect from you across our website.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Information we collect</h2>
                <p>
                  We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we're collecting it and how it will be used.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">How we use your information</h2>
                <p>
                  We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we'll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Contact us</h2>
                <p>
                  If you have any questions about how we handle user data and personal information, feel free to contact us.
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
