import Link from "next/link";
import { PageHero } from "@/components/common/PageHero";
import { JsonLd } from "@/components/common/SEO";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { buildMetadata } from "@/lib/utils/seo";

export const metadata = buildMetadata({
  title: "Frequently Asked Questions",
  description: "Answers to common questions about admissions, fees, the girls wing, documents and the student portal at Ideal Science College.",
  path: "/faq",
});

const faqs = [
  {
    group: "Admissions",
    items: [
      ["Which classes do you offer?", "We teach from Class 1 to Class 12: Primary (1–5), Middle (6–8), Matric Science (9–10) and FSc Pre-Medical, FSc Pre-Engineering and ICS (11–12)."],
      ["How do I apply?", "Create a Student Portal account, verify your email, then complete the online form at Apply Online. You can also visit the office during office hours."],
      ["Can a parent apply for more than one child?", "Yes. One portal account can submit separate applications for each child."],
      ["What documents are needed?", "The student's B-Form or CNIC, the last result card (SSC marksheet for FSc/ICS) and a passport-size photograph. Bring the originals when confirming admission."],
      ["What marks are required for FSc?", "Pre-Medical and Pre-Engineering require at least 60% in Matric Science; ICS requires at least 50%. Admission is on merit."],
    ],
  },
  {
    group: "Girls wing",
    items: [
      ["Are boys and girls taught separately?", "Yes. Boys and girls study in separate wings. The girls wing is taught and managed by female teachers in a purdah-observing environment."],
      ["Who can see my daughter's documents and photo?", "Documents are visible only to authorised admissions staff. Girls' applications, documents and photographs are visible only to girls-wing staff and the principal's office."],
    ],
  },
  {
    group: "Fees & portal",
    items: [
      ["Where can I see the fee structure?", "Fees for each program are listed on the Admissions page and on each program's page."],
      ["Are scholarships available?", "Merit scholarships and concessions for siblings and deserving students are available. Ask the office for details."],
      ["How do I check my application status?", "Sign in to the Student Portal. Your application shows Pending, Under Review, Approved, Rejected or Enrolled, and you also receive email updates."],
      ["I forgot my password.", "Use 'Forgot password' on the portal login page. A 6-digit reset code will be emailed to you."],
    ],
  },
] as const;

export default function FaqPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.flatMap((g) =>
            g.items.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
          ),
        }}
      />
      <PageHero title="Frequently Asked Questions" description="Quick answers about admissions, the girls wing, fees and the student portal." breadcrumbs={[{ name: "FAQ", path: "/faq" }]} />
      <section className="section">
        <div className="container-page max-w-3xl space-y-12">
          {faqs.map((g) => (
            <div key={g.group}>
              <h2 className="mb-4 text-2xl font-bold text-brand-800">{g.group}</h2>
              <Accordion type="single" collapsible className="rounded-2xl border bg-card px-5">
                {g.items.map(([q, a]) => (
                  <AccordionItem key={q} value={q}>
                    <AccordionTrigger className="py-5 text-left text-base font-semibold hover:no-underline">{q}</AccordionTrigger>
                    <AccordionContent className="pb-5 text-muted-foreground">{a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
          <p className="text-center text-muted-foreground">
            Still have a question?{" "}
            <Link href="/contact" className="font-semibold text-brand-600 underline">
              Contact us
            </Link>{" "}
            or ask the assistant at the bottom-right of the page.
          </p>
        </div>
      </section>
    </>
  );
}
