"use client";

import { useState } from "react";
import { useApp } from "../providers";
import Icon from "../components/Icon";
import PetAvatar from "../components/PetAvatar";
import { btnSecondary, PageHeader } from "../components/ui";
import { localDateKey, nextPetStage, petStage, type PetMood } from "@/lib/pet";

const MOODS: { value: PetMood; emoji: string }[] = [
  { value: "기쁨", emoji: "☀️" }, { value: "평온", emoji: "🌿" }, { value: "속상", emoji: "🌧️" },
  { value: "용기", emoji: "⭐" }, { value: "두근", emoji: "💗" },
];

const MOOD_EMOJI = Object.fromEntries(MOODS.map((item) => [item.value, item.emoji])) as Record<PetMood, string>;
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function monthCells(year: number, month: number) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  return [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: lastDate }, (_, index) => index + 1),
  ];
}

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function PetPage() {
  const { pet } = useApp();
  const [action, setAction] = useState<"fed" | "petted" | undefined>();
  const [testOpen, setTestOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState(pet.state.name);
  const today = pet.today;
  const todayDate = new Date(`${today}T12:00:00`);
  const [shownMonth, setShownMonth] = useState({ year: todayDate.getFullYear(), month: todayDate.getMonth() });
  const careDays = pet.state.careDates.length;
  const growthDays = pet.state.growthDays;
  const stage = petStage(growthDays);
  const next = nextPetStage(growthDays);
  const fed = pet.state.fedDates.includes(today);
  const petted = pet.state.pettedDates.includes(today);
  const mood = pet.state.moods[today];
  const progress = next ? Math.min(100, ((growthDays - stage.days) / (next.days - stage.days)) * 100) : 100;
  const cells = monthCells(shownMonth.year, shownMonth.month);

  const react = (nextAction: "fed" | "petted") => {
    const succeeded = nextAction === "fed" ? pet.feed() : pet.pet();
    if (!succeeded) return;
    setAction(nextAction);
    window.setTimeout(() => setAction(undefined), 1400);
  };

  const moveMonth = (amount: number) => {
    const moved = new Date(shownMonth.year, shownMonth.month + amount, 1);
    setShownMonth({ year: moved.getFullYear(), month: moved.getMonth() });
  };

  const showDate = (date: string) => {
    const shown = new Date(`${date}T12:00:00`);
    setShownMonth({ year: shown.getFullYear(), month: shown.getMonth() });
  };

  const changeTestDate = (date: string) => {
    pet.setTestDate(date);
    showDate(date);
  };

  const advanceTestDate = (days: number) => {
    const advanced = new Date(`${today}T12:00:00`);
    advanced.setDate(advanced.getDate() + days);
    const nextDate = localDateKey(advanced.getTime());
    pet.advanceTestDate(days);
    showDate(nextDate);
  };

  const resetTest = () => {
    pet.resetTest();
    showDate(localDateKey());
  };

  const canCare = pet.state.points >= 1;

  return (
    <main className="page-turn mx-auto w-full max-w-md px-4 py-8 md:max-w-4xl md:px-8 md:py-12">
      <PageHeader title="나의 마음 친구" sub="동화를 읽고 마음을 나눌수록 천천히 자라요" />

      <div className="mt-4 flex justify-end">
        <button type="button" onClick={() => setTestOpen((open) => !open)} className="calm rounded-lg border border-dashed border-line bg-surface px-3 py-2 text-sm text-ink-2 hover:bg-sunk">
          {testOpen ? "테스트 닫기" : "날짜 테스트"}
        </button>
      </div>

      {testOpen && (
        <section className="mt-3 rounded-2xl border border-accent/40 bg-[#fdf0d2] p-4" aria-label="펫 성장 날짜 테스트">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-medium text-ink">임시 날짜 테스트</h2>
              <p className="mt-1 text-sm text-ink-2">날짜를 앞으로 옮기면 그동안 매일 돌본 것으로 채워져 {pet.state.name}의 성장을 바로 볼 수 있어요.</p>
            </div>
            <label className="flex shrink-0 items-center gap-2 text-sm text-ink-2">
              테스트 날짜
              <input type="date" value={today} onChange={(event) => changeTestDate(event.target.value)} className="rounded-lg border border-line bg-surface px-3 py-2 text-ink" />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {[1, 14, 60, 180].map((days) => <button key={days} type="button" onClick={() => advanceTestDate(days)} className="calm rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink hover:bg-paper">+{days}일</button>)}
            <button type="button" onClick={resetTest} className="calm ml-auto rounded-lg px-3 py-2 text-sm text-ink-2 underline hover:text-ink">실제 오늘로 초기화</button>
          </div>
        </section>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-[3fr_2fr] md:gap-10">
        <section className="overflow-hidden rounded-[28px] border border-line bg-[#fff1d8]">
          <div className="relative min-h-[390px] px-5 pt-5 text-center">
            <div className="absolute left-7 top-7 text-2xl opacity-70">✦</div>
            <div className="absolute right-8 top-16 text-xl opacity-60">· ✧</div>
            <p className="inline-flex rounded-full bg-surface/80 px-3 py-1 text-sm text-ink-2">{pet.state.name} · {stage.name} · 함께한 지 {careDays}일</p>
            <PetAvatar stage={stage.index} mood={mood} action={action} className="mx-auto mt-3 w-full max-w-[310px]" />
            <p aria-live="polite" className="story -mt-2 text-xl text-ink">
              {action === "fed" ? "냠냠, 마음이 든든해졌어!" : action === "petted" ? "헤헤, 네 손은 참 따뜻해" : mood === "속상" ? "오늘은 내가 조용히 곁에 있을게" : mood === "용기" ? "우리 같이 한 걸음 내디뎌 보자!" : "오늘도 이야기 들려줄래?"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-line bg-surface/75 p-4">
            <button disabled={fed || !canCare} onClick={() => react("fed")} className={btnSecondary}>{fed ? "오늘 밥 먹었어요" : "밥 주기 · 마음별 1"}</button>
            <button disabled={petted || !canCare} onClick={() => react("petted")} className={btnSecondary}>{petted ? "오늘 쓰다듬었어요" : "쓰다듬기 · 마음별 1"}</button>
          </div>
        </section>
        <aside className="space-y-6">
          <section className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="story text-xl text-ink">{pet.state.name}</h2>
                <p className="mt-0.5 text-xs text-ink-3">현재 성장 단계 · {stage.name}</p>
              </div>
              <span className="rounded-full bg-[#fdf0d2] px-3 py-1 text-sm font-medium text-accent-text">✦ 마음별 {pet.state.points}</span>
            </div>
            {renaming ? (
              <form
                className="mt-4 flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  pet.rename(nameDraft);
                  if (nameDraft.trim()) setRenaming(false);
                }}
              >
                <input autoFocus maxLength={10} value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} aria-label="마음 친구 이름" className="min-w-0 flex-1 rounded-lg border border-line bg-paper px-3 py-2 text-[15px] text-ink" />
                <button type="submit" disabled={!nameDraft.trim()} className="calm rounded-lg bg-ink px-3 py-2 text-sm text-paper disabled:opacity-40">저장</button>
                <button type="button" onClick={() => { setNameDraft(pet.state.name); setRenaming(false); }} className="calm rounded-lg px-2 py-2 text-sm text-ink-2 hover:bg-sunk">취소</button>
              </form>
            ) : (
              <button type="button" onClick={() => { setNameDraft(pet.state.name); setRenaming(true); }} className="calm mt-3 text-sm text-ink-2 underline hover:text-ink">이름 바꾸기</button>
            )}
            <p className="mt-1 text-[15px] leading-6 text-ink-2">{stage.message} 밥 주기나 쓰다듬기를 하면 한 번씩 자라요.</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-sunk" aria-label="다음 성장까지 진행도"><div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${progress}%` }} /></div>
              <span className="text-sm text-ink-3">{Math.round(progress)}%</span>
            </div>
            <p className="mt-2 text-sm text-ink-3">{next ? `다음에는 ${next.name}으로 자라요` : "모든 성장 단계를 만났어요"}</p>
            {next && <p className="mt-3 text-xs leading-5 text-ink-3">밥 주기나 쓰다듬기 한 번마다 성장 행동이 쌓여요. 행동마다 마음별 1개를 사용해요.</p>}
          </section>
          <section className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="story text-xl text-ink">오늘 마음은 어때?</h2>
            <p className="mt-1 text-sm text-ink-3">하루 한 번, 마음 스티커를 남겨요</p>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {MOODS.map((item) => <button key={item.value} type="button" onClick={() => pet.setMood(item.value)} aria-label={item.value} aria-pressed={mood === item.value} className={`calm flex aspect-square items-center justify-center rounded-xl border text-xl ${mood === item.value ? "border-accent bg-[#fdf0d2]" : "border-line bg-paper hover:bg-sunk"}`}>{item.emoji}</button>)}
            </div>
            {mood && <p className="mt-3 text-center text-sm text-ink-2">오늘은 “{mood}” 마음을 기록했어요</p>}
          </section>
          <p className="rounded-xl bg-sunk px-4 py-3 text-sm leading-6 text-ink-2">마음별은 동화 완독 +10, 대화 메모 +5, 마음 기록 +1로 모아요. 밥 주기와 쓰다듬기에는 각각 마음별 1개가 들고, 돌봄 행동을 해야 몽이가 자라요.</p>
        </aside>
      </div>

      <section className="mt-10 rounded-2xl border border-line bg-surface p-5 md:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="story text-2xl text-ink">마음 스티커 달력</h2>
            <p className="mt-1 text-sm text-ink-3">매일 고른 마음이 차곡차곡 모여요</p>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => moveMonth(-1)} aria-label="이전 달" className="calm flex size-9 items-center justify-center rounded-lg text-ink-2 hover:bg-sunk"><Icon name="left" /></button>
            <p className="min-w-28 text-center text-[15px] font-medium text-ink">{shownMonth.year}년 {shownMonth.month + 1}월</p>
            <button type="button" onClick={() => moveMonth(1)} aria-label="다음 달" className="calm flex size-9 items-center justify-center rounded-lg text-ink-2 hover:bg-sunk"><Icon name="right" /></button>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-7 text-center text-xs text-ink-3">
          {WEEKDAYS.map((weekday) => <span key={weekday} className="py-2">{weekday}</span>)}
          {cells.map((day, index) => {
            if (!day) return <span key={`blank-${index}`} aria-hidden className="aspect-square" />;
            const key = dateKey(shownMonth.year, shownMonth.month, day);
            const recordedMood = pet.state.moods[key];
            const isToday = key === today;
            return (
              <div key={key} className="flex aspect-square items-center justify-center p-0.5">
                <span className={`relative flex size-full max-h-12 max-w-12 flex-col items-center justify-center rounded-xl ${isToday ? "bg-[#fdf0d2] ring-1 ring-accent" : recordedMood ? "bg-paper" : ""}`}>
                  <span className={`text-[11px] leading-none ${isToday ? "font-medium text-accent-text" : "text-ink-3"}`}>{day}</span>
                  <span className="mt-0.5 min-h-4 text-base leading-none" aria-label={recordedMood}>{recordedMood ? MOOD_EMOJI[recordedMood] : ""}</span>
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 border-t border-line pt-4 text-xs text-ink-2">
          {MOODS.map((item) => <span key={item.value}>{item.emoji} {item.value}</span>)}
        </div>
      </section>

    </main>
  );
}
