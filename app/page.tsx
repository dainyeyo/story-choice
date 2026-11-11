"use client";

import Link from "next/link";
import { useApp, useAuth } from "./providers";
import { useStored } from "@/lib/localStore";
import { hasCreateDraft, parseCreateDraft } from "@/lib/createDraft";
import Icon from "./components/Icon";
import PetAvatar from "./components/PetAvatar";
import Landing from "./components/Landing";
import Reveal from "./components/Reveal";
import HeroParallax from "./components/HeroParallax";
import { btnPrimary } from "./components/ui";
import { localDateKey, petStage } from "@/lib/pet";


function LoggedInHome() {
  const { user, displayName, s, library, pet } = useApp();
  const createDraft = parseCreateDraft(useStored(`story-choice:create-form:${user}`));
  const recent = library.slice(0, 4);
  const fmt = (t: number) => new Date(t).toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
  const careDays = pet.state.careDates.length;
  const stage = petStage(pet.state.growthDays);
  const reading = s.step === "story";
  const resumableRead = reading || Boolean(s.draft);
  const resumableCreate = !resumableRead && hasCreateDraft(createDraft);
  const resumable = resumableRead || resumableCreate;
  const resumableTitle = reading ? s.title : s.draft?.title;

  // 상황에 맞는 한 줄 인사
  const message = resumable
    ? resumableRead
      ? `읽던 동화 「${resumableTitle}」, 이어서 만들어 볼까요?`
      : "만들던 동화 설정을 이어서 작성해 볼까요?"
    : (
        <>
          아이의 마음에서 시작되는 이야기를
          <br />
          만들어 볼까요?
        </>
      );

  return (
    <main className="page-turn mx-auto w-full max-w-md px-4 pb-8 md:max-w-5xl md:px-8 md:pb-12">
      {/* 첫 화면: 인사 + 새 동화 만들기까지만. 나머지는 스크롤을 내리면 올라오며 나타난다 */}
      <div className="flex min-h-[calc(100dvh-72px)] flex-col items-center justify-center pb-16 pt-8 md:min-h-[calc(100dvh-80px)] md:pt-12">
      <HeroParallax targetId="home-below">
      <section className="px-2 text-center md:px-10">
        <p className="text-base text-sky-ink-2 md:text-lg">{displayName},</p>
        <h1 className="story mt-3 text-4xl leading-snug text-sky-ink md:text-5xl">
          오늘의 동화는
          <br />
          {message}
        </h1>

        <div className="mx-auto mt-6 flex max-w-sm flex-col gap-3">
          {resumable && (
            <Link href={resumableRead ? "/read" : "/create"} className={btnPrimary}>
              {resumableRead ? "이어 만들기" : "만들던 동화 이어서 만들기"}
            </Link>
          )}
          <Link href="/create/new?reset=1" className={resumable ? "calm text-[15px] text-sky-ink-2 underline hover:text-sky-ink" : btnPrimary}>
            {resumable ? (
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
      </HeroParallax>
      </div>

      {/* 스크롤을 내리면 보이는 영역 */}
      <div id="home-below" className="grid gap-16 pb-8 md:gap-20">
        <Reveal>
        <Link
          href="/pet"
          aria-label="나의 마음 친구 만나러 가기"
          className="calm flex flex-col items-center justify-center"
        >
          {/* 집 모양: 지붕 + 몸체 + 둥근 문 안에 친구가 들어가 있다 */}
          <span className="flex w-full max-w-[380px] flex-col items-center">
            <svg viewBox="0 0 300 96" className="relative z-10 -mb-1 w-full" aria-hidden>
              <polygon points="150,6 294,90 6,90" fill="#a8622f" />
              <polygon points="150,22 262,86 38,86" fill="#c27a3f" />
              <rect x="0" y="86" width="300" height="10" rx="4" fill="#8a4f25" />
            </svg>
            <span className="flex h-[270px] w-[88%] items-end justify-center rounded-b-xl bg-[#e9bd86] px-6">
              <span className="flex h-[226px] w-[216px] items-end justify-center overflow-hidden rounded-t-full bg-[#5b3a22] shadow-[inset_0_6px_14px_rgba(0,0,0,0.35)]">
                <PetAvatar stage={stage.index} mood={pet.state.moods[localDateKey()]} className="mb-3 w-[170px]" />
              </span>
            </span>
            <span className="h-4 w-[94%] rounded-b-md bg-[#8a4f25]" />
          </span>
          <span className="story mt-5 text-2xl text-sky-ink">{pet.state.name}</span>
          <span className="text-base text-sky-ink-2">{stage.name} · 함께한 지 {careDays}일</span>
        </Link>
        </Reveal>

        <Reveal>
        <Link href="/insights" className="calm flex items-center justify-between gap-5 rounded-2xl border border-line bg-surface p-5 hover:bg-sunk/60 md:p-6">
          <span>
            <span className="text-sm font-medium text-accent-text">AI 부모 인사이트</span>
            <span className="story mt-1 block text-xl text-ink">최근 7일의 마음을 오늘의 행동으로</span>
            <span className="mt-1 block text-sm leading-6 text-ink-2">주간 마음 리포트와 다음 동화 방향을 함께 확인해요.</span>
          </span>
          <Icon name="right" className="shrink-0 text-ink-3" />
        </Link>
        </Reveal>

        <Reveal>
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
        </Reveal>
      </div>
    </main>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  return user ? <LoggedInHome /> : <Landing />;
}
