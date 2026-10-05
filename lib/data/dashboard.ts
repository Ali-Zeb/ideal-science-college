import "server-only";
import { Types } from "mongoose";
import {
  Application,
  Contact,
  Event,
  Faculty,
  Gallery,
  Job,
  JobApplication,
  News,
  Program,
  Student,
  User,
} from "@/lib/db/models";
import { ADMIN_PAGE_SIZE, APPLICATION_STATUSES } from "@/lib/constants";
import { dbQuery } from "./safe";
import {
  serializeApplication,
  serializeContact,
  serializeEvent,
  serializeFaculty,
  serializeGallery,
  serializeJob,
  serializeJobApplication,
  serializeNews,
  serializeProgram,
  serializeStudent,
  serializeUser,
} from "./serialize";
import type {
  AdminUser,
  ApplicationItem,
  ContactMessage,
  EventItem,
  FacultyItem,
  GalleryAlbum,
  JobApplicationItem,
  JobItem,
  NewsItem,
  Paginated,
  ProgramItem,
  StudentAccount,
} from "@/types";

/** Wing filter from applicationScope(); empty for staff who see both wings. */
type AppScope = { wing?: "boys" | "girls" };

const isId = (id: string) => Types.ObjectId.isValid(id) && /^[a-f\d]{24}$/i.test(id);
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const pageOf = (page?: string) => Math.max(1, Number.parseInt(page ?? "1", 10) || 1);

function paginate<T>(items: T[], total: number, page: number): Paginated<T> {
  return { items, total, page, pageSize: ADMIN_PAGE_SIZE, totalPages: Math.ceil(total / ADMIN_PAGE_SIZE) };
}

/* Overviews ---------------------------------------------------------- */

export interface CollegeOverview {
  applications: { total: number; byStatus: Record<string, number>; boys: number; girls: number; thisWeek: number };
  weekly: { week: string; applications: number }[];
  unreadMessages: number;
  newsCount: number;
  upcomingEvents: number;
  newJobApplicants: number;
  recentApplications: ApplicationItem[];
  recentMessages: ContactMessage[];
}

/** Numbers and recent activity for the College dashboard home. */
export function getCollegeOverview(scope: AppScope = {}): Promise<CollegeOverview> {
  return dbQuery(async () => {
    const weekAgo = new Date(Date.now() - 7 * 864e5);
    const eightWeeksAgo = new Date(Date.now() - 56 * 864e5);

    const [statusAgg, wingAgg, thisWeek, weeklyAgg, unreadMessages, newsCount, upcomingEvents, newJobApplicants, recentApps, recentMsgs] =
      await Promise.all([
        Application.aggregate<{ _id: string; count: number }>([{ $match: scope }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
        Application.aggregate<{ _id: string; count: number }>([{ $match: scope }, { $group: { _id: "$wing", count: { $sum: 1 } } }]),
        Application.countDocuments({ ...scope, createdAt: { $gte: weekAgo } }),
        Application.aggregate<{ _id: { y: number; w: number }; count: number }>([
          { $match: { ...scope, createdAt: { $gte: eightWeeksAgo } } },
          { $group: { _id: { y: { $isoWeekYear: "$createdAt" }, w: { $isoWeek: "$createdAt" } }, count: { $sum: 1 } } },
        ]),
        Contact.countDocuments({ isRead: false }),
        News.countDocuments({}),
        Event.countDocuments({ published: true, endDate: { $gte: new Date() } }),
        JobApplication.countDocuments({ status: "new" }),
        Application.find(scope).sort({ createdAt: -1 }).limit(6).populate("program", "name slug").lean(),
        Contact.find().sort({ createdAt: -1 }).limit(5).lean(),
      ]);

    const byStatus = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s, 0])) as Record<string, number>;
    for (const s of statusAgg) byStatus[s._id] = s.count;
    const wing = Object.fromEntries(wingAgg.map((w) => [w._id, w.count]));

    // Build the last 8 ISO weeks, oldest first, filling gaps with zero.
    const weekly: { week: string; applications: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date(Date.now() - i * 7 * 864e5);
      const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      const dayNum = target.getUTCDay() || 7;
      target.setUTCDate(target.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
      const w = Math.ceil(((target.getTime() - yearStart.getTime()) / 864e5 + 1) / 7);
      const found = weeklyAgg.find((a) => a._id.y === target.getUTCFullYear() && a._id.w === w);
      weekly.push({ week: d.toLocaleDateString("en-PK", { day: "numeric", month: "short" }), applications: found?.count ?? 0 });
    }

    return {
      applications: {
        total: statusAgg.reduce((n, s) => n + s.count, 0),
        byStatus,
        boys: wing.boys ?? 0,
        girls: wing.girls ?? 0,
        thisWeek,
      },
      weekly,
      unreadMessages,
      newsCount,
      upcomingEvents,
      newJobApplicants,
      recentApplications: recentApps.map(serializeApplication),
      recentMessages: recentMsgs.map(serializeContact),
    };
  });
}

