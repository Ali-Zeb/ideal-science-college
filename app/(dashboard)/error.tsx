"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <AlertTriangle className="size-12 text-gold-500" aria-hidden />
      <h1 className="mt-4 text-2xl font-bold text-brand-900">Could not load this page</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        The database may be unreachable or your session may have expired. Try again, or sign in again if the problem continues.
      </p>
      <Button onClick={reset} className="mt-6">
        <RotateCcw className="size-4" /> Try again
      </Button>
    </div>
  );
}
