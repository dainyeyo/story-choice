"use client";

import { useRouter } from "next/navigation";
import { FONT_CLASS, type FontSize } from "@/lib/settings";
import { useApp, useAuth } from "../providers";
import { Card, chip, softBtn, Title } from "../components/ui";

const SIZES: { id: FontSize; label: string }[] = [
  { id: "md", label: "보통" },
  { id: "lg", label: "크게" },
  { id: "xl", label: "아주 크게" },
];

export default function SettingsPage() {
  const { user, settings, setSettings, clearMyData } = useApp();
  const { logOut } = useAuth();
  const router = useRouter();

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-6 md:max-w-2xl md:px-8 md:py-10">
      <Title sub={`${user} 보호자님`}>⚙️ 설정</Title>

      <Card className="space-y-3">
        <h2 className="font-bold text-amber-900">동화 글자 크기</h2>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((z) => (
            <button key={z.id} onClick={() => setSettings({ ...settings, fontSize: z.id })} className={chip(settings.fontSize === z.id)}>
              {z.label}
            </button>
          ))}
        </div>
        <p className={`font-[family-name:var(--font-story)] text-stone-700 ${FONT_CLASS[settings.fontSize]}`}>
          옛날 옛적에, 작은 토끼가 살았어요.
        </p>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-bold text-amber-900">내 기록</h2>
        <p className="text-sm text-stone-600">서재의 동화와 메모는 이 기기에만 저장돼요.</p>
        <button
          onClick={() => {
            if (window.confirm("서재의 동화와 메모를 모두 지울까요? 되돌릴 수 없어요.")) clearMyData();
          }}
          className={`${softBtn} text-red-700`}
        >
          내 기록 모두 지우기
        </button>
      </Card>

      <button
        onClick={() => {
          logOut();
          router.replace("/");
        }}
        className={softBtn}
      >
        로그아웃
      </button>
    </main>
  );
}
