import { NextResponse } from "next/server";
import { submitContact } from "@/actions/contact.actions";

/**
 * POST /api/contact — JSON alternative to the contact form's server action,
 * with identical validation, rate limiting and email notifications.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON." }, { status: 400 });
  }
  const result = await submitContact(body);
  return NextResponse.json(result, { status: result.success ? 200 : 422 });
}
