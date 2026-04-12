import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getUserRoles } from "@/db/roles";
import { getInstructorByUserId, getInstructorStats } from "@/db/instructor";
import { getInstructorCourses } from "@/db/instructs";
import { getStudentByUserId } from "@/db/student";
import { getStudentEnrollments } from "@/db/enrollment";
import { getAttempts } from "@/db/attempt";
import { getReviews } from "@/db/review";
import { getRolePermissions } from "@/db/permissions";
import { signOut, updateBioAction, updateProfileAction } from "./actions";
import {
  User,
  Mail,
  Phone,
  BookOpen,
  Users,
  Star,
  Trophy,
  Shield,
  LogOut,
  GraduationCap,
  Clock,
  CheckCircle,
  PenLine,
  CalendarDays,
  BarChart3,
  FileText,
  Layers,
  LayoutDashboard,
} from "lucide-react";
import { TakaSymbol } from "@/components/taka-symbol";

import { Avatar } from "./avatar";
import { FormProgress } from "@/components/form-progress";
import { HeroReveal } from "@/components/ui/hero-reveal";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

// ─────────────────────────── HELPERS ────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div
        className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${accent} text-white`}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
        <span className="text-violet-600">{icon}</span>
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─────────────────────────── PAGE ───────────────────────────────────────────

import { Footer } from "@/components/footer";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/signin");

  const roles = await getUserRoles(session.user_id);
  const isAdmin = roles.some((r: any) => r.name === "admin");
  const role = isAdmin ? "admin" : (roles[0]?.name ?? "student");
  const isInstructor = role === "instructor";

  // Permissions
  const roleId = roles[0]?.role_id;
  const permissions = roleId ? await getRolePermissions(roleId) : [];

  let profileData: Record<string, unknown> = {};

  if (isAdmin) {
    profileData = { isAdmin: true };
  } else if (isInstructor) {
    // ── Instructor data ──────────────────────────────────────────────────
    const instructor = await getInstructorByUserId(session.user_id);
    if (!instructor) redirect("/signin");

    const [courses, stats] = await Promise.all([
      getInstructorCourses(instructor.instructor_id),
      getInstructorStats(instructor.instructor_id),
    ]);

    profileData = { instructor, courses, stats };
  } else {
    // ── Student data ─────────────────────────────────────────────────────
    const student = await getStudentByUserId(session.user_id);

    const [enrollments, reviews] = await Promise.all([
      getStudentEnrollments(session.user_id),
      getReviews(undefined, session.user_id),
    ]);

    let attempts: unknown[] = [];
    if (student) {
      attempts = await getAttempts(student.student_id);
    }

    profileData = { student, enrollments, reviews, attempts };
  }

  const joinedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  // ─────────────────────── RENDER ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">


      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* ── PROFILE HEADER ────────────────────────────────────────────── */}
        <HeroReveal>
          <div className="mb-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            {/* Banner */}
            <div
              className={`h-28 w-full bg-gradient-to-r ${isAdmin
                ? "from-slate-800 via-rose-900 to-red-900"
                : isInstructor
                  ? "from-violet-600 via-blue-600 to-indigo-600"
                  : "from-blue-500 via-cyan-500 to-emerald-500"
                }`}
            />

            <ScrollReveal delay={0.1}>
              <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end sm:gap-6">
                {/* Avatar overlapping banner */}
                <div className="-mt-10">
                  <Avatar name={session.name} avatarUrl={session.avatar_url} size="lg" />
                </div>
                <div className="flex flex-1 flex-col gap-1 sm:pb-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {session.name}
                    </h1>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize ${isAdmin
                        ? "bg-red-100 text-red-700"
                        : isInstructor
                          ? "bg-violet-100 text-violet-700"
                          : "bg-blue-100 text-blue-700"
                        }`}
                    >
                      {isAdmin ? (
                        <Shield className="h-3.5 w-3.5" />
                      ) : isInstructor ? (
                        <GraduationCap className="h-3.5 w-3.5" />
                      ) : (
                        <BookOpen className="h-3.5 w-3.5" />
                      )}
                      {role}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      {session.email}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Joined {joinedDate}
                    </span>
                  </div>
                </div>

                {/* Sign-out */}
                <form action={signOut}>
                  <FormProgress />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </form>
              </div>
            </ScrollReveal>
          </div>
        </HeroReveal>

        {/* ── CONTENT GRID ──────────────────────────────────────────────── */}
        <ScrollReveal delay={0.1}>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
            <div className="flex flex-col gap-6 lg:col-span-1">
              {/* Edit Profile */}
              <SectionCard
                title="Edit Profile"
                icon={<PenLine className="h-4 w-4" />}
              >
                <form action={updateProfileAction} className="flex flex-col gap-4">
                  <FormProgress />
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Full Name
                    </label>
                    <input
                      name="name"
                      defaultValue={session.name}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Phone Number
                    </label>
                    <input
                      name="phone"
                      defaultValue={
                        isInstructor
                          ? ((profileData.instructor as Record<string, string>)?.phone_no ?? "")
                          : ((profileData.student as Record<string, string>)?.phone_no ?? "")
                      }
                      placeholder="+880 1711-223344"
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Save Changes
                  </button>
                </form>
              </SectionCard>

              {/* Contact Info */}
              <SectionCard
                title="Contact Info"
                icon={<User className="h-4 w-4" />}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <span className="break-all text-gray-700">{session.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <span className="text-gray-700">
                      {(isInstructor
                        ? (profileData.instructor as Record<string, string>)?.phone_no
                        : (profileData.student as Record<string, string>)?.phone_no) || (
                          <span className="italic text-gray-400">Not provided</span>
                        )}
                    </span>
                  </div>
                </div>
              </SectionCard>

              {/* Permissions */}
              <SectionCard
                title="Permissions"
                icon={<Shield className="h-4 w-4" />}
              >
                {permissions.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">
                    No permissions assigned yet.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {permissions.map(
                      (p: { perm_id: number; name: string }) => (
                        <li key={p.perm_id} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                          <span className="text-gray-700 capitalize">{p.name}</span>
                        </li>
                      )
                    )}
                  </ul>
                )}
              </SectionCard>
            </div>

            {/* ── RIGHT COLUMN ────────────────────────────────────────────── */}
            <div className="flex flex-col gap-6 lg:col-span-2">
              {isAdmin ? (
                <AdminView />
              ) : isInstructor ? (
                <InstructorView data={profileData} permissions={permissions} />
              ) : (
                <StudentView data={profileData} />
              )}
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

