"use client";

// 브라우저 localStorage를 React에서 안전하게 읽고 쓰는 도구.
// - 서버 렌더/첫 하이드레이션 때는 null (= 아직 모름), 클라이언트가 준비되면 문자열("" 이면 값 없음)
// - 쓰면 같은 탭의 구독자에게도 바로 알려준다.

import { useSyncExternalStore } from "react";

const EVT = "story-choice:store";

function subscribe(cb: () => void) {
  window.addEventListener(EVT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function readRaw(key: string): string {
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

export function writeRaw(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
    window.dispatchEvent(new Event(EVT));
  } catch {
    /* 저장에 실패해도 진행은 가능하다 */
  }
}

export function removeKey(key: string) {
  try {
    localStorage.removeItem(key);
    window.dispatchEvent(new Event(EVT));
  } catch {
    /* ignore */
  }
}

/** key의 문자열 값을 구독한다. 서버/하이드레이션 중에는 null. */
export function useStored(key: string): string | null {
  return useSyncExternalStore(
    subscribe,
    () => readRaw(key),
    () => null,
  );
}
