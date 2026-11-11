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
  const today = localDateKey();
  const todayDate = new Date();
  const [shownMonth, setShownMonth] = useState({ year: todayDate.getFullYear(), month: todayDate.getMonth() });
  const careDays = pet.state.careDates.length;
  const stage = petStage(careDays);
  const next = nextPetStage(careDays);
  const fed = pet.state.fedDates.includes(today);
  const petted = pet.state.pettedDates.includes(today);
  const mood = pet.state.moods[today];
  const progress = next ? Math.min(100, ((careDays - stage.days) / (next.days - stage.days)) * 100) : 100;
  const cells = monthCells(shownMonth.year, shownMonth.month);

  const react = (nextAction: "fed" | "petted") => {
    if (nextAction === "fed") pet.feed(); else pet.pet();
    setAction(nextAction);
    window.setTimeout(() => setAction(undefined), 1400);
  };

  const moveMonth = (amount: number) => {
    const moved = new Date(shownMonth.year, shownMonth.month + amount, 1);
    setShownMonth({ year: moved.getFullYear(), month: moved.getMonth() });
  };

  return (
    <main className="rise mx-auto w-full max-w-md px-4 py-8 md:max-w-4xl md:px-8 md:py-12">
      <PageHeader title="나의 마음 친구" sub="동화를 읽고 마음을 나눌수록 천천히 자라요" />
      <div className="mt-8 grid gap-6 md:grid-cols-[3fr_2fr] md:gap-10">
        <section className="overflow-hidden rounded-[28px] border border-line bg-[#fff1d8]">
          <div className="relative min-h-[390px] px-5 pt-5 text-center">
            <div className="absolute left-7 top-7 text-2xl opacity-70">✦</div>
            <div className="absolute right-8 top-16 text-xl opacity-60">· ✧</div>
            <p className="inline-flex rounded-full bg-surface/80 px-3 py-1 text-sm text-ink-2">{stage.name} · 함께한 지 {careDays}일</p>
            <PetAvatar stage={stage.index} mood={mood} action={action} className="mx-auto mt-3 w-full max-w-[310px]" />
            <p aria-live="polite" className="story -mt-2 text-xl text-ink">
              {action === "fed" ? "냠냠, 마음이 든든해졌어!" : action === "petted" ? "헤헤, 네 손은 참 따뜻해" : mood === "속상" ? "오늘은 내가 조용히 곁에 있을게" : mood === "용기" ? "우리 같이 한 걸음 내디뎌 보자!" : "오늘도 이야기 들려줄래?"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-line bg-surface/75 p-4">
            <button disabled={fed} onClick={() => react("fed")} className={btnSecondary}>{fed ? "오늘 밥 먹었어요" : "밥 주기"}</button>
            <button disabled={petted} onClick={() => react("petted")} className={btnSecondary}>{petted ? "오늘 쓰다듬었어요" : "쓰다듬기"}</button>
          </div>
        </section>
        <aside className="space-y-6">
          <section className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex items-baseline justify-between gap-3"><h2 className="story text-xl text-ink">{stage.name}</h2><span className="text-sm text-ink-3">{Math.round(progress)}%</span></div>
            <p className="mt-1 text-[15px] leading-6 text-ink-2">{stage.message}</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-sunk" aria-label="다음 성장까지 진행도"><div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${progress}%` }} /></div>
            <p className="mt-2 text-sm text-ink-3">{next ? `다음에는 ${next.name}으로 자라요` : "모든 성장 단계를 만났어요"}</p>
          </section>
          <section className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="story text-xl text-ink">오늘 마음은 어때?</h2>
            <p className="mt-1 text-sm text-ink-3">하루 한 번, 마음 스티커를 남겨요</p>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {MOODS.map((item) => <button key={item.value} type="button" onClick={() => pet.setMood(item.value)} aria-label={item.value} aria-pressed={mood === item.value} className={`calm flex aspect-square items-center justify-center rounded-xl border text-xl ${mood === item.value ? "border-accent bg-[#fdf0d2]" : "border-line bg-paper hover:bg-sunk"}`}>{item.emoji}</button>)}
            </div>
            {mood && <p className="mt-3 text-center text-sm text-ink-2">오늘은 “{mood}” 마음을 기록했어요</p>}
          </section>
          <p className="rounded-xl bg-sunk px-4 py-3 text-sm leading-6 text-ink-2">동화를 끝까지 읽거나 대화 메모를 남겨도 오늘의 돌봄이 채워져요.</p>
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
