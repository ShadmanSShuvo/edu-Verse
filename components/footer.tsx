import Link from "next/link";
import Image from "next/image";

export function Footer() {
    return (
        <footer className="border-t border-gray-100 dark:border-white/5 bg-white dark:bg-slate-950">
            <div className="mx-auto max-w-6xl px-6 py-10">
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
                    <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
                        <Link href="/" className="flex items-center gap-2">
                            <Image
                                src="/logo.svg"
                                alt="eduVerse"
                                width={120}
                                height={40}
                                className="h-8 w-auto dark:invert"
                            />
                        </Link>
                        {/* Shifting links to the left/middle area to avoid overlap with AI chat button on the right */}
                        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                            <Link href="/features" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Features</Link>
                            <Link href="/courses" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Courses</Link>
                            <Link href="/privacy" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Privacy</Link>
                            <Link href="/terms" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Terms</Link>
                            <Link href="/contact" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Contact</Link>
                        </div>
                    </div>
                    
                    <p className="text-sm text-gray-400 dark:text-gray-500 order-last sm:order-none">
                        © {new Date().getFullYear()} EduVerse. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
