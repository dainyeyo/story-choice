import {
  COPING_TYPES,
  type ChosenChoice,
  type ContinueRequest,
  type ParentCardRequest,
  MAX_AGE,
  MIN_AGE,
  type StoryRequest,
} from "./schema";

// 라우트 공용 입력 검증. 문자열이면 에러 메시지, 객체면 통과.

type Obj = Record<string, unknown>;

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function parseCommon(b: Obj): { age: number; situation: string; protagonist?: string } | string {
  const age = Number(b.age);
  if (!Number.isInteger(age) || age < MIN_AGE || age > MAX_AGE) return `age는 ${MIN_AGE}~${MAX_AGE} 사이 정수여야 합니다.`;

  const situation = typeof b.situation === "string" ? b.situation.trim() : "";
  if (!situation) return "situation(고민 상황)이 필요합니다.";
  if (situation.length > 200) return "situation은 200자 이하여야 합니다.";

  return { age, situation, protagonist: str(b.protagonist, 50) || undefined };
}

function parseChoices(v: unknown, allowed: number[]): ChosenChoice[] | string {
  if (!Array.isArray(v) || !allowed.includes(v.length)) return `choices는 ${allowed.join(" 또는 ")}개여야 합니다.`;
  const out: ChosenChoice[] = [];
  for (const c of v) {
    const o = (c ?? {}) as Obj;
    const prompt = str(o.prompt, 100);
    const text = str(o.text, 60);
    const copingType = o.copingType as ChosenChoice["copingType"];
    if (!prompt || !text || !COPING_TYPES.includes(copingType)) return "choices 항목 형식이 올바르지 않습니다.";
    out.push({ prompt, text, copingType });
  }
  return out;
}

export function parseStoryRequest(raw: unknown): StoryRequest | string {
  if (!raw || typeof raw !== "object") return "요청 형식이 올바르지 않습니다.";
  const b = raw as Obj;
  const common = parseCommon(b);
  if (typeof common === "string") return common;

  const durationMin = Number(b.durationMin);
  if (durationMin !== 3 && durationMin !== 5) return "durationMin은 3 또는 5여야 합니다.";

  return { ...common, durationMin, previousMemo: str(b.previousMemo, 200) || undefined };
}

export function parseContinueRequest(raw: unknown): ContinueRequest | string {
  const base = parseStoryRequest(raw);
  if (typeof base === "string") return base;
  const b = raw as Obj;

  const title = str(b.title, 100);
  if (!title) return "title이 필요합니다.";

  if (!Array.isArray(b.scenesSoFar) || b.scenesSoFar.length === 0 || b.scenesSoFar.length > 12)
    return "scenesSoFar는 1~12개의 문자열이어야 합니다.";
  const scenesSoFar = b.scenesSoFar.map((s) => str(s, 600));
  if (scenesSoFar.some((s) => !s)) return "scenesSoFar에 빈 장면이 있습니다.";

  const choices = parseChoices(b.choices, [1, 2]);
  if (typeof choices === "string") return choices;

  return { ...base, title, scenesSoFar, choices };
}

export function parseParentCardRequest(raw: unknown): ParentCardRequest | string {
  if (!raw || typeof raw !== "object") return "요청 형식이 올바르지 않습니다.";
  const b = raw as Obj;
  const common = parseCommon(b);
  if (typeof common === "string") return common;

  const title = str(b.title, 100);
  if (!title) return "title이 필요합니다.";

  const choices = parseChoices(b.choices, [1, 2]);
  if (typeof choices === "string") return choices;

  return { ...common, title, choices };
}
