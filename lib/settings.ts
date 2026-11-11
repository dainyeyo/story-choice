import { DEFAULT_TTS_VOICE, isTtsVoice, type TtsVoice } from "@/lib/tts";

// 사용자 설정을 기기에 저장한다.
export type FontSize = "sm" | "md" | "lg" | "xl";

export interface Settings {
  fontSize: FontSize;
  ttsVoice: TtsVoice;
}

export const DEFAULT_SETTINGS: Settings = { fontSize: "md", ttsVoice: DEFAULT_TTS_VOICE };

// Tailwind가 클래스를 찾을 수 있게 전체 문자열로 적는다.
export const FONT_CLASS: Record<FontSize, string> = {
  sm: "text-base leading-[1.8] md:text-lg md:leading-[1.85]",
  md: "text-xl leading-[1.8] md:text-xl md:leading-[1.85]",
  lg: "text-2xl leading-[1.8] md:text-2xl md:leading-[1.85]",
  xl: "text-[1.7rem] leading-[1.8] md:text-3xl md:leading-[1.85]",
};

export function parseSettings(raw: string | null): Settings {
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const v = JSON.parse(raw);
    return {
      fontSize: typeof v?.fontSize === "string" && v.fontSize in FONT_CLASS ? v.fontSize : DEFAULT_SETTINGS.fontSize,
      ttsVoice: isTtsVoice(v?.ttsVoice) ? v.ttsVoice : DEFAULT_SETTINGS.ttsVoice,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
