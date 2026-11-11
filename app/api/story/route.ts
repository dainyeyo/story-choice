import { generateSegment } from "@/lib/story/generate";
import { buildStartPrompt } from "@/lib/story/prompts";
import { parseStoryRequest } from "@/lib/story/validate";

// POST /api/story  — 이야기 시작 (장면 + 첫 선택)
// body: { age, situation, durationMin, protagonist?, previousMemo? }
// 응답: StorySegment (lib/story/schema.ts)

export const maxDuration = 60;

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json({ error: "JSON 본문이 필요합니다." }, { status: 400 });
  }

  const parsed = parseStoryRequest(raw);
  if (typeof parsed === "string") return Response.json({ error: parsed }, { status: 400 });

  try {
    return Response.json(await generateSegment(buildStartPrompt(parsed)));
  } catch (e) {
    console.error("[/api/story]", e);
    return Response.json({ error: "이야기를 만들지 못했어요. 잠시 후 다시 시도해 주세요." }, { status: 500 });
  }
}
