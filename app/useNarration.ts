"use client";

// 낭독(TTS) 훅. 브라우저 내장 Web Speech API를 쓴다. (0원, 서버 필요 없음)
// 화면(목업)은 이 훅의 값과 함수만 연결하면 된다.
//
//   const n = useNarration();
//   n.available        이 기기에서 한국어 낭독을 쓸 수 있으면 true.
//                      false면 낭독 버튼을 숨기고 "부모가 직접 읽어주세요" 안내를 보여준다.
//   n.speaking         읽는 중이면 true
//   n.speak(text)      text(문자열 또는 문자열 배열)를 처음부터 읽는다. 읽던 것은 멈춘다.
//   n.stop()           멈춘다
//   n.rate / n.setRate 읽는 속도 (0.6 ~ 1.2, 기본 0.9: 아이에게 조금 천천히)
//
// 주의: 한국어 음성은 기기마다 다르다. 어떤 기기에는 아예 없다. 시연 기기에서 꼭 한 번 들어볼 것.
// 브라우저는 사용자가 버튼을 누른 뒤에만 소리를 낸다. 장면이 바뀔 때 저절로 읽게 만들 수는 없다.

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

const supported = () => typeof window !== "undefined" && "speechSynthesis" in window;

// 음성 목록은 처음에 비어 있다가 나중에 채워진다(voiceschanged). 한국어 음성 개수를 구독한다.
function subscribeVoices(cb: () => void) {
  if (!supported()) return () => {};
  speechSynthesis.addEventListener("voiceschanged", cb);
  return () => speechSynthesis.removeEventListener("voiceschanged", cb);
}
const koVoiceCount = () => (supported() ? speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("ko")).length : 0);

function pickVoice(): SpeechSynthesisVoice | undefined {
  const ko = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("ko"));
  // 자연스러운 음성을 우선한다 (이름은 기기마다 다르므로 못 찾으면 첫 번째 한국어 음성)
  return ko.find((v) => /natural|online|google|sun-?hi|heami|yuna|seoyeon/i.test(v.name)) ?? ko[0];
}

// 긴 글을 한꺼번에 읽으면 일부 브라우저(Chrome)가 중간에 끊긴다. 문장 단위로 나눠 차례로 읽힌다.
function toChunks(texts: string[]): string[] {
  const out: string[] = [];
  for (const t of texts) {
    const sentences = t.split(/(?<=[.!?…])\s+/).map((s) => s.trim()).filter(Boolean);
    let cur = "";
    for (const s of sentences) {
      if (cur && (cur + " " + s).length > 90) {
        out.push(cur);
        cur = s;
      } else {
        cur = cur ? `${cur} ${s}` : s;
      }
    }
    if (cur) out.push(cur);
  }
  return out;
}

export function useNarration() {
  const count = useSyncExternalStore(subscribeVoices, koVoiceCount, () => 0);
  const available = count > 0;
  const [speaking, setSpeaking] = useState(false);
  const [rate, setRate] = useState(0.9);
  const token = useRef(0); // 오래된 낭독의 종료 이벤트가 새 낭독 상태를 덮어쓰지 않게 한다

  const stop = useCallback(() => {
    token.current++;
    if (supported()) speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string | string[]) => {
      if (!supported()) return;
      const chunks = toChunks(Array.isArray(text) ? text : [text]);
      if (chunks.length === 0) return;

      speechSynthesis.cancel();
      const mine = ++token.current;
      const voice = pickVoice();
      setSpeaking(true);

      chunks.forEach((chunk, i) => {
        const u = new SpeechSynthesisUtterance(chunk);
        u.lang = "ko-KR";
        if (voice) u.voice = voice;
        u.rate = rate;
        u.pitch = 1.05;
        const done = () => {
          if (token.current === mine && i === chunks.length - 1) setSpeaking(false);
        };
        u.onend = done;
        u.onerror = () => {
          if (token.current === mine) setSpeaking(false);
        };
        speechSynthesis.speak(u);
      });
    },
    [rate],
  );

  // 화면을 떠나면 읽던 것을 멈춘다
  useEffect(() => () => {
    if (supported()) speechSynthesis.cancel();
  }, []);

  return { available, speaking, rate, setRate, speak, stop };
}
