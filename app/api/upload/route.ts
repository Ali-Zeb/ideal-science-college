import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/guards";
import { UploadError, uploadFile } from "@/lib/cloudinary";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { isDbConfigured } from "@/lib/db/connect";

export const runtime = "nodejs";

/**
 * POST /api/upload — multipart `file` + `purpose`.
 * - `content`     → signed-in staff only (news, events, gallery, faculty images)
 * - `application` → signed-in students only (admission documents)
 * - `career`      → public (CV uploads), strictly rate-limited per IP
 */
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const purpose = String(form.get("purpose") ?? "");
    if (!(file instanceof File)) return NextResponse.json({ error: "No file received." }, { status: 400 });

    const session = await getSession();
    let folder: string;
    if (purpose === "content") {
      if (session?.user.kind !== "staff") return NextResponse.json({ error: "Not allowed." }, { status: 403 });
      folder = "isc/content";
    } else if (purpose === "application") {
      if (session?.user.kind !== "student") return NextResponse.json({ error: "Please sign in to upload documents." }, { status: 401 });
      folder = `isc/applications/${session.user.id}`;
    } else if (purpose === "career") {
      folder = "isc/careers";
    } else {
      return NextResponse.json({ error: "Invalid upload type." }, { status: 400 });
    }

    if (isDbConfigured() && session?.user.kind !== "staff") {
      const ip = await getClientIp();
      const limit = await rateLimit(`upload:${purpose}:${ip}`, purpose === "career" ? 6 : 20, 60 * 60);
      if (!limit.allowed) return NextResponse.json({ error: "Too many uploads. Please try again later." }, { status: 429 });
    }

    const result = await uploadFile(file, folder);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof UploadError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("[upload]", error);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
