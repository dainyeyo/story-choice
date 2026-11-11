import type { PetMood } from "@/lib/pet";

const COLORS = ["#f7d98b", "#f7c7a3", "#efb7bc", "#bfcf9b", "#a9c9cf"];

export default function PetAvatar({ stage, mood, action, className = "" }: {
  stage: number;
  mood?: PetMood;
  action?: "fed" | "petted";
  className?: string;
}) {
  const color = COLORS[Math.min(stage, COLORS.length - 1)];
  const sad = mood === "속상";
  const brave = mood === "용기";
  const happy = mood === "기쁨" || action === "fed" || action === "petted";
  const bodyY = stage === 0 ? 60 : 47;

  return (
    <svg viewBox="0 0 240 210" role="img" aria-label={`성장 ${stage + 1}단계 2D 마음 펫`} className={className}>
      <ellipse cx="120" cy="184" rx="67" ry="10" fill="#5f503c" opacity=".1" />
      {stage === 0 ? (
        <>
          <path d="M74 150C65 113 77 61 120 42c43 19 55 71 46 108-7 28-30 37-46 37s-39-9-46-37Z" fill={color} />
          <path d="m88 74 21 18 15-25 18 22 13-14" fill="none" stroke="#b4803d" strokeWidth="5" strokeLinecap="round" />
        </>
      ) : (
        <>
          {stage >= 3 && <path d="M67 96c-27-30-38 5-17 21 10 8 22 9 31 5" fill="#fff1c9" stroke="#725d4d" strokeWidth="3" />}
          <path d={`M62 145C62 87 83 ${bodyY} 120 ${bodyY}s58 40 58 98c0 32-23 43-58 43s-58-11-58-43Z`} fill={color} stroke="#725d4d" strokeWidth="3" />
          {stage >= 2 && <><circle cx="78" cy="133" r="9" fill="#ef8e93" opacity=".55" /><circle cx="162" cy="133" r="9" fill="#ef8e93" opacity=".55" /></>}
          {stage >= 3 && <path d="M85 57c9-19 25-27 35-7 10-20 27-12 35 7-12 9-23 12-35 9-12 3-23 0-35-9Z" fill="#fff1c9" stroke="#725d4d" strokeWidth="3" />}
          {stage >= 4 && <path d="M100 175c12-12 28-12 40 0" fill="none" stroke="#fff7e8" strokeWidth="8" strokeLinecap="round" />}
        </>
      )}
      <g fill="none" stroke="#4d4037" strokeWidth="4" strokeLinecap="round">
        {happy ? <><path d="m91 116 7 6 7-6" /><path d="m135 116 7 6 7-6" /></> : <><path d="M96 117v3" /><path d="M144 117v3" /></>}
        {sad ? <path d="M111 143q9-8 18 0" /> : <path d={brave ? "M109 139h22" : "M111 137q9 10 18 0"} />}
      </g>
      {mood === "두근" && <><path d="M176 71c8-14 25-3 17 8l-17 16-17-16c-8-11 9-22 17-8Z" fill="#ef8e93" /><path d="M55 89c5-9 16-2 11 5l-11 10-11-10c-5-7 6-14 11-5Z" fill="#ef8e93" /></>}
      {action === "fed" && <g><ellipse cx="190" cy="153" rx="22" ry="12" fill="#fffdf8" stroke="#725d4d" strokeWidth="3" /><circle cx="184" cy="148" r="4" fill="#db8b50" /><circle cx="196" cy="151" r="4" fill="#db8b50" /></g>}
      {action === "petted" && <path d="M62 57c7-13 22-3 15 8L62 79 47 65c-7-11 8-21 15-8Z" fill="#ef8e93" />}
    </svg>
  );
}
