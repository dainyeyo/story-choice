"use client";

import { useState } from "react";
import Link from "next/link";
import { useApp, useAuth } from "./providers";
import Icon from "./components/Icon";
import SceneArt from "./components/SceneArt";
import { btnPrimary, noteCls, PageHeader } from "./components/ui";

const STEPS = [
  { title: "아이의 마음을 고릅니다", text: "치과가 무서워, 동생이 생겼어. 요즘 아이를 힘들게 하는 일을 고르거나 직접 적습니다." },
  { title: "동화 속에서 선택합니다", text: "주인공이 어떻게 할지 아이가 직접 고릅니다. 그 선택에 아이의 마음이 담깁니다." },
  { title: "부모와 이야기합니다", text: "아이의 선택을 바탕으로 대화 질문을 드립니다. 한 줄 메모는 다음 동화로 이어집니다." },
];

// 첫 화면에서 직접 눌러 볼 수 있는 예시 장면 (서비스가 만드는 동화의 한 장면을 흉내 낸 샘플)
const DEMO = {
  scene: "곰돌이는 치과 의자에 앉았어요. 윙윙 소리가 들리자 가슴이 콩닥콩닥 뛰었어요.",
  prompt: "곰돌이는 어떻게 할까요",
  options: [
    {
      text: "선생님 손을 꼭 잡아요",
      next: "선생님이 손을 마주 잡아 주었어요. 손끝이 따뜻해서 마음이 조금 놓였어요.",
      question: "손을 잡았을 때 마음이 어땠을까?",
    },
    {
      text: "눈을 감고 숨을 크게 쉬어요",
      next: "숨을 크게 쉬자 콩닥콩닥이 천천히 가라앉았어요. 곰돌이는 살짝 웃었어요.",
      question: "마음이 콩닥거릴 때 우리는 뭘 해 볼 수 있을까?",
    },
  ],
};

