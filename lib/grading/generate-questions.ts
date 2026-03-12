import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";

export type GeneratedQuestion = {
  type: "mcq" | "long";
  question: string;
  options?: string[];
  answer: string;
  points: number;
};

export type GenerateQuestionsOptions = {
  mcqCount: number;
  longCount: number;
  context?: { paperName?: string; paperDescription?: string };
};

function extractText(response: { content: string | unknown[] }): string {
  const c = response.content;
  if (typeof c === "string") return c;
  if (!Array.isArray(c)) return "";
  return c
    .map((p: unknown) => (p && typeof p === "object" && "text" in p ? (p as { text: string }).text : String(p)))
    .join("");
}

export async function generateQuestions(topic: string, options: GenerateQuestionsOptions): Promise<GeneratedQuestion[]> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_API_KEY is not set");
  const { mcqCount, longCount, context } = options;
  if (mcqCount + longCount < 1) throw new Error("Need at least 1 question (MCQ or long)");

  const model = new ChatGoogleGenerativeAI({ model: "gemini-2.5-flash", temperature: 0.7, apiKey });
  const ctx = context?.paperName || context?.paperDescription
    ? ` Paper: ${[context.paperName, context.paperDescription].filter(Boolean).join(". ")}`
    : "";

  const prompt = `Create a question set on: "${topic}"${ctx}
Generate exactly ${mcqCount} MCQs (4 options each, "options" array of 4 strings, "answer" = correct option text) and exactly ${longCount} long-answer questions (no options, "answer" = model answer). Points: MCQ 1-2, long 3-5. MCQs first in the array.
Return JSON: {"questions":[{"type":"mcq"|"long","question":"...","options":[] only for mcq,"answer":"...","points":n}]}
Valid JSON only, no markdown.`;

  const rawText = extractText(await model.invoke([new HumanMessage(prompt)]));
  const trimmed = rawText.replace(/^```json\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  const match = trimmed.match(/\{[\s\S]*\}/);
  let parsed: { questions?: unknown[] };
  try {
    parsed = JSON.parse(match ? match[0] : trimmed);
  } catch (e) {
    throw new Error(`Invalid JSON: ${e instanceof Error ? e.message : "parse error"}`);
  }
  const raw = parsed.questions;
  if (!Array.isArray(raw) || raw.length === 0) throw new Error("No questions returned");

  type Q = { type?: string; question?: string; options?: unknown; answer?: string; points?: number };
  const normalized: GeneratedQuestion[] = [];
  let mcqLeft = mcqCount;
  let longLeft = longCount;
  for (const q of raw as Q[]) {
    const isMcq = q?.type === "mcq";
    if (isMcq && mcqLeft <= 0) continue;
    if (!isMcq && longLeft <= 0) continue;
    const text = typeof q?.question === "string" ? q.question.trim() : "";
    if (!text) continue;
    const pts = typeof q?.points === "number" && q.points >= 0 ? Math.min(10, q.points) : isMcq ? 1 : 3;
    let ans = typeof q?.answer === "string" ? q.answer.trim() : "";
    let opts: string[] | undefined;
    if (isMcq && Array.isArray(q?.options)) {
      opts = (q.options as unknown[]).filter((x): x is string => typeof x === "string").slice(0, 4);
      if (opts.length >= 2 && !ans) ans = opts[0];
    }
    if (isMcq) mcqLeft--;
    else longLeft--;
    normalized.push({ type: isMcq ? "mcq" : "long", question: text, options: opts, answer: ans, points: pts });
  }
  return normalized;
}
