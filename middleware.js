import { NextResponse } from "next/server";
import { ROLE_ROUTES } from "./src/components/constants/roles";

// ============================================================
// EDGE AUTH GUARD
//
// Runs on the server before a protected page is ever sent to the browser,
// so an unauthenticated deep link (or a user whose role doesn't own the
// route) is redirected without the page — and any data it would fetch —
// briefly rendering first. src/components/ProtectedRoute.js stays as the
// client-side belt-and-suspenders (it also does the nicer router.back()).
//
// The backend is still the real authority: every API call re-checks the
// JWT and object ownership. This layer removes the content-flash / back-
// button race, and — when JWT_SECRET_KEY is provided to the frontend — is
// itself a verifying boundary.
// ============================================================

const AUTH_COOKIE = "access_token_cookie";

// Mirror of src/components/ProtectedRoute.js
const PUBLIC_ROUTES = new Set([
  "/",
  "/pricing",
  "/get-a-demo",
  "/contact-us",
  "/privacy-policy",
  "/terms-conditions",
  "/faq",
]);
const PUBLIC_PREFIXES = ["/mycareerguru"];

function isPublic(pathname) {
  return (
    PUBLIC_ROUTES.has(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))
  );
}

function b64urlToJson(segment) {
  const b64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const json = atob(b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), "="));
  return JSON.parse(json);
}

/** Verify an HS256 JWT with the Web Crypto API (Edge-native, no deps). */
async function verifyHS256(token, secret) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const sig = Uint8Array.from(
      atob(s.replace(/-/g, "+").replace(/_/g, "/")),
      (c) => c.charCodeAt(0),
    );
    const ok = await crypto.subtle.verify(
      "HMAC",
      key,
      sig,
      new TextEncoder().encode(`${h}.${p}`),
    );
    if (!ok) return null;
    return b64urlToJson(p);
  } catch {
    return null;
  }
}

function decodeUnverified(token) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    return b64urlToJson(parts[1]);
  } catch {
    return null;
  }
}

async function readSession(token) {
  const secret = process.env.JWT_SECRET_KEY;
  const payload = secret ? await verifyHS256(token, secret) : decodeUnverified(token);
  if (!payload) return null;
  if (payload.exp && Date.now() / 1000 >= payload.exp) return null;
  return payload;
}

function redirectTo(req, path) {
  const url = req.nextUrl.clone();
  url.pathname = path;
  url.search = "";
  return NextResponse.redirect(url);
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const publicRoute = isPublic(pathname);

  // No session
  if (!token) {
    return publicRoute ? NextResponse.next() : redirectTo(req, "/");
  }

  const session = await readSession(token);

  // Bad / expired token — clear it and treat as logged out
  if (!session) {
    if (publicRoute) return NextResponse.next();
    const res = redirectTo(req, "/");
    res.cookies.delete(AUTH_COOKIE);
    return res;
  }

  // Logged in on a public page (landing, mycareerguru, …) — let it render;
  // those pages decide what to show a signed-in visitor.
  if (publicRoute) return NextResponse.next();

  // Role must own the route
  const base = ROLE_ROUTES[session.role];
  if (!base || (pathname !== base && !pathname.startsWith(base + "/"))) {
    return redirectTo(req, base || "/");
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next internals, the API proxy, and anything with a file extension
  // (static assets under /public: /pics/*, /videos/*, favicons, …).
  matcher: ["/((?!_next/|api/|.*\\.[\\w]+$).*)"],
};
