import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import LoginForm from "@/src/features/auth/components/LoginForm";

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (session && session.user) {
    if (session.user.role === "bos") {
      redirect("/dashboard");
    } else {
      redirect("/bungkus");
    }
  }

  return <LoginForm />;
}
