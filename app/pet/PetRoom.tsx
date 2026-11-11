"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import PetAvatar from "../components/PetAvatar";
import type { PetMood } from "@/lib/pet";
import { FoodIcon, MoodIcon, PetHandIcon, StarJar } from "./room-art";

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
};

const WOOD = "#a97b45";

function MoodFrames({ mood, onMood, size }: { mood?: PetMood; onMood: (mood: PetMood) => void; size: number }) {
  return (
    <div className="flex items-center gap-2" role="group" aria-label="오늘 마음 스티커">
      {MOOD_LIST.map((item) => (
        <button key={item} type="button" aria-label={item} aria-pressed={mood === item} onClick={() => onMood(item)}
          style={{ width: size, height: size, borderColor: WOOD }}
          className={`flex items-center justify-center rounded-lg border-4 shadow-[0_4px_8px_rgba(0,0,0,.2)] transition ${mood === item ? "bg-[#ffe9b8] outline outline-[3px] outline-offset-[3px] outline-accent" : "bg-[#fff8e8] hover:bg-[#ffefc9]"}`}>
          <MoodIcon mood={item} size={Math.round(size * 0.65)} />
        </button>
      ))}
    </div>
  );
}

function CareButton({ icon, label, done, doneLabel, disabled, onClick, className = "", style }: {
  icon: ReactNode; label: string; done: boolean; doneLabel: string; disabled: boolean; onClick: () => void; className?: string; style?: React.CSSProperties;
}) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} style={style}
      className={`w-32 rounded-[18px] border-[3px] border-[#a97b45] bg-[#fff6e2] px-1.5 pb-2.5 pt-2.5 text-center text-ink shadow-[0_5px_0_rgba(120,80,30,.4)] transition enabled:hover:-translate-y-0.5 enabled:active:translate-y-0.5 enabled:active:shadow-[0_2px_0_rgba(120,80,30,.4)] disabled:opacity-60 ${className}`}>
      <span className="grid h-[62px] place-items-center">{icon}</span>
      <b className="story mt-0.5 block text-[19px] font-bold leading-tight">{done ? doneLabel : label}</b>
      <span className="mt-1 inline-block rounded-full bg-[#fdd98a] px-2.5 py-0.5 text-[13px] font-bold text-[#7a4a10]">마음별 ✦ 1</span>
    </button>
  );
}

function WallCalendar({ onClick, className = "", style }: { onClick: () => void; className?: string; style?: React.CSSProperties }) {
  return (
    <button type="button" onClick={onClick} aria-label="마음 스티커 달력 열기" style={style} className={`calm w-[84px] -rotate-2 text-center ${className}`}>
      <span className="absolute left-[38px] top-[-10px] size-2 rounded-full bg-[#7a5a33]" />
      <span className="block rounded-t-md border-2 border-b-0 border-[#a24438] bg-[#e66558] py-1 text-sm font-bold text-white">달력</span>
      <span className="grid grid-cols-5 gap-1 rounded-b-md border-2 border-t-0 border-[#a24438] bg-[#fffdf6] px-1.5 py-2 shadow-[0_4px_8px_rgba(0,0,0,.2)]">
        {Array.from({ length: 15 }, (_, i) => <i key={i} className={`h-[9px] rounded-sm ${i === 11 ? "bg-[#e66558]" : "bg-[#eadfc8]"}`} />)}
      </span>
      <span className="mt-1.5 inline-block rounded-full bg-[#fff6e2] px-2 py-0.5 text-xs font-bold text-ink shadow-[0_2px_0_rgba(120,80,30,.3)]">달력 보기</span>
    </button>
  );
}

function Sign({ p }: { p: Props }) {
  return p.renaming ? (
    <form className="flex items-center gap-1.5" onSubmit={(e) => { e.preventDefault(); p.onSaveRename(); }}>
      <input autoFocus maxLength={10} value={p.nameDraft} onChange={(e) => p.onNameDraft(e.target.value)} aria-label="마음 친구 이름" className="w-28 min-w-0 rounded-lg border border-line bg-paper px-2 py-1.5 text-[15px] text-ink" />
      <button type="submit" disabled={!p.nameDraft.trim()} className="calm rounded-lg bg-ink px-2.5 py-1.5 text-sm text-paper disabled:opacity-40">저장</button>
      <button type="button" onClick={p.onCancelRename} className="calm rounded-lg px-1.5 py-1.5 text-sm text-ink-2 hover:bg-sunk">취소</button>
    </form>
  ) : (
    <>
      <h2 className="story text-2xl leading-tight text-ink">{p.name}</h2>
      <p className="text-[13px] text-[#6e5334]">{p.stageName} · 함께한 지 {p.careDays}일</p>
    </>
  );
}

