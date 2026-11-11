"use client";

// 화면 안으로 들어올 때 아래에서 훅 치고 올라오며 나타난다 (한 번만).
// 멀리서(아래) 흐리고 작은 상태로 시작해, 끝에서 살짝 튕기듯 자리 잡는다.
// 움직임을 줄이는 설정이면 바로 보인다.

import { useEffect, useRef, useState, type ReactNode } from "react";

export default function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: shown ? `${delay}ms` : "0ms",
        transitionTimingFunction: "cubic-bezier(0.22, 1.2, 0.36, 1)",
      }}
      className={`transition-[opacity,transform,filter] duration-[900ms] will-change-transform motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:opacity-100 motion-reduce:blur-none motion-reduce:transition-none ${
        shown ? "translate-y-0 scale-100 opacity-100 blur-0" : "translate-y-48 scale-90 opacity-0 blur-md"
      } ${className}`}
    >
      {children}
    </div>
  );
}
