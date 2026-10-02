import type { z } from "zod";
import type { ActionResult } from "@/types";

/**
 * Converts a failed Zod parse into a standard action error result.
 * @param error - The ZodError from `safeParse`.
 */
export function validationError(error: z.ZodError): ActionResult<never> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return { success: false, error: "Please correct the highlighted fields.", fieldErrors };
}

/** Builds a success result. */
export function ok<T>(data: T, message?: string): ActionResult<T> {
  return { success: true, data, message };
}

/** Builds a failure result. */
export function fail(error: string): ActionResult<never> {
  return { success: false, error };
}
