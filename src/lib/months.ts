export const MONTHS = [
  { value: 1, en: "January", bn: "জানুয়ারি" },
  { value: 2, en: "February", bn: "ফেব্রুয়ারি" },
  { value: 3, en: "March", bn: "মার্চ" },
  { value: 4, en: "April", bn: "এপ্রিল" },
  { value: 5, en: "May", bn: "মে" },
  { value: 6, en: "June", bn: "জুন" },
  { value: 7, en: "July", bn: "জুলাই" },
  { value: 8, en: "August", bn: "আগস্ট" },
  { value: 9, en: "September", bn: "সেপ্টেম্বর" },
  { value: 10, en: "October", bn: "অক্টোবর" },
  { value: 11, en: "November", bn: "নভেম্বর" },
  { value: 12, en: "December", bn: "ডিসেম্বর" },
] as const;

export function monthLabel(m: number) {
  return MONTHS.find((x) => x.value === m) ?? { value: m, en: String(m), bn: "" };
}

export function currentYear() {
  return new Date().getFullYear();
}

export function yearOptions(range = 5) {
  const y = currentYear();
  const arr: number[] = [];
  for (let i = y + 1; i >= y - range; i--) arr.push(i);
  return arr;
}
