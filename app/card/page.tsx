"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "../providers";
import { bigBtn, Card, inputCls, softBtn } from "../components/ui";

// 부모 전용 화면. 아이가 바로 넘겨 보지 않도록 간단한 확인 문제를 둔다.
export default function CardPage() {
  const { s, saveMemo } = useApp();
  const router = useRouter();

  const [unlocked, setUnlocked] = useState(false);
  const [answer, setAnswer] = useState("");
  const [memo, setMemo] = useState("");
  const [memoSaved, setMemoSaved] = useState(false);

  useEffect(() => {
    if (s.step === "story") router.replace("/read");
    else if (s.step === "form") router.replace("/library");
  }, [s.step, router]);

  if (s.step === "loading") {
    return (
      <main className="mx-auto w-full max-w-md px-4 py-10">
        <Card className="space-y-3 py-16 text-center">
          <div className="animate-bounce text-5xl">💬</div>
          <p aria-live="polite" className="font-[family-name:var(--font-story)] text-xl text-amber-800">
            대화 카드를 만들고 있어요…
          </p>
        </Card>
      </main>
    );
  }

  if (s.step !== "card" || !s.card) return null;

  if (!unlocked) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-8">
        <Card className="space-y-4 text-center">
          <div className="text-5xl">👨‍👩‍👧</div>
          <h1 className="font-[family-name:var(--font-story)] text-2xl text-amber-800">부모님께 넘겨 주세요</h1>
          <p className="text-stone-600">아이의 선택을 바탕으로 한 대화 질문이 준비됐어요. 아래 문제를 풀면 열려요.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (answer.trim() === "12") setUnlocked(true);
              else setAnswer("");
            }}
            className="space-y-3"
          >
            <label className="block text-lg font-bold text-amber-900">
              7 + 5 = ?
              <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                className={`${inputCls} mt-2 text-center`}
              />
            </label>
            <button type="submit" className={bigBtn}>
              열기
            </button>
          </form>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-6 md:max-w-2xl md:px-8 md:py-10">
      <Card className="space-y-2">
        <h1 className="font-[family-name:var(--font-story)] text-xl text-amber-800">💬 오늘의 대화 카드</h1>
        <p className="leading-relaxed text-stone-700">{s.card.summary}</p>
      </Card>

      <ol className="space-y-3">
        {s.card.questions.map((q, i) => (
          <li key={i}>
            <Card>
              <p className="text-lg font-bold text-stone-800">
                {i + 1}. “{q.text}”
              </p>
              <p className="mt-1 text-sm text-stone-600">→ {q.hint}</p>
            </Card>
          </li>
        ))}
      </ol>

      <p className="rounded-2xl bg-sky-50 p-3 text-sm text-sky-900 ring-1 ring-sky-200">💡 {s.card.answerTip}</p>

      <Card className="space-y-3">
        <label className="block">
          <span className="font-semibold text-amber-900">아이가 뭐라고 했나요? (한 줄 메모)</span>
          <input
            value={memo}
            onChange={(e) => {
              setMemo(e.target.value);
              setMemoSaved(false);
            }}
            maxLength={200}
            placeholder="예: 윙 소리가 무섭대요"
            className={`${inputCls} mt-1`}
          />
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => {
              saveMemo(memo);
              setMemoSaved(true);
            }}
            disabled={!memo.trim()}
            className={softBtn}
          >
            메모 저장
          </button>
          <button
            onClick={() => {
              if (memo.trim() && !memoSaved) saveMemo(memo);
              void s.nextStory(memo.trim() || s.savedMemo);
              router.push("/read");
            }}
            disabled={!memo.trim() && !s.savedMemo}
            className="flex-1 rounded-2xl bg-amber-500 px-4 py-3 font-bold text-white disabled:opacity-40"
          >
            메모 이어서 다음 동화
          </button>
        </div>
        {memoSaved && <p className="text-sm text-green-700">저장했어요 ✔ 내 서재에서 다시 볼 수 있어요.</p>}
      </Card>

      <Link href="/library" className="text-center text-sm text-amber-800 underline">
        내 서재로 가기
      </Link>
    </main>
  );
}
