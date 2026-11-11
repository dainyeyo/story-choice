"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { recentInsightSignals, type ParentInsight } from "@/lib/parentInsights";
import { useStored, writeRaw } from "@/lib/localStore";
import { useApp } from "../providers";
import Icon from "../components/Icon";
import { btnPrimary, errorCls, PageHeader } from "../components/ui";

interface CachedInsight { generatedAt: number; data: ParentInsight }

function parseCached(raw: string | null): CachedInsight | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CachedInsight;
    return parsed?.data?.actionCard && typeof parsed.generatedAt === "number" ? parsed : null;
  } catch {
    return null;
  }
}

export default function InsightsPage() {
  const { user, library, pet } = useApp();
  const cacheKey = `story-choice:insight:${user}`;
  const cached = parseCached(useStored(cacheKey));
  const signals = useMemo(() => recentInsightSignals(library, pet.state.moods), [library, pet.state.moods]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(signals),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "리포트를 만들지 못했어요.");
      writeRaw(cacheKey, JSON.stringify({ generatedAt: Date.now(), data } satisfies CachedInsight));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "리포트를 만들지 못했어요.");
    } finally {
      setLoading(false);
    }
  };

  const report = cached?.data;
  const generated = cached ? new Date(cached.generatedAt).toLocaleDateString("ko-KR", { month: "long", day: "numeric" }) : "";

  return (
    <main className="page-turn mx-auto w-full max-w-md px-4 py-8 md:max-w-4xl md:px-8 md:py-12">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <PageHeader title="부모 마음 리포트" sub="최근 7일의 기록을 오늘 해볼 수 있는 대화와 행동으로 바꿔드려요" />
        <button type="button" onClick={generate} disabled={loading} className={`${btnPrimary} md:w-48`}>
          {loading ? "기록을 살펴보는 중" : report ? "새로 분석하기" : "AI 리포트 만들기"}
        </button>
      </div>

      <p className="mt-5 rounded-xl bg-sunk px-4 py-3 text-sm leading-6 text-ink-2">
        마음 스티커 {signals.moods.length}개 · 동화 {signals.stories.length}편을 참고합니다. AI는 아이를 진단하지 않고 기록에서 보이는 가능성만 알려드려요.
      </p>
      {error && <p role="alert" className={`${errorCls} mt-4`}>{error}</p>}

      {!report && !loading && (
        <section className="mt-10 rounded-2xl border border-dashed border-line bg-surface px-6 py-14 text-center">
          <p className="story text-2xl text-ink">이번 주 마음을 함께 살펴볼까요?</p>
          <p className="mt-2 text-[15px] leading-7 text-ink-2">기록이 적어도 괜찮아요. 지금 있는 내용 안에서 작게 실천할 행동을 제안해드려요.</p>
        </section>
      )}

      {report && (
        <div className="mt-8 space-y-8">
          <section className="overflow-hidden rounded-3xl border border-line bg-[#fff1d8]">
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="story text-2xl text-ink">오늘의 부모 행동 카드</h2>
                <span className="text-xs text-ink-3">{generated} 생성</span>
              </div>
              <p className="mt-5 text-[16px] leading-8 text-ink">{report.actionCard.observation}</p>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-surface p-4"><p className="text-xs text-ink-3">오늘 해볼 행동</p><p className="mt-2 text-[15px] leading-7 text-ink">{report.actionCard.action}</p></div>
                <div className="rounded-2xl bg-surface p-4"><p className="text-xs text-ink-3">이렇게 말해보세요</p><p className="story mt-2 text-lg leading-7 text-ink">“{report.actionCard.sayThis.replace(/^[“\"]|[”\"]$/g, "")}”</p></div>
              </div>
              <p className="mt-4 text-sm leading-6 text-ink-2"><span className="font-medium text-ink">잠시 피할 말:</span> {report.actionCard.avoidThis}</p>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-surface p-6 md:p-8">
            <p className="text-sm text-accent-text">최근 7일</p>
            <h2 className="story mt-1 text-2xl text-ink">{report.weeklyReport.headline}</h2>
            <dl className="mt-6 grid gap-5 md:grid-cols-3">
              <div><dt className="text-sm text-ink-3">보인 흐름</dt><dd className="mt-1 text-[15px] leading-7 text-ink">{report.weeklyReport.pattern}</dd></div>
              <div><dt className="text-sm text-ink-3">달라진 점</dt><dd className="mt-1 text-[15px] leading-7 text-ink">{report.weeklyReport.change}</dd></div>
              <div><dt className="text-sm text-ink-3">다음 주 제안</dt><dd className="mt-1 text-[15px] leading-7 text-ink">{report.weeklyReport.nextWeek}</dd></div>
            </dl>
          </section>

          <section className="flex flex-col gap-5 rounded-2xl border border-line bg-surface p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div>
              <p className="text-sm text-ink-3">다음 동화에 반영할 방향</p>
              <h2 className="story mt-1 text-xl text-ink">{report.storyGuidance.theme}</h2>
              <p className="mt-2 text-[15px] leading-7 text-ink-2">{report.storyGuidance.goal} · {report.storyGuidance.promptHint}</p>
              <p className="mt-2 text-xs text-ink-3">새 동화는 이 리포트와 별개로 최근 7일 기록을 자동 참고합니다.</p>
            </div>
            <Link href="/create/new?reset=1" className={`${btnPrimary} shrink-0 md:w-48`}>새 동화 만들기 <Icon name="right" size={16} /></Link>
          </section>
          {report.fallback && <p className="text-center text-xs text-ink-3">AI 연결이 불안정해 안전한 기본 제안을 보여드렸어요.</p>}
        </div>
      )}
    </main>
  );
}
