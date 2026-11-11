// 내 서재: 끝까지 읽은 동화를 기기에 저장한 기록.
import type { ChosenChoice, ParentCard } from "@/lib/story/schema";

export interface SavedStory {
  id: string;
  createdAt: number; // ms
  title: string;
  situation: string;
  age: number;
  protagonist?: string;
  scenes: string[];
  choices: ChosenChoice[];
  card: ParentCard;
  memo: string; // 부모가 남긴 한 줄 메모 (없으면 "")
}

export function parseLibrary(raw: string | null): SavedStory[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? (v as SavedStory[]) : [];
  } catch {
    return [];
  }
}
