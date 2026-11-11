import type { PetMood } from "@/lib/pet";

// 사용자가 고른 성장 콘셉트 원본 한 장에서 각 단계만 보이도록 배치한다.
const STAGE_IMAGE = [
  { x: 21, y: -148, width: 1195, height: 398 },
  { x: -145, y: -134, width: 1129, height: 376 },
  { x: -271, y: -101, width: 1043, height: 348 },
  { x: -382, y: -63, width: 869, height: 290 },
  { x: -500, y: -28, width: 760, height: 253 },
] as const;

export default function PetAvatar({ stage, mood, action, className = "" }: {
  stage: number;
  mood?: PetMood;
  action?: "fed" | "petted";
  className?: string;
}) {
  const image = STAGE_IMAGE[Math.min(Math.max(stage, 0), STAGE_IMAGE.length - 1)];

  return (
    <svg viewBox="0 0 240 210" role="img" aria-label={`성장 ${stage + 1}단계 마음 친구`} className={className}>
      <defs><clipPath id={`pet-stage-${stage}`}><rect width="240" height="210" rx="24" /></clipPath></defs>
      <g clipPath={`url(#pet-stage-${stage})`}>
        <image href="/pet-growth.png" {...image} preserveAspectRatio="none" />
      </g>
      {mood === "용기" && <path d="m202 34 4 8 9 1-7 6 2 9-8-4-8 4 2-9-7-6 9-1Z" fill="#e5a90b" />}
      {mood === "속상" && <path d="M201 38c10 14 12 18 12 24a12 12 0 0 1-24 0c0-6 3-11 12-24Z" fill="#79aee8" opacity=".8" />}
      {mood === "두근" && <path d="M199 44c8-14 25-3 17 8l-17 16-17-16c-8-11 9-22 17-8Z" fill="#ef8e93" />}
      {mood === "평온" && <path d="M196 64c-8-20 5-31 22-30-1 17-8 29-22 30Zm0 0-7 9" fill="#a8c879" stroke="#779758" strokeWidth="2" strokeLinecap="round" />}
      {mood === "기쁨" && <g fill="#e5a90b"><circle cx="202" cy="43" r="8" /><path d="M202 27v-8M202 67v-8M186 43h-8M226 43h-8" stroke="#e5a90b" strokeWidth="3" strokeLinecap="round" /></g>}
      {action === "fed" && <g><ellipse cx="202" cy="177" rx="25" ry="13" fill="#fffdf8" stroke="#806958" strokeWidth="3" /><circle cx="195" cy="171" r="4" fill="#db8b50" /><circle cx="208" cy="173" r="4" fill="#db8b50" /></g>}
      {action === "petted" && <path d="M39 40c8-14 25-3 17 8L39 64 22 48c-8-11 9-22 17-8Z" fill="#ef8e93" />}
    </svg>
  );
}
