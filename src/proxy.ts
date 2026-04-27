import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  // Lakukan pengecekan atau logika middleware (proxy) kamu di sini
  // Misalnya, pengecekan sesi login sebelum masuk ke /(karyawan)

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Jalankan proxy pada semua rute KECUALI:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
