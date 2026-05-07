import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BOS_ROUTES = ["/dashboard", "/laporan", "/stock"];

const KARYAWAN_ROUTES = ["/meja", "/bungkus", "/pos", "/riwayat", "/more"];

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  try {
    const baseUrl = process.env.BETTER_AUTH_URL ?? request.nextUrl.origin;
    const response = await fetch(`${baseUrl}/api/auth/get-session`, {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });

    const session = await response.json();

    if (path === "/") {
      if (session && session.user) {
        const role = session.user.role as string;
        return NextResponse.redirect(
          new URL(role === "bos" ? "/dashboard" : "/bungkus", request.url),
        );
      }
      return NextResponse.next();
    }

    if (!session || !session.user) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const role = session.user.role as string;

    if (role === "karyawan" && BOS_ROUTES.some((r) => path.startsWith(r))) {
      return NextResponse.redirect(new URL("/bungkus", request.url));
    }

    if (role === "bos" && KARYAWAN_ROUTES.some((r) => path.startsWith(r))) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } catch (error) {
    console.error("Middleware fetch error:", error);
    if (path !== "/") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  const response = NextResponse.next();

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
