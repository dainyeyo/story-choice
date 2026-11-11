export function WritingAnimation() {
  return (
    <svg viewBox="0 0 120 90" className="h-20 w-28 text-accent-text" aria-hidden="true">
      <path d="M60 26C48 18 29 18 14 23v45c17-5 33-4 46 5 13-9 29-10 46-5V23c-15-5-34-5-46 3Z" fill="#fff7e8" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M60 26v47M21 32c10-2 20-1 29 2M21 40c10-2 20-1 29 2M21 48c10-2 20-1 29 2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".45" />
      <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path className="writing-line writing-line-1" d="M68 35h24" pathLength="100" />
        <path className="writing-line writing-line-2" d="M68 43h20" pathLength="100" />
        <path className="writing-line writing-line-3" d="M68 51h24" pathLength="100" />
      </g>
      <g className="writing-pencil">
        <path d="m72 35 15-24 5 3-15 24-7 4Z" fill="#f5b747" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="m70 42 2-7 5 3Z" fill="#fff7e8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export function DrawingAnimation({ fill = false }: { fill?: boolean }) {
  return (
    <div className={`flex aspect-[4/3] ${fill ? "md:aspect-auto md:h-full md:min-h-64" : ""} w-full flex-col items-center justify-center gap-3 rounded-xl bg-sunk text-accent-text`} role="status">
      <svg viewBox="0 0 160 120" className="h-28 w-36" aria-hidden="true">
        <path className="drawing-stroke" d="M30 76h90" fill="none" stroke="#d98c58" strokeWidth="10" strokeLinecap="round" pathLength="100" />
        <g className="drawing-brush">
          <path d="m32 67 24-36a5 5 0 0 1 8 5L40 72Z" fill="#d9a66d" stroke="#8d603f" strokeWidth="2" strokeLinejoin="round" />
          <path d="m32 67 8 5-3 5-8-5Z" fill="#f1d3a5" stroke="#8d603f" strokeWidth="1.5" />
          <path d="M29 72c-2 3-2 5-5 7 5 1 10 0 13-2Z" fill="#d98c58" />
        </g>
      </svg>
      <span className="story text-base text-ink-2">이 장면의 그림을 그리고 있어요</span>
    </div>
  );
}
