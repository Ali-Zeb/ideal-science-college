import { TopBar } from "@/components/layout/TopBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgress } from "@/components/animations/ScrollProgress";
import { ChatAssistant } from "@/components/common/ChatAssistant";
import { getSiteSettings } from "@/lib/data/settings";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  return (
    <>
      <a
        href="#main"
        className="sr-only z-[80] rounded-md bg-white px-4 py-2 font-medium text-brand-800 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <ScrollProgress />
      <TopBar settings={settings} />
      <Navbar admissionsOpen={settings.admissionsOpen} />
      <main id="main">{children}</main>
      <Footer settings={settings} />
      {process.env.ANTHROPIC_API_KEY ? <ChatAssistant /> : null}
    </>
  );
}
