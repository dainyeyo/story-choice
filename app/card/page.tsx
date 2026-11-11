"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "../providers";
import Icon from "../components/Icon";
import { btnPrimary, btnSecondary, Card, inputCls, Label, PageHeader } from "../components/ui";

// 부모 전용 화면. 아이가 바로 넘겨 보지 않도록 간단한 확인 문제를 둔다.
export default function CardPage() {
  const { s, saveMemo } = useApp();
  const router = useRouter();

  const [memo, setMemo] = useState("");
  const [memoSaved, setMemoSaved] = useState(false);

  useEffect(() => {
    if (s.step === "story") router.replace("/read");
    else if (s.step === "form") router.replace("/library");
  }, [s.step, router]);

  if (s.step === "loading") {
    return (
      <main className="page-turn mx-auto w-full max-w-md px-4 py-16">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-line bg-surface px-6 py-20 text-center">
          <Icon name="book" size={32} className="text-accent-text" />
          <p aria-live="polite" className="story text-xl text-ink">
            대화 카드를 만들고 있어요
          </p>
        </div>
      </main>
    );
  }

  if (s.step !== "card" || !s.card) return null;

  return (
    <main className="page-turn mx-auto w-full max-w-md px-4 py-8 md:max-w-2xl md:px-8 md:py-12">
      <PageHeader title="오늘의 대화 카드" />
      <p className="mt-4 text-lg leading-8 text-sky-ink-2">{s.card.summary}</p>

      <ol className="mt-8 border-t border-sky-ink/20">
        {s.card.questions.map((q, i) => (
          <li key={i} className="flex gap-4 border-b border-sky-ink/20 py-5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-sky-ink/30 text-sm tabular-nums text-sky-ink-2">
              {i + 1}
            </span>
            <div className="space-y-1">
              <p className="story text-xl leading-8 text-sky-ink">“{q.text}”</p>
              <p className="text-[15px] leading-7 text-sky-ink-2">{q.hint}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6 rounded-xl bg-sunk px-4 py-4">
        <p className="text-sm text-ink-3">아이의 답을 받는 방법</p>
        <p className="mt-1 text-[15px] leading-7 text-ink">{s.card.answerTip}</p>
      </div>

      <Card className="mt-8 space-y-4">
        <label className="block space-y-2">
          <Label>아이가 뭐라고 했나요? 한 줄 메모</Label>
          <input
            value={memo}
            onChange={(e) => {
              setMemo(e.target.value);
              setMemoSaved(false);
            }}
            maxLength={200}
            placeholder="예: 윙 소리가 무섭대요"
            className={inputCls}
          />
        </label>
        <div className="flex flex-col gap-3 md:flex-row">
          <button
            onClick={() => {
              saveMemo(memo);
              setMemoSaved(true);
            }}
            disabled={!memo.trim()}
            className={btnSecondary}
          >
            {memoSaved ? (
              <>
                <Icon name="check" size={18} />
                저장됨
              </>
            ) : (
              "메모 저장"
            )}
          </button>
          <button
            onClick={() => {
              if (memo.trim() && !memoSaved) saveMemo(memo);
              void s.nextStory(memo.trim() || s.savedMemo);
              router.push("/read");
            }}
            disabled={!memo.trim() && !s.savedMemo}
            className={`${btnPrimary} md:flex-1`}
          >
            메모를 이어서 다음 동화
          </button>
        </div>
        {memoSaved && <p className="text-sm text-ink-3">내 서재에서 다시 볼 수 있어요</p>}
      </Card>

      <p className="mt-6 text-center">
        <Link href="/library" className="calm text-[15px] text-sky-ink-2 underline hover:text-sky-ink">
          내 서재로 가기
        </Link>
      </p>
    </main>
  );
}
