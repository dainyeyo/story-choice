"use client";

// 다크(밤하늘) / 라이트(종이) 전환 버튼. 고른 값은 이 기기에 저장된다.
// 첫 화면이 깜빡이지 않도록 저장된 값은 layout.tsx의 작은 스크립트가 먼저 html에 적용해 둔다.

import { useSyncExternalStore } from "react";
import Icon from "./Icon";

export const THEME_KEY = "story-choice:theme";
type Theme = "dark" | "light";

const listeners = new Set<() => void>();
const read = (): Theme => (document.documentElement.dataset.theme === "light" ? "light" : "dark");

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

let fadeTimer: number | undefined;

function setTheme(t: Theme) {
  const root = document.documentElement;
  // 전환하는 동안만 글자·메뉴 색도 하늘과 같은 속도로 바뀌게 한다 (globals.css의 .theme-fade)
  root.classList.add("theme-fade");
  window.clearTimeout(fadeTimer);
  fadeTimer = window.setTimeout(() => root.classList.remove("theme-fade"), 1900);
  // 해와 달이 늘 같은 방향으로만 돌도록 회전 횟수를 계속 늘린다 (globals.css의 --sky-spin)
  const spin = Number(root.style.getPropertyValue("--sky-spin")) || (root.dataset.theme === "light" ? 1 : 0);
  root.style.setProperty("--sky-spin", String(spin + 1));
  root.dataset.theme = t;
  try {
    localStorage.setItem(THEME_KEY, t);
  } catch {
    // 저장이 막혀 있어도 이번 화면에서는 바뀐다
  }
  listeners.forEach((l) => l());
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, read, () => "dark" as Theme);
  const toLight = theme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(toLight ? "light" : "dark")}
      aria-label={toLight ? "라이트 모드로 바꾸기" : "다크 모드로 바꾸기"}
      title={toLight ? "라이트 모드" : "다크 모드"}
      className="calm inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-sky-ink-2 hover:bg-chrome-hover hover:text-sky-ink"
    >
      <Icon name={toLight ? "sun" : "moon"} size={20} />
    </button>
  );
}
