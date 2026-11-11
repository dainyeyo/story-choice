import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { SYSTEM_PROMPT } from "./prompts";
import { isStorySegment, storySegmentJsonSchema, type StorySegment } from "./schema";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

// Gemini를 호출해 StorySegment JSON을 받는다. 형식이 깨지면 1회 재시도한다.
export async function generateSegment(userPrompt: string): Promise<StorySegment> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.");

  const ai = new GoogleGenAI({ apiKey });
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await ai.models.generateContent({
        model: MODEL,
        contents: userPrompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseJsonSchema: storySegmentJsonSchema,
          temperature: 0.9,
          // 동화 생성에는 깊은 추론이 필요 없다. 속도를 위해 생각 시간을 최소화한다.
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });
      const parsed: unknown = JSON.parse(res.text ?? "");
      if (isStorySegment(parsed)) return parsed;
      lastError = new Error("응답이 이야기 형식과 맞지 않습니다.");
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("이야기 생성에 실패했습니다.");
}
