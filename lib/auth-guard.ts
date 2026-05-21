import { auth } from "./auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function requireAuth(allowedRoles?: string[]) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new Error("Unauthorized: Anda harus login terlebih dahulu.");
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role as string)) {
    throw new Error("Forbidden: Anda tidak memiliki akses untuk aksi ini.");
  }

  return session;
}

export async function protectPageRoute(allowedRoles?: string[]) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/");
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role as string)) {
    if (session.user.role === "bos") {
      redirect("/dashboard");
    } else {
      redirect("/bungkus");
    }
  }

  return session;
}
