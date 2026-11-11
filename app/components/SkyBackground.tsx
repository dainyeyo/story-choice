// 모든 화면 뒤에 깔리는 배경. 화면에 고정되어 스크롤해도 움직이지 않는다.
// 다크(기본): 밤하늘. 별, 초승달, 어두운 언덕과 불 켜진 집.
// 라이트: 종이 질감 위에 해와 포근한 언덕.
// 어느 쪽이 보일지는 html의 data-theme에 따라 CSS가 고른다(globals.css의 .sky-night / .sky-day).
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

const PAPER_NOISE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.45 0 0 0 0 0.33 0 0 0 0 0.18 0 0 0 0.10 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

export default function SkyBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="sky-night absolute inset-0 bg-gradient-to-b from-[#0e1a3a] via-[#1d2b5a] to-[#3a3a73]">
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

      <div className="sky-day absolute inset-0 bg-[#fff7e8]" style={{ backgroundImage: PAPER_NOISE }}>
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice">
          <g transform="translate(890 160)">
            <circle r="70" fill="#ffd98a" opacity=".16" />
            <circle r="46" fill="#ffd98a" opacity=".25" />
            <circle r="26" fill="#ffd47a" />
          </g>
          <g fill="#fff" opacity=".7">
            <ellipse cx="180" cy="150" rx="60" ry="16" />
            <ellipse cx="220" cy="140" rx="40" ry="16" />
            <ellipse cx="640" cy="110" rx="50" ry="13" />
            <ellipse cx="675" cy="102" rx="32" ry="13" />
          </g>
        </svg>
        <svg className="absolute inset-x-0 bottom-0 h-[160px] w-full md:h-[200px]" viewBox="0 0 1040 200" preserveAspectRatio="none">
          <path d="M0 110 Q200 50 420 105 T820 95 T1040 85 V200 H0z" fill="#f3e4c4" />
          <path d="M0 150 Q240 100 500 145 T1040 130 V200 H0z" fill="#ecd9b0" />
          <path d="M0 188 Q260 150 540 180 T1040 172 V200 H0z" fill="#e3cc9f" />
          <g fill="#d9bf8c">
            <path d="M120 150l-14 30h28z" />
            <path d="M120 134l-11 24h22z" />
            <path d="M900 148l-14 34h28z" />
            <path d="M900 130l-11 26h22z" />
          </g>
          <rect x="505" y="150" width="30" height="24" fill="#d9bf8c" />
          <rect x="514" y="157" width="6" height="8" fill="#f5a623" />
        </svg>
      </div>
    </div>
  );
}
