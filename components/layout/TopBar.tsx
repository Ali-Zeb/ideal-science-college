import Link from "next/link";
import { Clock, Mail, Megaphone, Phone } from "lucide-react";
import type { SiteSettings } from "@/types";

/** Thin contact strip above the navbar (hidden on small screens). */
export function TopBar({ settings }: { settings: SiteSettings }) {
  const tel = settings.contact.phone.replace(/[^\d+]/g, "");
  return (
    <div className="hidden bg-brand-950 text-xs text-white/80 lg:block">
      <div className="container-page flex h-10 items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <a href={`tel:${tel}`} className="flex items-center gap-2 transition-colors hover:text-gold-400">
            <Phone className="size-3.5" aria-hidden /> {settings.contact.phone}
          </a>
          <a href={`mailto:${settings.contact.email}`} className="flex items-center gap-2 transition-colors hover:text-gold-400">
            <Mail className="size-3.5" aria-hidden /> {settings.contact.email}
          </a>
          <span className="flex items-center gap-2">
            <Clock className="size-3.5" aria-hidden /> {settings.contact.officeHours}
          </span>
        </div>
        {settings.announcement ? (
          <Link href="/admissions" className="flex items-center gap-2 font-medium text-gold-400 hover:text-gold-300">
            <Megaphone className="size-3.5" aria-hidden />
            <span className="max-w-md truncate">{settings.announcement}</span>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