export interface AdminOverview {
  staff: { total: number; active: number; byRole: Record<string, number> };
  students: { total: number; verified: number; newThisMonth: number };
  applications: number;
  content: { programs: number; faculty: number; news: number; events: number; albums: number; jobs: number };
  recentStaffLogins: AdminUser[];
  recentStudents: StudentAccount[];
}

/** System-level numbers for the Admin dashboard home. */
export function getAdminOverview(): Promise<AdminOverview> {
  return dbQuery(async () => {
    const monthAgo = new Date(Date.now() - 30 * 864e5);
    const [roleAgg, activeStaff, studentTotal, verified, newStudents, applications, programs, faculty, news, events, albums, jobs, logins, recentStudents] =
      await Promise.all([
        User.aggregate<{ _id: string; count: number }>([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
        User.countDocuments({ isActive: true }),
        Student.countDocuments({}),
        Student.countDocuments({ emailVerified: { $ne: null } }),
        Student.countDocuments({ createdAt: { $gte: monthAgo } }),
        Application.countDocuments({}),
        Program.countDocuments({}),
        Faculty.countDocuments({}),
        News.countDocuments({}),
        Event.countDocuments({}),
        Gallery.countDocuments({}),
        Job.countDocuments({}),
        User.find({ lastLogin: { $ne: null } }).sort({ lastLogin: -1 }).limit(5).lean(),
        Student.find().sort({ createdAt: -1 }).limit(5).lean(),
      ]);
    const byRole = Object.fromEntries(roleAgg.map((r) => [r._id, r.count]));
    return {
      staff: { total: roleAgg.reduce((n, r) => n + r.count, 0), active: activeStaff, byRole },
      students: { total: studentTotal, verified, newThisMonth: newStudents },
      applications,
      content: { programs, faculty, news, events, albums, jobs },
      recentStaffLogins: logins.map(serializeUser),
      recentStudents: recentStudents.map((s) => serializeStudent(s)),
    };
  });
}

/* Applications ------------------------------------------------------- */

export interface ApplicationFilters {
  q?: string;
  status?: string;
  wing?: string;
  program?: string;
  page?: string;
}

function applicationFilter(f: ApplicationFilters, scope: AppScope) {
  const filter: Record<string, unknown> = {};
  if (f.status && (APPLICATION_STATUSES as readonly string[]).includes(f.status)) filter.status = f.status;
  if (f.wing === "boys" || f.wing === "girls") filter.wing = f.wing;
  // The staff member's own wing always wins over the URL filter.
  if (scope.wing) filter.wing = filter.wing && filter.wing !== scope.wing ? "__none__" : scope.wing;
  if (f.program && isId(f.program)) filter.program = f.program;
  if (f.q?.trim()) {
    const rx = new RegExp(escapeRegex(f.q.trim()), "i");
    filter.$or = [{ applicationNumber: rx }, { "student.fullName": rx }, { "student.fatherName": rx }, { "student.cnic": rx }, { "student.phone": rx }, { "student.email": rx }];
  }
  return filter;
}

/** Paginated, filterable admission applications. */
export function listApplications(
  f: ApplicationFilters,
  scope: AppScope = {},
): Promise<Paginated<ApplicationItem> & { counts: Record<string, number> }> {
  return dbQuery(async () => {
    const page = pageOf(f.page);
    const filter = applicationFilter(f, scope);
    const [docs, total, statusAgg] = await Promise.all([
      Application.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * ADMIN_PAGE_SIZE)
        .limit(ADMIN_PAGE_SIZE)
        .populate("program", "name slug")
        .lean(),
      Application.countDocuments(filter),
      Application.aggregate<{ _id: string; count: number }>([{ $match: scope }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
    ]);
    return { ...paginate(docs.map(serializeApplication), total, page), counts: Object.fromEntries(statusAgg.map((s) => [s._id, s.count])) };
  });
}

/** All applications matching filters (for CSV export, capped at 5000). */
export function exportApplications(f: ApplicationFilters, scope: AppScope = {}): Promise<ApplicationItem[]> {
  return dbQuery(async () => {
    const docs = await Application.find(applicationFilter(f, scope)).sort({ createdAt: -1 }).limit(5000).populate("program", "name slug").lean();
    return docs.map(serializeApplication);
  });
}

/** One application by id (staff view), only if it is within the staff member's wing. */
export function getApplication(id: string, scope: AppScope = {}): Promise<ApplicationItem | null> {
  if (!isId(id)) return Promise.resolve(null);
  return dbQuery(async () => {
    const doc = await Application.findOne({ _id: id, ...scope }).populate("program", "name slug").lean();
    return doc ? serializeApplication(doc) : null;
  });
}

/** Applications submitted by a student-portal account. */
export function getApplicationsForAccount(accountId: string): Promise<ApplicationItem[]> {
  if (!isId(accountId)) return Promise.resolve([]);
  return dbQuery(async () => {
    const docs = await Application.find({ account: accountId }).sort({ createdAt: -1 }).populate("program", "name slug").lean();
    return docs.map(serializeApplication);
  });
}

/* Messages ----------------------------------------------------------- */

/** Paginated contact messages; `filter` is "unread" | "read" | "". */
export function listMessages(filter: string | undefined, q: string | undefined, page?: string): Promise<Paginated<ContactMessage> & { unread: number }> {
  return dbQuery(async () => {
    const p = pageOf(page);
    const where: Record<string, unknown> = {};
    if (filter === "unread") where.isRead = false;
    if (filter === "read") where.isRead = true;
    if (q?.trim()) {
      const rx = new RegExp(escapeRegex(q.trim()), "i");
      where.$or = [{ name: rx }, { email: rx }, { subject: rx }, { message: rx }];
    }
    const [docs, total, unread] = await Promise.all([
      Contact.find(where).sort({ createdAt: -1 }).skip((p - 1) * ADMIN_PAGE_SIZE).limit(ADMIN_PAGE_SIZE).lean(),
      Contact.countDocuments(where),
      Contact.countDocuments({ isRead: false }),
    ]);
    return { ...paginate(docs.map(serializeContact), total, p), unread };
  });
}

/** Badge counts for the College sidebar. */
export function getCollegeBadges(scope: AppScope = {}): Promise<{ messages: number; applications: number }> {
  return dbQuery(async () => {
    const [messages, applications] = await Promise.all([
      Contact.countDocuments({ isRead: false }),
      Application.countDocuments({ ...scope, status: "pending" }),
    ]);
    return { messages, applications };
  });
}

/* Content lists ------------------------------------------------------ */

/** All news (drafts included) for the editor list. */
export function listNewsAdmin(q?: string, page?: string): Promise<Paginated<NewsItem>> {
  return dbQuery(async () => {
    const p = pageOf(page);
    const where = q?.trim() ? { title: new RegExp(escapeRegex(q.trim()), "i") } : {};
    const [docs, total] = await Promise.all([
      News.find(where).sort({ createdAt: -1 }).skip((p - 1) * ADMIN_PAGE_SIZE).limit(ADMIN_PAGE_SIZE).populate("author", "name").lean(),
      News.countDocuments(where),
    ]);
    return paginate(docs.map(serializeNews), total, p);
  });
}

export function getNewsById(id: string): Promise<NewsItem | null> {
  if (!isId(id)) return Promise.resolve(null);
  return dbQuery(async () => {
    const doc = await News.findById(id).populate("author", "name").lean();
    return doc ? serializeNews(doc) : null;
  });
}

export function listEventsAdmin(): Promise<EventItem[]> {
  return dbQuery(async () => (await Event.find().sort({ startDate: -1 }).limit(500).lean()).map(serializeEvent));
}

export function getEventById(id: string): Promise<EventItem | null> {
  if (!isId(id)) return Promise.resolve(null);
  return dbQuery(async () => {
    const doc = await Event.findById(id).lean();
    return doc ? serializeEvent(doc) : null;
  });
}

export function listProgramsAdmin(): Promise<ProgramItem[]> {
  return dbQuery(async () => (await Program.find().sort({ order: 1, name: 1 }).lean()).map(serializeProgram));
}

export function getProgramById(id: string): Promise<ProgramItem | null> {
  if (!isId(id)) return Promise.resolve(null);
  return dbQuery(async () => {
    const doc = await Program.findById(id).lean();
    return doc ? serializeProgram(doc) : null;
  });
}

export function listFacultyAdmin(): Promise<FacultyItem[]> {
  return dbQuery(async () => (await Faculty.find().sort({ order: 1, name: 1 }).lean()).map(serializeFaculty));
}

export function getFacultyById(id: string): Promise<FacultyItem | null> {
  if (!isId(id)) return Promise.resolve(null);
  return dbQuery(async () => {
    const doc = await Faculty.findById(id).lean();
    return doc ? serializeFaculty(doc) : null;
  });
}

export function listGalleryAdmin(): Promise<GalleryAlbum[]> {
  return dbQuery(async () => (await Gallery.find().sort({ createdAt: -1 }).lean()).map(serializeGallery));
}

export function getGalleryById(id: string): Promise<GalleryAlbum | null> {
  if (!isId(id)) return Promise.resolve(null);
  return dbQuery(async () => {
    const doc = await Gallery.findById(id).lean();
    return doc ? serializeGallery(doc) : null;
  });
}

/** Job openings with applicant counts. */
export function listJobsAdmin(): Promise<JobItem[]> {
  return dbQuery(async () => {
    const [docs, counts] = await Promise.all([
      Job.find().sort({ createdAt: -1 }).lean(),
      JobApplication.aggregate<{ _id: Types.ObjectId; count: number }>([{ $group: { _id: "$job", count: { $sum: 1 } } }]),
    ]);
    const map = new Map(counts.map((c) => [String(c._id), c.count]));
    return docs.map((d) => serializeJob(d, map.get(String(d._id)) ?? 0));
  });
}

export function getJobById(id: string): Promise<JobItem | null> {
  if (!isId(id)) return Promise.resolve(null);
  return dbQuery(async () => {
    const doc = await Job.findById(id).lean();
    return doc ? serializeJob(doc) : null;
  });
}

export function listJobApplications(jobId?: string): Promise<JobApplicationItem[]> {
  return dbQuery(async () => {
    const where = jobId && isId(jobId) ? { job: jobId } : {};
    const docs = await JobApplication.find(where).sort({ createdAt: -1 }).limit(300).populate("job", "title").lean();
    return docs.map(serializeJobApplication);
  });
}

/* Accounts ----------------------------------------------------------- */

export function listStaffUsers(): Promise<AdminUser[]> {
  return dbQuery(async () => (await User.find().sort({ role: 1, name: 1 }).lean()).map(serializeUser));
}

/** Student accounts with their application counts. */
export function listStudentAccounts(q?: string, page?: string): Promise<Paginated<StudentAccount & { verified: boolean }>> {
  return dbQuery(async () => {
    const p = pageOf(page);
    const where = q?.trim()
      ? { $or: [{ name: new RegExp(escapeRegex(q.trim()), "i") }, { email: new RegExp(escapeRegex(q.trim()), "i") }, { phone: new RegExp(escapeRegex(q.trim()), "i") }] }
      : {};
    const [docs, total] = await Promise.all([
      Student.find(where).sort({ createdAt: -1 }).skip((p - 1) * ADMIN_PAGE_SIZE).limit(ADMIN_PAGE_SIZE).lean(),
      Student.countDocuments(where),
    ]);
    const counts = await Application.aggregate<{ _id: Types.ObjectId; count: number }>([
      { $match: { account: { $in: docs.map((d) => d._id) } } },
      { $group: { _id: "$account", count: { $sum: 1 } } },
    ]);
    const map = new Map(counts.map((c) => [String(c._id), c.count]));
    return paginate(
      docs.map((d) => ({ ...serializeStudent(d, map.get(String(d._id)) ?? 0), verified: Boolean(d.emailVerified) })),
      total,
      p,
    );
  });
}
