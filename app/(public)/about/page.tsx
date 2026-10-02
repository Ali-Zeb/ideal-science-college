import Image from "next/image";
import { BookHeart, Eye, Flag, HeartHandshake, Lightbulb, ShieldCheck, Users } from "lucide-react";
import { PageHero } from "@/components/common/PageHero";
import { SectionHeading } from "@/components/common/SectionHeading";
import { FadeIn } from "@/components/animations/FadeIn";
import { StaggerChildren, StaggerItem } from "@/components/animations/StaggerChildren";
import { CTASection } from "@/components/home/CTASection";
import { getSiteSettings } from "@/lib/data/settings";
import { buildMetadata } from "@/lib/utils/seo";
import { SITE } from "@/lib/constants";

export const metadata = buildMetadata({
  title: "About Us",
  description:
    "Learn about Ideal Science College, Serai Naurang — a school and college from Class 1 to FSc with separate boys and girls wings, part of the Chokara Science Group of Colleges.",
  path: "/about",
});

const values = [
  { icon: Lightbulb, title: "Excellence", text: "High expectations in every class, backed by regular testing and feedback." },
  { icon: ShieldCheck, title: "Discipline", text: "Punctuality, attendance and respect are part of daily life on campus." },
  { icon: BookHeart, title: "Islamic values", text: "Character building, Nazra Quran and Islamic teachings alongside modern science." },
  { icon: HeartHandshake, title: "Partnership", text: "Parents are kept informed through progress reports and regular meetings." },
];

const timeline = [
  { year: String(SITE.established), title: "Foundation", text: "The college opens in Serai Naurang as a branch of the Chokara Science Group of Colleges." },
  { year: "Growth", title: "FSc streams", text: "FSc Pre-Medical, Pre-Engineering and ICS classes established with science and computer labs." },
  { year: "Girls Wing", title: "Separate girls wing", text: "A dedicated girls wing opens with female teachers, giving daughters of the area a purdah-observing place to study." },
  { year: "School", title: "Class 1 to 10", text: "The school section expands from Primary to Matric Science, completing education from Class 1 to 12." },
  { year: "Today", title: "Online & growing", text: "Online admissions, a student portal and a growing record of board results." },
];

export default async function AboutPage() {
  const settings = await getSiteSettings();
  return (
    <>
      <PageHero
        title="About Ideal Science College"
        description="A school and college from Class 1 to FSc, serving the families of Serai Naurang and District Lakki Marwat with quality education and Islamic values."
        image="/images/gallery-666.jpg"
        breadcrumbs={[{ name: "About", path: "/about" }]}
      />

      <section className="section">
        <div className="container-page grid items-center gap-14 lg:grid-cols-2">
          <FadeIn direction="right">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl">
              <Image src="/images/campus-gate.jpeg" alt="Ideal Science College main gate" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
          </FadeIn>
          <FadeIn>
            <SectionHeading align="left" eyebrow="Who we are" title="Education close to home, without compromise" className="mb-6" />
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                Ideal Science College, Serai Naurang is a branch of the <strong className="text-foreground">Chokara Science Group of Colleges, Chokara Karak</strong>.
                We run a complete school and college: Primary (Class 1–5), Middle (Class 6–8), Matric Science (Class 9–10) and
                FSc Pre-Medical, FSc Pre-Engineering and ICS (Class 11–12), affiliated with {SITE.board}.
              </p>
              <p>
                Boys and girls study in <strong className="text-foreground">separate wings</strong>. Our girls wing is taught and managed by female
                teachers and staff so that daughters can study in a purdah-observing, respectful environment — a choice that matters to
                the families we serve.
              </p>
              <p>
                Our teachers are qualified, experienced professionals. Weekly tests, monthly reports and close contact with parents help
                every student reach their potential.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="section bg-brand-50/60">
        <div className="container-page grid gap-8 md:grid-cols-2">
          {[
            { icon: Flag, title: "Our Mission", text: "To provide affordable, high-quality education from Class 1 to FSc that combines strong science teaching with Islamic values, discipline and care — so every child of our region can compete with confidence." },
            { icon: Eye, title: "Our Vision", text: "To be the most trusted school and college in southern Khyber Pakhtunkhwa, known for board results, character and opportunity for both boys and girls." },
          ].map(({ icon: Icon, title, text }, i) => (
            <FadeIn key={title} delay={i * 0.1}>
              <div className="h-full rounded-3xl bg-white p-8 shadow-sm sm:p-10">
                <span className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-brand-700 text-gold-400">
                  <Icon className="size-7" aria-hidden />
                </span>
                <h2 className="text-2xl font-bold text-brand-800">{title}</h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">{text}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container-page grid items-center gap-12 lg:grid-cols-[1fr_1.5fr]">
          <FadeIn direction="right">
            <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-full border-8 border-brand-50 bg-gradient-to-br from-brand-700 to-brand-500 shadow-xl">
              <div className="flex h-full flex-col items-center justify-center text-white">
                <Users className="mb-3 size-16 text-gold-400" aria-hidden />
                <p className="font-heading text-2xl font-bold">Principal&apos;s Office</p>
              </div>
            </div>
          </FadeIn>
          <FadeIn>
            <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-brand-600 uppercase">Message from the Principal</p>
            <blockquote className="font-heading text-2xl leading-relaxed text-brand-800 sm:text-3xl">
              “Every child who walks through our gate deserves the same chance as a student in any big city. Our job is to give them that
              chance — with good teaching, firm discipline and a lot of care.”
            </blockquote>
            <p className="mt-6 text-muted-foreground">
              We welcome parents to visit the campus, meet our teachers and see our classrooms for themselves. Our doors — and our phone
              line, {settings.contact.phone} — are always open.
            </p>
            <p className="mt-4 font-semibold text-brand-700">— Principal, {SITE.name}</p>
          </FadeIn>
        </div>
      </section>

      <section className="section bg-muted/50">
        <div className="container-page">
          <SectionHeading eyebrow="Our values" title="What we stand for" />
          <StaggerChildren className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ icon: Icon, title, text }) => (
              <StaggerItem key={title}>
                <div className="group h-full rounded-2xl border bg-white p-7 text-center transition-all hover:-translate-y-1 hover:shadow-lg">
                  <Icon className="mx-auto mb-4 size-10 text-gold-500 transition-transform group-hover:scale-110" aria-hidden />
                  <h3 className="font-sans text-lg font-bold text-brand-800">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{text}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      <section className="section">
        <div className="container-page max-w-4xl">
          <SectionHeading eyebrow="Our journey" title="How we have grown" />
          <ol className="relative border-l-2 border-brand-100 pl-8">
            {timeline.map((item, i) => (
              <li key={item.title} className="relative mb-10 last:mb-0">
                <FadeIn delay={i * 0.08} direction="left">
                  <span className="absolute top-1 -left-[43px] flex size-5 items-center justify-center rounded-full bg-gold-400 ring-4 ring-white" aria-hidden />
                  <p className="text-sm font-bold tracking-wider text-gold-600 uppercase">{item.year}</p>
                  <h3 className="mt-1 font-sans text-xl font-bold text-brand-800">{item.title}</h3>
                  <p className="mt-1 text-muted-foreground">{item.text}</p>
                </FadeIn>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <CTASection phone={settings.contact.phone} admissionsOpen={settings.admissionsOpen} />
    </>
  );
}
