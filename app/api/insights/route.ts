import { fallbackParentInsight, parseParentInsightRequest } from "@/lib/parentInsights";
import { generateParentInsight } from "@/lib/story/generate";
import { buildParentInsightPrompt, PARENT_INSIGHT_SYSTEM_PROMPT } from "@/lib/story/insight-prompts";

export const maxDuration = 60;

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json({ error: "JSON 본문이 필요합니다." }, { status: 400 });
  }
  const parsed = parseParentInsightRequest(raw);
  if (typeof parsed === "string") return Response.json({ error: parsed }, { status: 400 });

  try {
    return Response.json(await generateParentInsight(PARENT_INSIGHT_SYSTEM_PROMPT, buildParentInsightPrompt(parsed)));
  } catch (error) {
    console.error("[/api/insights]", error);
    return Response.json(fallbackParentInsight(parsed));
  }
}