function Help({ p, className = "" }: { p: Props; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={className}>
      <button type="button" aria-label="도움말" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="calm grid size-[34px] place-items-center rounded-full bg-[#fff6e2] font-bold text-ink shadow-[0_3px_0_rgba(120,80,30,.25)]">?</button>
      {open && (
        <div className="absolute right-0 top-10 z-10 w-64 rounded-2xl bg-[#fffaf0] p-4 text-left text-sm leading-6 text-ink-2 shadow-lg">
          <p className="text-ink">{p.stageMessage}</p>
          <p className="mt-2">마음별은 동화 완독 +10, 대화 메모 +5, 마음 기록 +1로 모아요. 밥 주기와 쓰다듬기에는 각각 마음별 1개가 들고, 돌봄 행동을 해야 {p.name}이(가) 자라요.</p>
        </div>
      )}
    </div>
  );
}

function Growth({ p, light }: { p: Props; light?: boolean }) {
  return (
    <div className="text-center">
      <div className="mx-auto h-2.5 w-52 overflow-hidden rounded-full bg-[rgba(80,50,20,.25)]" aria-label="다음 성장까지 진행도"><i className="block h-full rounded-full bg-accent transition-[width]" style={{ width: `${p.progress}%` }} /></div>
      <p className={`mt-1.5 text-sm font-bold ${light ? "text-[#fff6e2] [text-shadow:0_1px_3px_rgba(60,30,0,.6)]" : "text-ink"}`}>
        {p.nextName ? `다음엔 ${p.nextName}으로 자라요 · ${Math.round(p.progress)}%` : "모든 성장 단계를 만났어요"}
      </p>
    </div>
  );
}

