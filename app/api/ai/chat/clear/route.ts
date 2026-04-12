import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { clearChatHistory } from "@/db/chat";

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await clearChatHistory(session.user_id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to clear history" }, { status: 500 });
  }
}
