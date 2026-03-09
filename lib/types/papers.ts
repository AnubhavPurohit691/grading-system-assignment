/** Client-safe DTO for question paper detail (serialized from server). */
export type PaperDetailDTO = {
  id: string;
  name: string;
  description: string | null;
  questions: Array<{
    id: string;
    question: string;
    options: unknown;
    answer: string | null;
    points: number;
    sortOrder: number;
  }>;
};
