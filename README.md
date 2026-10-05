# Ideal Science College — Website & Dashboards

Official website of **Ideal Science College, Serai Naurang (District Lakki Marwat)** — a school and college from Class 1 to 12 with separate boys and girls wings, and a branch of the Chokara Science Group of Colleges, Karak.

It has a public website, an online admission system and three dashboards:

| Dashboard | URL | Who uses it | What it does |
|---|---|---|---|
| **Admin** | `/admin` | Owner, Administrator | System overview, staff accounts, student accounts, site settings, service status |
| **College** | `/college` | Owner, Administrator, College Staff | Admissions review, messages, news, events, programs, faculty, gallery, careers |
| **Student Portal** | `/portal` | Students & parents | Sign up with email verification, apply online, track application status, notices |

---

## Tech stack

Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS v4 + shadcn/ui · Framer Motion + GSAP · React Hook Form + Zod · MongoDB Atlas + Mongoose · NextAuth.js (JWT) · Cloudinary · Brevo · Anthropic Claude (AI assistant) · TipTap · Recharts · Vercel Analytics + GA4

## Features

**Public website** — Home (hero, stats, programs, why us, faculty carousel, campus showcase with lightbox, testimonials, news, events timeline, CTA), About, Programs (School / College groups) and program detail pages, Faculty directory with wing/department filters, Admissions (process, eligibility, fee table), multi-step Online Application, Campus Life, News + article pages, Events (list + calendar), Gallery albums, Careers + job application with CV upload, FAQ, Contact (form + map), Privacy Policy, Terms, custom 404.

**AI assistant** — floating chat on every public page. Answers in English, Urdu or Roman Urdu using live data from the database (programs, fees, events, contact details). Rate-limited per visitor.

**Accounts & security**
- Staff accounts are created only by an administrator (no public staff sign-up).
- Student sign-up requires a real email: format check, disposable-domain block, DNS MX check, then a **6-digit email code** before the account can sign in.
- Forgot-password with emailed code (15-minute expiry, 5 attempts, 60-second resend cooldown).
- Passwords hashed with bcrypt (12 rounds); strong-password policy.
- Login rate limiting (5 attempts / 15 min per IP + email), stored in MongoDB so it works on serverless.
- Role-based access in middleware **and** in every server action.
- Wing-based access to admission records: each staff account is set to Both wings, Boys wing only or Girls wing only; girls-wing staff see only girls’ applications, documents and photos (list, detail, CSV export, counts and status changes).
- Strict per-field validation on client and server: names accept letters only, Pakistani mobile numbers only, 13-digit CNIC/B-Form, marks cannot exceed totals, uploads checked by file signature (JPG/PNG/WEBP/PDF, max 5 MB).
- Rich text sanitized with DOMPurify; CSV export protected against formula injection; security headers set in `next.config.ts`.

**Admissions workflow** — Student applies → gets application number by email → staff review in College dashboard (filter by status / wing / search, view documents, print or save as PDF, export CSV) → status change emails the applicant → applicant sees a progress tracker in the portal.

---

## Project structure

```
app/
  (public)/            Public website (shared Navbar + Footer + AI assistant in layout.tsx)
  (auth)/              Login, student sign-up/verify, forgot password (split-screen layout)
  (dashboard)/
    admin/             Admin dashboard
    college/           College dashboard
    portal/            Student portal
  api/                 auth, upload, chat (AI), applications (CSV), contact, news, events
  sitemap.ts · robots.ts · opengraph-image.tsx
actions/               Server actions: auth, application, contact, content, career, admin
components/
  layout/              Navbar, MobileMenu, Footer, TopBar, DashboardShell
  home/                Homepage sections
  academics/           Program & faculty cards, curriculum, faculty directory
  forms/               Field primitives, uploads, auth/contact/application/job forms
  admin/               Dashboard UI kit, editors, charts, inbox, user manager, settings
  animations/          FadeIn, SlideUp, StaggerChildren, Parallax, TextReveal, CountUp, MagneticButton…
  common/              Logo, PageHero, SEO/JSON-LD, Lightbox, gallery/events browsers, chat assistant
  ui/                  shadcn/ui primitives
lib/
  db/                  Connection + Mongoose models
  data/                Read queries (public pages + dashboards) and serializers
  auth/                NextAuth options, route rules, guards, email codes
  validators/          Zod schemas (shared by forms and server)
  email/               Brevo sender, MX check, HTML templates
  content/             Starter content (seed + local preview)
  ai/                  Assistant system prompt builder
scripts/seed.ts        Database seed
```

---

## Local setup

**Requirements:** Node.js 20+ and a MongoDB Atlas cluster (free tier is fine).

```bash
npm install
cp .env.example .env.local     # then fill in the values
npm run seed                   # creates the owner account + starter content
npm run dev                    # http://localhost:3000
```

Without `MONGODB_URI` the public site still runs and shows the starter content as a preview; sign-in, forms and dashboards need the database.

In development, if Brevo is not configured, verification and reset codes are printed in the terminal instead of emailed.

### Environment variables

See `.env.example` for the full list with comments. Required for production: `MONGODB_URI`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`, `CLOUDINARY_*`, `BREVO_API_KEY`, `EMAIL_FROM_ADDRESS`, `ANTHROPIC_API_KEY`.

### Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm run seed` | Create owner + starter content (only if empty) |
| `npm run seed -- --reset` | Replace starter content (users and applications are kept) |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |

---

## Deployment (Vercel)

1. Push the project to GitHub and import it in Vercel.
2. Add every variable from `.env.example` in **Project → Settings → Environment Variables** (`NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` = your domain).
3. In MongoDB Atlas → Network Access, allow `0.0.0.0/0` (Vercel uses dynamic IPs).
4. In Brevo, verify the sender email/domain used in `EMAIL_FROM_ADDRESS`.
5. Deploy, then run `npm run seed` once from your machine with the production `MONGODB_URI`.
6. Connect the custom domain in Vercel and update the two URL variables.
7. Sign in at `/login` with the owner account, change the password, and review **Admin → Site settings**.

---

## Handover checklist for the college office

The starter content is realistic but must be confirmed by the college before launch:

- [ ] Fees for every program (College → Programs)
- [ ] Faculty names, designations and qualifications (College → Faculty) — sample names are placeholders
- [ ] Founding year and homepage statistics (`lib/constants.ts` → `SITE.established`, `STATS`)
- [ ] Admission dates on the Admissions page (`app/(public)/admissions/page.tsx`)
- [ ] Exact street address and Google Maps embed link (Admin → Site settings)
- [ ] Social media links (Admin → Site settings)
- [ ] Testimonials on the homepage (`components/home/TestimonialsSection.tsx`)
- [ ] Photos: only publish photos of female students with family consent

## Client user guide

A step-by-step guide for the principal and office staff (dashboards, admissions, content, settings, privacy rules) is shared separately as a document: https://claude.ai/code/artifact/0b06230e-8817-4f34-af76-e0502d45a10a

## Support

Questions about this website: contact the developer or the college office at the email in Site Settings.
