// 픽토리 로고: 책 위에 잠든 달. 그림(Picture)이 이야기(Story)가 되어 잠자리에서 읽힌다.
// 마크 이미지는 public/pictory-mark.png, 전체 로고(워드마크 포함)는 public/pictory-logo.png.

/* eslint-disable @next/next/no-img-element */
export function LogoMark({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src="/pictory-mark.png"
      alt=""
      aria-hidden
      width={size}
      height={Math.round((size * 383) / 416)}
      className={`shrink-0 ${className}`}
    />
  );
}

// 마크와 워드마크가 함께 있는 전체 로고 (로그인, 소개 화면 등 큰 자리용)
export function LogoFull({ height = 80, className = "" }: { height?: number; className?: string }) {
  return (
    <img
      src="/pictory-logo.png"
      alt="Pictory 픽토리"
      height={height}
      width={Math.round((height * 1272) / 472)}
      className={className}
    />
  );
}

export default function Logo() {
  return (
    <span className="flex items-center">
      <LogoFull height={70} className="h-[58px] w-auto md:h-[70px]" />
      <span className="sr-only">Pictory, 아이의 그림이 하나의 이야기가 됩니다</span>
    </span>
  );
}
