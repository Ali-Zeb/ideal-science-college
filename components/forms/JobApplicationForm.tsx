"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, TextArea, TextInput, applyServerErrors } from "./Field";
import { FileUpload } from "./FileUpload";
import { submitJobApplication } from "@/actions/career.actions";
import { jobApplicationSchema, type JobApplicationData, type JobApplicationInput } from "@/lib/validators/career.schema";

/** Application form for a job opening (CV upload as PDF or image). */
export function JobApplicationForm({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<JobApplicationInput, unknown, JobApplicationData>({
    resolver: zodResolver(jobApplicationSchema),
    mode: "onTouched",
    defaultValues: { jobId, fullName: "", email: "", phone: "", qualification: "", experience: "", coverLetter: "", resume: "", website: "" },
  });

  const onSubmit = handleSubmit((data) =>
    startTransition(async () => {
      const res = await submitJobApplication(data);
      if (res.success) {
        setDone(true);
        toast.success(res.message);
      } else {
        applyServerErrors(res.fieldErrors, setError as never);
        toast.error(res.error);
      }
    }),
  );

  if (done) {
    return (
      <div className="rounded-2xl border border-leaf-500/40 bg-leaf-500/5 p-8 text-center">
        <CheckCircle2 className="mx-auto size-12 text-leaf-500" aria-hidden />
        <h3 className="mt-4 font-sans text-xl font-bold text-brand-800">Application received</h3>
        <p className="mt-2 text-sm text-muted-foreground">Thank you for applying for {jobTitle}. We have emailed you a confirmation.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
      <Field label="Full name" htmlFor="j-name" required error={errors.fullName?.message}>
        <TextInput id="j-name" autoComplete="name" invalid={!!errors.fullName} {...register("fullName")} />
      </Field>
      <Field label="Email" htmlFor="j-email" required error={errors.email?.message}>
        <TextInput id="j-email" type="email" autoComplete="email" invalid={!!errors.email} {...register("email")} />
      </Field>
      <Field label="Mobile" htmlFor="j-phone" required hint="e.g. 0308-5744005" error={errors.phone?.message}>
        <TextInput id="j-phone" type="tel" autoComplete="tel" invalid={!!errors.phone} {...register("phone")} />
      </Field>
      <Field label="Highest qualification" htmlFor="j-qual" required error={errors.qualification?.message}>
        <TextInput id="j-qual" placeholder="e.g. M.Sc Chemistry" invalid={!!errors.qualification} {...register("qualification")} />
      </Field>
      <Field label="Teaching experience" htmlFor="j-exp" required className="sm:col-span-2" error={errors.experience?.message}>
        <TextInput id="j-exp" placeholder="e.g. 3 years at intermediate level" invalid={!!errors.experience} {...register("experience")} />
      </Field>
      <Field label="Cover letter (optional)" htmlFor="j-cover" className="sm:col-span-2" error={errors.coverLetter?.message}>
        <TextArea id="j-cover" rows={5} {...register("coverLetter")} />
      </Field>
      <div className="sm:col-span-2">
        <Controller
          control={control}
          name="resume"
          render={({ field, fieldState }) => (
            <FileUpload label="CV / Resume *" hint="PDF preferred · max 5 MB" purpose="career" value={field.value ?? ""} onChange={field.onChange} error={fieldState.error?.message} />
          )}
        />
      </div>
      <div className="hidden" aria-hidden>
        <input tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" size="lg" disabled={pending} className="h-12 px-8">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          {pending ? "Submitting…" : "Submit application"}
        </Button>
      </div>
    </form>
  );
}
