/**
 * Starter content for Ideal Science College (School & College, Class 1–12).
 * Used by `scripts/seed.ts` to fill a fresh database, and shown as a preview
 * when no database is configured. The college office should review fees,
 * names and dates and edit them from the College dashboard after launch.
 */

const DAY = 24 * 60 * 60 * 1000;

/** Returns a date `days` from `base` at the given hour (Pakistan time). */
export function daysFrom(base: Date, days: number, hour = 9): Date {
  const d = new Date(base.getTime() + days * DAY);
  d.setUTCHours(hour - 5, 0, 0, 0);
  return d;
}

export const SEED_PROGRAMS = [
  {
    name: "Primary Section (Class 1–5)",
    slug: "primary-section",
    level: "primary" as const,
    duration: "5 Years",
    icon: "Pencil",
    image: "/images/students-1.jpeg",
    order: 1,
    seats: 200,
    wings: "both" as const,
    shortDescription:
      "A caring start for young learners — English, Urdu, Mathematics, Islamiyat and Nazra Quran, with separate classes for boys and girls.",
    description:
      "The Primary Section builds strong basics in a friendly, disciplined environment. Children learn English, Urdu, Mathematics, General Science, Social Studies, Islamiyat and Nazra Quran from trained teachers, with daily homework diaries, monthly tests and regular parent meetings. Girls are taught in the separate girls wing by female teachers.",
    curriculum: [
      { semester: 1, title: "Class 1–2", subjects: ["English", "Urdu", "Mathematics", "Islamiyat", "Nazra Quran", "General Knowledge"] },
      { semester: 2, title: "Class 3–5", subjects: ["English", "Urdu", "Mathematics", "General Science", "Social Studies", "Islamiyat", "Nazra Quran"] },
    ],
    fees: { admission: 2000, monthly: 1500, total: 0 },
    requirements: [
      "B-Form of the child",
      "Father's / guardian's CNIC copy",
      "School leaving certificate (for Class 2 and above)",
      "4 passport-size photographs",
    ],
    careers: ["Smooth progression to the Middle Section"],
  },
  {
    name: "Middle Section (Class 6–8)",
    slug: "middle-section",
    level: "middle" as const,
    duration: "3 Years",
    icon: "BookOpen",
    image: "/images/students-2.jpeg",
    order: 2,
    seats: 150,
    wings: "both" as const,
    shortDescription:
      "Stronger English, Mathematics and Science with Computer Studies — preparing students for the Matric Science group.",
    description:
      "In the Middle Section students move to subject-specialist teachers. The focus is on English, Mathematics and Science, with Computer Studies and regular practical demonstrations. Weekly tests and term examinations prepare students for the demands of Matric.",
    curriculum: [
      {
        semester: 1,
        title: "Class 6–8",
        subjects: ["English", "Urdu", "Mathematics", "General Science", "Computer Studies", "Social Studies", "Islamiyat / Nazra Quran"],
      },
    ],
    fees: { admission: 2500, monthly: 2000, total: 0 },
    requirements: [
      "B-Form of the student",
      "Father's / guardian's CNIC copy",
      "School leaving certificate and last result card",
      "4 passport-size photographs",
    ],
    careers: ["Matric Science (Biology or Computer Science group)"],
  },
  {
    name: "Matric Science (Class 9–10)",
    slug: "matric-science",
    level: "secondary" as const,
    duration: "2 Years",
    icon: "School",
    image: "/images/students-3.jpeg",
    order: 3,
    seats: 160,
    wings: "both" as const,
    shortDescription:
      "SSC Science in the Biology or Computer Science group under BISE Bannu, taught by subject specialists with full practical work.",
    description:
      "Matric Science prepares students for the BISE Bannu SSC examinations in the Biology or Computer Science group. Subject specialists teach Physics, Chemistry, Biology / Computer Science and Mathematics, supported by laboratory practicals, chapter tests and send-up examinations under board conditions.",
    curriculum: [
      { semester: 1, title: "Class 9", subjects: ["Physics", "Chemistry", "Biology / Computer Science", "Mathematics", "English", "Urdu", "Islamiyat"] },
      { semester: 2, title: "Class 10", subjects: ["Physics", "Chemistry", "Biology / Computer Science", "Mathematics", "English", "Urdu", "Pakistan Studies"] },
    ],
    fees: { admission: 3000, monthly: 2500, total: 0 },
    requirements: [
      "Class 8 pass result card",
      "B-Form of the student",
      "Father's / guardian's CNIC copy",
      "School leaving certificate",
      "4 passport-size photographs",
    ],
    careers: ["FSc Pre-Medical", "FSc Pre-Engineering", "ICS (Computer Science)"],
  },
  {
    name: "FSc Pre-Medical",
    slug: "fsc-pre-medical",
    level: "intermediate" as const,
    duration: "2 Years",
    icon: "Stethoscope",
    image: "/images/students-lab.jpeg",
    order: 4,
    seats: 120,
    wings: "both" as const,
    shortDescription:
      "Biology, Chemistry and Physics for students aiming at MBBS, BDS, Pharm-D, DPT, nursing and allied health sciences.",
    description:
      "The FSc Pre-Medical program builds a strong foundation in Biology, Chemistry and Physics through daily lectures, weekly tests and regular practical work in our science laboratories. Teaching follows the BISE Bannu syllabus. Small sections, monthly parent–teacher meetings and a strict attendance policy keep every student on track. Boys and girls study in separate classes.",
    curriculum: [
      { semester: 1, title: "Part I (Class 11)", subjects: ["Biology", "Chemistry", "Physics", "English", "Urdu", "Islamiyat"] },
      { semester: 2, title: "Part II (Class 12)", subjects: ["Biology", "Chemistry", "Physics", "English", "Urdu", "Pakistan Studies"] },
    ],
    fees: { admission: 5000, monthly: 3500, total: 0 },
    requirements: [
      "SSC (Matric) Science with Biology, minimum 60% marks",
      "Copy of CNIC / B-Form and father's CNIC",
      "SSC result card or provisional certificate",
      "4 passport-size photographs",
    ],
    careers: ["MBBS / BDS", "Pharm-D", "Doctor of Physical Therapy", "Nursing", "Medical Lab Technology", "BS Biological Sciences"],
  },
  {
    name: "FSc Pre-Engineering",
    slug: "fsc-pre-engineering",
    level: "intermediate" as const,
    duration: "2 Years",
    icon: "Calculator",
    image: "/images/campus-block.avif",
    order: 5,
    seats: 100,
    wings: "both" as const,
    shortDescription: "Mathematics, Physics and Chemistry for future engineers, architects and physical scientists.",
    description:
      "FSc Pre-Engineering develops problem-solving skills in Mathematics, Physics and Chemistry. Students practise numericals daily, sit fortnightly chapter tests and complete all board practicals in our physics and chemistry labs, preparing them for admission to engineering universities. Boys and girls study in separate classes.",
    curriculum: [
      { semester: 1, title: "Part I (Class 11)", subjects: ["Mathematics", "Physics", "Chemistry", "English", "Urdu", "Islamiyat"] },
      { semester: 2, title: "Part II (Class 12)", subjects: ["Mathematics", "Physics", "Chemistry", "English", "Urdu", "Pakistan Studies"] },
    ],
    fees: { admission: 5000, monthly: 3500, total: 0 },
    requirements: [
      "SSC (Matric) Science with Mathematics, minimum 60% marks",
      "Copy of CNIC / B-Form and father's CNIC",
      "SSC result card or provisional certificate",
      "4 passport-size photographs",
    ],
    careers: ["Civil / Electrical / Mechanical Engineering", "Software Engineering", "Architecture", "BS Physics / Mathematics"],
  },
  {
    name: "ICS (Computer Science)",
    slug: "ics-computer-science",
    level: "intermediate" as const,
    duration: "2 Years",
    icon: "Cpu",
    image: "/images/students-4.jpg",
    order: 6,
    seats: 60,
    wings: "both" as const,
    shortDescription:
      "Computer Science with Mathematics and Physics — the direct route to BS Computer Science, Software Engineering and IT.",
    description:
      "ICS combines Computer Science, Mathematics and Physics. Students learn programming fundamentals, databases and computer applications with hands-on sessions in the computer lab, alongside the full board syllabus. It is the ideal choice for students who want to study BS Computer Science, Software Engineering, Data Science or Information Technology.",
    curriculum: [
      { semester: 1, title: "Part I (Class 11)", subjects: ["Computer Science", "Mathematics", "Physics", "English", "Urdu", "Islamiyat"] },
      { semester: 2, title: "Part II (Class 12)", subjects: ["Computer Science", "Mathematics", "Physics", "English", "Urdu", "Pakistan Studies"] },
    ],
    fees: { admission: 5000, monthly: 3000, total: 0 },
    requirements: [
      "SSC (Matric) Science or Computer Science, minimum 50% marks",
      "Copy of CNIC / B-Form and father's CNIC",
      "SSC result card or provisional certificate",
      "4 passport-size photographs",
    ],
    careers: ["BS Computer Science", "Software Engineering", "Data Science", "Information Technology", "Cyber Security"],
  },
];

