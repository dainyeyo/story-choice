import { generateSegment } from "@/lib/story/generate";
import { buildContinuePrompt } from "@/lib/story/prompts";
import { parseContinueRequest } from "@/lib/story/validate";

// POST /api/story/continue  — 아이의 선택을 반영해 이야기 이어쓰기
// body: { age, situation, durationMin, protagonist?, previousMemo?, title, scenesSoFar: string[], choices: ChosenChoice[] }
//  - choices가 1개면: 장면 1개 + 두 번째 선택을 돌려준다
//  - choices가 2개면: 결말 장면 1개를 돌려준다 (choice: null, isEnding: true)
// 응답: StorySegment (lib/story/schema.ts)

export const maxDuration = 60;

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json({ error: "JSON 본문이 필요합니다." }, { status: 400 });
  }

  const parsed = parseContinueRequest(raw);
  if (typeof parsed === "string") return Response.json({ error: parsed }, { status: 400 });

  try {
    return Response.json(await generateSegment(buildContinuePrompt(parsed)));
  } catch (e) {
    console.error("[/api/story/continue]", e);
    return Response.json({ error: "이야기를 이어가지 못했어요. 잠시 후 다시 시도해 주세요." }, { status: 500 });
  }
}
