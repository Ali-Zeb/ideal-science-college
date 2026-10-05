/**
 * Static site defaults. Values that the client edits from the admin panel
 * (contact details, social links, SEO) live in the `Settings` collection and
 * fall back to these defaults when the database has no settings document yet.
 */
export const SITE = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "Ideal Science College",
  shortName: "Ideal College",
  tagline: "School & College · Class 1 to 12 · Serai Naurang",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description:
    "Ideal Science College, Serai Naurang (District Lakki Marwat) is a school and college system from Class 1 to 12 — Primary, Middle, Matric Science, FSc Pre-Medical, FSc Pre-Engineering, ICS and MDCAT/ECAT preparation — with separate classes for boys and girls and professional teachers.",
  keywords: [
    "Ideal Science College",
    "Ideal Science School Serai Naurang",
    "school in Serai Naurang",
    "girls college Lakki Marwat",
    "Matric science school Lakki Marwat",
    "Serai Naurang college",
    "Lakki Marwat college",
    "FSc Pre-Medical",
    "FSc Pre-Engineering",
    "ICS college",
    "MDCAT preparation",
    "ECAT preparation",
    "Chokara Science Group of Colleges",
    "science college Khyber Pakhtunkhwa",
  ],
  affiliation: "A branch of Chokara Science Group of Colleges, Chokara Karak",
  board: "BISE Bannu",
  established: 2012,
  logo: "/images/logo.jpg",
  ogImage: "/opengraph-image",
} as const;

export const CONTACT_DEFAULTS = {
  phone: "+92 308 5744005",
  email: "alizeb40404@gmail.com",
  address: "Serai Naurang, District Lakki Marwat, Khyber Pakhtunkhwa, Pakistan",
  city: "Serai Naurang",
  region: "Khyber Pakhtunkhwa",
  officeHours: "Monday – Saturday, 8:00 AM – 2:00 PM",
  mapEmbedUrl:
    "https://www.google.com/maps?q=Serai+Naurang,+Lakki+Marwat,+Khyber+Pakhtunkhwa&output=embed",
} as const;

export const SOCIAL_DEFAULTS = {
  facebook: "",
  instagram: "",
  youtube: "",
  twitter: "",
  linkedin: "",
} as const;

export interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string; description: string }[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  {
    label: "Academics",
    href: "/academics",
    children: [
      { label: "Programs", href: "/academics", description: "School (Class 1–10), College (11–12) & entry tests" },
      { label: "Faculty", href: "/academics/faculty", description: "Professional teachers for boys and girls wings" },
    ],
  },
  {
    label: "Admissions",
    href: "/admissions",
    children: [
      { label: "Admission Process", href: "/admissions", description: "Steps, eligibility, fees and dates" },
      { label: "Apply Online", href: "/admissions/apply", description: "Submit your application in minutes" },
    ],
  },
  { label: "Campus Life", href: "/campus-life" },
  { label: "News", href: "/news" },
  { label: "Events", href: "/events" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

export const STATS = [
  { label: "Students Enrolled", value: 850, suffix: "+" },
  { label: "Qualified Faculty", value: 35, suffix: "+" },
  { label: "Classes (1 to 12)", value: 12, suffix: "" },
  { label: "Board Pass Rate", value: 96, suffix: "%" },
] as const;

export const DEPARTMENTS = [
  "Biology",
  "Chemistry",
  "Physics",
  "Mathematics",
  "Computer Science",
  "English",
  "Urdu & Islamiyat",
  "Primary Section",
  "Middle Section",
] as const;

/** Separate wings: classes for boys and girls are held separately (girls observe purdah). */
export const WINGS = ["boys", "girls", "both"] as const;
export const WING_LABELS: Record<(typeof WINGS)[number], string> = {
  boys: "Boys Wing",
  girls: "Girls Wing",
  both: "Boys & Girls Wings",
};

export const NEWS_CATEGORIES = ["Announcements", "Achievements", "Admissions", "Results", "Campus", "Events"] as const;
export const EVENT_CATEGORIES = ["Academic", "Ceremony", "Sports", "Trip", "Seminar", "Examination"] as const;
export const GALLERY_CATEGORIES = ["Campus", "Ceremonies", "Trips", "Examinations", "Sports", "Labs"] as const;

export const PROGRAM_LEVELS = ["primary", "middle", "secondary", "intermediate", "preparatory"] as const;

/** Groups program levels into the School and College sections of the site. */
export const LEVEL_GROUPS = {
  school: ["primary", "middle", "secondary"],
  college: ["intermediate"],
  preparation: ["preparatory"],
} as const;

/** Levels that require SSC (Matric) results when applying. */
export const LEVELS_REQUIRING_SSC = ["intermediate", "preparatory"] as const;

export const APPLICATION_STATUSES = ["pending", "under_review", "approved", "rejected", "enrolled"] as const;

export const APPLICATION_STATUS_LABELS: Record<(typeof APPLICATION_STATUSES)[number], string> = {
  pending: "Pending",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
  enrolled: "Enrolled",
};

export const USER_ROLES = ["owner", "admin", "staff"] as const;

/** Application-access scope for a staff account. */
export const STAFF_WINGS = ["all", "boys", "girls"] as const;
export const STAFF_WING_LABELS: Record<(typeof STAFF_WINGS)[number], string> = {
  all: "Both wings",
  boys: "Boys wing only",
  girls: "Girls wing only",
};

export const USER_ROLE_LABELS: Record<(typeof USER_ROLES)[number], string> = {
  owner: "Owner",
  admin: "Administrator",
  staff: "College Staff",
};

export const ITEMS_PER_PAGE = 9;
export const ADMIN_PAGE_SIZE = 15;


export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const ALLOWED_UPLOAD_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const;
