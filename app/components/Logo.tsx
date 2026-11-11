// 픽토리 로고: 그림(Picture)이 이야기(Story)가 된다.
// 마크는 그림 액자(산과 해) 위에 책갈피가 걸린 모양이다. 책갈피는 읽는 화면의 책갈피와 같은 표시다.

export function LogoMark({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden className={`shrink-0 ${className}`}>
      <rect x="3" y="6" width="16" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="m3 17 4.5-4.5 3.5 3.5 2.5-2.5L19 17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="10.5" r="1.2" fill="currentColor" />
      <path d="M16.5 2.5h4.5v8l-2.25-1.8L16.5 10.5z" fill="#f59e0b" />
    </svg>
  );
}

export default function Logo() {
  return (
    <span className="flex items-center gap-2 text-ink">
      <LogoMark size={26} className="text-ink" />
      <span className="story text-xl tracking-wide">픽토리</span>
      <span className="sr-only">Pictory, 아이의 그림이 하나의 이야기가 됩니다</span>
    </span>
  );
}