// ──────────────────────── ADMIN VIEW ───────────────────────────────────────

function AdminView() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Shield className="h-5 w-5" />}
          label="Access Level"
          value="Super Admin"
          accent="bg-gradient-to-br from-red-600 to-rose-700"
        />
        <StatCard
          icon={<BarChart3 className="h-5 w-5" />}
          label="Platform Status"
          value="Healthy"
          accent="bg-gradient-to-br from-emerald-500 to-teal-600"
        />
        <StatCard
          icon={<Shield className="h-5 w-5" />}
          label="System Role"
          value="Root"
          accent="bg-gradient-to-br from-slate-700 to-gray-900"
        />
      </div>

      <SectionCard title="Admin Capabilities" icon={<Shield className="h-4 w-4" />}>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { label: "Manage all users & roles", icon: <Users className="h-4 w-4" /> },
            { label: "Full platform oversight", icon: <BarChart3 className="h-4 w-4" /> },
            { label: "Content moderation", icon: <Layers className="h-4 w-4" /> },
            { label: "System settings access", icon: <Shield className="h-4 w-4" /> },
            { label: "Audit logs & tracking", icon: <FileText className="h-4 w-4" /> },
            { label: "Database management", icon: <Shield className="h-4 w-4" /> },
          ].map((cap, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm text-gray-700"
            >
              <span className="text-red-500">{cap.icon}</span>
              {cap.label}
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-red-950 p-8 text-white shadow-xl">
        <h3 className="mb-2 text-xl font-bold">Administrative Dashboard</h3>
        <p className="mb-6 text-sm text-white/70">
          You have full control over the platform. Access the Admin Panel to manage users, courses, and view system-wide analytics.
        </p>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-xl bg-white/100 px-6 py-3 text-sm font-bold text-slate-900 shadow-lg transition hover:bg-white/90 hover:-translate-y-0.5"
        >
          <LayoutDashboard className="h-4 w-4" />
          Go to Admin Panel
        </Link>
      </div>
    </div>
  );
}

// ──────────────────────── INSTRUCTOR VIEW ────────────────────────────────────

type InstructorData = {
  instructor: {
    instructor_id: number;
    bio: string | null;
    name: string;
    email: string;
    phone_no: string | null;
    created_at: string;
  };
  courses: {
    course_id: number;
    title: string;
    description: string;
    price: number;
  }[];
  stats: {
    course_count: string;
    student_count: string;
  };
};

