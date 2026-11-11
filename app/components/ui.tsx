import type { ReactNode } from "react";

// 화면 공통 조각들. 반경은 크기에 따라: 입력·버튼 12, 카드 16, 안쪽 항목 8.

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(59,47,37,0.05)] ${className}`}>
      {children}
    </div>
  );
}

export function PageHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <header className="space-y-1">
      <h1 className="story text-3xl leading-tight text-sky-ink md:text-4xl">{title}</h1>
      {sub && <p className="text-[15px] text-sky-ink-2">{sub}</p>}
    </header>
  );
}

// onSky: 카드 안이 아니라 밤하늘/종이 배경 위에 바로 놓일 때 쓴다 (다크 모드에서 흰 글씨)
export function Label({ children, onSky = false }: { children: ReactNode; onSky?: boolean }) {
  return <span className={`text-sm font-medium ${onSky ? "text-sky-ink" : "text-ink"}`}>{children}</span>;
}

export const btnPrimary =
  "calm inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 text-base font-medium text-ink hover:bg-accent-hover active:translate-y-px disabled:opacity-40";

export const btnSecondary =
  "calm inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 text-base text-ink hover:bg-sunk active:translate-y-px disabled:opacity-40";

export const btnIcon =
  "calm inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-ink-2 hover:bg-sunk hover:text-ink disabled:opacity-40";

export const inputCls =
  "calm w-full rounded-xl border border-line bg-surface px-3 py-3 text-base text-ink placeholder:text-ink-3 focus:border-accent-text";

export const noteCls = "rounded-xl bg-sunk px-4 py-3 text-[15px] text-ink-2";

export const errorCls = "rounded-xl border border-danger/30 bg-[#fdf1ef] px-4 py-3 text-[15px] text-danger";

export function chipCls(active: boolean) {
  return `calm h-10 rounded-lg border px-3 text-[15px] ${
    active ? "border-accent bg-[#fdf0d2] text-ink" : "border-line bg-surface text-ink-2 hover:bg-sunk"
  }`;
}

export function Segmented<T extends string | number>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex gap-1 rounded-xl bg-sunk p-1">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={`calm h-10 min-w-10 rounded-lg px-3 text-[15px] ${
              on ? "bg-surface font-medium text-ink shadow-[0_1px_2px_rgba(59,47,37,0.08)]" : "text-ink-2 hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// 부모 카드와 서재에서만 보여주는 대처 유형 이름 (아이 화면에는 보이지 않는다)
export const COPING_NAME: Record<string, string> = {
  도움요청: "도움 요청하기",
  스스로진정: "스스로 진정하기",
  회피: "피하기",
  직면: "맞서기",
};
