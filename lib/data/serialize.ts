import type { Types } from "mongoose";
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
  ProgramItem,
  StudentAccount,
} from "@/types";
import type { UserDoc } from "@/lib/db/models/User";
import type { StudentDoc } from "@/lib/db/models/Student";
import type { NewsDoc } from "@/lib/db/models/News";
import type { EventDoc } from "@/lib/db/models/Event";
import type { ProgramDoc } from "@/lib/db/models/Program";
import type { FacultyDoc } from "@/lib/db/models/Faculty";
import type { ApplicationDoc } from "@/lib/db/models/Application";
import type { ContactDoc } from "@/lib/db/models/Contact";
import type { GalleryDoc } from "@/lib/db/models/Gallery";
import type { JobApplicationDoc, JobDoc } from "@/lib/db/models/Job";

type WithId<T> = T & { _id: Types.ObjectId; createdAt?: Date; updatedAt?: Date };
type Ref = Types.ObjectId | { _id: Types.ObjectId; [key: string]: unknown } | null | undefined;

const iso = (d: Date | string | null | undefined): string => (d ? new Date(d).toISOString() : "");
const isoOrNull = (d: Date | string | null | undefined): string | null => (d ? new Date(d).toISOString() : null);

function refId(ref: Ref): string {
  if (!ref) return "";
  if ("_id" in ref && ref._id) return String(ref._id);
  return String(ref);
}

function isPopulated(ref: Ref): ref is { _id: Types.ObjectId; [key: string]: unknown } {
  return Boolean(ref && typeof ref === "object" && "_id" in ref && Object.keys(ref).length > 1);
}

/** Serializes a lean staff user document. */
export function serializeUser(doc: WithId<UserDoc>): AdminUser {
  return {
    id: String(doc._id),
    name: doc.name,
    email: doc.email,
    role: doc.role as AdminUser["role"],
    isActive: doc.isActive ?? true,
    lastLogin: isoOrNull(doc.lastLogin),
    createdAt: iso(doc.createdAt),
  };
}

/** Serializes a lean student account document. */
export function serializeStudent(doc: WithId<StudentDoc>, applicationCount = 0): StudentAccount {
  return {
    id: String(doc._id),
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    isActive: doc.isActive ?? true,
    lastLogin: isoOrNull(doc.lastLogin),
    createdAt: iso(doc.createdAt),
    applicationCount,
  };
}

/** Serializes a lean news document (author may be populated). */
export function serializeNews(doc: WithId<NewsDoc>): NewsItem {
  const author = doc.author as unknown as Ref;
  return {
    id: String(doc._id),
    title: doc.title,
    slug: doc.slug,
    excerpt: doc.excerpt,
    content: doc.content,
    featuredImage: doc.featuredImage ?? "",
    category: doc.category,
    tags: doc.tags ?? [],
    author: isPopulated(author) ? { id: String(author._id), name: String(author.name ?? "") } : null,
    published: doc.published ?? false,
    publishedAt: isoOrNull(doc.publishedAt),
    views: doc.views ?? 0,
    createdAt: iso(doc.createdAt),
    updatedAt: iso(doc.updatedAt),
  };
}

/** Serializes a lean event document. */
export function serializeEvent(doc: WithId<EventDoc>): EventItem {
  return {
    id: String(doc._id),
    title: doc.title,
    slug: doc.slug,
    description: doc.description,
    featuredImage: doc.featuredImage ?? "",
    startDate: iso(doc.startDate),
    endDate: iso(doc.endDate),
    location: doc.location,
    category: doc.category,
    published: doc.published ?? false,
    createdAt: iso(doc.createdAt),
  };
}

/** Serializes a lean program document. */
export function serializeProgram(doc: WithId<ProgramDoc>): ProgramItem {
  return {
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    level: doc.level as ProgramItem["level"],
    duration: doc.duration,
    shortDescription: doc.shortDescription,
    description: doc.description,
    curriculum: (doc.curriculum ?? []).map((c) => ({
      semester: c.semester,
      title: c.title ?? "",
      subjects: c.subjects ?? [],
    })),
    fees: {
      admission: doc.fees?.admission ?? 0,
      monthly: doc.fees?.monthly ?? 0,
      total: doc.fees?.total ?? 0,
    },
    requirements: doc.requirements ?? [],
    careers: doc.careers ?? [],
    seats: doc.seats ?? 0,
    wings: (doc.wings ?? "both") as ProgramItem["wings"],
    faculty: (doc.faculty ?? []).map((f) => refId(f as unknown as Ref)),
    image: doc.image ?? "",
    icon: doc.icon ?? "FlaskConical",
    order: doc.order ?? 0,
    published: doc.published ?? true,
    createdAt: iso(doc.createdAt),
    updatedAt: iso(doc.updatedAt),
  };
}

