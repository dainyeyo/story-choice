"use client";

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

function LoggedOutHome() {
  return (
    <main className="rise mx-auto w-full max-w-md px-4 pt-8 md:max-w-5xl md:px-8 md:pt-16">
      <section className="grid items-center gap-10 md:grid-cols-[1.1fr_1fr] md:gap-16">
        <div className="space-y-6">
          <h1 className="story text-4xl leading-[1.15] text-ink md:text-5xl md:leading-[1.15] lg:text-6xl lg:leading-[1.1]">
            아이가 고른 선택이
            <br />
            오늘 밤 대화가 됩니다
          </h1>
          <p className="max-w-[36rem] text-lg leading-8 text-ink-2">
            만 4~7세 아이가 자기 고민을 동화 속에서 만나고, 주인공이 어떻게 할지 직접 고릅니다. 부모님께는 그 선택을
            바탕으로 한 대화 질문을 드립니다.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/login" className={`${btnPrimary} md:w-56`}>
              동화 만들기 시작
            </Link>
            <a href="#how" className="calm hidden text-[15px] text-ink-2 hover:text-ink md:inline">
              이용 방법
            </a>
          </div>
        </div>

        <div className="relative">
          <SceneArt className="rounded-2xl" />
          {/* 실제 읽기 화면의 선택 장면을 그대로 보여주는 미리보기 */}
          <div
            aria-hidden
            className="relative z-10 -mt-12 ml-4 mr-0 space-y-3 rounded-2xl border border-line bg-surface p-4 shadow-[0_8px_24px_rgba(59,47,37,0.08)] md:ml-[-24px] md:mr-12"
          >
            <p className="story text-lg text-ink">치과 의자 앞에서, 토끼는 어떻게 할까요</p>
            {["엄마 손을 꼭 잡아요", "눈을 감고 숨을 크게 쉬어요"].map((t) => (
              <div key={t} className="flex items-center justify-between rounded-lg border border-line px-3 py-3 text-[15px] text-ink">
                {t}
                <Icon name="right" size={16} className="text-ink-3" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="mt-20 grid gap-8 border-t border-line pt-10 md:mt-28 md:grid-cols-3 md:gap-12">
        {STEPS.map((s, i) => (
          <div key={s.title} className="space-y-2">
            <p className="text-sm tabular-nums text-ink-3">0{i + 1}</p>
            <h2 className="story text-xl text-ink">{s.title}</h2>
            <p className="text-[15px] leading-7 text-ink-2">{s.text}</p>
          </div>
        ))}
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
