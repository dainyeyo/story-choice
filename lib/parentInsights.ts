import type { SavedStory } from "@/lib/library";
import { COPING_TYPES, type ChosenChoice } from "@/lib/story/schema";
import { localDateKey, type PetMood } from "@/lib/pet";

export interface InsightStorySignal {
  date: string;
  title: string;
  situation: string;
  choices: ChosenChoice[];
  memo?: string;
}

export interface ParentInsightRequest {
  moods: { date: string; mood: PetMood }[];
  stories: InsightStorySignal[];
}

export interface ParentInsight {
  actionCard: {
    observation: string;
    action: string;
    sayThis: string;
    avoidThis: string;
  };
  weeklyReport: {
    headline: string;
    pattern: string;
    change: string;
    nextWeek: string;
  };
  storyGuidance: {
    theme: string;
    goal: string;
    promptHint: string;
  };
  fallback?: boolean;
}

const MOODS: PetMood[] = ["기쁨", "평온", "속상", "용기", "두근"];

export const parentInsightJsonSchema = {
  type: "object",
  properties: {
    actionCard: {
      type: "object",
      properties: {
        observation: { type: "string" }, action: { type: "string" }, sayThis: { type: "string" }, avoidThis: { type: "string" },
      },
      required: ["observation", "action", "sayThis", "avoidThis"],
    },
    weeklyReport: {
      type: "object",
      properties: {
        headline: { type: "string" }, pattern: { type: "string" }, change: { type: "string" }, nextWeek: { type: "string" },
      },
      required: ["headline", "pattern", "change", "nextWeek"],
    },
    storyGuidance: {
      type: "object",
      properties: { theme: { type: "string" }, goal: { type: "string" }, promptHint: { type: "string" } },
      required: ["theme", "goal", "promptHint"],
    },
  },
  required: ["actionCard", "weeklyReport", "storyGuidance"],
} as const;

export function isParentInsight(value: unknown): value is ParentInsight {
  if (!value || typeof value !== "object") return false;
  const v = value as ParentInsight;
  return [v.actionCard?.observation, v.actionCard?.action, v.actionCard?.sayThis, v.actionCard?.avoidThis,
    v.weeklyReport?.headline, v.weeklyReport?.pattern, v.weeklyReport?.change, v.weeklyReport?.nextWeek,
    v.storyGuidance?.theme, v.storyGuidance?.goal, v.storyGuidance?.promptHint].every((x) => typeof x === "string" && x.length > 0);
}

export function recentInsightSignals(library: SavedStory[], moods: Record<string, PetMood>, now = Date.now()): ParentInsightRequest {
  const end = localDateKey(now);
  const start = localDateKey(now - 6 * 24 * 60 * 60 * 1000);
  return {
    moods: Object.entries(moods).filter(([date, mood]) => date >= start && date <= end && MOODS.includes(mood)).map(([date, mood]) => ({ date, mood })),
    stories: library.filter((story) => {
      const date = localDateKey(story.createdAt);
      return date >= start && date <= end;
    }).slice(0, 8).map((story) => ({
      date: localDateKey(story.createdAt), title: story.title.slice(0, 100), situation: story.situation.slice(0, 200),
      choices: story.choices.slice(0, 2), memo: story.memo.trim().slice(0, 200) || undefined,
    })),
  };
}

export function buildRecentStoryContext(library: SavedStory[], moods: Record<string, PetMood>): string {
  const signals = recentInsightSignals(library, moods);
  const moodText = signals.moods.map((item) => `${item.date.slice(5)} ${item.mood}`).join(", ");
  const storyText = signals.stories.map((story) => {
    const choices = story.choices.map((choice) => `${choice.copingType}:${choice.text}`).join(" / ");
    return `${story.situation}${choices ? ` (${choices})` : ""}${story.memo ? `, 부모 메모: ${story.memo}` : ""}`;
  }).join(" | ");
  return [`최근 마음: ${moodText || "기록 없음"}`, `최근 이야기와 선택: ${storyText || "기록 없음"}`].join("\n").slice(0, 600);
}

