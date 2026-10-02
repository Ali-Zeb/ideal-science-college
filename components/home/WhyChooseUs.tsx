import { ClipboardCheck, FlaskConical, HeartHandshake, MonitorCog, ShieldCheck, Target } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { StaggerChildren, StaggerItem } from "@/components/animations/StaggerChildren";
import { ParallaxSection } from "@/components/animations/ParallaxSection";

const features = [
  { icon: Target, title: "Separate girls wing", text: "Girls study in their own wing with female teachers and staff, in a purdah-observing, respectful environment." },
  { icon: ClipboardCheck, title: "Weekly testing", text: "Chapter tests every week and send-up exams under board conditions keep learning on track." },
  { icon: FlaskConical, title: "Practical labs", text: "Physics, Chemistry, Biology and Computer labs for every board practical and more." },
  { icon: HeartHandshake, title: "Parent partnership", text: "Monthly progress reports and parent–teacher meetings so families always know where their child stands." },
  { icon: ShieldCheck, title: "Discipline & safety", text: "Strict attendance, a respectful environment and a campus where students can focus." },
  { icon: MonitorCog, title: "Online portal", text: "Apply online, track your admission status and get updates from the student portal." },
];

/** Feature grid on a parallax background explaining the college's strengths. */
export function WhyChooseUs() {
  return (
    <ParallaxSection image="/images/gallery-222.jpg" alt="" className="section" overlayClassName="bg-brand-950/90">
      <div className="container-page">
        <SectionHeading
          tone="light"
          eyebrow="Why Ideal Science College"
          title="Everything your child needs to succeed"
          description="Professional teachers, constant assessment, Islamic values and close parent involvement — from the first day of Class 1 to FSc."
        />
        <StaggerChildren className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <StaggerItem key={title}>
              <div className="group h-full rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-gold-400/50 hover:bg-white/10">
                <span className="mb-5 flex size-14 items-center justify-center rounded-xl bg-gold-400/15 text-gold-400 transition-all duration-500 group-hover:rotate-[-8deg] group-hover:bg-gold-400 group-hover:text-brand-950">
                  <Icon className="size-7" aria-hidden />
                </span>
                <h3 className="font-sans text-lg font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{text}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </ParallaxSection>
  );
}
