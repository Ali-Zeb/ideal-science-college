import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/animations/MagneticButton";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";

interface CTASectionProps {
  phone: string;
  admissionsOpen: boolean;
  title?: string;
  description?: string;
}

/** Closing call-to-action band with animated gradient background. */
export function CTASection({
  phone,
  admissionsOpen,
  title = "Ready to join Ideal Science College?",
  description = "Seats are limited and admissions are merit-based. Create your student portal account and apply online in under ten minutes.",
}: CTASectionProps) {
  const tel = phone.replace(/[^\d+]/g, "");
  return (
    <section className="px-4 py-16 sm:py-20">
      <div className="animate-gradient relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-r from-brand-800 via-brand-600 to-brand-900 px-6 py-16 text-center shadow-2xl sm:px-12">
        <div className="animate-float-slow absolute -top-16 -left-16 size-64 rounded-full bg-gold-400/20 blur-2xl" aria-hidden />
        <div className="animate-float-slow absolute -right-10 -bottom-20 size-72 rounded-full bg-leaf-500/20 blur-2xl" aria-hidden />
        <div className="relative">
          <TextReveal text={title} className="mx-auto max-w-3xl justify-center text-3xl leading-tight font-bold text-white sm:text-5xl" />
          <FadeIn delay={0.2}>
            <p className="mx-auto mt-5 max-w-2xl text-base text-white/80 sm:text-lg">{description}</p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              {admissionsOpen ? (
                <MagneticButton>
                  <Button asChild size="lg" className="h-13 bg-gold-400 px-7 text-base font-semibold text-brand-950 hover:bg-gold-300">
                    <Link href="/admissions/apply">
                      Start your application <ArrowRight className="size-5" />
                    </Link>
                  </Button>
                </MagneticButton>
              ) : null}
              <Button asChild size="lg" variant="outline" className="h-13 border-white/40 bg-transparent px-7 text-base text-white hover:bg-white/10 hover:text-white">
                <a href={`tel:${tel}`}>
                  <Phone className="size-5" /> Call {phone}
                </a>
              </Button>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
