"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PRESETS } from "@/lib/story/presets";
import { useApp } from "../providers";
import { bigBtn, Card, chip, inputCls, Title } from "../components/ui";

export default function CreatePage() {
  const { s } = useApp();
  const router = useRouter();

  const [age, setAge] = useState(5);
  const [situation, setSituation] = useState("");
  const [durationMin, setDurationMin] = useState<3 | 5>(5);
  const [protagonist, setProtagonist] = useState("");
  const [localError, setLocalError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!situation.trim()) {
      setLocalError("고민 상황을 입력하거나 골라주세요.");
      return;
    }
    setLocalError("");
    void s.start({ age, situation, durationMin, protagonist }); // 로딩은 /read 화면에서 보여준다
    router.push("/read");
  };

  const error = localError || s.error;

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-6 md:max-w-4xl md:gap-6 md:px-8 md:py-10">
      <Title sub="아이의 마음을 알려주시면 오늘의 동화를 만들어요">새 동화 만들기</Title>

      {error && (
        <p role="alert" className="rounded-2xl bg-red-50 p-3 text-center text-red-700 ring-1 ring-red-200">
          {error}
        </p>
      )}

      <form onSubmit={submit} className="flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-6">
        <Card className="space-y-3">
          <h2 className="font-[family-name:var(--font-story)] text-xl text-amber-800">요즘 아이의 마음은?</h2>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button key={p} type="button" onClick={() => setSituation(p)} className={chip(situation === p)}>
                {p}
              </button>
            ))}
          </div>
          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            maxLength={200}
            rows={4}
            placeholder="직접 써도 좋아요 (200자 이하, 아이 이름은 쓰지 마세요)"
            className={inputCls}
          />
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold text-amber-900">나이</span>
            <div className="flex gap-2">
              {[4, 5, 6, 7].map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAge(a)}
                  className={`h-11 w-11 rounded-full text-base font-bold ring-1 ${
                    age === a ? "bg-amber-500 text-white ring-amber-500" : "bg-amber-50 text-amber-900 ring-amber-200"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold text-amber-900">길이</span>
            <div className="flex gap-2">
              {([3, 5] as const).map((m) => (
                <button key={m} type="button" onClick={() => setDurationMin(m)} className={chip(durationMin === m)}>
                  {m}분
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="font-semibold text-amber-900">주인공</span>
            <input
              value={protagonist}
              onChange={(e) => setProtagonist(e.target.value)}
              maxLength={50}
              placeholder="예: 파란 토끼 (비워도 돼요)"
              className={`${inputCls} mt-1`}
            />
            {/* 이미지 담당: 그림 업로드/캐릭터 변환 UI는 이 아래에 붙인다 */}
          </label>
        </Card>

        {s.savedMemo && (
          <p className="rounded-2xl bg-yellow-50 p-3 text-sm text-amber-900 ring-1 ring-yellow-200 md:col-span-2">
            📝 지난 동화의 메모가 있어요: “{s.savedMemo}” — 이번 동화에 이어져요.
          </p>
        )}

        <button type="submit" className={`${bigBtn} md:col-span-2 md:mx-auto md:max-w-md`}>
          동화 만들기 ✨
        </button>
      </form>
    </main>
  );
}
