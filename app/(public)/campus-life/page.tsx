import Image from "next/image";
import { BookOpenText, ClipboardList, Computer, Dumbbell, FlaskConical, HeartPulse, Library, Mic, MoonStar, ShieldCheck, Trophy, Users } from "lucide-react";
import { PageHero } from "@/components/common/PageHero";
import { SectionHeading } from "@/components/common/SectionHeading";
import { FadeIn } from "@/components/animations/FadeIn";
import { StaggerChildren, StaggerItem } from "@/components/animations/StaggerChildren";
import { CTASection } from "@/components/home/CTASection";
import { getSiteSettings } from "@/lib/data/settings";
import { buildMetadata } from "@/lib/utils/seo";

export const metadata = buildMetadata({
  title: "Campus Life",
  description: "Facilities, labs, sports, societies, study tours and the separate girls wing at Ideal Science College, Serai Naurang.",
  path: "/campus-life",
});

const facilities = [
  { icon: FlaskConical, title: "Science laboratories", text: "Physics, Chemistry and Biology labs equipped for all board practicals." },
  { icon: Computer, title: "Computer lab", text: "Hands-on computing for Matric, ICS and Middle section students." },
  { icon: Library, title: "Library", text: "Textbooks, reference books, past papers and a quiet reading area." },
  { icon: ShieldCheck, title: "Separate girls wing", text: "Classrooms, staff and facilities for girls, managed by female teachers." },
  { icon: ClipboardList, title: "Examination hall", text: "A large hall where send-up and term exams are held under board conditions." },
  { icon: HeartPulse, title: "First aid", text: "First-aid kits and trained staff on campus at all times." },
];

const activities = [
  { icon: Trophy, title: "Sports", text: "Cricket, football, volleyball and athletics for the boys wing; indoor games for the girls wing." },
  { icon: Mic, title: "Debates & speeches", text: "Urdu and English debates, Qirat and Naat competitions." },
  { icon: Users, title: "Study tours", text: "Annual educational trips to Islamabad and historic sites." },
  { icon: MoonStar, title: "Islamic programs", text: "Daily Nazra Quran, Seerat programs and Ramadan activities." },
  { icon: BookOpenText, title: "Science exhibitions", text: "Students present projects and experiments to parents and guests." },
  { icon: Dumbbell, title: "Annual sports day", text: "House competitions and prize distribution every year." },
];

export default async function CampusLifePage() {
  const settings = await getSiteSettings();
  return (
    <>
      <PageHero
        title="Campus Life"
        description="Learning goes beyond the classroom — labs, sports, trips and a respectful environment for boys and girls."
        image="/images/gallery-11.jpg"
        breadcrumbs={[{ name: "Campus Life", path: "/campus-life" }]}
      />

      <section className="section">
        <div className="container-page">
          <SectionHeading eyebrow="Facilities" title="Everything students need on campus" />
          <StaggerChildren className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {facilities.map(({ icon: Icon, title, text }) => (
              <StaggerItem key={title}>
                <div className="group flex h-full gap-4 rounded-2xl border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-700 group-hover:text-gold-400">
                    <Icon className="size-6" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-sans font-bold text-brand-800">{title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      <section className="section bg-brand-950 text-white">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <FadeIn direction="right">
            <div className="grid grid-cols-2 gap-4">
              {["/images/gallery-555.jpg", "/images/gallery-99.jpg", "/images/gallery-222.jpg", "/images/students-lab.jpeg"].map((src, i) => (
                <div key={src} className={`relative overflow-hidden rounded-2xl ${i % 2 ? "mt-8 aspect-[3/4]" : "aspect-[3/4]"}`}>
                  <Image src={src} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
                </div>
              ))}
            </div>
          </FadeIn>
          <div>
            <SectionHeading align="left" tone="light" eyebrow="Activities" title="Character, confidence and friendship" className="mb-8" />
            <ul className="grid gap-5 sm:grid-cols-2">
              {activities.map(({ icon: Icon, title, text }, i) => (
                <li key={title}>
                  <FadeIn delay={i * 0.06} className="flex gap-3">
                    <Icon className="mt-0.5 size-6 shrink-0 text-gold-400" aria-hidden />
                    <div>
                      <h3 className="font-sans font-semibold">{title}</h3>
                      <p className="text-sm text-white/70">{text}</p>
                    </div>
                  </FadeIn>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <CTASection phone={settings.contact.phone} admissionsOpen={settings.admissionsOpen} />
    </>
  );
}
