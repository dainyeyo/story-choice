import type { ReactNode } from "react";

// 화면 공통 조각들

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl bg-white/90 p-5 shadow-md ring-1 ring-amber-200/60 ${className}`}>{children}</div>;
}

export function Title({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div className="text-center">
      <h1 className="font-[family-name:var(--font-story)] text-3xl text-amber-800">{children}</h1>
      {sub && <p className="mt-1 text-sm text-amber-800/70">{sub}</p>}
    </div>
  );
}

export const bigBtn =
  "block w-full rounded-2xl bg-amber-500 px-5 py-4 text-center text-lg font-bold text-white shadow-md transition active:scale-[0.98] disabled:opacity-40";

export const softBtn =
  "rounded-2xl bg-amber-100 px-4 py-3 font-bold text-amber-800 transition active:scale-[0.98] disabled:opacity-40";

export const inputCls =
  "w-full rounded-2xl bg-amber-50 p-3 text-base ring-1 ring-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400";

export function chip(active: boolean) {
  return `rounded-full px-4 py-2 text-base ring-1 transition ${
    active ? "bg-amber-500 text-white ring-amber-500" : "bg-amber-50 text-amber-900 ring-amber-200"
  }`;
}

export const COPING_LABEL: Record<string, string> = {
  도움요청: "🤝",
  스스로진정: "🌿",
  회피: "🙈",
  직면: "💪",
};
