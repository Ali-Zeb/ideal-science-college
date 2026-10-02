"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm, type FieldValues, type UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Field, SelectInput, TextArea, TextInput, applyServerErrors } from "@/components/forms/Field";
import { FileUpload } from "@/components/forms/FileUpload";
import { RichTextEditor } from "./RichTextEditor";
import { Panel } from "./AdminUI";
import { saveEvent, saveFaculty, saveNews } from "@/actions/content.actions";
import { saveJob } from "@/actions/career.actions";
import { eventSchema, newsSchema, type EventData, type EventInput, type NewsData, type NewsInput } from "@/lib/validators/news.schema";
import { facultySchema, type FacultyData, type FacultyInput } from "@/lib/validators/content.schema";
import { jobSchema, type JobData, type JobInput } from "@/lib/validators/career.schema";
import { DEPARTMENTS, EVENT_CATEGORIES, NEWS_CATEGORIES, WINGS, WING_LABELS } from "@/lib/constants";
import { toDateTimeLocal } from "@/lib/utils/formatDate";
import type { ActionResult, EventItem, FacultyItem, JobItem, NewsItem } from "@/types";

/* Shared ------------------------------------------------------------- */

function useSave<T extends FieldValues>(listPath: string, setError: UseFormSetError<T>) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const run = (fn: () => Promise<ActionResult<{ id: string }>>) =>
    startTransition(async () => {
      const res = await fn();
      if (res.success) {
        toast.success(res.message);
        router.push(listPath);
        router.refresh();
      } else {
        applyServerErrors(res.fieldErrors, setError as never);
        toast.error(res.error);
      }
    });
  return { pending, run };
}

function EditorFooter({ pending, cancelHref, label = "Save" }: { pending: boolean; cancelHref: string; label?: string }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-6 flex justify-end gap-3 border-t bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <Button asChild variant="outline" size="lg">
        <Link href={cancelHref}>Cancel</Link>
      </Button>
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        {label}
      </Button>
    </div>
  );
}

function SwitchField({ id, label, hint, checked, onChange }: { id: string; label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
      <div>
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

const lines = (v: string[] | undefined) => (v ?? []).join("\n");

/* News --------------------------------------------------------------- */

/** Create / edit form for a news post. */
export function NewsEditor({ item }: { item?: NewsItem }) {
  const form = useForm<NewsInput, unknown, NewsData>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: item?.title ?? "",
      excerpt: item?.excerpt ?? "",
      content: item?.content ?? "",
      featuredImage: item?.featuredImage ?? "",
      category: (item?.category as NewsData["category"]) ?? undefined,
      tags: item?.tags.join(", ") ?? "",
      published: item?.published ?? false,
    },
  });
  const { register, control, handleSubmit, setError, formState: { errors } } = form;
  const { pending, run } = useSave("/college/news", setError);

  return (
    <form onSubmit={handleSubmit((d) => run(() => saveNews(item?.id ?? null, d)))} noValidate>
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Panel>
          <div className="space-y-5">
            <Field label="Title" htmlFor="n-title" required error={errors.title?.message}>
              <TextInput id="n-title" invalid={!!errors.title} {...register("title")} />
            </Field>
            <Field label="Summary" htmlFor="n-excerpt" required hint="Shown on cards and in search results (30–300 characters)." error={errors.excerpt?.message}>
              <TextArea id="n-excerpt" rows={3} invalid={!!errors.excerpt} {...register("excerpt")} />
            </Field>
            <div className="space-y-1.5">
              <p className="text-sm font-medium">
                Content <span className="text-destructive">*</span>
              </p>
              <Controller control={control} name="content" render={({ field }) => <RichTextEditor value={field.value} onChange={field.onChange} invalid={!!errors.content} />} />
              {errors.content ? <p className="text-xs text-destructive">{errors.content.message}</p> : null}
            </div>
          </div>
        </Panel>
        <div className="space-y-6">
          <Panel title="Publishing">
            <div className="space-y-4">
              <Controller control={control} name="published" render={({ field }) => <SwitchField id="n-pub" label="Published" hint="Visible on the website" checked={!!field.value} onChange={field.onChange} />} />
              <Field label="Category" htmlFor="n-cat" required error={errors.category?.message}>
                <SelectInput id="n-cat" invalid={!!errors.category} {...register("category")}>
                  <option value="">Select</option>
                  {NEWS_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="Tags" htmlFor="n-tags" hint="Comma separated" error={errors.tags?.message as string | undefined}>
                <TextInput id="n-tags" {...register("tags")} />
              </Field>
            </div>
          </Panel>
          <Panel title="Featured image">
            <Controller
              control={control}
              name="featuredImage"
              render={({ field }) => (
                <FileUpload label="Image" hint="JPG, PNG or WEBP · 1600×900 recommended" accept="image/jpeg,image/png,image/webp" purpose="content" value={field.value ?? ""} onChange={field.onChange} error={errors.featuredImage?.message} />
              )}
            />
          </Panel>
        </div>
      </div>
      <EditorFooter pending={pending} cancelHref="/college/news" label={item ? "Save changes" : "Create post"} />
    </form>
  );
}

