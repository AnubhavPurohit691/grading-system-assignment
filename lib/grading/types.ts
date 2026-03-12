/** One question-answer pair to be graded by AI */
export type GradingItem = {
  questionId: string;
  questionText: string;
  teacherAnswer: string | null;
  studentAnswer: string;
  maxPoints: number;
};

/** AI grading result for one answer */
export type GradingResultItem = {
  questionId: string;
  pointsEarned: number;
  isCorrect: boolean;
};

/** Input to the grading graph */
export type GradingInput = {
  submissionId: string;
  items: GradingItem[];
  totalMaxPoints: number;
};

/** Output from the grading graph (used to update DB) */
export type GradingOutput = {
  results: GradingResultItem[];
  totalEarned: number;
  letterGrade: string | null;
};
