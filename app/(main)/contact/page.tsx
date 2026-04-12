import { Footer } from "@/components/footer";
import { ContactForm } from "./contact-form";
import { Mail, MapPin, Phone } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { HeroReveal } from "@/components/ui/hero-reveal";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100">
      <main className="mx-auto max-w-4xl px-6 py-24 sm:py-32">
        <HeroReveal>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-8">
            Contact Us
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-12">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </HeroReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <ScrollReveal delay={0.1}>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email</h3>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">support@eduverse.com</p>
                  <p className="text-gray-600 dark:text-gray-400">hello@eduverse.com</p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Phone</h3>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">+880 1711-223344</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Sun-Thu from 10am to 6pm</p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Office</h3>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">
                    Plot 12, Level 4, Block C<br />
                    Banani, Dhaka 1213<br />
                    Bangladesh
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Contact Form Details */}
          <ScrollReveal delay={0.1}>
            <ContactForm />
          </ScrollReveal>
        </div>
      </main>
      <ScrollReveal delay={0.1}>
        <Footer />
      </ScrollReveal>
    </div>
  );
}
