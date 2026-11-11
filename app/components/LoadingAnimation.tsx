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

export function DrawingAnimation() {
  return (
    <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-xl bg-sunk text-accent-text" role="status">
      <svg viewBox="0 0 160 120" className="h-28 w-36" aria-hidden="true">
        <rect x="19" y="17" width="122" height="86" rx="6" fill="#fffdf8" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="112" cy="39" r="9" fill="#f8d796" />
        <path className="drawing-lines" d="M28 86 54 57l18 19 13-13 27 23H28Z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" pathLength="100" />
        <g className="drawing-pencil">
          <path d="m80 75 24-38 7 4-24 38-10 5Z" fill="#f5b747" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="m77 84 3-9 7 4Z" fill="#fff7e8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </g>
      </svg>
      <span className="story text-base text-ink-2">이 장면의 그림을 그리고 있어요</span>
    </div>
  );
}
