export const SESSION_COOKIE_NAME = "session";

const PUBLIC_PATHS = new Set([
  "/",
  "/signin",
  "/signup",
  "/features",
  "/privacy",
  "/terms",
  "/contact",
  "/courses",
]);

const PUBLIC_PREFIXES = [
  "/courses/",
  "/payment/",
  "/api/payment/"
];

export function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true;
  return PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix));
}


export function isApiPath(pathname: string) {
  return pathname.startsWith("/api/");
}
