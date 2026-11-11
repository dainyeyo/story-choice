"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PRESETS } from "@/lib/story/presets";
import { useApp } from "../providers";
import { btnPrimary, chipCls, errorCls, inputCls, Label, noteCls, PageHeader, Segmented } from "../components/ui";

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
    <main className="rise mx-auto w-full max-w-md px-4 py-8 md:max-w-5xl md:px-8 md:py-12">
      <PageHeader title="새 동화" sub="아이의 마음을 고르면 오늘의 동화가 만들어져요" />

      {error && (
        <p role="alert" className={`${errorCls} mt-6`}>
          {error}
        </p>
      )}

      <form onSubmit={submit} className="mt-8 grid gap-10 md:grid-cols-[3fr_2fr] md:gap-16">
        <section className="space-y-4">
          <h2 className="story text-xl text-ink">요즘 아이의 마음은</h2>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button key={p} type="button" onClick={() => setSituation(p)} className={chipCls(situation === p)}>
                {p}
              </button>
            ))}
          </div>
          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            maxLength={200}
            rows={4}
            aria-label="고민 상황 직접 입력"
            placeholder="직접 적어도 좋아요 (200자 이하, 아이 이름은 적지 마세요)"
            className={inputCls}
          />
        </section>

        <section className="space-y-6">
          <h2 className="story text-xl text-ink">동화 설정</h2>

          <div className="space-y-2">
            <Label>아이 나이</Label>
            <div>
              <Segmented
                label="아이 나이"
                value={age}
                onChange={setAge}
                options={[4, 5, 6, 7].map((a) => ({ value: a, label: `${a}세` }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>길이</Label>
            <div>
              <Segmented
                label="동화 길이"
                value={durationMin}
                onChange={setDurationMin}
                options={[
                  { value: 3 as const, label: "3분" },
                  { value: 5 as const, label: "5분" },
                ]}
              />
            </div>
          </div>

          <label className="block space-y-2">
            <Label>주인공</Label>
            <input
              value={protagonist}
              onChange={(e) => setProtagonist(e.target.value)}
              maxLength={50}
              placeholder="예: 파란 토끼 (비워도 돼요)"
              className={inputCls}
            />
            {/* 이미지 담당: 그림 업로드/캐릭터 변환 UI는 이 아래에 붙인다 */}
          </label>
        </section>

        {s.savedMemo && (
          <p className={`${noteCls} md:col-span-2`}>
            지난 동화의 메모가 이번 동화에 이어져요
            <span className="mt-1 block text-ink">“{s.savedMemo}”</span>
          </p>
        )}

        <div className="md:col-span-2 md:flex md:justify-end">
          <button type="submit" className={`${btnPrimary} md:w-64`}>
            동화 만들기
          </button>
        </div>
      </form>
    </main>
  );
}
