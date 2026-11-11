import type { PetMood } from "@/lib/pet";

// 마음친구 방에 쓰는 손그림풍 아이콘. 이모지 대신 같은 갈색 선과 납작한 색으로 통일한다.
const LINE = { fill: "none", stroke: "#5a3e28", strokeWidth: 2.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function MoodIcon({ mood, size = 30 }: { mood: PetMood; size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} {...LINE} aria-hidden>
      {mood === "기쁨" && <><circle cx="24" cy="24" r="9" fill="#f7b733" /><path d="M24 6v5M24 37v5M6 24h5M37 24h5M11 11l3.5 3.5M33.5 33.5L37 37M37 11l-3.5 3.5M14.5 33.5L11 37" /></>}
      {mood === "평온" && <><path d="M24 42V24" /><path d="M24 26C12 26 8 17 8 11c9 0 16 4 16 15z" fill="#79b36f" /><path d="M24 22c0-8 5-13 15-13 0 9-5 13-15 13z" fill="#9ccc86" /></>}
      {mood === "속상" && <><path d="M14 30a8 8 0 0 1 1-16 10 10 0 0 1 19 3 7 7 0 0 1-1 13z" fill="#cfe0f2" /><path d="M16 36l-2 5M25 36l-2 5M34 36l-2 5" stroke="#4f86c6" /></>}
      {mood === "용기" && <path d="M24 6l5.4 11.2 12.1 1.6-8.9 8.4 2.3 12.1L24 33.4 13.1 39.3l2.3-12.1-8.9-8.4 12.1-1.6z" fill="#f9cf4a" />}
      {mood === "두근" && <path d="M24 41C10 31 7 22 7 16.5A9 9 0 0 1 24 13a9 9 0 0 1 17 3.5C41 22 38 31 24 41z" fill="#f08aa0" />}
    </svg>
  );
}

export function FoodIcon() {
  return (
    <svg viewBox="0 0 64 56" width={68} height={60} {...LINE} aria-hidden>
      <path d="M10 30c2-9 8-14 22-14s20 5 22 14z" fill="#b9794a" />
      <circle cx="22" cy="24" r="3.2" fill="#d19a68" strokeWidth="2" />
      <circle cx="32" cy="21" r="3.2" fill="#d19a68" strokeWidth="2" />
      <circle cx="42" cy="24" r="3.2" fill="#d19a68" strokeWidth="2" />
      <path d="M32 6l1.8 3.6 4 .6-2.9 2.8.7 4L32 15l-3.6 1.9.7-4-2.9-2.8 4-.6z" fill="#f9cf4a" strokeWidth="1.8" />
      <path d="M6 30h52c0 11-8 19-26 19S6 41 6 30z" fill="#6fa8dc" />
      <path d="M14 38c4 3 9 4 14 4" stroke="#fff" strokeWidth="2.4" opacity=".8" />
      <path d="M18 51h28" />
    </svg>
  );
}

export function PetHandIcon() {
  return (
    <svg viewBox="0 0 64 56" width={68} height={60} {...LINE} aria-hidden>
      <g transform="rotate(-14 30 34)">
        <rect x="8" y="26" width="7" height="14" rx="3.5" transform="rotate(-35 11 33)" fill="#f8d3b0" />
        <rect x="15" y="14" width="7" height="22" rx="3.5" fill="#f8d3b0" />
        <rect x="23" y="10" width="7" height="25" rx="3.5" fill="#f8d3b0" />
        <rect x="31" y="13" width="7" height="22" rx="3.5" fill="#f8d3b0" />
        <rect x="39" y="18" width="6.5" height="17" rx="3.2" fill="#f8d3b0" />
        <path d="M15 33h30v3c0 9-6 14-15 14s-15-5-15-14z" fill="#f8d3b0" stroke="none" />
        <path d="M15 36c0 9 6 14 15 14s15-5 15-14" />
      </g>
      <path d="M48 12c-5-4-9-1-8 3 1 3 8 7 8 7s7-4 8-7c1-4-3-7-8-3z" fill="#f08aa0" transform="translate(-6 -4) scale(.8)" />
      <path d="M50 30c3 2 5 5 5 9M54 24c4 3 7 7 7 13" strokeWidth="2.2" stroke="#d99a6c" />
    </svg>
  );
}

export function StarJar() {
  return (
    <svg viewBox="0 0 48 56" width={54} height={62} {...LINE} aria-hidden>
      <rect x="15" y="5" width="18" height="6" rx="2" fill="#c89a62" />
      <path d="M14 11h20c5 3 7 7 7 13v20c0 5-3 8-8 8H15c-5 0-8-3-8-8V24c0-6 2-10 7-13z" fill="#e9f4fb" fillOpacity=".85" />
      <path d="M24 22l2.3 4.8 5.2.7-3.8 3.6 1 5.2-4.7-2.6-4.7 2.6 1-5.2-3.8-3.6 5.2-.7z" fill="#f9cf4a" strokeWidth="1.8" />
      <path d="M15 40l1.6 3.2M33 38l1.4 2.8" stroke="#f9cf4a" strokeWidth="3" />
    </svg>
  );
}
