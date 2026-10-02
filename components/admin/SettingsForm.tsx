"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Field, TextArea, TextInput, applyServerErrors } from "@/components/forms/Field";
import { FileUpload } from "@/components/forms/FileUpload";
import { Panel } from "./AdminUI";
import { saveSettings } from "@/actions/admin.actions";
import { settingsSchema, type SettingsData, type SettingsInput } from "@/lib/validators/settings.schema";
import type { SiteSettings } from "@/types";

/** Site configuration: identity, contact, social links, SEO and admissions switch. */
export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { register, control, handleSubmit, setError, formState: { errors } } = useForm<SettingsInput, unknown, SettingsData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { ...settings, seo: { ...settings.seo, keywords: settings.seo.keywords.join(", ") } },
  });

  const onSubmit = handleSubmit((d) =>
    startTransition(async () => {
      const res = await saveSettings(d);
      if (res.success) {
        toast.success(res.message);
        router.refresh();
      } else {
        applyServerErrors(res.fieldErrors, setError as never);
        toast.error(res.error);
      }
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <Panel title="Admissions">
        <div className="space-y-4">
          <Controller
            control={control}
            name="admissionsOpen"
            render={({ field }) => (
              <label className="flex items-center justify-between gap-4 rounded-xl border p-4">
                <span>
                  <span className="block text-sm font-medium">Admissions open</span>
                  <span className="text-xs text-muted-foreground">When off, the Apply buttons and online form are hidden.</span>
                </span>
                <Switch checked={!!field.value} onCheckedChange={field.onChange} />
              </label>
            )}
          />
          <Field label="Announcement bar" htmlFor="s-ann" hint="Shown at the top of every page (max 200 characters). Leave empty to hide." error={errors.announcement?.message}>
            <TextInput id="s-ann" {...register("announcement")} />
          </Field>
        </div>
      </Panel>

      <Panel title="Identity">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Site name" htmlFor="s-name" required error={errors.siteName?.message}>
            <TextInput id="s-name" invalid={!!errors.siteName} {...register("siteName")} />
          </Field>
          <Field label="Tagline" htmlFor="s-tag" required error={errors.tagline?.message}>
            <TextInput id="s-tag" invalid={!!errors.tagline} {...register("tagline")} />
          </Field>
          <div className="sm:col-span-2">
            <Controller
              control={control}
              name="logo"
              render={({ field }) => <FileUpload label="Logo (optional override)" accept="image/jpeg,image/png,image/webp" hint="Square image" purpose="content" value={field.value?.startsWith("http") ? field.value : ""} onChange={field.onChange} />}
            />
          </div>
        </div>
      </Panel>

      <Panel title="Contact details">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Phone" htmlFor="s-phone" required error={errors.contact?.phone?.message}>
            <TextInput id="s-phone" invalid={!!errors.contact?.phone} {...register("contact.phone")} />
          </Field>
          <Field label="Email" htmlFor="s-email" required hint="Also receives new application and message alerts" error={errors.contact?.email?.message}>
            <TextInput id="s-email" type="email" invalid={!!errors.contact?.email} {...register("contact.email")} />
          </Field>
          <Field label="Address" htmlFor="s-addr" required className="sm:col-span-2" error={errors.contact?.address?.message}>
            <TextArea id="s-addr" rows={2} invalid={!!errors.contact?.address} {...register("contact.address")} />
          </Field>
          <Field label="Office hours" htmlFor="s-hours" required error={errors.contact?.officeHours?.message}>
            <TextInput id="s-hours" invalid={!!errors.contact?.officeHours} {...register("contact.officeHours")} />
          </Field>
          <Field label="Google Maps embed link" htmlFor="s-map" hint="Google Maps → Share → Embed a map → copy the src link" error={errors.contact?.mapEmbedUrl?.message}>
            <TextInput id="s-map" invalid={!!errors.contact?.mapEmbedUrl} {...register("contact.mapEmbedUrl")} />
          </Field>
        </div>
      </Panel>

      <Panel title="Social media">
        <div className="grid gap-5 sm:grid-cols-2">
          {(["facebook", "instagram", "youtube", "twitter", "linkedin"] as const).map((k) => (
            <Field key={k} label={k === "twitter" ? "X (Twitter)" : k[0].toUpperCase() + k.slice(1)} htmlFor={`s-${k}`} error={errors.social?.[k]?.message}>
              <TextInput id={`s-${k}`} type="url" placeholder="https://" invalid={!!errors.social?.[k]} {...register(`social.${k}`)} />
            </Field>
          ))}
        </div>
      </Panel>

      <Panel title="Search engine (SEO)">
        <div className="grid gap-5">
          <Field label="Meta title (optional)" htmlFor="s-mt" hint="Up to 70 characters" error={errors.seo?.metaTitle?.message}>
            <TextInput id="s-mt" {...register("seo.metaTitle")} />
          </Field>
          <Field label="Meta description" htmlFor="s-md" hint="Up to 170 characters" error={errors.seo?.metaDescription?.message}>
            <TextArea id="s-md" rows={3} {...register("seo.metaDescription")} />
          </Field>
          <Field label="Extra keywords" htmlFor="s-kw" hint="Comma separated" error={errors.seo?.keywords?.message as string | undefined}>
            <TextInput id="s-kw" {...register("seo.keywords")} />
          </Field>
        </div>
      </Panel>

      <div className="sticky bottom-0 z-10 -mx-4 flex justify-end border-t bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save settings
        </Button>
      </div>
    </form>
  );
}
