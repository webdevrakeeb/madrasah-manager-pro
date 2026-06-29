// Bilingual label helper. Renders English with smaller Bangla beneath.
export const L = {
  overview: { en: "Overview", bn: "সারসংক্ষেপ" },
  play: { en: "Play", bn: "প্লে" },
  nursery: { en: "Nursery", bn: "নার্সারি" },
  one: { en: "One", bn: "প্রথম" },
  two: { en: "Two", bn: "দ্বিতীয়" },
  three: { en: "Three", bn: "তৃতীয়" },
  four: { en: "Four", bn: "চতুর্থ" },
  hifz: { en: "Hifz", bn: "হিফজ" },
  teachers: { en: "Teachers", bn: "শিক্ষক" },
  students: { en: "Students", bn: "শিক্ষার্থী" },
  addStudent: { en: "Register Student", bn: "শিক্ষার্থী নিবন্ধন" },
  signOut: { en: "Sign Out", bn: "লগ আউট" },
  signIn: { en: "Sign In", bn: "লগ ইন" },
  email: { en: "Email", bn: "ইমেইল" },
  password: { en: "Password", bn: "পাসওয়ার্ড" },
} as const;

export const CLASS_OPTIONS = [
  { value: "play", en: "Play", bn: "প্লে" },
  { value: "nursery", en: "Nursery", bn: "নার্সারি" },
  { value: "one", en: "One", bn: "প্রথম শ্রেণি" },
  { value: "two", en: "Two", bn: "দ্বিতীয় শ্রেণি" },
  { value: "three", en: "Three", bn: "তৃতীয় শ্রেণি" },
  { value: "four", en: "Four", bn: "চতুর্থ শ্রেণি" },
  { value: "hifz", en: "Hifz", bn: "হিফজ" },
] as const;

export type ClassValue = (typeof CLASS_OPTIONS)[number]["value"];

export const GENDER_OPTIONS = [
  { value: "male", en: "Male", bn: "ছেলে" },
  { value: "female", en: "Female", bn: "মেয়ে" },
];

export const RELIGION_OPTIONS = [
  { value: "islam", en: "Islam", bn: "ইসলাম" },
  { value: "hinduism", en: "Hinduism", bn: "হিন্দু" },
  { value: "christianity", en: "Christianity", bn: "খ্রিস্টান" },
  { value: "buddhism", en: "Buddhism", bn: "বৌদ্ধ" },
  { value: "other", en: "Other", bn: "অন্যান্য" },
];

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const NATIONALITY_OPTIONS = [
  { value: "bangladeshi", en: "Bangladeshi", bn: "বাংলাদেশী" },
  { value: "other", en: "Other", bn: "অন্যান্য" },
];
