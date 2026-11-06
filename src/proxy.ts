import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const authSecret = process.env.NEXTAUTH_SECRET || "jmd-gems-dev-secret-change-me-in-env";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    if (req.nextUrl.pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login?next=/admin&reason=admin", req.url));
    }
    return NextResponse.next();
  },
  {
    secret: authSecret,
    callbacks: {
      authorized: ({ token, req }) => {
        if (!token) return false;
        if (req.nextUrl.pathname.startsWith("/admin")) return token.role === "ADMIN";
        return true;
      },
    },
    pages: { signIn: "/login" },
  },
);

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
