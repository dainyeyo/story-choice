"use client";

import Link from "next/link";
import { useApp, useAuth } from "./providers";
import Icon from "./components/Icon";
import PetAvatar from "./components/PetAvatar";
import Landing from "./components/Landing";
import { btnPrimary } from "./components/ui";
import { localDateKey, petStage } from "@/lib/pet";


function LoggedInHome() {
  const { user, s, library, pet } = useApp();
  const recent = library.slice(0, 4);
  const fmt = (t: number) => new Date(t).toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
  const careDays = pet.state.careDates.length;
  const stage = petStage(pet.state.growthDays);
  const reading = s.step === "story";

  // 상황에 맞는 한 줄 인사
  const message = reading
    ? `읽던 동화 「${s.title}」, 이어서 읽어 볼까요?`
    : s.savedMemo
      ? "지난 대화 메모를 이어서, 새로운 이야기를 만들어 볼까요?"
      : "아이의 마음에서 시작되는 이야기를 만들어 볼까요?";

  return (
    <main className="page-turn mx-auto w-full max-w-md px-4 pb-8 pt-16 md:max-w-5xl md:px-8 md:pb-12 md:pt-28">
      <section className="px-2 pb-6 text-center md:px-10 md:pb-10">
        <p className="text-[15px] text-sky-ink-2">{user} 보호자님</p>
        <h1 className="story mt-2 text-3xl leading-snug text-sky-ink md:text-4xl">
          오늘의 동화는
          <br />
          {message}
        </h1>

        {s.savedMemo && !reading && (
          <p className="mx-auto mt-4 max-w-md rounded-xl bg-surface/70 px-4 py-3 text-[15px] text-ink-2">
            지난 메모 <span className="text-ink">“{s.savedMemo}”</span>
          </p>
        )}

        <div className="mx-auto mt-6 flex max-w-sm flex-col gap-3">
          {reading && (
            <Link href="/read" className={btnPrimary}>
              이어서 읽기
            </Link>
          )}
          <Link href="/create" className={reading ? "calm text-[15px] text-sky-ink-2 underline hover:text-sky-ink" : btnPrimary}>
            {reading ? (
              "새 동화 만들기"
            ) : (
              <>
                <Icon name="plus" size={18} />
                새 동화 만들기
              </>
            )}
          </Link>
        </div>
      </section>

      <Link href="/insights" className="calm mt-6 flex items-center justify-between gap-5 rounded-2xl border border-line bg-surface p-5 hover:bg-sunk/60 md:p-6">
        <span>
          <span className="text-sm font-medium text-accent-text">AI 부모 인사이트</span>
          <span className="story mt-1 block text-xl text-ink">최근 7일의 마음을 오늘의 행동으로</span>
          <span className="mt-1 block text-sm leading-6 text-ink-2">주간 마음 리포트와 다음 동화 방향을 함께 확인해요.</span>
        </span>
        <Icon name="right" className="shrink-0 text-ink-3" />
      </Link>

      <div className="mt-8 grid gap-6 md:grid-cols-2 md:gap-8">
        <Link
          href="/pet"
          className="calm flex flex-col rounded-2xl border border-line bg-surface p-5 hover:bg-sunk/60 md:p-6"
        >
          <span className="story text-xl text-ink">나의 마음 친구</span>
          <span className="flex flex-1 flex-col items-center justify-center gap-2 py-4">
            <PetAvatar stage={stage.index} mood={pet.state.moods[localDateKey()]} className="w-40" />
            <span className="story text-xl text-ink">{pet.state.name}</span>
            <span className="text-sm text-ink-2">{stage.name} · 함께한 지 {careDays}일</span>
          </span>
          <span className="inline-flex items-center justify-center gap-1 text-[15px] text-ink-2">
            만나러 가기 <Icon name="right" size={16} />
          </span>
        </Link>

        <section className="flex flex-col rounded-2xl border border-line bg-surface p-5 md:p-6">
          <div className="flex items-baseline justify-between pb-3">
            <h2 className="story text-xl text-ink">최근 동화</h2>
            {library.length > 0 && (
              <Link href="/library" className="calm text-[15px] text-ink-2 underline hover:text-ink">
                모두 보기
              </Link>
            )}
          </div>

          {recent.length === 0 ? (
            <p className="flex flex-1 items-center justify-center border-t border-line py-6 text-center text-ink-2">
              아직 읽은 동화가 없어요.
              <br />첫 동화를 만들어 보세요.
            </p>
          ) : (
            <ul>
              {recent.map((r) => (
                <li key={r.id} className="border-t border-line">
                  <Link href="/library" className="calm block space-y-1 py-3 hover:bg-sunk/60">
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
  return user ? <LoggedInHome /> : <Landing />;
}