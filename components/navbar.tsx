import Link from "next/link";
import { Home, BookOpen, Layers, Trophy, LayoutDashboard, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/session";
import { getUserRoles } from "@/db/roles";
import { getNotifications } from "@/db/notifications";
import { NotificationBell } from "@/components/notification-bell";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";

import { ProfileDropdown } from "@/components/profile-dropdown";

import Image from "next/image";
import { AnimatedLogo } from "@/components/animated-logo";

export async function Navbar() {
  // getSession is React.cache()'d — if the page also calls it, only 1 DB query fires.
  const session = await getSession();

  // getUserRoles and getNotifications are independent — run them in parallel.
  const [roles, notifications] = await Promise.all([
    session ? getUserRoles(session.user_id) : Promise.resolve([]),
    session ? getNotifications(session.user_id) : Promise.resolve([]),
  ]);

  const roleName = (roles as { name: string }[])[0]?.name;
  const isInstructor = roleName === "instructor";
  const isAdmin = roleName === "admin";

  const dashboardHref = isAdmin
    ? "/admin"
    : isInstructor
      ? "/instructor"
      : "/dashboard";

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">

        <AnimatedLogo />

        {/* Centre nav */}
        <nav className="hidden items-center gap-1 sm:flex">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
          {session && (
            <Link
              href={dashboardHref}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
            >
              {isAdmin
                ? <LayoutDashboard className="h-4 w-4" />
                : isInstructor
                  ? <GraduationCap className="h-4 w-4" />
                  : <LayoutDashboard className="h-4 w-4" />}
              {isAdmin
                ? "Admin Panel"
                : isInstructor
                  ? "Instructor Hub"
                  : "Dashboard"}
            </Link>
          )}
          {session && !isInstructor && !isAdmin && (
            <Link
              href="/my-courses"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <BookOpen className="h-4 w-4" />
              My Courses
            </Link>
          )}
          <Link
            href="/courses"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <BookOpen className="h-4 w-4" />
            Courses
          </Link>
          {!isAdmin && (
            <>
              <Link
                href="/modules"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <Layers className="h-4 w-4" />
                Modules
              </Link>
              <Link
                href="/exams"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <Trophy className="h-4 w-4" />
                Exams
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {session ? (
            <>
              {/* 🔔 Notification bell */}
              <NotificationBell initial={notifications} />

              <ProfileDropdown 
                user={{
                  name: session.name,
                  email: session.email,
                  user_id: session.user_id,
                  avatar_url: session.avatar_url
                }} 
                isInstructor={isInstructor}
              />
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/signin">Sign In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}

          <MobileNav
            session={!!session}
            dashboardHref={dashboardHref}
            isAdmin={isAdmin}
            isInstructor={isInstructor}
          />
        </div>
      </div>
    </header>
  );
}
