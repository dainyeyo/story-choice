export const TTS_VOICES = {
  hyunsu: {
    id: "ko-KR-HyunsuMultilingualNeural",
    label: "현수 · 남자",
  },
  sunhi: {
    id: "ko-KR-SunHiNeural",
    label: "선히 · 여자",
  },
} as const;

export type TtsVoice = keyof typeof TTS_VOICES;

export const DEFAULT_TTS_VOICE: TtsVoice = "sunhi";

export function isTtsVoice(value: unknown): value is TtsVoice {
  return typeof value === "string" && Object.hasOwn(TTS_VOICES, value);
}
