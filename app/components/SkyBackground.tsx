// 모든 화면 뒤에 깔리는 배경. 화면에 고정되어 스크롤해도 움직이지 않는다.
// 다크(기본): 밤하늘. 별, 초승달, 어두운 언덕과 불 켜진 집.
// 라이트: 종이 질감 위에 해와 포근한 언덕.
// 모드를 바꾸면 달과 해가 화면 아래 한 점을 중심으로 반 바퀴 돌아 자리를 바꾸고(달이 지고 해가 뜬다),
// 하늘색·별·구름·언덕이 함께 부드럽게 바뀐다. 모든 움직임은 html의 data-theme를 보는 CSS 전환이다(globals.css의 .sky-*).
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

function Hills({ tones, tree, house, window: win }: { tones: [string, string, string]; tree: string; house: string; window: string }) {
  return (
    <svg className="absolute inset-x-0 bottom-0 h-[210px] w-full md:h-[270px]" viewBox="0 0 1040 200" preserveAspectRatio="none">
      <path d="M0 110 Q200 50 420 105 T820 95 T1040 85 V200 H0z" fill={tones[0]} />
      <path d="M0 150 Q240 100 500 145 T1040 130 V200 H0z" fill={tones[1]} />
      <path d="M0 188 Q260 150 540 180 T1040 172 V200 H0z" fill={tones[2]} />
      <g fill={tree}>
        <path d="M120 150l-14 30h28z" />
        <path d="M120 134l-11 24h22z" />
        <path d="M900 148l-14 34h28z" />
        <path d="M900 130l-11 26h22z" />
      </g>
      <rect x="505" y="150" width="30" height="24" fill={house} />
      <rect x="514" y="157" width="6" height="8" fill={win} />
    </svg>
  );
}

export default function SkyBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* 하늘색: 밤 위에 낮이 겹쳐 서서히 드러난다 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0e1a3a] via-[#1d2b5a] to-[#3a3a73]" />
      <div className="sky-fade sky-day-only absolute inset-0 bg-[#fff7e8]" style={{ backgroundImage: PAPER_NOISE }} />

      {/* 별과 구름 */}
      <svg className="sky-fade sky-night-only absolute inset-0 h-full w-full" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice">
        {STARS.map((s, i) => (
          <circle key={i} className="sky-star" cx={s.cx} cy={s.cy} r={s.r} fill="#fff" style={{ animationDelay: `-${s.delay}s` }} />
        ))}
      </svg>
      <svg className="sky-fade sky-day-only absolute inset-0 h-full w-full" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice">
        <g fill="#fff" opacity=".75">
          <ellipse cx="180" cy="150" rx="60" ry="16" />
          <ellipse cx="220" cy="140" rx="40" ry="16" />
          <ellipse cx="640" cy="110" rx="50" ry="13" />
          <ellipse cx="675" cy="102" rx="32" ry="13" />
        </g>
      </svg>

      {/* 해와 달: 화면 아래 가운데를 중심으로 도는 궤도 위에 서로 반대편에 있다 */}
      <div className="sky-orbit absolute left-1/2 top-[88%] h-0 w-0">
        <div className="sky-body sky-moon absolute">
          <svg width="96" height="96" viewBox="-48 -48 96 96">
            <circle r="46" fill="#ffe9a8" opacity=".14" />
            <circle r="30" fill="#ffe9a8" opacity=".2" />
            <circle r="20" fill="#fff1c4" />
            <circle cx="8" cy="-4" r="17" fill="#1b2750" />
          </svg>
        </div>
        <div className="sky-body sky-sun absolute">
          <svg width="160" height="160" viewBox="-80 -80 160 160">
            <circle r="76" fill="#ffd98a" opacity=".16" />
            <circle r="52" fill="#ffd98a" opacity=".26" />
            <circle r="30" fill="#ffd47a" />
          </svg>
        </div>
      </div>

      {/* 언덕은 해와 달 앞에 있어서 뜨고 질 때 언덕 뒤로 숨는다 */}
      <div className="sky-fade sky-night-only absolute inset-0">
        <Hills tones={["#1a2650", "#131d40", "#0b132e"]} tree="#0b132e" house="#0b132e" window="#ffd36b" />
      </div>
      <div className="sky-fade sky-day-only absolute inset-0">
        <Hills tones={["#f3e4c4", "#ecd9b0", "#e3cc9f"]} tree="#d9bf8c" house="#d9bf8c" window="#f5a623" />
      </div>
    </div>
  );
}
