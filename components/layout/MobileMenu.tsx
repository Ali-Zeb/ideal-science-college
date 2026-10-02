"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/Logo";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  solid: boolean;
  admissionsOpen: boolean;
  dashboardHref: string;
  signedIn: boolean;
}

/** Slide-in navigation drawer for screens below the `xl` breakpoint. */
export function MobileMenu({ solid, admissionsOpen, dashboardHref, signedIn }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon-lg"
          className={cn("xl:hidden", solid ? "text-brand-900" : "text-white hover:bg-white/10 hover:text-white")}
          aria-label="Open menu"
        >
          <Menu className="size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[88vw] max-w-sm overflow-y-auto p-0">
        <SheetHeader className="border-b p-5">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Logo />
        </SheetHeader>
        <nav aria-label="Mobile" className="p-3">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <li key={item.label}>
                  {item.children ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setExpanded(expanded === item.label ? null : item.label)}
                        aria-expanded={expanded === item.label}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg px-4 py-3 text-left font-medium",
                          active ? "bg-brand-50 text-brand-700" : "text-brand-900 hover:bg-muted",
                        )}
                      >
                        {item.label}
                        <ChevronDown className={cn("size-4 transition-transform", expanded === item.label && "rotate-180")} />
                      </button>
                      {expanded === item.label ? (
                        <ul className="mt-1 ml-4 space-y-1 border-l pl-3">
                          {item.children.map((child) => (
                            <li key={child.label}>
                              <Link
                                href={child.href}
                                onClick={() => setOpen(false)}
                                className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-brand-700"
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "block rounded-lg px-4 py-3 font-medium",
                        active ? "bg-brand-50 text-brand-700" : "text-brand-900 hover:bg-muted",
                      )}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
            <li>
              <Link href="/careers" onClick={() => setOpen(false)} className="block rounded-lg px-4 py-3 font-medium text-brand-900 hover:bg-muted">
                Careers
              </Link>
            </li>
          </ul>
          <div className="mt-6 grid gap-3 px-1">
            <Button asChild variant="outline" className="h-11">
              <Link href={dashboardHref} onClick={() => setOpen(false)}>
                {signedIn ? "My Dashboard" : "Student Portal Login"}
              </Link>
            </Button>
            {admissionsOpen ? (
              <Button asChild className="h-11 bg-gold-400 font-semibold text-brand-900 hover:bg-gold-300">
                <Link href="/admissions/apply" onClick={() => setOpen(false)}>
                  Apply Now
                </Link>
              </Button>
            ) : null}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
