"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useStored, writeRaw } from "@/lib/localStore";
import { buildRecentStoryContext, cachedStoryGuidance } from "@/lib/parentInsights";
import { PRESETS } from "@/lib/story/presets";
import { useApp } from "../providers";
import Icon from "../components/Icon";
import { btnPrimary, chipCls, errorCls, inputCls, Label, noteCls, PageHeader, Segmented } from "../components/ui";

export default function CreatePage() {
  const { s, user, library, pet } = useApp();
  const router = useRouter();

  // 직접 추가한 고민 상황은 칩으로 남겨 두고, 이 기기에서 다시 고를 수 있게 한다
  const customKey = `story-choice:situations:${user}`;
  const customRaw = useStored(customKey);
  const insightRaw = useStored(`story-choice:insight:${user}`);
  const custom = useMemo<string[]>(() => {
    try {
      const v = JSON.parse(customRaw || "[]");
      return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
    } catch {
      return [];
    }
  }, [customRaw]);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  const [age, setAge] = useState(5);
  const [situation, setSituation] = useState("");
  const [durationMin, setDurationMin] = useState<3 | 5>(5);
  const [protagonist, setProtagonist] = useState("");
  const [localError, setLocalError] = useState("");

  const saveCustom = (list: string[]) => writeRaw(customKey, JSON.stringify(list));

  const addCustom = () => {
    const t = draft.trim();
    if (!t) return;
    if (!(PRESETS as readonly string[]).includes(t) && !custom.includes(t)) saveCustom([...custom, t].slice(-8));
    setSituation(t);
    setDraft("");
    setAdding(false);
    setLocalError("");
  };

  const removeCustom = (t: string) => {
    saveCustom(custom.filter((x) => x !== t));
    if (situation === t) setSituation("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!situation.trim()) {
      setLocalError("고민을 고르거나 + 버튼으로 직접 추가해 주세요.");
      return;
    }
    setLocalError("");
    const recentContext = [buildRecentStoryContext(library, pet.state.moods), cachedStoryGuidance(insightRaw)]
      .filter(Boolean)
      .join("\n")
      .slice(0, 600);
    void s.start({
      age,
      situation,
      durationMin,
      protagonist,
      recentContext,
    }); // 로딩은 /read 화면에서 보여준다
    router.push("/read");
  };

  const error = localError || s.error;

  return (
    <main className="page-turn mx-auto w-full max-w-md px-4 py-8 md:max-w-5xl md:px-8 md:py-12">
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

            {custom.map((c) => (
              <span
                key={c}
                className={`calm inline-flex min-h-10 items-center rounded-lg border text-[15px] ${
                  situation === c ? "border-accent bg-[#fdf0d2] text-ink" : "border-line bg-surface text-ink-2"
                }`}
              >
                <button type="button" onClick={() => setSituation(c)} className="px-3 py-2 text-left hover:text-ink">
                  {c}
                </button>
                <button
                  type="button"
                  onClick={() => removeCustom(c)}
                  aria-label={`${c} 삭제`}
                  className="calm mr-1 inline-flex size-8 items-center justify-center rounded-md text-ink-3 hover:bg-sunk hover:text-ink"
                >
                  <Icon name="close" size={14} />
                </button>
              </span>
            ))}

            <button
              type="button"
              onClick={() => setAdding((v) => !v)}
              aria-expanded={adding}
              aria-label="고민 직접 추가"
              className="calm inline-flex h-10 items-center gap-1 rounded-lg border border-dashed border-ink-3/50 px-3 text-[15px] text-ink-2 hover:border-accent hover:bg-sunk hover:text-ink"
            >
              <Icon name="plus" size={16} />
              직접 추가
            </button>
          </div>

          {adding && (
            <div className="flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault(); // 이야기 만들기가 아니라 칩 추가만 한다
                    addCustom();
                  }
                }}
                maxLength={100}
                autoFocus
                aria-label="추가할 고민"
                placeholder="예: 밤에 혼자 자기 무서워 (아이 이름은 적지 마세요)"
                className="calm h-10 min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 text-base text-ink placeholder:text-ink-3 focus:border-accent-text"
              />
              <button
                type="button"
                onClick={addCustom}
                disabled={!draft.trim()}
                className="calm h-10 shrink-0 rounded-lg bg-ink px-4 text-[15px] text-paper hover:opacity-90 disabled:opacity-40"
              >
                추가
              </button>
            </div>
          )}
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
