import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/common/PageHero";
import { FadeIn } from "@/components/animations/FadeIn";
import { ContactForm } from "@/components/forms/ContactForm";
import { getSiteSettings } from "@/lib/data/settings";
import { buildMetadata } from "@/lib/utils/seo";

export const metadata = buildMetadata({
  title: "Contact Us",
  description: "Contact Ideal Science College, Serai Naurang — phone, email, address, office hours and online contact form.",
  path: "/contact",
});

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const tel = settings.contact.phone.replace(/[^\d+]/g, "");
  const cards = [
    { icon: Phone, title: "Call us", value: settings.contact.phone, href: `tel:${tel}` },
    { icon: Mail, title: "Email", value: settings.contact.email, href: `mailto:${settings.contact.email}` },
    { icon: MapPin, title: "Visit", value: settings.contact.address },
    { icon: Clock, title: "Office hours", value: settings.contact.officeHours },
  ];

  return (
    <>
      <PageHero
        title="Contact Us"
        description="Questions about admissions, fees or results? Call, email or send us a message — we're happy to help."
        image="/images/campus-gate.jpeg"
        breadcrumbs={[{ name: "Contact", path: "/contact" }]}
      />
      <section className="section">
        <div className="container-page">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map(({ icon: Icon, title, value, href }, i) => (
              <FadeIn key={title} delay={i * 0.06}>
                <div className="h-full rounded-2xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                  <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-brand-700 text-gold-400">
                    <Icon className="size-6" aria-hidden />
                  </span>
                  <h2 className="font-sans text-sm font-semibold tracking-wider text-muted-foreground uppercase">{title}</h2>
                  {href ? (
                    <a href={href} className="mt-1 block font-semibold break-words text-brand-800 hover:text-brand-600">
                      {value}
                    </a>
                  ) : (
                    <p className="mt-1 font-semibold text-brand-800">{value}</p>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>

          <div className="mt-16 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
            <FadeIn>
              <div className="rounded-3xl border bg-card p-6 shadow-xl sm:p-10">
                <h2 className="text-2xl font-bold text-brand-800 sm:text-3xl">Send us a message</h2>
                <p className="mt-2 mb-8 text-sm text-muted-foreground">We reply within 1–2 working days. For urgent matters, please call.</p>
                <ContactForm />
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="h-full min-h-96 overflow-hidden rounded-3xl border shadow-xl">
                <iframe
                  title="Map showing Ideal Science College, Serai Naurang"
                  src={settings.contact.mapEmbedUrl}
                  className="h-full min-h-96 w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  );
}
