"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm, Controller, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardCheck, FileUp, GraduationCap, Loader2, PartyPopper, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, SelectInput, TextArea, TextInput, applyServerErrors } from "./Field";
import { FileUpload } from "./FileUpload";
import { submitApplication } from "@/actions/application.actions";
import {
  BOARDS,
  GRADES,
  LAST_CLASSES,
  applicationSchema,
  type ApplicationInput,
  type ApplicationData,
} from "@/lib/validators/application.schema";
import { LEVELS_REQUIRING_SSC } from "@/lib/constants";
import { LEVEL_LABELS } from "@/components/academics/programIcons";
import { cn } from "@/lib/utils";
import type { ProgramLevel } from "@/types";

export interface ApplyProgramOption {
  id: string;
  name: string;
  slug: string;
  level: ProgramLevel;
}

const steps = [
  { title: "Student", icon: User, fields: ["personal"] },
  { title: "Academic", icon: GraduationCap, fields: ["academic"] },
  { title: "Documents", icon: FileUp, fields: ["documents.cnicDoc", "documents.marksheet", "documents.photo"] },
  { title: "Review", icon: ClipboardCheck, fields: ["documents.declaration"] },
] as const;

interface ApplicationFormProps {
  programs: ApplyProgramOption[];
  defaultProgramSlug?: string;
  account: { name: string; email: string; phone: string };
}

