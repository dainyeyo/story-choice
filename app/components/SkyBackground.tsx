// 모든 화면 뒤에 깔리는 밤하늘: 별, 초승달, 어두운 언덕과 불 켜진 집. 화면에 고정되어 스크롤해도 움직이지 않는다.
// 서버에서 한 번만 그려지는 정적 그림이고, 별 위치는 고정된 값에서 만든다(렌더마다 같다).

const STARS = (() => {
  let x = 3;
  const rnd = () => (x = (x * 9301 + 49297) % 233280) / 233280;
  return Array.from({ length: 90 }, () => ({
    cx: Math.round(rnd() * 1000),
    cy: Math.round(rnd() * 620),
    r: Number((0.6 + rnd() * 1.6).toFixed(1)),
    delay: Number((rnd() * 3).toFixed(1)),
  }));
})();

export default function SkyBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-gradient-to-b from-[#0e1a3a] via-[#1d2b5a] to-[#3a3a73]">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice">
        {STARS.map((s, i) => (
          <circle key={i} className="sky-star" cx={s.cx} cy={s.cy} r={s.r} fill="#fff" style={{ animationDelay: `-${s.delay}s` }} />
        ))}
        <path d="M640 130 L590 155" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity=".5" />
        <g transform="translate(890 160)">
          <circle r="46" fill="#ffe9a8" opacity=".14" />
          <circle r="30" fill="#ffe9a8" opacity=".2" />
          <circle r="20" fill="#fff1c4" />
          <circle cx="8" cy="-4" r="17" fill="#1b2750" />
        </g>
      </svg>
      <svg className="absolute inset-x-0 bottom-0 h-[160px] w-full md:h-[200px]" viewBox="0 0 1040 200" preserveAspectRatio="none">
        <path d="M0 110 Q200 50 420 105 T820 95 T1040 85 V200 H0z" fill="#1a2650" />
        <path d="M0 150 Q240 100 500 145 T1040 130 V200 H0z" fill="#131d40" />
        <path d="M0 188 Q260 150 540 180 T1040 172 V200 H0z" fill="#0b132e" />
        <g fill="#0b132e">
          <path d="M120 150l-14 30h28z" />
          <path d="M120 134l-11 24h22z" />
          <path d="M900 148l-14 34h28z" />
          <path d="M900 130l-11 26h22z" />
        </g>
        <rect x="505" y="150" width="30" height="24" fill="#0b132e" />
        <rect x="514" y="157" width="6" height="8" fill="#ffd36b" />
      </svg>
    </div>
  );
}