async function InstructorView({
  data,
  permissions,
}: {
  data: Record<string, unknown>;
  permissions: any[];
}) {
  const { instructor, courses, stats } = data as InstructorData;

  return (
    <>
      {/* Stats summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<BookOpen className="h-5 w-5" />}
          label="Courses Created"
          value={stats?.course_count ?? 0}
          accent="bg-gradient-to-br from-violet-500 to-purple-600"
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Total Students"
          value={stats?.student_count ?? 0}
          accent="bg-gradient-to-br from-blue-500 to-cyan-600"
        />
        <StatCard
          icon={<Star className="h-5 w-5" />}
          label="Role"
          value="Instructor"
          accent="bg-gradient-to-br from-amber-500 to-orange-500"
        />
      </div>

      {/* Bio editor */}
      <SectionCard title="Instructor Bio" icon={<FileText className="h-4 w-4" />}>
        <form action={updateBioAction} className="flex flex-col gap-3">
          <FormProgress />
          <input
            type="hidden"
            name="instructor_id"
            value={instructor.instructor_id}
          />
          <textarea
            name="bio"
            rows={4}
            defaultValue={instructor.bio ?? ""}
            placeholder="Write a short bio to introduce yourself to your students..."
            className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
          />
          <button
            type="submit"
            className="self-end rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
          >
            Update Bio
          </button>
        </form>
      </SectionCard>

      {/* Courses taught */}
      <ScrollReveal delay={0.1}>
        <SectionCard
          title="My Courses"
          icon={<Layers className="h-4 w-4" />}
        >
          {courses.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <BookOpen className="h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-400">
                You haven&apos;t created any courses yet.
              </p>
              <Link
                href="#"
                className="text-sm font-semibold text-violet-600 hover:text-violet-700"
              >
                Create Your First Course →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {courses.map((c) => (
                <div
                  key={c.course_id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 transition hover:border-violet-200 hover:bg-violet-50/40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-gray-900">
                      {c.title}
                    </p>
                    {c.description && (
                      <p className="mt-0.5 truncate text-xs text-gray-500">
                        {c.description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <span className="flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      <TakaSymbol className="h-3 w-3" />
                      {Number(c.price) === 0 ? "Free" : `৳${c.price}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </ScrollReveal>

      {/* Instructor Permissions Panel */}
      <ScrollReveal delay={0.1}>
        <SectionCard
          title="Instructor Capabilities"
          icon={<Shield className="h-4 w-4" />}
        >
          {permissions.length === 0 ? (
            <p className="py-4 text-center text-sm italic text-gray-400">
              No specific instructor permissions assigned yet.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {permissions.map((p: { perm_id: number; name: string }) => (
                <div
                  key={p.perm_id}
                  className="flex items-center gap-2.5 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 transition hover:border-violet-200 hover:bg-violet-50/50"
                >
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span className="capitalize">{p.name.replace(/_/g, " ")}</span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </ScrollReveal>
    </>
  );
}

// ──────────────────────── STUDENT VIEW ───────────────────────────────────────

type Enrollment = {
  course_id: number;
  title: string;
  description: string;
  price: number;
};

type Attempt = {
  attempt_id: number;
  exam_title: string;
  time: string;
  score: number;
};

type Review = {
  review_id: number;
  course_title: string;
  rating: number;
  review_text: string;
};

type StudentData = {
  student: { student_id: number } | null;
  enrollments: Enrollment[];
  attempts: Attempt[];
  reviews: Review[];
};

async function StudentView({ data }: { data: Record<string, unknown> }) {
  const { enrollments, attempts, reviews } = data as StudentData;

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<BookOpen className="h-5 w-5" />}
          label="Enrolled Courses"
          value={enrollments.length}
          accent="bg-gradient-to-br from-blue-500 to-cyan-600"
        />
        <StatCard
          icon={<Trophy className="h-5 w-5" />}
          label="Exams Taken"
          value={attempts.length}
          accent="bg-gradient-to-br from-amber-500 to-orange-500"
        />
        <StatCard
          icon={<Star className="h-5 w-5" />}
          label="Reviews Written"
          value={reviews.length}
          accent="bg-gradient-to-br from-rose-500 to-pink-600"
        />
      </div>

      {/* Enrolled courses */}
      <ScrollReveal delay={0.1}>
        <SectionCard
          title="My Courses"
          icon={<BookOpen className="h-4 w-4" />}
        >
          {enrollments.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <GraduationCap className="h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-400">
                You&apos;re not enrolled in any courses yet.
              </p>
              <Link
                href="/"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Browse Courses →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {enrollments.map((e) => (
                <div
                  key={e.course_id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-gray-900">
                      {e.title}
                    </p>
                    {e.description && (
                      <p className="mt-0.5 truncate text-xs text-gray-400">
                        {e.description}
                      </p>
                    )}
                  </div>
                  <span className="flex-shrink-0 rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    {Number(e.price) === 0 ? "Free" : `৳${e.price}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </ScrollReveal>

      {/* Exam attempts */}
      <ScrollReveal delay={0.1}>
        <SectionCard
          title="Exam Attempts"
          icon={<Trophy className="h-4 w-4" />}
        >
          {attempts.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-400 italic">
              No exam attempts yet.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {(attempts as Attempt[]).map((a) => {
                const score = Number(a.score);
                const color =
                  score >= 80
                    ? "text-emerald-600 bg-emerald-50"
                    : score >= 50
                      ? "text-amber-600 bg-amber-50"
                      : "text-red-600 bg-red-50";
                return (
                  <div
                    key={a.attempt_id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {a.exam_title}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        {new Date(a.time).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span
                      className={`flex-shrink-0 rounded-lg px-3 py-1 text-sm font-bold ${color}`}
                    >
                      {score}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </ScrollReveal>

      {/* Reviews */}
      <ScrollReveal delay={0.1}>
        <SectionCard
          title="My Reviews"
          icon={<Star className="h-4 w-4" />}
        >
          {reviews.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-400 italic">
              You haven&apos;t written any reviews yet.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {(reviews as Review[]).map((r) => (
                <div
                  key={r.review_id}
                  className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="font-semibold text-gray-900 text-sm">
                      {r.course_title}
                    </p>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`h-3.5 w-3.5 ${n <= r.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300"
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                  {r.review_text && (
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {r.review_text}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </ScrollReveal>
    </>
  );
}
