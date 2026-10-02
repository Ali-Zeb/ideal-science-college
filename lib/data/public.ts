import "server-only";
import { cache } from "react";
import { Event, Faculty, Gallery, Job, News, Program } from "@/lib/db/models";
import {
  previewEvents,
  previewFaculty,
  previewGallery,
  previewJobs,
  previewNews,
  previewPrograms,
} from "@/lib/content/preview";
import { safeQuery } from "./safe";
import {
  serializeEvent,
  serializeFaculty,
  serializeGallery,
  serializeJob,
  serializeNews,
  serializeProgram,
} from "./serialize";
import type { EventItem, FacultyItem, GalleryAlbum, JobItem, NewsItem, Paginated, ProgramItem } from "@/types";

const isObjectId = (id: string) => /^[a-f\d]{24}$/i.test(id);

/** Published programs ordered for display. */
export const getPrograms = cache(async (): Promise<ProgramItem[]> =>
  safeQuery(
    "programs",
    [],
    async () => {
      const docs = await Program.find({ published: true }).sort({ order: 1, name: 1 }).lean();
      return docs.map(serializeProgram);
    },
    previewPrograms,
  ),
);

/** A single published program by slug, or null. */
export const getProgramBySlug = cache(async (slug: string): Promise<ProgramItem | null> =>
  safeQuery(
    "program",
    null,
    async () => {
      const doc = await Program.findOne({ slug, published: true }).lean();
      return doc ? serializeProgram(doc) : null;
    },
    () => previewPrograms().find((p) => p.slug === slug) ?? null,
  ),
);

/** Active faculty members ordered for display. */
export const getFaculty = cache(async (): Promise<FacultyItem[]> =>
  safeQuery(
    "faculty",
    [],
    async () => {
      const docs = await Faculty.find({ isActive: true }).sort({ order: 1, name: 1 }).lean();
      return docs.map(serializeFaculty);
    },
    previewFaculty,
  ),
);

/** Active faculty members by id list (used on program pages). */
export async function getFacultyByIds(ids: string[]): Promise<FacultyItem[]> {
  const valid = ids.filter(isObjectId);
  if (valid.length === 0) return [];
  return safeQuery("faculty-by-ids", [], async () => {
    const docs = await Faculty.find({ _id: { $in: valid }, isActive: true }).sort({ order: 1 }).lean();
    return docs.map(serializeFaculty);
  });
}

/**
 * Paginated published news, optionally filtered by category.
 * @param page - 1-based page number.
 * @param pageSize - Items per page.
 * @param category - Optional category filter.
 */
export async function getNews(page = 1, pageSize = 9, category?: string): Promise<Paginated<NewsItem>> {
  const empty: Paginated<NewsItem> = { items: [], total: 0, page, pageSize, totalPages: 0 };
  return safeQuery(
    "news",
    empty,
    async () => {
      const filter = { published: true, ...(category ? { category } : {}) };
      const [docs, total] = await Promise.all([
        News.find(filter)
          .sort({ publishedAt: -1 })
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .populate("author", "name")
          .lean(),
        News.countDocuments(filter),
      ]);
      return { items: docs.map(serializeNews), total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
    },
    () => {
      const all = previewNews().filter((n) => !category || n.category === category);
      return {
        items: all.slice((page - 1) * pageSize, page * pageSize),
        total: all.length,
        page,
        pageSize,
        totalPages: Math.ceil(all.length / pageSize),
      };
    },
  );
}

/** Most recent published news items. */
export const getLatestNews = cache(async (limit = 3): Promise<NewsItem[]> =>
  safeQuery(
    "latest-news",
    [],
    async () => {
      const docs = await News.find({ published: true }).sort({ publishedAt: -1 }).limit(limit).populate("author", "name").lean();
      return docs.map(serializeNews);
    },
    () => previewNews().slice(0, limit),
  ),
);

/** A published news item by slug, or null. */
export const getNewsBySlug = cache(async (slug: string): Promise<NewsItem | null> =>
  safeQuery(
    "news-item",
    null,
    async () => {
      const doc = await News.findOne({ slug, published: true }).populate("author", "name").lean();
      return doc ? serializeNews(doc) : null;
    },
    () => previewNews().find((n) => n.slug === slug) ?? null,
  ),
);

/** Related published news in the same category, excluding the current item. */
export async function getRelatedNews(category: string, excludeId: string, limit = 3): Promise<NewsItem[]> {
  return safeQuery(
    "related-news",
    [],
    async () => {
      const docs = await News.find({ published: true, category, _id: { $ne: excludeId } })
        .sort({ publishedAt: -1 })
        .limit(limit)
        .lean();
      return docs.map(serializeNews);
    },
    () => previewNews().filter((n) => n.id !== excludeId).slice(0, limit),
  );
}

/** Increments the view counter for a news item. */
export async function incrementNewsViews(id: string): Promise<void> {
  if (!isObjectId(id)) return;
  await safeQuery("news-views", undefined, async () => {
    await News.updateOne({ _id: id }, { $inc: { views: 1 } });
  });
}

/** Upcoming (not yet ended) published events, soonest first. */
export const getUpcomingEvents = cache(async (limit = 3): Promise<EventItem[]> =>
  safeQuery(
    "upcoming-events",
    [],
    async () => {
      const docs = await Event.find({ published: true, endDate: { $gte: new Date() } })
        .sort({ startDate: 1 })
        .limit(limit)
        .lean();
      return docs.map(serializeEvent);
    },
    () => previewEvents().slice(0, limit),
  ),
);

/** All published events (for calendar + list views). */
export const getAllEvents = cache(async (): Promise<EventItem[]> =>
  safeQuery(
    "events",
    [],
    async () => {
      const docs = await Event.find({ published: true }).sort({ startDate: -1 }).limit(200).lean();
      return docs.map(serializeEvent);
    },
    previewEvents,
  ),
);

/** A published event by slug, or null. */
export const getEventBySlug = cache(async (slug: string): Promise<EventItem | null> =>
  safeQuery(
    "event",
    null,
    async () => {
      const doc = await Event.findOne({ slug, published: true }).lean();
      return doc ? serializeEvent(doc) : null;
    },
    () => previewEvents().find((e) => e.slug === slug) ?? null,
  ),
);

/** Published gallery albums, newest first. */
export const getGalleryAlbums = cache(async (): Promise<GalleryAlbum[]> =>
  safeQuery(
    "gallery",
    [],
    async () => {
      const docs = await Gallery.find({ published: true }).sort({ createdAt: -1 }).lean();
      return docs.map(serializeGallery);
    },
    previewGallery,
  ),
);

/** Open job vacancies (published, deadline not passed). */
export const getOpenJobs = cache(async (): Promise<JobItem[]> =>
  safeQuery(
    "jobs",
    [],
    async () => {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const docs = await Job.find({ published: true, deadline: { $gte: startOfToday } }).sort({ deadline: 1 }).lean();
      return docs.map((d) => serializeJob(d));
    },
    previewJobs,
  ),
);

/** A published job by slug, or null. */
export const getJobBySlug = cache(async (slug: string): Promise<JobItem | null> =>
  safeQuery(
    "job",
    null,
    async () => {
      const doc = await Job.findOne({ slug, published: true }).lean();
      return doc ? serializeJob(doc) : null;
    },
    () => previewJobs().find((j) => j.slug === slug) ?? null,
  ),
);
