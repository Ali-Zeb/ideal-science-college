"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="bg-brand-900 pt-40 pb-24 text-center text-white">
      <div className="container-page max-w-xl">
        <AlertTriangle className="mx-auto mb-5 size-12 text-gold-400" aria-hidden />
        <h1 className="text-3xl font-bold sm:text-4xl">Something went wrong</h1>
        <p className="mt-4 text-white/75">
          We couldn&apos;t load this page right now. Please try again, or contact the college office if the problem continues.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button onClick={reset} className="bg-gold-400 text-brand-900 hover:bg-gold-300">
            Try again
          </Button>
          <Button asChild variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
