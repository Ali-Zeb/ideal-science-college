import { PageHero } from "@/components/common/PageHero";
import { getSiteSettings } from "@/lib/data/settings";
import { buildMetadata } from "@/lib/utils/seo";
import { SITE } from "@/lib/constants";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description: "How Ideal Science College collects, uses and protects personal information submitted through this website.",
  path: "/privacy-policy",
});

const UPDATED = "1 October 2026";

export default async function PrivacyPage() {
  const settings = await getSiteSettings();
  return (
    <>
      <PageHero title="Privacy Policy" description={`Last updated: ${UPDATED}`} breadcrumbs={[{ name: "Privacy Policy", path: "/privacy-policy" }]} />
      <section className="section">
        <div className="prose-content container-page max-w-3xl">
          <p>
            {SITE.name} (&quot;the College&quot;, &quot;we&quot;) respects the privacy of students, parents and visitors. This policy explains what
            information we collect through this website, why we collect it and how we protect it.
          </p>

          <h2>1. Information we collect</h2>
          <ul>
            <li><strong>Student Portal accounts:</strong> name, email address, mobile number and an encrypted password.</li>
            <li><strong>Admission applications:</strong> student and father&apos;s name, B-Form/CNIC number, date of birth, gender, contact details, address, previous school and results, and uploaded documents (B-Form/CNIC copy, result card, photograph).</li>
            <li><strong>Contact and job applications:</strong> the details you type into the form and any CV you upload.</li>
            <li><strong>Website usage:</strong> anonymous analytics (pages visited, device type, approximate region) through Vercel Analytics and Google Analytics.</li>
            <li><strong>AI assistant:</strong> the questions you type into the chat assistant, used only to generate an answer. Please do not enter CNIC numbers, passwords or other sensitive data in the chat.</li>
          </ul>

          <h2>2. How we use information</h2>
          <ul>
            <li>To process admission applications and communicate decisions.</li>
            <li>To reply to your messages and job applications.</li>
            <li>To send important notices such as verification codes, application updates and password resets.</li>
            <li>To keep the website secure and improve it.</li>
          </ul>
          <p>We do not sell or rent personal information, and we do not use it for advertising.</p>

          <h2>3. Girls&apos; information</h2>
          <p>
            Respecting the privacy of our female students is important to us. Applications, documents and photographs of girls are visible only to
            staff accounts assigned to the girls wing and to the principal&apos;s office, and are never published on the website.
          </p>

          <h2>4. Service providers</h2>
          <p>
            We use trusted providers to run the website: MongoDB Atlas (database), Cloudinary (secure document and image storage), Brevo (email
            delivery), Vercel (hosting and analytics), Google Analytics and Anthropic (the AI assistant). They process data only on our behalf.
          </p>

          <h2>5. Security</h2>
          <p>
            Passwords are stored using strong one-way hashing. Access to dashboards is limited by role, login attempts are rate-limited, and all
            traffic is encrypted with HTTPS. No system is perfectly secure, but we take reasonable steps to protect your data.
          </p>

          <h2>6. Retention</h2>
          <p>
            Application records are kept for as long as needed for admissions and academic records, as required by the board and applicable law.
            Contact messages and unsuccessful job applications are deleted periodically.
          </p>

          <h2>7. Your choices</h2>
          <p>
            You may ask us to correct or delete your information, or to close your portal account, by contacting us at{" "}
            <a href={`mailto:${settings.contact.email}`}>{settings.contact.email}</a> or {settings.contact.phone}.
          </p>

          <h2>8. Changes</h2>
          <p>We may update this policy from time to time. The date at the top shows the latest revision.</p>
        </div>
      </section>
    </>
  );
}
