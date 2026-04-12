import { NextRequest, NextResponse } from "next/server";
import { createModule } from "@/db/modules";

export async function POST(request: NextRequest) {
  try {
    // Check for authorization: Either a session OR a secret key
    const secret = request.headers.get("x-api-secret");
    const isValidSecret = secret === process.env.ADMIN_SETUP_SECRET;

    if (!isValidSecret) {
      // If no valid secret, we might let the proxy middleware handle the session,
      // but since we want to support scripts, we check the secret first.
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { course_id, title, description } = body;

    if (!course_id || !title) {
      return NextResponse.json(
        { error: "course_id and title are required" },
        { status: 400 }
      );
    }

    const newModule = await createModule(Number(course_id), title, description || "");
    return NextResponse.json(newModule, { status: 201 });
  } catch (error: any) {
    console.error("Error creating module via API:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
