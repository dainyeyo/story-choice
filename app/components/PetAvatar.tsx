import type { CSSProperties } from "react";
import type { PetMood } from "@/lib/pet";

type PetSpriteStyle = CSSProperties & {
  "--pet-x": string;
  "--pet-rest-y": string;
  "--pet-blink-y": string;
};

export default function PetAvatar({ stage, mood, action, className = "" }: {
  stage: number;
  mood?: PetMood;
  action?: "fed" | "petted";
  className?: string;
}) {
  const column = Math.min(Math.max(stage, 0), 4);
  const x = column * 25;
  // 파란 마음몽만 눈을 감은 프레임과 뜬 프레임의 줄 순서가 반대다.
  const restRow = column === 4 ? 100 : 0;
  const blinkRow = column === 4 ? 0 : 100;
  const spriteStyle: PetSpriteStyle = {
    "--pet-x": `${x}%`,
    "--pet-rest-y": `${restRow}%`,
    "--pet-blink-y": `${blinkRow}%`,
  };

  return (
    <span role="img" aria-label={`성장 ${column + 1}단계 마음 친구${mood ? `, 오늘 마음 ${mood}` : ""}`} className={`pet-sprite relative block aspect-square overflow-hidden ${className}`}>
      <span aria-hidden className="pet-sprite-frame pet-sprite-animated absolute inset-0" style={spriteStyle} />
      {mood === "용기" && <span aria-hidden className="absolute right-[13%] top-[14%] text-2xl text-amber-500">✦</span>}
      {mood === "속상" && <span aria-hidden className="absolute right-[14%] top-[13%] text-xl">💧</span>}
      {mood === "두근" && <span aria-hidden className="absolute right-[12%] top-[12%] text-2xl">💗</span>}
      {mood === "기쁨" && <span aria-hidden className="absolute right-[14%] top-[12%] text-2xl">✦</span>}
      {action === "fed" && <span aria-hidden className="absolute bottom-[12%] right-[8%] text-3xl">🍪</span>}
      {action === "petted" && <span aria-hidden className="absolute right-[12%] top-[9%] text-2xl">💗</span>}
    </span>
  );
}
