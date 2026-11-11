"use client";

import { useState, type ReactNode } from "react";
import PetAvatar from "../components/PetAvatar";
import type { PetMood } from "@/lib/pet";
import { CalendarIcon, FoodIcon, MoodFaceIcon, MoodIcon, PetHandIcon } from "./room-art";

const MOOD_LIST: PetMood[] = ["기쁨", "평온", "속상", "용기", "두근"];

type Props = {
  name: string;
  stageName: string;
  stageMessage: string;
  stageIndex: number;
  careDays: number;
  points: number;
  mood?: PetMood;
  action?: "fed" | "petted";
  speech: string;
  fed: boolean;
  petted: boolean;
  canCare: boolean;
  progress: number;
  nextName?: string;
  renaming: boolean;
  nameDraft: string;
  onNameDraft: (value: string) => void;
  onStartRename: () => void;
  onSaveRename: () => void;
  onCancelRename: () => void;
  onMood: (mood: PetMood) => void;
  onCare: (kind: "fed" | "petted") => void;
  onOpenCalendar: () => void;
  onReplayIntro: () => void;
  mongi?: "hidden" | "pop"; // 알 깨기 장면 동안 몽이를 숨기거나 튀어나오게 한다
};

function Action({ icon, label, sub, onClick, disabled, pressed, expanded }: {
  icon: ReactNode; label: string; sub?: string; onClick: () => void; disabled?: boolean; pressed?: boolean; expanded?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-pressed={pressed} aria-expanded={expanded} className="pet-act calm">
      <span className="pet-act-btn">{icon}</span>
      <span className="pet-act-label">{label}</span>
      <span className="pet-act-sub">{sub ?? " "}</span>
    </button>
  );
}

