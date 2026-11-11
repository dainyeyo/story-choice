"use client";

import { useEffect, useRef, useState } from "react";
import type { FontSize } from "@/lib/settings";

/** CSS columns keep large type intact and turn overflowing text into extra reading pages. */
export function useReaderPagination(text: string, fontSize: FontSize, scene: number, enterAtEnd: boolean, active = true) {
  const textRef = useRef<HTMLDivElement>(null);
  const contentKey = `${scene}:${text}`;
  const [position, setPosition] = useState({ key: "", index: 0, count: 1, stride: 0 });
  const current = position.key === contentKey ? position : { index: 0, count: 1, stride: 0 };

  useEffect(() => {
    const element = textRef.current;
    if (!active || !element) return;
    let disposed = false;
    const measure = () => {
      if (disposed) return;
      const style = getComputedStyle(element);
      const paginated = style.columnCount === "1";
      const gap = parseFloat(style.columnGap) || 0;
      const stride = parseFloat(style.width) + gap;
      const count = paginated ? Math.max(1, Math.round((element.scrollWidth + gap) / stride)) : 1;
      setPosition((previous) => {
        const index = previous.key === contentKey ? Math.min(previous.index, count - 1) : enterAtEnd ? count - 1 : 0;
        return previous.key === contentKey && previous.index === index && previous.count === count && previous.stride === stride
          ? previous : { key: contentKey, index, count, stride };
      });
    };
    const frame = requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    void document.fonts.ready.then(measure);
    document.fonts.addEventListener("loadingdone", measure);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.fonts.removeEventListener("loadingdone", measure);
    };
  }, [contentKey, fontSize, enterAtEnd, active]);

  useEffect(() => {
    const element = textRef.current;
    if (!element) return;
    element.scrollLeft = current.index * current.stride;
  }, [current.index, current.count, current.stride, contentKey, active]);

  const turn = (direction: number) => setPosition((previous) => ({
    ...previous,
    index: Math.max(0, Math.min(previous.index + direction, previous.count - 1)),
  }));

  return { textRef, index: current.index, count: current.count, ready: position.key === contentKey, turn };
}
