import { generateParentCard } from "@/lib/story/generate";
import { PARENT_CARD_SYSTEM_PROMPT, buildParentCardPrompt } from "@/lib/story/prompts";
import { fallbackParentCard } from "@/lib/story/fallback";
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
    // 부모 카드는 템플릿으로 항상 만들 수 있다 (아이가 고른 선택을 그대로 끼워 넣는다)
    return Response.json(fallbackParentCard(parsed));
  }
}
