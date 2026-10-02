"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Save, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Field, SelectInput, TextArea, TextInput } from "@/components/forms/Field";
import { Panel } from "./AdminUI";
import { saveGalleryAlbum } from "@/actions/content.actions";
import { GALLERY_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { GalleryAlbum } from "@/types";

interface DraftImage {
  key: string;
  url: string;
  caption: string;
}

/** Album editor: details, multi-image upload, captions, reordering and cover selection. */
export function GalleryEditor({ album }: { album?: GalleryAlbum }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [albumName, setAlbumName] = useState(album?.albumName ?? "");
  const [description, setDescription] = useState(album?.description ?? "");
  const [category, setCategory] = useState(album?.category ?? GALLERY_CATEGORIES[0]);
  const [published, setPublished] = useState(album?.published ?? true);
  const [cover, setCover] = useState(album?.coverImage ?? "");
  const [images, setImages] = useState<DraftImage[]>(album?.images.map((i) => ({ key: i.id, url: i.url, caption: i.caption })) ?? []);

  async function uploadMany(files: FileList) {
    const list = Array.from(files).slice(0, 30);
    setUploading({ done: 0, total: list.length });
    for (const file of list) {
      try {
        const body = new FormData();
        body.append("file", file);
        body.append("purpose", "content");
        const res = await fetch("/api/upload", { method: "POST", body });
        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed");
        setImages((prev) => [...prev, { key: `${Date.now()}-${Math.random()}`, url: data.url as string, caption: "" }]);
      } catch (err) {
        toast.error(`${file.name}: ${(err as Error).message}`);
      } finally {
        setUploading((u) => (u ? { ...u, done: u.done + 1 } : u));
      }
    }
    setUploading(null);
  }

  const move = (i: number, dir: -1 | 1) =>
    setImages((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const save = () =>
    startTransition(async () => {
      setErrors({});
      const res = await saveGalleryAlbum(album?.id ?? null, {
        albumName,
        description,
        category,
        published,
        coverImage: cover && images.some((i) => i.url === cover) ? cover : "",
        images: images.map(({ url, caption }) => ({ url, caption })),
      });
      if (res.success) {
        toast.success(res.message);
        router.push("/college/gallery");
        router.refresh();
      } else {
        setErrors(Object.fromEntries(Object.entries(res.fieldErrors ?? {}).map(([k, v]) => [k, v?.[0] ?? ""])));
        toast.error(res.error);
      }
    });

  return (
    <div>
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Panel
          title={`Photos (${images.length})`}
          action={
            <Button type="button" size="sm" onClick={() => fileRef.current?.click()} disabled={!!uploading}>
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
              {uploading ? `Uploading ${uploading.done}/${uploading.total}` : "Add photos"}
            </Button>
          }
        >
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => {
              if (e.target.files?.length) void uploadMany(e.target.files);
              e.target.value = "";
            }}
          />
          {images.length ? (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {images.map((img, i) => (
                <li key={img.key} className={cn("overflow-hidden rounded-xl border bg-card", cover === img.url && "ring-2 ring-gold-400")}>
                  <div className="relative aspect-[4/3] bg-muted">
                    <Image src={img.url} alt={img.caption} fill sizes="300px" className="object-cover" />
                    {cover === img.url ? <span className="absolute top-2 left-2 rounded-full bg-gold-400 px-2 py-0.5 text-xs font-semibold text-brand-950">Cover</span> : null}
                  </div>
                  <div className="space-y-2 p-3">
                    <TextInput
                      value={img.caption}
                      onChange={(e) => setImages((prev) => prev.map((p) => (p.key === img.key ? { ...p, caption: e.target.value } : p)))}
                      placeholder="Caption"
                      aria-label={`Caption for photo ${i + 1}`}
                      maxLength={160}
                      className="h-9"
                    />
                    <div className="flex justify-between">
                      <div className="flex">
                        <Button type="button" variant="ghost" size="icon-sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                          <ArrowUp className="size-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon-sm" onClick={() => move(i, 1)} disabled={i === images.length - 1} aria-label="Move down">
                          <ArrowDown className="size-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon-sm" onClick={() => setCover(img.url)} aria-label="Use as cover">
                          <Star className={cn("size-4", cover === img.url && "fill-gold-400 text-gold-500")} />
                        </Button>
                      </div>
                      <Button type="button" variant="ghost" size="icon-sm" className="text-destructive" onClick={() => setImages((prev) => prev.filter((p) => p.key !== img.key))} aria-label="Remove photo">
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()} className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed py-16 text-muted-foreground hover:border-brand-300">
              <ImagePlus className="size-8" /> Upload photos (you can select many at once)
            </button>
          )}
          <p className="mt-4 text-xs text-muted-foreground">Do not upload photos of female students without written consent from their families.</p>
        </Panel>
        <Panel title="Album details">
          <div className="space-y-4">
            <Field label="Album name" htmlFor="g-name" required error={errors.albumName}>
              <TextInput id="g-name" value={albumName} onChange={(e) => setAlbumName(e.target.value)} invalid={!!errors.albumName} />
            </Field>
            <Field label="Category" htmlFor="g-cat" required error={errors.category}>
              <SelectInput id="g-cat" value={category} onChange={(e) => setCategory(e.target.value)}>
                {GALLERY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Description" htmlFor="g-desc" error={errors.description}>
              <TextArea id="g-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </Field>
            <label className="flex items-center justify-between rounded-xl border p-4 text-sm font-medium">
              Published
              <Switch checked={published} onCheckedChange={setPublished} />
            </label>
          </div>
        </Panel>
      </div>
      <div className="sticky bottom-0 z-10 -mx-4 mt-6 flex justify-end gap-3 border-t bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <Button asChild variant="outline" size="lg">
          <Link href="/college/gallery">Cancel</Link>
        </Button>
        <Button size="lg" onClick={save} disabled={pending || !!uploading}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {album ? "Save album" : "Create album"}
        </Button>
      </div>
    </div>
  );
}
