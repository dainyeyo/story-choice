"use client";

import Link from "next/link";
import { useApp } from "../providers";
import { bigBtn, Card, COPING_LABEL, Title } from "../components/ui";

export default function LibraryPage() {
  const { library, deleteStory } = useApp();

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-6 md:max-w-3xl md:px-8 md:py-10">
      <Title sub="우리 아이와 함께 읽은 동화와 대화 메모">📚 내 서재</Title>

      {library.length === 0 ? (
        <Card className="space-y-4 py-10 text-center">
          <div className="text-5xl">📭</div>
          <p className="text-stone-600">아직 끝까지 읽은 동화가 없어요.</p>
          <Link href="/create" className={`${bigBtn} mx-auto max-w-xs`}>
            첫 동화 만들기
          </Link>
        </Card>
      ) : (
        <ul className="space-y-3">
          {library.map((r) => (
            <li key={r.id}>
              <Card>
                <details>
                  <summary className="cursor-pointer list-none space-y-1">
                    <p className="font-[family-name:var(--font-story)] text-xl text-amber-900">{r.title}</p>
                    <p className="text-sm text-stone-500">
                      {r.situation} · 만 {r.age}세 · {new Date(r.createdAt).toLocaleDateString("ko-KR")}
                    </p>
                    {r.memo && <p className="text-stone-700">📝 {r.memo}</p>}
                  </summary>

                  <div className="mt-4 space-y-4 border-t border-amber-100 pt-4">
                    <div>
                      <h3 className="mb-1 font-bold text-amber-800">아이가 고른 선택</h3>
                      <ul className="space-y-1">
                        {r.choices.map((c, i) => (
                          <li key={i} className="text-stone-700">
                            {COPING_LABEL[c.copingType] ?? "⭐"} {c.text}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="mb-1 font-bold text-amber-800">대화 질문</h3>
                      <ol className="list-decimal space-y-1 pl-5 text-stone-700">
                        {r.card.questions.map((q, i) => (
                          <li key={i}>{q.text}</li>
                        ))}
                      </ol>
                    </div>

                    <div>
                      <h3 className="mb-1 font-bold text-amber-800">동화 다시 보기</h3>
                      <div className="space-y-2 font-[family-name:var(--font-story)] leading-relaxed text-stone-700">
                        {r.scenes.map((t, i) => (
                          <p key={i}>{t}</p>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (window.confirm("이 동화를 서재에서 지울까요? 되돌릴 수 없어요.")) deleteStory(r.id);
                      }}
                      className="text-sm text-red-600 underline"
                    >
                      삭제
                    </button>
                  </div>
                </details>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
