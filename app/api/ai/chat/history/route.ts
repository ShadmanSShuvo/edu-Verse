import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getChatHistory } from "@/db/chat";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      console.warn("History API: Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const history = await getChatHistory(session.user_id);
    return NextResponse.json(history);
  } catch (error: any) {
    console.error("History API Error:", error);
    return NextResponse.json({ error: "Failed to fetch history", details: error.message }, { status: 500 });
  }
}
