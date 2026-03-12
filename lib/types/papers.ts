/** Single question in a paper (client-safe). */
export type PaperDetailQuestion = {
  id: string;
  question: string;
  options: unknown;
  answer: string | null;
  points: number;
  sortOrder: number;
};

/** Client-safe DTO for question paper detail (serialized from server). */
export type PaperDetailDTO = {
  id: string;
  name: string;
  description: string | null;
  questions: PaperDetailQuestion[];
};
