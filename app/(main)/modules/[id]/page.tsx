import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getUserRoles } from "@/db/roles";
import { getModules } from "@/db/modules";
import { getCommentsWithReplies } from "@/db/comments";
import {
    postCommentAction,
    deleteCommentAction,
    postReplyAction,
    deleteReplyAction,
} from "./actions";
import {
    MessageCircle,
    ArrowLeft,
    Layers,
    BookOpen,
    ChevronDown,
    Send,
    Trash2,
    Reply,
    GraduationCap,
    MessageSquare,
    AlertCircle,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

type ReplyRow = {
    reply_id: number;
    comment_id: number;
    reply_text: string;
    replier_user_id: number | null;
    replier_name: string;
};

type CommentRow = {
    comment_id: number;
    user_id: number;
    comment_text: string;
    time: string;
    user_name: string;
    replies: ReplyRow[];
};

// ── Relative time formatter ────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric"
    });
}

// ── Initials avatar ────────────────────────────────────────────────────────────

function Avatar({ name, size = "md", isInstructor = false }: { name: string; size?: "sm" | "md"; isInstructor?: boolean }) {
    const initials = name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const dim = size === "sm" ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-xs";
    const colour = isInstructor
        ? "bg-gradient-to-br from-violet-500 to-blue-600"
        : "bg-gradient-to-br from-blue-400 to-cyan-500";

    return (
        <div className={`flex flex-shrink-0 items-center justify-center rounded-full font-bold text-white ${dim} ${colour}`}>
            {initials}
        </div>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────────

import { Footer } from "@/components/footer";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { HeroReveal } from "@/components/ui/hero-reveal";

export default async function ModuleDiscussionPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const moduleId = parseInt(id, 10);
    if (isNaN(moduleId)) notFound();

    const session = await getSession();
    if (!session) redirect(`/signin?redirect=/modules/${moduleId}`);

    const roles = await getUserRoles(session.user_id);
    const role = roles[0]?.name ?? "student";
    const isInstructor = role === "instructor";

    // We need the module info — fetch all modules and find the right one
    // (no getModuleById helper, but modules are small)
    const allModules = await getModules();
    const mod = allModules.find((m: { module_id: number }) => m.module_id === moduleId);
    if (!mod) notFound();

    const comments = (await getCommentsWithReplies(moduleId)) as CommentRow[];

    return (
        <div className="min-h-screen bg-gray-50">


            {/* ── HERO ─────────────────────────────────────────────────────────────── */}
            <div className="relative isolate overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-900 py-12">
                <div
                    aria-hidden
                    className="absolute inset-0 -z-10"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle at 15% 50%, rgba(99,102,241,0.3) 0%, transparent 50%), radial-gradient(circle at 85% 20%, rgba(139,92,246,0.2) 0%, transparent 50%)",
                    }}
                />
                <HeroReveal className="mx-auto max-w-4xl px-6">
                    <Link
                        href="/modules"
                        className="mb-6 inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to Modules
                    </Link>

                    <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80 backdrop-blur-sm">
                        <MessageCircle className="h-3.5 w-3.5 text-indigo-300" />
                        Module Discussion
                    </div>

                    <h1 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">
                        {mod.title}
                    </h1>
                    {mod.description && (
                        <p className="mt-2 text-sm text-white/50">{mod.description}</p>
                    )}

                    <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-white/40">
                        <span className="flex items-center gap-1.5">
                            <MessageSquare className="h-3.5 w-3.5" />
                            {comments.length} question{comments.length !== 1 ? "s" : ""}
                        </span>
                        {isInstructor ? (
                            <span className="flex items-center gap-1.5 text-violet-300">
                                <GraduationCap className="h-3.5 w-3.5" />
                                Instructor view — you can reply to questions
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 text-blue-300">
                                <Layers className="h-3.5 w-3.5" />
                                Ask questions — instructors will reply
                            </span>
                        )}
                    </div>
                </HeroReveal>
            </div>

            {/* ── BODY ─────────────────────────────────────────────────────────────── */}
            <div className="mx-auto max-w-4xl px-6 py-10">

                {/* ── POST QUESTION (students only) ─────────────────────────────────── */}
                {!isInstructor && (
                    <ScrollReveal delay={0.1}>
                        <div className="mb-8 rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
                            <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
                                <MessageCircle className="h-4 w-4 text-indigo-500" />
                                Ask a Question
                            </p>
                            <form action={postCommentAction} className="space-y-3">
                                <input type="hidden" name="module_id" value={moduleId} />
                                <textarea
                                    name="comment_text"
                                    required
                                    rows={3}
                                    placeholder="Type your question here… Be specific so your instructor can help you better."
                                    className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                                />
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                                    >
                                        <Send className="h-4 w-4" />
                                        Post Question
                                    </button>
                                </div>
                            </form>
                        </div>
                    </ScrollReveal>
                )}

                {/* ── INSTRUCTOR NOTICE ─────────────────────────────────────────────── */}
                {isInstructor && (
                    <ScrollReveal delay={0.1}>
                        <div className="mb-8 flex items-start gap-3 rounded-2xl border border-violet-200 bg-violet-50 px-5 py-4">
                            <GraduationCap className="mt-0.5 h-5 w-5 flex-shrink-0 text-violet-600" />
                            <div>
                                <p className="text-sm font-semibold text-violet-900">Instructor Mode</p>
                                <p className="text-xs text-violet-600 mt-0.5">
                                    You can reply to student questions. Use the reply box below each question.
                                </p>
                            </div>
                        </div>
                    </ScrollReveal>
                )}

                {/* ── COMMENTS LIST ─────────────────────────────────────────────────── */}
                {comments.length === 0 ? (
                    <ScrollReveal delay={0.1}>
                        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center shadow-sm">
                            <AlertCircle className="h-12 w-12 text-gray-200" />
                            <p className="text-base font-semibold text-gray-400">No questions yet</p>
                            <p className="text-sm text-gray-400">
                                {isInstructor
                                    ? "Students haven't posted any questions for this module yet."
                                    : "Be the first to ask a question!"}
                            </p>
                        </div>
                    </ScrollReveal>
                ) : (
                    <div className="space-y-5">
                        {comments.map((comment, idx) => (
                            <ScrollReveal key={comment.comment_id} delay={0.2 + (idx * 0.05)}>
                                <CommentCard
                                    comment={comment}
                                    moduleId={moduleId}
                                    currentUserId={session.user_id}
                                    isInstructor={isInstructor}
                                />
                            </ScrollReveal>
                        ))}
                    </div>
                )}
            </div>

            <ScrollReveal delay={0.1}>
                <Footer />
            </ScrollReveal>
        </div>
    );
}

