import type { APPLICATION_STATUSES, PROGRAM_LEVELS, STAFF_WINGS, USER_ROLES, WINGS } from "@/lib/constants";

export * from "./news";
export * from "./event";
export * from "./api";

export type UserRole = (typeof USER_ROLES)[number];
export type ProgramLevel = (typeof PROGRAM_LEVELS)[number];
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
export type Wing = (typeof WINGS)[number];
export type StaffWing = (typeof STAFF_WINGS)[number];

/** Serialized (client-safe) shapes: ObjectIds become strings, Dates become ISO strings. */

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  wing: StaffWing;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export interface CurriculumTerm {
  semester: number;
  title: string;
  subjects: string[];
}

export interface ProgramItem {
  id: string;
  name: string;
  slug: string;
  level: ProgramLevel;
  duration: string;
  shortDescription: string;
  description: string;
  curriculum: CurriculumTerm[];
  fees: { admission: number; monthly: number; total: number };
  requirements: string[];
  careers: string[];
  seats: number;
  wings: Wing;
  faculty: string[];
  image: string;
  icon: string;
  order: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FacultyItem {
  id: string;
  name: string;
  designation: string;
  department: string;
  wing: Wing;
  qualification: string;
  experience: string;
  bio: string;
  photo: string;
  email: string;
  social: { linkedin: string; twitter: string; facebook: string };
  order: number;
  isActive: boolean;
}

export interface ApplicationItem {
  id: string;
  applicationNumber: string;
  student: {
    fullName: string;
    fatherName: string;
    cnic: string;
    dateOfBirth: string;
    gender: "male" | "female";
    phone: string;
    email: string;
    address: string;
  };
  academic: {
    lastClass: string;
    previousSchool: string;
    board: string;
    passingYear: number | null;
    previousGrade: string;
    marksObtained: number | null;
    totalMarks: number | null;
    percentage: number | null;
  };
  wing: "boys" | "girls";
  program: { id: string; name: string; slug: string } | null;
  accountId: string;
  documents: { cnic: string; marksheet: string; photo: string };
  status: ApplicationStatus;
  reviewNote: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface StudentAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  applicationCount: number;
}

export interface JobItem {
  id: string;
  title: string;
  slug: string;
  department: string;
  type: "full-time" | "part-time" | "visiting";
  location: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  salaryRange: string;
  deadline: string;
  published: boolean;
  applicantCount: number;
  createdAt: string;
}

export interface JobApplicationItem {
  id: string;
  job: { id: string; title: string } | null;
  fullName: string;
  email: string;
  phone: string;
  qualification: string;
  experience: string;
  coverLetter: string;
  resume: string;
  status: "new" | "shortlisted" | "rejected" | "hired";
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  isRead: boolean;
  repliedAt: string | null;
  replyNote: string;
  createdAt: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  order: number;
}

export interface GalleryAlbum {
  id: string;
  albumName: string;
  slug: string;
  description: string;
  coverImage: string;
  images: GalleryImage[];
  category: string;
  published: boolean;
  createdAt: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  logo: string;
  contact: { phone: string; email: string; address: string; officeHours: string; mapEmbedUrl: string };
  social: { facebook: string; instagram: string; youtube: string; twitter: string; linkedin: string };
  seo: { metaTitle: string; metaDescription: string; keywords: string[] };
  admissionsOpen: boolean;
  announcement: string;
}
