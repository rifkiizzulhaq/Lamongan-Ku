"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { LuEye, LuEyeOff, LuLoader } from "react-icons/lu";
import Input from "@/src/components/ui/Input";
import Button from "@/src/components/ui/Button";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    await signIn.email(
      { email, password },
      {
        onSuccess: async () => {
          const res = await fetch("/api/auth/get-session");
          const sessionData = await res.json();
          const role = sessionData?.user?.role;

          if (role === "bos") {
            router.push("/dashboard");
          } else {
            router.push("/bungkus");
          }
          router.refresh();
        },
        onError: (ctx: { error: { message: string } }) => {
          const pesanError: Record<string, string> = {
            "Invalid credentials": "Email atau password salah.",
            "Invalid email or password": "Email atau password salah.",
            "User not found": "Akun tidak ditemukan.",
            "Email not verified": "Email belum diverifikasi.",
            "Too many requests": "Terlalu banyak percobaan, coba lagi nanti.",
          };
          const pesan =
            pesanError[ctx.error.message] ?? "Terjadi kesalahan, coba lagi.";
          setError(pesan);
          setLoading(false);
        },
      },
    );
  };

  return (
    <section className="w-full min-h-screen bg-white dark:bg-black flex items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="w-80 flex flex-col gap-5 dark:bg-[#171717] border border-neutral-700 rounded-xl py-6 px-5"
      >
        <h1 className="dark:text-white text-center font-bold text-lg">
          Masuk ke Lamongan-Ku
        </h1>

        {error && (
          <p className="text-red-500 text-xs text-center bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="email"
              className="dark:text-white block mb-2 text-sm font-medium"
            >
              Email
            </label>
            <Input
              type="email"
              id="email"
              placeholder="Masukan email"
              value={email}
              onchange={(e) => setEmail(e.target.value)}
              required
              className="w-full text-sm dark:bg-neutral-800 dark:border-2 dark:border-neutral-700 border-2 border-neutral-300 rounded-lg focus:outline-none focus:ring-1 dark:focus:ring-white py-2 px-2 dark:text-white"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="dark:text-white block mb-2 text-sm font-medium"
            >
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Masukan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full text-sm dark:bg-neutral-800 dark:border-2 dark:border-neutral-700 border-2 border-neutral-300 rounded-lg focus:outline-none focus:ring-1 dark:focus:ring-white py-2 pl-2 pr-10 dark:text-white"
              />
              <Button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              >
                {showPassword ? <LuEyeOff size={18} /> : <LuEye size={18} />}
              </Button>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center bg-neutral-200 text-black text-sm py-2 rounded-lg hover:bg-neutral-300 focus:outline-none focus:ring-1 focus:ring-white disabled:opacity-50"
        >
          {loading ? <LuLoader size={20} className="animate-spin" /> : "Masuk"}
        </Button>
      </form>
    </section>
  );
}
