import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { FacebookIcon, InstagramIcon, LinkedinIcon, XIcon, YoutubeIcon } from "@/components/common/SocialIcons";
import { Logo } from "@/components/common/Logo";
import { SITE } from "@/lib/constants";
import type { SiteSettings } from "@/types";

const columns = [
  {
    title: "Explore",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Programs", href: "/academics" },
      { label: "Faculty", href: "/academics/faculty" },
      { label: "Campus Life", href: "/campus-life" },
      { label: "Gallery", href: "/gallery" },
    ],
  },
  {
    title: "Admissions",
    links: [
      { label: "Admission Process", href: "/admissions" },
      { label: "Apply Online", href: "/admissions/apply" },
      { label: "Student Portal", href: "/portal" },
      { label: "FAQs", href: "/faq" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Updates",
    links: [
      { label: "News", href: "/news" },
      { label: "Events", href: "/events" },
      { label: "Contact Us", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Use", href: "/terms" },
    ],
  },
];

const socialIcons = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
  twitter: XIcon,
  linkedin: LinkedinIcon,
} as const;

/** Site footer with contact details, quick links and social profiles. */
export function Footer({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();
  const socials = (Object.keys(socialIcons) as (keyof typeof socialIcons)[]).filter((k) => settings.social[k]);
  const tel = settings.contact.phone.replace(/[^\d+]/g, "");

  return (
    <footer className="relative overflow-hidden bg-brand-950 text-white/75">
      <div className="absolute -top-32 -left-32 size-96 rounded-full bg-brand-700/40 blur-3xl" aria-hidden />
      <div className="container-page relative grid gap-12 py-16 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Logo tone="light" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed">
            {SITE.affiliation}. School (Class 1–10) and college (FSc & ICS) with separate boys and girls wings, serving
            the families of Lakki Marwat since {SITE.established}.
          </p>
          {socials.length ? (
            <ul className="mt-6 flex gap-3" aria-label="Social media">
              {socials.map((key) => {
                const Icon = socialIcons[key];
                return (
                  <li key={key}>
                    <a
                      href={settings.social[key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={key}
                      className="flex size-10 items-center justify-center rounded-full bg-white/10 transition-all hover:-translate-y-1 hover:bg-gold-400 hover:text-brand-950"
                    >
                      <Icon className="size-4" />
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>

        <div className="grid gap-10 sm:grid-cols-3 lg:col-span-5">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 font-sans text-sm font-semibold tracking-wider text-gold-400 uppercase">{col.title}</h3>
              <ul className="space-y-2.5 text-sm">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="lg:col-span-3">
          <h3 className="mb-4 font-sans text-sm font-semibold tracking-wider text-gold-400 uppercase">Get in touch</h3>
          <ul className="space-y-4 text-sm">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold-400" aria-hidden />
              <span>{settings.contact.address}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-gold-400" aria-hidden />
              <a href={`tel:${tel}`} className="hover:text-white">
                {settings.contact.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-gold-400" aria-hidden />
              <a href={`mailto:${settings.contact.email}`} className="break-all hover:text-white">
                {settings.contact.email}
              </a>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 size-4 shrink-0 text-gold-400" aria-hidden />
              <span>{settings.contact.officeHours}</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="container-page relative pb-10">
        <a
          href="https://skillswap-frontend-cy48.onrender.com"
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="group flex flex-col items-center justify-between gap-4 rounded-2xl border border-gold-400/30 bg-gradient-to-r from-brand-800/80 to-brand-700/60 px-6 py-5 text-center transition-colors hover:border-gold-400/70 sm:flex-row sm:text-left"
        >
          <span>
            <span className="mb-1 inline-block rounded-full bg-gold-400/20 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-gold-300 uppercase">Sponsored</span>
            <span className="block text-base font-semibold text-white">SkillSwap — learn a new skill, teach what you know</span>
            <span className="block text-sm text-white/65">Swap skills with students and professionals. Free to join.</span>
          </span>
          <span className="shrink-0 rounded-full bg-gold-400 px-5 py-2 text-sm font-semibold text-brand-950 transition-transform group-hover:scale-105">Visit SkillSwap →</span>
        </a>
      </div>
      <div className="relative border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 text-xs sm:flex-row">
          <p>
            © {year} {settings.siteName}. All rights reserved. · Software made by{" "}
            <span className="font-semibold text-gold-400">Ali Zeb</span>
          </p>
          <div className="flex gap-5">
            <Link href="/privacy-policy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/sitemap.xml" className="hover:text-white">Sitemap</Link>
            <Link href="/login" className="hover:text-white">Staff Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
