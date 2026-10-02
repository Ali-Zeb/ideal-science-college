import Link from "next/link";
import type { Metadata } from "next";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/Logo";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-950 px-4 text-center text-white">
      <div className="absolute -top-40 -left-40 size-[28rem] rounded-full bg-brand-700/40 blur-3xl" aria-hidden />
      <div className="absolute -right-40 -bottom-40 size-[28rem] rounded-full bg-gold-500/20 blur-3xl" aria-hidden />
      <div className="relative max-w-lg">
        <div className="mb-10 flex justify-center">
          <Logo tone="light" />
        </div>
        <p className="font-heading text-8xl font-bold text-gold-400">404</p>
        <h1 className="mt-4 text-3xl font-bold">This page could not be found</h1>
        <p className="mt-4 text-white/70">
          The page may have moved or no longer exists. Try one of these instead:
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild className="bg-gold-400 text-brand-900 hover:bg-gold-300">
            <Link href="/">
              <Compass className="size-4" /> Home
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
            <Link href="/academics">Programs</Link>
          </Button>
          <Button asChild variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
            <Link href="/contact">Contact</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