/* Events ------------------------------------------------------------- */

/** Create / edit form for an event (times are Pakistan time). */
export function EventEditor({ item }: { item?: EventItem }) {
  const form = useForm<EventInput, unknown, EventData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: item?.title ?? "",
      description: item?.description ?? "",
      featuredImage: item?.featuredImage ?? "",
      startDate: item ? toDateTimeLocal(item.startDate) : "",
      endDate: item ? toDateTimeLocal(item.endDate) : "",
      location: item?.location ?? "College Campus, Serai Naurang",
      category: (item?.category as EventData["category"]) ?? undefined,
      published: item?.published ?? true,
    },
  });
  const { register, control, handleSubmit, setError, formState: { errors } } = form;
  const { pending, run } = useSave("/college/events", setError);

  return (
    <form onSubmit={handleSubmit((d) => run(() => saveEvent(item?.id ?? null, d)))} noValidate>
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Panel>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Title" htmlFor="e-title" required className="sm:col-span-2" error={errors.title?.message}>
              <TextInput id="e-title" invalid={!!errors.title} {...register("title")} />
            </Field>
            <Field label="Starts" htmlFor="e-start" required hint="Pakistan time" error={errors.startDate?.message}>
              <TextInput id="e-start" type="datetime-local" invalid={!!errors.startDate} {...register("startDate")} />
            </Field>
            <Field label="Ends" htmlFor="e-end" required error={errors.endDate?.message}>
              <TextInput id="e-end" type="datetime-local" invalid={!!errors.endDate} {...register("endDate")} />
            </Field>
            <Field label="Location" htmlFor="e-loc" required error={errors.location?.message}>
              <TextInput id="e-loc" invalid={!!errors.location} {...register("location")} />
            </Field>
            <Field label="Category" htmlFor="e-cat" required error={errors.category?.message}>
              <SelectInput id="e-cat" invalid={!!errors.category} {...register("category")}>
                <option value="">Select</option>
                {EVENT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Description" htmlFor="e-desc" required className="sm:col-span-2" error={errors.description?.message}>
              <TextArea id="e-desc" rows={6} invalid={!!errors.description} {...register("description")} />
            </Field>
          </div>
        </Panel>
        <div className="space-y-6">
          <Panel title="Publishing">
            <Controller control={control} name="published" render={({ field }) => <SwitchField id="e-pub" label="Published" checked={!!field.value} onChange={field.onChange} />} />
          </Panel>
          <Panel title="Image">
            <Controller
              control={control}
              name="featuredImage"
              render={({ field }) => <FileUpload label="Event image" accept="image/jpeg,image/png,image/webp" hint="JPG, PNG or WEBP" purpose="content" value={field.value ?? ""} onChange={field.onChange} />}
            />
          </Panel>
        </div>
      </div>
      <EditorFooter pending={pending} cancelHref="/college/events" label={item ? "Save changes" : "Create event"} />
    </form>
  );
}

