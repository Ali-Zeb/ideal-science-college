"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, SelectInput, TextArea, TextInput, applyServerErrors } from "./Field";
import { submitContact } from "@/actions/contact.actions";
import { CONTACT_SUBJECTS, contactSchema, type ContactData, type ContactInput } from "@/lib/validators/contact.schema";

/** Public contact form with strict client + server validation and a bot honeypot. */
export function ContactForm() {
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ContactInput, unknown, ContactData>({
    resolver: zodResolver(contactSchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", phone: "", subject: undefined, message: "", website: "" },
  });

  const onSubmit = handleSubmit((data) =>
    startTransition(async () => {
      const res = await submitContact(data);
      if (res.success) {
        toast.success(res.message);
        reset();
      } else {
        applyServerErrors(res.fieldErrors, setError as never);
        toast.error(res.error);
      }
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
      <Field label="Full name" htmlFor="c-name" required error={errors.name?.message}>
        <TextInput id="c-name" autoComplete="name" invalid={!!errors.name} {...register("name")} />
      </Field>
      <Field label="Email" htmlFor="c-email" required error={errors.email?.message}>
        <TextInput id="c-email" type="email" autoComplete="email" invalid={!!errors.email} {...register("email")} />
      </Field>
      <Field label="Mobile (optional)" htmlFor="c-phone" hint="e.g. 0308-5744005" error={errors.phone?.message}>
        <TextInput id="c-phone" type="tel" autoComplete="tel" invalid={!!errors.phone} {...register("phone")} />
      </Field>
      <Field label="Subject" htmlFor="c-subject" required error={errors.subject?.message}>
        <SelectInput id="c-subject" defaultValue="" invalid={!!errors.subject} {...register("subject")}>
          <option value="" disabled>
            Choose a subject
          </option>
          {CONTACT_SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </SelectInput>
      </Field>
      <Field label="Message" htmlFor="c-message" required className="sm:col-span-2" error={errors.message?.message}>
        <TextArea id="c-message" rows={6} invalid={!!errors.message} {...register("message")} />
      </Field>
      <div className="hidden" aria-hidden>
        <label htmlFor="c-website">Website</label>
        <input id="c-website" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" size="lg" disabled={pending} className="h-12 w-full px-8 sm:w-auto">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          {pending ? "Sending…" : "Send message"}
        </Button>
      </div>
    </form>
  );
}
