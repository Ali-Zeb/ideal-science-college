import type { EventItem, FacultyItem, GalleryAlbum, JobItem, NewsItem, ProgramItem } from "@/types";
import { SEED_EVENTS, SEED_FACULTY, SEED_GALLERY, SEED_JOBS, SEED_NEWS, SEED_PROGRAMS, daysFrom } from "./seed-data";

/**
 * Read-only preview data derived from the seed content. Shown on public pages
 * only while `MONGODB_URI` is not configured (local preview), so the site can
 * be reviewed before the database is connected.
 */

const now = () => new Date();
const iso = (d: Date) => d.toISOString();

export function previewPrograms(): ProgramItem[] {
  return SEED_PROGRAMS.map((p, i) => ({
    ...p,
    id: `preview-program-${i}`,
    faculty: [],
    published: true,
    createdAt: iso(now()),
    updatedAt: iso(now()),
  }));
}

export function previewFaculty(): FacultyItem[] {
  return SEED_FACULTY.map((f, i) => ({
    ...f,
    id: `preview-faculty-${i}`,
    photo: "",
    email: "",
    social: { linkedin: "", twitter: "", facebook: "" },
    isActive: true,
  }));
}

export function previewNews(): NewsItem[] {
  return SEED_NEWS.map((n, i) => {
    const date = iso(daysFrom(now(), -n.daysAgo));
    return {
      id: `preview-news-${i}`,
      title: n.title,
      slug: n.slug,
      excerpt: n.excerpt,
      content: n.content,
      featuredImage: n.featuredImage,
      category: n.category,
      tags: n.tags,
      author: { id: "preview", name: "College Office" },
      published: true,
      publishedAt: date,
      views: 0,
      createdAt: date,
      updatedAt: date,
    };
  });
}

export function previewEvents(): EventItem[] {
  return SEED_EVENTS.map((e, i) => {
    const start = daysFrom(now(), e.startInDays, 10);
    return {
      id: `preview-event-${i}`,
      title: e.title,
      slug: e.slug,
      description: e.description,
      featuredImage: e.featuredImage,
      startDate: iso(start),
      endDate: iso(new Date(start.getTime() + e.durationHours * 3600_000)),
      location: e.location,
      category: e.category,
      published: true,
      createdAt: iso(now()),
    };
  });
}

export function previewGallery(): GalleryAlbum[] {
  return SEED_GALLERY.map((a, i) => ({
    id: `preview-album-${i}`,
    albumName: a.albumName,
    slug: a.slug,
    description: a.description,
    category: a.category,
    coverImage: a.images[0]?.url ?? "",
    images: a.images.map((img, j) => ({ id: `${i}-${j}`, url: img.url, caption: img.caption, order: j })),
    published: true,
    createdAt: iso(now()),
  }));
}

export function previewJobs(): JobItem[] {
  return SEED_JOBS.map((j, i) => ({
    id: `preview-job-${i}`,
    title: j.title,
    slug: j.slug,
    department: j.department,
    type: j.type,
    location: j.location,
    description: j.description,
    requirements: j.requirements,
    responsibilities: j.responsibilities,
    salaryRange: j.salaryRange,
    deadline: iso(daysFrom(now(), j.deadlineInDays)),
    published: true,
    applicantCount: 0,
    createdAt: iso(now()),
  }));
}