export const SEED_FACULTY = [
  { name: "Muhammad Ismail Khan", designation: "Principal", department: "Chemistry", wing: "both" as const, qualification: "M.Phil Chemistry", experience: "18 years", order: 1, bio: "Leads the academic and administrative team of the school and college, with a focus on discipline, regular assessment and close contact with parents." },
  { name: "Nasreen Akhtar", designation: "Head of Girls Wing", department: "Biology", wing: "girls" as const, qualification: "M.Sc Botany", experience: "13 years", order: 2, bio: "Leads the girls wing — a purdah-observing environment run by female staff — and teaches FSc Biology." },
  { name: "Sher Afzal Marwat", designation: "Vice Principal & Senior Lecturer", department: "Physics", wing: "boys" as const, qualification: "M.Sc Physics", experience: "15 years", order: 3, bio: "Teaches FSc Physics and coordinates academic planning for the boys wing." },
  { name: "Naeem Ullah", designation: "Senior Lecturer", department: "Biology", wing: "boys" as const, qualification: "M.Phil Zoology", experience: "12 years", order: 4, bio: "Heads the Biology department and teaches FSc Pre-Medical classes." },
  { name: "Asad Ullah Khan", designation: "Lecturer", department: "Mathematics", wing: "boys" as const, qualification: "M.Sc Mathematics", experience: "10 years", order: 5, bio: "Teaches FSc Pre-Engineering and ICS Mathematics with a strong emphasis on daily practice." },
  { name: "Rukhsana Bibi", designation: "Lecturer", department: "Chemistry", wing: "girls" as const, qualification: "M.Sc Chemistry", experience: "8 years", order: 6, bio: "Teaches Chemistry to girls in FSc and Matric classes and supervises the girls lab practicals." },
  { name: "Saif Ullah", designation: "Lecturer", department: "Computer Science", wing: "boys" as const, qualification: "BS Computer Science", experience: "7 years", order: 7, bio: "Teaches ICS Computer Science and Matric Computer Science and runs the computer lab." },
  { name: "Inam Ullah Khattak", designation: "Lecturer", department: "English", wing: "boys" as const, qualification: "MA English", experience: "11 years", order: 8, bio: "Teaches English for FSc and Matric classes." },
  { name: "Saima Gul", designation: "Senior Teacher", department: "Primary Section", wing: "girls" as const, qualification: "MA Education, B.Ed", experience: "10 years", order: 9, bio: "Coordinates the girls primary section with a focus on reading, writing and character building." },
  { name: "Muhammad Tariq", designation: "Senior Teacher", department: "Middle Section", wing: "boys" as const, qualification: "M.Sc Mathematics, B.Ed", experience: "12 years", order: 10, bio: "Teaches Mathematics and Science in the boys middle section." },
  { name: "Qari Zia Ullah", designation: "Teacher", department: "Urdu & Islamiyat", wing: "boys" as const, qualification: "MA Islamiyat", experience: "14 years", order: 11, bio: "Teaches Islamiyat and Nazra Quran and guides the students' character-building programme." },
];

