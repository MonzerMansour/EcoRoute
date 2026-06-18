import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

/**
 * Protects the teacher/student app areas and APIs.
 * - Unauthenticated page requests → redirect to the relevant login.
 * - Unauthenticated API requests → 401 JSON.
 * - Authenticated users on the wrong role's area → redirect to their own.
 */
export default auth((req) => {
  const { nextUrl } = req;
  const path = nextUrl.pathname;
  const session = req.auth;
  const role = session?.user?.role;

  const isTeacherArea = path.startsWith("/teacher") || path.startsWith("/api/teacher");
  const isStudentArea = path.startsWith("/student") || path.startsWith("/api/student");
  if (!isTeacherArea && !isStudentArea) return;

  const isApi = path.startsWith("/api/");

  if (!session) {
    if (isApi) {
      return Response.json({ error: "Authentication required." }, { status: 401 });
    }
    const login = isStudentArea ? "/login/student" : "/login/teacher";
    const url = new URL(login, nextUrl);
    url.searchParams.set("callbackUrl", path);
    return Response.redirect(url);
  }

  // Role enforcement (pages only — APIs already scope data by owner).
  if (!isApi) {
    if (isTeacherArea && role === "student") {
      return Response.redirect(new URL("/student", nextUrl));
    }
    if (isStudentArea && role === "teacher") {
      return Response.redirect(new URL("/teacher", nextUrl));
    }
  }
});

export const config = {
  matcher: ["/teacher/:path*", "/student/:path*", "/api/teacher/:path*"],
};
