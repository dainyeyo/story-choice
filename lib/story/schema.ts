// 이야기 한 구간(segment)의 형식. 이야기 시작과 이어쓰기가 같은 형식을 쓴다.
// 프론트는 이 타입만 알면 된다.

export const COPING_TYPES = ["도움요청", "스스로진정", "회피", "직면"] as const;
export type CopingType = (typeof COPING_TYPES)[number];

export interface StoryChoiceOption {
  id: string; // "a" | "b"
  text: string; // 아이에게 보여줄 선택지 (짧게)
  copingType: CopingType; // 대처 유형 태그 (부모 카드에서 사용)
}

export interface StoryScene {
  text: string; // 장면 본문 (낭독용)
  imagePrompt: string; // 삽화 생성용 영어 프롬프트 (캐릭터 묘사 제외, 장면만)
}

export interface StoryChoice {
  prompt: string; // "토끼는 어떻게 할까?" 같은 질문
  options: StoryChoiceOption[]; // 항상 2개
}

export interface StorySegment {
  title: string; // 동화 제목
  scenes: StoryScene[]; // 이번 구간의 장면들
  choice: StoryChoice | null; // 다음에 고를 선택. 결말이면 null
  isEnding: boolean; // 결말이면 true
}

export interface StoryRequest {
  age: number; // 4~7
  situation: string; // 고민 상황 (최대 200자)
  durationMin: 3 | 5;
  protagonist?: string; // 주인공 묘사. 예: "파란 토끼" (이름·개인정보 금지)
  previousMemo?: string; // 이전 동화에서 부모가 남긴 메모
}

// Gemini 구조화 출력용 JSON Schema
export const storySegmentJsonSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    scenes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          text: { type: "string" },
          imagePrompt: { type: "string" },
        },
        required: ["text", "imagePrompt"],
      },
    },
    choice: {
      type: "object",
      nullable: true,
      properties: {
        prompt: { type: "string" },
        options: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              text: { type: "string" },
              copingType: { type: "string", enum: [...COPING_TYPES] },
            },
            required: ["id", "text", "copingType"],
          },
        },
      },
      required: ["prompt", "options"],
    },
    isEnding: { type: "boolean" },
  },
  required: ["title", "scenes", "choice", "isEnding"],
} as const;

export function isStorySegment(v: unknown): v is StorySegment {
  if (!v || typeof v !== "object") return false;
  const s = v as StorySegment;
  if (typeof s.title !== "string" || typeof s.isEnding !== "boolean") return false;
  if (!Array.isArray(s.scenes) || s.scenes.length === 0) return false;
  if (!s.scenes.every((x) => typeof x?.text === "string" && typeof x?.imagePrompt === "string"))
    return false;
  if (s.choice === null) return s.isEnding;
  if (s.isEnding) return false;
  return (
    typeof s.choice?.prompt === "string" &&
    Array.isArray(s.choice.options) &&
    s.choice.options.length === 2 &&
    s.choice.options.every(
      (o) => typeof o?.id === "string" && typeof o?.text === "string" && COPING_TYPES.includes(o.copingType),
    )
  );
}
