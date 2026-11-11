"use client";

import { useEffect, useMemo, useState } from "react";

const LINES = ["오늘은 특별한 날이야…", "마음 깊은 곳에서 작은 알이 반짝여요", "나의 마음친구를 만나봐요"];

// 마음친구를 처음 만나는 장면: 글이 타이핑되고, 알이 흔들리다 깨지며 방이 밝아진다.
// 알이 깨지는 순간 onReveal(몽이가 튀어나오기 시작), 장면이 다 사라지면 onDone.
export default function HatchIntro({ onReveal, onDone }: { onReveal: () => void; onDone: () => void }) {
  const [line, setLine] = useState("");
  const [typing, setTyping] = useState(true);
  const [lineOut, setLineOut] = useState(false);
  const [eggShown, setEggShown] = useState(false);
  const [glow, setGlow] = useState(false);
  const [eggMode, setEggMode] = useState("");
  const [cracks, setCracks] = useState(0);
  const [flash, setFlash] = useState(false);
  const [gone, setGone] = useState(false);
  const stars = useMemo(() => Array.from({ length: 46 }, (_, i) => ({ left: `${(i * 37) % 100}%`, top: `${(i * 53 + 11) % 100}%`, delay: `${((i * 7) % 24) / 10}s` })), []);

  useEffect(() => {
    let cancelled = false;
    const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));
    const alive = () => !cancelled;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onReveal();
      onDone();
      return;
    }

    (async () => {
      await sleep(700);
      for (let k = 0; k < LINES.length; k++) {
        setLineOut(false);
        setTyping(true);
        for (let i = 1; i <= LINES[k].length; i++) {
          if (!alive()) return;
          setLine(LINES[k].slice(0, i));
          await sleep(75);
        }
        await sleep(1000);
        if (!alive()) return;
        if (k < LINES.length - 1) { setLineOut(true); await sleep(750); if (!alive()) return; }
      }
      setGlow(true); setEggShown(true); setEggMode("w1");
      await sleep(1700); if (!alive()) return;
      setLineOut(true); setTyping(false);
      await sleep(2200); if (!alive()) return;
      setEggMode("w2"); setCracks(1);
      await sleep(900); if (!alive()) return;
      setCracks(3);
      await sleep(1100); if (!alive()) return;
      setFlash(true);
      await sleep(380); if (!alive()) return;
      setEggMode("burst"); setGlow(false);
      await sleep(500); if (!alive()) return;
      setGone(true);
      onReveal();
      await sleep(1100); if (!alive()) return;
      onDone();
    })();

    return () => { cancelled = true; };
    // 한 번만 재생한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const skip = () => { onReveal(); onDone(); };

  return (
    <div className={`hatch-overlay fixed inset-0 z-[60] overflow-hidden ${gone ? "pointer-events-none opacity-0" : ""}`} role="dialog" aria-label="마음친구와의 첫 만남">
      <div aria-hidden>{stars.map((star, i) => <i key={i} className="hatch-star" style={{ left: star.left, top: star.top, animationDelay: star.delay }} />)}</div>
      <div aria-hidden className={`hatch-glow ${glow ? "on" : ""} absolute left-1/2 top-[52%] -ml-[260px] -mt-[260px] size-[520px] rounded-full`} style={{ background: "radial-gradient(circle, rgba(255,226,150,.55), rgba(255,226,150,0) 68%)" }} />
      <p aria-live="polite" className={`story absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 text-center text-[26px] text-[#fff1c9] transition-opacity duration-700 md:text-[34px] ${lineOut ? "opacity-0" : ""}`} style={{ textShadow: "0 0 18px rgba(255,220,140,.55)", minHeight: 48 }}>
        {line}{typing && <span className="hatch-cursor" />}
      </p>
      <div aria-hidden className={`hatch-eggwrap ${eggShown ? "show" : ""} absolute left-1/2 top-[52%] -ml-[105px] -mt-[131px] h-[262px] w-[210px]`}>
        <svg viewBox="0 0 160 200" className={`hatch-egg size-full ${eggMode}`}>
          <defs>
            <clipPath id="hatch-ct"><path d="M-40 -40H200V115L140 100 120 122 100 102 80 124 60 102 40 122 20 100 0 115H-40Z" /></clipPath>
            <clipPath id="hatch-cb"><path d="M-40 115H0L20 100 40 122 60 102 80 124 100 102 120 122 140 100 160 115H200V240H-40Z" /></clipPath>
            <g id="hatch-shape">
              <path d="M80 8C125 8 152 80 152 127C152 172 122 194 80 194C38 194 8 172 8 127C8 80 35 8 80 8Z" fill="#fbe6b8" stroke="#5a3e28" strokeWidth="3.5" strokeLinejoin="round" />
              <g fill="#f1c98f"><circle cx="52" cy="60" r="7" /><circle cx="108" cy="82" r="9" /><circle cx="60" cy="150" r="8" /><circle cx="112" cy="156" r="6" /></g>
              <path d="M44 40c8-14 22-22 36-24" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" opacity=".7" />
            </g>
          </defs>
          <g className="hatch-half hatch-top" clipPath="url(#hatch-ct)"><use href="#hatch-shape" /></g>
          <g className="hatch-half hatch-bot" clipPath="url(#hatch-cb)"><use href="#hatch-shape" /></g>
          <path className={`hatch-crack ${cracks >= 1 ? "draw" : ""}`} pathLength={1} d="M8 118L20 100 40 122 60 102 80 124 100 102 120 122 140 100 152 118" />
          <path className={`hatch-crack ${cracks >= 3 ? "draw" : ""}`} pathLength={1} d="M80 124L76 142 86 156" />
          <path className={`hatch-crack ${cracks >= 3 ? "draw" : ""}`} pathLength={1} d="M60 102L54 84 62 72" />
        </svg>
      </div>
      <div aria-hidden className={`hatch-flash ${flash ? "go" : ""} pointer-events-none absolute inset-0`} />
      <button type="button" onClick={skip} className="calm absolute bottom-5 right-5 rounded-full bg-[rgba(255,246,226,.9)] px-4 py-2 text-sm font-bold text-ink">건너뛰기</button>
    </div>
  );
}
