export interface CreateDraft {
  age: number;
  situation: string;
  lengthMode: "auto" | "custom";
  durationText: string;
  protagonist: string;
  sketchDataUrl: string;
  customSituation: string;
}

export const EMPTY_CREATE_DRAFT: CreateDraft = {
  age: 5,
  situation: "",
  lengthMode: "auto",
  durationText: "5",
  protagonist: "",
  sketchDataUrl: "",
  customSituation: "",
};

export function parseCreateDraft(raw: string | null): CreateDraft | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<CreateDraft>;
    if (
      typeof value.age !== "number" || typeof value.situation !== "string" ||
      (value.lengthMode !== "auto" && value.lengthMode !== "custom") ||
      typeof value.durationText !== "string" || typeof value.protagonist !== "string" ||
      typeof value.sketchDataUrl !== "string" || typeof value.customSituation !== "string"
    ) return null;
    return value as CreateDraft;
  } catch {
    return null;
  }
}

export function hasCreateDraft(draft: CreateDraft | null) {
  return Boolean(draft && (
    draft.age !== EMPTY_CREATE_DRAFT.age || draft.situation.trim() ||
    draft.lengthMode !== EMPTY_CREATE_DRAFT.lengthMode || draft.durationText !== EMPTY_CREATE_DRAFT.durationText ||
    draft.protagonist.trim() || draft.sketchDataUrl || draft.customSituation.trim()
  ));
}
