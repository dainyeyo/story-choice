import { generateSegment } from "@/lib/story/generate";
import { buildStartPrompt } from "@/lib/story/prompts";
import type { StoryRequest } from "@/lib/story/schema";

// POST /api/story  — 이야기 시작 (장면 + 첫 선택)
// body: { age, situation, durationMin, protagonist?, previousMemo? }
// 응답: StorySegment (lib/story/schema.ts)

export const maxDuration = 60;

function parseBody(raw: unknown): StoryRequest | string {
  if (!raw || typeof raw !== "object") return "요청 형식이 올바르지 않습니다.";
  const b = raw as Record<string, unknown>;

  const age = Number(b.age);
  if (!Number.isInteger(age) || age < 4 || age > 7) return "age는 4~7 사이 정수여야 합니다.";

  const situation = typeof b.situation === "string" ? b.situation.trim() : "";
  if (!situation) return "situation(고민 상황)이 필요합니다.";
  if (situation.length > 200) return "situation은 200자 이하여야 합니다.";

  const durationMin = Number(b.durationMin);
  if (durationMin !== 3 && durationMin !== 5) return "durationMin은 3 또는 5여야 합니다.";

  const protagonist = typeof b.protagonist === "string" ? b.protagonist.trim().slice(0, 50) : undefined;
  const previousMemo = typeof b.previousMemo === "string" ? b.previousMemo.trim().slice(0, 200) : undefined;

  return { age, situation, durationMin, protagonist, previousMemo };
}

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json({ error: "JSON 본문이 필요합니다." }, { status: 400 });
  }

  const parsed = parseBody(raw);
  if (typeof parsed === "string") return Response.json({ error: parsed }, { status: 400 });

  try {
    const segment = await generateSegment(buildStartPrompt(parsed));
    return Response.json(segment);
  } catch (e) {
    console.error("[/api/story]", e);
    return Response.json({ error: "이야기를 만들지 못했어요. 잠시 후 다시 시도해 주세요." }, { status: 500 });
  }
}
