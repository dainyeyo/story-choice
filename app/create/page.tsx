"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useStored, writeRaw } from "@/lib/localStore";
import { PRESETS } from "@/lib/story/presets";
import { MAX_AGE, MAX_DURATION, MIN_AGE, MIN_DURATION } from "@/lib/story/schema";
import { useApp } from "../providers";
import Icon from "../components/Icon";
import { btnPrimary, chipCls, errorCls, inputCls, Label, noteCls, PageHeader, Segmented } from "../components/ui";

// 화면에만 보여 주는 추가 예시. PRESETS와 달리 폴백 동화가 없어서 AI 실패 시엔 직접 추가한 고민처럼 다뤄진다.
// (PRESETS를 늘리면 폴백 데이터를 다시 만들어야 하므로 여기 따로 둔다)
const MORE_EXAMPLES = [
  "밤에 혼자 자기 무서워",
  "친구랑 다퉜어",
  "양치하기 싫어",
  "채소 먹기 싫어",
  "엄마랑 떨어지기 싫어",
  "화가 나면 소리 질러",
  "장난감 나누기 싫어",
  "이사를 가요",
] as const;
const EXAMPLES: readonly string[] = [...PRESETS, ...MORE_EXAMPLES];

export default function CreatePage() {
  const { s, user } = useApp();
  const router = useRouter();

  // 직접 추가한 고민 상황은 칩으로 남겨 두고, 이 기기에서 다시 고를 수 있게 한다
  const customKey = `story-choice:situations:${user}`;
  const customRaw = useStored(customKey);
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
  const [lengthMode, setLengthMode] = useState<"auto" | "custom">("auto"); // 고르지 않으면 AI가 정한다
  const [durationText, setDurationText] = useState("5"); // 직접 정하기: 분을 숫자로 적는다
  const [protagonist, setProtagonist] = useState("");
  const [localError, setLocalError] = useState("");

  const saveCustom = (list: string[]) => writeRaw(customKey, JSON.stringify(list));

  const addCustom = () => {
    const t = draft.trim();
    if (!t) return;
    if (!EXAMPLES.includes(t) && !custom.includes(t)) saveCustom([...custom, t].slice(-8));
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
    let durationMin: number | undefined;
    if (lengthMode === "custom") {
      durationMin = Number(durationText);
      if (!Number.isInteger(durationMin) || durationMin < MIN_DURATION || durationMin > MAX_DURATION) {
        setLocalError(`길이는 ${MIN_DURATION}~${MAX_DURATION}분 사이 숫자로 적어 주세요.`);
        return;
      }
    }
    setLocalError("");
    void s.start({ age, situation, durationMin, protagonist }); // 로딩은 /read 화면에서 보여준다
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

      <form onSubmit={submit} className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="space-y-4 rounded-2xl border border-line bg-[#fbf2de] p-5 shadow-[0_8px_24px_rgba(0,0,20,0.4)] md:p-7">
          <h2 className="story text-xl text-ink">요즘 아이의 마음은</h2>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((p) => (
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
                placeholder="예: 머리 감기 싫어 (아이 이름은 적지 마세요)"
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

        <section className="space-y-6 rounded-2xl border border-line bg-[#fbf2de] p-5 shadow-[0_8px_24px_rgba(0,0,20,0.4)] md:p-7">
          <h2 className="story text-xl text-ink">동화 설정</h2>

          <div className="space-y-2">
            <Label>아이 나이</Label>
            <div>
              <Segmented
                label="아이 나이"
                value={age}
                onChange={setAge}
                options={Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, i) => MIN_AGE + i).map((a) => ({
                  value: a,
                  label: a === MIN_AGE ? `~${a}세` : a === MAX_AGE ? `${a}세~` : `${a}세`, // 칸이 좁아 양 끝은 짧게
                }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>길이</Label>
            <div>
              <Segmented
                label="동화 길이"
                value={lengthMode}
                onChange={setLengthMode}
                options={[
                  { value: "auto" as const, label: "자동" },
                  { value: "custom" as const, label: "직접 정하기" },
                ]}
              />
            </div>
            {lengthMode === "custom" ? (
              <label className="flex items-center gap-2 pt-1">
                <span className="w-20 shrink-0">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={durationText}
                    onChange={(e) => setDurationText(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))}
                    aria-label="동화 길이(분)"
                    className={`${inputCls} text-center tabular-nums`}
                  />
                </span>
                <span className="text-[15px] text-ink">분</span>
                <span className="text-[13px] text-ink-3">
                  {MIN_DURATION}~{MAX_DURATION}분 사이로 적어 주세요
                </span>
              </label>
            ) : (
              <p className="text-[13px] text-ink-3">
                AI가 이야기에 맞춰 길이를 정해요. 최대 {MAX_DURATION}분까지 걸릴 수 있어요.
              </p>
            )}
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

        <div className="md:col-span-2 md:flex md:justify-center">
          <button type="submit" className={`${btnPrimary} md:w-64`}>
            동화 만들기
          </button>
        </div>
      </form>
    </main>
  );
}
