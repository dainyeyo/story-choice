import { isTtsVoice, TTS_VOICES } from "@/lib/tts";

export const runtime = "nodejs";

const MAX_TEXT_LENGTH = 12_000;
const RATE_VALUES = [0.7, 0.9, 1.1] as const;

function escapeXml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function POST(request: Request) {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) {
    return Response.json({ error: "Azure Speech 키와 지역을 서버 환경 변수에 설정해 주세요." }, { status: 503 });
  }

  if (!/^[a-z0-9]+$/.test(region)) {
    return Response.json({ error: "AZURE_SPEECH_REGION 값이 올바르지 않습니다." }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return Response.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const { text, voice, rate } = body as { text?: unknown; voice?: unknown; rate?: unknown };
  if (typeof text !== "string" || !text.trim() || text.length > MAX_TEXT_LENGTH) {
    return Response.json({ error: `읽을 내용은 1자 이상 ${MAX_TEXT_LENGTH.toLocaleString()}자 이하여야 합니다.` }, { status: 400 });
  }
  if (!isTtsVoice(voice)) {
    return Response.json({ error: "현수 또는 선희 음성만 선택할 수 있습니다." }, { status: 400 });
  }
  if (typeof rate !== "number" || !RATE_VALUES.includes(rate as (typeof RATE_VALUES)[number])) {
    return Response.json({ error: "읽기 속도 값이 올바르지 않습니다." }, { status: 400 });
  }

  const relativeRate = `${Math.round((rate - 1) * 100)}%`;
  const voiceId = TTS_VOICES[voice].id;
  const ssml = `<speak version="1.0" xml:lang="ko-KR"><voice name="${voiceId}"><prosody rate="${relativeRate}">${escapeXml(text.trim())}</prosody></voice></speak>`;

  let upstream: Response;
  try {
    upstream = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
        "User-Agent": "PictoryStoryChoice",
      },
      body: ssml,
      signal: request.signal,
      cache: "no-store",
    });
  } catch {
    return Response.json({ error: "음성 서비스에 연결하지 못했어요. 잠시 후 다시 시도해 주세요." }, { status: 502 });
  }

  if (!upstream.ok) {
    const status = upstream.status === 429 ? 429 : 502;
    return Response.json(
      { error: status === 429 ? "음성 요청이 잠시 몰렸어요. 잠시 후 다시 시도해 주세요." : "음성을 만들지 못했어요. Azure Speech 설정을 확인해 주세요." },
      { status },
    );
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
