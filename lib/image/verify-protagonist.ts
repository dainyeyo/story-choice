import { GoogleGenAI, ThinkingLevel } from "@google/genai";

export type ProtagonistCheck = "pass" | "fail" | "unchecked";

const MODEL = process.env.GEMINI_VISION_MODEL || process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

const schema = {
  type: "object",
  properties: { present: { type: "boolean" } },
  required: ["present"],
} as const;

// Asks a vision model whether the child's drawn character actually appears in the
// generated page. Image models sometimes ignore the reference and invent a new hero.
// Fails open ("unchecked") when the checker is unavailable so pages are never blocked.
export async function checkProtagonist(reference: Buffer, page: Buffer, pageMime: string, signal?: AbortSignal): Promise<ProtagonistCheck> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return "unchecked";
  try {
    const ai = new GoogleGenAI({ apiKey });
    const res = await ai.models.generateContent({
      model: MODEL,
      contents: [{
        role: "user",
        parts: [
          { text: "Image A is a child's drawing of a story's main character." },
          { inlineData: { mimeType: "image/png", data: reference.toString("base64") } },
          { text: "Image B is a storybook illustration that should show that same character." },
          { inlineData: { mimeType: pageMime, data: page.toString("base64") } },
          { text: "Is the character from image A clearly drawn in image B as the main figure? It counts if it is the same kind of creature or figure with the same main colours and distinctive features, even in a different pose, expression or a more polished style. It does NOT count if image B instead shows a different hero (for example a human child, or a different animal or colour). Answer as JSON." },
        ],
      }],
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: schema,
        temperature: 0,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        httpOptions: { timeout: 10000 },
        abortSignal: signal,
      },
    });
    const parsed = JSON.parse(res.text ?? "") as { present?: unknown };
    return typeof parsed.present === "boolean" ? (parsed.present ? "pass" : "fail") : "unchecked";
  } catch (error) {
    if (signal?.aborted) throw error;
    console.warn("protagonist_check_unavailable", { message: error instanceof Error ? error.message : String(error) });
    return "unchecked";
  }
}