export const SEED_NEWS = [
  {
    title: "Admissions Open for Session 2026–27 — Class 1 to FSc",
    slug: "admissions-open-session-2026-27",
    category: "Admissions",
    featuredImage: "/images/campus-building.jpg",
    daysAgo: 3,
    tags: ["admissions", "school", "fsc", "2026"],
    excerpt:
      "Admissions are open in the school (Class 1–10) and college (FSc Pre-Medical, Pre-Engineering and ICS) for both boys and girls wings.",
    content:
      "<p>Ideal Science College, Serai Naurang is pleased to announce that admissions for <strong>Session 2026–27</strong> are now open.</p><h2>Classes open for admission</h2><ul><li>School: Primary (Class 1–5), Middle (Class 6–8) and Matric Science (Class 9–10)</li><li>College: FSc Pre-Medical, FSc Pre-Engineering and ICS (Computer Science)</li></ul><p>Boys and girls study in <strong>separate wings</strong>. The girls wing is run by female teachers in a purdah-observing environment.</p><h2>How to apply</h2><ol><li>Create a Student Portal account (parents can register for younger children) and verify the email.</li><li>Fill the online application form and upload the documents.</li><li>Visit the office after approval to complete enrollment.</li></ol>",
  },
  {
    title: "Outstanding Results in BISE Bannu Examinations",
    slug: "outstanding-results-bise-bannu",
    category: "Results",
    featuredImage: "/images/gallery-444.jpg",
    daysAgo: 20,
    tags: ["results", "bise-bannu"],
    excerpt: "Our Matric and FSc students performed strongly in the BISE Bannu annual examinations, with many A+ grades.",
    content:
      "<p>The college congratulates its students on their excellent performance in the <strong>BISE Bannu annual examinations</strong>. Students of both the boys and girls wings secured A+ and A grades in Matric Science, FSc Pre-Medical, Pre-Engineering and ICS.</p><p>Position holders will be honoured at the annual prize distribution ceremony.</p><blockquote>Hard work, discipline and dedicated teachers make the difference.</blockquote>",
  },
  {
    title: "Students Visit Pakistan Monument and Lok Virsa, Islamabad",
    slug: "study-tour-islamabad",
    category: "Campus",
    featuredImage: "/images/gallery-555.jpg",
    daysAgo: 45,
    tags: ["study-tour", "islamabad"],
    excerpt: "A study tour to Islamabad gave students the chance to explore national landmarks and learn about Pakistan's history and culture.",
    content:
      "<p>Students and faculty members of the boys wing visited the <strong>Pakistan Monument</strong>, Lok Virsa Museum and other landmarks in Islamabad as part of the annual study tour.</p><p>The tour helped students connect classroom learning with national history and heritage, and strengthened teamwork among classmates.</p>",
  },
  {
    title: "Merit Certificates Awarded to Monthly Test Toppers",
    slug: "merit-certificates-monthly-test-toppers",
    category: "Achievements",
    featuredImage: "/images/gallery-99.jpg",
    daysAgo: 60,
    tags: ["awards", "monthly-test"],
    excerpt: "Top performers in the monthly test series received merit certificates and appreciation from the principal.",
    content:
      "<p>To encourage consistent effort, the college awards merit certificates every month to the top scorers of each class in both wings. This month's toppers received their certificates in front of their classmates.</p><p>Regular testing and recognition keep students motivated throughout the year.</p>",
  },
  {
    title: "Send-Up Examinations Schedule Announced",
    slug: "send-up-examinations-schedule",
    category: "Announcements",
    featuredImage: "/images/gallery-222.jpg",
    daysAgo: 75,
    tags: ["examinations", "send-up"],
    excerpt: "Send-up examinations for Class 10 and FSc Part-II will be held under board conditions. Students must clear all dues before the exams.",
    content:
      "<p>The send-up examinations for <strong>Class 10 and FSc Part-II</strong> will be held under board-style conditions, separately for the boys and girls wings.</p><ul><li>Roll number slips will be issued by the class in-charges.</li><li>Students must clear all dues before collecting roll number slips.</li><li>Mobile phones are strictly not allowed in the examination hall.</li></ul>",
  },
];