export default function PetRoom(p: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / 980);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const careButtons = (cls: string, pos?: [React.CSSProperties, React.CSSProperties]) => (
    <>
      <CareButton icon={<FoodIcon />} label="밥 주기" doneLabel="밥 먹었어요" done={p.fed} disabled={p.fed || !p.canCare} onClick={() => p.onCare("fed")} className={cls} style={pos?.[0]} />
      <CareButton icon={<PetHandIcon />} label="쓰다듬기" doneLabel="쓰다듬었어요" done={p.petted} disabled={p.petted || !p.canCare} onClick={() => p.onCare("petted")} className={cls} style={pos?.[1]} />
    </>
  );

  return (
    <>
      {/* 넓은 화면: 980×640 방을 화면 너비에 맞춰 줄여서 보여준다 */}
      <div ref={wrapRef} className="relative hidden w-full overflow-hidden rounded-[22px] shadow-[0_10px_40px_rgba(0,0,0,.35)] md:block" style={{ height: 640 * scale }}>
        <div className="absolute left-0 top-0 origin-top-left" style={{ width: 980, height: 640, transform: `scale(${scale})`, background: "#f6dcae" }}>
          <svg className="absolute inset-0 size-full" viewBox="0 0 980 640" aria-hidden>
            <defs>
              <pattern id="roomStripe" width="46" height="46" patternUnits="userSpaceOnUse"><rect width="46" height="46" fill="#f9e3b8" /><rect width="23" height="46" fill="#f5d8a4" /></pattern>
              <pattern id="roomFloor" width="140" height="40" patternUnits="userSpaceOnUse"><rect width="140" height="40" fill="#d9a86c" /><path d="M0 39.5H140M70 0V40" stroke="#c28f52" strokeWidth="2" /></pattern>
            </defs>
            <rect width="980" height="440" fill="url(#roomStripe)" />
            <rect y="425" width="980" height="16" fill="#b98550" />
            <rect y="441" width="980" height="199" fill="url(#roomFloor)" />
            <g transform="translate(95,70)">
              <rect width="190" height="230" rx="95" ry="95" fill="#2a3a78" stroke="#a97b45" strokeWidth="10" />
              <circle cx="120" cy="80" r="30" fill="#ffe9a8" /><circle cx="132" cy="72" r="26" fill="#2a3a78" />
              <g fill="#fff3c4"><circle cx="45" cy="60" r="3" /><circle cx="70" cy="130" r="2.5" /><circle cx="140" cy="150" r="3" /><circle cx="95" cy="40" r="2" /></g>
              <path d="M95 0V230M0 120H190" stroke="#a97b45" strokeWidth="7" />
            </g>
            <ellipse cx="490" cy="545" rx="270" ry="62" fill="#e7a29a" />
            <ellipse cx="490" cy="545" rx="235" ry="50" fill="#f3c3b8" />
            <ellipse cx="490" cy="545" rx="190" ry="38" fill="none" stroke="#fff0e6" strokeWidth="3" strokeDasharray="3 9" strokeLinecap="round" />
            <rect x="690" y="215" width="220" height="14" rx="4" fill="#a97b45" />
            <path d="M715 229v22M885 229v22" stroke="#a97b45" strokeWidth="6" />
            <g transform="translate(850,560)"><path d="M-30 -60h60l-8 60h-44z" fill="#d98c5f" /><path d="M0 -60C-30 -100 -35 -130 -12 -150C0 -125 10 -110 0 -60zM0 -60C25 -95 45 -105 55 -130C25 -135 8 -110 0 -60z" fill="#6fa86b" /></g>
          </svg>

          <i className="absolute top-0 h-[60px] w-0.5 bg-[#8a6a3f]" style={{ left: 445 }} /><i className="absolute top-0 h-[60px] w-0.5 bg-[#8a6a3f]" style={{ left: 535 }} />
          <div className="absolute rounded-2xl border-[3px] border-[#a97b45] bg-[#e0b57a] px-5 pb-2.5 pt-2 text-center shadow-[0_5px_0_rgba(120,80,30,.35)]" style={{ left: 490, top: 56, transform: "translateX(-50%)", minWidth: 190 }}><Sign p={p} /></div>
          {!p.renaming && <button type="button" onClick={p.onStartRename} className="calm absolute text-[13px] text-[#8a6a3f] underline" style={{ left: 610, top: 72 }}>이름 바꾸기</button>}

          <WallCalendar onClick={p.onOpenCalendar} className="absolute" style={{ left: 296, top: 78 }} />

          <div className="absolute flex flex-col items-center" style={{ left: 740, top: 150 }}>
            <StarJar />
            <span className="mt-0.5 rounded-full bg-[#fff6e2] px-3.5 py-1.5 text-sm font-medium text-ink shadow-[0_3px_0_rgba(120,80,30,.25)]">✦ 마음별 {p.points}</span>
          </div>

          <div className="absolute" style={{ left: 668, top: 290 }}><MoodFrames mood={p.mood} onMood={p.onMood} size={46} /></div>
          <p className="absolute text-[15px] font-bold text-ink" style={{ left: 668, top: 346 }}>오늘 마음 스티커를 붙여요</p>

          <Help p={p} className="absolute right-[22px] top-[22px]" />

          <p aria-live="polite" className="story absolute rounded-[18px] bg-[#fffaf0] px-4 py-2 text-[17px] text-ink shadow-[0_4px_12px_rgba(0,0,0,.2)]" style={{ left: 490, top: 150, transform: "translateX(-50%)" }}>{p.speech}</p>
          <div className="absolute rounded-[50%] bg-[rgba(70,40,10,.22)] blur-[3px]" style={{ left: 380, top: 470, width: 220, height: 34 }} />
          <div className="absolute" style={{ left: 340, top: 205, width: 300 }}><PetAvatar stage={p.stageIndex} mood={p.mood} action={p.action} className="w-full" /></div>
          {careButtons("absolute", [{ left: 120, top: 458 }, { left: 716, top: 458 }])}
          <div className="absolute" style={{ left: 390, top: 585, width: 200 }}><Growth p={p} light /></div>
        </div>
      </div>

      {/* 좁은 화면: 같은 방을 위에서 아래로 쌓는다 */}
      <div className="relative overflow-hidden rounded-[22px] shadow-[0_10px_40px_rgba(0,0,0,.35)] md:hidden">
        <div className="relative px-4 pb-4 pt-0" style={{ background: "repeating-linear-gradient(90deg,#f9e3b8 0 23px,#f5d8a4 23px 46px)" }}>
          <Help p={p} className="absolute right-3 top-3 z-10" />
          <div className="mx-auto flex w-fit flex-col items-center">
            <div className="flex gap-16"><i className="h-8 w-0.5 bg-[#8a6a3f]" /><i className="h-8 w-0.5 bg-[#8a6a3f]" /></div>
            <div className="rounded-2xl border-[3px] border-[#a97b45] bg-[#e0b57a] px-5 pb-2 pt-1.5 text-center shadow-[0_5px_0_rgba(120,80,30,.35)]"><Sign p={p} /></div>
            {!p.renaming && <button type="button" onClick={p.onStartRename} className="calm mt-1.5 text-[13px] text-[#8a6a3f] underline">이름 바꾸기</button>}
          </div>
          <div className="mt-3 flex items-start justify-between">
            <WallCalendar onClick={p.onOpenCalendar} className="relative mt-2" />
            <div className="flex flex-col items-center"><StarJar /><span className="mt-0.5 rounded-full bg-[#fff6e2] px-3 py-1 text-sm font-medium text-ink shadow-[0_3px_0_rgba(120,80,30,.25)]">✦ 마음별 {p.points}</span></div>
          </div>
          <p aria-live="polite" className="story relative mx-auto mt-3 w-fit max-w-[80%] rounded-[18px] bg-[#fffaf0] px-4 py-2 text-center text-[16px] text-ink shadow-[0_4px_12px_rgba(0,0,0,.2)]">{p.speech}</p>
          <PetAvatar stage={p.stageIndex} mood={p.mood} action={p.action} className="mx-auto mt-2 w-[240px]" />
          <div className="mt-2 flex flex-col items-center gap-2">
            <p className="text-[15px] font-bold text-ink">오늘 마음 스티커를 붙여요</p>
            <MoodFrames mood={p.mood} onMood={p.onMood} size={50} />
          </div>
        </div>
        <div className="border-t-[10px] border-[#b98550] px-4 pb-5 pt-5" style={{ background: "#d9a86c" }}>
          <div className="flex justify-center gap-4">{careButtons("")}</div>
          <div className="mt-4"><Growth p={p} light /></div>
        </div>
      </div>
    </>
  );
}
