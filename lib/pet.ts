export type PetMood = "기쁨" | "평온" | "속상" | "용기" | "두근";

export interface PetState {
  name: string;
  bornAt: number;
  careDates: string[];
  fedDates: string[];
  pettedDates: string[];
  moods: Record<string, PetMood>;
}

export const PET_STAGES = [
  { name: "알몽", days: 0, message: "아직 수줍은 작은 마음 알이에요" },
  { name: "콩몽", days: 14, message: "세상 구경을 시작한 아기 몽이에요" },
  { name: "말랑몽", days: 60, message: "표정이 제법 풍부해졌어요" },
  { name: "포근몽", days: 180, message: "곁을 포근히 지켜주는 친구예요" },
  { name: "마음몽", days: 365, message: "마음을 함께 나누는 오래된 친구예요" },
] as const;

export function localDateKey(time = Date.now()) {
  const d = new Date(time);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function defaultPet(): PetState {
  return { name: "몽이", bornAt: Date.now(), careDates: [], fedDates: [], pettedDates: [], moods: {} };
}

export function parsePet(raw: string | null): PetState {
  if (!raw) return defaultPet();
  try {
    const value = JSON.parse(raw) as Partial<PetState>;
    return {
      name: typeof value.name === "string" && value.name.trim() ? value.name.slice(0, 10) : "몽이",
      bornAt: typeof value.bornAt === "number" ? value.bornAt : Date.now(),
      careDates: Array.isArray(value.careDates) ? value.careDates.filter((x): x is string => typeof x === "string") : [],
      fedDates: Array.isArray(value.fedDates) ? value.fedDates.filter((x): x is string => typeof x === "string") : [],
      pettedDates: Array.isArray(value.pettedDates) ? value.pettedDates.filter((x): x is string => typeof x === "string") : [],
      moods: value.moods && typeof value.moods === "object" ? value.moods as Record<string, PetMood> : {},
    };
  } catch {
    return defaultPet();
  }
}

export function petStage(careDays: number) {
  let index = 0;
  for (let i = 1; i < PET_STAGES.length; i += 1) {
    if (careDays >= PET_STAGES[i].days) index = i;
  }
  return { index, ...PET_STAGES[index] };
}

export function nextPetStage(careDays: number) {
  return PET_STAGES.find((stage) => stage.days > careDays) ?? null;
}
