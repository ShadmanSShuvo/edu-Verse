import { NextRequest, NextResponse } from "next/server";
import { deleteSessionByToken, getSessionByToken } from "@/db/sessions";
import { isApiPath, isPublicPath, SESSION_COOKIE_NAME } from "@/lib/auth";

// Force Node.js runtime — the `pg` library uses Node.js crypto internally,
// which is not available in the default Edge runtime.
export const runtime = "nodejs";

function getUnauthorizedResponse(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isApiPath(pathname)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const signInUrl = new URL("/signin", request.url);
  const nextPath = `${pathname}${search}`;

  if (nextPath !== "/") {
    signInUrl.searchParams.set("next", nextPath);
  }

  return NextResponse.redirect(signInUrl);
}

function clearSessionCookie(response: NextResponse) {
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const secret = request.headers.get("x-api-secret");
  if (secret && secret === process.env.ADMIN_SETUP_SECRET) {
    return NextResponse.next();
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return getUnauthorizedResponse(request);
  }

  const session = await getSessionByToken(token);
  if (!session) {
    return clearSessionCookie(getUnauthorizedResponse(request));
  }

  if (new Date(session.expires_at) < new Date()) {
    await deleteSessionByToken(token);
    return clearSessionCookie(getUnauthorizedResponse(request));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)" ],
};
