import { PageHero } from "@/components/common/PageHero";
import { getSiteSettings } from "@/lib/data/settings";
import { buildMetadata } from "@/lib/utils/seo";
import { SITE } from "@/lib/constants";

export const metadata = buildMetadata({
  title: "Terms of Use",
  description: "Terms for using the Ideal Science College website, student portal and online admission system.",
  path: "/terms",
});

const UPDATED = "1 October 2026";

export default async function TermsPage() {
  const settings = await getSiteSettings();
  return (
    <>
      <PageHero title="Terms of Use" description={`Last updated: ${UPDATED}`} breadcrumbs={[{ name: "Terms", path: "/terms" }]} />
      <section className="section">
        <div className="prose-content container-page max-w-3xl">
          <p>By using this website and the Student Portal of {SITE.name}, you agree to these terms.</p>

          <h2>1. Accounts</h2>
          <ul>
            <li>You must provide a real, working email address and verify it before using the portal.</li>
            <li>Keep your password confidential. You are responsible for activity on your account.</li>
            <li>Parents or guardians may create an account on behalf of a child under 18.</li>
          </ul>

          <h2>2. Admission applications</h2>
          <ul>
            <li>All information and documents submitted must be true and correct.</li>
            <li>Submitting an application does not guarantee admission. Admission is granted on merit and seat availability.</li>
            <li>Admission obtained on false information may be cancelled at any time.</li>
            <li>Final admission is confirmed only after verification of original documents and payment of fees at the office.</li>
          </ul>

          <h2>3. Fees</h2>
          <p>Fees shown on the website are for information and may change. The fee notified by the office at the time of admission applies.</p>

          <h2>4. Acceptable use</h2>
          <p>
            Do not attempt to access accounts or dashboards that are not yours, upload harmful files, submit false information or misuse the
            contact and chat features. We may suspend accounts that violate these terms.
          </p>

          <h2>5. AI assistant</h2>
          <p>
            The chat assistant provides general information to help visitors. Its answers may occasionally be incomplete or out of date — please
            confirm important details (fees, dates, eligibility) with the office.
          </p>

          <h2>6. Content</h2>
          <p>Text, photographs and logos on this website belong to the College and may not be reused without permission.</p>

          <h2>7. Contact</h2>
          <p>
            Questions about these terms: <a href={`mailto:${settings.contact.email}`}>{settings.contact.email}</a> · {settings.contact.phone}
          </p>
        </div>
      </section>
    </>
  );
}