// ── Comment Card ───────────────────────────────────────────────────────────────

function CommentCard({
    comment,
    moduleId,
    currentUserId,
    isInstructor,
}: {
    comment: CommentRow;
    moduleId: number;
    currentUserId: number;
    isInstructor: boolean;
}) {
    const isOwner = comment.user_id === currentUserId;
    const canDelete = isOwner || isInstructor;

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

            {/* ── Question ──────────────────────────────────────────────────────── */}
            <div className="flex items-start gap-3 px-5 py-4">
                <Avatar name={comment.user_name} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                            {comment.user_name}
                            {isOwner && !isInstructor && (
                                <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-indigo-500">You</span>
                            )}
                        </span>
                        <span className="shrink-0 text-[11px] text-gray-400">
                            {formatDate(comment.time)}
                        </span>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                        {comment.comment_text}
                    </p>
                </div>

                {/* Delete comment */}
                {canDelete && (
                    <form action={deleteCommentAction} className="shrink-0">
                        <input type="hidden" name="comment_id" value={comment.comment_id} />
                        <input type="hidden" name="module_id" value={moduleId} />
                        <input type="hidden" name="owner_user_id" value={comment.user_id} />
                        <button
                            type="submit"
                            title="Delete question"
                            className="rounded-lg border border-red-100 p-1.5 text-red-300 hover:bg-red-50 hover:text-red-500 transition"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </form>
                )}
            </div>

            {/* ── Replies ───────────────────────────────────────────────────────── */}
            {(comment.replies.length > 0 || isInstructor) && (
                <div className="border-t border-gray-100 bg-gradient-to-b from-violet-50/30 to-transparent px-5 pb-4 pt-3">

                    {/* Existing replies */}
                    {comment.replies.length > 0 && (
                        <div className="mb-3 space-y-3">
                            {comment.replies.map((reply) => (
                                <div key={reply.reply_id} className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center">
                                        <Reply className="h-3.5 w-3.5 rotate-180 text-violet-400" />
                                    </div>
                                    <Avatar name={reply.replier_name} size="sm" isInstructor />
                                    <div className="flex-1 min-w-0 rounded-xl bg-violet-50 px-3 py-2">
                                        <div className="flex items-baseline justify-between gap-2">
                                            <span className="flex items-center gap-1.5 text-xs font-semibold text-violet-800">
                                                {reply.replier_name}
                                                <span className="inline-flex items-center gap-0.5 rounded-full bg-violet-200 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-violet-700">
                                                    <GraduationCap className="h-2.5 w-2.5" />
                                                    Instructor
                                                </span>
                                            </span>
                                            {/* Delete reply (instructor only) */}
                                            {isInstructor && (
                                                <form action={deleteReplyAction}>
                                                    <input type="hidden" name="reply_id" value={reply.reply_id} />
                                                    <input type="hidden" name="module_id" value={moduleId} />
                                                    <button
                                                        type="submit"
                                                        title="Delete reply"
                                                        className="rounded p-0.5 text-red-300 hover:text-red-500 transition"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                </form>
                                            )}
                                        </div>
                                        <p className="mt-1 text-xs leading-relaxed text-violet-900 whitespace-pre-wrap">
                                            {reply.reply_text}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Reply form (instructor only) */}
                    {isInstructor && (
                        <details className="group">
                            <summary className="flex cursor-pointer list-none items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-800 transition">
                                <Reply className="h-3.5 w-3.5 rotate-180" />
                                {comment.replies.length > 0 ? "Add another reply" : "Reply to this question"}
                                <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
                            </summary>

                            <form action={postReplyAction} className="mt-3 space-y-3">
                                <input type="hidden" name="comment_id" value={comment.comment_id} />
                                <input type="hidden" name="module_id" value={moduleId} />
                                <textarea
                                    name="reply_text"
                                    required
                                    rows={3}
                                    placeholder="Type your reply…"
                                    className="w-full resize-none rounded-xl border border-violet-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                                />
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                                    >
                                        <Send className="h-3.5 w-3.5" />
                                        Post Reply
                                    </button>
                                </div>
                            </form>
                        </details>
                    )}

                    {/* No replies yet — student hint */}
                    {comment.replies.length === 0 && !isInstructor && (
                        <p className="flex items-center gap-1.5 text-xs italic text-gray-400">
                            <Reply className="h-3.5 w-3.5 rotate-180" />
                            Waiting for instructor reply…
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
