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

// Gemini를 호출해 구조화된 JSON을 받는다. 형식이 깨지면 1회 재시도한다.
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

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await ai.models.generateContent({
        model: MODEL,
        contents: opts.user,
        config: {
          systemInstruction: opts.system,
          responseMimeType: "application/json",
          responseJsonSchema: opts.schema,
          temperature: opts.temperature ?? 0.9,
          // 깊은 추론이 필요 없다. 속도를 위해 생각 시간을 줄인다. (MINIMAL은 일부 모델에서 400)
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          // 한 번에 12초 넘게 걸리면 포기한다. 시연 중에 멈춰 있지 않고 폴백(미리 만든 동화)으로 넘어가기 위해서다.
          httpOptions: { timeout: 12000 },
        },
      });
      const parsed: unknown = JSON.parse(res.text ?? "");
      if (opts.guard(parsed)) return parsed;
      lastError = new Error("응답이 기대한 형식과 맞지 않습니다.");
    } catch (e) {
      lastError = e;
    }
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
