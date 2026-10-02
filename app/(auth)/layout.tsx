import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/common/Logo";

const points = ["Apply online from home", "Track admission status anytime", "Separate boys & girls wings", "Class 1 to FSc under one roof"];

/** Split-screen layout shared by every sign-in / sign-up page. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-brand-950 lg:block">
        <Image src="/images/campus-building.jpg" alt="" fill priority sizes="50vw" className="object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950/95 via-brand-900/80 to-brand-700/60" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Logo tone="light" />
          <div>
            <h2 className="font-heading text-4xl leading-tight font-bold">
              Welcome to <span className="text-gold-400">Ideal Science College</span>
            </h2>
            <ul className="mt-8 space-y-3">
              {points.map((p) => (
                <li key={p} className="flex items-center gap-3 text-white/85">
                  <CheckCircle2 className="size-5 text-gold-400" aria-hidden /> {p}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-white/60">
            Serai Naurang · District Lakki Marwat · Khyber Pakhtunkhwa
            <span className="mt-1 block text-xs text-white/45">
              Software made by <span className="font-semibold text-gold-400">Ali Zeb</span>
            </span>
          </p>
        </div>
      </aside>
      <main className="flex flex-col bg-muted/30 px-4 py-8 sm:px-8">
        <div className="flex items-center justify-between">
          <div className="lg:hidden">
            <Logo />
          </div>
          <Link href="/" className="ml-auto flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Back to website
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </main>
    </div>
  );
}
