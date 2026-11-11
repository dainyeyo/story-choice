"use client";

import Link from "next/link";
import { useAuth, useApp } from "./providers";
import { bigBtn, Card, softBtn } from "./components/ui";

const STEPS = [
  { icon: "💭", title: "아이의 마음을 골라요", text: "치과가 무서워, 동생이 생겼어… 요즘 아이의 고민을 알려주세요." },
  { icon: "📖", title: "동화 속에서 선택해요", text: "주인공이 어떻게 할지 아이가 직접 골라요. 그 선택에 아이의 마음이 담겨요." },
  { icon: "💬", title: "부모와 이야기해요", text: "아이의 선택을 바탕으로 대화 질문을 드려요. 한 줄 메모는 다음 동화로 이어져요." },
];

function LoggedOutHome() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-8 md:max-w-4xl md:px-8 md:py-14">
      <section className="space-y-4 text-center">
        <div className="text-6xl">🌙📖</div>
        <h1 className="font-[family-name:var(--font-story)] text-4xl leading-snug text-amber-800 md:text-5xl">
          아이의 마음에서
          <br />
          동화가 시작돼요
        </h1>
        <p className="text-lg text-stone-600">
          아이가 동화 속에서 고른 선택으로, 오늘 밤 부모와 아이의 대화가 시작됩니다.
        </p>
        <Link href="/login" className={`${bigBtn} mx-auto max-w-xs`}>
          시작하기
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <Card key={i} className="space-y-2 text-center">
            <div className="text-4xl">{s.icon}</div>
            <h2 className="font-[family-name:var(--font-story)] text-xl text-amber-800">{s.title}</h2>
            <p className="text-stone-600">{s.text}</p>
          </Card>
        ))}
      </section>
    </main>
  );
}

function LoggedInHome() {
  const { user, s, library } = useApp();
  const recent = library.slice(0, 3);

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 py-6 md:max-w-3xl md:px-8 md:py-10">
      <section className="space-y-1 text-center">
        <p className="text-amber-800/70">안녕하세요, {user} 보호자님 👋</p>
        <h1 className="font-[family-name:var(--font-story)] text-3xl text-amber-800">오늘은 어떤 이야기를 읽어 볼까요?</h1>
      </section>

      {s.step === "story" && (
        <Card className="space-y-2 bg-amber-50">
          <p className="font-semibold text-amber-900">읽던 동화가 있어요: {s.title}</p>
          <Link href="/read" className={bigBtn}>
            이어서 읽기
          </Link>
        </Card>
      )}

      {s.savedMemo && (
        <p className="rounded-2xl bg-yellow-50 p-3 text-sm text-amber-900 ring-1 ring-yellow-200">
          📝 지난 메모가 다음 동화에 이어져요: “{s.savedMemo}”
        </p>
      )}

      <Link href="/create" className={bigBtn}>
        ✨ 새 동화 만들기
      </Link>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-story)] text-xl text-amber-800">최근에 읽은 동화</h2>
          {library.length > 0 && (
            <Link href="/library" className="text-sm text-amber-800 underline">
              모두 보기
            </Link>
          )}
        </div>
        {recent.length === 0 ? (
          <Card className="text-center text-stone-600">아직 읽은 동화가 없어요. 첫 동화를 만들어 보세요!</Card>
        ) : (
          recent.map((r) => (
            <Link key={r.id} href="/library" className="block">
              <Card className="space-y-1">
                <p className="font-[family-name:var(--font-story)] text-lg text-amber-900">{r.title}</p>
                <p className="text-sm text-stone-500">
                  {r.situation} · {new Date(r.createdAt).toLocaleDateString("ko-KR")}
                </p>
                {r.memo && <p className="text-sm text-stone-700">📝 {r.memo}</p>}
              </Card>
            </Link>
          ))
        )}
        {recent.length === 0 && (
          <Link href="/create" className={`${softBtn} block text-center`}>
            동화 만들러 가기
          </Link>
        )}
      </section>
    </main>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  return user ? <LoggedInHome /> : <LoggedOutHome />;
}
