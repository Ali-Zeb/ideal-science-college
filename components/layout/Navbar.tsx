"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LayoutDashboard, LogIn } from "lucide-react";
import { useSession } from "next-auth/react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/animations/MagneticButton";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { NAV_ITEMS } from "@/lib/constants";
import { homeFor } from "@/lib/auth/config";
import { cn } from "@/lib/utils";
import { MobileMenu } from "./MobileMenu";

/** Sticky site header: transparent over the hero, solid white once scrolled. */
export function Navbar({ admissionsOpen }: { admissionsOpen: boolean }) {
  const pathname = usePathname();
  const { scrolled } = useScrollProgress(40);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const { data: session } = useSession();

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const solid = scrolled;
  const dashboardHref = session ? homeFor(session.user.kind, session.user.role) : "/portal/login";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300 lg:top-10",
        solid && "lg:top-0",
        solid ? "bg-white/95 shadow-[0_4px_30px_rgba(16,22,63,0.08)] backdrop-blur-md" : "bg-transparent",
      )}
    >
      <div className={cn("container-page flex items-center justify-between gap-4 transition-all", solid ? "h-18" : "h-22")}>
        <Logo tone={solid ? "dark" : "light"} />

        <nav aria-label="Main" className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <li
                key={item.href + item.label}
                className="relative"
                onMouseEnter={() => item.children && setOpenMenu(item.label)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <Link
                  href={item.href}
                  aria-haspopup={item.children ? "true" : undefined}
                  aria-expanded={item.children ? openMenu === item.label : undefined}
                  onFocus={() => item.children && setOpenMenu(item.label)}
                  className={cn(
                    "relative flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    solid ? "text-brand-900 hover:text-brand-600" : "text-white/90 hover:text-white",
                    isActive(item.href) && (solid ? "text-brand-600" : "text-gold-400"),
                  )}
                >
                  {item.label}
                  {item.children ? <ChevronDown className="size-3.5" aria-hidden /> : null}
                  {isActive(item.href) ? (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gold-400"
                    />
                  ) : null}
                </Link>
                <AnimatePresence>
                  {item.children && openMenu === item.label ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18 }}
                      className="absolute top-full left-0 w-72 pt-2"
                    >
                      <div className="overflow-hidden rounded-xl border bg-white p-2 shadow-xl">
                        {item.children.map((child) => (
                          <Link
                            key={child.href + child.label}
                            href={child.href}
                            onClick={() => setOpenMenu(null)}
                            className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-brand-50"
                          >
                            <span className="block text-sm font-semibold text-brand-800">{child.label}</span>
                            <span className="block text-xs text-muted-foreground">{child.description}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            className={cn("hidden h-10 px-3 sm:inline-flex", solid ? "text-brand-800" : "text-white hover:bg-white/10 hover:text-white")}
          >
            <Link href={dashboardHref}>
              {session ? <LayoutDashboard className="size-4" /> : <LogIn className="size-4" />}
              {session ? "Dashboard" : "Student Portal"}
            </Link>
          </Button>
          {admissionsOpen ? (
            <MagneticButton className="hidden sm:inline-block">
              <Button asChild className="h-10 bg-gold-400 px-5 font-semibold text-brand-900 shadow-lg shadow-gold-500/25 hover:bg-gold-300">
                <Link href="/admissions/apply">Apply Now</Link>
              </Button>
            </MagneticButton>
          ) : null}
          <MobileMenu solid={solid} admissionsOpen={admissionsOpen} dashboardHref={dashboardHref} signedIn={Boolean(session)} />
        </div>
      </div>
    </header>
  );
}