export const SEED_EVENTS = [
  {
    title: "Admission Information Day",
    slug: "admission-information-day",
    category: "Academic",
    location: "College Campus, Serai Naurang",
    featuredImage: "/images/campus-gate.jpeg",
    startInDays: 7,
    durationHours: 4,
    description:
      "Parents and students are invited to meet our teachers, visit the labs and learn about classes, fees and the online admission process. Separate counselling desks will be arranged for the boys and girls wings.",
  },
  {
    title: "Annual Sports Day (Boys Wing)",
    slug: "annual-sports-day-boys-wing",
    category: "Sports",
    location: "College Ground, Serai Naurang",
    featuredImage: "/images/gallery-11.jpg",
    startInDays: 18,
    durationHours: 5,
    description: "Cricket, football, athletics and tug-of-war competitions between houses of the boys wing. Parents are welcome to attend.",
  },
  {
    title: "Annual Prize Distribution Ceremony",
    slug: "annual-prize-distribution-ceremony",
    category: "Ceremony",
    location: "College Hall, Serai Naurang",
    featuredImage: "/images/gallery-666.jpg",
    startInDays: 35,
    durationHours: 3,
    description:
      "Position holders in board examinations and monthly tests from Class 1 to FSc will receive prizes and certificates. Separate ceremonies are held for the boys and girls wings.",
  },
];

