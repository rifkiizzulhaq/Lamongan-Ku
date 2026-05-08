import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/src/providers/ReactQueryProvider";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lamongan-Ku",
  description: "Aplikasi POS untuk warung Lamongan-Ku",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${jakartaSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-neutral-900 bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-100">
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
