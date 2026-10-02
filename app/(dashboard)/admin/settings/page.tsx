import { PageHeader } from "@/components/admin/AdminUI";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { getSiteSettings } from "@/lib/data/settings";

export const metadata = { title: "Site settings" };

export default async function SettingsPage() {
  const settings = await getSiteSettings();
  return (
    <>
      <PageHeader title="Site settings" description="Changes appear on the website immediately after saving." />
      <SettingsForm settings={settings} />
    </>
  );
}
