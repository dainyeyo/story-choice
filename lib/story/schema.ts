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
  characterBible?: string; // 장면 사이에 유지하는 캐릭터 외형
  title: string; // 동화 제목
  scenes: StoryScene[]; // 이번 구간의 장면들
  choice: StoryChoice | null; // 다음에 고를 선택. 결말이면 null
  isEnding: boolean; // 결말이면 true
  fallback?: boolean; // 서버가 AI 대신 미리 만든 동화를 줬으면 true
}

// 나이 선택 범위. 양 끝 값은 "3세 이하", "8세 이상"처럼 구간으로 읽는다.
export const MIN_AGE = 3;
export const MAX_AGE = 8;
export function ageLabel(age: number): string {
  if (age <= MIN_AGE) return `${MIN_AGE}세 이하`;
  if (age >= MAX_AGE) return `${MAX_AGE}세 이상`;
  return `${age}세`;
}

// 동화 길이(분). 고르지 않으면 AI가 정하되 MAX_DURATION분을 넘지 않는다.
export const MIN_DURATION = 1;
export const MAX_DURATION = 10;

export interface StoryRequest {
  characterBible?: string;
  hasUserDrawing?: boolean;
  age: number; // MIN_AGE~MAX_AGE (양 끝은 "이하"/"이상" 구간)
  situation: string; // 고민 상황 (최대 200자)
  durationMin?: number; // MIN_DURATION~MAX_DURATION분. 없으면 AI가 이야기에 맞춰 정한다(최대 MAX_DURATION분)
  protagonist?: string; // 주인공 묘사. 예: "파란 토끼" (이름·개인정보 금지)
  previousMemo?: string; // 이전 동화에서 부모가 남긴 메모
  recentContext?: string; // 최근 7일의 감정·선택·메모 요약 (개인화 참고용)
}

// Gemini 구조화 출력용 JSON Schema
export const storySegmentJsonSchema = {
  type: "object",
  properties: {
    characterBible: { type: "string" },
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
  required: ["title", "scenes", "choice", "isEnding", "characterBible"],
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

// ───────── 이어쓰기 ─────────

export interface ChosenChoice {
  prompt: string; // 아이가 받은 질문
  text: string; // 아이가 고른 선택지 문장
  copingType: CopingType;
}

// POST /api/story/continue 요청
// 프론트가 지금까지의 장면 본문과 아이가 고른 선택을 모두 보내준다 (서버는 상태를 저장하지 않는다).
export interface ContinueRequest extends StoryRequest {
  title: string;
  scenesSoFar: string[]; // 지금까지 장면 본문(text)
  choices: ChosenChoice[]; // 지금까지 고른 선택 (1개 또는 2개)
}

// ───────── 부모 카드 ─────────

export interface ParentCardQuestion {
  text: string; // 부모가 아이에게 던질 질문
  hint: string; // 아이가 답했을 때 부모가 어떻게 받아줄지 한 줄
}

export interface ParentCard {
  summary: string; // "치과 장면에서 '엄마 뒤에 숨기'(회피)를 골랐어요." 형태
  questions: ParentCardQuestion[]; // 항상 3개
  answerTip: string; // 아이 답을 받는 방법 한 줄
  fallback?: boolean; // AI 대신 템플릿으로 만든 카드면 true
}

// POST /api/story/parent-card 요청
export interface ParentCardRequest {
  age: number;
  situation: string;
  protagonist?: string;
  title: string;
  choices: ChosenChoice[]; // 아이가 고른 선택 전부
}

export const parentCardJsonSchema = {
  type: "object",
  properties: {
    summary: { type: "string" },
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: { text: { type: "string" }, hint: { type: "string" } },
        required: ["text", "hint"],
      },
    },
    answerTip: { type: "string" },
  },
  required: ["summary", "questions", "answerTip"],
} as const;

export function isParentCard(v: unknown): v is ParentCard {
  if (!v || typeof v !== "object") return false;
  const c = v as ParentCard;
  return (
    typeof c.summary === "string" &&
    typeof c.answerTip === "string" &&
    Array.isArray(c.questions) &&
    c.questions.length === 3 &&
    c.questions.every((q) => typeof q?.text === "string" && typeof q?.hint === "string")
  );
}
