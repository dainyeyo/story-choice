// 사용자 설정 (글자 크기). 기기에 저장한다.
export type FontSize = "sm" | "md" | "lg" | "xl";

export interface Settings {
  fontSize: FontSize;
}

export const DEFAULT_SETTINGS: Settings = { fontSize: "md" };

// Tailwind가 클래스를 찾을 수 있게 전체 문자열로 적는다.
export const FONT_CLASS: Record<FontSize, string> = {
  sm: "text-[1.1rem] leading-[1.9] md:text-xl md:leading-[2]",
  md: "text-[1.35rem] leading-[1.9] md:text-2xl md:leading-[2]",
  lg: "text-[1.6rem] leading-[1.9] md:text-3xl md:leading-[2]",
  xl: "text-[1.9rem] leading-[1.8] md:text-4xl md:leading-[1.9]",
};

export function parseSettings(raw: string | null): Settings {
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const v = JSON.parse(raw);
    return v?.fontSize in FONT_CLASS ? { fontSize: v.fontSize } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}