export const SEED_GALLERY = [
  {
    albumName: "Study Tours",
    slug: "study-tours",
    category: "Trips",
    description: "Educational trips to Islamabad and the northern areas.",
    images: [
      { url: "/images/gallery-555.jpg", caption: "Faculty at the Pakistan Monument, Islamabad" },
      { url: "/images/gallery-666.jpg", caption: "Students and teachers on the annual study tour" },
      { url: "/images/gallery-11.jpg", caption: "Group photo during the trip" },
      { url: "/images/gallery-44.jpg", caption: "Exploring national landmarks" },
      { url: "/images/gallery-66.jpg", caption: "Students on tour" },
    ],
  },
  {
    albumName: "Examinations & Awards",
    slug: "examinations-and-awards",
    category: "Ceremonies",
    description: "Examination halls, result days and award ceremonies.",
    images: [
      { url: "/images/gallery-222.jpg", caption: "Students during the send-up examination" },
      { url: "/images/gallery-99.jpg", caption: "Merit certificates for test toppers" },
      { url: "/images/gallery-111.jpg", caption: "Result day" },
      { url: "/images/gallery-444.jpg", caption: "Award ceremony" },
      { url: "/images/gallery-22.jpg", caption: "Students with their certificates" },
      { url: "/images/gallery-88.jpg", caption: "Faculty and students" },
    ],
  },
  {
    albumName: "Campus & Classrooms",
    slug: "campus-and-classrooms",
    category: "Campus",
    description: "Our campus, laboratories and classrooms.",
    images: [
      { url: "/images/campus-gate.jpeg", caption: "Main gate" },
      { url: "/images/students-lab.jpeg", caption: "Students in the science laboratory" },
      { url: "/images/students-1.jpeg", caption: "Classroom session" },
      { url: "/images/students-2.jpeg", caption: "Students at work" },
      { url: "/images/students-3.jpeg", caption: "Learning together" },
      { url: "/images/gallery-33.jpg", caption: "Campus life" },
      { url: "/images/gallery-55.jpg", caption: "Campus moments" },
      { url: "/images/gallery-77.jpg", caption: "Students on campus" },
    ],
  },
];

export const SEED_JOBS = [
  {
    title: "Lecturer — Biology (Girls Wing)",
    slug: "lecturer-biology-girls-wing",
    department: "Biology",
    type: "full-time" as const,
    location: "Serai Naurang Campus — Girls Wing",
    salaryRange: "Rs 35,000 – 55,000 per month",
    deadlineInDays: 25,
    description: "We are looking for a dedicated female Biology lecturer to teach FSc Pre-Medical and Matric classes in the girls wing.",
    requirements: [
      "M.Sc / BS (4-year) or M.Phil in Zoology, Botany or Biology",
      "At least 2 years of teaching experience",
      "Female candidates only (girls wing position)",
    ],
    responsibilities: ["Teach FSc Part-I and Part-II Biology", "Conduct weekly tests and lab practicals", "Maintain student progress records"],
  },
  {
    title: "Teacher — Mathematics (Boys Middle Section)",
    slug: "teacher-mathematics-boys-middle",
    department: "Mathematics",
    type: "full-time" as const,
    location: "Serai Naurang Campus — Boys Wing",
    salaryRange: "Rs 25,000 – 40,000 per month",
    deadlineInDays: 20,
    description: "Full-time Mathematics teacher for Class 6–8 in the boys wing.",
    requirements: ["M.Sc / BS (4-year) Mathematics; B.Ed preferred", "Teaching experience at school level preferred", "Strong classroom management"],
    responsibilities: ["Teach Mathematics to Class 6–8", "Prepare and check chapter tests", "Hold parent meetings with the class in-charge"],
  },
];
