"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { setNewsPublished } from "@/actions/content.actions";

/** Inline publish / unpublish switch for news rows. */
export function PublishToggle({ id, published }: { id: string; published: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Switch
      checked={published}
      disabled={pending}
      aria-label={published ? "Unpublish" : "Publish"}
      onCheckedChange={(v) =>
        startTransition(async () => {
          const res = await setNewsPublished(id, v);
          if (res.success) {
            toast.success(res.message);
            router.refresh();
          } else toast.error(res.error);
        })
      }
    />
  );
}
