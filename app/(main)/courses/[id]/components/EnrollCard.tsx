import Link from "next/link";
import { getSession } from "@/lib/session";
import { getUserRoles } from "@/db/roles";
import { isAlreadyEnrolled } from "@/db/enrollment";
import { enrollAction, unenrollAction } from "../actions";
import { LoadingButton } from "@/components/loading-button";
import { FormProgress } from "@/components/form-progress";
import { PayButton } from "./PayButton";
import { 
    CheckCircle, 
    ShieldCheck, 
    Layers, 
    Users, 
    Clock 
} from "lucide-react";
import { TakaSymbol } from "@/components/taka-symbol";

export async function EnrollCard({ 
    courseId, 
    course,
}: { 
    courseId: number; 
    course: any;
}) {
    const session = await getSession();
    let viewerRole: "guest" | "student" | "instructor" | "admin" = "guest";
    let userId: number | null = null;
    let enrolled = false;

    if (session) {
        userId = session.user_id;
        const roles = await getUserRoles(userId);
        viewerRole = roles.some((r: any) => r.name === "admin") ? "admin" : (roles[0]?.name ?? "student");
        
        if (viewerRole === "student") {
            enrolled = await isAlreadyEnrolled(userId, courseId);
        }
    }

    const price = Number(course.price);
    const isPaid = price > 0;

    return (
        <div className="w-full max-w-sm rounded-2xl border border-border/50 bg-white dark:bg-white/10 p-6 shadow-2xl backdrop-blur-md dark:border-white/10">
            {/* Price */}
            <div className="mb-4 flex items-center gap-2">
                {price === 0 ? (
                    <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                        Free
                    </span>
                ) : (
                    <>
                        <TakaSymbol className="text-lg font-semibold text-muted-foreground" />
                        <span className="text-3xl font-extrabold text-foreground">
                            {price.toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground/60">BDT</span>
                    </>
                )}
            </div>

            {/* ── CTA based on role & enrollment state ────────────────────────── */}

            {/* Guest */}
            {viewerRole === "guest" && (
                <Link
                    href={`/signup?next=/courses/${courseId}`}
                    className="mb-3 block w-full rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 py-3 text-center text-sm font-bold text-white shadow-lg transition hover:shadow-xl hover:-translate-y-0.5"
                >
                    Sign Up to Enroll
                </Link>
            )}

            {/* Student — not enrolled */}
            {viewerRole === "student" && !enrolled && (
                <>
                    {isPaid ? (
                        /* Paid course → SSLCommerz payment flow */
                        <PayButton courseId={courseId} price={price} />
                    ) : (
                        /* Free course → direct enrollment */
                        <form action={enrollAction} className="mb-3">
                            <FormProgress />
                            <input type="hidden" name="course_id" value={courseId} />
                            <LoadingButton
                                type="submit"
                                className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 py-6 text-sm font-bold text-white shadow-lg transition hover:shadow-xl hover:-translate-y-0.5"
                                loadingText="Enrolling..."
                            >
                                Enroll for Free
                            </LoadingButton>
                        </form>
                    )}
                </>
            )}

            {/* Student — already enrolled */}
            {viewerRole === "student" && enrolled && (
                <div className="mb-3 space-y-2">
                    <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/20 py-3 text-sm font-semibold text-emerald-600 dark:text-emerald-300">
                        <CheckCircle className="h-4 w-4" />
                        You&apos;re enrolled!
                    </div>
                    <form action={unenrollAction}>
                        <FormProgress />
                        <input type="hidden" name="course_id" value={courseId} />
                        <LoadingButton
                            type="submit"
                            variant="outline"
                            className="w-full rounded-xl border border-border/50 bg-gray-50/50 py-5 text-xs font-semibold text-foreground/70 transition hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-300 hover:border-red-400/30 dark:border-white/20 dark:bg-white/10 dark:text-white/70"
                            loadingText="Unenrolling..."
                        >
                            Unenroll
                        </LoadingButton>
                    </form>
                </div>
            )}

            {viewerRole === "instructor" && (
                <div className="mb-3 flex items-center justify-center gap-2 rounded-xl bg-violet-500/20 py-3 text-sm font-semibold text-violet-700 dark:text-violet-200">
                    <ShieldCheck className="h-4 w-4" />
                    Instructor View
                </div>
            )}
            {viewerRole === "admin" && (
                <div className="mb-3 flex items-center justify-center gap-2 rounded-xl bg-red-500/20 py-3 text-sm font-semibold text-red-700 dark:text-red-200">
                    <ShieldCheck className="h-4 w-4" />
                    Admin View
                </div>
            )}

            <Link
                href={viewerRole === "guest" ? `/signin?next=/courses/${courseId}` : "#curriculum"}
                className="block w-full rounded-xl border border-border/50 bg-gray-50/50 py-3 text-center text-sm font-semibold text-foreground/90 transition hover:bg-gray-100 dark:border-white/20 dark:bg-white/10 dark:text-white/90 dark:hover:bg-white/20"
            >
                {viewerRole === "guest" ? "Sign In" : "View Curriculum"}
            </Link>

            {/* Quick facts */}
            <ul className="mt-5 flex flex-col gap-2 text-xs text-muted-foreground/80">
                <li className="flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5 text-violet-600 dark:text-violet-300 flex-shrink-0" />
                    {course.module_count}{" "}
                    {Number(course.module_count) === 1 ? "module" : "modules"}
                </li>
                <li className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-violet-600 dark:text-violet-300 flex-shrink-0" />
                    {course.student_count} students enrolled
                </li>
                <li className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-violet-600 dark:text-violet-300 flex-shrink-0" />
                    Self-paced, learn anytime
                </li>
                <li className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-violet-600 dark:text-violet-300 flex-shrink-0" />
                    Certificate of completion
                </li>
                {isPaid && (
                    <li className="flex items-center gap-2">
                        <TakaSymbol className="h-3.5 w-3.5 text-violet-600 dark:text-violet-300 flex-shrink-0" />
                        Secure payment via SSLCommerz
                    </li>
                )}
            </ul>
        </div>
    );
}
