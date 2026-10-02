"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateApplicationStatus } from "@/actions/application.actions";
import { APPLICATION_STATUSES, APPLICATION_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "@/types";

/** Status + note form on the application detail page. */
export function ApplicationReview({ id, status, note }: { id: string; status: ApplicationStatus; note: string }) {
  const router = useRouter();
  const [value, setValue] = useState<ApplicationStatus>(status);
  const [reviewNote, setReviewNote] = useState(note);
  const [notify, setNotify] = useState(true);
  const [pending, startTransition] = useTransition();

  const save = () =>
    startTransition(async () => {
      const res = await updateApplicationStatus({ id, status: value, reviewNote, notify });
      if (res.success) {
        toast.success(res.message);
        router.refresh();
      } else toast.error(res.error);
    });

  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="mb-2 text-sm font-medium">Status</legend>
        <div className="grid grid-cols-2 gap-2">
          {APPLICATION_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setValue(s)}
              aria-pressed={value === s}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                value === s ? "border-brand-700 bg-brand-700 text-white" : "hover:border-brand-300",
              )}
            >
              {APPLICATION_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="space-y-1.5">
        <Label htmlFor="review-note">Note to applicant (included in the email)</Label>
        <Textarea id="review-note" rows={4} maxLength={1000} value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} placeholder="e.g. Please visit the office on Monday with original documents." />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="size-4 accent-brand-700" />
        Email the applicant about this update
      </label>
      <Button onClick={save} disabled={pending || (value === status && reviewNote === note)} className="w-full">
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        Save decision
      </Button>
    </div>
  );
}