/** Serializes a lean faculty document. */
export function serializeFaculty(doc: WithId<FacultyDoc>): FacultyItem {
  return {
    id: String(doc._id),
    name: doc.name,
    designation: doc.designation,
    department: doc.department,
    wing: (doc.wing ?? "both") as FacultyItem["wing"],
    qualification: doc.qualification,
    experience: doc.experience ?? "",
    bio: doc.bio ?? "",
    photo: doc.photo ?? "",
    email: doc.email ?? "",
    social: {
      linkedin: doc.social?.linkedin ?? "",
      twitter: doc.social?.twitter ?? "",
      facebook: doc.social?.facebook ?? "",
    },
    order: doc.order ?? 0,
    isActive: doc.isActive ?? true,
  };
}

/** Serializes a lean application document (program may be populated). */
export function serializeApplication(doc: WithId<ApplicationDoc>): ApplicationItem {
  const program = doc.program as unknown as Ref;
  // Both sub-documents are required by the schema.
  const student = doc.student as NonNullable<ApplicationDoc["student"]>;
  const academic = doc.academic as NonNullable<ApplicationDoc["academic"]>;
  return {
    id: String(doc._id),
    applicationNumber: doc.applicationNumber,
    student: {
      fullName: student.fullName,
      fatherName: student.fatherName,
      cnic: student.cnic,
      dateOfBirth: iso(student.dateOfBirth),
      gender: student.gender as "male" | "female",
      phone: student.phone,
      email: student.email,
      address: student.address,
    },
    academic: {
      lastClass: academic.lastClass,
      previousSchool: academic.previousSchool ?? "",
      board: academic.board ?? "",
      passingYear: academic.passingYear ?? null,
      previousGrade: academic.previousGrade ?? "",
      marksObtained: academic.marksObtained ?? null,
      totalMarks: academic.totalMarks ?? null,
      percentage: academic.percentage ?? null,
    },
    wing: (doc.wing ?? (student.gender === "female" ? "girls" : "boys")) as "boys" | "girls",
    program: isPopulated(program)
      ? { id: String(program._id), name: String(program.name ?? ""), slug: String(program.slug ?? "") }
      : null,
    accountId: refId(doc.account as unknown as Ref),
    documents: {
      cnic: doc.documents?.cnic ?? "",
      marksheet: doc.documents?.marksheet ?? "",
      photo: doc.documents?.photo ?? "",
    },
    status: doc.status as ApplicationItem["status"],
    reviewNote: doc.reviewNote ?? "",
    reviewedBy: doc.reviewedBy ? refId(doc.reviewedBy as unknown as Ref) : null,
    reviewedAt: isoOrNull(doc.reviewedAt),
    createdAt: iso(doc.createdAt),
  };
}

/** Serializes a lean contact message document. */
export function serializeContact(doc: WithId<ContactDoc>): ContactMessage {
  return {
    id: String(doc._id),
    name: doc.name,
    email: doc.email,
    phone: doc.phone ?? "",
    subject: doc.subject,
    message: doc.message,
    isRead: doc.isRead ?? false,
    repliedAt: isoOrNull(doc.repliedAt),
    replyNote: doc.replyNote ?? "",
    createdAt: iso(doc.createdAt),
  };
}

/** Serializes a lean gallery album document with images sorted by order. */
export function serializeGallery(doc: WithId<GalleryDoc>): GalleryAlbum {
  const images = (doc.images ?? [])
    .map((img) => {
      const i = img as typeof img & { _id?: Types.ObjectId };
      return { id: String(i._id ?? i.url), url: i.url, caption: i.caption ?? "", order: i.order ?? 0 };
    })
    .sort((a, b) => a.order - b.order);
  return {
    id: String(doc._id),
    albumName: doc.albumName,
    slug: doc.slug,
    description: doc.description ?? "",
    coverImage: doc.coverImage || images[0]?.url || "",
    images,
    category: doc.category,
    published: doc.published ?? true,
    createdAt: iso(doc.createdAt),
  };
}

/** Serializes a lean job opening document. */
export function serializeJob(doc: WithId<JobDoc>, applicantCount = 0): JobItem {
  return {
    id: String(doc._id),
    title: doc.title,
    slug: doc.slug,
    department: doc.department,
    type: doc.type as JobItem["type"],
    location: doc.location ?? "",
    description: doc.description,
    requirements: doc.requirements ?? [],
    responsibilities: doc.responsibilities ?? [],
    salaryRange: doc.salaryRange ?? "",
    deadline: iso(doc.deadline),
    published: doc.published ?? true,
    applicantCount,
    createdAt: iso(doc.createdAt),
  };
}

/** Serializes a lean job application document (job may be populated). */
export function serializeJobApplication(doc: WithId<JobApplicationDoc>): JobApplicationItem {
  const job = doc.job as unknown as Ref;
  return {
    id: String(doc._id),
    job: isPopulated(job) ? { id: String(job._id), title: String(job.title ?? "") } : null,
    fullName: doc.fullName,
    email: doc.email,
    phone: doc.phone,
    qualification: doc.qualification,
    experience: doc.experience,
    coverLetter: doc.coverLetter ?? "",
    resume: doc.resume,
    status: doc.status as JobApplicationItem["status"],
    createdAt: iso(doc.createdAt),
  };
}
