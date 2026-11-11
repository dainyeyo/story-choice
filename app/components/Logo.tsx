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
    // 다크 모드(밤하늘)에서는 글자·테두리만 흰색으로 바꾼 로고(pictory-logo-dark.png, 노란 메인 색은 그대로)를 보여 주고,
    // 은은한 빛 번짐 위에 올려 배경에 섞는다. 어느 쪽을 보일지는 globals.css의 .logo-light / .logo-dark가 고른다
    <span className="logo-glow flex items-center rounded-2xl px-3 py-0.5">
      <LogoFull height={70} className="logo-light h-[48px] w-auto md:h-[58px]" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/pictory-logo-dark.png"
        alt=""
        aria-hidden
        width={Math.round((70 * 1272) / 472)}
        height={70}
        className="logo-dark h-[48px] w-auto md:h-[58px]"
      />
      <span className="sr-only">Pictory, 아이의 그림이 하나의 이야기가 됩니다</span>
    </span>
  );
}
