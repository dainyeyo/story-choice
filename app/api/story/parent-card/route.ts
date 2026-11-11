import { generateParentCard } from "@/lib/story/generate";
import { PARENT_CARD_SYSTEM_PROMPT, buildParentCardPrompt } from "@/lib/story/prompts";
import { parseParentCardRequest } from "@/lib/story/validate";

// POST /api/story/parent-card  — 아이의 선택을 인용한 부모 대화 카드
// body: { age, situation, protagonist?, title, choices: ChosenChoice[] }
// 응답: ParentCard { summary, questions[3]{text,hint}, answerTip } (lib/story/schema.ts)

export const maxDuration = 60;

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json({ error: "JSON 본문이 필요합니다." }, { status: 400 });
  }

  const parsed = parseParentCardRequest(raw);
  if (typeof parsed === "string") return Response.json({ error: parsed }, { status: 400 });

  try {
    return Response.json(await generateParentCard(PARENT_CARD_SYSTEM_PROMPT, buildParentCardPrompt(parsed)));
  } catch (e) {
    console.error("[/api/story/parent-card]", e);
    return Response.json({ error: "부모 카드를 만들지 못했어요. 잠시 후 다시 시도해 주세요." }, { status: 500 });
  }
}
