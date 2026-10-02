"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/connect";
import { Event, Faculty, Gallery, News, Program } from "@/lib/db/models";
import { eventSchema, newsSchema } from "@/lib/validators/news.schema";
import { facultySchema, galleryAlbumSchema, programSchema } from "@/lib/validators/content.schema";
import { requireStaff, toErrorMessage } from "@/lib/auth/guards";
import { sanitizeHtml } from "@/lib/sanitize";
import { slugify } from "@/lib/utils/slugify";
import { fromDateTimeLocal } from "@/lib/utils/formatDate";
import { uniqueSlug } from "@/lib/data/slug";
import { fail, ok, validationError } from "@/lib/actions";
import type { ActionResult } from "@/types";

const isId = (id: string) => /^[a-f\d]{24}$/i.test(id);

/** Revalidates the public pages that show a content type, plus its dashboard list. */
function refresh(paths: string[]) {
  revalidatePath("/");
  for (const p of paths) revalidatePath(p, "layout");
  revalidatePath("/sitemap.xml");
}

/* News -------------------------------------------------------------- */

/** Creates (id = null) or updates a news post. Rich text is sanitized server-side. */
export async function saveNews(id: string | null, input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = newsSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const session = await requireStaff();
    await connectDB();
    const data = { ...parsed.data, content: sanitizeHtml(parsed.data.content) };

    if (id) {
      if (!isId(id)) return fail("Invalid post.");
      const existing = await News.findById(id).select("published publishedAt");
      if (!existing) return fail("Post not found.");
      const publishedAt = data.published ? existing.publishedAt ?? new Date() : existing.publishedAt;
      await News.updateOne({ _id: id }, { $set: { ...data, publishedAt } });
      refresh(["/news", "/college/news"]);
      return ok({ id }, "News post updated.");
    }

    const slug = await uniqueSlug(News, slugify(data.title));
    const doc = await News.create({ ...data, slug, author: session.user.id, publishedAt: data.published ? new Date() : undefined });
    refresh(["/news", "/college/news"]);
    return ok({ id: String(doc._id) }, data.published ? "News post published." : "Draft saved.");
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}

/** Publishes or unpublishes a news post. */
export async function setNewsPublished(id: string, published: boolean): Promise<ActionResult<null>> {
  if (!isId(id)) return fail("Invalid post.");
  try {
    await requireStaff();
    await connectDB();
    const doc = await News.findById(id).select("publishedAt");
    if (!doc) return fail("Post not found.");
    await News.updateOne({ _id: id }, { $set: { published, publishedAt: published ? doc.publishedAt ?? new Date() : doc.publishedAt } });
    refresh(["/news", "/college/news"]);
    return ok(null, published ? "Published." : "Moved to drafts.");
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}

export async function deleteNews(id: string): Promise<ActionResult<null>> {
  if (!isId(id)) return fail("Invalid post.");
  try {
    await requireStaff();
    await connectDB();
    await News.deleteOne({ _id: id });
    refresh(["/news", "/college/news"]);
    return ok(null, "News post deleted.");
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}

/* Events ------------------------------------------------------------ */

export async function saveEvent(id: string | null, input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireStaff();
    await connectDB();
    const data = { ...parsed.data, startDate: fromDateTimeLocal(parsed.data.startDate), endDate: fromDateTimeLocal(parsed.data.endDate) };
    if (id) {
      if (!isId(id)) return fail("Invalid event.");
      const res = await Event.updateOne({ _id: id }, { $set: data });
      if (!res.matchedCount) return fail("Event not found.");
      refresh(["/events", "/college/events"]);
      return ok({ id }, "Event updated.");
    }
    const slug = await uniqueSlug(Event, slugify(data.title));
    const doc = await Event.create({ ...data, slug });
    refresh(["/events", "/college/events"]);
    return ok({ id: String(doc._id) }, "Event created.");
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}

export async function deleteEvent(id: string): Promise<ActionResult<null>> {
  if (!isId(id)) return fail("Invalid event.");
  try {
    await requireStaff();
    await connectDB();
    await Event.deleteOne({ _id: id });
    refresh(["/events", "/college/events"]);
    return ok(null, "Event deleted.");
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}

/* Programs ---------------------------------------------------------- */

export async function saveProgram(id: string | null, input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = programSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireStaff();
    await connectDB();
    const data = parsed.data;
    if (id) {
      if (!isId(id)) return fail("Invalid program.");
      const res = await Program.updateOne({ _id: id }, { $set: data });
      if (!res.matchedCount) return fail("Program not found.");
      refresh(["/academics", "/admissions", "/college/programs"]);
      return ok({ id }, "Program updated.");
    }
    const slug = await uniqueSlug(Program, slugify(data.name));
    const doc = await Program.create({ ...data, slug });
    refresh(["/academics", "/admissions", "/college/programs"]);
    return ok({ id: String(doc._id) }, "Program created.");
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}

export async function deleteProgram(id: string): Promise<ActionResult<null>> {
  if (!isId(id)) return fail("Invalid program.");
  try {
    await requireStaff();
    await connectDB();
    await Program.deleteOne({ _id: id });
    refresh(["/academics", "/admissions", "/college/programs"]);
    return ok(null, "Program deleted.");
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}

/* Faculty ----------------------------------------------------------- */

export async function saveFaculty(id: string | null, input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = facultySchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireStaff();
    await connectDB();
    if (id) {
      if (!isId(id)) return fail("Invalid faculty member.");
      const res = await Faculty.updateOne({ _id: id }, { $set: parsed.data });
      if (!res.matchedCount) return fail("Faculty member not found.");
      refresh(["/academics", "/college/faculty"]);
      return ok({ id }, "Faculty profile updated.");
    }
    const doc = await Faculty.create(parsed.data);
    refresh(["/academics", "/college/faculty"]);
    return ok({ id: String(doc._id) }, "Faculty member added.");
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}

export async function deleteFaculty(id: string): Promise<ActionResult<null>> {
  if (!isId(id)) return fail("Invalid faculty member.");
  try {
    await requireStaff();
    await connectDB();
    await Promise.all([Faculty.deleteOne({ _id: id }), Program.updateMany({}, { $pull: { faculty: id } })]);
    refresh(["/academics", "/college/faculty"]);
    return ok(null, "Faculty member removed.");
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}

/* Gallery ----------------------------------------------------------- */

export async function saveGalleryAlbum(id: string | null, input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = galleryAlbumSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireStaff();
    await connectDB();
    const images = parsed.data.images.map((img, order) => ({ ...img, order }));
    const data = { ...parsed.data, images, coverImage: parsed.data.coverImage || images[0]?.url || "" };
    if (id) {
      if (!isId(id)) return fail("Invalid album.");
      const res = await Gallery.updateOne({ _id: id }, { $set: data });
      if (!res.matchedCount) return fail("Album not found.");
      refresh(["/gallery", "/college/gallery"]);
      return ok({ id }, "Album saved.");
    }
    const slug = await uniqueSlug(Gallery, slugify(data.albumName));
    const doc = await Gallery.create({ ...data, slug });
    refresh(["/gallery", "/college/gallery"]);
    return ok({ id: String(doc._id) }, "Album created.");
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}

export async function deleteGalleryAlbum(id: string): Promise<ActionResult<null>> {
  if (!isId(id)) return fail("Invalid album.");
  try {
    await requireStaff();
    await connectDB();
    await Gallery.deleteOne({ _id: id });
    refresh(["/gallery", "/college/gallery"]);
    return ok(null, "Album deleted.");
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}
