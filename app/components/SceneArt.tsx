// 삽화 자리. 이미지 담당이 여기에 장면 그림(<img>)을 넣는다. index는 현재 쪽 번호.
// 그림이 준비되기 전에는 이모지가 들어간 자리표시 카드를 보여준다.

const EMOJIS = ["🌙", "🌳", "🐰", "⭐", "🏡", "🦋", "🌈", "🍀", "☁️"];

export default function SceneArt({ index }: { index: number }) {
  return (
    <div
      className="flex aspect-[4/3] w-full items-center justify-center rounded-3xl bg-gradient-to-br from-amber-100 via-rose-100 to-sky-100 text-7xl shadow-inner"
      aria-hidden
    >
      {EMOJIS[index % EMOJIS.length]}
    </div>
  );
}
