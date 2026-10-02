"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Field, SelectInput, TextArea, TextInput, applyServerErrors } from "@/components/forms/Field";
import { FileUpload } from "@/components/forms/FileUpload";
import { Panel } from "./AdminUI";
import { saveProgram } from "@/actions/content.actions";
import { programSchema, type ProgramData, type ProgramInput } from "@/lib/validators/content.schema";
import { LEVEL_LABELS, PROGRAM_ICONS } from "@/components/academics/programIcons";
import { PROGRAM_LEVELS, WINGS, WING_LABELS } from "@/lib/constants";
import type { FacultyItem, ProgramItem } from "@/types";

/** Create / edit form for a program, including curriculum terms and faculty assignment. */
export function ProgramEditor({ item, faculty }: { item?: ProgramItem; faculty: FacultyItem[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<ProgramInput, unknown, ProgramData>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      name: item?.name ?? "",
      level: item?.level ?? "intermediate",
      duration: item?.duration ?? "",
      shortDescription: item?.shortDescription ?? "",
      description: item?.description ?? "",
      curriculum: item?.curriculum.map((c) => ({ semester: c.semester, title: c.title, subjects: c.subjects.join("\n") })) ?? [],
      fees: { admission: item?.fees.admission ?? 0, monthly: item?.fees.monthly ?? 0, total: item?.fees.total ?? 0 },
      requirements: item?.requirements.join("\n") ?? "",
      careers: item?.careers.join("\n") ?? "",
      seats: item?.seats ?? 0,
      wings: item?.wings ?? "both",
      faculty: item?.faculty ?? [],
      image: item?.image ?? "",
      icon: (item?.icon as ProgramData["icon"]) ?? "FlaskConical",
      order: item?.order ?? 0,
      published: item?.published ?? true,
    },
  });
  const { register, control, handleSubmit, setError, formState: { errors } } = form;
  const terms = useFieldArray({ control, name: "curriculum" });

  const onSubmit = handleSubmit((d) =>
    startTransition(async () => {
      const res = await saveProgram(item?.id ?? null, d);
      if (res.success) {
        toast.success(res.message);
        router.push("/college/programs");
        router.refresh();
      } else {
        applyServerErrors(res.fieldErrors, setError as never);
        toast.error(res.error);
      }
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Panel title="Basics">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Program name" htmlFor="p-name" required className="sm:col-span-2" error={errors.name?.message}>
                <TextInput id="p-name" invalid={!!errors.name} {...register("name")} />
              </Field>
              <Field label="Level" htmlFor="p-level" required>
                <SelectInput id="p-level" {...register("level")}>
                  {PROGRAM_LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {LEVEL_LABELS[l]}
                    </option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="Duration" htmlFor="p-dur" required hint="e.g. 2 Years" error={errors.duration?.message}>
                <TextInput id="p-dur" invalid={!!errors.duration} {...register("duration")} />
              </Field>
              <Field label="Short description" htmlFor="p-short" required className="sm:col-span-2" error={errors.shortDescription?.message}>
                <TextArea id="p-short" rows={2} invalid={!!errors.shortDescription} {...register("shortDescription")} />
              </Field>
              <Field label="Full description" htmlFor="p-desc" required className="sm:col-span-2" error={errors.description?.message}>
                <TextArea id="p-desc" rows={6} invalid={!!errors.description} {...register("description")} />
              </Field>
            </div>
          </Panel>

          <Panel
            title="Curriculum"
            action={
              <Button type="button" size="sm" variant="outline" onClick={() => terms.append({ semester: terms.fields.length + 1, title: "", subjects: "" })}>
                <Plus className="size-4" /> Add term
              </Button>
            }
          >
            {terms.fields.length ? (
              <div className="space-y-4">
                {terms.fields.map((f, i) => (
                  <div key={f.id} className="grid gap-3 rounded-xl border p-4 sm:grid-cols-[90px_1fr_auto]">
                    <Field label="No." htmlFor={`t-${i}-n`} error={errors.curriculum?.[i]?.semester?.message}>
                      <TextInput id={`t-${i}-n`} type="number" min={1} {...register(`curriculum.${i}.semester`)} />
                    </Field>
                    <Field label="Title" htmlFor={`t-${i}-t`} hint="e.g. Part I (Class 11)">
                      <TextInput id={`t-${i}-t`} {...register(`curriculum.${i}.title`)} />
                    </Field>
                    <Button type="button" variant="ghost" size="icon" onClick={() => terms.remove(i)} aria-label="Remove term" className="self-end text-destructive">
                      <Trash2 className="size-4" />
                    </Button>
                    <Field label="Subjects (one per line)" htmlFor={`t-${i}-s`} className="sm:col-span-3">
                      <TextArea id={`t-${i}-s`} rows={4} {...register(`curriculum.${i}.subjects`)} />
                    </Field>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No terms yet. Add the years/terms and their subjects.</p>
            )}
          </Panel>

          <Panel title="Eligibility & outcomes">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Requirements (one per line)" htmlFor="p-req" error={errors.requirements?.message as string | undefined}>
                <TextArea id="p-req" rows={6} {...register("requirements")} />
              </Field>
              <Field label="Where it leads (one per line)" htmlFor="p-car" error={errors.careers?.message as string | undefined}>
                <TextArea id="p-car" rows={6} {...register("careers")} />
              </Field>
            </div>
          </Panel>

          <Panel title="Faculty">
            {faculty.length ? (
              <Controller
                control={control}
                name="faculty"
                render={({ field }) => {
                  const value = new Set(field.value ?? []);
                  return (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {faculty.map((f) => (
                        <label key={f.id} className="flex items-center gap-3 rounded-lg border p-3 text-sm hover:bg-muted/50">
                          <input
                            type="checkbox"
                            className="size-4 accent-brand-700"
                            checked={value.has(f.id)}
                            onChange={(e) => {
                              const next = new Set(value);
                              if (e.target.checked) next.add(f.id);
                              else next.delete(f.id);
                              field.onChange(Array.from(next));
                            }}
                          />
                          <span>
                            <span className="block font-medium">{f.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {f.designation} · {f.department}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  );
                }}
              />
            ) : (
              <p className="text-sm text-muted-foreground">Add faculty members first to assign them here.</p>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Publishing">
            <div className="space-y-4">
              <Controller
                control={control}
                name="published"
                render={({ field }) => (
                  <label className="flex items-center justify-between rounded-xl border p-4 text-sm font-medium">
                    Published
                    <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                  </label>
                )}
              />
              <Field label="Display order" htmlFor="p-order" error={errors.order?.message}>
                <TextInput id="p-order" type="number" min={0} {...register("order")} />
              </Field>
              <Field label="Wings" htmlFor="p-wings">
                <SelectInput id="p-wings" {...register("wings")}>
                  {WINGS.map((w) => (
                    <option key={w} value={w}>
                      {WING_LABELS[w]}
                    </option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="Seats" htmlFor="p-seats" error={errors.seats?.message}>
                <TextInput id="p-seats" type="number" min={0} {...register("seats")} />
              </Field>
              <Field label="Icon" htmlFor="p-icon">
                <SelectInput id="p-icon" {...register("icon")}>
                  {Object.keys(PROGRAM_ICONS).map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </SelectInput>
              </Field>
            </div>
          </Panel>
          <Panel title="Fees (PKR)">
            <div className="space-y-4">
              <Field label="Admission fee" htmlFor="p-fa" error={errors.fees?.admission?.message}>
                <TextInput id="p-fa" type="number" min={0} {...register("fees.admission")} />
              </Field>
              <Field label="Monthly fee" htmlFor="p-fm" error={errors.fees?.monthly?.message}>
                <TextInput id="p-fm" type="number" min={0} {...register("fees.monthly")} />
              </Field>
              <Field label="Total fee (short courses)" htmlFor="p-ft" error={errors.fees?.total?.message}>
                <TextInput id="p-ft" type="number" min={0} {...register("fees.total")} />
              </Field>
            </div>
          </Panel>
          <Panel title="Image">
            <Controller
              control={control}
              name="image"
              render={({ field }) => <FileUpload label="Program image" accept="image/jpeg,image/png,image/webp" hint="Landscape image" purpose="content" value={field.value ?? ""} onChange={field.onChange} />}
            />
          </Panel>
        </div>
      </div>
      <div className="sticky bottom-0 z-10 -mx-4 mt-6 flex justify-end gap-3 border-t bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <Button asChild variant="outline" size="lg">
          <Link href="/college/programs">Cancel</Link>
        </Button>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {item ? "Save changes" : "Create program"}
        </Button>
      </div>
    </form>
  );
}