export default function PetRoom(p: Props) {
  const [helpOpen, setHelpOpen] = useState(false);
  const [moodOpen, setMoodOpen] = useState(false);
  const hidden = p.mongi === "hidden";
  const mongiCls = hidden ? "opacity-0" : p.mongi === "pop" ? "hatch-pop" : "";

  return (
    <section className="pet-stage" aria-label={`${p.name}의 방`}>
      <div aria-hidden className="pet-glow" />
      <div aria-hidden className="pet-cloud left-[7%] top-[14%] h-9 w-24 rounded-full bg-white/85" />
      <div aria-hidden className="pet-cloud right-[9%] top-[24%] h-10 w-32 rounded-full bg-white/85" />
      <div aria-hidden className="pet-hill -inset-x-20 bottom-[-250px] h-[400px] rounded-t-[50%] bg-[#bfe0a4]" />
      <div aria-hidden className="pet-hill -inset-x-10 bottom-[-290px] h-[400px] rounded-t-[50%] bg-[#a9d58c]" />

      <div className="relative z-10 flex flex-1 flex-col">
        <header className="relative flex min-h-[64px] flex-col items-center px-12 text-center">
          <div className="absolute left-0 top-0">
            <button type="button" aria-label="도움말" aria-expanded={helpOpen} onClick={() => setHelpOpen((v) => !v)} className="pet-help calm grid size-9 place-items-center rounded-full font-bold">?</button>
            {helpOpen && (
              <div className="absolute left-0 top-11 z-20 w-64 rounded-2xl bg-[#fffaf0] p-4 text-left text-sm leading-6 text-ink-2 shadow-lg">
                <p className="text-ink">{p.stageMessage}</p>
                <p className="mt-2">마음별은 동화 완독 +10, 대화 메모 +5, 마음 기록 +1로 모아요. 밥 주기와 쓰다듬기에는 각각 마음별 1개가 들고, 돌봄 행동을 해야 {p.name}이(가) 자라요.</p>
                <button type="button" onClick={() => { setHelpOpen(false); p.onReplayIntro(); }} className="calm mt-3 rounded-full bg-sunk px-3 py-1.5 text-[13px] font-medium text-ink">알 깨기 다시 보기</button>
              </div>
            )}
          </div>
          <span className="pet-chip absolute right-0 top-0 rounded-full px-3.5 py-2 text-[15px] font-bold shadow-[0_2px_0_rgba(0,0,0,.12)]">✦ 마음별 {p.points}</span>

          {p.renaming ? (
            <form className="flex items-center gap-1.5" onSubmit={(e) => { e.preventDefault(); p.onSaveRename(); }}>
              <input autoFocus maxLength={10} value={p.nameDraft} onChange={(e) => p.onNameDraft(e.target.value)} aria-label="마음 친구 이름" className="w-28 min-w-0 rounded-lg border border-line bg-paper px-2 py-1.5 text-[15px] text-ink" />
              <button type="submit" disabled={!p.nameDraft.trim()} className="calm rounded-lg bg-ink px-2.5 py-1.5 text-sm text-paper disabled:opacity-40">저장</button>
              <button type="button" onClick={p.onCancelRename} className="calm rounded-lg bg-white/80 px-2 py-1.5 text-sm text-ink-2">취소</button>
            </form>
          ) : (
            <>
              <h2 className="story pet-title text-[30px] font-bold leading-tight">{p.name}</h2>
              <p className="pet-sub text-sm">{p.stageName} · 함께한 지 {p.careDays}일 · <button type="button" onClick={p.onStartRename} className="pet-text-link calm underline">이름 바꾸기</button></p>
            </>
          )}
        </header>

        <div className="flex flex-1 flex-col items-center justify-center pb-4 pt-2">
          <div className={`w-[min(300px,72%)] ${mongiCls}`}>
            <PetAvatar stage={p.stageIndex} mood={p.mood} action={p.action} className="w-full" />
          </div>
          <div aria-hidden className={`pet-shadow -mt-3 h-6 w-[min(220px,52%)] rounded-[50%] blur-[5px] ${hidden ? "opacity-0" : ""}`} />
          <p aria-live="polite" className={`story pet-speech mt-4 text-center text-[19px] transition-opacity ${hidden ? "opacity-0" : ""}`}>{p.speech}</p>
          <div className="mt-3 w-48 text-center">
            <div className="pet-bar h-2 overflow-hidden rounded-full" aria-label="다음 성장까지 진행도"><i className="block h-full rounded-full bg-accent transition-[width]" style={{ width: `${p.progress}%` }} /></div>
            <p className="pet-bar-text mt-1.5 text-[13.5px] font-medium">{p.nextName ? `다음엔 ${p.nextName}으로 자라요 · ${Math.round(p.progress)}%` : "모든 성장 단계를 만났어요"}</p>
          </div>
        </div>

        <div className="relative">
          {moodOpen && (
            <div role="group" aria-label="오늘 마음 스티커" className="pet-pop absolute bottom-full left-1/2 z-20 mb-3 flex -translate-x-1/2 gap-2 rounded-2xl p-2.5">
              {MOOD_LIST.map((item) => (
                <button key={item} type="button" aria-label={item} aria-pressed={p.mood === item} onClick={() => { p.onMood(item); setMoodOpen(false); }} className="calm grid size-12 place-items-center rounded-xl">
                  <MoodIcon mood={item} size={30} />
                </button>
              ))}
            </div>
          )}
          <div className="pet-dock mx-auto w-fit">
            <Action icon={<FoodIcon />} label={p.fed ? "밥 먹었어요" : "밥 주기"} sub={p.fed ? undefined : "✦ 1"} disabled={p.fed || !p.canCare} onClick={() => p.onCare("fed")} />
            <Action icon={<PetHandIcon />} label={p.petted ? "쓰다듬었어요" : "쓰다듬기"} sub={p.petted ? undefined : "✦ 1"} disabled={p.petted || !p.canCare} onClick={() => p.onCare("petted")} />
            <Action icon={p.mood ? <MoodIcon mood={p.mood} size={44} /> : <MoodFaceIcon />} label="오늘 마음" sub={p.mood} expanded={moodOpen} onClick={() => setMoodOpen((v) => !v)} />
            <Action icon={<CalendarIcon />} label="달력" onClick={p.onOpenCalendar} />
          </div>
        </div>
      </div>
    </section>
  );
}
