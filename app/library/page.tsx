"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ageLabel } from "@/lib/story/schema";
import { useApp } from "../providers";
import { btnPrimary, COPING_NAME } from "../components/ui";
import DeleteStoryDialog from "./DeleteStoryDialog";

// 책등 색: 서재 느낌이 나도록 차분한 책 색을 쓴다. 글씨는 모두 크림색이라 대비가 충분한 어두운 색만 둔다.
const SPINES = ["#b45309", "#9a3412", "#4d6b3a", "#1f5f7a", "#7c3a5b", "#7a5a2b", "#3f4f7a"];

// id로 책마다 색, 키, 두께를 정한다. 같은 동화는 항상 같은 모습으로 꽂힌다.
function look(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return {
    color: SPINES[h % SPINES.length],
    height: 190 + (h % 5) * 12, // 190~238px
    width: 52 + ((h >> 3) % 3) * 8, // 52~68px
  };
}

function useBooksPerShelf() {
  const [n, setN] = useState(4);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setN(mq.matches ? 8 : 4);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return n;
}

export default function LibraryPage() {
  const { library, deleteStory } = useApp();
  const perShelf = useBooksPerShelf();
  const [openId, setOpenId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fmt = (t: number) => new Date(t).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

  const open = library.find((r) => String(r.id) === openId) ?? null;
  const deleting = library.find((r) => String(r.id) === deleteId) ?? null;
  const shelves: (typeof library)[] = [];
  for (let i = 0; i < Math.max(library.length, 1); i += perShelf) shelves.push(library.slice(i, i + perShelf));

  return (
    <main className="page-turn mx-auto w-full max-w-md px-4 py-8 md:max-w-4xl md:px-8 md:py-12">
      <h1 className="sr-only">내 서재</h1>
      <p className="story text-center text-lg text-sky-ink-2 md:text-xl">읽고 싶은 책을 골라 꺼내 보세요</p>

      <div className="mt-10 space-y-10 md:mt-14">
        {shelves.map((row, s) => (
          <div key={s}>
            <ul className="flex min-h-[200px] items-end gap-1.5 px-2 md:gap-2 md:px-4">
              {row.map((r) => {
                const id = String(r.id);
                const v = look(id);
                const selected = id === openId;
                return (
                  <li key={id}>
                    <button
                      onClick={() => setOpenId(selected ? null : id)}
                      aria-expanded={selected}
                      aria-label={`${r.title} 펼치기`}
                      style={{ height: v.height, width: v.width, backgroundColor: v.color }}
                      className={`calm relative flex flex-col items-center justify-between rounded-t-[4px] py-3 text-[#fff7e8] shadow-[inset_-4px_0_6px_rgb(0_0_0/0.18),inset_2px_0_0_rgb(255_255_255/0.12)] hover:-translate-y-2 focus-visible:-translate-y-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                        selected ? "-translate-y-4 ring-2 ring-accent" : ""
                      }`}
                    >
                      <span aria-hidden className="h-[3px] w-[70%] rounded-full bg-[#fff7e8]/60" />
                      <span
                        aria-hidden
                        className="story max-h-[75%] overflow-hidden text-ellipsis whitespace-nowrap text-[17px] leading-none tracking-wide [writing-mode:vertical-rl]"
                      >
                        {r.title}
                      </span>
                      <span aria-hidden className="h-[3px] w-[70%] rounded-full bg-[#fff7e8]/60" />
                    </button>
                  </li>
                );
              })}
              {row.length === 0 && (
                <li className="pb-6 text-[15px] text-sky-ink-2">아직 꽂힌 책이 없어요. 동화를 끝까지 읽으면 여기에 꽂혀요.</li>
              )}
            </ul>
            {/* 책이 놓인 선반 */}
            <div className="h-4 rounded-sm bg-gradient-to-b from-[#b98a5a] to-[#8f6540] shadow-[0_6px_10px_rgb(0_0_0/0.35)]" />
          </div>
        ))}
      </div>

      {library.length === 0 && (
        <div className="mt-8">
          <Link href="/create" className={`${btnPrimary} md:w-56`}>
            첫 동화 만들기
          </Link>
        </div>
      )}

      {open && (
        <article key={open.id} className="rise mt-8 space-y-6 rounded-2xl border border-line bg-surface p-5 md:p-8">
          <header className="space-y-1">
            <h2 className="story text-2xl text-ink">{open.title}</h2>
            <p className="text-sm text-ink-3">
              {open.situation} · 만 {ageLabel(open.age)} · {fmt(open.createdAt)}
            </p>
            {open.memo && <p className="text-[15px] text-ink-2">{open.memo}</p>}
          </header>

          <section className="space-y-2">
            <h3 className="text-sm text-ink-3">아이가 고른 선택</h3>
            <ul className="space-y-1">
              {open.choices.map((c, i) => (
                <li key={i} className="text-[15px] text-ink">
                  {c.text}
                  <span className="ml-2 text-sm text-ink-3">{COPING_NAME[c.copingType] ?? c.copingType}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm text-ink-3">대화 질문</h3>
            <ol className="list-decimal space-y-1 pl-5 text-[15px] text-ink">
              {open.card.questions.map((q, i) => (
                <li key={i}>{q.text}</li>
              ))}
            </ol>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm text-ink-3">동화 다시 보기</h3>
            <div className="story space-y-3 text-lg leading-8 text-ink">
              {open.scenes.map((t, i) => (
                <p key={i}>{t}</p>
              ))}
            </div>
          </section>

          <button
            onClick={() => setDeleteId(String(open.id))}
            className="calm text-sm text-danger underline hover:opacity-80"
          >
            삭제
          </button>
        </article>
      )}
      {deleting && (
        <DeleteStoryDialog
          key={`${deleting.id}:${deleting.title}`}
          title={deleting.title}
          onCancel={() => setDeleteId(null)}
          onConfirm={() => {
            deleteStory(deleting.id);
            setDeleteId(null);
            setOpenId(null);
          }}
        />
      )}
    </main>
  );
}
