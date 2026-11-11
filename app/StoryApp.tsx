"use client";

// 화면 골격: 입력 → 동화 뷰어(선택) → 부모 카드 → 메모 → 다음 동화
// 일부러 꾸미지 않았다. 동작과 상태 흐름만 있다. 스타일은 프론트 담당이 입힌다.
// 서버는 상태를 저장하지 않으므로 이 컴포넌트가 장면·선택을 들고 있다가 매 요청에 같이 보낸다.

import { useState, useSyncExternalStore } from "react";
import type {
  ChosenChoice,
  ParentCard,
  StoryChoice,
  StoryChoiceOption,
  StoryRequest,
  StorySegment,
} from "@/lib/story/schema";

const PRESETS = ["치과가 무서워", "어린이집 가기 싫어", "동생이 생겼어", "병원 주사가 무서워"];
const MEMO_KEY = "story-choice:lastMemo";

type Step = "form" | "loading" | "story" | "card";

async function api<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`/api/story${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "요청에 실패했어요.");
  return data as T;
}

const MEMO_EVENT = "story-choice:memo";

function subscribeMemo(cb: () => void) {
  window.addEventListener(MEMO_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(MEMO_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function loadMemo(): string {
  try {
    return localStorage.getItem(MEMO_KEY) ?? "";
  } catch {
    return "";
  }
}

export default function StoryApp() {
  const [step, setStep] = useState<Step>("form");
  const [error, setError] = useState("");

  // 입력
  const [age, setAge] = useState(5);
  const [situation, setSituation] = useState("");
  const [durationMin, setDurationMin] = useState<3 | 5>(5);
  const [protagonist, setProtagonist] = useState("");

  // 동화 진행 상태
  const [req, setReq] = useState<StoryRequest | null>(null);
  const [title, setTitle] = useState("");
  const [scenes, setScenes] = useState<string[]>([]);
  const [choice, setChoice] = useState<StoryChoice | null>(null);
  const [chosen, setChosen] = useState<ChosenChoice[]>([]);
  const [isEnding, setIsEnding] = useState(false);

  // 부모 카드 · 메모
  const [card, setCard] = useState<ParentCard | null>(null);
  const [memo, setMemo] = useState("");
  const [memoSaved, setMemoSaved] = useState(false);
  const savedMemo = useSyncExternalStore(subscribeMemo, loadMemo, () => ""); // 지난 동화에서 저장한 메모

  async function run<T>(fn: () => Promise<T>, backTo: Step): Promise<T | undefined> {
    setError("");
    setStep("loading");
    try {
      return await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "문제가 생겼어요.");
      setStep(backTo);
    }
  }

  function applyStart(seg: StorySegment) {
    setTitle(seg.title);
    setScenes(seg.scenes.map((s) => s.text));
    setChoice(seg.choice);
    setIsEnding(seg.isEnding);
    setChosen([]);
    setCard(null);
    setMemo("");
    setMemoSaved(false);
    setStep("story");
  }

  async function start(previousMemo?: string) {
    if (!situation.trim()) {
      setError("고민 상황을 입력하거나 골라주세요.");
      return;
    }
    const next: StoryRequest = {
      age,
      situation: situation.trim(),
      durationMin,
      protagonist: protagonist.trim() || undefined,
      previousMemo: previousMemo?.trim() || undefined,
    };
    setReq(next);
    const seg = await run(() => api<StorySegment>("", next), "form");
    if (seg) applyStart(seg);
  }

  async function pick(option: StoryChoiceOption) {
    if (!req || !choice) return;
    const nextChosen = [...chosen, { prompt: choice.prompt, text: option.text, copingType: option.copingType }];
    const seg = await run(
      () => api<StorySegment>("/continue", { ...req, title, scenesSoFar: scenes, choices: nextChosen }),
      "story",
    );
    if (!seg) return;
    setChosen(nextChosen);
    setScenes((prev) => [...prev, ...seg.scenes.map((s) => s.text)]);
    setChoice(seg.choice);
    setIsEnding(seg.isEnding);
    setStep("story");
  }

  async function showCard() {
    if (!req) return;
    const c = await run(
      () =>
        api<ParentCard>("/parent-card", {
          age: req.age,
          situation: req.situation,
          protagonist: req.protagonist,
          title,
          choices: chosen,
        }),
      "story",
    );
    if (c) {
      setCard(c);
      setStep("card");
    }
  }

  function saveMemo() {
    try {
      localStorage.setItem(MEMO_KEY, memo.trim());
      window.dispatchEvent(new Event(MEMO_EVENT));
    } catch {
      /* 저장 실패해도 진행은 가능 */
    }
    setMemoSaved(true);
  }

  async function nextStory() {
    await start(memo || savedMemo);
  }

  function reset() {
    setStep("form");
    setError("");
  }

  return (
    <main className="mx-auto max-w-md space-y-6 p-4 text-base">
      <h1 className="text-xl font-bold">AI 정서 동화</h1>

      {error && (
        <p role="alert" className="rounded border border-red-400 bg-red-50 p-3 text-red-700">
          {error}
        </p>
      )}

      {step === "loading" && <p aria-live="polite">동화를 만들고 있어요…</p>}

      {step === "form" && (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void start(savedMemo || undefined);
          }}
        >
          <fieldset className="space-y-2">
            <legend className="font-semibold">아이의 고민 상황</legend>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSituation(p)}
                  className={`rounded border px-3 py-1 ${situation === p ? "bg-black text-white" : ""}`}
                >
                  {p}
                </button>
              ))}
            </div>
            <textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              maxLength={200}
              rows={3}
              placeholder="직접 입력 (200자 이하). 아이 이름은 쓰지 마세요."
              className="w-full rounded border p-2"
            />
          </fieldset>

          <label className="block">
            <span className="font-semibold">아이 나이</span>
            <select value={age} onChange={(e) => setAge(Number(e.target.value))} className="ml-2 rounded border p-1">
              {[4, 5, 6, 7].map((a) => (
                <option key={a} value={a}>
                  만 {a}세
                </option>
              ))}
            </select>
          </label>

          <fieldset className="flex items-center gap-4">
            <legend className="font-semibold">동화 길이</legend>
            {([3, 5] as const).map((m) => (
              <label key={m} className="flex items-center gap-1">
                <input type="radio" checked={durationMin === m} onChange={() => setDurationMin(m)} />
                {m}분
              </label>
            ))}
          </fieldset>

          <label className="block">
            <span className="font-semibold">주인공</span>
            <input
              value={protagonist}
              onChange={(e) => setProtagonist(e.target.value)}
              maxLength={50}
              placeholder="예: 파란 토끼 (비워도 돼요)"
              className="mt-1 w-full rounded border p-2"
            />
            <span className="text-sm text-gray-500">그림 업로드와 캐릭터 변환은 이미지 담당이 이 자리에 붙입니다.</span>
          </label>

          {savedMemo && (
            <p className="rounded bg-yellow-50 p-2 text-sm">지난 동화의 메모가 있어요: “{savedMemo}” — 이번 동화에 이어져요.</p>
          )}

          <button type="submit" className="w-full rounded bg-black p-3 text-white">
            동화 만들기
          </button>
        </form>
      )}

      {step === "story" && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          {scenes.map((text, i) => (
            <p key={i} className="leading-relaxed">
              {text}
            </p>
          ))}

          {choice && !isEnding && (
            <div className="space-y-2">
              <p className="font-semibold">{choice.prompt}</p>
              {choice.options.map((o) => (
                <button key={o.id} onClick={() => void pick(o)} className="block w-full rounded border p-3 text-left">
                  {o.text}
                </button>
              ))}
            </div>
          )}

          {isEnding && (
            <button onClick={() => void showCard()} className="w-full rounded bg-black p-3 text-white">
              부모 카드 보기
            </button>
          )}
        </section>
      )}

      {step === "card" && card && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">부모 카드</h2>
          <p>{card.summary}</p>
          <ol className="space-y-3">
            {card.questions.map((q, i) => (
              <li key={i} className="rounded border p-3">
                <p className="font-semibold">“{q.text}”</p>
                <p className="text-sm text-gray-600">→ {q.hint}</p>
              </li>
            ))}
          </ol>
          <p className="text-sm">💡 {card.answerTip}</p>

          <div className="space-y-2 border-t pt-4">
            <label className="block">
              <span className="font-semibold">아이가 뭐라고 했나요? (한 줄 메모)</span>
              <input
                value={memo}
                onChange={(e) => {
                  setMemo(e.target.value);
                  setMemoSaved(false);
                }}
                maxLength={200}
                placeholder="예: 윙 소리가 무섭대요"
                className="mt-1 w-full rounded border p-2"
              />
            </label>
            <div className="flex gap-2">
              <button onClick={saveMemo} className="rounded border px-3 py-2">
                메모 저장
              </button>
              <button
                onClick={() => void nextStory()}
                disabled={!memo.trim() && !savedMemo}
                className="flex-1 rounded bg-black px-3 py-2 text-white disabled:opacity-40"
              >
                다음 동화 만들기
              </button>
            </div>
            {memoSaved && <p className="text-sm text-green-700">저장했어요.</p>}
          </div>

          <button onClick={reset} className="text-sm underline">
            처음으로
          </button>
        </section>
      )}
    </main>
  );
}
