import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { SYSTEM_PROMPT } from "./prompts";
import { isParentInsight, parentInsightJsonSchema, type ParentInsight } from "@/lib/parentInsights";
import {
  isParentCard,
  isStorySegment,
  parentCardJsonSchema,
  storySegmentJsonSchema,
  type ParentCard,
  type StorySegment,
} from "./schema";

// 기본 모델. 기획안의 gemini-2.5-flash는 신규 사용자에게 막혀 있다.
// gemini-3.8-flash는 수요가 몰리면 수십 초 걸려서, 2초대로 응답하는 lite 모델을 기본으로 쓴다.
const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
// 기본 모델이 과부하(503)·시간 초과로 실패하면 차례로 시도할 모델들. 쉼표로 덮어쓸 수 있다.
const FALLBACK_MODELS = (process.env.GEMINI_FALLBACK_MODELS || "gemini-3.5-flash,gemini-3.6-flash")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

// 한 번 시도에 기다리는 최대 시간, 전체 시도에 쓰는 최대 시간 (라우트 maxDuration 60초 안쪽)
const ATTEMPT_TIMEOUT_MS = 20000;
const TOTAL_BUDGET_MS = 45000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Gemini를 호출해 구조화된 JSON을 받는다.
// 실패(과부하·시간 초과·형식 오류)하면 대체 모델로 넘어가며 시간 예산 안에서 재시도한다.
async function generateJson<T>(opts: {
  system: string;
  user: string;
  schema: object;
  guard: (v: unknown) => v is T;
  temperature?: number;
}): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.");

  const ai = new GoogleGenAI({ apiKey });
  let lastError: unknown;

  const pool = [MODEL, ...FALLBACK_MODELS.filter((m) => m !== MODEL)];
  const deadline = Date.now() + TOTAL_BUDGET_MS;

  // 시간 예산이 남아 있는 동안 모델을 돌아가며 재시도한다. 과부하(503)는 잠깐 쉬면 풀리는 경우가 많다.
  for (let attempt = 0; attempt < 8; attempt++) {
    if (attempt > 0) await sleep(Math.min(500 * attempt, 2500));
    const remaining = deadline - Date.now();
    if (remaining < 3000) break;
    const model = pool[attempt % pool.length];
    try {
      const res = await ai.models.generateContent({
        model,
        contents: opts.user,
        config: {
          systemInstruction: opts.system,
          responseMimeType: "application/json",
          responseJsonSchema: opts.schema,
          temperature: opts.temperature ?? 0.9,
          // 깊은 추론이 필요 없다. 속도를 위해 생각 시간을 줄인다. (MINIMAL은 일부 모델에서 400)
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          // 한 시도가 너무 오래 걸리면 끊고 다음 모델로 넘어간다.
          httpOptions: { timeout: Math.min(ATTEMPT_TIMEOUT_MS, remaining), retryOptions: { attempts: 1 } },
        },
      });
      const parsed: unknown = JSON.parse(res.text ?? "");
      if (opts.guard(parsed)) return parsed;
      lastError = new Error("응답이 기대한 형식과 맞지 않습니다.");
    } catch (e) {
      lastError = e;
    }
    console.warn(`[gemini] ${model} 실패 (시도 ${attempt + 1}):`, String((lastError as Error)?.message ?? lastError).slice(0, 200));
  }
  throw lastError instanceof Error ? lastError : new Error("생성에 실패했습니다.");
}

// 이야기 시작 · 이어쓰기 공용
export function generateSegment(userPrompt: string): Promise<StorySegment> {
  return generateJson({
    system: SYSTEM_PROMPT,
    user: userPrompt,
    schema: storySegmentJsonSchema,
    guard: isStorySegment,
  });
}

export function generateParentCard(systemPrompt: string, userPrompt: string): Promise<ParentCard> {
  return generateJson({
    system: systemPrompt,
    user: userPrompt,
    schema: parentCardJsonSchema,
    guard: isParentCard,
    temperature: 0.7,
  });
}

export function generateParentInsight(systemPrompt: string, userPrompt: string): Promise<ParentInsight> {
  return generateJson({ system: systemPrompt, user: userPrompt, schema: parentInsightJsonSchema, guard: isParentInsight, temperature: 0.6 });
}
