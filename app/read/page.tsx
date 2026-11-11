"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FONT_CLASS } from "@/lib/settings";
import { useApp } from "../providers";
import SceneArt from "../components/SceneArt";
import { bigBtn, Card, COPING_LABEL } from "../components/ui";

export default function ReadPage() {
  const { s, n, settings } = useApp();
  const router = useRouter();
  const [page, setPage] = useState(0);

  // 이 화면에 맞지 않는 단계면 알맞은 화면으로 보낸다
  useEffect(() => {
    if (s.step === "card") router.replace("/card");
    else if (s.step === "form") router.replace("/create");
  }, [s.step, router]);

  const last = Math.max(s.scenes.length - 1, 0);
  const cur = Math.min(page, last);
  const atLast = cur === last;

  // 사용자가 버튼을 누른 순간에 읽기를 시작해야 브라우저가 소리를 허용한다.
  const go = (to: number) => {
    setPage(to);
    if (n.speaking) n.speak(s.scenes[to]);
  };

  if (s.step === "loading") {
    return (
      <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-6 md:max-w-5xl md:px-8">
        {s.usedFallback && <FallbackNote />}
        <Card className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="animate-bounce text-6xl">📖</div>
          <p aria-live="polite" className="font-[family-name:var(--font-story)] text-xl text-amber-800">
            동화를 쓰고 있어요…
          </p>
          <p className="text-sm text-amber-800/60">잠깐만 기다려 주세요</p>
        </Card>
      </main>
    );
  }

  if (s.step !== "story") return null;

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-4 md:max-w-5xl md:gap-6 md:px-8 md:py-8">
      {s.error && (
        <p role="alert" className="rounded-2xl bg-red-50 p-3 text-center text-red-700 ring-1 ring-red-200">
          {s.error}
        </p>
      )}
      {s.usedFallback && <FallbackNote />}

      <h1 className="text-center font-[family-name:var(--font-story)] text-2xl text-amber-800">{s.title}</h1>

      <Card className="flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-8 md:p-8">
        <div className="md:self-center">
          <SceneArt index={cur} />
        </div>

        <div className="flex flex-col gap-4">
          <p className={`flex-1 font-[family-name:var(--font-story)] text-stone-800 ${FONT_CLASS[settings.fontSize]}`}>
            {s.scenes[cur]}
          </p>

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => go(cur - 1)}
              disabled={cur === 0}
              aria-label="이전 쪽"
              className="h-12 w-12 rounded-full bg-amber-100 text-xl text-amber-800 disabled:opacity-30"
            >
              ◀
            </button>

            <div className="flex flex-col items-center gap-1">
              {n.available ? (
                n.speaking ? (
                  <button onClick={n.stop} className="rounded-full bg-amber-500 px-5 py-2 font-bold text-white">
                    ■ 멈춤
                  </button>
                ) : (
                  <button
                    onClick={() => n.speak(s.scenes[cur])}
                    className="rounded-full bg-amber-500 px-5 py-2 font-bold text-white"
                  >
                    🔊 읽어줘
                  </button>
                )
              ) : (
                <span className="text-xs text-stone-500">이 기기에서는 낭독이 안 돼요</span>
              )}
              <span className="text-xs text-stone-500">
                {cur + 1} / {s.scenes.length}
              </span>
            </div>

            <button
              onClick={() => go(cur + 1)}
              disabled={atLast}
              aria-label="다음 쪽"
              className="h-12 w-12 rounded-full bg-amber-100 text-xl text-amber-800 disabled:opacity-30"
            >
              ▶
            </button>
          </div>

          {n.available && (
            <div className="flex items-center justify-center gap-2 text-sm text-stone-600">
              속도
              {(
                [
                  [0.7, "느리게"],
                  [0.9, "보통"],
                  [1.1, "빠르게"],
                ] as const
              ).map(([v, label]) => (
                <button
                  key={v}
                  onClick={() => n.setRate(v)}
                  className={`rounded-full px-3 py-1 ring-1 ${
                    n.rate === v ? "bg-amber-500 text-white ring-amber-500" : "bg-white ring-amber-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>

      {atLast && s.choice && !s.isEnding && (
        <Card className="space-y-3 bg-amber-50 md:mx-auto md:w-full md:max-w-2xl">
          <p className="text-center font-[family-name:var(--font-story)] text-xl text-amber-900">{s.choice.prompt}</p>
          {s.choice.options.map((o) => (
            <button
              key={o.id}
              onClick={() => {
                n.stop();
                setPage(s.scenes.length); // 새 장면의 첫 쪽으로
                void s.pick(o);
              }}
              className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left text-lg shadow ring-1 ring-amber-200 transition active:scale-[0.98]"
            >
              <span className="text-2xl">{COPING_LABEL[o.copingType] ?? "⭐"}</span>
              <span>{o.text}</span>
            </button>
          ))}
        </Card>
      )}

      {atLast && s.isEnding && (
        <div className="space-y-2 md:mx-auto md:w-full md:max-w-md">
          <p className="text-center font-[family-name:var(--font-story)] text-xl text-amber-800">끝 🌟</p>
          <button
            onClick={() => {
              n.stop();
              void s.showCard();
            }}
            className={bigBtn}
          >
            부모님께: 대화 카드 보기
          </button>
        </div>
      )}
    </main>
  );
}

function FallbackNote() {
  return (
    <p className="rounded-2xl bg-amber-50 p-2 text-center text-sm text-amber-800 ring-1 ring-amber-200">
      AI가 바빠서 미리 준비한 이야기를 들려드리고 있어요.
    </p>
  );
}
