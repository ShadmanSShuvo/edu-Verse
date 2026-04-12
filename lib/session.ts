import crypto from "crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import {
  insertSession,
  getSessionByToken,
  deleteSessionByToken,
} from "@/db/sessions";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

const SESSION_DURATION_DAYS = 7;

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function createUserSession(userId: number) {
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  await insertSession(token, userId, expiresAt);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

// React.cache() deduplicates within a single render pass:
// if Navbar and the page component both call getSession(),
// only ONE DB query is executed per request.
export const getSession = cache(async function _getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await getSessionByToken(token);
  if (!session) return null;

  if (new Date(session.expires_at) < new Date()) {
    await deleteSessionByToken(token);
    return null;
  }

  return session as {
    token: string;
    user_id: number;
    name: string;
    email: string;
    avatar_url?: string | null;
    expires_at: string;
  };
});

export async function deleteSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    await deleteSessionByToken(token);
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
}
