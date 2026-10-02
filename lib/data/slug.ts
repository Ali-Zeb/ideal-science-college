import "server-only";

interface SlugModel {
  exists(filter: Record<string, unknown>): PromiseLike<unknown> | Promise<unknown>;
}

/**
 * Returns `base`, or `base-2`, `base-3`… — the first slug not used by another document.
 * @param model - Mongoose model with a `slug` field.
 * @param base - Slugified title.
 * @param excludeId - Current document id when editing.
 */
export async function uniqueSlug(model: SlugModel, base: string, excludeId?: string): Promise<string> {
  const root = base || "item";
  let candidate = root;
  for (let i = 2; i < 500; i++) {
    const filter: Record<string, unknown> = { slug: candidate };
    if (excludeId) filter._id = { $ne: excludeId };
    if (!(await model.exists(filter))) return candidate;
    candidate = `${root}-${i}`;
  }
  return `${root}-${Date.now()}`;
}
