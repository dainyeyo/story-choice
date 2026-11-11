"use client";

// 스크롤을 내리면 첫 화면 문구가 위로 빨려 올라가며 작아지고 흐려진다.
// 아래 내용이 치고 올라오는 Reveal과 맞물려 "훅 내려가는" 느낌을 만든다.

import { useEffect, useRef, type ReactNode } from "react";

export default function HeroParallax({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const p = Math.min(Math.max(window.scrollY / (window.innerHeight * 0.55), 0), 1);
      el.style.transform = `translate3d(0, ${-p * 140}px, 0) scale(${1 - p * 0.12})`;
      el.style.opacity = String(1 - p * 1.1 > 0 ? 1 - p * 1.1 : 0);
      el.style.filter = p > 0.02 ? `blur(${p * 8}px)` : "none";
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="will-change-transform">
      {children}
    </div>
  );
}
