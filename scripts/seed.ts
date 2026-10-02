/**
 * Seeds a fresh database with the owner account and starter content.
 *
 *   npm run seed            → creates owner + content only if the database is empty
 *   npm run seed -- --reset → deletes existing content (not users/applications) and re-seeds
 *
 * Owner credentials come from SEED_OWNER_EMAIL / SEED_OWNER_PASSWORD. If no password
 * is given, a strong one is generated and printed once — store it safely.
 */
import { config } from "dotenv";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

config({ path: ".env.local" });
config();

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set (add it to .env.local).");

  const { User, Program, Faculty, News, Event, Gallery, Job, Settings } = await import("../lib/db/models");
  const { SEED_EVENTS, SEED_FACULTY, SEED_GALLERY, SEED_JOBS, SEED_NEWS, SEED_PROGRAMS, daysFrom } = await import("../lib/content/seed-data");
  const { CONTACT_DEFAULTS, SITE } = await import("../lib/constants");

  await mongoose.connect(uri);
  console.log("✓ Connected to MongoDB");
  const reset = process.argv.includes("--reset");

  // Owner account -------------------------------------------------------
  const ownerEmail = (process.env.SEED_OWNER_EMAIL ?? "admin@idealsciencecollege.com").toLowerCase();
  if (!(await User.exists({ role: "owner" }))) {
    const password = process.env.SEED_OWNER_PASSWORD || `Isc-${randomBytes(9).toString("base64url")}!7`;
    await User.create({ name: "College Owner", email: ownerEmail, role: "owner", password: await bcrypt.hash(password, 12), isActive: true });
    console.log(`✓ Owner account created: ${ownerEmail}`);
    if (!process.env.SEED_OWNER_PASSWORD) console.log(`  Generated password (shown once): ${password}`);
  } else {
    console.log("• Owner account already exists — skipped");
  }

  // Settings ------------------------------------------------------------
  await Settings.updateOne(
    { key: "site" },
    {
      $setOnInsert: {
        key: "site",
        siteName: SITE.name,
        tagline: SITE.tagline,
        contact: {
          phone: CONTACT_DEFAULTS.phone,
          email: CONTACT_DEFAULTS.email,
          address: CONTACT_DEFAULTS.address,
          officeHours: CONTACT_DEFAULTS.officeHours,
          mapEmbedUrl: CONTACT_DEFAULTS.mapEmbedUrl,
        },
        admissionsOpen: true,
        announcement: "Admissions open for Session 2026–27 — Class 1 to FSc. Apply online today.",
      },
    },
    { upsert: true },
  );
  console.log("✓ Site settings ready");

  // Content -------------------------------------------------------------
  if (reset) {
    await Promise.all([Program.deleteMany({}), Faculty.deleteMany({}), News.deleteMany({}), Event.deleteMany({}), Gallery.deleteMany({}), Job.deleteMany({})]);
    console.log("• Existing content removed (--reset)");
  }

  if (await Program.exists({})) {
    console.log("• Content already present — skipped (use --reset to replace)");
  } else {
    const now = new Date();
    const owner = await User.findOne({ role: "owner" }).select("_id").lean();
    const faculty = await Faculty.insertMany(SEED_FACULTY.map((f) => ({ ...f, isActive: true })));
    const byDept = (dept: string) => faculty.filter((f) => f.department === dept).map((f) => f._id);

    await Program.insertMany(
      SEED_PROGRAMS.map((p) => ({
        ...p,
        published: true,
        faculty:
          p.slug === "fsc-pre-medical"
            ? [...byDept("Biology"), ...byDept("Chemistry"), ...byDept("Physics")]
            : p.slug === "fsc-pre-engineering"
              ? [...byDept("Mathematics"), ...byDept("Physics"), ...byDept("Chemistry")]
              : p.slug === "ics-computer-science"
                ? [...byDept("Computer Science"), ...byDept("Mathematics")]
                : p.level === "primary"
                  ? byDept("Primary Section")
                  : p.level === "middle"
                    ? byDept("Middle Section")
                    : [],
      })),
    );
    await News.insertMany(
      SEED_NEWS.map(({ daysAgo, ...n }) => ({ ...n, author: owner?._id, published: true, publishedAt: daysFrom(now, -daysAgo) })),
    );
    await Event.insertMany(
      SEED_EVENTS.map(({ startInDays, durationHours, ...e }) => {
        const startDate = daysFrom(now, startInDays, 10);
        return { ...e, startDate, endDate: new Date(startDate.getTime() + durationHours * 3600_000), published: true };
      }),
    );
    await Gallery.insertMany(
      SEED_GALLERY.map((a) => ({ ...a, coverImage: a.images[0]?.url ?? "", images: a.images.map((img, order) => ({ ...img, order })), published: true })),
    );
    await Job.insertMany(SEED_JOBS.map(({ deadlineInDays, ...j }) => ({ ...j, deadline: daysFrom(now, deadlineInDays, 23), published: true })));
    console.log(
      `✓ Seeded ${SEED_PROGRAMS.length} programs, ${SEED_FACULTY.length} faculty, ${SEED_NEWS.length} news, ${SEED_EVENTS.length} events, ${SEED_GALLERY.length} albums, ${SEED_JOBS.length} jobs`,
    );
  }

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch(async (error) => {
  console.error("✗ Seed failed:", error instanceof Error ? error.message : error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
