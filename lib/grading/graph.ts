import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import { StateGraph, Annotation } from "@langchain/langgraph";
import type { GradingItem, GradingResultItem } from "./types";

const LETTER_GRADES = [
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

function percentageToLetterGrade(percentage: number): (typeof LETTER_GRADES)[number] {
  if (percentage >= 90) return "A_PLUS";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B_PLUS";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C_PLUS";
  if (percentage >= 40) return "C";
  if (percentage >= 30) return "D_PLUS";
  if (percentage >= 20) return "D";
  return "F";
}

const GradingState = Annotation.Root({
  submissionId: Annotation<string>(),
  items: Annotation<GradingItem[]>(),
  totalMaxPoints: Annotation<number>(),
  results: Annotation<GradingResultItem[]>(),
  totalEarned: Annotation<number>(),
  letterGrade: Annotation<string | null>(),
});

type State = typeof GradingState.State;

async function gradeWithGemini(items: GradingItem[]): Promise<GradingResultItem[]> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is not set");
  }

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0,
    apiKey,
  });

  const prompt = `You are a teacher grading student answers. For each item below, compare the student's answer to the teacher's expected answer. Grade based on meaning and key points, not exact wording. Award points from 0 up to maxPoints. Set isCorrect to true only if the answer is fully or nearly fully correct.

Respond with a JSON object with a single key "grades" which is an array of objects. Each object must have:
- "questionId" (string): exactly the questionId from the item
- "pointsEarned" (number): integer from 0 to maxPoints
- "isCorrect" (boolean): true if the answer deserves full or nearly full points

Items to grade (JSON):
${JSON.stringify(
  items.map((i) => ({
    questionId: i.questionId,
    questionText: i.questionText,
    teacherAnswer: i.teacherAnswer ?? "(no model answer given)",
    studentAnswer: i.studentAnswer,
    maxPoints: i.maxPoints,
  }))
)}

Return only valid JSON, no markdown or extra text. Example: {"grades":[{"questionId":"...","pointsEarned":2,"isCorrect":true}]}`;

  const response = await model.invoke([new HumanMessage(prompt)]);
  let rawText = "";
  if (typeof response.content === "string") {
    rawText = response.content;
  } else if (Array.isArray(response.content)) {
    rawText = response.content
      .map((part: unknown) => (typeof part === "object" && part !== null && "text" in part ? (part as { text: string }).text : String(part)))
      .join("");
  }
  const trimmed = rawText
    .replace(/^```json\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  const toParse = jsonMatch ? jsonMatch[0] : trimmed;
  let parsed: { grades?: GradingResultItem[] };
  try {
    parsed = JSON.parse(toParse);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Parse error";
    throw new Error(`AI grading response was not valid JSON: ${msg}. Raw: ${rawText.slice(0, 200)}`);
  }
  const grades = parsed.grades;
  if (!Array.isArray(grades)) {
    throw new Error("AI grading response missing grades array");
  }
  const byId = new Set(items.map((i) => i.questionId));
  const results: GradingResultItem[] = [];
  for (const g of grades) {
    if (typeof g.questionId !== "string" || !byId.has(g.questionId)) continue;
    const maxP = items.find((i) => i.questionId === g.questionId)?.maxPoints ?? 0;
    const pointsEarned = Math.min(maxP, Math.max(0, Number(g.pointsEarned) || 0));
    results.push({
      questionId: g.questionId,
      pointsEarned: Math.round(pointsEarned),
      isCorrect: Boolean(g.isCorrect),
    });
  }
  for (const item of items) {
    if (!results.some((r) => r.questionId === item.questionId)) {
      results.push({ questionId: item.questionId, pointsEarned: 0, isCorrect: false });
    }
  }
  return results;
}

async function gradeNode(state: State): Promise<Partial<State>> {
  const { items, totalMaxPoints } = state;
  if (!items?.length) {
    return {
      results: [],
      totalEarned: 0,
      letterGrade: null,
    };
  }
  const results = await gradeWithGemini(items);
  const totalEarned = results.reduce((sum, r) => sum + r.pointsEarned, 0);
  const percentage =
    totalMaxPoints > 0 ? (totalEarned / totalMaxPoints) * 100 : 0;
  const letterGrade = percentageToLetterGrade(percentage);
  return {
    results,
    totalEarned,
    letterGrade,
  };
}

export function createGradingGraph() {
  const graph = new StateGraph(GradingState)
    .addNode("grade", gradeNode)
    .addEdge("__start__", "grade")
    .addEdge("grade", "__end__");
  return graph.compile();
}

let cachedGraph: ReturnType<typeof createGradingGraph> | null = null;

export function getGradingGraph() {
  if (!cachedGraph) cachedGraph = createGradingGraph();
  return cachedGraph;
}

export async function runGradingGraph(input: {
  submissionId: string;
  items: GradingItem[];
  totalMaxPoints: number;
}): Promise<{
  results: GradingResultItem[];
  totalEarned: number;
  letterGrade: string | null;
}> {
  const graph = getGradingGraph();
  const result = await graph.invoke({
    submissionId: input.submissionId,
    items: input.items,
    totalMaxPoints: input.totalMaxPoints,
    results: [],
    totalEarned: 0,
    letterGrade: null,
  });
  return {
    results: result.results ?? [],
    totalEarned: result.totalEarned ?? 0,
    letterGrade: result.letterGrade ?? null,
  };
}
