export const LETTER_GRADES = [
  "A_PLUS",
  "A",
  "B_PLUS",
  "B",
  "C_PLUS",
  "C",
  "D_PLUS",
  "D",
  "F",
] as const;

export type LetterGrade = (typeof LETTER_GRADES)[number];

const THRESHOLDS: { min: number; grade: LetterGrade }[] = [
  { min: 90, grade: "A_PLUS" },
  { min: 80, grade: "A" },
  { min: 70, grade: "B_PLUS" },
  { min: 60, grade: "B" },
  { min: 50, grade: "C_PLUS" },
  { min: 40, grade: "C" },
  { min: 30, grade: "D_PLUS" },
  { min: 20, grade: "D" },
  { min: 0, grade: "F" },
];

export function percentageToLetterGrade(percentage: number): LetterGrade {
  for (const { min, grade } of THRESHOLDS) {
    if (percentage >= min) return grade;
  }
  return "F";
}