function BookDemo() {
  const [picked, setPicked] = useState<number | null>(null);
  const p = picked === null ? null : DEMO.options[picked];

  return (
    <div className="relative grid overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_8px_24px_rgba(59,47,37,0.06)] md:grid-cols-2">
      <div className="p-4 md:p-6">
        <SceneArt index={picked === null ? 0 : picked + 1} className="md:h-full md:aspect-auto" />
      </div>

      <div className="relative flex flex-col justify-center gap-6 border-t border-line p-6 md:border-l md:border-t-0 md:p-10">
        {/* 책갈피: 읽는 화면과 같은 표시 */}
        <span
          aria-hidden
          className="absolute -top-px right-6 h-8 w-5 bg-accent [clip-path:polygon(0_0,100%_0,100%_100%,50%_72%,0_100%)]"
        />

        <p className="story text-xl leading-9 text-ink md:text-2xl md:leading-[2.4rem]">{DEMO.scene}</p>

        {p === null ? (
          <div className="space-y-3">
            <p className="story text-lg text-ink">{DEMO.prompt}</p>
            <div className="grid gap-2">
              {DEMO.options.map((o, i) => (
                <button
                  key={o.text}
                  onClick={() => setPicked(i)}
                  className="calm flex min-h-12 items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-left text-[15px] text-ink hover:border-accent hover:bg-sunk active:translate-y-px"
                >
                  {o.text}
                  <Icon name="right" size={16} className="text-ink-3" />
                </button>
              ))}
            </div>
            <p className="text-sm text-ink-3">하나를 눌러 보세요</p>
          </div>
        ) : (
          <div className="space-y-4" aria-live="polite">
            <p className="story text-xl leading-9 text-ink md:text-2xl md:leading-[2.4rem]">{p.next}</p>
            <div className="rounded-xl bg-sunk px-4 py-3">
              <p className="text-sm text-ink-3">부모님께 가는 질문</p>
              <p className="story mt-1 text-lg text-ink">“{p.question}”</p>
            </div>
            <button onClick={() => setPicked(null)} className="calm text-sm text-ink-2 underline hover:text-ink">
              다른 선택 보기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function LoggedOutHome() {
  return (
    <main className="rise mx-auto w-full max-w-md px-4 pt-8 md:max-w-6xl md:px-8 md:pt-14">
      <section className="grid items-end gap-6 md:grid-cols-[1.2fr_1fr] md:gap-16">
        <h1 className="story text-4xl leading-[1.2] text-ink md:text-5xl md:leading-[1.2]">
          아이가 고른 선택이
          <br />
          오늘 밤 대화가 됩니다
        </h1>
        <div className="space-y-5">
          <p className="text-[17px] leading-8 text-ink-2">
            만 4~7세 아이가 자기 고민을 동화 속에서 만나고, 주인공이 어떻게 할지 직접 고릅니다. 부모님께는 그 선택을 바탕으로
            한 대화 질문을 드립니다.
          </p>
          <Link href="/login" className={`${btnPrimary} md:w-56`}>
            동화 만들기 시작
          </Link>
        </div>
      </section>

      <section className="mt-10 md:mt-14">
        <BookDemo />
      </section>

      <ol className="mt-20 grid gap-8 md:mt-28 md:grid-cols-3 md:gap-10">
        {STEPS.map((s, i) => (
          <li key={s.title} className="border-t border-ink/25 pt-4">
            <p className="text-sm tabular-nums text-ink-3">{i + 1}</p>
            <h2 className="story mt-2 text-xl text-ink">{s.title}</h2>
            <p className="mt-2 text-[15px] leading-7 text-ink-2">{s.text}</p>
          </li>
        ))}
      </ol>

      <section className="mt-20 grid items-center gap-6 rounded-2xl bg-sunk p-6 md:mt-28 md:grid-cols-[1fr_auto] md:gap-12 md:p-12">
        <div className="space-y-2">
          <h2 className="story text-2xl text-ink md:text-3xl">오늘 밤 첫 동화를 만들어 보세요</h2>
          <p className="text-[15px] leading-7 text-ink-2">
            아이 이름 없이 고민만 고르면 3분 안에 읽을 수 있어요. 기록은 이 기기에만 저장됩니다.
          </p>
        </div>
        <Link href="/login" className={`${btnPrimary} md:w-56`}>
          동화 만들기 시작
        </Link>
      </section>
    </main>
  );
}

function LoggedInHome() {
  const { user, s, library } = useApp();
  const recent = library.slice(0, 4);
  const fmt = (t: number) => new Date(t).toLocaleDateString("ko-KR", { month: "long", day: "numeric" });

  return (
    <main className="rise mx-auto w-full max-w-md px-4 py-8 md:max-w-5xl md:px-8 md:py-12">
      <PageHeader title="오늘의 동화" sub={`${user} 보호자님`} />

      <div className="mt-8 grid gap-10 md:grid-cols-[2fr_3fr] md:gap-16">
        <section className="space-y-4">
          {s.step === "story" && (
            <div className="space-y-3 rounded-2xl border border-line bg-surface p-5">
              <p className="text-sm text-ink-3">읽던 동화</p>
              <p className="story text-xl text-ink">{s.title}</p>
              <Link href="/read" className={btnPrimary}>
                이어서 읽기
              </Link>
            </div>
          )}

          {s.savedMemo && (
            <p className={noteCls}>
              지난 메모가 다음 동화에 이어집니다
              <span className="mt-1 block text-ink">“{s.savedMemo}”</span>
            </p>
          )}

          <Link href="/create" className={s.step === "story" ? "calm text-[15px] text-ink-2 underline hover:text-ink" : btnPrimary}>
            {s.step === "story" ? "새 동화 만들기" : (
              <>
                <Icon name="plus" size={18} />
                새 동화 만들기
              </>
            )}
          </Link>
        </section>

        <section>
          <div className="flex items-baseline justify-between pb-3">
            <h2 className="story text-xl text-ink">최근 동화</h2>
            {library.length > 0 && (
              <Link href="/library" className="calm text-[15px] text-ink-2 underline hover:text-ink">
                모두 보기
              </Link>
            )}
          </div>

          {recent.length === 0 ? (
            <p className="border-t border-line py-6 text-ink-2">아직 읽은 동화가 없어요. 첫 동화를 만들어 보세요.</p>
          ) : (
            <ul>
              {recent.map((r) => (
                <li key={r.id} className="border-t border-line">
                  <Link href="/library" className="calm block space-y-1 py-4 hover:bg-sunk/60">
                    <p className="story text-lg text-ink">{r.title}</p>
                    <p className="text-sm text-ink-3">
                      {r.situation} · 만 {r.age}세 · {fmt(r.createdAt)}
                    </p>
                    {r.memo && <p className="text-[15px] text-ink-2">{r.memo}</p>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  return user ? <LoggedInHome /> : <LoggedOutHome />;
}
