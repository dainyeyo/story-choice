"use client";

import Link from "next/link";
import { useApp } from "../providers";
import Icon from "../components/Icon";
import { btnPrimary, COPING_NAME, PageHeader } from "../components/ui";

export default function LibraryPage() {
  const { library, deleteStory } = useApp();
  const fmt = (t: number) => new Date(t).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

  return (
    <main className="rise mx-auto w-full max-w-md px-4 py-8 md:max-w-3xl md:px-8 md:py-12">
      <PageHeader title="내 서재" sub="아이와 함께 읽은 동화와 대화 메모" />

      {library.length === 0 ? (
        <div className="mt-10 space-y-4 border-t border-line pt-8">
          <p className="text-ink-2">아직 끝까지 읽은 동화가 없어요.</p>
          <Link href="/create" className={`${btnPrimary} md:w-56`}>
            첫 동화 만들기
          </Link>
        </div>
      ) : (
        <ul className="mt-8 border-t border-line">
          {library.map((r) => (
            <li key={r.id} className="border-b border-line">
              <details className="group">
                <summary className="calm flex cursor-pointer list-none items-start justify-between gap-4 py-5 hover:bg-sunk/60 [&::-webkit-details-marker]:hidden">
                  <div className="space-y-1">
                    <p className="story text-xl text-ink">{r.title}</p>
                    <p className="text-sm text-ink-3">
                      {r.situation} · 만 {r.age}세 · {fmt(r.createdAt)}
                    </p>
                    {r.memo && <p className="text-[15px] text-ink-2">{r.memo}</p>}
                  </div>
                  <Icon name="right" className="mt-1 text-ink-3 transition-transform group-open:rotate-90" />
                </summary>

                <div className="space-y-6 pb-6 pt-1">
                  <section className="space-y-2">
                    <h2 className="text-sm text-ink-3">아이가 고른 선택</h2>
                    <ul className="space-y-1">
                      {r.choices.map((c, i) => (
                        <li key={i} className="text-[15px] text-ink">
                          {c.text}
                          <span className="ml-2 text-sm text-ink-3">{COPING_NAME[c.copingType] ?? c.copingType}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="space-y-2">
                    <h2 className="text-sm text-ink-3">대화 질문</h2>
                    <ol className="list-decimal space-y-1 pl-5 text-[15px] text-ink">
                      {r.card.questions.map((q, i) => (
                        <li key={i}>{q.text}</li>
                      ))}
                    </ol>
                  </section>

                  <section className="space-y-2">
                    <h2 className="text-sm text-ink-3">동화 다시 보기</h2>
                    <div className="story space-y-3 text-lg leading-8 text-ink">
                      {r.scenes.map((t, i) => (
                        <p key={i}>{t}</p>
                      ))}
                    </div>
                  </section>

                  <button
                    onClick={() => {
                      if (window.confirm("이 동화를 서재에서 지울까요? 되돌릴 수 없어요.")) deleteStory(r.id);
                    }}
                    className="calm text-sm text-danger underline hover:opacity-80"
                  >
                    삭제
                  </button>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
