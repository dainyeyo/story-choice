"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FONT_CLASS } from "@/lib/settings";
import { CUSTOM_COPING } from "@/lib/story/schema";
import { TTS_VOICES } from "@/lib/tts";
import { useApp } from "../providers";
import Icon from "../components/Icon";
import SceneArt from "../components/SceneArt";
import { DrawingAnimation, WritingAnimation } from "../components/LoadingAnimation";
import { btnIcon, btnPrimary, btnSecondary, errorCls, inputCls, noteCls, Segmented } from "../components/ui";

export default function ReadPage() {
  const { s, n, settings, setSettings } = useApp();
  const router = useRouter();
  const [page, setPage] = useState<number | null>(null);
  const { step, resumeDraft, resumePage } = s;
  const [custom, setCustom] = useState("");

  // 이 화면에 맞지 않는 단계면 알맞은 화면으로 보낸다
  useEffect(() => {
    if (step === "card") router.replace("/card");
    else if (step === "form" && !resumeDraft()) router.replace("/create");
  }, [step, resumeDraft, router]);

  const last = Math.max(s.scenes.length - 1, 0);
  const cur = Math.min(page ?? resumePage ?? 0, last);
  const atLast = cur === last;

  // 사용자가 버튼을 누른 순간에 읽기를 시작해야 브라우저가 소리를 허용한다.
  const go = (to: number) => {
    setPage(to);
    if (n.speaking) void n.speak(s.scenes[to], settings.ttsVoice);
  };

  if (s.step === "loading") {
    return (
      <main className="page-turn mx-auto w-full max-w-md space-y-4 px-4 py-8 md:max-w-5xl md:px-8 md:py-12">
        {s.usedFallback && <FallbackNote />}
        <div className="flex flex-col items-center gap-6 rounded-2xl border border-line bg-surface px-6 py-24 text-center">
          <WritingAnimation />
          <p aria-live="polite" className="story text-xl text-ink">
            동화를 쓰고 있어요
          </p>
          <div className="flex gap-2" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="soft-pulse size-2 rounded-full bg-accent"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (s.step !== "story") return null;

  return (
    <main className="page-turn mx-auto w-full max-w-md space-y-6 px-4 py-6 md:max-w-5xl md:space-y-8 md:px-8 md:py-10">
      {s.error && (
        <p role="alert" className={errorCls}>
          {s.error}
        </p>
      )}
      {n.error && <p role="alert" className={errorCls}>{n.error}</p>}
      {s.usedFallback && <FallbackNote />}

      <div className="flex items-start justify-between gap-3">
        <h1 className="story text-2xl text-sky-ink md:text-3xl">{s.title}</h1>
        <button
          type="button"
          onClick={async () => {
            if (!(await s.saveDraft(cur))) return;
            n.stop();
            router.push("/");
          }}
          className="calm shrink-0 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink-2 hover:bg-sunk"
        >
          저장하고 나가기
        </button>
      </div>

      <article className="relative grid gap-6 book-page overflow-hidden rounded-2xl border p-4 md:grid-cols-2 md:gap-10 md:p-5">
        {/* 책갈피: 이 서비스의 표시. 읽는 카드에서만 쓴다 */}
        <span
          aria-hidden
          className="absolute -top-px right-6 h-8 w-5 bg-accent [clip-path:polygon(0_0,100%_0,100%_100%,50%_72%,0_100%)]"
        />

        <div className="md:self-stretch">
          {s.images[cur]?.loading ? (
            <DrawingAnimation fill />
          ) : (
            <SceneArt fill index={cur} imageUrl={s.images[cur]?.url} title={s.title} />
          )}
          {s.images[cur]?.error && <p role="alert" className={`${errorCls} mt-2`}>그림을 만들지 못했어요. {s.images[cur].error}</p>}
          {s.images[cur]?.backgroundSource === "local-fallback" && <p className="mt-2 text-sm text-ink-3">그림 생성 서비스가 바빠 기본 배경을 사용했어요.</p>}
        </div>

        <div className="flex flex-col gap-6 md:py-3 md:pr-3">
          <p className={`story flex-1 text-ink ${FONT_CLASS[settings.fontSize]}`}>{s.scenes[cur]}</p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex flex-1 gap-1" aria-hidden>
                {s.scenes.map((_, i) => (
                  <span key={i} className={`h-1 flex-1 rounded-full ${i <= cur ? "bg-accent" : "bg-line"}`} />
                ))}
              </div>
              <span className="text-sm tabular-nums text-ink-3">
                {cur + 1} / {s.scenes.length}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <button onClick={() => go(cur - 1)} disabled={cur === 0} aria-label="이전 쪽" className={btnIcon}>
                <Icon name="left" />
              </button>

              {n.available ? (
                n.speaking ? (
                  <button onClick={n.stop} className={`${btnSecondary} flex-1`}>
                    <Icon name="stop" size={16} />
                    멈춤
                  </button>
                ) : (
                  <button onClick={() => void n.speak(s.scenes[cur], settings.ttsVoice)} className={`${btnSecondary} flex-1`}>
                    <Icon name="volume" />
                    읽어주기
                  </button>
                )
              ) : (
                <span className="flex-1 text-center text-sm text-ink-3">이 기기에서는 낭독을 쓸 수 없어요</span>
              )}

              <button onClick={() => go(cur + 1)} disabled={atLast} aria-label="다음 쪽" className={btnIcon}>
                <Icon name="right" />
              </button>
            </div>

            {n.available && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="shrink-0 text-sm text-ink-3">목소리</span>
                  <Segmented
                    label="낭독 목소리"
                    value={settings.ttsVoice}
                    onChange={(ttsVoice) => {
                      n.stop();
                      setSettings({ ...settings, ttsVoice });
                    }}
                    options={[
                      { value: "sunhi" as const, label: TTS_VOICES.sunhi.label },
                      { value: "hyunsu" as const, label: TTS_VOICES.hyunsu.label },
                    ]}
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="shrink-0 text-sm text-ink-3">속도</span>
                  <Segmented
                    label="낭독 속도"
                    value={n.rate}
                    onChange={n.setRate}
                    options={[
                      { value: 0.7, label: "느리게" },
                      { value: 0.9, label: "보통" },
                      { value: 1.1, label: "빠르게" },
                    ]}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </article>

      {atLast && s.choice && !s.isEnding && (
        <section className="mx-auto w-full max-w-3xl space-y-4">
          <p className="story text-center text-xl text-sky-ink md:text-2xl">{s.choice.prompt}</p>
          <div className="grid gap-3 md:grid-cols-2">
            {s.choice.options.map((o) => (
              <button
                key={o.id}
                onClick={() => {
                  n.stop();
                  setPage(s.scenes.length); // 새 장면의 첫 쪽으로
                  void s.pick(o);
                }}
                className="calm flex min-h-16 items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4 text-left text-lg text-ink hover:border-accent hover:bg-sunk active:translate-y-px"
              >
                {o.text}
                <Icon name="right" className="text-ink-3" />
              </button>
            ))}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const text = custom.trim();
              if (!text) return;
              n.stop();
              setPage(s.scenes.length);
              setCustom("");
              void s.pick({ text, copingType: CUSTOM_COPING });
            }}
          >
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              maxLength={60}
              aria-label="직접 입력"
              placeholder="내가 생각한 방법을 직접 써 볼래요"
              className={`${inputCls} min-w-0 flex-1`}
            />
            <button type="submit" disabled={!custom.trim()} className={`${btnSecondary} shrink-0 disabled:opacity-40`}>
              이렇게 할래요
            </button>
          </form>
        </section>
      )}

      {atLast && s.isEnding && (
        <section className="page-turn book-page mx-auto w-full max-w-xl rounded-2xl border px-6 py-10 text-center">
          <svg viewBox="0 0 200 24" className="mx-auto h-5 w-44 text-accent" aria-hidden>
            <path d="M6 12h74M120 12h74" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            <path d="M100 2l3 7 7.5.6-5.7 4.9 1.8 7.3L100 18l-6.6 3.8 1.8-7.3-5.7-4.9L97 9z" fill="currentColor" />
          </svg>
          <p className="story mt-5 text-3xl text-ink">끝</p>
          <p className="story mt-2 text-base text-ink-2">「{s.title}」 이야기를 끝까지 읽었어요</p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <button
              onClick={() => {
                n.stop();
                void s.showCard();
              }}
              className={`${btnPrimary} w-full max-w-xs`}
            >
              부모님께: 대화 카드 보기
            </button>
            <button
              onClick={() => {
                n.stop();
                setPage(0);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="text-sm text-ink-2 underline underline-offset-4"
            >
              처음부터 다시 읽기
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

function FallbackNote() {
  return <p className={noteCls}>AI가 바빠서 미리 준비한 이야기를 들려드리고 있어요.</p>;
}

