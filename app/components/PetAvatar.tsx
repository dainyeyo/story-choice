import type { PetMood } from "@/lib/pet";

export default function PetAvatar({ stage, mood, action, className = "" }: {
  stage: number;
  mood?: PetMood;
  action?: "fed" | "petted";
  className?: string;
}) {
  const column = Math.min(Math.max(stage, 0), 4);
  // 넓은 참조 스프라이트에서 초록·파랑 몽의 그림이 격자 경계를 넘어와서
  // 두 프레임은 각각 보정된 위치와 폭으로 잘라 옆 캐릭터가 비치지 않게 한다.
  const x = [0, 25, 50, 71, 100][column];
  const backgroundSize = column === 4 ? "425% 200%" : undefined;
  const animation = <span aria-hidden className="pet-sprite-frame absolute inset-0" style={{ backgroundPosition: `${x}% 0%`, backgroundSize }} />;
  const blink = <span aria-hidden className="pet-sprite-frame pet-sprite-blink absolute inset-0" style={{ backgroundPosition: `${x}% 100%`, backgroundSize }} />;

  return (
    <span role="img" aria-label={`성장 ${column + 1}단계 마음 친구${mood ? `, 오늘 마음 ${mood}` : ""}`} className={`pet-sprite relative block aspect-[1.1/1] overflow-hidden ${className}`}>
      {animation}{blink}
      {mood === "용기" && <span aria-hidden className="absolute right-[13%] top-[14%] text-2xl text-amber-500">✦</span>}
      {mood === "속상" && <span aria-hidden className="absolute right-[14%] top-[13%] text-xl">💧</span>}
      {mood === "두근" && <span aria-hidden className="absolute right-[12%] top-[12%] text-2xl">💗</span>}
      {mood === "기쁨" && <span aria-hidden className="absolute right-[14%] top-[12%] text-2xl">✦</span>}
      {action === "fed" && <span aria-hidden className="absolute bottom-[12%] right-[8%] text-3xl">🍪</span>}
      {action === "petted" && <span aria-hidden className="absolute right-[12%] top-[9%] text-2xl">💗</span>}
    </span>
  );
}
