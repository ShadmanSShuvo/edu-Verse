import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getUserRoles } from "@/db/roles";
import { getStudentEnrollments } from "@/db/enrollment";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const roles = await getUserRoles(session.user_id);
  const roleName = roles[0]?.name ?? "student";
  if (roleName !== "student") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const enrollments = await getStudentEnrollments(session.user_id);

  const payload = enrollments.map(
    (e: {
      course_id: number;
      title: string;
      description: string | null;
      progress: number;
    }) => ({
      course_id: e.course_id,
      title: e.title,
      description: e.description,
      progress: e.progress,
    })
  );

  return NextResponse.json(payload);
}
