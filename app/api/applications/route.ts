import { NextResponse } from "next/server";
import { applicationScope, requireStaff, AuthError } from "@/lib/auth/guards";
import { exportApplications } from "@/lib/data/dashboard";
import { APPLICATION_STATUS_LABELS } from "@/lib/constants";

export const runtime = "nodejs";

const csvCell = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  // Neutralise spreadsheet formula injection and escape quotes.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

/**
 * GET /api/applications — staff-only CSV export of applications.
 * Accepts the same filters as the dashboard list: `q`, `status`, `wing`, `program`.
 */
export async function GET(req: Request) {
  let scope: { wing?: "boys" | "girls" };
  try {
    scope = applicationScope(await requireStaff());
  } catch (error) {
    const status = error instanceof AuthError ? 403 : 500;
    return NextResponse.json({ error: "Not allowed." }, { status });
  }

  const sp = Object.fromEntries(new URL(req.url).searchParams);
  const rows = await exportApplications(sp, scope);
  const header = [
    "Application No",
    "Submitted",
    "Status",
    "Program",
    "Wing",
    "Student",
    "Father",
    "B-Form/CNIC",
    "Date of Birth",
    "Gender",
    "Mobile",
    "Email",
    "Address",
    "Last Class",
    "Previous School",
    "Board",
    "Passing Year",
    "Grade",
    "Marks",
    "Total",
    "Percentage",
    "Review Note",
  ];
  const lines = rows.map((a) =>
    [
      a.applicationNumber,
      a.createdAt.slice(0, 10),
      APPLICATION_STATUS_LABELS[a.status],
      a.program?.name ?? "",
      a.wing,
      a.student.fullName,
      a.student.fatherName,
      a.student.cnic,
      a.student.dateOfBirth.slice(0, 10),
      a.student.gender,
      a.student.phone,
      a.student.email,
      a.student.address,
      a.academic.lastClass,
      a.academic.previousSchool,
      a.academic.board,
      a.academic.passingYear,
      a.academic.previousGrade,
      a.academic.marksObtained,
      a.academic.totalMarks,
      a.academic.percentage,
      a.reviewNote,
    ]
      .map(csvCell)
      .join(","),
  );
  const csv = `﻿${header.map(csvCell).join(",")}\n${lines.join("\n")}`;
  const filename = `applications-${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
