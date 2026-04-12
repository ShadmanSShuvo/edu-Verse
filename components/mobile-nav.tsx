"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Home, BookOpen, Layers, Trophy, LayoutDashboard, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileNavProps {
    session: boolean;
    dashboardHref: string;
    isAdmin: boolean;
    isInstructor: boolean;
}

export function MobileNav({ session, dashboardHref, isAdmin, isInstructor }: MobileNavProps) {
    const [isOpen, setIsOpen] = useState(false);
    const navRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (navRef.current && !navRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative sm:hidden" ref={navRef}>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
                className="dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
            >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {isOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-slate-900">
                    <Link
                        href="/"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
                    >
                        <Home className="h-4 w-4" />
                        Home
                    </Link>
                    {session ? (
                        <Link
                            href={dashboardHref}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
                        >
                            {isAdmin ? (
                                <LayoutDashboard className="h-4 w-4" />
                            ) : isInstructor ? (
                                <GraduationCap className="h-4 w-4" />
                            ) : (
                                <LayoutDashboard className="h-4 w-4" />
                            )}
                        {isAdmin ? "Admin Panel" : isInstructor ? "Instructor Hub" : "Dashboard"}
                        </Link>
                    ) : null}
                    {session && !isInstructor && !isAdmin && (
                        <Link
                            href="/my-courses"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
                        >
                            <BookOpen className="h-4 w-4" />
                            My Courses
                        </Link>
                    )}
                    <Link
                        href="/courses"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
                    >
                        <BookOpen className="h-4 w-4" />
                        Courses
                    </Link>
                    <Link
                        href="/modules"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
                    >
                        <Layers className="h-4 w-4" />
                        Modules
                    </Link>
                    <Link
                        href="/exams"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
                    >
                        <Trophy className="h-4 w-4" />
                        Exams
                    </Link>
                </div>
            )}
        </div>
    );
}
