"use client";

// 화면 골격: 입력 → 동화 뷰어(선택) → 부모 카드 → 메모 → 다음 동화
// 일부러 꾸미지 않았다. 로직은 전부 useStory 훅(app/useStory.ts)에 있고, 이 파일은 훅의 값을 그리기만 한다.
// 새 화면(목업)으로 갈아끼울 때는 이 파일을 통째로 바꾸고 useStory만 연결하면 된다.

import { useState } from "react";
import { PRESETS } from "@/lib/story/presets";
import { useStory } from "./useStory";


export default function StoryApp() {
  const s = useStory();

  // 입력 폼 값 (화면에만 필요한 상태)
  const [age, setAge] = useState(5);
  const [situation, setSituation] = useState("");
  const [durationMin, setDurationMin] = useState<3 | 5>(5);
  const [protagonist, setProtagonist] = useState("");

  // 메모 입력 (화면에만 필요한 상태)
  const [memo, setMemo] = useState("");
  const [memoSaved, setMemoSaved] = useState(false);

  return (
    <main className="mx-auto max-w-md space-y-6 p-4 text-base">
      <h1 className="text-xl font-bold">AI 정서 동화</h1>

      {s.error && (
        <p role="alert" className="rounded border border-red-400 bg-red-50 p-3 text-red-700">
          {s.error}
        </p>
      )}

      {s.usedFallback && (
        <p className="rounded bg-gray-100 p-2 text-sm text-gray-600">
          AI가 바빠서 미리 준비한 이야기를 들려드리고 있어요.
        </p>
      )}

      {s.step === "loading" && <p aria-live="polite">동화를 만들고 있어요…</p>}

      {s.step === "form" && (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void s.start({ age, situation, durationMin, protagonist });
          }}
        >
          <fieldset className="space-y-2">
            <legend className="font-semibold">아이의 고민 상황</legend>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSituation(p)}
                  className={`rounded border px-3 py-1 ${situation === p ? "bg-black text-white" : ""}`}
                >
                  {p}
                </button>
              ))}
            </div>
            <textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              maxLength={200}
              rows={3}
              placeholder="직접 입력 (200자 이하). 아이 이름은 쓰지 마세요."
              className="w-full rounded border p-2"
            />
          </fieldset>

          <label className="block">
            <span className="font-semibold">아이 나이</span>
            <select value={age} onChange={(e) => setAge(Number(e.target.value))} className="ml-2 rounded border p-1">
              {[4, 5, 6, 7].map((a) => (
                <option key={a} value={a}>
                  만 {a}세
                </option>
              ))}
            </select>
          </label>

          <fieldset className="flex items-center gap-4">
            <legend className="font-semibold">동화 길이</legend>
            {([3, 5] as const).map((m) => (
              <label key={m} className="flex items-center gap-1">
                <input type="radio" checked={durationMin === m} onChange={() => setDurationMin(m)} />
                {m}분
              </label>
            ))}
          </fieldset>

          <label className="block">
            <span className="font-semibold">주인공</span>
            <input
              value={protagonist}
              onChange={(e) => setProtagonist(e.target.value)}
              maxLength={50}
              placeholder="예: 파란 토끼 (비워도 돼요)"
              className="mt-1 w-full rounded border p-2"
            />
            <span className="text-sm text-gray-500">그림 업로드와 캐릭터 변환은 이미지 담당이 이 자리에 붙입니다.</span>
          </label>

          {s.savedMemo && (
            <p className="rounded bg-yellow-50 p-2 text-sm">
              지난 동화의 메모가 있어요: “{s.savedMemo}” — 이번 동화에 이어져요.
            </p>
          )}

          <button type="submit" className="w-full rounded bg-black p-3 text-white">
            동화 만들기
          </button>
        </form>
      )}

      {s.step === "story" && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">{s.title}</h2>
          {s.scenes.map((text, i) => (
            <p key={i} className="leading-relaxed">
              {text}
            </p>
          ))}

          {s.choice && !s.isEnding && (
            <div className="space-y-2">
              <p className="font-semibold">{s.choice.prompt}</p>
              {s.choice.options.map((o) => (
                <button key={o.id} onClick={() => void s.pick(o)} className="block w-full rounded border p-3 text-left">
                  {o.text}
                </button>
              ))}
            </div>
          )}

          {s.isEnding && (
            <button onClick={() => void s.showCard()} className="w-full rounded bg-black p-3 text-white">
              부모 카드 보기
            </button>
          )}
        </section>
      )}

      {s.step === "card" && s.card && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">부모 카드</h2>
          <p>{s.card.summary}</p>
          <ol className="space-y-3">
            {s.card.questions.map((q, i) => (
              <li key={i} className="rounded border p-3">
                <p className="font-semibold">“{q.text}”</p>
                <p className="text-sm text-gray-600">→ {q.hint}</p>
              </li>
            ))}
          </ol>
          <p className="text-sm">💡 {s.card.answerTip}</p>

          <div className="space-y-2 border-t pt-4">
            <label className="block">
              <span className="font-semibold">아이가 뭐라고 했나요? (한 줄 메모)</span>
              <input
                value={memo}
                onChange={(e) => {
                  setMemo(e.target.value);
                  setMemoSaved(false);
                }}
                maxLength={200}
                placeholder="예: 윙 소리가 무섭대요"
                className="mt-1 w-full rounded border p-2"
              />
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  s.saveMemo(memo);
                  setMemoSaved(true);
                }}
                className="rounded border px-3 py-2"
              >
                메모 저장
              </button>
              <button
                onClick={() => {
                  setMemo("");
                  setMemoSaved(false);
                  void s.nextStory(memo || s.savedMemo);
                }}
                disabled={!memo.trim() && !s.savedMemo}
                className="flex-1 rounded bg-black px-3 py-2 text-white disabled:opacity-40"
              >
                다음 동화 만들기
              </button>
            </div>
            {memoSaved && <p className="text-sm text-green-700">저장했어요.</p>}
          </div>

          <button onClick={s.reset} className="text-sm underline">
            처음으로
          </button>
        </section>
      )}
    </main>
  );
}