/* Faculty ------------------------------------------------------------ */

/** Create / edit form for a faculty profile. */
export function FacultyEditor({ item }: { item?: FacultyItem }) {
  const form = useForm<FacultyInput, unknown, FacultyData>({
    resolver: zodResolver(facultySchema),
    defaultValues: {
      name: item?.name ?? "",
      designation: item?.designation ?? "",
      department: (item?.department as FacultyData["department"]) ?? undefined,
      wing: item?.wing ?? "boys",
      qualification: item?.qualification ?? "",
      experience: item?.experience ?? "",
      bio: item?.bio ?? "",
      photo: item?.photo ?? "",
      email: item?.email ?? "",
      social: { linkedin: item?.social.linkedin ?? "", twitter: item?.social.twitter ?? "", facebook: item?.social.facebook ?? "" },
      order: item?.order ?? 0,
      isActive: item?.isActive ?? true,
    },
  });
  const { register, control, handleSubmit, setError, watch, formState: { errors } } = form;
  const { pending, run } = useSave("/college/faculty", setError);
  const wing = watch("wing");

  return (
    <form onSubmit={handleSubmit((d) => run(() => saveFaculty(item?.id ?? null, d)))} noValidate>
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Panel>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" htmlFor="f-name" required error={errors.name?.message}>
              <TextInput id="f-name" invalid={!!errors.name} {...register("name")} />
            </Field>
            <Field label="Designation" htmlFor="f-des" required hint="e.g. Senior Lecturer" error={errors.designation?.message}>
              <TextInput id="f-des" invalid={!!errors.designation} {...register("designation")} />
            </Field>
            <Field label="Department" htmlFor="f-dep" required error={errors.department?.message}>
              <SelectInput id="f-dep" invalid={!!errors.department} {...register("department")}>
                <option value="">Select</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Wing" htmlFor="f-wing" required error={errors.wing?.message}>
              <SelectInput id="f-wing" {...register("wing")}>
                {WINGS.map((w) => (
                  <option key={w} value={w}>
                    {WING_LABELS[w]}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Qualification" htmlFor="f-qual" required hint="e.g. M.Sc Chemistry" error={errors.qualification?.message}>
              <TextInput id="f-qual" invalid={!!errors.qualification} {...register("qualification")} />
            </Field>
            <Field label="Experience" htmlFor="f-exp" hint="e.g. 8 years" error={errors.experience?.message}>
              <TextInput id="f-exp" {...register("experience")} />
            </Field>
            <Field label="Short bio" htmlFor="f-bio" className="sm:col-span-2" error={errors.bio?.message}>
              <TextArea id="f-bio" rows={4} {...register("bio")} />
            </Field>
            <Field label="Public email (optional)" htmlFor="f-email" error={errors.email?.message}>
              <TextInput id="f-email" type="email" invalid={!!errors.email} {...register("email")} />
            </Field>
            <Field label="Display order" htmlFor="f-order" hint="Lower numbers appear first" error={errors.order?.message}>
              <TextInput id="f-order" type="number" min={0} {...register("order")} />
            </Field>
            <Field label="LinkedIn URL" htmlFor="f-li" error={errors.social?.linkedin?.message}>
              <TextInput id="f-li" type="url" {...register("social.linkedin")} />
            </Field>
            <Field label="Facebook URL" htmlFor="f-fb" error={errors.social?.facebook?.message}>
              <TextInput id="f-fb" type="url" {...register("social.facebook")} />
            </Field>
          </div>
        </Panel>
        <div className="space-y-6">
          <Panel title="Visibility">
            <Controller control={control} name="isActive" render={({ field }) => <SwitchField id="f-active" label="Show on website" checked={!!field.value} onChange={field.onChange} />} />
          </Panel>
          <Panel title="Photo">
            {wing === "girls" ? (
              <p className="mb-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                For girls wing teachers, leave the photo empty unless the teacher has given written consent. Initials are shown instead.
              </p>
            ) : null}
            <Controller
              control={control}
              name="photo"
              render={({ field }) => <FileUpload label="Profile photo" accept="image/jpeg,image/png,image/webp" hint="Square image recommended" purpose="content" value={field.value ?? ""} onChange={field.onChange} />}
            />
          </Panel>
        </div>
      </div>
      <EditorFooter pending={pending} cancelHref="/college/faculty" label={item ? "Save changes" : "Add faculty member"} />
    </form>
  );
}

/* Jobs --------------------------------------------------------------- */

/** Create / edit form for a job opening. */
export function JobEditor({ item }: { item?: JobItem }) {
  const form = useForm<JobInput, unknown, JobData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: item?.title ?? "",
      department: (item?.department as JobData["department"]) ?? undefined,
      type: item?.type ?? "full-time",
      location: item?.location ?? "Serai Naurang Campus",
      description: item?.description ?? "",
      requirements: lines(item?.requirements),
      responsibilities: lines(item?.responsibilities),
      salaryRange: item?.salaryRange ?? "",
      deadline: item?.deadline.slice(0, 10) ?? "",
      published: item?.published ?? true,
    },
  });
  const { register, control, handleSubmit, setError, formState: { errors } } = form;
  const { pending, run } = useSave("/college/careers", setError);

  return (
    <form onSubmit={handleSubmit((d) => run(() => saveJob(item?.id ?? null, d)))} noValidate>
      <Panel>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Job title" htmlFor="j-title" required className="sm:col-span-2" error={errors.title?.message}>
            <TextInput id="j-title" invalid={!!errors.title} {...register("title")} />
          </Field>
          <Field label="Department" htmlFor="j-dep" required error={errors.department?.message}>
            <SelectInput id="j-dep" invalid={!!errors.department} {...register("department")}>
              <option value="">Select</option>
              {[...DEPARTMENTS, "Administration"].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Type" htmlFor="j-type" required>
            <SelectInput id="j-type" {...register("type")}>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="visiting">Visiting</option>
            </SelectInput>
          </Field>
          <Field label="Location / wing" htmlFor="j-loc" required error={errors.location?.message}>
            <TextInput id="j-loc" invalid={!!errors.location} {...register("location")} />
          </Field>
          <Field label="Application deadline" htmlFor="j-dl" required error={errors.deadline?.message}>
            <TextInput id="j-dl" type="date" invalid={!!errors.deadline} {...register("deadline")} />
          </Field>
          <Field label="Salary range (optional)" htmlFor="j-sal">
            <TextInput id="j-sal" placeholder="e.g. Rs 35,000 – 50,000" {...register("salaryRange")} />
          </Field>
          <Controller control={control} name="published" render={({ field }) => <SwitchField id="j-pub" label="Published" checked={!!field.value} onChange={field.onChange} />} />
          <Field label="Description" htmlFor="j-desc" required className="sm:col-span-2" error={errors.description?.message}>
            <TextArea id="j-desc" rows={4} invalid={!!errors.description} {...register("description")} />
          </Field>
          <Field label="Requirements" htmlFor="j-req" hint="One per line" error={errors.requirements?.message as string | undefined}>
            <TextArea id="j-req" rows={5} {...register("requirements")} />
          </Field>
          <Field label="Responsibilities" htmlFor="j-resp" hint="One per line" error={errors.responsibilities?.message as string | undefined}>
            <TextArea id="j-resp" rows={5} {...register("responsibilities")} />
          </Field>
        </div>
      </Panel>
      <EditorFooter pending={pending} cancelHref="/college/careers" label={item ? "Save changes" : "Publish job"} />
    </form>
  );
}