export function cachedStoryGuidance(raw: string | null): string {
  if (!raw) return "";
  try {
    const guidance = (JSON.parse(raw) as { data?: ParentInsight }).data?.storyGuidance;
    if (!guidance) return "";
    return `AI 부모 리포트의 다음 동화 방향: ${guidance.theme} / ${guidance.goal} / ${guidance.promptHint}`.slice(0, 300);
  } catch {
    return "";
  }
}

type Obj = Record<string, unknown>;
const text = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";

export function parseParentInsightRequest(raw: unknown): ParentInsightRequest | string {
  if (!raw || typeof raw !== "object") return "요청 형식이 올바르지 않습니다.";
  const body = raw as Obj;
  if (!Array.isArray(body.moods) || body.moods.length > 7) return "moods는 최대 7개여야 합니다.";
  if (!Array.isArray(body.stories) || body.stories.length > 8) return "stories는 최대 8개여야 합니다.";

  const moods: ParentInsightRequest["moods"] = [];
  for (const item of body.moods) {
    const entry = (item ?? {}) as Obj;
    const date = text(entry.date, 10);
    const mood = entry.mood as PetMood;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !MOODS.includes(mood)) return "마음 기록 형식이 올바르지 않습니다.";
    moods.push({ date, mood });
  }

  const stories: InsightStorySignal[] = [];
  for (const item of body.stories) {
    const entry = (item ?? {}) as Obj;
    if (!Array.isArray(entry.choices) || entry.choices.length > 2) return "선택 기록 형식이 올바르지 않습니다.";
    const choices: ChosenChoice[] = [];
    for (const rawChoice of entry.choices) {
      const choice = (rawChoice ?? {}) as Obj;
      const copingType = choice.copingType as ChosenChoice["copingType"];
      if (!COPING_TYPES.includes(copingType)) return "대처 유형이 올바르지 않습니다.";
      choices.push({ prompt: text(choice.prompt, 100), text: text(choice.text, 60), copingType });
    }
    const date = text(entry.date, 10);
    const title = text(entry.title, 100);
    const situation = text(entry.situation, 200);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !title || !situation) return "동화 기록 형식이 올바르지 않습니다.";
    stories.push({ date, title, situation, choices, memo: text(entry.memo, 200) || undefined });
  }
  return { moods, stories };
}

export function fallbackParentInsight(input: ParentInsightRequest): ParentInsight {
  const latestMood = input.moods.at(-1)?.mood;
  const latestStory = input.stories[0];
  const focus = latestStory?.situation || (latestMood ? `${latestMood} 마음` : "오늘 있었던 일");
  return {
    actionCard: {
      observation: latestMood ? `최근 기록에서 ${latestMood} 마음이 보였어요. 한 가지 감정으로 단정하지 않고 아이의 말을 더 들어봐 주세요.` : "아직 마음 기록이 많지 않아요. 오늘 있었던 일을 편하게 들어보세요.",
      action: "잠들기 전 5분 동안 아이가 고른 한 장면을 함께 떠올려 보세요.",
      sayThis: `“${focus}에서 네 마음은 어땠어?”`,
      avoidThis: "“왜 그랬어?”처럼 이유를 바로 캐묻는 말은 잠시 미뤄 주세요.",
    },
    weeklyReport: {
      headline: "이번 주 마음을 천천히 모으는 중이에요",
      pattern: input.moods.length ? `${input.moods.length}번의 마음 기록과 ${input.stories.length}편의 이야기가 모였어요.` : "마음 스티커를 남기면 한 주의 흐름을 함께 살펴볼 수 있어요.",
      change: "기록만으로 원인을 단정하지 않고, 아이가 직접 들려주는 말을 중심으로 살펴봐 주세요.",
      nextWeek: "하루 한 번 ‘오늘 가장 기억나는 순간’을 물어보세요.",
    },
    storyGuidance: { theme: focus, goal: "자기 마음을 알아차리고 편하게 말해보기", promptHint: "주인공이 서두르지 않고 자기 방식으로 마음을 표현하는 사건을 넣는다." },
    fallback: true,
  };
}
