"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BarChart3,
  Briefcase,
  Building2,
  CalendarDays,
  ExternalLink,
  FileText,
  GraduationCap,
  Images,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Newspaper,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/common/Logo";
import { cn } from "@/lib/utils";

export type DashboardArea = "admin" | "college" | "portal";

interface NavLink {
  label: string;
  href: string;
  icon: LucideIcon;
  badgeKey?: "messages" | "applications";
}

const NAV: Record<DashboardArea, { title: string; sections: { heading?: string; links: NavLink[] }[] }> = {
  admin: {
    title: "Admin Dashboard",
    sections: [
      { links: [{ label: "Overview", href: "/admin", icon: BarChart3 }] },
      {
        heading: "System",
        links: [
          { label: "Staff Users", href: "/admin/users", icon: UserCog },
          { label: "Student Accounts", href: "/admin/students", icon: Users },
          { label: "Site Settings", href: "/admin/settings", icon: Settings },
        ],
      },
      { heading: "Operations", links: [{ label: "College Dashboard", href: "/college", icon: Building2 }] },
    ],
  },
  college: {
    title: "College Dashboard",
    sections: [
      { links: [{ label: "Dashboard", href: "/college", icon: LayoutDashboard }] },
      {
        heading: "Admissions",
        links: [
          { label: "Applications", href: "/college/applications", icon: FileText, badgeKey: "applications" },
          { label: "Messages", href: "/college/messages", icon: Mail, badgeKey: "messages" },
        ],
      },
      {
        heading: "Content",
        links: [
          { label: "News", href: "/college/news", icon: Newspaper },
          { label: "Events", href: "/college/events", icon: CalendarDays },
          { label: "Gallery", href: "/college/gallery", icon: Images },
        ],
      },
      {
        heading: "Academics",
        links: [
          { label: "Programs", href: "/college/programs", icon: GraduationCap },
          { label: "Faculty", href: "/college/faculty", icon: Users },
          { label: "Careers", href: "/college/careers", icon: Briefcase },
        ],
      },
    ],
  },
  portal: {
    title: "Student Portal",
    sections: [
      {
        links: [
          { label: "My Dashboard", href: "/portal", icon: LayoutDashboard },
          { label: "Apply Online", href: "/admissions/apply", icon: FileText },
          { label: "Account", href: "/portal/account", icon: KeyRound },
        ],
      },
    ],
  },
};

interface DashboardShellProps {
  area: DashboardArea;
  user: { name: string; email: string; roleLabel: string };
  badges?: Partial<Record<"messages" | "applications", number>>;
  showAdminLink?: boolean;
  children: React.ReactNode;
}

function SidebarNav({ area, badges, showAdminLink, onNavigate }: Pick<DashboardShellProps, "area" | "badges" | "showAdminLink"> & { onNavigate?: () => void }) {
  const pathname = usePathname();
  const home = `/${area}`;
  const sections = [...NAV[area].sections];
  if (area === "college" && showAdminLink) {
    sections.push({ heading: "System", links: [{ label: "Admin Dashboard", href: "/admin", icon: ShieldCheck }] });
  }

  return (
    <nav aria-label={NAV[area].title} className="space-y-6">
      {sections.map((section, i) => (
        <div key={section.heading ?? i}>
          {section.heading ? <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-white/40 uppercase">{section.heading}</p> : null}
          <ul className="space-y-1">
            {section.links.map(({ label, href, icon: Icon, badgeKey }) => {
              const active = href === home ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
              const badge = badgeKey ? badges?.[badgeKey] : 0;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white",
                    )}
                  >
                    <Icon className="size-4.5 shrink-0" aria-hidden />
                    <span className="flex-1">{label}</span>
                    {badge ? (
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", active ? "bg-brand-900 text-white" : "bg-gold-400 text-brand-950")}>
                        {badge > 99 ? "99+" : badge}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** Shared chrome for the Admin, College and Student dashboards. */
export function DashboardShell({ area, user, badges, showAdminLink, children }: DashboardShellProps) {
  const [open, setOpen] = useState(false);
  const loginPath = area === "portal" ? "/portal/login" : "/login";
  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  const sidebar = (onNavigate?: () => void) => (
    <div className="flex h-full flex-col bg-sidebar p-4">
      <div className="mb-2 px-1">
        <Logo tone="light" href={`/${area}`} compact={false} />
      </div>
      <p className="mb-6 px-2 text-xs font-semibold tracking-wider text-sidebar-primary uppercase">{NAV[area].title}</p>
      <div className="flex-1 overflow-y-auto">
        <SidebarNav area={area} badges={badges} showAdminLink={showAdminLink} onNavigate={onNavigate} />
      </div>
      <Link href="/" target="_blank" className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white">
        <ExternalLink className="size-4" aria-hidden /> View website
      </Link>
      <p className="mt-3 border-t border-white/10 px-3 pt-3 text-[11px] text-sidebar-foreground/50">
        Software made by <span className="font-semibold text-sidebar-primary">Ali Zeb</span>
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/40 lg:grid lg:grid-cols-[272px_1fr] print:block print:bg-white">
      <aside className="sticky top-0 hidden h-screen lg:block print:hidden">{sidebar()}</aside>
      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-16 print:hidden items-center gap-3 border-b bg-white/90 px-4 backdrop-blur sm:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button type="button" className="rounded-lg p-2 hover:bg-muted lg:hidden" aria-label="Open navigation">
                <Menu className="size-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 border-0 p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              {sidebar(() => setOpen(false))}
            </SheetContent>
          </Sheet>
          <p className="font-semibold text-brand-800">{NAV[area].title}</p>
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-3 rounded-full py-1 pr-1 pl-3 hover:bg-muted">
                <span className="hidden text-right sm:block">
                  <span className="block text-sm leading-tight font-medium">{user.name}</span>
                  <span className="block text-xs text-muted-foreground">{user.roleLabel}</span>
                </span>
                <span className="flex size-9 items-center justify-center rounded-full bg-brand-700 text-sm font-semibold text-white">{initials}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>
                  <span className="block truncate">{user.name}</span>
                  <span className="block truncate text-xs font-normal text-muted-foreground">{user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={area === "portal" ? "/portal/account" : "/college/account"}>
                    <KeyRound className="size-4" /> Change password
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/" target="_blank">
                    <ExternalLink className="size-4" /> View website
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => void signOut({ callbackUrl: loginPath })} className="text-destructive">
                  <LogOut className="size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
