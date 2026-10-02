import Image from "next/image";
import { GraduationCap, Mail } from "lucide-react";
import { FacebookIcon, LinkedinIcon, XIcon } from "@/components/common/SocialIcons";
import { cn } from "@/lib/utils";
import type { FacultyItem } from "@/types";

function initials(name: string) {
  return name
    .replace(/^(Dr\.|Prof\.|Qari|Hafiz)\s+/i, "")
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

/** Faculty member card: photo (or initials), name, designation, department, contact links. */
export function FacultyCard({ member, className }: { member: FacultyItem; className?: string }) {
  const links = [
    member.email ? { href: `mailto:${member.email}`, icon: Mail, label: "Email" } : null,
    member.social.linkedin ? { href: member.social.linkedin, icon: LinkedinIcon, label: "LinkedIn" } : null,
    member.social.twitter ? { href: member.social.twitter, icon: XIcon, label: "Twitter" } : null,
    member.social.facebook ? { href: member.social.facebook, icon: FacebookIcon, label: "Facebook" } : null,
  ].filter((l): l is NonNullable<typeof l> => l !== null);

  return (
    <article className={cn("group h-full overflow-hidden rounded-2xl border bg-card text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl", className)}>
      <div className="relative aspect-[4/4] overflow-hidden bg-gradient-to-br from-brand-700 to-brand-500">
        {member.photo ? (
          <Image src={member.photo} alt={member.name} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-heading text-6xl font-bold text-white/90">{initials(member.name)}</span>
          </div>
        )}
        {links.length ? (
          <div className="absolute inset-x-0 bottom-0 flex translate-y-full justify-center gap-2 bg-gradient-to-t from-brand-950/80 p-4 transition-transform duration-300 group-hover:translate-y-0 group-focus-within:translate-y-0">
            {links.map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                aria-label={`${member.name} on ${label}`}
                className="flex size-9 items-center justify-center rounded-full bg-white text-brand-700 hover:bg-gold-400"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        ) : null}
      </div>
      <div className="p-5">
        <h3 className="font-sans text-lg font-bold text-brand-800">{member.name}</h3>
        <p className="mt-0.5 text-sm font-medium text-gold-600">{member.designation}</p>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <GraduationCap className="size-3.5" aria-hidden /> {member.qualification} · {member.department}
        </p>
      </div>
    </article>
  );
}
