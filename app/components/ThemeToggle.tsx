"use client";

// 다크(밤하늘) / 라이트(종이) 전환 버튼. 로그인한 사용자의 계정에 저장한다.

import { useEffect, useSyncExternalStore } from "react";
import { useStored, writeRaw } from "@/lib/localStore";
import { useAuth } from "../providers";
import Icon from "./Icon";

type Theme = "dark" | "light";

const listeners = new Set<() => void>();
const read = (): Theme => (document.documentElement.dataset.theme === "light" ? "light" : "dark");

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

let fadeTimer: number | undefined;

function setTheme(t: Theme, key: string) {
  const root = document.documentElement;
  // 전환하는 동안만 글자·메뉴 색도 하늘과 같은 속도로 바뀌게 한다 (globals.css의 .theme-fade)
  root.classList.add("theme-fade");
  window.clearTimeout(fadeTimer);
  fadeTimer = window.setTimeout(() => root.classList.remove("theme-fade"), 1900);
  // 해와 달이 동쪽에서 떠서 서쪽으로 지도록 회전 횟수를 음의 방향으로 계속 늘린다.
  const spin = Number(root.style.getPropertyValue("--sky-spin")) || (root.dataset.theme === "light" ? -1 : 0);
  root.style.setProperty("--sky-spin", String(spin - 1));
  root.dataset.theme = t;
  writeRaw(key, t);
  listeners.forEach((l) => l());
}

export default function ThemeToggle() {
  const { user } = useAuth();
  const themeKey = `story-choice:theme:${user ?? "guest"}`;
  const savedTheme = useStored(themeKey);
  const theme = useSyncExternalStore(subscribe, read, () => "dark" as Theme);
  useEffect(() => {
    if (savedTheme === "light" || savedTheme === "dark") {
      document.documentElement.dataset.theme = savedTheme;
      listeners.forEach((listener) => listener());
    }
  }, [savedTheme]);
  const toLight = theme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(toLight ? "light" : "dark", themeKey)}
      aria-label={toLight ? "라이트 모드로 바꾸기" : "다크 모드로 바꾸기"}
      title={toLight ? "라이트 모드" : "다크 모드"}
      className="calm inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-sky-ink-2 hover:bg-chrome-hover hover:text-sky-ink"
    >
      <Icon name={toLight ? "sun" : "moon"} size={20} />
    </button>
  );
}