/** Four-step admission form with per-step validation and document uploads. */
export function ApplicationForm({ programs, defaultProgramSlug, account }: ApplicationFormProps) {
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState<string | null>(null);
  const preset = programs.find((p) => p.slug === defaultProgramSlug);

  const form = useForm<ApplicationInput, unknown, ApplicationData>({
    resolver: zodResolver(applicationSchema),
    mode: "onTouched",
    defaultValues: {
      personal: { fullName: "", fatherName: "", cnic: "", dateOfBirth: "", gender: undefined, phone: account.phone, email: account.email, address: "" },
      academic: {
        program: preset?.id ?? "",
        programLevel: preset?.level ?? "primary",
        lastClass: undefined,
        previousSchool: "",
        board: "",
        passingYear: undefined,
        previousGrade: "",
        marksObtained: undefined,
        totalMarks: undefined,
      },
      documents: { cnicDoc: "", marksheet: "", photo: "", declaration: undefined },
    },
  });
  const { register, control, formState, trigger, watch, setValue, getValues, setError, handleSubmit } = form;
  const errors = formState.errors;

  const programId = watch("academic.program");
  const lastClass = watch("academic.lastClass");
  const selected = programs.find((p) => p.id === programId);
  const needsSsc = selected ? (LEVELS_REQUIRING_SSC as readonly string[]).includes(selected.level) : false;
  const isNewAdmission = lastClass === LAST_CLASSES[0];

  async function next() {
    const valid = await trigger(steps[step].fields as unknown as FieldPath<ApplicationInput>[], { shouldFocus: true });
    if (valid) {
      setStep((s) => Math.min(s + 1, steps.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  const onSubmit = handleSubmit((data) => {
    startTransition(async () => {
      const result = await submitApplication(data);
      if (result.success) {
        setSubmitted(result.data.applicationNumber);
        toast.success(result.message);
      } else {
        applyServerErrors(result.fieldErrors, setError as never);
        toast.error(result.error);
        const keys = Object.keys(result.fieldErrors ?? {});
        if (keys.some((k) => k.startsWith("personal"))) setStep(0);
        else if (keys.some((k) => k.startsWith("academic"))) setStep(1);
        else if (keys.some((k) => k.startsWith("documents.") && !k.endsWith("declaration"))) setStep(2);
      }
    });
  });

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl border bg-card p-8 text-center shadow-xl sm:p-12">
        <PartyPopper className="mx-auto size-14 text-gold-500" aria-hidden />
        <h2 className="mt-5 text-3xl font-bold text-brand-800">Application submitted!</h2>
        <p className="mt-3 text-muted-foreground">Your application number is</p>
        <p className="mt-2 font-mono text-2xl font-bold tracking-wider text-brand-700">{submitted}</p>
        <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
          A confirmation has been emailed to you. The admissions committee reviews applications within 3–5 working days — track the
          status anytime in your Student Portal.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/portal">Go to my portal</Link>
          </Button>
          <Button variant="outline" size="lg" onClick={() => window.location.reload()}>
            Apply for another child
          </Button>
        </div>
      </motion.div>
    );
  }

  const v = getValues();
  const programName = programs.find((p) => p.id === v.academic.program)?.name ?? "—";

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-3xl border bg-card shadow-xl">
      <ol className="flex border-b" aria-label="Application steps">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const done = i < step;
          return (
            <li key={s.title} className="flex-1">
              <div
                className={cn(
                  "flex flex-col items-center gap-1.5 border-b-2 px-2 py-4 text-xs font-medium sm:flex-row sm:justify-center sm:text-sm",
                  i === step ? "border-brand-700 text-brand-700" : done ? "border-leaf-500 text-leaf-600" : "border-transparent text-muted-foreground",
                )}
                aria-current={i === step ? "step" : undefined}
              >
                {done ? <CheckCircle2 className="size-5" aria-hidden /> : <Icon className="size-5" aria-hidden />}
                <span>{s.title}</span>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="p-6 sm:p-10">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
            {step === 0 ? (
              <div className="grid gap-5 sm:grid-cols-2">
                <p className="text-sm text-muted-foreground sm:col-span-2">
                  Enter the <strong>student&apos;s</strong> details exactly as on the B-Form / CNIC. Parents applying for a child should give their own mobile and email.
                </p>
                <Field label="Student's full name" htmlFor="fullName" required error={errors.personal?.fullName?.message}>
                  <TextInput id="fullName" autoComplete="name" invalid={!!errors.personal?.fullName} {...register("personal.fullName")} />
                </Field>
                <Field label="Father's name" htmlFor="fatherName" required error={errors.personal?.fatherName?.message}>
                  <TextInput id="fatherName" invalid={!!errors.personal?.fatherName} {...register("personal.fatherName")} />
                </Field>
                <Field label="B-Form / CNIC number" htmlFor="cnic" required hint="13 digits, e.g. 11201-1234567-1" error={errors.personal?.cnic?.message}>
                  <TextInput id="cnic" inputMode="numeric" maxLength={15} placeholder="XXXXX-XXXXXXX-X" invalid={!!errors.personal?.cnic} {...register("personal.cnic")} />
                </Field>
                <Field label="Date of birth" htmlFor="dob" required error={errors.personal?.dateOfBirth?.message}>
                  <TextInput id="dob" type="date" max={new Date().toISOString().slice(0, 10)} invalid={!!errors.personal?.dateOfBirth} {...register("personal.dateOfBirth")} />
                </Field>
                <Field label="Gender" htmlFor="gender" required hint="Girls are admitted to the separate girls wing." error={errors.personal?.gender?.message}>
                  <SelectInput id="gender" invalid={!!errors.personal?.gender} defaultValue="" {...register("personal.gender")}>
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="male">Male (Boys Wing)</option>
                    <option value="female">Female (Girls Wing)</option>
                  </SelectInput>
                </Field>
                <Field label="Parent / guardian mobile" htmlFor="phone" required hint="e.g. 0308-5744005" error={errors.personal?.phone?.message}>
                  <TextInput id="phone" type="tel" inputMode="tel" autoComplete="tel" invalid={!!errors.personal?.phone} {...register("personal.phone")} />
                </Field>
                <Field label="Email for updates" htmlFor="email" required className="sm:col-span-2" error={errors.personal?.email?.message}>
                  <TextInput id="email" type="email" autoComplete="email" invalid={!!errors.personal?.email} {...register("personal.email")} />
                </Field>
                <Field label="Home address" htmlFor="address" required className="sm:col-span-2" error={errors.personal?.address?.message}>
                  <TextArea id="address" rows={3} autoComplete="street-address" invalid={!!errors.personal?.address} {...register("personal.address")} />
                </Field>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Program / class applying for" htmlFor="program" required className="sm:col-span-2" error={errors.academic?.program?.message}>
                  <SelectInput
                    id="program"
                    invalid={!!errors.academic?.program}
                    {...register("academic.program", {
                      onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
                        const p = programs.find((x) => x.id === e.target.value);
                        if (p) setValue("academic.programLevel", p.level);
                      },
                    })}
                  >
                    <option value="">Select a program</option>
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {LEVEL_LABELS[p.level]}
                      </option>
                    ))}
                  </SelectInput>
                </Field>
                <Field label="Last class passed" htmlFor="lastClass" required error={errors.academic?.lastClass?.message}>
                  <SelectInput id="lastClass" defaultValue="" invalid={!!errors.academic?.lastClass} {...register("academic.lastClass")}>
                    <option value="" disabled>
                      Select
                    </option>
                    {LAST_CLASSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </SelectInput>
                </Field>
                <Field
                  label="Previous school"
                  htmlFor="previousSchool"
                  required={!isNewAdmission}
                  hint={isNewAdmission ? "Optional for new admissions" : undefined}
                  error={errors.academic?.previousSchool?.message}
                >
                  <TextInput id="previousSchool" invalid={!!errors.academic?.previousSchool} {...register("academic.previousSchool")} />
                </Field>

                {needsSsc ? (
                  <>
                    <p className="rounded-lg bg-brand-50 p-3 text-sm text-brand-800 sm:col-span-2">Enter your SSC (Matric) result.</p>
                    <Field label="Board" htmlFor="board" required error={errors.academic?.board?.message}>
                      <SelectInput id="board" invalid={!!errors.academic?.board} {...register("academic.board")}>
                        <option value="">Select board</option>
                        {BOARDS.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </SelectInput>
                    </Field>
                    <Field label="Passing year" htmlFor="passingYear" required error={errors.academic?.passingYear?.message}>
                      <TextInput id="passingYear" type="number" inputMode="numeric" invalid={!!errors.academic?.passingYear} {...register("academic.passingYear")} />
                    </Field>
                    <Field label="Marks obtained" htmlFor="marksObtained" required error={errors.academic?.marksObtained?.message}>
                      <TextInput id="marksObtained" type="number" inputMode="numeric" invalid={!!errors.academic?.marksObtained} {...register("academic.marksObtained")} />
                    </Field>
                    <Field label="Total marks" htmlFor="totalMarks" required error={errors.academic?.totalMarks?.message}>
                      <TextInput id="totalMarks" type="number" inputMode="numeric" placeholder="1100" invalid={!!errors.academic?.totalMarks} {...register("academic.totalMarks")} />
                    </Field>
                    <Field label="Grade" htmlFor="previousGrade" required error={errors.academic?.previousGrade?.message}>
                      <SelectInput id="previousGrade" invalid={!!errors.academic?.previousGrade} {...register("academic.previousGrade")}>
                        <option value="">Select grade</option>
                        {GRADES.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </SelectInput>
                    </Field>
                  </>
                ) : selected ? (
                  <>
                    <Field label="Last result — marks obtained (optional)" htmlFor="marksObtained" error={errors.academic?.marksObtained?.message}>
                      <TextInput id="marksObtained" type="number" inputMode="numeric" {...register("academic.marksObtained")} />
                    </Field>
                    <Field label="Last result — total marks (optional)" htmlFor="totalMarks" error={errors.academic?.totalMarks?.message}>
                      <TextInput id="totalMarks" type="number" inputMode="numeric" {...register("academic.totalMarks")} />
                    </Field>
                  </>
                ) : null}
              </div>
            ) : null}

            {step === 2 ? (
              <div className="grid gap-6 sm:grid-cols-2">
                <Controller
                  control={control}
                  name="documents.cnicDoc"
                  render={({ field, fieldState }) => (
                    <FileUpload label="B-Form / CNIC copy *" purpose="application" value={field.value ?? ""} onChange={field.onChange} error={fieldState.error?.message} />
                  )}
                />
                <Controller
                  control={control}
                  name="documents.marksheet"
                  render={({ field, fieldState }) => (
                    <FileUpload
                      label={needsSsc ? "SSC marksheet *" : isNewAdmission ? "Last result card (optional)" : "Last result card *"}
                      purpose="application"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="documents.photo"
                  render={({ field, fieldState }) => (
                    <FileUpload
                      label="Passport-size photo *"
                      hint="JPG or PNG · max 5 MB"
                      accept="image/jpeg,image/png,image/webp"
                      purpose="application"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                    />
                  )}
                />
                <p className="self-center text-sm text-muted-foreground">
                  Documents are stored securely and seen only by the admissions office. Girls&apos; photos are viewed only by female staff of the girls wing.
                </p>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-6">
                <dl className="grid gap-x-8 gap-y-3 rounded-2xl bg-muted/50 p-6 text-sm sm:grid-cols-2">
                  {[
                    ["Student", v.personal.fullName],
                    ["Father's name", v.personal.fatherName],
                    ["B-Form / CNIC", v.personal.cnic],
                    ["Date of birth", v.personal.dateOfBirth],
                    ["Wing", v.personal.gender === "female" ? "Girls Wing" : "Boys Wing"],
                    ["Mobile", v.personal.phone],
                    ["Email", v.personal.email],
                    ["Program", programName],
                    ["Last class", v.academic.lastClass ?? "—"],
                    ["Previous school", v.academic.previousSchool || "—"],
                    ...(needsSsc ? [["SSC marks", `${v.academic.marksObtained ?? "—"} / ${v.academic.totalMarks ?? "—"} (${v.academic.board})`]] : []),
                  ].map(([k, val]) => (
                    <div key={k} className="flex justify-between gap-4 border-b border-border/60 pb-2">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="text-right font-medium">{String(val)}</dd>
                    </div>
                  ))}
                </dl>
                <label className="flex items-start gap-3 rounded-xl border p-4 text-sm">
                  <input type="checkbox" className="mt-0.5 size-4 accent-brand-700" {...register("documents.declaration")} />
                  <span>
                    I declare that the information and documents provided are true and correct. I understand that admission may be cancelled
                    if any information is found to be false, and I agree to the{" "}
                    <Link href="/terms" target="_blank" className="font-medium text-brand-600 underline">
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy-policy" target="_blank" className="font-medium text-brand-600 underline">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
                {errors.documents?.declaration ? (
                  <p className="text-xs text-destructive" role="alert">
                    {errors.documents.declaration.message}
                  </p>
                ) : null}
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 flex items-center justify-between gap-3 border-t pt-6">
          <Button type="button" variant="outline" size="lg" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || pending}>
            <ArrowLeft className="size-4" /> Back
          </Button>
          {step < steps.length - 1 ? (
            <Button type="button" size="lg" onClick={next}>
              Continue <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button type="submit" size="lg" disabled={pending} className="bg-gold-400 font-semibold text-brand-950 hover:bg-gold-300">
              {pending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              {pending ? "Submitting…" : "Submit application"}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
